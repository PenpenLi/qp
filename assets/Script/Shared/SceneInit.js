cc.Class({
    extends: cc.Component,

    properties: {
        // showGameType: 0,
        // portrait: true,
        // firstDialog: ""

        sceneType: '',
        initText: cc.Label,
        initGroup: cc.Node
    },

    initGlobal: function(){
        this.initText.string = '初始化中';
        //初始化一些常量信息
        Global.Constant = require('./Constant');
        //初始化一些初始化回调监听消息相关
        Global.MessageCallback = require('./MessageCallback');
        //会话管理器
        Global.DialogManager = require('./DialogManager');
        //媒体管理器（包括音视频）
        Global.AudioManager = require('./AudioManager');
        //网络相关
        Global.NetworkLogic = require('./NetworkLogic');
        Global.NetworkManager = require('./NetworkManager');
        Global.Tools = require('./Tools');
        Global.Player = require('../Models/Player');
        Global.PlayerWechat = require('../Models/PlayerWechat');
        Global.GameTypes = require('../Models/GameTypes');
        Global.Data = require('../Models/Data');
        Global.Enum = require('./enumeration');
        Global.Code = require('./code');
        Global.API = require('./Api');
        Global.SDK = require('../Models/SDK');
        Global.Animation = require('./Animation');
        Global.AgentProfit = require('../Models/AgentProfit');
        // Global.City = require('../UI/Exchange/City').init();
    },

    onLoad: function () {
        //是否在左下角显示FPS
        cc.director.setDisplayStats(false);
        cc.game.setFrameRate(30);
        // 初始化全局变量
        this.initGlobal();
        // 适配处理
        var size = new cc.size(720, 1280);
        var frameSize = cc.view.getFrameSize();
        console.log("size is ",size);
        console.log("frameSize is ",frameSize);
        if (size.height/size.width < frameSize.height/frameSize.width){
            size.height = size.width * (frameSize.height / frameSize.width);
        } else{
            size.width = size.height * (frameSize.width/frameSize.height);
        }
        var canvas = this.node.getComponent(cc.Canvas);
        canvas.designResolution = size;
        console.log("canvas's designResolution is ",canvas.designResolution);

        cc.view.setResizeCallback(function (){
            console.log("屏幕重新适配");
            size = new cc.size(720, 1144);
            frameSize = cc.view.getFrameSize();
            if (size.height/size.width < frameSize.height/frameSize.width){
                size.height = size.width * (frameSize.height / frameSize.width);
            } else{
                size.width = size.height * (frameSize.width/frameSize.height);
            }
            canvas.designResolution = size;
            /*
            var currentFrameSize = cc.view.getFrameSize();
            if (currentFrameSize.height < currentFrameSize.width){
                if (!!self.noticeNode){
                    self.noticeNode.active = true;
                }else{
                    self.noticeNode = cc.instantiate(self.rotateNoticeWidget);
                    self.noticeNode.parent = self.node;
                }
            }else {
                if (!!self.noticeNode){
                    self.noticeNode.active = false;
                }
            }
            */
        });
        //Tools初始化
        Global.Tools.init();

        // 初始化界面管理器
        Global.DialogManager.init(this.node);

        //音乐音效初始化
        Global.AudioManager.initMS();

        if (Global.Tools.isWechatBrowser()) {
            //初始化玩家微信信息
            // window.onerror = function (a, b, c) {
            //     alert(a + b + c);
            // };

            this.getUserInfo();
        } else {
            this.enterGame();
        }
    },

    enterGame: function () {
        var cb = function () {
            this.initGroup.destroy();
        }.bind(this);

        if (Global.Tools.isWechatBrowser()) {
            Global.GameTypes.setState(this.locationParams.state);
            Global.DialogManager.createDialog('Login/LoginDialog', null, cb);
        } else {
            Global.GameTypes.setState(this.sceneType);
            Global.DialogManager.createDialog('Login/LoginDialog', null, cb);
        }
    },

    //获取地址栏参数
    getLocationParams: function () {
        var name,value;
        var str=location.href; //取得整个地址栏
        var num=str.indexOf("?");
        str=str.substr(num+1); //取得所有参数   stringvar.substr(start [, length ]

        var arr=str.split("&") || {}; //各个参数放到数组里
        var tab = {};
        for(var i=0;i < arr.length;i++){
            num=arr[i].indexOf("=");
            if(num>0){
                name=arr[i].substring(0,num);
                value=arr[i].substr(num+1);
                tab[name] = value;
            }
        }
        return tab;
    },

    getUserInfo: function () {
        this.initText.string = '获取用户信息';

        this.appID = Global.Constant.wxAppID;
        this.locationParams = this.getLocationParams();
        var code = this.locationParams.code;
        var state = this.locationParams.state;

        Global.Tools.setPageTitle('Loading...');

        if (!!code) {
            var url = Global.Tools.httpGetUserInfo + '?code=' + code;

            Global.Tools.httpRequest({url: url, callback: function (xhr) {
                var data = JSON.parse(xhr.responseText);
                if (!!data.errcode) {
                    location.href = Global.Tools.http + '/Game?state=' + state;
                } else {
                    Global.PlayerWechat.init(data);

                    if (state === 'QRCode') {
                        this.getQRCode();
                    } else {
                        this.getJSSDKSignature();
                    }
                }
            }.bind(this)});
        } else {
            location.herf = Global.Tools.http + '/Game?state=' + state;
        }
    },

    getJSSDKSignature: function () {
        this.initText.string = '获取微信初始化签名';

        var url = Global.Tools.httpGetJSSDKSignature + '?currentUrl=' + location.href.split('#')[0];
        Global.Tools.httpRequest({
            url: url,
            callback: function (xhr) {
                var data = JSON.parse(xhr.responseText);
                this.initJSSDK(data);
            }.bind(this)
        })
    },

    initJSSDK: function (data) {
        this.initText.string = '微信初始化';

        var jssdk = document.createElement('script');
        jssdk.async = true;
        jssdk.src = 'http://res.wx.qq.com/open/js/jweixin-1.2.0.js';
        document.body.appendChild(jssdk);
        /*---------JSSDK初始化-----------*/
        jssdk.addEventListener('load',function() {
            Global.wx = wx;

            wx.config({
                // debug: true,// 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: this.appID, // 必填，公众号的唯一标识
                timestamp: data.timeStamp, // 必填，生成签名的时间戳
                nonceStr: data.nonceStr, // 必填，生成签名的随机串
                signature: data.signature, // 必填，签名，见附录1
                jsApiList: [
                    'onMenuShareTimeline',//分享朋友圈
                    'onMenuShareAppMessage',//分享给朋友
                    'chooseWXPay',//微信支付
                    'hideAllNonBaseMenuItem',//隐藏所有非基础按钮接口
                    'showMenuItems',// 要显示的菜单项

                    //语音相关 start
                    'startRecord',
                    'stopRecord',
                    'onVoiceRecordEnd',
                    'playVoice',
                    'pauseVoice',
                    'stopVoice',
                    'onVoicePlayEnd',
                    'uploadVoice',
                    'downloadVoice'
                    //语音相关 end
                ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });

            wx.ready(function () {
                wx.hideAllNonBaseMenuItem();
                wx.showMenuItems({
                    menuList: [
                        "menuItem:share:appMessage"
                    ]
                });

                this.enterGame();
                Global.SDK.init();
            }.bind(this));

            wx.error(function () {
                alert('jssdk权限验证不通过，请重试！');
            })
        }.bind(this));
    },

    getQRCode: function () {
        Global.Tools.setPageTitle('我的推广二维码');

        var postData = JSON.stringify({expire_seconds: 3600 * 24 * 30, action_name: "QR_STR_SCENE", action_info: {scene: {scene_str: Global.PlayerWechat.getPy('openid')}}});
        cc.log(postData);
        var url = Global.Tools.httpGetQRCode + '?params=' + postData;

        // var gameDiv = document.getElementById('Cocos2dGameContainer');
        // var bigImg = document.createElement("img");
        // bigImg.id = 'SpreaderQRCode';
        // bigImg.src = url;
        // bigImg.alt = 'bigImg';
        // bigImg.width = parseInt(gameDiv.style.width.replace(/px/, ''));
        //
        // bigImg.style.position = 'absolute';
        // bigImg.style.top = '0px';
        // bigImg.style.left = '0px';
        //
        // gameDiv.appendChild(bigImg);      //为dom添加子元素img

        Global.Tools.updateSpriteFrame(url, this.QRCodeImg, function () {
            this.QRCodeImg.node.active = true;
            this.QRCodeImg.node.scaleY = cc.winSize.width / this.QRCodeImg.node.width;
            this.QRCodeImg.node.width = cc.winSize.width;
        }.bind(this));
    }
});
