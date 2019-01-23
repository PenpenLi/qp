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

        //用户信息
        nicknameText: cc.Label,
        scoreText: cc.Label,
        headIcon: cc.Sprite,

        //公告
        noticeText: cc.Label,

        showContent: cc.Node,

        showItem: cc.Prefab,
        gameBtnItem: cc.Prefab,

        pageView: cc.Node,
        userInfoAndFuncGroup: cc.Node,
        otherGroup: cc.Node,

        funcGroup: cc.Node,
        gameBtnGroup: cc.Node,
        roomGroup: cc.Node,
        rechargeGroup: cc.Node,
        tikuanGroup: cc.Node,
        personGroup: cc.Node,
        matchGroup: cc.Node,
        commissionGroup: cc.Node,
        shareGroup: cc.Node,

        backHallGroup: cc.Node,
        backHallBtn: cc.Node,

        funcBtns: [cc.Node],

        pageTurnItem: cc.Prefab
    },

    init: function () {
        this.updatePlayerInfo();

        let scale = cc.winSize.width / this.funcGroup.width;
        this.funcGroup.scaleX = scale;
        for (let i = 0; i < this.funcBtns.length; i ++) {
            this.funcBtns[i].scaleY = scale;
        }

        //设置公告
        this.setNotice();
    },

    setNotice: function () {
        this.noticeText.string = Global.Data.getData('loopBroadcastContent');

        let scrollSpeed = 100;
        let distance = this.noticeText.node.width + this.noticeText.node.parent.width + 50;
        let time = distance / scrollSpeed;
        let move = cc.moveBy(time, -distance, 0);
        let moveEnd = cc.callFunc(function () {
            this.noticeText.node.x = 0;
        }.bind(this));
        let actions= cc.repeatForever(cc.sequence([move, moveEnd]));
        this.noticeText.node.runAction(actions);
    },

    showNotice: function () {
        // Global.DialogManager.addPopDialog(Global.Data.getData('platformTip'), function () {});

        if (!Global.alreadyShowNotice) {
            Global.DialogManager.createDialog('Hall/NoticeDialog');
            Global.alreadyShowNotice = true;
        }
    },

    updatePlayerInfo: function() {
        //大厅
        this.nicknameText.string = Global.Player.getPy('nickname');
        this.scoreText.string = Global.Player.getPy('gold');
        Global.Tools.updateSpriteFrame(Global.Player.getPy('avatar'), this.headIcon);

        //个人信息
        this.personGroup.getComponent('PersonGroup').resetInfo();

        //提款信息
        this.tikuanGroup.getComponent('TiKuanGroup').updateInfo();

        //充值界面
        this.rechargeGroup.getComponent('RechargeGroup').updateInfo();

        //我的佣金界面
        this.commissionGroup.getComponent('CommissionGroup').updateInfo();
    },

    checkJoinRoom: function () {
        //检查链接中是否有房间ID
        // if (!!this.dialogParameters) {
        //     let state = this.dialogParameters.state;
        //     if (!!state && state !== 'game') {
        //         Global.DialogManager.addLoadingCircle();
        //         Global.API.hall.joinRoomRequest(state);
        //
        //         Global.API.hall.recordFriendRequest(Global.Player.getPy('uid'));
        //     }
        // }

        //玩家在房间
        let roomID = Global.Player.getPy('roomID');
        // let oldRoom = false;
        if (!!roomID) {
            // oldRoom = true;
            Global.Player.setPy('roomID', 0);
            Global.API.hall.joinRoomRequest(roomID);
            // return;
        }

        //点击链接进入房间
        // roomID = Global.GameTypes.getJoinRoomID();
        // if (!!roomID) {
        //     if (oldRoom) {
        //         Global.DialogManager.addPopDialog('您当前已经在房间中，无法再加入新的房间，请先解散！');
        //         return;
        //     }
        //
        //     Global.DialogManager.addLoadingCircle();
        //     Global.API.hall.joinRoomRequest(roomID);
        //     Global.API.hall.recordFriendRequest(Global.GameTypes.getAddFriendUid(), Global.GameTypes.getCurrentGameType());
        //     Global.GameTypes.clearState();
        // }
    },

    createRankList: function () {
        let gameType = Global.GameTypes.getCurrentGameTypeID();
        if(gameType === 'nn-1') {	// 牛牛暂时没有排行数据
			return;
        }
        Global.API.hall.getGoldRankListRequest(gameType, function (msg) {
            this.myRankText.string = msg.msg.selfRank;
            let rankList = msg.msg.rankList;
            for (let i = 0; i < rankList.length; i ++) {
                let item = cc.instantiate(this.rankItem);
                item.parent = this.rankContent;
                item.getComponent('RankItem').updateUI(rankList[i], i + 1);
            }
        }.bind(this));
    },

    createShowView: function () {
        for (let i = 0; i < 1; i ++) {
            let item = cc.instantiate(this.showItem);
            item.parent = this.showContent;
            item.getComponent('ShowItem').updateUI();
        }
    },

    createGameItem: function () {
        let tab = [
            Global.Enum.gameType.ZJH,
            Global.Enum.gameType.NN,
            Global.Enum.gameType.SSS,
            Global.Enum.gameType.TTZ,
        ];

        for (let i = 0; i < tab.length; i ++) {
            let item = cc.instantiate(this.gameBtnItem);
            item.parent = this.gameBtnGroup;
            item.getComponent('GameBtnItem').updateUI(tab[i], function (data) {
                this.roomGroup.getComponent('RoomGroup').updateRooms(data);
                this.showGroup('room');
            }.bind(this));
        }
    },

    showGroup: function (groupName) {
        this.pageView.active = groupName === 'hall';
        this.gameBtnGroup.active = groupName === 'hall';
        this.backHallGroup.active = groupName !== 'hall';

        this.rechargeGroup.active = groupName === 'recharge';
        this.tikuanGroup.active = groupName === 'tikuan';
        this.personGroup.active = groupName === 'person';
        this.matchGroup.active = groupName === 'match';
        this.commissionGroup.active = groupName === 'commission';
        this.shareGroup.active = groupName === 'share';
        this.roomGroup.active = groupName === 'room';
    },

    // use this for initialization
    onLoad: function () {
        Global.PageTurnItem = this.pageTurnItem;

        //界面数据更新，填充
        Global.MessageCallback.addListener('SelfEntryRoomPush', this);
        Global.MessageCallback.addListener('UpdateUserInfoUI', this);
        Global.MessageCallback.addListener('ReConnectSuccess', this);

        this.showGroup('hall');
        this.init();
        this.showNotice();
        this.createShowView();
        this.createGameItem();
        Global.Tools.setPageTitle(Global.Constant.TITLE.HALL);

        // this.createRankList();
        this.checkJoinRoom();

        //播放一次音效

        for (let i = 0; i < 5; i ++) {
            Global.Tools.playPreSound();
        }
    },

    onDestroy: function() {
        Global.MessageCallback.removeListener('SelfEntryRoomPush', this);
        Global.MessageCallback.removeListener('UpdateUserInfoUI', this);
        Global.MessageCallback.removeListener('ReConnectSuccess', this);
    },

    messageCallbackHandler: function(router, msg) {
        switch (router) {
            case 'SelfEntryRoomPush':
				this.enterGame(msg);
                break;
            case 'UpdateUserInfoUI':
            case 'ReConnectSuccess':
                this.updatePlayerInfo();
                break;
        }
    },

	enterGame: function(entryRoomData) {
		//console.log('enterGame', entryRoomData);
		Global.DialogManager.addLoadingCircle();
		// let gameType = Global.GameTypes.getCurrentGameType();
        let gameType = entryRoomData.kindId;
        let needLoad = [];
		if (gameType === Global.Enum.gameType.SSS) {
            let twModel = require('../../Game/ThirteenWater/TWModel');
            twModel.setEntryRoomData(entryRoomData);
            needLoad = ['ThirtennWater', 'Voice'];
            Global.Tools.loadRes(needLoad, function () {
                Global.DialogManager.createDialog("ThirteenWater/TWMainDialog", null, function() {
                    Global.DialogManager.removeLoadingCircle();
                    Global.DialogManager.destroyDialog('Hall/HallDialog');
                });
            });
        } else if (gameType === Global.Enum.gameType.ZJH) {
            let ZJHModel = require('../../Game/ZhaJinHua/ZJHModel');
            ZJHModel.init(entryRoomData);
            needLoad = ['ZhaJinHua'];
            Global.Tools.loadRes(needLoad, function () {
                Global.DialogManager.createDialog('ZhaJinHua/UIPrefabs/ZhaJinHuaDialog', null, function () {
                    Global.DialogManager.removeLoadingCircle();
                    Global.DialogManager.destroyDialog('Hall/HallDialog');
                })
            });
        } else if (gameType === Global.Enum.gameType.NN) {
            //Global.DialogManager.addTipDialog('进入牛牛房间');
            //Global.DialogManager.removeLoadingCircle();
            let NNModel = require('../../Game/Niuniu/NNModel');
            NNModel.setEntryRoomData(entryRoomData);
            needLoad = ['Niuniu'];
            Global.Tools.loadRes(needLoad, function () {
                Global.DialogManager.createDialog("Niuniu/NNMainDialog", null, function() {
                    Global.DialogManager.removeLoadingCircle();
                    Global.DialogManager.destroyDialog('Hall/HallDialog');
                });
            });
        } else if (gameType === Global.Enum.gameType.TTZ) {
            let TTZModel = require('../../Game/TuiTongZi/TTZModel');
            TTZModel.setEntryRoomData(entryRoomData);
            needLoad = ['TuiTongZi'];
            Global.Tools.loadRes(needLoad, function () {
                Global.DialogManager.createDialog("TuiTongZi/TTZMainDialog", null, function() {
                    Global.DialogManager.removeLoadingCircle();
                    Global.DialogManager.destroyDialog('Hall/HallDialog');
                });
            });
        }

        // if (Global.GameTypes.getCurrentKind() !== entryRoomData.kindId) {
        //     Global.DialogManager.addPopDialog('您已在游戏房间中，请先解散再加入别的游戏房间！');
        // }
	},

    onBtnClk: function (event, param) {
        cc.log(param);
        switch (param) {
            case 'share':
            case 'recharge':
            case 'tikuan':
            case 'person':
            case 'commission':
            case 'hall':
                this.showGroup(param);
                break;
            case 'match':
                Global.DialogManager.addTipDialog('敬请期待！');
                break;
            case 'logout':
                Global.NetworkLogic.disconnect(function () {
                    Global.DialogManager.destroyDialog(this);
                    Global.DialogManager.createDialog('Login/LoginDialog');
                }.bind(this));
                break;
        }

        // Global.AudioManager.playCommonSoundClickButton();
    },
    
    update: function (dt) {
        if (!!this.backHallGroup && this.backHallGroup.active) {
            this.backHallBtn.y = this.otherGroup.height - 47;
        }
    }
});
