let service = require('./service.js');
let neritoUtils = require('./neritoUtils.js');
const ShortUniqueId = require('short-unique-id');
const uid = new ShortUniqueId({ length: 9 });

const { v4: uuidv4 } = require('uuid');
const logoBucketName = "logo";
let org = {};
let userIds = [];

module.exports = {
    saveOrganization: async function (csvParser, action) {
        const uniqueId = uid();
        org = {};
        userIds = [];
        let fullFileName;
        try {
            let isFileUploaded = false;
            let isDataInserted = false;
            if (!neritoUtils.isEmpty(csvParser.files[0])) {
                const { content, filename } = csvParser.files[0];
                org = getOrganization(csvParser, uniqueId, action, filename);
                fullFileName = org.Config.Logo;
                try {
                    isFileUploaded = await service.putObjectOnS3(fullFileName, content, logoBucketName, neritoUtils.storagetype.ORG_LOGO);
                    if (!isFileUploaded) {
                        console.error("Error while uploading org logo: " + fullFileName);
                        throw "Something went wrong";
                    }
                } catch (err) {
                    console.error("Unable to Upload organization logo on S3" + fullFileName, err);
                    throw "Something went wrong";
                }
            } else {
                org = getOrganization(csvParser, uniqueId, action, null);
            }
            let usersForDelete = [];
            try {
                for (const element of userIds) {
                    let userJSON = await service.getUserById(element);
                    if (neritoUtils.isEmpty(userJSON) || neritoUtils.isEmpty(userJSON.Items) || neritoUtils.isEmpty(userJSON.Items[0])) {
                        throw "Something went wrong";
                    }
                    usersForDelete.push(userJSON.Items[0]);
                    let user = getUser(userJSON.Items[0], org);
                    isDataInserted = await service.updateUser(user);
                }
            } catch (err) {
                console.error("Something went wrong while fetching Users" + org.Id, err);
                throw "Something went wrong";
            }
            try {
                isDataInserted = await service.saveOrganization(org);
                if (!isDataInserted) {
                    console.error("Error while saving organization");
                    throw "Something went wrong";
                }
            } catch (err) {
                console.error("Error while saving organization", err);
                if (!neritoUtils.isEmpty(csvParser.files[0])) {
                    try {
                        let isFileDeleted = await service.deleteObjectOnS3(fullFileName);
                        if (!isFileDeleted) {
                            console.error("Error while deleting file: " + fullFileName);
                        }
                    } catch (err) {
                        console.error("Error while deleting organization logo " + fullFileName, err);
                        throw "Something went wrong";
                    }
                }
                try {
                    for (const element of usersForDelete) {
                        let user = getUser(element);
                        isDataInserted = await service.updateUser(user);
                    }
                } catch (err) {
                    console.error("Unable to get organization data by orgId: " + org.Id, err);
                    throw "Something went wrong";
                }
                throw "Something went wrong";
            }
            try {
                let organization = await service.getOrgDataById(org.Id);
                if (organization != null && organization != undefined && organization.Items.length > 0 && organization.Items[0] != null && organization.Items[0] != undefined && organization.Items[0].FileValidation != null && organization.Items[0].FileValidation != undefined) {
                    organization = organization.Items[0];
                    return neritoUtils.successResponseJson(organization, 200);
                } else {
                    throw "Something went wrong";
                }
            } catch (err) {
                console.error("Unable to get organization data by orgId: " + org.Id, err);
                throw "Something went wrong";
            }
        } catch (err) {
            console.error("Something went wrong", err);
            return neritoUtils.errorResponseJson(err, 500);
        }
    },

    updateOrganization: async function (csvParser, action) {
        const uniqueId = uuidv4();
        org = {};
        userIds = [];
        let isFileUploaded = false;
        let isDataInserted = false;
        let organization;
        let fullFileName;
        try {
            try {
                organization = await service.getOrgDataById(csvParser.Id);
                if (organization != null && organization != undefined && organization.Items.length > 0 && organization.Items[0] != null && organization.Items[0] != undefined && organization.Items[0].FileValidation != null && organization.Items[0].FileValidation != undefined) {
                    organization = organization.Items[0];
                    if (organization.Id != csvParser.Id) {
                        throw "Something went wrong";
                    }
                } else {
                    throw "Something went wrong";
                }
            } catch (err) {
                console.error("Unable to get organization data by orgId: " + "ORG#" + org.Id, err);
                throw "Something went wrong";
            }
            if (!neritoUtils.isEmpty(csvParser.files[0])) {
                try {
                    const { content, filename } = csvParser.files[0];
                    org = getOrganization(csvParser, uniqueId, action, filename);
                    fullFileName = org.Config.Logo;
                    isFileUploaded = await service.putObjectOnS3(fullFileName, content, logoBucketName, neritoUtils.storagetype.ORG_LOGO);
                    if (!isFileUploaded) {
                        console.error("Error while uploading file: " + fullFileName);
                        throw "Something went wrong";
                    }
                } catch (err) {
                    console.error("Unable to Upload organization logo on S3" + fullFileName, err);
                    throw "Something went wrong";
                }
            } else {
                let filename;
                if (!neritoUtils.isEmpty(organization.Config) && !neritoUtils.isEmpty(organization.ConfigLogo)) {
                    filename = organization.Config.Logo;
                }
                org = getOrganization(csvParser, uniqueId, action, filename);
            }
            try {
                let oldUserId = getOldUserId(organization);
                for (const element of oldUserId) {
                    let userJSON = await service.getUserById(element);
                    if (!neritoUtils.isEmpty(userJSON) && !neritoUtils.isEmpty(userJSON.Items) && !neritoUtils.isEmpty(userJSON.Items[0])) {
                        let user = getUser(userJSON.Items[0]);
                        isDataInserted = await service.updateUser(user);
                    }
                }
                for (const element of userIds) {
                    let userJSON = await service.getUserById(element);
                    if (neritoUtils.isEmpty(userJSON) || neritoUtils.isEmpty(userJSON.Items) || neritoUtils.isEmpty(userJSON.Items[0])) {
                        throw "Something went wrong";
                    }
                    let user = getUser(userJSON.Items[0], org);
                    isDataInserted = await service.updateUser(user);
                }
            } catch (err) {
                console.error("Unable to get organization data by orgId: " + org.Id, err);
                throw "Something went wrong";
            }

            try {
                isDataInserted = await service.saveOrganization(org);
                if (!isDataInserted) {
                    console.error("Error while saving organization");
                    throw "Something went wrong";
                }
            } catch (err) {
                console.error("Error while saving organization", err);
                if (!neritoUtils.isEmpty(csvParser.files[0])) {
                    try {
                        let isFileDeleted = await service.deleteObjectOnS3(fullFileName);
                        if (!isFileDeleted) {
                            console.error("Error while deleting file: " + fullFileName);
                            throw "Something went wrong";
                        }
                    } catch (err) {
                        console.error("Error while deleting organization logo " + fullFileName, err);
                        throw "Something went wrong";
                    }
                }
                throw "Something went wrong";
            }

            try {
                let organization = await service.getOrgDataById(org.Id);
                if (organization != null && organization != undefined && organization.Items.length > 0 && organization.Items[0] != null && organization.Items[0] != undefined && organization.Items[0].FileValidation != null && organization.Items[0].FileValidation != undefined) {
                    organization = organization.Items[0];
                }
                return neritoUtils.successResponseJson(organization, 200);
            } catch (err) {
                console.error("Unable to get organization data by orgId: " + org.Id, err);
                throw "Something went wrong";
            }
        } catch (err) {
            console.error("Something went wrong", err);
            return neritoUtils.errorResponseJson(err, 500);
        }
    }
};

