var model = module.exports;
var TWLogic = require('./TWLogic');
var GameProto = require('./TWProto');
var RoomProto = require('../../API/RoomProto');

model.setEntryRoomData = function(msg) {
	var data = msg.gameData;
	this.userArr = msg.roomUserInfoArr || this.userArr;
	this.roomId = data.roomId;
	this.gameRule = data.gameRule;
	this.askForExitArr = data.askForExitArr;
	this.curDureau = data.curDureau;
	this.maxDureau = data.maxDureau;
	//this.curScoreArr = data.curScoreArr;
	this.gameStatus = data.gameStatus;
	this.gameStartedOnce = data.gameStartedOnce;
	this.gameStartTm = data.gameStartTm || this.gameStartTm;
	this.cardsArr = data.cardsArr;
	this.askExitTm = data.askExitTm;
	this.sortCardChairArr = data.sortCardChairArr;
	this.mianbaiArr = data.mianbaiArr;
	this.resout = data.resout || this.resout;
	this.gameSettleTm = data.gameSettleTm || this.gameSettleTm;
	this.canExit = true;
	this.gameEndData = null;
	this.gameStartChairIdArr = data.gameStartChairIdArr;
	this.profitPercentage = data.profitPercentage;

	this.delPlayerList = [];
	this.myUid = Global.Player.getPy('uid');
	for(var i = 0; i < this.userArr.length; ++i) {
		if(this.userArr[i].userInfo.uid === this.myUid) {
			this.myChairId = this.userArr[i].chairId;
		}
		this.userArr[i].userInfo.nickname = Global.Tools.convertNickname(this.userArr[i].userInfo.nickname);
	}
	Global.MessageCallback.addListener('RoomMessagePush', this);
	Global.MessageCallback.addListener('GameMessagePush', this);
};

model.setGameData = function(data) {
	for(var key in data) {
		if(data.hasOwnProperty(key) && this.hasOwnProperty(key)) {
			this[key] = data[key];
		}
	}
};

model.onDestroy = function() {
	Global.MessageCallback.removeListener('RoomMessagePush', this);
	Global.MessageCallback.removeListener('GameMessagePush', this);
};

model.messageCallbackHandler = function(router, msg) {
	var myChairId = this.myChairId;
	if(router === 'RoomMessagePush') {
		if(msg.type === RoomProto.USER_OFF_LINE_PUSH) {
			this.setPlayerOffLine(msg.data.chairId);
		}
		else if(msg.type === RoomProto.USER_LEAVE_ROOM_RESPONSE) {
			if(msg.data.chairId === myChairId) {
				this.onDestroy();
			}
		}
		else if(msg.type === RoomProto.ROOM_DISMISS_PUSH) {
			this.onDestroy();
		}
		else if(msg.type === RoomProto.OTHER_USER_ENTRY_ROOM_PUSH) {
			this.addPlayer(msg.data.roomUserInfo);
		}
		else if(msg.type === RoomProto.USER_LEAVE_ROOM_PUSH) {
			this.delPlayer(msg.data.roomUserInfo);
			if(msg.data.roomUserInfo.chairId === myChairId) {
				this.onDestroy();
			}
		}
		else if(msg.type === RoomProto.USER_READY_PUSH) {
			this.setPlayerReady(msg.data.chairId);
		}
		else if(msg.type === RoomProto.ASK_FOR_DISMISS_PUSH) {
			var arr = msg.data.chairIdArr;
			var count = 0;
			this.setAskForExitArr(arr);
			for(var i = 0; i < arr.length; ++i) {
				if(arr[i] !== null) { ++ count; }
			}
			if(count === 1) { this.setAskExitTm(msg.data.tm); }
		}
		//else if(msg.type === RoomProto.GAME_END_PUSH) {
		//	this.setGameEndData(msg.data.resout);
		//}
		else if(msg.type === RoomProto.USER_RECONNECT_PUSH) {
			this.setEntryRoomData(msg.data);
		}
	}
	else if(router === 'GameMessagePush') {
		if(msg.type === GameProto.GAME_CARDS_NOSORT_PUSH) {
			if(msg.data.isNosort) { this.setMianbai(msg.data.chairId); }
		}
		else if(msg.type === GameProto.GAME_CARDS_PUSH) {
			for(var i = 0; i < 4; ++i) {
				this.mianbaiArr[i] = false;
			}
			this.setCardsPushData(msg.data.cardsArr, msg.data.curDureau, msg.data.gameStatus, msg.data.gameStartTm);
			this.setGameStartedOnce(true);
		}
		else if(msg.type === GameProto.GAME_CARDS_SORT_PUSH) {
			if(msg.code === 0) {
				this.insertSortChairArr(msg.data.chairId);
				this.cardsArr[msg.data.chairId] = msg.data.cardArr;
			}
		}
		else if(msg.type === GameProto.GAME_RESOUT_PUSH) {
			this.setResoutData(msg.data.resout, msg.data.gameStatus, msg.data.gameSettleTm);
		}
		else if(msg.type === GameProto.GAME_PREPARE_PUSH) {
			this.setGamePrepareData(msg.data);
		}
	}
};

