let proto = require('./API/Protos/GameProtoZJH');
let messageCallback = require('../../Shared/MessageCallback');
let api = require('./API/ZJHAPI');
let ZJHAudio = require('./ZJHAudio');
let DialogManager = require('../../Shared/DialogManager');
let Player = require('../../Models/Player');
let ZJHModel = require('./ZJHModel');
let CommonFunctions = require('../../Shared/CommonFunctions');

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
        //主操作
        normalUI: cc.Node,
        specialUI: cc.Node,
        // addStakeUI: cc.Node,

        //当前显示加注数
        autoStakeNum: cc.Label,
        stakeNum: cc.Label,
        compareStakeNum: cc.Label,

        //自动加注
        autoLabel: cc.Label,
        autoEffImg: cc.Sprite,

        //比牌按钮
        compareBtn: cc.Button,

        timeBg: cc.Node,
        timeText: cc.Label
    },

    onBtnClk: function (event, param) {
        switch (param) {
            case 'giveUp':
                ZJHAudio.giveUp();

                api.giveUp();
                this.showNormalOperationUI();
                this.node.active = false;
                break;
            case 'stake':
                // 若金钱不足以下注，则孤注一掷和下家比牌，赢了继续比牌，输了直接GG
                if (!ZJHModel.isFangKa()) {
                    if (Player.getGold() <= proto.STAKE_LEVEL[this.currentStakeLevel] * this.currentMultiple) {
                        let dataStake = {
                            stakeNum: Player.getGold()
                        };
                        api.guzhuyizhi(dataStake);
                        return;
                    }
                }

                ZJHAudio.genZhu();

                api.stake(this.currentStakeLevel);
                this.showNormalOperationUI();
                break;
            case 'addStake':
                let data = {
                    active: true,
                    currentStakeLevel: this.currentStakeLevel,
                    currentMultiple: this.currentMultiple
                };
                messageCallback.emitMessage('onAddStakeBtnClk', data);
                break;
            case 'xuePin':
                DialogManager.addPopDialog('敬请期待');

                break;
            case 'autoStake':
                this.autoStake = !this.autoStake;
                if (this.autoStake) {
                    this.showAutoEff();
                } else {
                    this.hideAutoEff();
                }
                break;
            case 'compare':
                messageCallback.emitMessage('endCompare');
                messageCallback.emitMessage('onCompareBtnClk');
                messageCallback.emitMessage('onAddStakeBtnClk', {active: false});
                break;
        }
    },

    hideAutoEff: function () {
        this.autoLabel.string = '自动跟注';
        this.autoEffImg.node.stopAllActions();
        this.autoEffImg.node.active = false;
    },

    showAutoEff: function () {
        this.autoLabel.string = "取消自动";
        this.autoEffImg.node.active = true;
        this.autoEffImg.node.runAction(cc.repeatForever(cc.rotateBy(0.5, 180, 180)));
    },

    setAutoStake: function (autoStake) {
        this.autoStake = autoStake;
        this.autoLabel.string = '自动跟注';
    },

    showSpecialOperationUI: function () {
        if (this.autoStake) {
            setTimeout(function () {
                this.onBtnClk(null, 'stake');
            }.bind(this), 1000);
            return;
        }

        let anim = this.getComponent(cc.Animation);
        let animState = anim.play('showSpecialUI');
        animState.wrapMode = cc.WrapMode.Normal;

        this.startCountDown();
    },

    showNormalOperationUI: function () {
        this.stopCountDown();

        if (this.autoStake) {
            return;
        }

        messageCallback.emitMessage('onAddStakeBtnClk', {active: false});

        let anim = this.getComponent(cc.Animation);
        let animState = anim.play('showSpecialUI');
        animState.wrapMode = cc.WrapMode.Reverse;
    },

    updateStakeLevel: function (data) {
        data = data || {};
        this.currentStakeLevel = data.stakeLevel || this.currentStakeLevel;
        this.currentMultiple = data.multiple || this.currentMultiple;

        this.autoStakeNum.string = proto.STAKE_LEVEL[this.currentStakeLevel] * this.currentMultiple;
        this.stakeNum.string = proto.STAKE_LEVEL[this.currentStakeLevel] * this.currentMultiple;
        this.compareStakeNum.string = proto.STAKE_LEVEL[this.currentStakeLevel] * this.currentMultiple;

        // this.compareBtn.interactable = data.canCompare;
        this.compareBtn.interactable = true;
    },

    startCountDown: function () {
        cc.log('开始下注倒计时');

        this.timeBg.active = true;
        let time = 20;
        this.timeText.string = time;
        this.countDown = setInterval(function () {
            time -= 1;
            if (time >= 0) {
                this.timeText.string = time;
            } else {
                if (this.timeBg.active) {
                    this.onBtnClk(null, 'giveUp');
                }
                this.stopCountDown();
            }
        }.bind(this), 1000);
    },

    stopCountDown: function () {
        cc.log('停止下注倒计时');

        this.timeBg.active = false;
        if (!!this.countDown) {
            clearInterval(this.countDown);
            this.countDown = null;
        }
    },

    // use this for initialization
    onLoad: function () {
        this.reSet();
    },

    onDestroy: function () {
        this.stopCountDown();
    },

    reSet: function () {
        this.autoLabel.string = '自动加注';

        this.currentStakeLevel = 0;
        this.currentMultiple = 1;
        this.autoStake = false;
        this.timeBg.active = false;
        this.stopCountDown();

        this.hideAutoEff();
        this.updateStakeLevel({canCompare: true});
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
