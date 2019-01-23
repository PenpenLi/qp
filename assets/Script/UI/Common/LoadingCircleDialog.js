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
        circle: cc.Node
    },

    // use this for initialization
    onLoad: function () {

    },

    addLoadingCircle: function (delay){
        cc.log('显示loading');
        this.node.active = true;
        this.circle.stopAllActions();
        this.circle.runAction(cc.repeatForever(cc.rotateBy(2, 360, 360)));
    },

    removeLoadingCircle: function (){
        cc.log('移除loading');
        this.circle.stopAllActions();
        this.node.active = false;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
