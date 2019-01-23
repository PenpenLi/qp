var NNProto = require('./NNProto');
var RoomProto = require('../../API/RoomProto');
var NNLogic = require('./NNLogic');
var NNModel = require('./NNModel');

cc.Class({
    extends: cc.Component,

    properties: {
		cardsNode: cc.Node,
		cardSprite1: cc.Sprite,
		cardSprite2: cc.Sprite,
		cardSprite3: cc.Sprite,
		cardSprite4: cc.Sprite,
		cardSprite5: cc.Sprite,
		typeBackSprite: cc.Sprite,
		typeSprite: cc.Sprite
    },

    onLoad: function () {
		this.audioManager = this.node.parent.getComponent('NNMainDialog').getAudioManager();
		this.cardsNode.active = false;
		this.cardSpriteArr = [this.cardSprite1, this.cardSprite2, this.cardSprite3, this.cardSprite4, this.cardSprite5];
		this.typeBackSprite.node.active = false;
		Global.MessageCallback.addListener('RoomMessagePush', this);
		Global.MessageCallback.addListener('GameMessagePush', this);
    },

	offLineAndClient: function() {
		var gameStatus = NNModel.getGameStatus();
		var chairIndex = NNModel.getChairIdIndex(this.chairId);
		var cardArr, i;
		if(chairIndex < 0) { return; }
		if(gameStatus === NNProto.GAME_STATUS_ROBBANK || gameStatus === NNProto.GAME_STATUS_POURSCORE) {
			this.cardsNode.active = true;
			if(this.chairId === NNModel.getMyChairId()) {
				var myCardArr = NNModel.getMyCardArr();
				for(i = 0; i < 4; ++i) {
					Global.Tools.updateSpriteFrame('Niuniu/NNCards/'+myCardArr[i], this.cardSpriteArr[i]);
				}
				Global.Tools.updateSpriteFrame('Niuniu/NNCards/card_back', this.cardSpriteArr[4]);
			} else {
				for(i = 0; i < this.cardSpriteArr.length; ++i) {
					Global.Tools.updateSpriteFrame('Niuniu/NNCards/card_back', this.cardSpriteArr[i]);
				}
			}
		}
		else if(gameStatus === NNProto.GAME_STATUS_SORTCARD) {
			var showCardArr = NNModel.getShowCardArr();
			this.cardsNode.active = true;
			if(showCardArr[chairIndex] === 1) {
				cardArr = NNModel.getCardsArr()[chairIndex];
				this.showAllCardAndType(cardArr);
			} 
			else if(this.chairId === NNModel.getMyChairId()) {
				cardArr = NNModel.getCardsArr()[chairIndex];
				for(var j = 0; j < 4; ++j) {
					Global.Tools.updateSpriteFrame('Niuniu/NNCards/'+cardArr[j], this.cardSpriteArr[j]);
				}
				Global.Tools.updateSpriteFrame('Niuniu/NNCards/card_back', this.cardSpriteArr[4]);
			}
			else {
				for(i = 0; i < 5; ++i) {
					Global.Tools.updateSpriteFrame('Niuniu/NNCards/card_back', this.cardSpriteArr[i]);
				}
			}
		}
		else if(gameStatus === NNProto.GAME_STATUS_RESOUT) {
			cardArr = NNModel.getCardsArr()[chairIndex];
			this.showAllCardAndType(cardArr);
		}
	},

	messageCallbackHandler: function(router, msg) {
		if(! this.pos) {	return; }
		var myChairId = NNModel.getMyChairId();
		if(router === 'RoomMessagePush') {
			if(msg.type === RoomProto.USER_READY_PUSH) {
				this.answerUserReadyPush(msg.data.chairId);
			}
			else if(msg.type === RoomProto.USER_LEAVE_ROOM_PUSH) {
				this.answerUserLeavePush(msg.data.roomUserInfo.chairId);
			}
		}
		else if(router === 'GameMessagePush') {
			if(NNModel.getChairIdIndex(this.chairId) < 0) { return; }
			if(msg.type === NNProto.RESOUT_CARD_PUSH) {
				this.answerResoutCardPush(msg.data.chairId, msg.data.cardArr);
			}
			else if(msg.type === NNProto.GAME_RESOUT_PUSH) {
				this.answerResoutPush(msg.data.cardsArr);
			}
			else if(msg.type === NNProto.SHOW_CARD_PUSH) {
				this.answerShowCardPush(msg.data.chairId, msg.data.cardArr);
			}
			else if(msg.type === NNProto.FOUR_CARD_PUSH) {
				this.answerFourCardPush(msg.data.cardArr);
			}
		}
	},

	answerUserReadyPush: function(chairId) {
		if(chairId === NNModel.getMyChairId()) {
			this.cardsNode.active = false;
			this.typeBackSprite.node.active = false;
		}
	},

	answerUserLeavePush: function(chairId) {
		if(chairId === this.chairId) {
			this.cardsNode.active = false;
			this.typeBackSprite.node.active = false;
		}
	},

	answerResoutCardPush: function(chairId, cardArr) {
		var shangzhuang = NNModel.getGameRule().otherRule.shangzhuang;
		if(chairId === this.chairId && chairId === NNModel.getMyChairId()) {
			this.cardArr = cardArr;
		} else {
			if(shangzhuang !== NNLogic.rule.shangzhuang.mingpaiqiangzhuang) {
				this.cardArr = [0, 0, 0, 0, 0];
			}
		}
		//this.sendCard();
	},

	answerResoutPush: function(cardsArr) {
		var cardArr = cardsArr[NNModel.getChairIdIndex(this.chairId)];
		this.showAllCardAndType(cardArr);
	},

	answerShowCardPush: function(chairId, cardArr) {
		if(chairId === this.chairId) {
			this.showAllCardAndType(cardArr);
		}
	},

	answerFourCardPush: function(cardArr) {
		this.cardsNode.active = true;
		var myChairId = NNModel.getMyChairId();
		var offObj = { bottom: 250, top: 250, left: 250, right: 250 };
		var cardPosArr = []; 
		var offx = offObj[this.pos];
		for(var i = 0; i < this.cardSpriteArr.length; ++i) {
			Global.Tools.updateSpriteFrame('Niuniu/NNCards/card_back', this.cardSpriteArr[i]);
			cardPosArr[i] = this.cardSpriteArr[i].node.getPosition();
			this.cardSpriteArr[i].node.x = offx;
			this.cardSpriteArr[i].node.active = false;
		}

		var index = 0;
		var self = this;
		var callFunc = function() {
			if(index < 5) {
				self.cardSpriteArr[index].node.active = true;
				self.cardSpriteArr[index].node.runAction(cc.moveTo(0.1, cardPosArr[index]));
			} else {
				if(self.chairId === NNModel.getMyChairId()) {
					for(var j = 0; j < 4; ++j) {
						Global.Tools.updateSpriteFrame('Niuniu/NNCards/' + cardArr[j], self.cardSpriteArr[j]);
					}
				}
				self.unschedule(callFunc);
			}
			++index;
		};
		this.schedule(callFunc, 0.1);
	},

	showAllCardAndType: function(cardArr) {
		this.cardsNode.active = true;
		for(var i = 0; i < 5; ++i) {
			Global.Tools.updateSpriteFrame('Niuniu/NNCards/'+cardArr[i], this.cardSpriteArr[i]);
		}
		this.typeBackSprite.node.active = true;
		var typeUrl = this.getTypeSpriteUrl(cardArr);
		Global.Tools.updateSpriteFrame(typeUrl, this.typeSprite);
		var type = NNLogic.getSpecialCardType(cardArr);
		if(type !== NNLogic.rule.teshupai.meiyou) {
			if(type === NNLogic.rule.teshupai.wuhuaniu) {
				this.audioManager.playWuhuaniu();
			}
			else if(type === NNLogic.rule.teshupai.wuxiaoniu) {
				this.audioManager.playWuxiaoniu();
			}
			else if(type === NNLogic.rule.teshupai.zhadanniu) {
				this.audioManager.playZhadanniu();
			}

		} else {
			type = NNLogic.getNormalCardType(cardArr);
			this.audioManager.playNiuType(type);
		}
	},

	sendCard: function() {
		this.cardsNode.active = true;
		var offObj = { bottom: 250, top: 250, left: 250, right: 250 };
		var cardPosArr = [];
		var offx = offObj[this.pos];
		for(var i = 0; i < this.cardSpriteArr.length; ++i) {
			Global.Tools.updateSpriteFrame('Niuniu/NNCards/card_back', this.cardSpriteArr[i]);
			cardPosArr[i] = this.cardSpriteArr[i].node.getPosition();
			this.cardSpriteArr[i].node.x = offx;
			this.cardSpriteArr[i].node.active = false;
		}
		var index = 0;
		var self = this;
		var callFunc = function() {
			if(index < 5) {
				self.cardSpriteArr[index].node.active = true;
				self.cardSpriteArr[index].node.runAction(cc.moveTo(0.1, cardPosArr[index]));
			} else {
				if(self.chairId === NNModel.getMyChairId()) {
					for(var j = 0; j < 4; ++j) {
						Global.Tools.updateSpriteFrame('Niuniu/NNCards/' + self.cardArr[j], self.cardSpriteArr[j]);
					}
				}
				self.unschedule(callFunc);
			}
			++index;
		};
		this.schedule(callFunc, 0.1);
	},

	setCardPosAndChairId: function(pos, chairId) {
		this.pos = pos;
		this.chairId = chairId;
	},

	getTypeSpriteUrl: function(cardArr) {
		var gameRule = NNModel.getGameRule();
		var type = NNLogic.getSpecialCardType(cardArr, gameRule);
		if(type === NNLogic.rule.teshupai.wuhuaniu) {
			return 'Niuniu/NNType/nn_five_flower';
		}
		else if(type === NNLogic.rule.teshupai.zhadanniu) {
			return 'Niuniu/NNType/nn_four_bull';
		}
		else if(type === NNLogic.rule.teshupai.wuxiaoniu) {
			return 'Niuniu/NNType/nn_five_little_bull';
		} else {
			type = NNLogic.getNormalCardType(cardArr);
			return 'Niuniu/NNType/niu_'+type;
		}
	},

	onDestroy: function() {
		Global.MessageCallback.removeListener('RoomMessagePush', this);
		Global.MessageCallback.removeListener('GameMessagePush', this);
	},
});
