var ZJHModel = require('./ZJHModel');
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

        contentBg: cc.Sprite,
        cardBg: cc.Sprite,

        value: cc.Sprite,
        color: cc.Sprite,
        other: cc.Sprite
    },

    getColorImg: function (data) {
        return 'ZhaJinHua/CardImg/c' + ZJHModel.getCardColorValue(data);
    },

    getColor: function (data) {
        var colorValue = ZJHModel.getCardColorValue(data);
        if (colorValue === 2 || colorValue === 0) {
            return ZJHModel.COLOR.red;
        } else {
            return ZJHModel.COLOR.black;
        }
    },

    getOtherImg: function (data) {
        var logicValue = ZJHModel.getCardLogicValue(data);
        var colorValue = ZJHModel.getCardColorValue(data);
        if (logicValue > 10) {
            return 'ZhaJinHua/CardImg/v' + logicValue + 'c' + colorValue;
        } else {
            return 'ZhaJinHua/CardImg/c' + colorValue;
        }
    },

    getValueImg: function (data) {
        return 'ZhaJinHua/CardImg/v' + ZJHModel.getCardLogicValue(data);
    },

    showKaBei: function () {
        this.contentBg.node.active = false;
        this.cardBg.node.active = true;
    },

    setData: function (data) {
        this.contentBg.node.active = true;

        this.value.node.color = this.getColor(data);
        CommonFunctions.updateSpriteFrame(this.getValueImg(data), this.value);
        CommonFunctions.updateSpriteFrame(this.getColorImg(data), this.color);
        CommonFunctions.updateSpriteFrame(this.getOtherImg(data), this.other);

        this.cardBg.node.active = false;
    },

    // use this for initialization
    onLoad: function () {

    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
