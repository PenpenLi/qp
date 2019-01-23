let AccountAPI = require('../../API/AccountAPI');
let HallAPI = require('../../API/HallAPI');

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        loadingGroup: cc.ProgressBar,
        progressText: cc.Label,

        accountEdit: cc.EditBox,
        passwordEdit: cc.EditBox,
        codeEdit: cc.EditBox,
        passwordConfirmEdit: cc.EditBox,

        headerGroup: cc.Node,
        loginGroup: cc.Node,
        btnGroup: cc.Node,
        saveGroup: cc.Node,
        otherGroup: cc.Node,

        saveNumberBtn: cc.Toggle,
        savePasswordBtn: cc.Toggle,

        titleImg: cc.Sprite,
        imgCode: cc.Sprite,
    },

    updateImgCode: function () {
        this.uniqueID = Global.Tools.updateImgCode(this.imgCode);
        this.codeEdit.string = '';
    },

    loading: function () {
        this.loadingGroup.progress = 0;
        let self = this;
        cc.loader.loadResDir("./", cc.Prefab,
            function (completedCount , totalCount ){
                if (totalCount === 0){
                    self.progressText.string = "100%";
                    self.loadingGroup.progress = 1;
                }else{
                    let newProgress = completedCount / totalCount;
                    if (newProgress > self.loadingGroup.progress){
                        self.progressText.string = (newProgress * 100).toFixed(0) + '%';
                        self.loadingGroup.progress = newProgress;
                    }
                }
            },
            function (err) {
                if (!!err) {
                    cc.log(err);
                } else {
                    cc.log("loading finished");
                }
            });
    },

    update: function () {
        if (!!this.loadingGroup) {
            if (this.loadingGroup.progress >= 1) {
                this.loadingGroup.progress = 1;
                this.progressText.string = Math.floor(this.loadingGroup.progress.toFixed(2) * 100) + '%';
                this.loadingGroup.node.active = false;
                this.update = function () {};
                // 连接帐号服务器
                Global.DialogManager.addLoadingCircle();
                Global.NetworkLogic.connectToAccountServer();
            }
        }
    },

    getSaveNumber: function () {
        return cc.sys.localStorage.getItem('saveNumber');
    },

    setSaveNumber: function (save) {
        return cc.sys.localStorage.setItem('saveNumber', save);
    },

    setSavePassword: function (save) {
        return cc.sys.localStorage.setItem('savePassword', save);
    },

    getSavePassword: function () {
        return cc.sys.localStorage.getItem('savePassword');
    },

    setCheckBtn: function () {
        if (this.getSaveNumber() === 'save') {
            this.saveNumberBtn.isChecked = true;
            this.accountEdit.string = cc.sys.localStorage.getItem('account');
        } else {
            this.saveNumberBtn.isChecked = false;
            this.accountEdit.string = '';
        }

        if (this.getSavePassword() === 'save') {
            this.savePasswordBtn.isChecked = true;
            this.passwordEdit.string = cc.sys.localStorage.getItem('password');
        } else {
            this.savePasswordBtn.isChecked = false;
            this.passwordEdit.string = '';
        }
    },

    showLogin: function () {
        Global.Tools.updateSpriteFrame('Login/labelImg_login', this.titleImg);
        this.codeEdit.string = '';

        this.passwordConfirmEdit.node.active = false;
        this.saveGroup.active = true;
        this.otherGroup.active = true;
        this.codeEdit.node.y = -115 * 2;
        this.btnGroup.y = -470;
    },

    showRegister: function () {
        Global.Tools.updateSpriteFrame('Login/labelImg_register', this.titleImg);
        this.accountEdit.string = '';
        this.passwordEdit.string = '';
        this.codeEdit.string = '';
        this.passwordConfirmEdit.string = '';

        this.passwordConfirmEdit.node.active = true;
        this.saveGroup.active = false;
        this.otherGroup.active = false;
        this.codeEdit.node.y = -115 * 3;
        this.btnGroup.y -= 50;
    },

    // use this for initialization
    onLoad: function () {
        this.headerGroup.active = false;
        this.loginGroup.active = false;
        this.btnGroup.scale = cc.winSize.width / this.btnGroup.width;

        Global.MessageCallback.addListener('AccountServerConnected', this);
        Global.MessageCallback.addListener('LoginResponse', this);
        Global.MessageCallback.addListener('RegisterResponse', this);
        Global.MessageCallback.addListener('HallServerConnected', this);
        Global.MessageCallback.addListener('EntryHallResponse', this);
        Global.MessageCallback.addListener('AccountServerDisconnection', this);
        Global.MessageCallback.addListener('UpdateGameTypeListResponse', this);
        Global.MessageCallback.addListener('ResponseError', this);
        // Global.MessageCallback.addListener('PlatformLogin', this);

        //加载资源
        this.loading();
    },

    checkEdit: function () {
        let accountData = {
            account: this.accountEdit.string,
            password: this.passwordEdit.string,
            platform: Global.Enum.loginPlatform.ACCOUNT
        };

        if (accountData.account.length !== 11) {
            Global.DialogManager.addTipDialog('请输入11位手机号！');
            return 'errorAccount';
        }

        if (accountData.password === '') {
            Global.DialogManager.addTipDialog('请输入密码！');
            return 'errPassword';
        }

        if (this.passwordConfirmEdit.node.active) {
            if (this.passwordConfirmEdit.string !== this.passwordEdit.string) {
                Global.DialogManager.addTipDialog('两次输入的密码不一致！');
                return 'errPasswordConfirm';
            }
        }

        if (this.codeEdit.string === '') {
            Global.DialogManager.addTipDialog('请输入验证码！');
            return 'errorCode';
        }

        return 'ok';
    },
    
    onBtnClk: function (event, param) {
        Global.Tools.playPreSound();
        cc.log(param);
        let accountData = {
            account: this.accountEdit.string,
            password: this.passwordEdit.string,
            platform: Global.Enum.loginPlatform.ACCOUNT
        };

        switch (param) {
            case 'regist':
                if (!this.passwordConfirmEdit.node.active) {
                    this.updateImgCode();
                    this.showRegister();
                    return;
                }

                if (this.checkEdit() !== 'ok') {
                    return;
                }

                Global.DialogManager.addLoadingCircle();
                this.registAP(accountData);
                break;
            case 'login':
                if (this.passwordConfirmEdit.node.active) {
                    this.updateImgCode();
                    this.showLogin();
                    return;
                }

                if (this.checkEdit() !== 'ok') {
                    return;
                }

                Global.DialogManager.addLoadingCircle();
                this.login(accountData);
                break;
            case 'saveNumber':
                if (this.saveNumberBtn.isChecked) {
                    this.setSaveNumber('save');
                } else {
                    this.setSaveNumber('notSave');
                }
                break;
            case 'savePassword':
                if (this.savePasswordBtn.isChecked) {
                    this.setSavePassword('save');
                } else {
                    this.setSavePassword('notSave');
                }
                break;
            case 'changeCode':
                this.updateImgCode();
                break;
            case 'lookForPassword':
                this.updateImgCode();
                Global.DialogManager.createDialog('Login/LookForPwdDialog', {account: this.accountEdit.string});
                break;
        }
    },

    onDestroy: function () {
        Global.MessageCallback.removeListener('AccountServerConnected', this);
        Global.MessageCallback.removeListener('LoginResponse', this);
        Global.MessageCallback.removeListener('RegisterResponse', this);
        Global.MessageCallback.removeListener('HallServerConnected', this);
        Global.MessageCallback.removeListener('EntryHallResponse', this);
        Global.MessageCallback.removeListener('AccountServerDisconnection', this);
        Global.MessageCallback.removeListener('UpdateGameTypeListResponse', this);
        Global.MessageCallback.removeListener('ResponseError', this);
        // Global.MessageCallback.removeListener('PlatformLogin', this);
    },

    messageCallbackHandler: function (route, data) {
        switch (route) {
            case 'PlatformLogin':
                this.registAP(data);
                break;
            case 'ResponseError':
                // this.showLoginUI();
                break;
            case 'AccountServerConnected':
                cc.log('账号服务器连接成功！');

                // if (Global.Tools.isWechatBrowser()) {
                //     let accountData = {
                //         account: Global.PlayerWechat.getPy('openid'),
                //         password: Global.PlayerWechat.getPy('openid'),
                //         platform: Global.Enum.loginPlatform.WEI_XIN
                //     };
                //     this.registAP(accountData);
                // } else {
                    Global.DialogManager.removeLoadingCircle();
                    this.headerGroup.active = true;
                    this.loginGroup.active = true;
                    this.showLogin();
                    this.setCheckBtn();
                    this.updateImgCode();
                // }
                break;
            case 'AccountServerDisconnection':
                cc.log('账号服务器断开！');
                Global.DialogManager.addLoadingCircle();
                Global.NetworkLogic.connectToHallServer(this.hallServerInfo.host, this.hallServerInfo.port);
                break;
            case 'LoginResponse':
                if (data.code === Global.Code.OK) {
                    if (data.loginResponse.accountInfo.hasSecurityQuestion) {
                        this.hallServerInfo = data.loginResponse.serverInfo;
                        this.token = data.loginResponse.token;
                        Global.NetworkLogic.disconnect();
                    } else {
                        Global.DialogManager.removeLoadingCircle();
                        Global.DialogManager.createDialog('Login/SetSecurityDialog', {
                            account: this.accountEdit.string,
                            password: this.passwordEdit.string
                        }, function () {
                            this.updateImgCode();
                            this.codeEdit.string = '';
                        }.bind(this));
                    }
                }
                break;
            case 'RegisterResponse':
                if (data.code === Global.Code.OK) {
                    Global.DialogManager.addTipDialog('注册成功！');
                    Global.DialogManager.removeLoadingCircle();
                    this.updateImgCode();
                    this.showLogin();
                }
                break;
            case 'HallServerConnected':
                cc.log('大厅服务器连接成功！');

                let userInfo = {
                    nickname: this.accountEdit.string,
                    avatar: 'Common/head_icon_default'
                };

                if (Global.Tools.isWechatBrowser()) {
                    userInfo.nickname = Global.PlayerWechat.getPy('nickname');
                    userInfo.avatar = Global.PlayerWechat.getPy('headimgurl');
                }

                HallAPI.entry(this.token, userInfo);
                break;
            case 'EntryHallResponse':
                cc.log('进入大厅！');
                //游戏数据初始化
                Global.Data.init(data.msg.publicParameter);
                //玩家数据初始化
                Global.Player.init(data.msg.userInfo);
                //游戏类型数据初始化
                Global.GameTypes.init(data.msg.gameTypes);
                //代理数据初始化
                Global.AgentProfit.init(data.msg.agentProfit);
                this.enterGame();

                //获取游戏类型
                // GameCenterAPI.getGameTypeListRequest('all');
                break;
            case 'UpdateGameTypeListResponse':
                //游戏类型数据初始化
                // Global.GameTypes.init(data.GetGameServerListResponse.list);
                // this.enterGame();
                break;
        }
    },

    enterGame: function () {
        let callback = function () {
            Global.DialogManager.removeLoadingCircle();
            Global.DialogManager.destroyDialog('Login/LoginDialog');
        };

        Global.DialogManager.createDialog('Hall/HallDialog', null, callback);
    },

    //游客登录
    visitorLogin: function () {
        let account = (new Date()).valueOf();
        let password = (new Date()).valueOf();
        console.log(account, password);

        this.registAP({account: account, password: password, platform: Global.Enum.loginPlatform.ACCOUNT});
    },

    //注册账号
    registAP: function (data) {
        this.saveAccount(data.account, data.password, data.platform);
        data.imgCodeInfo = {
            uniqueID: this.uniqueID,
            code: this.codeEdit.string
        };
        AccountAPI.registAP(data.account, data.password, data.platform, data.imgCodeInfo, function (msg) {
            if (msg.code !== Global.Code.OK) {
                this.updateImgCode();
            }
            Global.MessageCallback.emitMessage('RegisterResponse', msg);
        }.bind(this));
    },

    //登录
    login: function (data) {
        this.saveAccount(data.account, data.password, data.platform);
        data.imgCodeInfo = {
            uniqueID: this.uniqueID,
            code: this.codeEdit.string
        };
        AccountAPI.login(data.account, data.password, data.platform, data.imgCodeInfo, function (msg) {
            if (msg.code !== Global.Code.OK) {
                this.updateImgCode();
            }
            Global.MessageCallback.emitMessage('LoginResponse', msg);
        }.bind(this));
    },

    //本地帐号存储
    saveAccount: function (account, password, platform) {
        cc.sys.localStorage.setItem('account', account);
        cc.sys.localStorage.setItem('password', password);
        cc.sys.localStorage.setItem('platform', platform);
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
