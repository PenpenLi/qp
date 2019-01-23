var TWModel = require('./TWModel');
var TWLogic = require('./TWLogic');
var RoomMessageRouter = 'game.gameHandler.roomMessageNotify';
var GameMessageRouter = 'game.gameHandler.gameMessageNotify';
var RoomProto = require('../../API/RoomProto');
var HallApi = require('../../API/HallAPI');
var TWProto = require('./TWProto');



cc.Class({
	extends: cc.Component,

	properties: {
		roomIdLabel: cc.Label,
		//dureauLabel: cc.Label,
		cardItem0: cc.Node,
		cardItem1: cc.Node,
		cardItem2: cc.Node,
		cardItem3: cc.Node,
		headItem0: cc.Node,
		headItem1: cc.Node,
		headItem2: cc.Node,
		headItem3: cc.Node,
		glassSprite: cc.Sprite,
		clockNode: cc.Node,
		clockLabel: cc.Label,
	},

	onLoad: function() {
		var gameStatus = TWModel.getGameStatus();
		this.roomIdLabel.string = TWModel.getRoomId();
		this.node.getChildByName('ContinueButton').active = false;
		//this.dureauLabel.string = TWModel.getCurDureau() + '/' + TWModel.getMaxDureau();
		this.headItemArr = [this.headItem0, this.headItem1, this.headItem2, this.headItem3];
		this.cardItemArr = [this.cardItem0, this.cardItem1, this.cardItem2, this.cardItem3];
		var myChairId = TWModel.getMyChairId();
		for(var i = 0; i < 4; ++i) {
			if(TWModel.getPlayerByChairId(i)) {
				this.playerEntryRoom(i);
			}
		}
		this.scheduleOnce(function() {
			for(i = 0; i < 4; ++i) {
				var player = TWModel.getPlayerByChairId(i);
				this.cardItemArr[(i+4-myChairId)%4].getComponent('TWCardItem').setChairId(i);
			}
		}.bind(this), 0.2);
		Global.MessageCallback.addListener('RoomMessagePush', this);
		Global.MessageCallback.addListener('GameMessagePush', this);
        Global.MessageCallback.addListener('ReConnectSuccess', this);

        //设置分享内容
        Global.Tools.setShareFriend({roomID: TWModel.getRoomId()});
        Global.Tools.setShareTimeline({roomID: TWModel.getRoomId()});
		//if(gameStatus === TWProto.GAME_STATUS_NOTSTART) {
		//	this.node.getChildByName('InviteButton').active = true;
		//} else {
		//	this.node.getChildByName('InviteButton').active = false;
		//}
		this.offLineAndClient();
	},


	// 断线重连
	offLineAndClient: function() {
		var gameStatus = TWModel.getGameStatus();
		var curTim = Date.now();
		var myChairId = TWModel.getMyChairId();
		if(gameStatus === TWProto.GAME_STATUS_NOTSTART) {
			var isReady = TWModel.getPlayerIsReady(TWModel.getMyUid());
			this.node.getChildByName('ContinueButton').active = !isReady;
			this.autoExitRoom();
			if(Global.DialogManager.isDialogExit('ThirteenWater/TWSortCardDialog')) {
				Global.DialogManager.destroyDialog('ThirteenWater/TWSortCardDialog');
			}
		}
		else if(gameStatus === TWProto.GAME_STATUS_GAMEING) {
			if(TWModel.getChairIdIndex(myChairId) < 0) { return; }
			if(!TWModel.hasSortCard(myChairId)) {
				var myCardArr = TWModel.getCardsArr()[TWModel.getChairIdIndex(myChairId)];
				if(TWLogic.hasGuaipai(myCardArr)) {
					Global.DialogManager.createDialog('ThirteenWater/TWSortCardDialog', null, function(err, dialog) {
						if(! err) { dialog.getComponent('TWSortCardDialog').setCardArr(myCardArr); }
						Global.DialogManager.createDialog('ThirteenWater/TWGuaipaiTipDialog', null, function(err, dialog) {
							if(! err) { dialog.getComponent('TWGuaipaiTipDialog').setLabel(myCardArr); }
						});
					});
				} else {
					Global.DialogManager.createDialog('ThirteenWater/TWSortCardDialog', null, function(err, dialog) {
						if(! err) { dialog.getComponent('TWSortCardDialog').setCardArr(myCardArr); }
					});
				}
			}
		}
		else if(gameStatus === TWProto.GAME_STATUS_SETTLE) {
			if(Global.DialogManager.isDialogExit('ThirteenWater/TWSortCardDialog')) {
				Global.DialogManager.destroyDialog('ThirteenWater/TWSortCardDialog');
			}
		}
	},

	onDestroy: function() {
		Global.MessageCallback.removeListener('RoomMessagePush', this);
		Global.MessageCallback.removeListener('GameMessagePush', this);
        Global.MessageCallback.removeListener('ReConnectSuccess', this);

        //Global.DialogManager.destroyDialog('Voice/VoiceGroup');
        //Global.DialogManager.destroyDialog('Chat/ChatGroup');
	},
	
	messageCallbackHandler: function(router, msg) {
		var myChairId = TWModel.getMyChairId();
		if(router === 'RoomMessagePush') {
			if(msg.type === RoomProto.USER_LEAVE_ROOM_RESPONSE) {
				if(msg.data.chairId === myChairId) {
					Global.DialogManager.removeLoadingCircle();
				}
			}
			else if(msg.type === RoomProto.ROOM_DISMISS_PUSH) {
				this.answerRoomDismisssPush(msg.data.reason);
			}
			else if(msg.type === RoomProto.OTHER_USER_ENTRY_ROOM_PUSH) {
				this.playerEntryRoom(msg.data.roomUserInfo.chairId);
			}
			else if(msg.type === RoomProto.USER_LEAVE_ROOM_PUSH) {
				this.playerExitRoom(msg.data.roomUserInfo.chairId);
			}
			else if(msg.type === RoomProto.USER_READY_PUSH) {
				if(msg.data.chairId === myChairId) {
					if(this.autoExitCall) {
						this.unschedule(this.autoExitCall);
					}
					this.stopClock();
					this.node.getChildByName('ContinueButton').active = false;
				}
			}
		}
		else if(router === 'GameMessagePush') {
			if(msg.type === TWProto.GAME_CARDS_PUSH) {
				this.answerGameCardPush(msg.data);
			}
			else if(msg.type === TWProto.GAME_CARDS_SORT_PUSH) {
				if(msg.code === 0) {
					this.answerGameCardSortPush(msg.data.chairId);
				}
			}
			else if(msg.type === TWProto.GAME_RESOUT_PUSH) {
				Global.AudioManager.playSound('ThirteenWater/TWSound/tw_kaiju');
				//this.answerGameResoutPush(msg.data);
			}
			else if(msg.type === TWProto.GAME_PREPARE_PUSH) {
				this.answerGamePreparePush(msg.data);
			}
			else if(msg.type === RoomProto.USER_RECONNECT_PUSH) {
				Global.DialogManager.destroyDialog('ThirteenWater/TWMainDialog');
				TWModel.setGameData(msg.data.gameData);
				Global.DialogManager.createDialog('ThirteenWater/TWMainDialog');
				//this.offLineAndClient();
			}
		}
		else if(router === 'ReConnectSuccess') {
			if(Global.Player.isInRoom()) {
				Global.API.hall.joinRoomRequest(TWModel.getRoomId(), function() {
					Global.NetworkManager.notify(RoomMessageRouter, RoomProto.getUserReconnectNotifyData());
				});
			} else {
				Global.DialogManager.addPopDialog('当前房间已解散！', function () {
					Global.DialogManager.createDialog('Hall/HallDialog', null, function () {
						Global.DialogManager.destroyDialog('ThirteenWater/TWMainDialog');
					});
				});
			}
		}
	},

	playerEntryRoom: function(chairId) {
		var player = TWModel.getPlayerByChairId(chairId);
		var myChairId = TWModel.getMyChairId();
		var headItem = this.headItemArr[(chairId+4-myChairId)%4];
		headItem.active = true;
		headItem.getComponent('TWHeadItem').setChairId(chairId);
	},

	playerExitRoom: function(chairId) {
		Global.Player.setPy('roomID', null);
		var myChairId = TWModel.getMyChairId();
		var headItem = this.headItemArr[(chairId+4-myChairId)%4];
		headItem.active = false; 
		if(chairId === myChairId) {
			this.destroyMainDialog();
		}
	},

	answerRoomDismisssPush: function(reason) {
		Global.Player.setPy('roomID', 0);
		if(reason === RoomProto.roomDismissReason.NONE) {	/* 正常结束 */ 
		}
		else if(reason === RoomProto.roomDismissReason.RDR_OWENER_ASK) {	/* 房主解散 */
			if(TWModel.getMyChairId() !== 0) {
				Global.DialogManager.addPopDialog('因房主退出房间,房间解散', function() {
					this.destroyMainDialog();
				}.bind(this));
			} else {
				this.destroyMainDialog();
			}
		}
		else if(reason === RoomProto.roomDismissReason.RDR_USER_ASK) {	/* 游戏中,请求结束 */
			this.node.getChildByName('ExitButton').active = true;
		}
		else if(reason === RoomProto.roomDismissReason.RDR_TIME_OUT) { /* 超时未响应 */
		}
	},

	answerGameCardPush: function(data) {
		var myChairIndex = TWModel.getChairIdIndex(TWModel.getMyChairId());
		if(myChairIndex < 0) { return 0; }
		var myCardArr = data.cardsArr[myChairIndex];
		this.scheduleOnce(function() {
			if(TWLogic.hasGuaipai(myCardArr)) {
				Global.DialogManager.createDialog('ThirteenWater/TWSortCardDialog', null, function(err, dialog) {
					if(! err) { dialog.getComponent('TWSortCardDialog').setCardArr(myCardArr); }
					Global.DialogManager.createDialog('ThirteenWater/TWGuaipaiTipDialog', null, function(err, dialog) {
						if(! err) { dialog.getComponent('TWGuaipaiTipDialog').setLabel(myCardArr); }
					});
				});
			} else {
				Global.DialogManager.createDialog('ThirteenWater/TWSortCardDialog', null, function(err, dialog) {
					if(! err) { dialog.getComponent('TWSortCardDialog').setCardArr(myCardArr); }
				});
			}
		}, 2.5);
	},

	answerNosortPush: function(chairId, isNosort) {
		if(isNosort) { TWModel.setMianbai(chairId); }
	},

	answerGameResoutPush: function(data) {
	},

	answerGamePreparePush: function(data) {
		this.node.getChildByName('ContinueButton').active = true;
		this.autoExitRoom();
	},

	// 长时间未准备自动离开
	autoExitRoom: function() {
		if(! this.autoExitCall) {
			this.autoExitCall = function() {
				var user = TWModel.getPlayerByChairId(TWModel.getMyChairId());
				if((user.userStatus&RoomProto.userStatusEnum.READY) === 0) {
					Global.DialogManager.removeLastPopDialog();	// 去掉确认弹出框
					Global.NetworkManager.notify(RoomMessageRouter, RoomProto.getAskForDismissNotifyData());
				}
			};
		}
		this.scheduleOnce(this.autoExitCall, TWProto.AUTO_LEAVEROOM_TM);
		this.runClock(TWProto.AUTO_LEAVEROOM_TM);
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
				if(self.tick <= 5 && self.clockNode.active) {
					Global.AudioManager.playSound('ThirteenWater/TWSound/tw_daojishi1');
				}
				self.clockLabel.string = self.tick;
			};
			this.schedule(this.clockCallFunc, 1);
		}
	},

	stopClock: function() {
		this.clockNode.active = false;
	},

	answerGameCardSortPush: function(chairId) {
		if(chairId === TWModel.getMyChairId()) {
			Global.DialogManager.destroyDialog('ThirteenWater/TWSortCardDialog');
		}
	},

	onButtonClick: function(event, param) {
		var myChairId = TWModel.getMyChairId();
		if(param === 'dismiss') {	// 解散房间 
			Global.DialogManager.addPopDialog('确认退出游戏?', function() {
				Global.NetworkManager.notify(RoomMessageRouter, RoomProto.getAskForDismissNotifyData());
				Global.DialogManager.addLoadingCircle();
			}, function() {});
		}
		else if(param === 'rule') {
            Global.DialogManager.createDialog('ThirteenWater/TWGameRuleDialog');
		}
		else if(param === 'setting') {
            Global.DialogManager.createDialog('Setting/SettingDialog');
		}
		else if(param === 'exit_room') {
			this.destroyMainDialog();
		}
		else if(param === 'continue_game') {
			Global.NetworkManager.notify(RoomMessageRouter, RoomProto.userReadyNotify(true));
		}
		else if(param === 'invite') {
			Global.DialogManager.createDialog('Share/ShareGuideDialog');
		}
	},

	destroyMainDialog: function() {
		Global.DialogManager.removeLoadingCircle();
		Global.DialogManager.createDialog('Hall/HallDialog', null, function () {
            Global.DialogManager.destroyDialog('ThirteenWater/TWMainDialog');
        });
	},

	getHeadItemByChairId: function(chairId) {
		var myChairId = TWModel.getMyChairId();
		return this.headItemArr[(chairId+4-myChairId)%4].getChildByName('chatPos');
	},

	glassAnimal: function(cb) {
		Global.AudioManager.playSound('ThirteenWater/TWSound/tw_suiboli');
		this.scheduleOnce(function() {
			Global.AudioManager.playSound('ThirteenWater/TWSound/tw_sanchuan');
		}, 0.5);
		this.glassSprite.node.active = true;
		this.scheduleOnce(function() {
			this.glassSprite.node.active = false;
			if(!! cb) {
				cb();
			}
		}.bind(this), 1.5);
	},

	update: function(dt) {
	}
});
