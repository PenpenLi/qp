var messageCallback = require('./MessageCallback');

var pomelo = window.pomelo;

var networkManager = module.exports = {};

networkManager.init = function (params,cbRoute) {
    console.log("params is ",params);
    pomelo.init({
        host: params.host,
        port: params.port,
        log: true
    }, cbRoute);
};

networkManager.disconnect = function () {
    pomelo.disconnect();
};

networkManager.request = function (route, msg, cbRoute) {
    console.log('Send:' + route);
    console.log(msg);
    pomelo.request(route, msg, function (data) {
        console.log('Receive:' + cbRoute);
        console.log(data);

        if (data.code !== Global.Code.OK) {
            Global.DialogManager.removeLoadingCircle();

            if (!!Global.Code[data.code]) {
                Global.DialogManager.addTipDialog(Global.Code[data.code]);
            } else {
                Global.DialogManager.addTipDialog('游戏错误，错误码：' + data.code);
            }

            messageCallback.emitMessage('ResponseError', msg);

            //验证码错误，密保问题回答错误，要返回做处理
            let callbackErrCode = [
                Global.Code.SMS_CODE_ERROR,
                Global.Code.IMG_CODE_ERROR,

                Global.Code.LOGIN.PASSWORD_ERROR,
                Global.Code.LOGIN.ANSWER_ERROR,
                Global.Code.LOGIN.ACCOUNT_OR_PASSWORD_ERROR,
                Global.Code.LOGIN.ACCOUNT_EXIST,
                Global.Code.LOGIN.ACCOUNT_NOT_EXIST
            ];

            for (let i = 0; i < callbackErrCode.length; i ++) {
                if (data.code === callbackErrCode[i]) {
                    cbRoute(data);
                }
            }
            return;
        }

        if (!!cbRoute){
            if (typeof(cbRoute) === 'function') {
                console.log('Receive:' + route);
                console.log(data);
                cbRoute(data);
                return;
            }
            messageCallback.emitMessage(cbRoute, data);
        }
    });
};

networkManager.send = function (route, msg, cbRoute) {
    this.request(route, msg, cbRoute);
};

networkManager.notify = function (route, msg){
    console.log('Notify:' + route);
    console.log(msg);
    pomelo.notify(route, msg);
};

networkManager.addReceiveListen = function (route, cbRoute) {
    cbRoute = cbRoute || route;
    var pushCallback = function (msg) {
        if (!!cbRoute){
            console.log('push:' + cbRoute);
            console.log(msg);
            messageCallback.emitMessage(cbRoute, msg);
        }
    };
    pomelo.on(route, pushCallback);
    return pushCallback;
};

networkManager.removeListener = function (route){
    pomelo.removeListener(route, networkManager.pushCallback);
};

networkManager.removeAllListeners = function (){
    pomelo.removeAllListeners();
};

networkManager.reConnect = function () {
    Global.MessageCallback.addListener('AccountServerConnected', this);
    Global.MessageCallback.addListener('LoginResponse', this);
    Global.MessageCallback.addListener('RegisterResponse', this);
    Global.MessageCallback.addListener('HallServerConnected', this);
    Global.MessageCallback.addListener('EntryHallResponse', this);
    Global.MessageCallback.addListener('AccountServerDisconnection', this);
    Global.NetworkLogic.connectToAccountServer();
};

networkManager.messageCallbackHandler = function (router, data) {
    switch (router) {
        case 'AccountServerConnected':
            var account = cc.sys.localStorage.getItem('account');
            var password = cc.sys.localStorage.getItem('password');
            var platform = cc.sys.localStorage.getItem('platform');

            cc.log("-->账户，密码，平台:",account, password, platform);

            Global.API.account.login(account, password, platform);
            break;
        case 'LoginResponse':
        case 'RegisterResponse':
            if (data.code === Global.Code.OK) {
                this.hallServerInfo = data.loginResponse.serverInfo;
                this.token = data.loginResponse.token;
                Global.NetworkLogic.disconnect();
            }
            break;
        case 'AccountServerDisconnection':
            Global.NetworkLogic.connectToHallServer(this.hallServerInfo.host, this.hallServerInfo.port);
            break;
        case 'HallServerConnected':
            var userInfo = {
                nickname: Global.Player.getPy('nickname'),
                avatar: Global.Player.getPy('avatar')
            };

            if (Global.Tools.isWechatBrowser()) {
                userInfo.nickname = Global.PlayerWechat.getPy('nickname');
                userInfo.avatar = Global.PlayerWechat.getPy('headimgurl');
            }

            Global.API.hall.entry(this.token, userInfo);
            break;
        case 'EntryHallResponse':
            //游戏数据初始化
            Global.Data.init(data.msg.publicParameter);
            //玩家数据初始化
            Global.Player.init(data.msg.userInfo);
            //游戏类型数据初始化
            Global.GameTypes.init(data.msg.gameTypes);

            Global.MessageCallback.removeListener('AccountServerConnected', this);
            Global.MessageCallback.removeListener('LoginResponse', this);
            Global.MessageCallback.removeListener('RegisterResponse', this);
            Global.MessageCallback.removeListener('HallServerConnected', this);
            Global.MessageCallback.removeListener('EntryHallResponse', this);
            Global.MessageCallback.removeListener('AccountServerDisconnection', this);

            Global.MessageCallback.emitMessage('ReConnectSuccess');
            break;
    }
};

