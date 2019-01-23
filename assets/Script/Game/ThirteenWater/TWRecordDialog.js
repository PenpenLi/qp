var TWModel = require('./TWModel');
var TWLogic = require('./TWLogic');
var RoomMessageRouter = 'game.gameHandler.roomMessageNotify';
var GameMessageRouter = 'game.gameHandler.gameMessageNotify';
var RoomProto = require('../../API/RoomProto');
var HallApi = require('../../API/HallAPI');
var GameProto = require('./TWProto');


cc.Class({
	extends: cc.Component,

	properties: {
		roomIdLabel: cc.Label,
		dureauLabel: cc.Label,
		cardItem0: cc.Node,
		cardItem1: cc.Node,
		cardItem2: cc.Node,
		cardItem3: cc.Node,
		headItem0: cc.Node,
		headItem1: cc.Node,
		headItem2: cc.Node,
		headItem3: cc.Node
	},

	onLoad: function() {
		this.roomData = this.dialogParameters;
		this.curBureau = 1;
		this.maxBureau = this.roomData.gameRule.bureau;
		this.myUid = Global.Player.getPy('uid');
		this.myChairId = this.roomData.uidArr.indexOf(this.myUid);
		this.headItemArr = [this.headItem0, this.headItem1, this.headItem2, this.headItem3];
		this.cardItemArr = [this.cardItem0, this.cardItem1, this.cardItem2, this.cardItem3];
		for(var i = 0; i < this.roomData.gameRule.memberCount; ++i) {
			this.headItemArr[(i+4-this.myChairId)%4].active = true;
			this.cardItemArr[(i+4-this.myChairId)%4].active = true;
		}
		this.setGameByBureau(this.curBureau);
	},

	setGameByBureau: function(bureau) {
		var memberCount = this.roomData.gameRule.memberCount;
		var index = bureau - 1;
		var headMgr, score, i, j;
		for(i = 0; i < memberCount; ++i) {
			headMgr = this.headItemArr[(i+4-this.myChairId)%4].getComponent('TWRecordHeadItem');
			score = 0;
			for(j = 0; j < bureau; ++j) {
				score += this.roomData.scoresArr[j][i];
			}
			headMgr.setRecordData(this.roomData.nameArr[i], this.roomData.avatarArr[i], score, (this.roomData.uidArr[i] === this.myUid));
		}
		this.roomIdLabel.string = this.roomData.roomId;
		this.dureauLabel.string =  bureau + '/' + this.maxBureau;
		var cardMgr, resout;
		var cardsArr = this.roomData.cardsArr[bureau-1];
		for(i = 0; i < memberCount; ++i) {
			cardMgr = this.cardItemArr[(i+4-this.myChairId)%4].getComponent('TWRecordCardItem');
			resout = TWLogic.getResout(cardsArr, this.roomData.guaiArr[bureau-1], this.roomData.gameRule);
			cardMgr.setRecordData(resout, i, this.myChairId);
		}
	},

	onButtonClick: function(event, param) {
		if(param === 'rule') {
            // Global.DialogManager.createDialog('RoomControl/RoomRuleDialog', this.gameRule);
		}
		else if(param === 'setting') {
            Global.DialogManager.createDialog('Setting/SettingDialog');
		}
		else if(param === 'pre') {
			-- this.curBureau;
			if(this.curBureau <= 0) {
				this.curBureau = this.roomData.cardsArr.length;
			}
			this.setGameByBureau(this.curBureau);
		}
		else if(param === 'next') {
			++ this.curBureau;
			if(this.curBureau > this.roomData.cardsArr.length) {
				this.curBureau = 1;
			}
			this.setGameByBureau(this.curBureau);
		}
		else if(param === 'return') {
			Global.DialogManager.destroyDialog('ThirteenWater/TWRecordDialog');
		}

	},

	update: function(dt) {
	}
});

