var proto = require('./API/Protos/GameProtoZJH');
var ZJHModel = require('./ZJHModel');
var CommonFunctions = require('../../Shared/CommonFunctions');
var ZJHAudio = require('./ZJHAudio');

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

        chip: cc.Prefab,
        chipSumAmountLabel: cc.Label,
        roundLabel: cc.Label,
        poolInfoGroup: cc.Node
    },

    setChips: function (data) {
        var stakeArr = data.stakeArr;
        for (var i = 0; i < proto.MAX_ROUND; i ++) {
            for (var j = 0; j < stakeArr.length; j ++) {
                if (!!stakeArr[j] && !!stakeArr[j][i]) {
                    var chip = cc.instantiate(this.chip);
                    chip.parent = this.node;
                    chip.getComponent('ZJHChip').setStakeNum(stakeArr[j][i]);
                    chip.x = -this.node.width / 2 + Math.random() * this.node.width;
                    chip.y = -this.node.height / 2 + Math.random() * this.node.height;

                    this.chips[this.chips.length] = chip;
                }
            }
        }

        this.chipSumAmountLabel.string = data.goldSumAmount.toFixed(2);
        this.roundLabel.string = CommonFunctions.stringFormat('第{0}/{1}轮', data.round, proto.MAX_ROUND);
    },

    addChip: function (data, posID) {
        var chip = cc.instantiate(this.chip);
        chip.parent = this.node;
        chip.getComponent('ZJHChip').setStakeNum(data);

        chip.x = ZJHModel.chairPos[posID].x - this.node.x;
        chip.y = ZJHModel.chairPos[posID].y - this.node.y;

        var destX = -this.node.width / 2 + Math.random() * this.node.width;
        var destY = -this.node.height / 2 + Math.random() * this.node.height;

        chip.runAction(cc.moveTo(0.7, destX, destY).easing(cc.easeQuinticActionOut(1.0)));

        this.chips[this.chips.length] = chip;

        this.chipSumAmountLabel.string = data.goldSumAmount.toFixed(2);
        this.roundLabel.string = CommonFunctions.stringFormat('第{0}/{1}轮', data.round, proto.MAX_ROUND);
    },

    collectChips: function (posID) {
        for (var i = 0; i < this.chips.length; i ++) {
            var delay = cc.delayTime(0.2 + i * 0.02);
            var move = cc.moveTo(0.5, ZJHModel.chairPos[posID].x - this.node.x, ZJHModel.chairPos[posID].y - this.node.y).easing(cc.easeQuinticActionOut(1.0));
            var fadeOut = cc.fadeOut(0.1);
            var sequence = cc.sequence([delay, move, fadeOut]);

            this.chips[i].runAction(sequence);
        }

        ZJHAudio.shouJi();
    },

    showPoolInfoGroup: function () {
        this.poolInfoGroup.active = true;
    },

    hidePoolInfoGroup: function () {
        this.poolInfoGroup.active = false;
    },

    //移除所有筹码
    removeAllChips: function () {
        for (var i = 0; i < this.chips.length; i ++) {
            this.chips[i].destroy();
        }

        this.chips = [];
        this.hidePoolInfoGroup();
    },

    // use this for initialization
    onLoad: function () {
        this.chips = [];
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
