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
        bg: cc.Node,
        img: cc.Sprite
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        let scaleX = cc.winSize.width / this.bg.width;
        let scaleY = cc.winSize.height / this.bg.height;
        this.bg.scale = scaleX < scaleY?scaleX:scaleY;

        Global.DialogManager.addLoadingCircle();
        this.img.node.active = false;

        let url = Global.Tools.httpGetQRCodeWithUrl + '?uid=' + Global.Player.getPy('uid');
        Global.Tools.updateServerImg(url, this.img, function () {
            Global.DialogManager.removeLoadingCircle();
            this.img.node.active = true;
        }.bind(this));
    },

    onBtnClk (event, param) {
        cc.log(param);
        switch (param) {
            case 'close':
                Global.DialogManager.destroyDialog(this);
                break;
        }
    }

    // update (dt) {},
});
