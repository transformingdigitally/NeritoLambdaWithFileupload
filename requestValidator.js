const neritoUtils = require('./neritoUtils.js');
let service = require('./service.js');

let accountUsers = [];
let payrollUsers = [];


module.exports = {
    validateRequest: function (request, action, users) {
        accountUsers = [];
        payrollUsers = [];
        let error = [];
        try {
            if (action.localeCompare(neritoUtils.action.UPDATEORG) == 0 && neritoUtils.isEmpty(request.Id)) {
                error.push("ID");
            }
            if (action.localeCompare(neritoUtils.action.UPDATEORG) == 0 && neritoUtils.isEmpty(request.SK)) {
                error.push("SK");
            }
            for (const element of users) {
                if (element.OrganizationId === "" || (action.localeCompare(neritoUtils.action.UPDATEORG) == 0 && element.OrganizationId === request.Id)) {
                    if (element.Group.localeCompare(neritoUtils.userType.ACCOUNT_USER) == 0) {
                        accountUsers.push(element.Id);
                    }
                    if (element.Group.localeCompare(neritoUtils.userType.PAYROLL_USER) == 0) {
                        payrollUsers.push(element.Id);
                    }
                }
            }

            if (!neritoUtils.isEmpty(request.files[0])) {
                const { content, filename } = request.files[0];
                if (!neritoUtils.isEmpty(filename) && content.length > 1048576) {
                    error.push("FILE_SIZE");
                }
                if (!neritoUtils.isEmpty(filename) && !neritoUtils.isCorrectImgFileType(filename)) {
                    error.push("FILE_TYPE");
                }
            }
            if (neritoUtils.isEmpty(request.AccountUsers) || !neritoUtils.isValidJson(request.AccountUsers) || !neritoUtils.isEmpty(getUserIds(accountUsers, request.AccountUsers))) {
                error.push("ACCOUNT_USER");
            }
            if (neritoUtils.isEmpty(request.FiscalInfo) || request.FiscalInfo < 0 || request.FiscalInfo > 100) {
                error.push("FISCAL_INFO");
            }
            if (neritoUtils.isEmpty(request.Config) || !neritoUtils.isValidJson(request.Config)) {
                error.push("CONFIG");
            }
            if (neritoUtils.isEmpty(request.Email) || !neritoUtils.isEmailValid(request.Email)) {
                error.push("EMAIL");
            }
            if (neritoUtils.isEmpty(request.EmployeeEnrollmentDate) || (request.EmployeeEnrollmentDate < 1 || request.EmployeeEnrollmentDate > 31)) {
                error.push("EMPLOYEE_ENROLLMENT_DATE");
            }
            if (neritoUtils.isEmpty(request.FileValidation) || !neritoUtils.isValidJson(request.FileValidation)) {
                error.push("FILE_VALIDATION");
            }

            if (neritoUtils.isEmpty(request.OrgName) || request.OrgName.length > 60) {
                error.push("ORGANIZATION_NAME");
            }
            if (neritoUtils.isEmpty(request.RFC) || request.RFC.length > 13) {
                error.push("RFC");
            }
            if (neritoUtils.isEmpty(request.PayrollDisbursement) || (request.PayrollDisbursement < 1 || request.PayrollDisbursement > 31)) {
                error.push("PAYROLL_DISBURSEMENT");
            }
            if (neritoUtils.isEmpty(request.PayrollUsers) || !neritoUtils.isValidJson(request.PayrollUsers) || !neritoUtils.isEmpty(getUserIds(payrollUsers, request.PayrollUsers))) {
                error.push("PAYROLL_USERS");
            }
            if (neritoUtils.isEmpty(request.Status) || neritoUtils.isBoolean(request.Status)) {
                error.push("STATUS");
            }
            if (neritoUtils.isEmpty(request.TransferTo) || !(request.TransferTo in neritoUtils.transferTo)) {
                error.push("TRANSFER_TO");
            }
            if (neritoUtils.isEmpty(request.OriginAccount) || isNaN(request.OriginAccount)) {
                error.push("OriginAccount");
            }            
            return error;
        } catch (err) {
            console.error(err);
            throw "Something went wrong";
        }
    }
};

function getUserIds(listJsonDb, listJson) {
    let userIds = [];
    listJson = JSON.parse(listJson);
    for (const element of listJson) {
        if (listJsonDb.indexOf(element.Id) == -1) {
            userIds.push(element.Id);
        }
    }
    return userIds;
}