var api = require('./API/ZJHAPI');
var ZJHModel = require('./ZJHModel');
var CommonFunctions = require('../../Shared/CommonFunctions');
var ZJHAudio = require('./ZJHAudio');
var ZJHProto = require('./API/Protos/GameProtoZJH');

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

        card: cc.Prefab,
        lookCardBtn: cc.Button,
        showCardBtn: cc.Button,
        cardTypeSprite: cc.Sprite
    },

    hideAllBtns: function () {
        this.lookCardBtn.node.active = false;
        this.showCardBtn.node.active = false;
    },

    showLookBtn: function () {
        this.lookCardBtn.node.active = true;
        this.showCardBtn.node.active = false;
    },

    showShowBtn: function () {
        this.lookCardBtn.node.active = false;
        this.showCardBtn.node.active = true;
    },

    onBtnClk: function (event, param) {
        if (param === "lookCard") {
            ZJHAudio.kanPai();

            api.lookCard();
        } else if (param === "showCard") {
            api.showdown();
        }

        this.hideAllBtns();
    },

    //看牌
    showCards: function (data) {
        //若要把牌show出来，则在头像上显示
        if (!!data && data.showType && data.showType === 'showdown') {
            this.node.opacity = 255;
            this.node.x = 0;
            this.node.y = 15;
            this.setCardsPos(25);

            for (i = 0; i < this.cards.length; i ++) {
                this.cards[i].scale = 0.95;
            }

            this.cardTypeSprite.node.y = this.cardTypeSprite.node.y - 30;
        } else {
            if (this.alreadyShowCardsStatus) {
                return;
            }
        }

        if (data.cards) {
            for (var i = 0; i < data.cards.length; i ++) {
                this.cards[i].getComponent('ZJHCard').showKaBei();
                this.cardAnimation(this.cards[i], data.cards[i]);
                this.alreadyShowCardsStatus = true;
            }
        }

        this.scheduleOnce(function () {
            if (this.chairId === ZJHModel.getSelfchairId() && data.cardType) {
                ZJHAudio.foldPai();

                this.cardTypeSprite.node.active = true;

                if (data.cardType === ZJHProto.CARD_TYPE_ZASE_235) {
                    CommonFunctions.updateSpriteFrame('ZhaJinHua/UIImg/card_type_' + ZJHProto.CARD_TYPE_DAN_ZHANG, this.cardTypeSprite);
                } else {
                    CommonFunctions.updateSpriteFrame('ZhaJinHua/UIImg/card_type_' + data.cardType, this.cardTypeSprite);
                }
            }
        }.bind(this), 0.5);
    },

    cardAnimation: function (card, cardData) {
        var originalPos = {x: card.x, y: card.y};
        var originalScale = {x: card.scaleX, y: card.scaleY};
        var actions = [];
        actions[actions.length] = cc.moveTo(0.2, -this.cardOffsetX, originalPos.y);
        actions[actions.length] = cc.spawn([cc.scaleTo(0.1, 0.1, originalScale.y), cc.moveTo(0.1, -this.cardOffsetX, originalPos.y + 10)]);
        actions[actions.length] = cc.callFunc(function () {
            card.getComponent('ZJHCard').setData(cardData);
        }.bind(this));
        actions[actions.length] = cc.spawn([cc.scaleTo(0.1, originalScale.x, originalScale.y), cc.moveTo(0.1, -this.cardOffsetX, originalPos.y)]);
        actions[actions.length] = cc.moveTo(0.3, originalPos.x, originalPos.y).easing(cc.easeBackOut());
        card.runAction(cc.sequence(actions));
    },

    //发牌动画
    setPos: function (posID, chairId) {
        this.chairId = chairId;
        this.posID = posID;

        var destScale = 0.5;
        if (chairId === ZJHModel.getSelfchairId()) {
            this.setCardsPos(42);
            destScale = 1;
        } else {
            this.hideAllBtns();
        }

        switch (posID) {
            case ZJHModel.POS_BOTTOM:
                this.node.y = -130;
                break;
            case ZJHModel.POS_RIGHT_BOTTOM:
                this.node.x = -100;
                break;
            case ZJHModel.POS_RIGHT_TOP:
                this.node.x = -100;
                break;
            case ZJHModel.POS_TOP:
                this.node.x = 100;
                break;
            case ZJHModel.POS_LEFT_TOP:
                this.node.x = 100;
                break;
            case ZJHModel.POS_LEFT_BOTTOM:
                this.node.x = 100;
                break;
        }

        for (var i = 0; i < this.cards.length; i ++) {
            var destX = this.cards[i].x;
            var destY = this.cards[i].y;

            this.cards[i].x = -ZJHModel.chairPos[posID].x - this.node.x;
            this.cards[i].y = -ZJHModel.chairPos[posID].y - this.node.y;

            var durTime = 0.3;
            var actions = [];
            actions[actions.length] = cc.delayTime(0.3 * i);
            actions[actions.length] = cc.callFunc(function () {
                if (chairId === ZJHModel.getSelfchairId()) {
                    ZJHAudio.faPai();
                }
            }.bind(this));
            actions[actions.length] = cc.spawn([cc.moveTo(durTime, destX, destY), cc.scaleTo(durTime, destScale, destScale), cc.rotateBy(durTime, 360, 360)]);
            this.cards[i].runAction(cc.sequence(actions));
        }

        this.node.active = true;
    },

    giveUpCardAnimation: function (card, i) {
        var originalScale = {x: card.scaleX, y: card.scaleY};
        var originalPos = {x: card.x, y: card.y};
        var actions = [];
        var time = 0.5;
        actions[actions.length] = cc.delayTime(i * 0.1);
        actions[actions.length] = cc.spawn([cc.rotateBy(time, 360, 360), cc.moveTo(time, 0, -2 * ZJHModel.chairPos[this.posID].y).easing((cc.easeSineOut())), cc.scaleTo(time, 0.5, 0.5)]);
        actions[actions.length] = cc.callFunc(function () {
            card.scale = originalScale.x;
            card.y = originalPos.y - 200;
            card.x = originalPos.x;
        });
        actions[actions.length] = cc.delayTime((2 - i) * 0.1);
        actions[actions.length] = cc.moveTo(time, originalPos.x, originalPos.y);

        if (i === this.cards.length - 1) {
            actions[actions.length] = cc.callFunc(function () {
                this.giveUpCardAnimationCb();
            }.bind(this))
        }

        card.runAction(cc.sequence(actions));
    },

    giveUpCardAnimationCb: function () {
        if (!!this.giveUpCb) {
            this.giveUpCb();
        }
    },

    giveUpCards: function (data, cb) {
        if (cb) {
            this.giveUpCb = cb;
        }

        if (data.chairId === ZJHModel.getSelfchairId()) {
            for (var i = 0; i < this.cards.length; i ++) {
                this.giveUpCardAnimation(this.cards[i], i);
            }
        } else {
            var actions = [];
            actions[actions.length] = cc.spawn([cc.fadeOut(0.5), cc.moveTo(0.5, -ZJHModel.chairPos[this.posID].x, -ZJHModel.chairPos[this.posID].y).easing(cc.easeSineOut())]);
            actions[actions.length] = cc.callFunc(function () {
                this.giveUpCardAnimationCb();
            }.bind(this));
            this.node.runAction(cc.sequence(actions));
        }
    },

    createCards: function () {
        this.cards = [];
        for (var i = 0; i < 3; i ++) {
            var card = cc.instantiate(this.card);
            card.parent = this.node;
            card.x = (i - 1) * 15;
            card.scale = 0.5;
            card.zIndex = -1;

            this.cards[i] = card;
        }
    },

    setCardsPos: function (offsetX) {
        this.cardOffsetX = offsetX;
        for (var i = 0; i < this.cards.length; i ++) {
            this.cards[i].x = (i - 1) * offsetX;
        }
    },

    // use this for initialization
    onLoad: function () {
        this.createCards();
        this.showLookBtn();
        this.node.active = false;
        this.alreadyShowCardsStatus = false;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
