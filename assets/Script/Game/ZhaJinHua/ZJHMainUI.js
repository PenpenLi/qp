var DialogManager = require('../../Shared/DialogManager');
var ZJHAudio = require('./ZJHAudio');
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

        meinv: cc.Node,
        btnGroup: cc.Node,
        backBtn: cc.Node
    },

    // use this for initialization
    onLoad: function () {
        this.gameBgMusic = ZJHAudio.gameBg();
        this.kindID = this.dialogParameters;
    },

    onDestroy: function () {
        AudioManager.stopBgMusic();
    },

    onBtnClk: function (event, param) {
        AudioManager.playCommonSoundClickButton();

        switch(param) {
            case 'create':
                DialogManager.createDialog("UIPrefabs/CreateRoomDialog", {kind: this.kindID, type: 'create'});
                break;
            case 'join':
                DialogManager.createDialog("UIPrefabs/CreateRoomDialog", {kind: this.kindID, type: 'join'});
                break;
            case 'freedom':
                DialogManager.createDialog("UIPrefabs/ChooseRoomDialog", this.kindID, function () {});

                this.meinv.active = false;
                this.btnGroup.active = false;
                this.backBtn.active = true;
                break;
            case 'more':
                DialogManager.addPopDialog('敬请期待！');
                break;
            case 'back':
                this.meinv.active = true;
                this.btnGroup.active = true;
                this.backBtn.active = false;
                DialogManager.destroyDialog("UIPrefabs/ChooseRoomDialog");
                break;
            case 'exit':
                var cbOK = function () {
                    cc.game.end();
                };
                var cbCancel = function () {};

                DialogManager.addPopDialog('确定要退出游戏吗？', cbOK, cbCancel);
                break;
            case 'settings':
                DialogManager.createDialog("ZhaJinHua/UIPrefabs/ZJHSetting");
                break;
            case 'guize':
                DialogManager.createDialog('ZhaJinHua/UIPrefabs/ZJHHelp');
                break;
            case 'paihangbang':
                DialogManager.createDialog('ZhaJinHua/UIPrefabs/ZJHRichList');
                break;
            case 'shop':
                DialogManager.addPopDialog('敬请期待！');
                break;
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
