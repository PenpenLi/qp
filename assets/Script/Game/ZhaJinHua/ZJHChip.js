var proto = require('./API/Protos/GameProtoZJH');
var CommonFunctions = require('../../Shared/CommonFunctions');

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

        numLabel: cc.Label,
        chipBg: cc.Sprite
    },

    getStakeImg: function (stakeNum) {
        if (stakeNum <= 100) {
            return 'ZhaJinHua/UIImg/chip_green';
        } else if (stakeNum <= 200) {
            return 'ZhaJinHua/UIImg/chip_blue';
        } else if (stakeNum <= 500) {
            return 'ZhaJinHua/UIImg/chip_yellow';
        } else if (stakeNum <= 1000) {
            return 'ZhaJinHua/UIImg/chip_red';
        } else if (stakeNum <= 2000) {
            return 'ZhaJinHua/UIImg/chip_purple';
        } else {
            return 'ZhaJinHua/UIImg/chip_gold';
        }
    },

    setStakeNum: function (data) {
        var stakeLevel = data.stakeLevel || 0;
        var multiple = data.multiple || 1;

        var stakeNum = proto.STAKE_LEVEL[stakeLevel] * multiple;
        this.numLabel.string = stakeNum;

        CommonFunctions.updateSpriteFrame(this.getStakeImg(stakeNum), this.chipBg);
    },

    // use this for initialization
    onLoad: function () {

    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