model.getProfitPercentage = function() {
	return this.profitPercentage/100;
};

model.getRoomId = function() {
	return this.roomId;
};

model.getCurDureau = function() {
	return this.curDureau;
};

model.getMaxDureau = function() {
	return this.maxDureau;
};

model.getMyChairId = function() {
	for(var i = 0; i < this.userArr.length; ++i) {
		if(this.userArr[i].userInfo.uid === this.myUid) {
			return this.userArr[i].chairId;
		}
	}
	return null;
	//return this.myChairId;
};

model.getMyUid = function() {
	return this.myUid;
};

model.getGameStartedOnce = function() {
	if(this.curDureau > 1) { this.gameStartedOnce = true; }
	return this.gameStartedOnce;
};

model.setGameStartedOnce = function(isStarted) {
	this.gameStartedOnce = isStarted;
};

model.getPlayerIsReady = function(uid) {
	var player = this.getPlayerById(uid);
	return ((player.userStatus&RoomProto.userStatusEnum.READY) > 0);
};

model.getPlayerById = function(uid) {
	for(var i = 0; i < this.userArr.length; ++i) {
		if(this.userArr[i].userInfo.uid === uid) {
			return this.userArr[i];
		}
	}
	return null;
};

model.getPlayerByChairId = function(chairId) {
	for(var i = 0; i < this.userArr.length; ++i) {
		if(this.userArr[i].chairId === chairId) {
			return this.userArr[i];
		}
	}
	return null;
};

model.setAskForExitArr = function(arr) {
	var i, count = 0;
	for(i = 0; i < arr.length; ++i) {
		this.askForExitArr[i] = arr[i];
	}
	for(i = 0; i < this.askForExitArr.length; ++i) {
		if(this.askForExitArr[i] !== null) { ++ count; }
	}
	if(count === this.askForExitArr.length) {
		for(i = 0; i < this.askForExitArr.length; ++i) {
			this.askForExitArr[i] = null;
		}
	}
};

model.getAskForExitArr = function() {
	return this.askForExitArr;
};

model.getPlayerCount = function() {
	return this.userArr.length;
};

model.getPlayers = function() {
	return this.userArr;
};

model.addPlayer = function(player) {
	player.userInfo.nickname = Global.Tools.convertNickname(player.userInfo.nickname);
	for(var i = 0; i < this.userArr.length; ++i) {
		if(this.userArr[i].chairId === player.chairId) {
			this.userArr.splice(i, 1);
		}
	}
	this.userArr.push(player);
};

model.delPlayer = function(player) {
	for(var i = 0; i < this.userArr.length; ++i) {
		if(player.userInfo.uid === this.userArr[i].userInfo.uid) {
			this.userArr.splice(i, 1); break;
		}
	}
};

model.setAskExitTm = function(tm) {
	this.askExitTm = tm;
};

model.getAskExitTm = function() {
	return this.askExitTm || Date.now();
};

