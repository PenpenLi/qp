var NNModel = require('./NNModel');
var NNProto = require('./NNProto');
var RoomProto = require('../../API/RoomProto');
var GameLogic = require('./NNLogic');
var HallApi = require('../../API/HallAPI');
var RoomMessageRouter = 'game.gameHandler.roomMessageNotify';
var GameMessageRouter = 'game.gameHandler.gameMessageNotify';

cc.Class({
    extends: cc.Component,

    properties: {
		cardItem: cc.Prefab,
		headItem: cc.Prefab,
		roomIdLabel: cc.Label,
		pourScoreNode: cc.Node,
		curBureauLabel: cc.Label,
		readyButton: cc.Button,
		robButton: cc.Button,
		norobButton: cc.Button,
		watchCardItem: cc.Prefab,
		rateRobNode: cc.Node,
		clockNode: cc.Node,
		clockLabel: cc.Label,
		stateLabel: cc.Label,
		audioItem: cc.Prefab,
    },

    onLoad: function () {
		var audioItem = cc.instantiate(this.audioItem);
		audioItem.parent = this.node;
		this.audioManager = audioItem.getComponent('NNAudioNode');
		this.cardItemArr = [];
		this.headItemArr = [];
		var chairCount = NNModel.getChairCount();
		var headPosArr = this.getHeadPosArr(chairCount);
		var cardPosArr = this.getCardPosArr(chairCount);
		for(var m = 0; m < chairCount; ++m) {
			var cardItem = cc.instantiate(this.cardItem);
			cardItem.parent = this.node;
			cardItem.active = false;
			cardItem.setPosition(cardPosArr[m]);
			cardItem.setScale(cardPosArr[m].s, cardPosArr[m].s);
			this.cardItemArr.push(cardItem);
		}
		for(var i = 0; i < chairCount; ++i) {
			var headItem = cc.instantiate(this.headItem);
			headItem.parent = this.node;
			headItem.setPosition(headPosArr[i]);
			headItem.active = false;
			this.headItemArr.push(headItem); 
		}
		this.watchCardNode = cc.instantiate(this.watchCardItem);
		this.watchCardNode.parent = this.node;
		this.watchCardNode.setPosition(cc.p(0, -259));
		Global.MessageCallback.addListener('RoomMessagePush', this);
		Global.MessageCallback.addListener('GameMessagePush', this);
		Global.MessageCallback.addListener('ReConnectSuccess', this);
		this.offLineAndClient();
    },

	// 恢复场景
	offLineAndClient: function() {
		var chairCount = NNModel.getChairCount();
		var myChairId = NNModel.getMyChairId();
		var gameRule = NNModel.getGameRule();
		for(var i = 0; i < chairCount; ++i) {
			this.cardItemArr[i].active = false;
			this.headItemArr[i].active = false;
		}
		for(var j = 0; j < chairCount; ++j) {
			if(NNModel.getPlayerByChairId(j)) {
				this.showHeadAndCardByChairId(j);
			} 
		}
		var gameStatus = NNModel.getGameStatus();
		var myChairIndex = NNModel.getChairIdIndex(myChairId);
		if(gameStatus === NNProto.GAME_STATUS_PREPARE) {
			var player = NNModel.getPlayerByChairId(myChairId);
			if((player.userStatus&RoomProto.userStatusEnum.READY) === 0) {
				this.readyButton.node.active = true;
				this.autoExitRoom();
			}
			this.stateLabel.node.active = true;
			this.stateLabel.string = '等待所有玩家准备';
		}
		else if(gameStatus === NNProto.GAME_STATUS_POURSCORE) {
			if(myChairId !== NNModel.getBankChairId()) {
				var pourScoreArr = NNModel.getPourScoreArr();
				if(myChairIndex >= 0 && pourScoreArr[myChairIndex] === 0) {
					this.answerCanPourScorePush(gameStatus, NNModel.getCanPourScoreArr(), true);
				}
			}
			this.stateLabel.node.active = true;
			this.stateLabel.string = '等待所有玩家下注';
		}
		else if(gameStatus === NNProto.GAME_STATUS_SORTCARD) {
			this.pourScoreNode.active = false;
		}
		else if(gameStatus === NNProto.GAME_STATUS_ROBBANK) {
			var robBankArr = NNModel.getRobBankArr();
			if(gameRule.otherRule.shangzhuang === GameLogic.rule.shangzhuang.ziyouqiangzhuang) {
				if(myChairIndex >= 0 && robBankArr[myChairIndex] === -1) {
					this.robButton.node.active = true;
					this.norobButton.node.active = true;
				} else {
					this.robButton.node.active = false;
					this.norobButton.node.active = false;
				}
			} else {
				if(myChairIndex >= 0 && robBankArr[myChairIndex] === -1) {
					this.showRateRobButton();
				} else {
					this.rateRobNode.active = false;
				}
			}
			this.stateLabel.node.active = true;
			this.stateLabel.string = '等待所有玩家抢庄';
		}

		for(var k = 0; k < chairCount; ++k) {
			if(NNModel.getPlayerByChairId(k)) {
				var index = (k+chairCount-myChairId)%chairCount;
				this.headItemArr[index].getComponent('NNHeadItem').offLineAndClient();
				this.cardItemArr[index].getComponent('NNCardItem').offLineAndClient();
			}
		}
		this.watchCardNode.getComponent('NNWatchCardNode').offLineAndClient();
	},

	messageCallbackHandler: function(router, msg) {
		var myChairId = NNModel.getMyChairId();
		if(router === 'RoomMessagePush') {
			if(msg.type === RoomProto.USER_LEAVE_ROOM_RESPONSE) {
				if(msg.data.chairId === myChairId) {
					Global.DialogManager.removeLoadingCircle();
				}
			}
			else if(msg.type === RoomProto.OTHER_USER_ENTRY_ROOM_PUSH) {
				this.showHeadAndCardByChairId(msg.data.roomUserInfo.chairId);
			}
			else if(msg.type === RoomProto.USER_LEAVE_ROOM_PUSH) {
				this.hideHeadItemByChairId(msg.data.roomUserInfo.chairId);
			}
			else if(msg.type === RoomProto.USER_READY_PUSH) {
				this.answerUserReadyPush(msg.data.chairId);
			}
			else if(msg.type === RoomProto.GAME_END_PUSH) {
			}
			else if(msg.type === RoomProto.ROOM_DISMISS_PUSH) {
			}
		}
		else if(router === 'GameMessagePush') {
			if(msg.type === NNProto.CAN_POUR_SCORE_PUSH) {
				this.answerCanPourScorePush(msg.data.gameStatus, msg.data.scoresArr, false);
			}
			else if(msg.type === NNProto.POUR_SCORE_PUSH) {
				this.answerPourScorePush(msg.data.chairId);
			}
			else if(msg.type === NNProto.RESOUT_CARD_PUSH) {
				this.answerResoutCardPush();
			}
			else if(msg.type === NNProto.FOUR_CARD_PUSH) {
				this.answerFourCardPush();
			}
			else if(msg.type === NNProto.SHOW_CARD_PUSH) {
				this.answerShowCardPush(msg.data.chairId, msg.data.cardArr);
			}
			else if(msg.type === NNProto.GAME_RESOUT_PUSH) {
				this.answerGameResoutPush(msg.data.finalScoreArr, msg.data.bankIndex);
			}
			else if(msg.type === NNProto.GAME_STATUS_PUSH) {
				this.answerGameStatusPush(msg.data.gameStatus);
			}
			else if(msg.type === NNProto.ROB_RATE_BANK_PUSH) {
				this.answerRobRateBank(msg.data.chairId);
			}
			else if(msg.type === RoomProto.USER_RECONNECT_PUSH) {
				Global.DialogManager.destroyDialog('Niuniu/NNMainDialog');
				NNModel.setGameData(msg.data.gameData);
				Global.DialogManager.createDialog('Niuniu/NNMainDialog');
			}
		}
		else if(router === 'ReConnectSuccess') {
			//Global.NetworkManager.notify(RoomMessageRouter, RoomProto.getUserReconnectNotifyData());
			if(Global.Player.isInRoom()) {
				Global.API.hall.joinRoomRequest(NNModel.getRoomId(), function() {
					Global.NetworkManager.notify(RoomMessageRouter, RoomProto.getUserReconnectNotifyData());
				});
			} else {
				Global.DialogManager.addPopDialog('当前房间已解散！', function () {
					Global.DialogManager.createDialog('Hall/HallDialog', null, function () {
						Global.DialogManager.destroyDialog('Niuniu/NNMainDialog');
					});
				});
			}
		}
	},

	answerCanPourScorePush: function(gameStatus, scoresArr, isOffLine) {
		var gameRule = NNModel.getGameRule();
		var robBankArr = NNModel.getRobBankArr();
		var myChairIndex = NNModel.getChairIdIndex(NNModel.getMyChairId());
		if(myChairIndex >= 0) {
			this.runClock(NNProto.AUTO_POURGOLD_TM);
		}
		for(var j = 4; j >= 0; --j) {
			var robCount = 0;
			for(var i = 0; i < robBankArr.length; ++i) {
				if(robBankArr[i] === j) { ++ robCount; }
			}
			if(robCount > 0) { break; }
		}
		if(robCount === 1) {
			this.pourScoreNode.active = true;
		} else {
			var delay = 4*robCount*0.1;
			for(var k = 0; k <= NNModel.getBankChairId(); ++k) {
				if(robBankArr[k] === j) { delay += 0.1; }
			}
			this.scheduleOnce(function() {
				this.pourScoreNode.active = true;
			}.bind(this), delay);
		}
	},

	answerPourScorePush: function(chairId) {
		if(chairId === NNModel.getMyChairId()) {
			this.pourScoreNode.active = false;
			this.stopClock();
		}
	},

	// 玩家久不准备自动离开房间
	autoExitRoom: function() {
		if(! this.autoExitCall) {
			this.autoExitCall = function() {
				var user = NNModel.getPlayerByChairId(NNModel.getMyChairId());
				if((user.userStatus&RoomProto.userStatusEnum.READY) === 0) {
					Global.DialogManager.removeLastPopDialog();	// 去掉确认弹出框
					Global.NetworkManager.notify(RoomMessageRouter, RoomProto.getAskForDismissNotifyData());
				}
			};
		}
		this.scheduleOnce(this.autoExitCall, NNProto.AUTO_LEAVEROOM_TM);
		this.runClock(NNProto.AUTO_LEAVEROOM_TM);
	},

	runClock: function(tick) {
		var self = this;
		this.clockNode.active = true;
		this.tick = tick;
		this.clockLabel.string = this.tick;
		if(! this.clockCallFunc) {
			this.clockCallFunc = function() {
				-- self.tick;
				if(self.tick < 0) { self.tick = 0; }
				if(self.clockNode.active && self.tick <= 5) {
					self.audioManager.playTick();
				}
				self.clockLabel.string = self.tick;
			};
			this.schedule(this.clockCallFunc, 1);
		}
	},

	stopClock: function() {
		this.clockNode.active = false;
	},

	answerResoutCardPush: function() {
		this.watchCardNode.active = true;
		this.stopClock();
		var myChairIndex = NNModel.getChairIdIndex(NNModel.getMyChairId());
		if(myChairIndex >= 0) {
			this.runClock(NNProto.AUTO_SHOWCARD_TM);
		}
		this.stateLabel.string = '等待所有玩家开牌';
		this.stateLabel.node.active = true;
	},

	answerFourCardPush: function() {
		this.stopClock();
		var myChairIndex = NNModel.getChairIdIndex(NNModel.getMyChairId());
		if(myChairIndex >= 0) {
			this.runClock(NNProto.AUTO_POURGOLD_TM);
		}
	},

	answerGameResoutPush: function(finalScoreArr, bankIndex) {
		this.stateLabel.node.active = false;
		var gameRule = NNModel.getGameRule();
		var posArr = this.getHeadPosArr(6);
		var myChairId = NNModel.getMyChairId();
		var myChairIndex = NNModel.getChairIdIndex(myChairId);
		var bankChairId = NNModel.getChairIdByIndex(bankIndex);
		var chairCount = NNModel.getChairCount();
		this.stopClock();

		var self = this;
		var callFunc = function() {
			for(var i = 0; i < finalScoreArr.length; ++i) {
				if(i !== bankIndex) {
					if(finalScoreArr[i] > 0) {
						var sPos = posArr[(bankChairId+chairCount-myChairId)%chairCount];
						var ePos = posArr[(NNModel.getChairIdByIndex(i)+chairCount-myChairId)%chairCount];
						self.goldAnimal(self.node, sPos, ePos);
					}
				}
			}
		};
		for(var i = 0; i < finalScoreArr.length; ++i) {
			if(i !== bankIndex) {
				if(finalScoreArr[i] < 0) {
					var sPos = posArr[(NNModel.getChairIdByIndex(i)+chairCount-myChairId)%chairCount];
					var ePos = posArr[(bankChairId+chairCount-myChairId)%chairCount];
					this.goldAnimal(this.node, sPos, ePos);
				}
			}
		}
		this.scheduleOnce(callFunc, 0.65);
		this.scheduleOnce(function() { self.readyButton.node.active = true; }, 1.3);
	},

	answerShowCardPush: function(chairId, cardArr) {
		if(chairId === NNModel.getMyChairId()) {
			this.watchCardNode.active = false;
		}
	},

	answerGameStatusPush: function(gameStatus) {
		if(gameStatus === NNProto.GAME_STATUS_PREPARE) {
			this.autoExitRoom();
			this.stateLabel.string = '等待所有玩家准备';
			this.stateLabel.node.active = true;
		}
		else if(gameStatus === NNProto.GAME_STATUS_POURSCORE) {
			this.stateLabel.string = '等待所有玩家下注';
			this.stateLabel.node.active = true;
			this.curBureauLabel.string = NNModel.getCurBureau() + '/' + NNModel.getMaxBureau();
		}
		else if(gameStatus === NNProto.GAME_STATUS_SORTCARD) {
			this.pourScoreNode.active = false;
		}
		else if(gameStatus === NNProto.GAME_STATUS_ROBBANK) {
			this.stateLabel.string = '等待所有玩家抢庄';
			this.stateLabel.node.active = true;
			var gameRule = NNModel.getGameRule();
			if(gameRule.otherRule.shangzhuang === GameLogic.rule.shangzhuang.ziyouqiangzhuang) {
				this.robButton.node.active = true;
				this.norobButton.node.active = true;
			}
			else if(gameRule.otherRule.shangzhuang === GameLogic.rule.shangzhuang.mingpaiqiangzhuang) {
				this.showRateRobButton();
			}
		}
	},

	answerRobRateBank: function(chairId) {
		if(chairId === NNModel.getMyChairId()) {
			this.rateRobNode.active = false;
			this.stopClock();
		}
	},

	answerUserReadyPush: function(chairId) {
		if(chairId === NNModel.getMyChairId()) {
			this.readyButton.node.active = false;
			this.stopClock();
			if(this.autoExitCall) {
				this.unschedule(this.autoExitCall);
			}
		}
	},

	showRateRobButton: function() {
		this.rateRobNode.active = true;
		//var maxRate = NNModel.getGameRule().otherRule.qiangzhuang;
		//for(var i = maxRate+1; i <= 4; ++i) {
		//	this.rateRobNode.getChildByName('RobButton'+i).active = false;
		//}
		//this.rateRobNode.x = (4-maxRate)*112/2;
	},

	onButtonClick: function(event, param) {
		if(param === 'dismiss') {
			Global.DialogManager.addPopDialog('确认退出游戏?', function() {
				Global.NetworkManager.notify(RoomMessageRouter, RoomProto.getAskForDismissNotifyData());
				Global.DialogManager.addLoadingCircle();
			}, function() {});
		}
		else if(param === 'setting') {
			var self = this;
            Global.DialogManager.createDialog('Setting/SettingDialog', {
				callback: self.audioManager.setVolume.bind(self.audioManager)
			});
		}
		else if(param === 'rule') {
            Global.DialogManager.createDialog('Niuniu/NNGameRuleDialog');
		}
		else if(param === 'ready') {
			Global.NetworkManager.notify(RoomMessageRouter, RoomProto.userReadyNotify(true));
		}
		else if(param === 'free_rob') {
			Global.NetworkManager.notify(GameMessageRouter, NNProto.getRobFreeBankNotifyData(true));
		}
		else if(param === 'free_no_rob') {
			Global.NetworkManager.notify(GameMessageRouter, NNProto.getRobFreeBankNotifyData(false));
		}
		else if(param === 'rate_no_rob') {
			Global.NetworkManager.notify(GameMessageRouter, NNProto.getRobRateBankNotifyData(0));
		}
		else if(param === 'rob_1') {
			Global.NetworkManager.notify(GameMessageRouter, NNProto.getRobRateBankNotifyData(1));
		}
		else if(param === 'rob_2') {
			Global.NetworkManager.notify(GameMessageRouter, NNProto.getRobRateBankNotifyData(2));
		}
		else if(param === 'rob_3') {
			Global.NetworkManager.notify(GameMessageRouter, NNProto.getRobRateBankNotifyData(3));
		}
		else if(param === 'rob_4') {
			Global.NetworkManager.notify(GameMessageRouter, NNProto.getRobRateBankNotifyData(4));
		}
		else if(param === 'pour_1') {
			Global.NetworkManager.notify(GameMessageRouter, NNProto.getPourScoreNotifyData(1));
		}
		else if(param === 'pour_2') {
			Global.NetworkManager.notify(GameMessageRouter, NNProto.getPourScoreNotifyData(2));
		}
		else if(param === 'pour_3') {
			Global.NetworkManager.notify(GameMessageRouter, NNProto.getPourScoreNotifyData(3));
		}
		else if(param === 'pour_4') {
			Global.NetworkManager.notify(GameMessageRouter, NNProto.getPourScoreNotifyData(4));
		}
		else if(param === 'pour_5') {
			Global.NetworkManager.notify(GameMessageRouter, NNProto.getPourScoreNotifyData(5));
		}
		else if(param === 'watch_card') {
			Global.NetworkManager.notify(GameMessageRouter, NNProto.getShowCardNotifyData());
		}
	},

	showHeadAndCardByChairId: function(chairId) {
		var myChairId = NNModel.getMyChairId();
		var chairCount = NNModel.getChairCount();
		var index = (chairId+chairCount-myChairId)%chairCount;
		this.headItemArr[index].active = true;
		this.cardItemArr[index].active = true;
		var headMgr = this.headItemArr[index].getComponent('NNHeadItem');
		var cardMgr = this.cardItemArr[index].getComponent('NNCardItem');
		if(chairCount === 4) {
			var pos = ['bottom', 'right', 'top', 'left'][index];
		} else {
			pos = ['bottom', 'right', 'right', 'top', 'left', 'left'][index];
		}
		headMgr.setHeadPosAndChairId(pos, chairId);
		cardMgr.setCardPosAndChairId(pos, chairId);
	},

	hideHeadItemByChairId: function(chairId) {
		var myChairId = NNModel.getMyChairId();
		var chairCount = NNModel.getChairCount();
		var index = (chairId+chairCount-myChairId)%chairCount;
		this.headItemArr[index].active = false;
		this.cardItemArr[index].active = false;
		if(chairId === myChairId) {
			Global.Player.setPy('roomID', null);
			Global.DialogManager.createDialog('Hall/HallDialog', null, function () {
				Global.DialogManager.removeLoadingCircle();
				Global.DialogManager.destroyDialog('Niuniu/NNMainDialog');
			});
		}
	},

	getHeadPosArr: function(num) {
		var pos = [{x: -216, y: -436}, {x: 297, y: -96}, {x: 297, y: 153},
			{x: -113, y: 362}, {x: -292, y: 153}, {x: -292, y: -96}, ];
		if(num >= 2 && num <= 4) {
			pos = [ {x: -216, y: -436}, {x: 297, y: 0}, {x: -113, y: 362}, {x: -292, y: 0}, ];
		}
		return pos;
	},

	getCardPosArr: function(num) {
		var pos = [
			{x: 29, y: -437, s: 0.7},
			{x: 126, y: -83, s: 0.5},
			{x: 126, y: 166, s: 0.5},
			{x: 51, y: 372, s: 0.5},
			{x: -130, y: 166, s: 0.5},
			{x: -130, y: -83, s:0.5}
		];
		if(num === 4) {
			pos = [
				{x: 29, y: -437, s: 0.7},
				{x: 126, y: 0, s: 0.5},
				{x: 51, y: 372, s: 0.5},
				{x: -130, y: 0, s:0.5}
			];
		}
		return pos;
	},

	goldAnimal: function(pNode, sPos, ePos, cb) {
		var nodeArr = [];
		var goldCount = 10;
		var offPos = [{x: -3, y: 3}, {x: 3, y: 3}, {x: 0, y: -3}];
		for(var i = 0; i < goldCount; ++i) {
			nodeArr.push(new cc.Node());
			Global.Tools.updateSpriteFrame('Niuniu/Common/nn_gold', nodeArr[i].addComponent(cc.Sprite));
			nodeArr[i].parent = pNode;
			var pos = cc.p(sPos.x+offPos[i%3].x, sPos.y+offPos[i%3].y);
			nodeArr[i].setPosition(pos);
		}
		i = 0;
		//var delay = Math.sqrt((sPos.x-ePos.x)*(sPos.x-ePos.x)+(sPos.y-ePos.y)*(sPos.y-ePos.y))/1500;
		var delay = 0.5;
		var self = this;
		var callFunc = function() {
			if(i < goldCount) {
				nodeArr[i].active = true;
				var pos = cc.p(ePos.x+offPos[i%3].x, ePos.y+offPos[i%3].y);
				nodeArr[i].runAction(cc.moveTo(delay-i*0.03, pos));
				++i;
			} else {
				self.unschedule(callFunc);
			}
		};
		this.schedule(callFunc, 0.03);
		this.scheduleOnce(function() {
			for(i = 0; i < goldCount; ++i) {
				nodeArr[i].removeFromParent();
			}
			if(cb) {
				cb();
			}
		}, delay+0.15);
	},

	getHeadItemByChairId: function(chairId) {
		var myChairId = NNModel.getMyChairId();
		var chairCount = NNModel.getChairCount();
		var index = (chairId+chairCount-myChairId)%chairCount;
		return this.headItemArr[index];
	},

	onDestroy: function() {
		Global.MessageCallback.removeListener('RoomMessagePush', this);
		Global.MessageCallback.removeListener('GameMessagePush', this);
		Global.MessageCallback.removeListener('ReConnectSuccess', this);
	},

	getAudioManager: function() {
		return this.audioManager;
	},
});
