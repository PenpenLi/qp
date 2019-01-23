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
        label: cc.Label
    },

    // use this for initialization
    onLoad: function () {

    },

    onBtnClk: function (event, param) {
        cc.log(param);
        switch (param) {
            case 'select':
                if (!!this.callback) {
                    this.callback(this.index);
                }
                break;
        }
    },

    updateUI: function (data) {
        this.text = data.text;
        this.index = data.index;
        this.label.string = data.text;
        if (!!data.callback) {
            this.callback = data.callback;
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
