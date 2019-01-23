var DialogManager = require('../../Shared/DialogManager');
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
    },

    // use this for initialization
    onLoad: function () {

    },

    onBtnClk: function (event, param) {
        AudioManager.playCommonSoundClickButton();

        switch (param) {
            case 'back':
                DialogManager.destroyDialog('ZhaJinHua/UIPrefabs/ZJHRichList');
                break;
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
