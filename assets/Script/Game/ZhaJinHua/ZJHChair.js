let proto = require('./API/Protos/GameProtoZJH');
let CommonFunctions = require('../../Shared/CommonFunctions');
let ZJHModel = require('./ZJHModel');
let RoomAPI = require('../../API/RoomAPI');

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
        avatarImg: cc.Sprite,
        nameLabel: cc.Label,
        goldNum: cc.Label,
        statusBg: cc.Sprite,
        statusLabel: cc.Label,
        firstXiaZhuUI: cc.Sprite,
        loseMask: cc.Sprite,
        winResultPrefab: cc.Prefab,
        cardGroup: cc.Node,
        readyGroup: cc.Node,
        operationPrefab: cc.Prefab,
        offLineNode: cc.Node,
        goldChangeEff: cc.Label,
        timeBg: cc.Node,
        timeText: cc.Label
    },

    showGoldChangeEff: function (str) {
        this.goldChangeEff.string = str;
        this.goldChangeEff.node.active = true;
        setTimeout(function () {
            this.goldChangeEff.node.active = false;
        }.bind(this), 2000);
    },

    showOffLine: function () {
        this.offLineNode.active = true;
    },

    hideOffLine: function () {
        this.offLineNode.active = false;
    },

    clear: function () {
        this.giveUpStatus = false;
        this.loseStatus = false;
        this.lookCardStatus = false;
        this.statusLabel.node.active = false;
        this.firstXiaZhuFlag = false;
        this.firstXiaZhuUI.node.active = false;
        this.statusBg.node.active = false;
        this.loseMask.node.active = false;
        this.cardGroup.active = false;
        this.hideOffLine();

        if (!!this.winResultUI) {
            this.winResultUI.destroy();
            this.winResultUI = null;
        }

        if (this.canDealCard()) {
            this.createOperationUI();
        }

        if (this.chairId === ZJHModel.getSelfchairId()) {
            if (!!this.operation) {
                this.operation.getComponent('ZJHOperation').showNormalOperationUI();
                this.operation.getComponent('ZJHOperation').reSet();
            }
        }

        this.hideReadyGroup();
    },

    startCountDown: function () {
        cc.log('开始准备倒计时');

        let time = 20;
        this.timeText.string = time;
        this.countDown = setInterval(function () {
            time -= 1;
            if (time >= 0) {
                this.timeText.string = time;
            } else {
                if (this.readyGroup.getChildByName('readyBtn').active) {
                    Global.API.room.roomMessageNotify(Global.API.roomProto.getAskForDismissNotifyData());
                }
                this.stopCountDown();
            }
        }.bind(this), 1000);
    },

    stopCountDown: function () {
        cc.log('停止准备倒计时');

        if (!!this.countDown) {
            clearInterval(this.countDown);
            this.countDown = null;
        }
    },

    showReadyGroup: function () {
        if (this.canDealCard() && ZJHModel.isFangKa()) {
            if (this.userInfo.uid === Global.Player.getPy('uid')) {
                this.showReadyBtn();
                this.startCountDown();
            }
        }
    },

    hideReadyGroup: function () {
        this.readyGroup.getChildByName('readyLabel').active = false;
        this.readyGroup.getChildByName('readyBtn').active = false;
        this.stopCountDown();
    },

    showReadyLabel: function () {
        this.readyGroup.getChildByName('readyLabel').active = true;
    },
    
    showReadyBtn: function () {
        this.readyGroup.getChildByName('readyBtn').active = true;
    },

    onReadyBtnClk: function () {
        this.showReadyLabel();
        this.readyGroup.getChildByName('readyBtn').active = false;
        Global.API.room.roomMessageNotify(Global.API.roomProto.userReadyNotify(true));
        this.stopCountDown();
    },

    showCardGroup: function (haveGoldFrame) {
        this.cardGroup.active = true;
        this.loseMask.node.active = false;
        if (!!haveGoldFrame) {
            this.cardGroup.getChildByName('frame').active = true;
        }
        this.hideOther();
    },

    changeGoldNum: function (goldNum) {
        if (!!this.userInfo) {
            goldNum += this.userInfo.gold;
        }
        this.goldNum.string = CommonFunctions.formatNumberWithSD(goldNum, 4);
        this.goldNum.string = goldNum.toFixed(2);
    },

    updateUserInfo: function (userInfo) {
        this.userInfo = userInfo;
    },



    updateUI: function (data, posID) {
        this.userInfo = data.userInfo;
        this.chairId = data.chairId;

        //头像设置
        Global.Tools.updateSpriteFrame(this.userInfo.avatar, this.avatarImg.node.getComponent(cc.Sprite));

        //名字
        let nickname = this.userInfo.nickname;
        if (!!nickname) {
            nickname = Global.Tools.convertNickname(nickname);
            this.nameLabel.string = nickname;
            if (this.nameLabel.node.width > 100) {
                this.nameLabel.string = '';
                for (let i = 0; i < nickname.length; i ++) {
                    this.nameLabel.string += nickname[i];
                    if (this.nameLabel.node.width >= 60) {
                        this.nameLabel.string += '...';
                        break;
                    }
                }
            }
        }

        //金钱
        if (this.userInfo.gold !== null) {
            this.goldNum.string = CommonFunctions.formatNumberWithSD(this.userInfo.gold, 4);
            if (ZJHModel.isFangKa()) {
                this.goldNum.string = this.userInfo.gold.toFixed(2);
            }
        }

        //操作界面
        if (this.userInfo.uid === Global.Player.getPy('uid')) {
            this.createOperationUI();
            this.readyGroup.y = 250;
            this.readyGroup.getChildByName('readyLabel').y = 0;
        }

        if (posID === ZJHModel.POS_RIGHT_TOP || posID === ZJHModel.POS_RIGHT_BOTTOM) {
            this.statusBg.node.scaleX = -1;
            this.statusBg.node.x = -100;
            this.statusLabel.node.x = -100;

            this.firstXiaZhuUI.node.x = -120;
        } else if (posID === ZJHModel.POS_TOP) {
            this.firstXiaZhuUI.node.x = 0;
            this.firstXiaZhuUI.node.y = -100;
        } else if (posID === ZJHModel.POS_BOTTOM) {
            this.firstXiaZhuUI.node.x = 0;
            this.firstXiaZhuUI.node.y = 100;
        }
    },

    showStatus: function (data) {
        this.statusBg.node.active = true;
        this.statusLabel.node.active = true;

        if (data.status === proto.LOOK_CARD && !this.giveUpStatus && !this.loseStatus) {
            this.lookCardStatus = true;
            Global.Tools.updateSpriteFrame('ZhaJinHua/UIImg/pop_light', this.statusBg);
            this.statusLabel.string = "已看牌";
            this.statusLabel.node.color = cc.Color.BLACK;
        } else if (data.status === proto.GIVE_UP) {
            this.giveUpStatus = true;
            Global.Tools.updateSpriteFrame('ZhaJinHua/UIImg/pop_mask', this.statusBg);
            this.statusLabel.string = "弃牌";
            this.statusLabel.node.color = cc.Color.WHITE;
        } else if (data.status === proto.LOSE) {
            this.loseStatus = true;
            Global.Tools.updateSpriteFrame('ZhaJinHua/UIImg/pop_mask', this.statusBg);
            this.statusLabel.string = "输";
            this.statusLabel.node.color = cc.Color.WHITE;
        }
    },

    showFirstXiaZhu: function (chairId) {
        this.firstXiaZhuFlag = true;
        this.firstXiaZhuUI.node.active = true;

        if (chairId === 0 || !!chairId) {
            this.checkIsMyTurn({chairId: chairId, stakeLevel: 0});
        }
    },

    checkIsMyTurn: function (data) {
        if (this.userInfo.uid === Global.Player.getPy('uid')) {
            this.operation.getComponent('ZJHOperation').updateStakeLevel(data);
            if (this.chairId === data.chairId) {
                this.operation.getComponent('ZJHOperation').showSpecialOperationUI();
            }
        }
    },

    createOperationUI: function () {
        if (this.userInfo.uid === Global.Player.getPy('uid')) {
            if (!!this.operation) {
                this.operation.active = !this.loseStatus && !this.giveUpStatus;
            } else {
                let operation = cc.instantiate(this.operationPrefab);
                operation.parent = this.node;
                this.operation = operation;
                this.operation.active = false;
            }
        }
    },

    hideOperationUI: function () {
        if (this.userInfo.uid === Global.Player.getPy('uid')) {
            this.operation.active = false;
        }
    },

    showResult: function (data) {
        console.log(data);
        if (data && data.winnerchairId === this.chairId) {
            this.winResultUI = cc.instantiate(this.winResultPrefab);
            this.winResultUI.parent = this.node;
            this.winResultUI.y = 100;

            if (data.winnerCardType === proto.CARD_TYPE_ZASE_235) {
                this.winResultUI.getComponent('ZJHResultUI').showWinType(proto.CARD_TYPE_DAN_ZHANG);
            } else {
                this.winResultUI.getComponent('ZJHResultUI').showWinType(data.winnerCardType);
            }
        } else {
            this.showStatus({status: proto.LOSE});
        }
    },

    showLoseEff: function () {
        this.node.getComponent(cc.Animation).play('loseEff');
        this.scheduleOnce(function () {
            this.loseMask.node.active = true;
            this.loseMask.node.opacity = 0;

            this.loseMask.node.runAction(cc.fadeTo(0.3, 200));
        }, 1);
    },

    isPlayingGame: function () {
        return this.canDealCard() && this.userInfo && !(this.loseStatus || this.giveUpStatus);
    },

    canCompare: function () {
        return this.lookCardStatus && this.canDealCard() && this.userInfo && !(this.userInfo.uid === Global.Player.getPy('uid') || this.loseStatus || this.giveUpStatus);
    },

    hideOther: function () {
        this.statusBg.node.active = false;
        this.statusLabel.node.active = false;
        this.firstXiaZhuUI.node.active = false;
    },

    showOther: function () {
        if (this.lookCardStatus || this.loseStatus) {
            this.statusBg.node.active = true;
            this.statusLabel.node.active = true;
        }

        if (this.firstXiaZhuFlag) {
            this.firstXiaZhuUI.node.active = true;
        }
    },

    canDealCard: function () {
        return this.node.active;
    },

    getEntryLeaveXY: function () {
        let x = 0;
        let y = 0;
        let posID = this.node.posID;
        if (posID === ZJHModel.POS_LEFT_TOP || posID === ZJHModel.POS_LEFT_BOTTOM) {
            x = -100;
        } else if (posID === ZJHModel.POS_RIGHT_TOP || posID === ZJHModel.POS_RIGHT_BOTTOM) {
            x = 100;
        } else if (posID === ZJHModel.POS_TOP) {
            y = 100;
        }

        return {x: x, y: y};
    },

    userLeave: function () {
        let dest = this.getEntryLeaveXY();
        let actions = [];
        actions[actions.length] = cc.spawn([cc.moveTo(0.5, dest.x, dest.y), cc.fadeOut(0.5)]);
        actions[actions.length] = cc.callFunc(function () {
            this.node.active = false;
        }.bind(this));
        this.node.runAction(cc.sequence(actions));
    },

    userEntry: function (userInfo) {
        this.clear();
        this.loseStatus = true;

        let startPos = this.getEntryLeaveXY();
        this.node.x = startPos.x;
        this.node.y = startPos.y;

        this.updateUI(userInfo, this.node.posID);
        this.node.active = true;
        this.node.opacity = 0;
        this.node.runAction(cc.spawn([cc.moveTo(0.5, 0, 0), cc.fadeIn(0.5)]));
    },

    // use this for initialization
    onLoad: function () {
        this.firstXiaZhuFlag = false;
        this.hideOffLine();
    },

    onDestroy: function () {
        this.stopCountDown();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
