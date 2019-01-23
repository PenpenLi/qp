var api = module.exports = {};

/**
 * imgCodeInfo:{
 *   uniqueID: String
 *   code: String
 * }
 */
api.login = function (account, password, loginPlatform, imgCodeInfo, cbRouter) {
    var router = 'account.accountHandler.login';
    var requestData = {
        account: account,
        password: password,
        loginPlatform: loginPlatform,
        imgCodeInfo: imgCodeInfo
    };
    Global.NetworkManager.send(router, requestData, cbRouter || 'LoginResponse');
};

api.registAP = function (account, password, loginPlatform, imgCodeInfo, cbRouter) {
    var router = 'account.accountHandler.register';
    var requestData = {
        account: account,
        password: password,
        loginPlatform: loginPlatform,
        imgCodeInfo: imgCodeInfo
    };
    Global.NetworkManager.send(router, requestData, cbRouter || 'RegisterResponse');
};

api.resetPasswordByPhoneRequest = function (account, newPassword, smsCode, imgCodeInfo, cbRouter) {
    var router = 'account.accountHandler.resetPasswordByPhone';
    var requestData = {
        account: account,
        newPassword: newPassword,
        smsCode: smsCode,
        imgCodeInfo: imgCodeInfo
    };
    Global.NetworkManager.send(router, requestData, cbRouter || 'ResetPasswordByPhoneResponse');
};

api.validateSecurityQuestionRequest = function (account, securityQuestion, imgCodeInfo, cbRouter) {
    var router = 'account.accountHandler.validateSecurityQuestion';
    var requestData = {
        account: account,
        imgCodeInfo: imgCodeInfo,
        securityQuestion: securityQuestion
    };
    Global.NetworkManager.send(router, requestData, cbRouter || 'ValidateSecurityQuestionResponse');
};

api.resetPasswordBySecurityQuestionRequest = function (account, newPassword, securityQuestion, imgCodeInfo, cbRouter) {
    var router = 'account.accountHandler.resetPasswordBySecurityQuestion';
    var requestData = {
        account: account,
        newPassword: newPassword,
        securityQuestion: securityQuestion,
        imgCodeInfo: imgCodeInfo
    };
    Global.NetworkManager.send(router, requestData, cbRouter || 'ResetPasswordBySecurityQuestionResponse');
};

// 设置密保问题
/**
 * securityQuestion = [
 *  {
 *      question: {type: String, default: ""},
 *      answer: {type: String, default: ""}
 *  }
 * ]
 */
api.setSecurityQuestionRequest = function (account, password, securityQuestion, cbRouter) {
    var router = 'account.accountHandler.setSecurityQuestion';
    var requestData = {
        account: account,
        password: password,
        securityQuestion: securityQuestion
    };
    Global.NetworkManager.send(router, requestData, cbRouter || 'setSecurityQuestionResponse');
};

api.getSecurityQuestionRequest = function (account, cbRouter) {
    var router = 'account.accountHandler.getSecurityQuestion';
    var requestData = {
        account: account
    };
    Global.NetworkManager.send(router, requestData, cbRouter || 'GetSecurityQuestionResponse');
};