function getOrganization(csvParser, uniqueId, action, filename) {
    let configJSON = JSON.parse(csvParser.Config);
    if (action === neritoUtils.action.SAVEORG) {
        org.Id = "ORG#" + uniqueId;
        org.SK = "METADATA#" + uniqueId;
    } else {
        org.Id = csvParser.Id;
        org.SK = csvParser.SK;
    }

    if (!neritoUtils.isEmpty(filename)) {
        configJSON.Logo = ("LOGO#" + org.Id + neritoUtils.getExtension(filename)).trim();
    }
    org.AccountUsers = JSON.parse(csvParser.AccountUsers);
    for (const element of org.AccountUsers) {
        userIds.push(element.Id);
    }

    org.Email = csvParser.Email;
    org.OriginAccount = csvParser.OriginAccount;
    org.EmployeeEnrollmentDate = csvParser.EmployeeEnrollmentDate;
    org.FileValidation = JSON.parse(csvParser.FileValidation);
    org.FiscalInfo = csvParser.FiscalInfo;
    org.OrgDetails = csvParser.OrgDetails;
    org.OrgName = csvParser.OrgName;
    org.RFC = csvParser.RFC;
    org.PayrollDisbursement = csvParser.PayrollDisbursement;
    org.PayrollUsers = JSON.parse(csvParser.PayrollUsers);

    for (const element of org.PayrollUsers) {
        userIds.push(element.Id);
    }
    org.Status = JSON.parse(csvParser.Status);
    org.Config = configJSON;
    if (!neritoUtils.isEmpty(csvParser.TransferTo)) {
        org.TransferTo = csvParser.TransferTo;
    } else {
        org.TransferTo = neritoUtils.transferTo.BNK;
    }
    return org;
}


function getUser(usr, org) {
    let user = {};
    user.Id = usr.Id,
        user.Group = usr.Group;
    user.Email = usr.Email;
    user.Name = usr.Name;
    if (!neritoUtils.isEmpty(org)) {
        user.OrganizationId = org.Id;
    } else {
        user.OrganizationId = "";
    }
    user.Status = true;
    return user;
}


function getOldUserId(org) {
    let oldUserId = [];
    for (const element of org.AccountUsers) {
        oldUserId.push(element.Id);
    }
    for (const element of org.PayrollUsers) {
        oldUserId.push(element.Id);
    }
    return oldUserId;
}