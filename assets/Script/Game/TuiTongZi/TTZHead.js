var TTZProto = require('./TTZProto');
var RoomProto = require('../../API/RoomProto');
var TTZModel = require('./TTZModel');
var GameMessageRouter = 'game.gameHandler.gameMessageNotify';

cc.Class({
    extends: cc.Component,

	properties: {
		rootNode: cc.Node,
		nameLabel: cc.Label,
		goldLabel: cc.Label,
		bankNode: cc.Node,
	},

	start () {
		Global.MessageCallback.addListener('GameMessagePush', this);
		Global.MessageCallback.addListener('RoomMessagePush', this);
	},

	reconnect () {
		this.setHeadMsg(this.headUid, this.isTop);
	},

	onDestroy () {
		Global.MessageCallback.removeListener('GameMessagePush', this);
		Global.MessageCallback.removeListener('RoomMessagePush', this);
	},

	messageCallbackHandler (router, msg) {
		var myUid = TTZModel.getMyUid();
		if(router === 'GameMessagePush') {
			if(msg.type === TTZProto.GAME_BANKERCHANGE_PUSH) {		// 换庄推送
				if(this.isTop) {
					this.setHeadMsg(msg.data.bankerUid, this.isTop);
				}
			}
			else if(msg.type === TTZProto.GAME_CONTINUEBANKER_PUSH) {	// 须庄推送
				if(this.isTop) {
					if(msg.data.bankerUid !== myUid) {
						this.setHeadMsg(msg.data.bankerUid, this.isTop);
					} 
				} else {
					if(msg.data.bankerUid === myUid) {
						this.setHeadMsg(msg.data.bankerUid, this.isTop);
					}
				}
				//this.refrushHead();
			}
			else if(msg.type === TTZProto.GAME_STATUSCHANGE_PUSH) {		// 状态推送
				this.gameStatusChange(msg.data.gameStatus);
			}
			else if(msg.type === TTZProto.GAME_ASKTOBEPLAYER_PUSH) {	// 下庄推送
				this.bankerAskToBePlayer(msg.data.bankerUid);
			}
			else if(msg.type === TTZProto.GAME_POURGOLD_PUSH) {			// 下注推送
				if(msg.data.uid === this.headUid && this.headUid === myUid) {
					this.refrushHead();
				}
			}
		}
		else if(router === 'RoomMessagePush') {
			if(msg.type === RoomProto.USER_RECONNECT_PUSH) {
				this.reconnect();
			}
		}
	},

	bankerAskToBePlayer (bankerUid) {
		if(this.isTop) {
			this.setHeadMsg(null, this.isTop);
		} else {
			if(bankerUid === this.headUid) {
				this.setHeadMsg(bankerUid, this.isTop);
			}
		}
	},

	gameStatusChange (gameStatus) {
		if(! gameStatus) { gameStatus = TTZModel.getGameStatus(); }
		if(gameStatus === TTZProto.GAME_STATUS_WAITING) {			// 未开始
		}
		else if(gameStatus === TTZProto.GAME_STATUS_SORTCARD) {		// 摆牌中
		}
		else if(gameStatus === TTZProto.GAME_STATUS_POUR) {			// 下注中
		}
		else if(gameStatus === TTZProto.GAME_STATUS_RESOUT) {		// 显示结果中
		}
		else if(gameStatus === TTZProto.GAME_STATUS_SETTLE) {		// 结算中
			if(this.rootNode.active) {
				this.setHeadMsg(this.headUid, this.isTop);
			}
		}
		else if(gameStatus === TTZProto.GAME_STATUS_START) {		// 开始中
		}
	},

	setHeadMsg (headUid, isTop) {
		this.rootNode.active = false;
		this.headUid = headUid;
		this.isTop = isTop;
		//if(headUid) { this.refrushHead(); }
		this.refrushHead();
	},

	refrushHead () {
		this.rootNode.active = true;
		if(this.isTop) {		//是庄家
			//var banker = TTZModel.getBanker();
			//if(banker) {
			//	var bankerPourPool = TTZModel.getBankerPourPool();
			//	this.nameLabel.string = banker.userInfo.nickname;
			//	this.goldLabel.string = bankerPourPool.curGold.toFixed(2);
			//}
		} else {
			this.bankNode.active = false;
			var me = TTZModel.getMe();
			var pourGold = TTZModel.getMyPourGold();
			this.nameLabel.string = me.userInfo.nickname;
			this.goldLabel.string = (me.userInfo.gold-pourGold).toFixed(2);
		}
	}
});


