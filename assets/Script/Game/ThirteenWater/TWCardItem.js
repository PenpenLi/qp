var TWModel = require('./TWModel');
var TWLogic = require('./TWLogic');
var GameProto = require('./TWProto');
var RoomProto = require('../../API/RoomProto');
var Tools = require('../../Shared/Tools');
var MessageCallback = require('../../Shared/MessageCallback');

cc.Class({
	extends: cc.Component,

	properties: {
		guaiLabel: cc.Label,
		toudaoLabel: cc.Label,
		zhongdaoLabel: cc.Label,
		weidaoLabel: cc.Label,
		zongfenLabel: cc.Label,
		typeSprite: cc.Sprite,
		gameTypeSprite: cc.Sprite,
		gunSprite: cc.Sprite,
		holesNode: cc.Node,
		cardsNode: cc.Node,
		itemId: cc.Integer,
	},

	onLoad: function() {
		this.node.active = false;
		this.cardNodeArr = [];
		this.gunSecond = 1.5;
		this.showTypeSecond = 0.5;
		this.turnSecond = 1.5;
		this.itemId = parseInt(this.itemId);
		for(var i = 0; i < 13; ++i) {
			var node = new cc.Node();
			node.parent = this.cardsNode;
			node.addComponent(cc.Sprite);
			node.zIndex = i+1;
			this.cardNodeArr.push(node);
			node.on(cc.Node.EventType.TOUCH_START, function(event) {
				if(this.cardType === 2) {
					this.setCardType7();
				} 
				else if(this.cardType === 7) {
					this.setCardType8();
				} 
			}.bind(this));
		}
		for(i = 0; i < 5; ++i) {
			this.holesNode.getChildByName('HoleSprite'+(i+1)).active = false;
		}
		MessageCallback.addListener('GameMessagePush', this);
		MessageCallback.addListener('RoomMessagePush', this);
	},

	onTouchCard: function() {
	},

	offLineAndClient: function() {
		if(!TWModel.getPlayerByChairId(this.chairId)) { return; }
		if(TWModel.getChairIdIndex(this.chairId) < 0) { return; }
		this.unscheduleAllCallbacks();
		this.holesNode.active = false;
		var gameStatus = TWModel.getGameStatus();
		var myChairId = TWModel.getMyChairId();
		var curTm = Date.now();
		var resout = TWModel.getResout();
		if(gameStatus === GameProto.GAME_STATUS_GAMEING) {
			this.node.active = true;
			if(TWModel.hasSortCard(this.chairId)) {
				this.setCardType1();
				this.setCardType2();
			} else {
				this.setCardType1();
			}
		}
		else if(gameStatus === GameProto.GAME_STATUS_SETTLE) {
			//this.setCardType1();
			this.setCardType2();
			this.setCardType3(resout);
			this.setCardType4(resout);
			this.setCardType5(resout);
			this.scheduleOnce(function() {
				this.setCardType6(resout);
			}.bind(this), 0.1);
			this.node.active = true;
			//if(this.chairId === TWModel.getMyChairId()) {
			//	Global.DialogManager.createDialog('ThirteenWater/TWSettleDialog');
			//}
		}
		else if(gameStatus === GameProto.GAME_STATUS_NOTSTART) {
			//if(TWModel.getGameStartedOnce()) {
			//	this.node.active = true;
			//	this.setCardType2();
			//	this.setCardType3(resout);
			//	this.setCardType4(resout);
			//	this.setCardType5(resout);
			//	this.scheduleOnce(function() {
			//		this.setCardType6(resout);
			//	}.bind(this), 0.1);
			//}
		}
	},

	onDestroy: function() {
		MessageCallback.removeListener('GameMessagePush', this);
		MessageCallback.removeListener('RoomMessagePush', this);
	},

	setChairId: function(chairId) {
		this.chairId = chairId;
		var player = TWModel.getPlayerByChairId(chairId);
		this.offLineAndClient();
	},

	messageCallbackHandler: function(router, msg) {
		if(router === 'GameMessagePush') {
			if(! TWModel.getPlayerByChairId(this.chairId)) { 
				this.node.active = false; return; 
			}
			if(TWModel.getChairIdIndex(this.chairId) < 0) { 
				this.node.active = false; return; 
			}
			if(msg.type === GameProto.GAME_CARDS_PUSH) {	
				this.node.active = true;
				this.setCardType1(true);
			}
			else if(msg.type === GameProto.GAME_CARDS_NOSORT_PUSH) {
				if(msg.data.isNosort && msg.data.chairId === this.chairId && this.chairId === TWModel.getMyChairId()) {
					this.setNodeSpriteFrame('ThirteenWater/TWCommon/TW_guaipai', this.gameTypeSprite.node);
					this.gameTypeSprite.node.y = 7;
					this.gameTypeSprite.node.active = true;
				}
			}
			else if(msg.type === GameProto.GAME_CARDS_SORT_PUSH) {
				if(msg.data.chairId === this.chairId && msg.code === 0) {
					if(this.sendCardCallback) {
						this.unschedule(this.sendCardCallback);
						this.sendCardCallback = null;
						this.setCardType1();
					}
					this.setCardType2();
				}
			}
			else if(msg.type === GameProto.GAME_RESOUT_PUSH) {
				this.showCard(msg.data.resout, msg.data.gameSettleTm);
			}
		}
		else if(router === 'RoomMessagePush') {
			if(msg.type === RoomProto.USER_READY_PUSH) {
				if(msg.data.chairId === TWModel.getMyChairId()) {
					this.node.active = false;
				}
			}
			else if(msg.type === RoomProto.USER_LEAVE_ROOM_PUSH) {
				if(msg.data.roomUserInfo.chairId === this.chairId) {
					this.node.active = false;
				}
			}
			else if(msg.type === RoomProto.USER_RECONNECT_PUSH) {
				this.offLineAndClient();
			}
		}
	},

	showCard: function(resout, tm) {
		this.isOnAniaml = true;
		var memberCount = resout.cardsArr.length;
		var chairIndex = TWModel.getChairIdIndex(this.chairId);
		var offSecond = (chairIndex)%memberCount+1;
		this.setCardType8();
		this.canFanpai = false;
		this.gameTypeSprite.node.active = false;
		var mianbaiCount = 0, preMianbai = 0;
		for(var i = 0; i < memberCount; ++i) {
			if(TWModel.getMianbai(i)) {
				++ mianbaiCount;
				if(i <= chairIndex) {
					++ preMianbai;
				}
			}
		}
		this.scheduleOnce(function() { this.setCardType3(resout, true); }.bind(this), (offSecond-preMianbai)*this.turnSecond);
		this.scheduleOnce(function() { this.setCardType4(resout, true); }.bind(this), 
			((memberCount-mianbaiCount)*1+offSecond-preMianbai)*this.turnSecond+this.showTypeSecond);
		this.scheduleOnce(function() { this.setCardType5(resout, true); }.bind(this), 
			((memberCount-mianbaiCount)*2+offSecond-preMianbai)*this.turnSecond+2*this.showTypeSecond);

		this.scheduleOnce(function() {
			this.daqiangAnimal(resout);
		}.bind(this), (1+(memberCount-mianbaiCount)*3)*this.turnSecond+3*this.showTypeSecond);
	},

	/* 未理牌状态 */
	setCardType1: function(hasAnimal) {
		this.cardType = 1;
		var splitX = 30;
		var posArr = [ {x: -126, y: -105}, {x: -97, y: -54}, {x: -165, y: 128}, {x: -280, y: -54} ];
		this.cardsNode.setPosition(0, 0);
		this.cardsNode.setScale(1, 1);
		for(var i = 0; i < this.cardNodeArr.length; ++i) {
			if(hasAnimal) {
				this.cardNodeArr[i].x = posArr[this.itemId].x+splitX*18;
				this.cardNodeArr[i].active = false;
			} else {
				this.cardNodeArr[i].x = posArr[this.itemId].x+splitX*i;
			}
			this.cardNodeArr[i].y = posArr[this.itemId].y;
			this.cardNodeArr[i].rotation = 0;
			this.setNodeSpriteFrame('ThirteenWater/TWCard/card_back', this.cardNodeArr[i]);
			this.cardNodeArr[i].setScale(1.1, 1.1);
		}
		if(hasAnimal) {
			Global.AudioManager.playSound('ThirteenWater/TWSound/tw_fapai');
			var index = 0;
			var self = this;
			this.sendCardCallback = function() {
				if(index === 13) { 
					self.unschedule(self.sendCardCallback); 
					self.sendCardCallback = null;
					self.setNodeSpriteFrame('ThirteenWater/TWCommon/TW_lipaizhong', self.gameTypeSprite.node);
					self.gameTypeSprite.node.active = true;
					return;
				}
				self.cardNodeArr[index].active = true;
				self.cardNodeArr[index].runAction(cc.moveTo(0.1, cc.p(posArr[self.itemId].x+splitX*index, posArr[self.itemId].y)));
				++index;
			};
			this.schedule(this.sendCardCallback, 0.1);
		} else {
			this.setNodeSpriteFrame('ThirteenWater/TWCommon/TW_lipaizhong', this.gameTypeSprite.node);
			this.gameTypeSprite.node.active = true;
		}
		if(this.chairId === TWModel.getMyChairId()) {
			this.gameTypeSprite.node.setPosition(24, -110);
		}
		this.guaiLabel.node.active = false;
		this.toudaoLabel.node.active = false;
		this.zhongdaoLabel.node.active = false;
		this.weidaoLabel.node.active = false;
		this.zongfenLabel.node.active = false;
		this.typeSprite.node.active = false;
	},

	/* 理牌状态 */
	setCardType2: function() {
		this.canFanpai = true;
		this.cardType = 2;
		this.gameTypeSprite.node.active = false;
		var posArr = [
			{x: -50, y: 172}, {x: 25, y: 173}, {x: 96, y: 154}, {x: -123, y: -16}, {x: -54, y: 11}, {x: 27, y: 8}, {x: 98, y: -4},
			{x: 165, y: -46}, {x: -123, y: -203}, {x: -49, y: -178}, {x: 27, y: -175}, {x: 95, y: -190}, {x: 170, y: -221}, 
		];
		var rotate = [ -23, -8, 10, -40, -22, -7, 12, 28, -40, -22, -5, 13, 28 ];
		var cardsNodePosArr = [ {x: 0, y: 66}, {x: 120, y: -72}, {x: 16, y: 70}, {x: -172, y: -68} ];
		this.cardsNode.setPosition(cardsNodePosArr[this.itemId].x, cardsNodePosArr[this.itemId].y);
		if(this.itemId !== 0) {
			this.cardsNode.setScale(0.8, 0.8);
		} else {
			this.cardsNode.setScale(1, 1);
		}
		for(var i = 0; i < this.cardNodeArr.length; ++i) {
			this.cardNodeArr[i].active = true;
			this.cardNodeArr[i].setPosition(posArr[i].x, posArr[i].y);
			this.cardNodeArr[i].rotation = rotate[i];
			this.cardNodeArr[i].setScale(1.2, 1.2);
		}
		var chairIndex = TWModel.getChairIdIndex(this.chairId);
		if(TWModel.getMianbai(chairIndex) && this.chairId === TWModel.getMyChairId()) {
			this.setNodeSpriteFrame('ThirteenWater/TWCommon/TW_guaipai', this.gameTypeSprite.node);
			this.gameTypeSprite.node.y = 7;
			this.gameTypeSprite.node.active = true;
		} else {
			this.gameTypeSprite.node.active = false;
		}
	},

	/* 明头牌状态 */
	setCardType3: function(resout, showType) {
		this.cardType = 3;
		var myChairId = TWModel.getMyChairId();
		var memberCount = resout.cardsArr.length;
		var chairIndex = TWModel.getChairIdIndex(this.chairId);
		var myChairIndex = TWModel.getChairIdIndex(myChairId);

		var offSecond = chairIndex%memberCount;
		var cardIdArr = resout.cardsArr[chairIndex];
		var aftMianbai = 0;
		for(var i = 0; i < 4; ++i) {
			if(TWModel.getMianbai(i) && i > chairIndex) { ++ aftMianbai; }
		}
		var delayTime = (memberCount-offSecond-aftMianbai)*this.turnSecond;
		if(! showType) { delayTime = 0; }
		var self = this;

		if(! TWModel.getMianbai(chairIndex)) {
			for(var i = 0; i < 3; ++i) {
				this.setNodeSpriteFrame('ThirteenWater/TWCard/'+cardIdArr[i], this.cardNodeArr[i]);
			}
		}
		var url = '', str = '';
		if(this.chairId !== myChairId) {
			var score = 0;
			if(resout.scoresArr[myChairIndex]) {
				score = resout.scoresArr[myChairIndex][chairIndex][0];
			} else {
				for(i = 0; i < resout.scoresArr.length; ++i) {
					score += resout.scoresArr[chairIndex][i][0];
				}
			}
			if(score >= 0) {
				str = '赢+' + score;
				url = 'Font/fnt_game2';
			} else {
				str = '输' + score;
				url = 'Font/fnt_game1';
			}
		} else {
			var score = 0, zongStr = '';
			for(i = 0; i < resout.scoresArr[chairIndex].length; ++i) {
				score += resout.scoresArr[chairIndex][i][0];
			}
			if(score >= 0) {
				str = '头道+' + score;
				zongStr = '总分+' + score;
				url = 'Font/fnt_game4';
			} else {
				str = '头道' + score;
				zongStr = '总分' + score;
				url = 'Font/fnt_game3';
			}
			this.scheduleOnce(function() {
				cc.loader.loadRes(url, cc.Font, function(err, font) {
					if(! err) {
						self.zongfenLabel.font = font;
						self.zongfenLabel.string = zongStr;
						self.zongfenLabel.node.active = true;
					}
				});
			}, delayTime);
		}
		if(showType) {
			var touArr = TWLogic.getTouArr(resout.cardsArr[chairIndex]);
			if(!TWModel.getMianbai(chairIndex)) {
				Global.AudioManager.playSound(this.getSoundUrlByCardArr(touArr, 'tou'));
				this.setNodeSpriteFrame(this.getTypeUrlByCardArr(touArr, 'tou'), this.typeSprite.node);
				this.typeSprite.node.active = true;
				this.scheduleOnce(function() { this.typeSprite.node.active = false; }.bind(this), 1);
			}
		} 
		this.scheduleOnce(function() {
			cc.loader.loadRes(url, cc.Font, function(err, font) {
				if(! err) { 
					self.toudaoLabel.font = font; 
					self.toudaoLabel.string = str;
					self.toudaoLabel.node.active = true;
				}
			});
		}, delayTime);
		this.gameTypeSprite.node.active = false;
	},

	/* 明中牌状态 */
	setCardType4: function(resout, showType) {
		this.cardType = 4;
		var myChairId = TWModel.getMyChairId();
		var memberCount = resout.cardsArr.length;

		var chairIndex = TWModel.getChairIdIndex(this.chairId);
		var myChairIndex = TWModel.getChairIdIndex(myChairId);
		var offSecond = (chairIndex)%memberCount;
		var aftMianbai = 0;
		for(var i = 0; i < 4; ++i) {
			if(TWModel.getMianbai(i) && i > chairIndex) {
				++ aftMianbai;
			}
		}
		var cardIdArr = resout.cardsArr[chairIndex];
		var delayTime = (memberCount-offSecond-aftMianbai)*this.turnSecond;
		if(! showType) { delayTime = 0; }
		var self = this;
		var i;
		if(! TWModel.getMianbai(chairIndex)) {
			for(i = 3; i < 8; ++i) {
				this.setNodeSpriteFrame('ThirteenWater/TWCard/'+cardIdArr[i], this.cardNodeArr[i]);
			}
		}
		var url = '';
		var str = '';
		if(this.chairId !== myChairId) {
			var score = 0;
			if(resout.scoresArr[myChairIndex]) {
				score = resout.scoresArr[myChairIndex][chairIndex][1];
			} else {
				for(i = 0; i < resout.scoresArr.length; ++i) {
					score += resout.scoresArr[chairIndex][i][1];
				}
			}
			if(score >= 0) {
				str = '赢+' + score;
				url = 'Font/fnt_game2';
			} else {
				str = '输' + score;
				url = 'Font/fnt_game1';
			}
		} else {
			var score = 0, zongStr, zongScore = 0, zongUrl;
			for(i = 0; i < resout.daqiangArr[myChairIndex].length; ++i) {
				score += resout.scoresArr[myChairIndex][i][1];
				zongScore += resout.scoresArr[myChairIndex][i][0] + resout.scoresArr[myChairIndex][i][1];
			}
			if(score >= 0) {
				str = '中道+' + score;
				url = 'Font/fnt_game4';
			} else {
				str = '中道' + score;
				url = 'Font/fnt_game3';
			}
			if(zongScore >= 0) {
				zongStr = '总分+' + zongScore;
				zongUrl = 'Font/fnt_game4';
			} else {
				zongStr = '总分' + zongScore;
				zongUrl = 'Font/fnt_game3';
			}
			this.scheduleOnce(function() {
				cc.loader.loadRes(zongUrl, cc.Font, function(err, font) {
					if(! err) {
						self.zongfenLabel.font = font;
						self.zongfenLabel.string = zongStr;
						self.zongfenLabel.node.active = true;
					}
				});
			}, delayTime);
		}
		if(showType) {
			var zhongArr = TWLogic.getZhongArr(resout.cardsArr[chairIndex]);
			if(!TWModel.getMianbai(chairIndex)) {
				this.setNodeSpriteFrame(this.getTypeUrlByCardArr(zhongArr), this.typeSprite.node);
				Global.AudioManager.playSound(this.getSoundUrlByCardArr(zhongArr));
				this.typeSprite.node.active = true;
				this.scheduleOnce(function() { this.typeSprite.node.active = false; }.bind(this), 1);
			}
		}
		this.scheduleOnce(function() {
			cc.loader.loadRes(url, cc.Font, function(err, font) {
				if(! err) { 
					self.zhongdaoLabel.font = font; 
					self.zhongdaoLabel.string = str;
					self.zhongdaoLabel.node.active = true;
				}
			});
		}, delayTime);
	},

	/*明尾牌状态 */
	setCardType5: function(resout, showType) {
		var myChairId = TWModel.getMyChairId();
		var memberCount = resout.cardsArr.length;
		var chairIndex = TWModel.getChairIdIndex(this.chairId);
		var myChairIndex = TWModel.getChairIdIndex(myChairId);
		var offSecond = (chairIndex)%memberCount;
		var aftMianbai = 0;
		for(var i = 0; i < memberCount; ++i) {
			if(TWModel.getMianbai(i) && i > chairIndex) {
				++ aftMianbai;
			}
		}
		var cardIdArr = resout.cardsArr[chairIndex];
		var delayTime = (memberCount-offSecond-aftMianbai)*this.turnSecond;
		if(! showType) { delayTime = 0; }
		var self = this;
		var i;
		if(! TWModel.getMianbai(chairIndex)) {
			for(i = 8; i < 13; ++i) {
				this.setNodeSpriteFrame('ThirteenWater/TWCard/'+cardIdArr[i], this.cardNodeArr[i]);
			}
		}
		var str = '';
		var url = '';
		if(this.chairId !== myChairId) {
			var score = 0;
			if(resout.scoresArr[myChairIndex]) {
				score = resout.scoresArr[myChairIndex][chairIndex][2];
			} else {
				for(i = 0; i < resout.scoresArr.length; ++i) {
					score += resout.scoresArr[chairIndex][i][2];
				}
			}
			if(score >= 0) {
				str = '赢+' + score;
				url = 'Font/fnt_game2';
			} else {
				str = '输' + score;
				url = 'Font/fnt_game1';
			}
		} else {
			var score = 0, zongScore = 0, zongUrl, zongStr;
			for(i = 0; i < resout.daqiangArr[myChairIndex].length; ++i) {
				score += resout.scoresArr[myChairIndex][i][2];
				zongScore += resout.scoresArr[myChairIndex][i][0] + resout.scoresArr[myChairIndex][i][1] + resout.scoresArr[myChairIndex][i][2];
			}
			if(score >= 0) {
				str = '尾道+' + score;
				url = 'Font/fnt_game4';
			} else {
				str = '尾道' + score;
				url = 'Font/fnt_game3';
			}
			if(zongScore >= 0) {
				zongStr = '总分+' + zongScore;
				zongUrl = 'Font/fnt_game4';
			} else {
				zongStr = '总分' + zongScore;
				zongUrl = 'Font/fnt_game3';
			}
			this.scheduleOnce(function() {
				cc.loader.loadRes(zongUrl, cc.Font, function(err, font) {
					if(! err) {
						self.zongfenLabel.font = font;
						self.zongfenLabel.string = zongStr;
						self.zongfenLabel.node.active = true;
					}
				});
			}, delayTime);
		}
		if(showType) {
			var weiArr = TWLogic.getWeiArr(resout.cardsArr[chairIndex]);
			if(!TWModel.getMianbai(chairIndex)) {
				Global.AudioManager.playSound(this.getSoundUrlByCardArr(weiArr));
				this.setNodeSpriteFrame(this.getTypeUrlByCardArr(weiArr), this.typeSprite);
				this.typeSprite.node.active = true;
				this.scheduleOnce(function() { this.typeSprite.node.active = false; }.bind(this), 1);
			}
		}
		var self = this;
		this.scheduleOnce(function() {
			cc.loader.loadRes(url, cc.Font, function(err, font) {
				if(! err) { 
					self.weidaoLabel.font = font; 
					self.weidaoLabel.string = str;
					self.weidaoLabel.node.active = true;
				}
			});
			self.showMianbai(resout);
		}, delayTime);
	},

	showMianbai: function(resout) {
		var chairIndex = TWModel.getChairIdIndex(this.chairId);
		if(TWModel.getMianbai(chairIndex)) {	// 免摆牌型
			var cardIdArr = resout.cardsArr[chairIndex];
			for(i = 0; i < 13; ++i) {
				this.setNodeSpriteFrame('ThirteenWater/TWCard/'+cardIdArr[i], this.cardNodeArr[i]);
			}
		}
	},

	/* 显示总分&倍率 */
	setCardType6: function(resout, playAudio) {
		var chairIndex = TWModel.getChairIdIndex(this.chairId);
		var myChairId = TWModel.getMyChairId();
		var myChairIndex = TWModel.getChairIdIndex(myChairId);
		if(myChairIndex < 0) { return; }
		if(TWModel.getMianbai(chairIndex)) {	// 免摆牌型
			if(!! playAudio) {
				this.typeSprite.node.active = true;
				this.setNodeSpriteFrame(this.getTypeUrlByCardArr(resout.cardsArr[chairIndex]), this.typeSprite.node);
				this.scheduleOnce(function() { this.typeSprite.node.active = false; }.bind(this), 1);
				Global.AudioManager.playSound(this.getSoundUrlByCardArr(resout.cardsArr[chairIndex]));
			}
			var cardIdArr = resout.cardsArr[chairIndex];
			for(i = 0; i < 13; ++i) {
				this.setNodeSpriteFrame('ThirteenWater/TWCard/'+cardIdArr[i], this.cardNodeArr[i]);
			}
		}
		var url = '', str = '';
		if(this.chairId === myChairId) {
			var score = TWLogic.getScoreArrByResout(resout)[chairIndex];
			if(score >= 0) {
				str = '总分:+' + score;
				url = 'Font/fnt_game4';
			} else {
				str = '总分:' + score;
				url = 'Font/fnt_game3';
			}
			var touScore = TWLogic.getTouScoreArrByResout(resout)[myChairIndex];
			var touUrl, touStr;
			if(touScore >= 0) {
				touStr = '头道+' + touScore;
				touUrl = 'Font/fnt_game4';
			} else {
				touStr = '头道' + touScore;
				touUrl = 'Font/fnt_game3';
			}
			cc.loader.loadRes(touUrl, cc.Font, function(err, font) {
				if(! err) { 
					this.toudaoLabel.font = font; 
					this.toudaoLabel.string = touStr;
					this.toudaoLabel.node.active = true;
				}
			}.bind(this));
			var zhongScore = TWLogic.getZhongScoreArrByResout(resout)[myChairIndex];
			var zhongUrl, zhongStr;
			if(zhongScore >= 0) {
				zhongStr = '中道+' + zhongScore;
				zhongUrl = 'Font/fnt_game4';
			} else {
				zhongStr = '中道' + zhongScore;
				zhongUrl = 'Font/fnt_game3';
			}
			cc.loader.loadRes(zhongUrl, cc.Font, function(err, font) {
				if(! err) { 
					this.zhongdaoLabel.font = font; 
					this.zhongdaoLabel.string = zhongStr;
					this.zhongdaoLabel.node.active = true;
				}
			}.bind(this));
			var weiScore = TWLogic.getWeiScoreArrByResout(resout)[myChairIndex];
			var weiUrl, weiStr;
			if(weiScore >= 0) {
				weiStr = '尾道+' + weiScore;
				weiUrl = 'Font/fnt_game4';
			} else {
				weiStr = '尾道' + weiScore;
				weiUrl = 'Font/fnt_game3';
			}
			cc.loader.loadRes(weiUrl, cc.Font, function(err, font) {
				if(! err) { 
					this.weidaoLabel.font = font; 
					this.weidaoLabel.string = weiStr;
					this.weidaoLabel.node.active = true;
				}
			}.bind(this));
		} else {
			var daqiang = 1; 
			if(myChairIndex >= 0 && chairIndex >= 0) {
				daqiang = Math.abs(resout.daqiangArr[myChairIndex][chairIndex]);
			}
			var score = 0;
			if(daqiang > 1) {	//打枪
				score = resout.scoresArr[myChairIndex][chairIndex][0];
				if(score > 0) {
					this.toudaoLabel.string = '赢+' + score + 'x' + daqiang;
				} else {
					this.toudaoLabel.string = '输' + score + 'x' + daqiang;
				}
				score = resout.scoresArr[myChairIndex][chairIndex][1];
				if(score > 0) {
					this.zhongdaoLabel.string = '赢+' + score + 'x' + daqiang;
				} else {
					this.zhongdaoLabel.string = '输' + score + 'x' + daqiang;
				}
				score = resout.scoresArr[myChairIndex][chairIndex][2];
				if(score > 0) {
					this.weidaoLabel.string = '赢+' + score + 'x' + daqiang;
				} else {
					this.weidaoLabel.string = '输' + score + 'x' + daqiang;
				}
			}
			var rate = 1;
			if(myChairIndex >= 0 && chairIndex >= 0) {
				rate = resout.rateArr[chairIndex]*resout.rateArr[myChairIndex];
			}
			str = '翻倍';
			if(rate === 1) { str = '不翻倍'; }
			for(var i = 0; i < 3; ++i) {
				score += resout.scoresArr[myChairIndex][chairIndex][i];
			}
			if(score >= 0) {
				url = 'Font/fnt_game2';
			} else {
				url = 'Font/fnt_game1';
			}
			// 显示怪牌分
			if(resout.guaipaiScoreArr[myChairIndex]+resout.guaipaiScoreArr[chairIndex] > 0) {
				var guaiScore = resout.guaipaiScoreArr[myChairIndex] - resout.guaipaiScoreArr[chairIndex];
				var guaiStr = '怪牌+' + guaiScore;
				var guaiUrl = 'Font/fnt_game2';
				if(guaiScore < 0) { 
					guaiUrl = 'Font/fnt_game1'; 
					guaiStr = '怪牌' + guaiScore;
				}
				cc.loader.loadRes(guaiUrl, cc.Font, function(err, font) {
					this.guaiLabel.font = font;
					this.guaiLabel.string = guaiStr;
					this.guaiLabel.node.active = true;
				}.bind(this));
			}
		}
		cc.loader.loadRes(url, cc.Font, function(err, font) {
			if(! err) { 
				this.zongfenLabel.font = font; 
				this.zongfenLabel.string = str;
				this.zongfenLabel.node.active = true;
			}
		}.bind(this));
	},

	// 亮牌状态
	setCardType7: function(resout) {
		if(this.chairId !== TWModel.getMyChairId() || !this.canFanpai) {
			return;
		}
		var cardsArr = TWModel.getCardsArr();
		this.cardType = 7;
		var chairIndex = TWModel.getChairIdIndex(this.chairId);
		var cardIdArr = cardsArr[chairIndex];
		for(var i = 0; i < 13; ++i) {
			this.setNodeSpriteFrame('ThirteenWater/TWCard/'+cardIdArr[i], this.cardNodeArr[i]);
		}
		this.gameTypeSprite.node.active = false;
	},

	// 暗牌状态
	setCardType8: function() {
		if(this.chairId !== TWModel.getMyChairId() || !this.canFanpai) {
			return;
		}
		var cardsArr = TWModel.getCardsArr();
		var chairIndex = TWModel.getChairIdIndex(this.chairId);
		var cardIdArr = cardsArr[chairIndex];
		this.cardType = 2;
		for(var i = 0; i < 13; ++i) {
			this.setNodeSpriteFrame('ThirteenWater/TWCard/card_back', this.cardNodeArr[i]);
		}
		if(TWModel.getMianbai(chairIndex)) {
			this.gameTypeSprite.node.active = true;
		} else {
			this.gameTypeSprite.node.active = false;
		}
	},

	daqiangAnimal: function(resout, begPos) {
		var memberCount = resout.cardsArr.length;
		var daqiangArr = [];
		for(var i = 0; i < resout.daqiangArr.length; ++i) {
			daqiangArr[i] = [];
			for(var j = 0; j < resout.daqiangArr[i].length; ++j) {
				daqiangArr[i][j] = resout.daqiangArr[i][j];
			}
		}
		// 怪牌打枪数据添加
		for(var k = 0; k < daqiangArr.length; ++k) {
			if(TWModel.getMianbai(k)) {
				for(var m = 0; m < daqiangArr.length; ++m) {
					if(m !== k && !TWModel.getMianbai(m)) {
						daqiangArr[k][m] = 2;
					}
				}
			}
		}
		var index = 0;
		if(begPos) { index = begPos; }
		var self = this;
		var hasSanChuan = self.hasSanChuan(resout.daqiangArr);
		if(!TWModel.getGameRule().otherRule.youSanChuan) {
			hasSanChuan = false;
		}
		var func = function() {
			while(index < memberCount*memberCount && daqiangArr[Math.floor(index/memberCount)][index%memberCount] <= 1) {
				++ index;
			}
			if(index >= memberCount*memberCount) {
				if(hasSanChuan) {
					var mgr = self.node.parent.getComponent('TWMainDialog');
					mgr.glassAnimal(function() {
						self.createSettleDialog();
					});
					self.unschedule(func);
				} else {
					self.createSettleDialog();
					self.unschedule(func);
				}
				return;
			}
			var i = Math.floor(index/memberCount);
			var j = index%memberCount;
			if(self.chairId === i) {
				self.gunSprite.node.active = true;
				self.gunSprite.node.opacity = 255;
				self.threeGunAnimal(self.gunSprite.node, index, memberCount);
			}
			else if(self.chairId === j) {
				self.holesNode.active = true;
				self.holesNode.opacity = 255;
				self.threeHoleAnimal(self.holesNode);
			}
			else {
				self.gunSprite.node.active = false;
			}
			++ index;
		};
		func();
		if(index < memberCount*memberCount) {
			this.schedule(func, this.gunSecond);
		}
	},

	createSettleDialog: function() {
		var myChairIndex = TWModel.getChairIdIndex(TWModel.getMyChairId());
		var self = this;
		var resout = TWModel.getResout();
		this.scheduleOnce(function() { 
			self.setCardType6(resout, true); 
		}, this.turnSecond/2);
		this.scheduleOnce(function() { 
			self.gunSprite.node.active = false;
			self.holesNode.active = false;
			if(self.chairId === TWModel.getMyChairId() && myChairIndex >= 0) {
				Global.DialogManager.createDialog('ThirteenWater/TWSettleDialog');
				if(! TWModel.getPlayerByChairId(self.chairId)) {
					self.node.active = false;
				}
			}
			//self.showMainContinueButton();
			for(var i = 0; i < 5; ++i) {
				self.holesNode.getChildByName('HoleSprite'+(i+1)).active = false;
			}
			self.isOnAniaml = false;
		}, this.turnSecond*1.5);
	},

	//是否是三穿
	hasSanChuan: function(arr) {	
		var i, j, count;
		for(i = 0; i < arr.length; ++i) {
			count = 0;
			for(j = 0; j < arr[i].length; ++j) {
				if(arr[i][j] > 1) {
					++ count;
				}
			}
			if(count === 3) {
				return true;
			}
		}
		return false;
	},

	threeGunAnimal: function(node, index, memberCount) {
		Global.AudioManager.playSound('ThirteenWater/TWSound/tw_sanqiang2');
		if(! node) { node = this.gunSprite.node; }
		var self = this;
		var bottomChairId = TWModel.getMyChairId();
		var posNameArr = ['bottom', 'right', 'top', 'left'];
		var myDir = posNameArr[(this.chairId-bottomChairId+4)%4];			// 此枪所在位置
		var gunDir = posNameArr[(index%memberCount+4-bottomChairId)%4];		// 枪打的位置
		var offX = 14, offR = 16;
		if(myDir === 'bottom') {
			if(gunDir === 'right') {
				node.scaleX = -2.5;
				offX = -offX;
				offR = -offR;
			}
			else if(gunDir === 'top') {
				node.rotation = 40;
			}
		}
		else if(myDir === 'right') {
			if(gunDir === 'left') {
				node.rotation = -50;
			}
			else if(gunDir === 'bottom') {
				node.rotation = -110;
			}
		}
		else if(myDir === 'top') {
			if(gunDir === 'left') {
				node.rotation = -105;
			}
			else if(gunDir === 'bottom') {
				node.rotation = -140;
			}
			else if(gunDir === 'right') {
				node.rotation = -180;
			}
		}
		else if(myDir === 'left') {
			offX = -offX;
			offR = -offR;
			if(gunDir === 'right') {
				node.rotation = 50;
			}
			else if(gunDir === 'right') {
				node.rotation = 50;
			}
			else if(gunDir === 'bottom') {
				node.rotation = 105;
			}
		}
		node.runAction(cc.sequence(
			cc.spawn(cc.moveBy(0.1, cc.p(offX, 0)), cc.rotateBy(0.1, offR)),
			cc.spawn(cc.moveBy(0.1, cc.p(-offX, 0)), cc.rotateBy(0.1, -offR)),
			cc.delayTime(0.1),
			cc.spawn(cc.moveBy(0.1, cc.p(offX, 0)), cc.rotateBy(0.1, offR)),
			cc.spawn(cc.moveBy(0.1, cc.p(-offX, 0)), cc.rotateBy(0.1, -offR)),
			cc.delayTime(0.1),
			cc.spawn(cc.moveBy(0.1, cc.p(offX, 0)), cc.rotateBy(0.1, offR)),
			cc.spawn(cc.moveBy(0.1, cc.p(-offX, 0)), cc.rotateBy(0.1, -offR)),
			cc.callFunc(function() {
				node.opacity = 0;
				node.rotation = 0;
				if(myDir === 'bottom') {
					node.scaleX = 2.5;
				}
			})
		));
	},

	oneGunAnimal: function(node) {
		Global.AudioManager.playSound('ThirteenWater/TWSound/tw_yiqiang');
		if(! node) { node = this.gunSprite.node; }
		node.runAction(cc.sequence(
			cc.moveBy(0.2, cc.p(8, 8)),
			cc.moveBy(0.2, cc.p(-8, -8))
		));
		node.runAction(cc.sequence(
			cc.rotateBy(0.2, +3),
			cc.rotateBy(0.2, -3)
		));
	},

	threeHoleAnimal: function(node) {
		if(! node) { node = this.holesNode; }
		var holeNameArr = ['HoleSprite1', 'HoleSprite2', 'HoleSprite3', 'HoleSprite4', 'HoleSprite5'];
		if(node.getChildByName(holeNameArr[1]).active === true) {
			node.runAction(cc.sequence(
				cc.callFunc(function() {
					node.getChildByName(holeNameArr[0]).active = true;
				}),
				cc.delayTime(0.3),
				cc.callFunc(function() {
					node.getChildByName(holeNameArr[3]).active = true;
				})
			));
		} else {
			node.runAction(cc.sequence(
				cc.callFunc(function() {
					node.getChildByName(holeNameArr[1]).active = true;
				}),
				cc.delayTime(0.3),
				cc.callFunc(function() {
					node.getChildByName(holeNameArr[2]).active = true;
				}),
				cc.delayTime(0.3),
				cc.callFunc(function() {
					node.getChildByName(holeNameArr[4]).active = true;
				})
			));
		}
	},

	oneHoleAnimal: function(node) {
		if(! node) { node = this.holesNode; }
		//node.active = true;
		var holeNameArr = ['HoleSprite1', 'HoleSprite2', 'HoleSprite3', 'HoleSprite4', 'HoleSprite5'];
		var i;
		var random = Math.floor(Math.random()*5);
		for(i = 0; i < holeNameArr.length; ++i) {
			node.getChildByName(holeNameArr[i]).active = false;
		}
		node.runAction(cc.sequence(
			cc.delayTime(0.2),
			cc.callFunc(function() {
				node.getChildByName(holeNameArr[random]).active = true;
			})
		));
	},

	setNodeSpriteFrame: function(url, node) {
		cc.loader.loadRes(url, cc.SpriteFrame, function(err, spriteFrame) {
			if(! err) {
				node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
			}
		});
	},


	getTypeUrlByCardArr: function(cardArr, type) {
		var url = 'ThirteenWater/TWSort/danpai';
		if(TWLogic.hasYitiaolong(cardArr)) {
			url = 'ThirteenWater/TWSort/yitiaolong';
		}
		else if(TWLogic.hasLiuduiban(cardArr)) {
			url = 'ThirteenWater/TWSort/liuduiban';
		}
		else if(TWLogic.hasSanhua(cardArr)) {
			url = 'ThirteenWater/TWSort/sanhua';
		}
		else if(TWLogic.hasSanshun(cardArr)) {
			url = 'ThirteenWater/TWSort/sanshun';
		}
		else if(TWLogic.hasTonghuashun(cardArr)) {
			url = 'ThirteenWater/TWSort/tonghuashun';
		}
		else if(TWLogic.hasSitiao(cardArr)) {
			url = 'ThirteenWater/TWSort/sitiao';
		}
		else if(TWLogic.hasHulu(cardArr)) {
			url = 'ThirteenWater/TWSort/hulu';
		}
		else if(TWLogic.hasTonghua(cardArr)) {
			url = 'ThirteenWater/TWSort/tonghua';
		}
		else if(TWLogic.hasShunzi(cardArr)) {
			url = 'ThirteenWater/TWSort/shunzi';
		}
		else if(TWLogic.hasSantiao(cardArr)) {
			url = 'ThirteenWater/TWSort/santiao';
			if(type && type === 'tou') {
				url = 'ThirteenWater/TWSort/jingang';
			}
		}
		else if(TWLogic.hasLiangdui(cardArr)) {
			url = 'ThirteenWater/TWSort/liangdui';
		}
		else if(TWLogic.hasDuizi(cardArr)) {
			url = 'ThirteenWater/TWSort/duizi';
		}
		return url;
	},

	getSoundUrlByCardArr: function(cardArr, type) {
		var url = 'ThirteenWater/TWSound/tw_danpai';
		if(TWLogic.hasYitiaolong(cardArr)) {
			url = 'ThirteenWater/TWSound/tw_yitiaolong';
		}
		else if(TWLogic.hasLiuduiban(cardArr)) {
			url = 'ThirteenWater/TWSound/tw_liuduiban';
		}
		else if(TWLogic.hasSanhua(cardArr)) {
			url = 'ThirteenWater/TWSound/tw_sanhua';
		}
		else if(TWLogic.hasSanshun(cardArr)) {
			url = 'ThirteenWater/TWSound/tw_shanshun';
		}
		else if(TWLogic.hasTonghuashun(cardArr)) {
			url = 'ThirteenWater/TWSound/tw_tonghuashun';
		}
		else if(TWLogic.hasSitiao(cardArr)) {
			url = 'ThirteenWater/TWSound/tw_sitiao';
		}
		else if(TWLogic.hasHulu(cardArr)) {
			url = 'ThirteenWater/TWSound/tw_hulu';
		}
		else if(TWLogic.hasTonghua(cardArr)) {
			url = 'ThirteenWater/TWSound/tw_tonghua';
		}
		else if(TWLogic.hasShunzi(cardArr)) {
			url = 'ThirteenWater/TWSound/tw_shunzi';
		}
		else if(TWLogic.hasSantiao(cardArr)) {
			url = 'ThirteenWater/TWSound/tw_santiao';
			if(type && type === 'tou') {
				url = 'ThirteenWater/TWSound/tw_jingang';
			}
		}
		else if(TWLogic.hasLiangdui(cardArr)) {
			url = 'ThirteenWater/TWSound/tw_liangdui';
		}
		else if(TWLogic.hasDuizi(cardArr)) {
			url = 'ThirteenWater/TWSound/tw_duizi';
		}
		return url;
	},

	//showMainContinueButton: function() {
	//	var pnode = this.node.parent;
	//	if(TWModel.getGameEndData() !== null) {
	//		pnode.getChildByName('ExitButton').active = true;
	//	} else {
	//		pnode.getChildByName('ContinueButton').active = true;
	//	}
	//},

	getIsOnAnimal: function() {
		return this.isOnAniaml;
	},

	update: function(dt) {

	}
});

