var ZJHModel = require('./ZJHModel');
var AudioManager = require('../../Shared/AudioManager');

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

        backGroup: cc.Node,
        backArrow: cc.Node
    },

    onBtnClk: function (event, param) {
        AudioManager.playCommonSoundClickButton();

        switch (param) {
            case 'back':
                this.show = !this.show;

                if (this.show) {
                    this.showBackGroup();
                } else {
                    this.hideBackGroup();
                }
                break;
            case 'leave':
                //离开时弃牌+离开房间
                if (!!ZJHModel.gameIsPlaying()) {
                    Global.DialogManager.addTipDialog('请先结束本局之后再解散房间！');
                    return;
                    // ZJHAPI.giveUp();
                }
                this.node.parent.getComponent('ZhaJinHuaDialog').leaveRoom();
                break;
            case 'cardType':
                Global.DialogManager.createDialog('RoomControl/RoomRuleDialog', {gameRule: ZJHModel.getGameRule(), kindId: Global.Enum.gameType.ZJH});
                // Global.NetworkManager.disconnect();
                break;
        }
    },

    showBackGroup: function () {
        this.backArrow.runAction(cc.rotateBy(0.2, 180, 180));
        this.backGroup.runAction(cc.moveTo(0.2, this.originalPos.x, this.originalPos.y - 280));
    },

    hideBackGroup: function () {
        this.backArrow.runAction(cc.rotateBy(0.1, 180, 180));
        this.backGroup.runAction(cc.moveTo(0.2, this.originalPos.x, this.originalPos.y));
    },

    // use this for initialization
    onLoad: function () {
        this.show = false;
        this.originalPos = {x: this.backGroup.x, y: this.backGroup.y};
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
