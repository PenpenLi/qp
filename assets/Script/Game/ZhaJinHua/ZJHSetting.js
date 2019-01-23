var DialogManager = require('../../Shared/DialogManager');
var Player = require('../../Models/Player');
var AudioManager = require('../../Shared/AudioManager');
var NetworkLogic = require('../../Shared/NetworkLogic');

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

        nickname: cc.Label,
        musicBtn_close: cc.Node,
        musicBtn_open: cc.Node,
        soundBtn_close: cc.Node,
        soundBtn_open: cc.Node
    },

    onBtnClk: function (event, param) {
        AudioManager.playCommonSoundClickButton();

        switch (param) {
            case 'switchAccount':
                DialogManager.destroyAllDialog();
                NetworkLogic.disconnect();
                DialogManager.createDialog('UIPrefabs/MainDialog');
                break;
            case 'music_close':
                this.musicBtn_close.active = false;
                this.musicBtn_open.active = true;
                AudioManager.setMusicOn();
                break;
            case 'music_open':
                this.musicBtn_close.active = true;
                this.musicBtn_open.active = false;
                AudioManager.setMusicOff();
                break;
            case 'sound_close':
                this.soundBtn_close.active = false;
                this.soundBtn_open.active = true;
                AudioManager.setSoundOn();
                break;
            case 'sound_open':
                this.soundBtn_close.active = true;
                this.soundBtn_open.active = false;
                AudioManager.setSoundOff();
                break;
            case 'back':
                DialogManager.destroyDialog("ZhaJinHua/UIPrefabs/ZJHSetting");
                break;
        }
    },

    // use this for initialization
    onLoad: function () {
        this.nickname.string = Player.getNickname();

        if (!AudioManager.isMusicEnabled) {
            this.musicBtn_close.active = true;
            this.musicBtn_open.active = false;
        }

        if (!AudioManager.isSoundEnabled) {
            this.soundBtn_close.active = true;
            this.soundBtn_open.active = false;
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
