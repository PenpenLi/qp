var ZJHModel = require('./ZJHModel');
var api = require('./API/ZJHAPI');
var messageCallback = require('../../Shared/MessageCallback');
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

        touchFrame: cc.Prefab
    },

    addSelectEff: function (posID, chairId) {
        var touch = cc.instantiate(this.touchFrame);
        touch.parent = this.node;
        touch.getComponent(cc.Animation).play('selectEff');
        touch.x = ZJHModel.chairPos[posID].x;
        touch.y = ZJHModel.chairPos[posID].y;

        var offsetX = 55;
        if (posID === ZJHModel.POS_RIGHT_BOTTOM || posID === ZJHModel.POS_RIGHT_TOP) {
            touch.x += -offsetX;
            touch.getChildByName('anmi').x = -touch.getChildByName('anmi').x;
            touch.getChildByName('anmi').scaleX = -1;
        } else if (posID === ZJHModel.POS_LEFT_BOTTOM || ZJHModel.POS_LEFT_TOP || posID === ZJHModel.POS_TOP) {
            touch.x += offsetX;
        }

        touch.once(cc.Node.EventType.TOUCH_START, function (event) {
            ZJHAudio.compare();
            api.compare(chairId);
        })
    },

    // use this for initialization
    onLoad: function () {
        this.node.once(cc.Node.EventType.TOUCH_START, function (event) {
            messageCallback.emitMessage('endCompare');
        })
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
