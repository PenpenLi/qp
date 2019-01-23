var TWLogic = require('TWLogic');
var TWModel = require('TWModel');
var GameProto = require('./TWProto');
var RoomProto = require('../../API/RoomProto');
var GameMessageRouter = 'game.gameHandler.gameMessageNotify';

cc.Class({
	extends: cc.Component,

	properties: {
		richLabel: cc.RichText
	},

	onLoad: function() {
		Global.MessageCallback.addListener('GameMessagePush', this);
		Global.MessageCallback.addListener('RoomMessagePush', this);
	},

	onDestroy: function() {
		Global.MessageCallback.removeListener('GameMessagePush');
		Global.MessageCallback.removeListener('RoomMessagePush');
	},

	messageCallbackHandler: function(router, msg) {
		if(router === 'GameMessagePush') { 
			if(msg.type === GameProto.GAME_CARDS_NOSORT_PUSH) {
				if(msg.data.chairId === TWModel.getMyChairId()) {
					if(!msg.data.isNosort) {
						Global.DialogManager.createDialog('ThirteenWater/TWSortCardDialog', null, function(err, dialog) {
							if(! err) { dialog.getComponent('TWSortCardDialog').setCardArr(this.cardArr); }
						}.bind(this));
					}
					Global.DialogManager.destroyDialog(this);
				}
			}
			else if(msg.type === GameProto.GAME_CARDS_SORT_PUSH) {
				if(msg.data.chairId === TWModel.getMyChairId()) {
					Global.DialogManager.destroyDialog(this);
				}
			}
		}
		else if(router === 'RoomMessagePush') {
			if(msg.type === RoomProto.ROOM_DISMISS_PUSH) {
				Global.DialogManager.destroyDialog(this);
			}
		}
	},

	setLabel: function(cardArr) {
		this.cardArr = cardArr;
		var name = '';
		if(TWLogic.hasYitiaolong(cardArr)) {
			name = '一条龙';
		}
		else if(TWLogic.hasSanhua(cardArr)) {
			name = '三花';
		}
		else if(TWLogic.hasSanshun(cardArr)) {
			name = '三顺';
		}
		else if(TWLogic.hasLiuduiban(cardArr)) {
			name = '六对半';
		}
		this.richLabel.string = '获得特殊免摆牌型(<color=#ffe35f>' + name + '</color>) 是否选择免摆';
	},

	onButtonClick: function(event, param) {
		if(param === 'confirm') {
			Global.NetworkManager.notify(GameMessageRouter, GameProto.getGameNosortRequestData(true));
		}
		else if(param === 'cancel') {
			Global.NetworkManager.notify(GameMessageRouter, GameProto.getGameNosortRequestData(false));
		}
	}
});