model.setResoutData = function(resout, gameStatus, tm) {
	var finalScoreArr = TWLogic.getScoreArrByResout(resout); 
	for(var i = 0; i < finalScoreArr.length; ++i) {
		if(finalScoreArr[i] > 0) {
			this.getPlayerByChairId(this.gameStartChairIdArr[i]).userInfo.gold += finalScoreArr[i]*(1-this.getProfitPercentage());
		} else {
			this.getPlayerByChairId(this.gameStartChairIdArr[i]).userInfo.gold += finalScoreArr[i];
		}
	}
	this.resout = resout;
	this.gameStatus = gameStatus;
	this.gameSettleTm = tm;
	for(i = 0; i < this.userArr.length; ++i) {
		var player = this.userArr[i];
		if((player.userStatus&RoomProto.userStatusEnum.READY) > 0) {
			player.userStatus -= RoomProto.userStatusEnum.READY;
		}
	}
};

model.getScoreByChairId = function(chairId) {
	var player = this.getPlayerByChairId(chairId);
	if(player) {
		return player.userInfo.gold.toFixed(2);
	} else {
		return 0;
	}
};

model.getResout = function() {
	return this.resout;
};

model.setCardsPushData = function(cardsArr, curDureau, gameStatus, tm) {
	this.cardsArr = cardsArr;
	this.curDureau = curDureau;
	this.gameStatus = gameStatus;
	this.gameStartTm = tm;
	this.recordGameStartChairId();
	this.gameRule.memberCount = this.cardsArr.length;
};

model.getGameStartTm = function() {
	return this.gameStartTm;
};

model.getCardsArr = function() {
	return this.cardsArr;
};

model.setPlayerReady = function(chairId) {
	var player = this.getPlayerByChairId(chairId);
	player.userStatus |= RoomProto.userStatusEnum.READY;
};

model.getPlayerReady = function(chairId) {
	var player = this.getPlayerByChairId(chairId);
	return ((player.userStatus&RoomProto.userStatusEnum.READY) > 0);
};

model.insertSortChairArr = function(chairId) {
	this.sortCardChairArr.push(chairId);
};

model.hasSortCard = function(chairId) {
	return (this.sortCardChairArr.indexOf(chairId) !== -1);
};

model.resetGameData = function() {
	var i;
	this.sortCardChairArr = [];
	for(i = 0; i < this.userArr.length; ++i) {
		if((this.userArr[i].userStatus&RoomProto.userStatusEnum.READY) > 0) {
			this.userArr[i].userStatus -= RoomProto.userStatusEnum.READY;
		}
	}
};

model.setGamePrepareData = function(data) {
	this.gameStatus = data.gameStatus;
	this.gamePrepareTm = data.gamePrepareTm;
	this.resetGameData();
};

model.getGameRule = function() {
	return this.gameRule;
};

model.setCanExit = function(isCan) {
	this.canExit = isCan;
};

model.getCanExit = function() {
	return this.canExit;
};

model.getGameStatus = function() {
	return this.gameStatus;
};

model.getGameSettleTm = function() {
	return this.gameSettleTm;
};

model.setPlayerOffLine = function(chairId) {
	var player = this.getPlayerByChairId(chairId);
	player.userStatus |= RoomProto.userStatusEnum.OFFLINE;
};

model.setMianbai = function(chairId) {
	var chairIndex = this.getChairIdIndex(chairId);
	this.mianbaiArr[chairIndex] = true;
};

model.getMianbai = function(chairId) {
	return this.mianbaiArr[chairId];
};


model.getGameEndData = function() {
	if(this.gameEndData) {
		return this.gameEndData;
	} else {
		return null;
	}
};

model.getChairCount = function() {
	return this.userArr.length;
};

model.recordGameStartChairId = function() {
	this.gameStartChairIdArr = [];
	console.log('this.userArr', this.userArr);
	for(var i = 0; i < 4; ++i) {
		var player = this.getPlayerByChairId(i);
		if(player && ((player.userStatus&RoomProto.userStatusEnum.READY) > 0)) {
			this.gameStartChairIdArr.push(i);
		}
	}
	console.log(this.gameStartChairIdArr);
};

model.getChairIdByIndex = function(index) {
	return this.gameStartChairIdArr[index];
};
// 玩家在gameStartChairIdArr中index
model.getChairIdIndex = function(chairId) {
	return this.gameStartChairIdArr.indexOf(chairId);
};
