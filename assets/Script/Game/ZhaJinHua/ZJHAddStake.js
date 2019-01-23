var proto = require('./API/Protos/GameProtoZJH');
var api = require('./API/ZJHAPI');
var ZJHModel = require('./ZJHModel');
var ZJHAudio = require('./ZJHAudio');
var Player = require('../../Models/Player');

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

        //加注数值显示
        stakeLevelLabel: {
            type: [cc.Label],
            default: []
        },

        //4个加注按钮
        addStakeBtn: {
            type: [cc.Button],
            default: []
        }
    },

    onBtnClk: function (event, param) {
        if (this.currentStakeLevel < parseInt(param[param.length - 1])) {
            if (parseInt(param[param.length - 1]) === 4) {
                ZJHAudio.jiaZhuMax();
            } else {
                ZJHAudio.jiaZhu();
            }
        } else {
            ZJHAudio.genZhu();
        }

        switch (param) {
            case 'stakeLevel1':
                api.stake(1);
                break;
            case 'stakeLevel2':
                api.stake(2);
                break;
            case 'stakeLevel3':
                api.stake(3);
                break;
            case 'stakeLevel4':
                api.stake(4);
                break;
        }

        this.node.parent.getComponent('ZhaJinHuaDialog').chairs[ZJHModel.getSelfchairId()].getComponent('ZJHChair').operation.getComponent('ZJHOperation').showNormalOperationUI();
    },

    setStakeLevelNum: function (param) {
        var currentMultiple = param.currentMultiple || 1;
        var currentStakeLevel = param.currentStakeLevel || 0;

        for (var i = 0; i < this.stakeLevelLabel.length; i ++) {
            this.stakeLevelLabel[i].string = proto.STAKE_LEVEL[i + 1] * currentMultiple;
            if (i < currentStakeLevel - 1) {
                this.addStakeBtn[i].interactable = false;
            }

            if (ZJHModel.isFangKa()) {
                //上限控制是否可以下此注
                var gameRule = ZJHModel.getGameRule();
                if (gameRule.danzhu < proto.STAKE_LEVEL[i + 1]) {
                    this.addStakeBtn[i].interactable = false;
                }
            } else {
                if (proto.STAKE_LEVEL[i + 1] * currentMultiple >= Player.getGold()) {
                    this.addStakeBtn[i].interactable = false;
                }
            }
        }

        this.currentStakeLevel = currentStakeLevel;
    },

    // use this for initialization
    onLoad: function () {

    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
