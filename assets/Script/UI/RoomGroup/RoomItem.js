// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        roomBgImg: cc.Sprite,
        minGoldText: cc.Label,
        baseScoreText: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    updateUI (data) {
        this.data = data;

        this.minGoldText.string = data.goldLowerLimit;
        this.baseScoreText.string = data.baseScore;
        Global.Tools.updateSpriteFrame('Hall/room_' + data.level, this.roomBgImg);
    },

    onBtnClk () {
        cc.log(this.data);
        if (Global.Player.getPy('gold') < this.data.goldLowerLimit) {
            Global.DialogManager.addTipDialog('您携带的金币不足，无法进入！');
            return;
        }
        Global.API.hall.matchRoomRequest(this.data.gameTypeID);
    }

    // update (dt) {},
});
