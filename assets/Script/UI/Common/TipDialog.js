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
        contentText: cc.Label
    },

    // use this for initialization
    onLoad: function () {
        if (!!this.dialogParameters && this.dialogParameters.content) {
            this.contentText.string = this.dialogParameters.content;
        }
    },

    onBtnClk: function (event, param) {
        cc.log(param);
        switch (param) {
            case 'back':
                if (!!this.dialogParameters && !!this.dialogParameters.cb) {
                    this.dialogParameters.cb();
                }

                Global.DialogManager.destroyDialog(this);
                break;
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
