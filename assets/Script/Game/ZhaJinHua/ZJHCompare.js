var ZJHAudio = require('./ZJHAudio');

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

        chairPos: cc.Node,
        comparePos: cc.Node,
        pkUIGroup: cc.Node,
        mask: cc.Node
    },
    
    startCompare: function (data) {
        this.callback = null;
        var chair = data.chair;
        var compareChair = data.compareChair;
        if (!!data.callback) {
            this.callback = data.callback;
        }

        this.mask.runAction(cc.fadeTo(0.3, 255 * 0.6));

        this.chairAnimation(chair, false, data.loserchairId);
        this.chairAnimation(compareChair, true, data.loserchairId);
    },

    chairAnimation: function (chair_, isCompare, loserchairId) {
        var originalParent = chair_.parent;
        var originalPos = {x: chair_.x,  y: chair_.y};
        var chair = chair_;

        var actions = [];
        actions[actions.length] = cc.callFunc(function () {
            chair.parent = this.node;
            chair.x = originalParent.x;
            chair.y = originalParent.y;
        }.bind(this));
        actions[actions.length] = cc.scaleTo(0.2, 1.5, 1.5);
        actions[actions.length] = cc.delayTime(0.2);
        actions[actions.length] = cc.scaleTo(0.2, 1, 1);
        actions[actions.length] = cc.callFunc(function () {
            if (!!isCompare) {
                this.node.getComponent(cc.Animation).play('compare');
                this.pkUIGroup.active = true;
            }
        }.bind(this));

        var destPos = {
            x: this.chairPos.x,
            y: this.chairPos.y
        };
        if (!!isCompare) {
            destPos = {
                x: this.comparePos.x,
                y: this.comparePos.y
            }
        }

        actions[actions.length] = cc.moveTo(0.2, destPos.x, destPos.y).easing(cc.easeBackIn());
        actions[actions.length] = cc.delayTime(0.2);
        if (chair.getComponent('ZJHChair').chairId === loserchairId) {
            actions[actions.length] = cc.callFunc(function () {
                ZJHAudio.compareDian();

                chair.getComponent('ZJHChair').showLoseEff();
            }.bind(this));
        }
        actions[actions.length] = cc.delayTime(2);
        actions[actions.length] = cc.callFunc(function () {
            chair.parent = originalParent;
            chair.x -= originalParent.x;
            chair.y -= originalParent.y;

            if (!!isCompare) {
                this.node.active = false;
            }
        }.bind(this));
        actions[actions.length] = cc.moveTo(0.2, originalPos.x, originalPos.y);

        actions[actions.length] = cc.callFunc(function () {
            if (!!isCompare) {
                this.animationEnd();
            }
        }.bind(this));

        var sequence = cc.sequence(actions);
        chair.runAction(sequence);
    },

    animationEnd: function () {
        if (!!this.callback) {
            this.callback();
        }
    },

    // use this for initialization
    onLoad: function () {
        this.pkUIGroup.active = false;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
