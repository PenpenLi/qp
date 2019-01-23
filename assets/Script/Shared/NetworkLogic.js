/**
 * Created by 52835 on 2017/3/24.
 */

var networkManager = require('./NetworkManager');
var messageCallback = require('./MessageCallback');
var constant = require('./Constant');
var dialogManager = require('./DialogManager');
var texts = require('./Texts');

var NetworkLogic = module.exports;

var ACCOUNT_HOST = constant.AccountHost;
var ACCOUNT_PORT = constant.AccountPort;

var ACCOUNT_SERVER_CONNECTED_ROUTER = 'AccountServerConnected';
var ACCOUNT_SERVER_DISCONNECTION_ROUTER = 'AccountServerDisconnection';

var HALL_SERVER_CONNECTED_ROUTER = 'HallServerConnected';
var HALL_SERVER_DISCONNECTION_ROUTER = 'HallServerDisconnection';

var ServerType = {
    NONE: 0,
    ACCOUNT_SERVER: 1,
    HALL_SERVER: 2
};
NetworkLogic.currentServerType = ServerType.NONE;

NetworkLogic.isInit = false;
NetworkLogic.isReconnection = false;
NetworkLogic.isManualCloseServerConnection = false;

NetworkLogic.init = function (){
    NetworkLogic.isInit = true;
    /// 添加事件监听
    // 服务器断开链接
    messageCallback.addListener('ServerDisconnection', this);
    messageCallback.addListener('LoginResponse', this);
    messageCallback.addListener('ServerMessagePush', this);
    messageCallback.addListener('PopDialogContentPush', this);
    messageCallback.addListener('ReConnectSuccess', this);

    /// 服务器推送消息监听
    // 监听断开信息
    networkManager.addReceiveListen('close', 'ServerDisconnection');
    // 推送消息
    networkManager.addReceiveListen('ServerMessagePush');
};

NetworkLogic.connectToAccountServer = function (isReconnection){
    // 初始化
    if (!NetworkLogic.isInit) NetworkLogic.init();
    // 记录是否是重连
    NetworkLogic.isReconnection = !!isReconnection;
    if (NetworkLogic.currentServerType !== ServerType.NONE) {
        console.error('current connected server, cannot start a new connection');
        return;
    }

    //记录是否是切换帐号导致的断开连接
    this.switchAccountFlag = false;

    // 连接服务器
    networkManager.init({
        host: ACCOUNT_HOST,
        port: ACCOUNT_PORT
    }, function(){
        NetworkLogic.currentServerType = ServerType.ACCOUNT_SERVER;
        messageCallback.emitMessage(ACCOUNT_SERVER_CONNECTED_ROUTER);
    });


};

NetworkLogic.connectToHallServer = function (host, port){
    if (NetworkLogic.currentServerType !== ServerType.NONE) {
        console.error('current connected server, cannot start a new connection');
        return;
    }
    setTimeout(function(){
        networkManager.init({
            host: host,
            port: port
        }, function(){
            NetworkLogic.currentServerType = ServerType.HALL_SERVER;
            messageCallback.emitMessage(HALL_SERVER_CONNECTED_ROUTER);
        });
    }, 1);
};

NetworkLogic.disconnect = function (switchAccount){
    this.switchAccountFlag = switchAccount;
    NetworkLogic.isManualCloseServerConnection = true;
    networkManager.disconnect();
};

NetworkLogic.messageCallbackHandler = function (router, data) {
    if (router === 'PopDialogContentPush') {
        if (!!Global.Code[data.code]) {
            Global.DialogManager.addTipDialog(Global.Code[data.code]);
        } else {
            Global.DialogManager.addTipDialog('游戏错误，错误码：' + data.code);
        }
    } else if (router === 'ServerMessagePush'){
        if (!data.pushRouter){
            console.error('ServerMessagePush push router is invalid:'+ data);
            return;
        }
        messageCallback.emitMessage(data.pushRouter, data);
    } else if (router === 'ServerDisconnection'){
        var msgRouter = (NetworkLogic.currentServerType === ServerType.ACCOUNT_SERVER) ? ACCOUNT_SERVER_DISCONNECTION_ROUTER:HALL_SERVER_DISCONNECTION_ROUTER;
        NetworkLogic.currentServerType = ServerType.NONE;
        // 帐号服务器断开连接
        if ((msgRouter === ACCOUNT_SERVER_DISCONNECTION_ROUTER) && NetworkLogic.isManualCloseServerConnection){
            NetworkLogic.isManualCloseServerConnection = false;
            messageCallback.emitMessage(msgRouter, data);
        }
        // 大厅服务器断开，删除所有界面创建MainDialog
        else{
            if (!!this.switchAccountFlag) {
                this.switchAccountFlag();
                this.switchAccountFlag = false;
            } else {
                if (!!this.tryReConnect) {
                } else {
                    this.tryReConnect = 0;
                }

                //断线重连
                if (this.tryReConnect < 3) {
                    this.tryReConnect += 1;
                    Global.DialogManager.addLoadingCircle();
                    setTimeout(function () {
                        Global.NetworkManager.reConnect();
                    }, 2000);

                    return;
                }

                dialogManager.addPopDialog(texts.DISCONNECTION_WITH_SERVER,
                    function(){
                        cc.game.restart();
                    });
            }
        }
    } else if (router === 'ReConnectSuccess') {
        Global.DialogManager.removeLoadingCircle();
        this.tryReConnect = 0;
    }
};