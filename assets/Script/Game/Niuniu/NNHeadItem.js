var NNModel = require('NNModel');
var NNProto = require('./NNProto');
var RoomProto = require('../../API/RoomProto');
var GameLogic = require('./NNLogic');

cc.Class({
    extends: cc.Component,

    properties: {
		nameLabel: cc.Label,
		headSprite: cc.Sprite,
		headEdgSprite: cc.Sprite,
		bankSprite: cc.Sprite,
		scoreLabel: cc.Label,
		bureauScoreLabel: cc.Label,
		stateSprite: cc.Sprite,
		robStateSprite: cc.Sprite,
		pourScoreNode: cc.Node,
		pourScoreLabel: cc.Label,
		rateSprite: cc.Sprite
    },


	onLoad: function() {
		Global.MessageCallback.addListener('RoomMessagePush', this);
		Global.MessageCallback.addListener('GameMessagePush', this);
	},

	offLineAndClient: function() {
		var gameStatus = NNModel.getGameStatus();
		this.bankSprite.node.active = false;
		this.scoreLabel.string = NNModel.getPlayerByChairId(this.chairId).userInfo.gold.toFixed(2);
		this.bureauScoreLabel.node.active = false;
		this.stateSprite.node.active = false;
		this.robStateSprite.node.active = false;
		this.pourScoreNode.active = false;
		this.pourScoreNode.x = 0;
		this.rateSprite.node.active = false;
		var gameRule = NNModel.getGameRule();
		var chairIndex = NNModel.getChairIdIndex(this.chairId);
		if(gameStatus === NNProto.GAME_STATUS_PREPARE) {
			var player = NNModel.getPlayerByChairId(this.chairId);
			if((player.userStatus&RoomProto.userStatusEnum.READY) > 0) {
				this.stateSprite.node.active = true;
				Global.Tools.updateSpriteFrame('Niuniu/Common/nn_zhunbei', this.stateSprite);
			}
		}
		else if(gameStatus === NNProto.GAME_STATUS_ROBBANK) {
			var robBankArr = NNModel.getRobBankArr();
			if(robBankArr[this.chairId] === 0) {
				var url = 'Niuniu/Common/nn_buqiang';
				this.robStateSprite.node.active = true;
				Global.Tools.updateSpriteFrame(url, this.robStateSprite);
			} else if(robBankArr[this.chairId] !== -1) {
				var shangzhuang = NNModel.getGameRule().otherRule.shangzhuang;
				if(shangzhuang === GameLogic.rule.shangzhuang.ziyouqiangzhuang) {
					this.answerRobFreeBank(this.chairId, robBankArr[this.chairId] === 1);
				} else {
					this.answerRobRateBank(this.chairId, robBankArr[this.chairId]);
				}

			}
		}
		else if(gameStatus === NNProto.GAME_STATUS_POURSCORE || gameStatus === NNProto.GAME_STATUS_SORTCARD) {
			if(chairIndex >= 0) {
				var pourScore = NNModel.getPourScoreArr()[chairIndex];
				if(pourScore !== 0) {
					this.pourScoreNode.active = true;
					this.pourScoreLabel.string = pourScore;
				}
				this.showRateSprite();
			}
		}
		else if(gameStatus === NNProto.GAME_STATUS_RESOUT) {
			if(chairIndex >= 0) {
				this.showRateSprite();
			}
		}
		if(NNModel.getBankChairId() === this.chairId) {
			this.bankSprite.node.active = true;
		}
	},

	messageCallbackHandler: function(router, msg) {
		if(! this.pos) { return; }
		if(router === 'GameMessagePush') {
			if(msg.type === NNProto.POUR_SCORE_PUSH) {
				this.answerPourScorePush(msg.data.chairId, msg.data.score);
			}
			else if(msg.type === NNProto.CAN_POUR_SCORE_PUSH) {
				this.answerCanPourScorePush();
			}
			else if(msg.type === NNProto.GAME_RESOUT_PUSH) {
				if(NNModel.getChairIdIndex(this.chairId) >= 0) {
					this.answerGameResoutPush(msg.data.finalScoreArr, msg.data.bankIndex);
				}
			}
			else if(msg.type === NNProto.FOUR_CARD_PUSH) {
				this.answerFourCardPush();
			}
			else if(msg.type === NNProto.GAME_STATUS_PUSH) {
				this.answerGameStatusPush(msg.data.gameStatus);
			}
			else if(msg.type === NNProto.ROB_FREE_BANK_PUSH) {
				this.answerRobFreeBank(msg.data.chairId, msg.data.isRob);
			}
			else if(msg.type === NNProto.ROB_RATE_BANK_PUSH) {
				this.answerRobRateBank(msg.data.chairId, msg.data.rate);
			}
			else if(msg.type === NNProto.BANK_CHANGE_PUSH) {
				this.answerBankChangePush(msg.data.bankChairId);
			}
			else if(msg.type === NNProto.RESOUT_CARD_PUSH) {
				this.answerResoutCardPush(msg.data.cardArr);
			}
		}
		else if(router === 'RoomMessagePush') {
			if(msg.type === RoomProto.USER_READY_PUSH) {
				this.answerUserReadyPush(msg.data.chairId);
			}
			else if(msg.type === RoomProto.USER_LEAVE_ROOM_PUSH) {
				this.answerUserLeavePush(msg.data.roomUserInfo.chairId);
			}
		}
	},

	answerPourScorePush: function(chairId, score) {
		if(chairId === this.chairId) {
			this.pourScoreNode.active = true;
			this.pourScoreLabel.string = score;
		}
	},

	answerCanPourScorePush: function() {
		this.stateSprite.node.active = false;
		this.robStateSprite.node.active = false;
	},

	answerGameResoutPush: function(scoreArr, bankIndex) {
		if(this.pos === 'bottom' || this.pos === 'left' || this.pos === 'top') {
			this.pourScoreNode.x = 100;
		} else {
			this.pourScoreNode.x = -100;
		}
		var font = 'Font/fnt_game2';
		var score = scoreArr[NNModel.getChairIdIndex(this.chairId)];
		if(score < 0) {
			font = 'Font/fnt_game1';
		} else {
			score = '+' + score;
		}
		var self = this;
		cc.loader.loadRes(font, cc.Font, function(err, res) {
			if(! err) {
				self.bureauScoreLabel.font = res;
				self.bureauScoreLabel.node.active = true;
				self.bureauScoreLabel.string = score;
			}
		});
		var shangzhuang = NNModel.getGameRule().otherRule.shangzhuang;
		var bankChairId = NNModel.getChairIdByIndex(bankIndex);
		if(bankChairId === this.chairId) {
			this.bankSprite.node.active = true;
		} else {
			this.bankSprite.node.active = false;
		}
		this.scheduleOnce(function() {
			//self.pourScoreNode.x = 0;
			//self.pourScoreNode.active = false;
			//self.bureauScoreLabel.node.active = false;
			self.scoreLabel.string = NNModel.getPlayerByChairId(self.chairId).userInfo.gold.toFixed(2);
			if(shangzhuang === GameLogic.rule.shangzhuang.ziyouqiangzhuang ||
				shangzhuang === GameLogic.rule.shangzhuang.tongbiniuniu ||
				shangzhuang === GameLogic.rule.shangzhuang.mingpaiqiangzhuang) {
				//self.bankSprite.node.active = false;
				//self.rateSprite.node.active = false;
			}
		}, 3);
	},

	answerGameStatusPush: function(gameStatus) {
		var gameRule = NNModel.getGameRule();
		if(gameStatus === NNProto.GAME_STATUS_POURSCORE) {
			this.stateSprite.node.active = false;
		}
		else if(gameStatus === NNProto.GAME_STATUS_SORTCARD) {
			this.stateSprite.node.active = false;
		}
	},

	answerRobFreeBank: function(chairId, isRob) {
		if(chairId === this.chairId) {
			if(isRob) {
				var url = 'Niuniu/Common/nn_qiang_zhuang';
			} else {
				url = 'Niuniu/Common/nn_buqiang';
			}
			this.robStateSprite.node.active = true;
			Global.Tools.updateSpriteFrame(url, this.robStateSprite);
		}
	},

	answerRobRateBank: function(chairId, rate) {
		if(chairId === this.chairId) {
			if(rate === 0) {
				var url = 'Niuniu/Common/nn_buqiang';
			} 
			else if(rate === 1) {
				url = 'Niuniu/Common/nn_qiang_yi_bei';
			}
			else if(rate === 2) {
				url = 'Niuniu/Common/nn_qiang_er_bei';
			}
			else if(rate === 3) {
				url = 'Niuniu/Common/nn_qiang_san_bei';
			}
			else if(rate === 4) {
				url = 'Niuniu/Common/nn_qiang_si_bei';
			}
			this.robStateSprite.node.active = true;
			Global.Tools.updateSpriteFrame(url, this.robStateSprite);
		}
	},

	answerBankChangePush: function(bankChairId) {
		this.robStateSprite.node.active = false;
		var gameRule = NNModel.getGameRule();
		if(gameRule.otherRule.shangzhuang !== GameLogic.rule.shangzhuang.ziyouqiangzhuang && 
			gameRule.otherRule.shangzhuang !== GameLogic.rule.shangzhuang.mingpaiqiangzhuang) {
			this.bankSprite.node.active = (this.chairId === bankChairId);
		} else {
			var memberCount = gameRule.memberCount;
			var robBankArr = NNModel.getRobBankArr();
			for(var j = 4; j >= 0; --j) {
				var robCount = 0;
				for(var i = 0; i < robBankArr.length; ++i) {
					if(robBankArr[i] === j) { ++ robCount; }
				}
				if(robCount > 0) {
					if(robCount === 1) {
						this.bankSprite.node.active = (this.chairId === bankChairId);
						this.robStateSprite.node.active = false;
						this.showRateSprite();
						return;
					}
					break;
				}
			}
			var bankIndex = NNModel.getChairIdIndex(bankChairId);
			var chairIndex = NNModel.getChairIdIndex(this.chairId);
			if(robBankArr[chairIndex] < j) { return;	}// 此玩家不抢庄
			var index = 0;
			var self = this;
			var callback = function() {
				while(robBankArr[index%memberCount] < j && index < memberCount*4+bankIndex) {
					++ index;
				}
				self.headEdgSprite.node.active = (index%memberCount === chairIndex);
				if(index >= memberCount*4+bankIndex) {
					self.robStateSprite.node.active = false;
					self.bankSprite.node.active = (bankChairId === self.chairId);
					self.headEdgSprite.node.active = false;
					self.showRateSprite();
					self.unschedule(callback);
				}
				++index;
			};
			this.schedule(callback, 0.1);
		}
	},

	answerResoutCardPush: function(cardArr) {
		var gameRule = NNModel.getGameRule();
		if(gameRule.otherRule.shangzhuang === GameLogic.rule.shangzhuang.tongbiniuniu) {
			this.pourScoreLabel.string = gameRule.otherRule.difenArr[0];
			this.pourScoreNode.active = true;
		}
	},

	answerUserReadyPush: function(chairId) {
		if(chairId === this.chairId) {
			this.stateSprite.node.active = true;
			Global.Tools.updateSpriteFrame('Niuniu/Common/nn_zhunbei', this.stateSprite);
			var gameRule = NNModel.getGameRule();
			//this.bankSprite.node.active = false;
			//this.rateSprite.node.active = false;
		}
		var myChairId = NNModel.getMyChairId();
		if(chairId === myChairId) {
			this.pourScoreNode.x = 0;
			this.pourScoreNode.active = false;
			this.bureauScoreLabel.node.active = false;
			this.bankSprite.node.active = false;
			this.rateSprite.node.active = false;
		}
	},

	answerFourCardPush: function() {
		this.pourScoreNode.x = 0;
		this.pourScoreNode.active = false;
		this.bureauScoreLabel.node.active = false;
		this.bankSprite.node.active = false;
		this.rateSprite.node.active = false;
	},

	answerUserLeavePush: function(chairId) {
		if(chairId === this.chairId) {
			this.pourScoreNode.x = 0;
			this.pourScoreNode.active = false;
			this.bureauScoreLabel.node.active = false;
			this.bankSprite.node.active = false;
			this.rateSprite.node.active = false;
		}
	},

	showRateSprite: function() {
		var gameRule = NNModel.getGameRule();
		if(gameRule.otherRule.shangzhuang !== GameLogic.rule.shangzhuang.mingpaiqiangzhuang) {
			return;
		}
		if(this.chairId !== NNModel.getBankChairId()) {
			return;
		}
		var robBankArr = NNModel.getRobBankArr();
		var rate = robBankArr[NNModel.getChairIdIndex(this.chairId)];
		this.rateSprite.node.active = true;
		var rateArr = ['nn_yi_bei', 'nn_yi_bei', 'nn_er_bei', 'nn_san_bei', 'nn_si_bei'];
		Global.Tools.updateSpriteFrame('Niuniu/Common/'+rateArr[rate], this.rateSprite);
	},

	setHeadPosAndChairId: function(pos, chairId) {
		this.pos = pos;
		this.chairId = chairId;
		var player = NNModel.getPlayerByChairId(chairId);
		if(player) {
			this.nameLabel.string = player.userInfo.nickname;
		}
		if(this.chairId === NNModel.getBankChairId()) {
			this.bankSprite.node.active = true;
		}
		if(this.pos === 'right') {
			this.robStateSprite.node.x = -this.robStateSprite.node.x;
		}
		this.scoreLabel.string = player.userInfo.gold.toFixed(2);
	},

	onDestroy: function() {
		Global.MessageCallback.removeListener('RoomMessagePush', this);
		Global.MessageCallback.removeListener('GameMessagePush', this);
	}
});

