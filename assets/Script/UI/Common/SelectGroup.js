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
        content: cc.Node,
        bg: cc.Node,
        selectItem: cc.Prefab
    },

    // use this for initialization
    onLoad: function () {

    },

    onBtnClk: function (event, param) {
        cc.log(param);
        switch (param) {
            case 'back':
                if (!!this.callback) {
                    this.callback(null);
                }

                this.node.destroy();
                break;
        }
    },
    
    updateUI: function (data) {
        this.callback = data.callback;

        this.bg.width = data.width;
        this.bg.x = data.pos.x;
        this.bg.y = data.pos.y;
        this.bg.height = 250;

        var selectText = data.selectText;
        for (var i = 0; i < selectText.length; i ++) {
            var item = cc.instantiate(this.selectItem);
            item.parent = this.content;
            item.getComponent('SelectItem').updateUI({text: selectText[i], index: i, callback: function (index) {
                if (!!data.callback) {
                    data.callback(index);
                }
                this.node.destroy();
            }.bind(this)});
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
