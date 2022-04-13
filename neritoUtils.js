const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
let neritoUtils = require('./neritoUtils.js');


module.exports = {
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    csvStatus: {
        PENDING: 'PENDING',
        COMPLETED: 'COMPLETED',
        FAILED: 'FAILED'
    },
    action: {
        CSVUPLOAD: 'CSVUPLOAD',
        SAVEORG: 'SAVEORG',
        UPDATEORG: 'UPDATEORG'
    },
    storagetype: {
        ORG_LOGO: 'ORG_LOGO',
        EMP_CSV: 'EMP_CSV'
    },
    transferTo: {
        BNK: 'BNK',
        WLT: 'WLT'
    },
    userType: {
        ACCOUNT_USER: 'ACCOUNT_USER',
        PAYROLL_USER: 'PAYROLL_USER'
    },
    successResponseJson: async function (message, code) {
        let error = {};
        let Error = {};
        Error.Success = message;
        error.isBase64Encoded = false;
        error.statusCode = code;
        error.headers = {
            "X-Requested-With": '*',
            "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-requested-with',
            "Access-Control-Allow-Origin": '*',
            "Access-Control-Allow-Methods": 'POST,GET,OPTIONS,PUT'
        },
            error.body = JSON.stringify(Error);
        console.error(error);
        return error;
    },
    errorResponseJson: async function (message, code) {
        let error = {};
        let Error = {};
        Error.Errors = message;
        error.isBase64Encoded = false;
        error.statusCode = code;
        error.headers = {
            "X-Requested-With": '*',
            "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-requested-with,orgId',
            "Access-Control-Allow-Origin": '*',
            "Access-Control-Allow-Methods": 'POST,GET,OPTIONS,PUT'
        },
            error.body = JSON.stringify(Error);
        console.error(error);
        return error;
    },
    isEmailValid: async function (email) {
        if (!email) {
            return false;
        }

        if (email.length > 254) {
            return false;
        }
        var valid = emailRegex.test(email);
        if (!valid) {
            return false;
        }

        // Further checking of some things regex can't handle
        var parts = email.split("@");
        if (parts[0].length > 64) {
            return false;
        }

        var domainParts = parts[1].split(".");
        if (domainParts.some(function (part) { return part.length > 63; })) {
            return false;
        }
        return true;
    },
    isEmpty: function (obj) {
        return isEmpty(obj);
    },
    getExtension: function (filename) {
        return getExtension(filename);
    },

    isBoolean: function (val) {
        return val === false || val === true;
    },
    isCorrectImgFileType: function (val) {
        val = getExtension(val);
        return val === '.JPEG' || val === '.jpeg' || val === '.PNG' || val === '.png' || val === '.JPG' || val === '.jpg';
    },
    isValidJson: function (val) {
        try {
            let json = JSON.parse(val);
            if (!isEmpty(json)) {
                return true;
            }
        } catch (err) {
            console.error(err);
            return false;
        }
    },
    zeroAppenderOnLeft: function (str) {
        let length = str.length;
        if (length === 20) {
            return str;
        }
        return str.toString().padStart(20, '0');
    },
};

function isEmpty(obj) {
    return obj === null || obj === undefined || Object.keys(obj).length === 0;
}

function getExtension(filename) {
    var i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substr(i);
}