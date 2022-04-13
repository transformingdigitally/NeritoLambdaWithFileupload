const csvController = require('./csvController.js');
const neritoUtils = require('./neritoUtils.js');
const requestValidator = require('./requestValidator.js');
const organizationController = require('./organizationController.js');
const parser = require("lambda-multipart-parser");
let service = require('./service.js');


exports.handler = async function (event, ctx, callback) {
    try {
        let action, users;
        let queryJSON = JSON.parse(JSON.stringify(event.queryStringParameters));
        if (neritoUtils.isEmpty(queryJSON) || neritoUtils.isEmpty(queryJSON['action'])) {
            return neritoUtils.errorResponseJson("Action is not defined", 400);
        }
        action = queryJSON['action'];
        if (neritoUtils.isEmpty(event) || neritoUtils.isEmpty(event.body)) {
            return neritoUtils.errorResponseJson("Form data not found ", 400);
        }
        let csvParser;
        try {
            csvParser = await parser.parse(event);
        } catch (err) {
            console.error("Something went wrong with request body: ", err)
            throw "Something went wrong";
        }
        if (action.localeCompare(neritoUtils.action.CSVUPLOAD) == 0) {
            const response = await csvController(csvParser);
            return response;
        } else if (action.localeCompare(neritoUtils.action.SAVEORG) == 0) {
            users = await getUsers();
            let error = requestValidator.validateRequest(csvParser, action, users);
            if (neritoUtils.isEmpty(error)) {
                const response = await organizationController.saveOrganization(csvParser, action);
                return response;
            } else {
                return neritoUtils.errorResponseJson(error, 400);
            }
        } else if ((action.localeCompare(neritoUtils.action.UPDATEORG) == 0)) {
            action = neritoUtils.action.UPDATEORG;
            users = await getUsers();
            let error = requestValidator.validateRequest(csvParser, action, users);
            if (neritoUtils.isEmpty(error)) {
                const response = await organizationController.updateOrganization(csvParser, action);
                return response;
            } else {
                return neritoUtils.errorResponseJson(error, 400);
            }
        } else {
            return neritoUtils.errorResponseJson("Preferred Action Is Not Defined", 400);
        }
    } catch (err) {
        console.error("Something went wrong", err);
        return neritoUtils.errorResponseJson("Something went wrong", 500);
    }
};

async function getUsers() {
    try {
        let users = await service.getUserList();
        if (neritoUtils.isEmpty(users) || neritoUtils.isEmpty(users.Items)) {
            throw "Something went wrong";
        }
        users = users.Items;
        return users;
    } catch (err) {
        console.error("Something went wrong while fetching users from User table", err);
        throw "Something went wrong";
    }
}

