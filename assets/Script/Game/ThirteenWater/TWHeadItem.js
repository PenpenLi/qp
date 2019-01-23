var TWModel = require('./TWModel');
var GameProto = require('./TWProto');
var RoomProto = require('../../API/RoomProto');

cc.Class({
	extends: cc.Component,
	properties: {
		nameLabel: cc.Label,
		scoreLabel: cc.Label
	},

	onLoad: function() {
		this.nameLabel.string = '';
		this.scoreLabel.string = '';
		this.typeSprite = this.node.getChildByName('TypeSprite');
		this.typeSprite.active = false;
		this.crownSprite = this.node.getChildByName('CrownSprite');
		this.crownSprite.active = false; 
		Global.MessageCallback.addListener('GameMessagePush', this);
		Global.MessageCallback.addListener('RoomMessagePush', this);
	},

	onDestroy: function() {
		Global.MessageCallback.removeListener('GameMessagePush', this);
		Global.MessageCallback.removeListener('RoomMessagePush', this);
	},

	setRecordData: function(name, avatar, score) {
		this.nameLabel.string = name;
		this.scoreLabel.string = score;
		var headSprite = this.node.getChildByName('HeadSprite');
		if(! this.recordAvatar || this.recordAvatar !== avatar) {
			this.recordAvatar = avatar;
			Global.Tools.updateSpriteFrame(avatar, headSprite.getComponent(cc.Sprite));
		}
	},

	setChairId: function(chairId) {
		var player = TWModel.getPlayerByChairId(chairId);
		this.chairId = player.chairId;
		var name = player.userInfo.nickname;
		//if(Global.Tools.getStringRealLength(name) > 10) {
		//	name = Global.Tools.getStringByRealLength(name, 8) + '...';
		//}
		this.nameLabel.string = name;
		this.scoreLabel.string = TWModel.getScoreByChairId(this.chairId);
		var headSprite = this.node.getChildByName('HeadSprite');
		Global.Tools.updateSpriteFrame(player.userInfo.avatar, headSprite.getComponent(cc.Sprite));
		this.setTypeSprite();
	},

	setTypeSprite: function() {
		var player = TWModel.getPlayerByChairId(this.chairId);
		if(! player) { return; }
		var gameStatus = TWModel.getGameStatus();
		if((player.userStatus&RoomProto.userStatusEnum.OFFLINE) > 0) {
			this.typeSprite.active = true;
			this.setNodeSpriteFrame('ThirteenWater/TWCommon/TW_diaoxian', this.typeSprite);
		}
		else if((player.userStatus&RoomProto.userStatusEnum.READY) > 0) {
			if(gameStatus === GameProto.GAME_STATUS_NOTSTART) {
				this.typeSprite.active = true;
				this.setNodeSpriteFrame('ThirteenWater/TWCommon/TW_zhunbei', this.typeSprite);
			} else {
				this.typeSprite.active = false;
			}
		} else {
			this.typeSprite.active = false;
		}
	},

    messageCallbackHandler: function(router, msg) {
		if(router === 'GameMessagePush') {
			if(msg.type === GameProto.GAME_RESOUT_PUSH) {
				var self = this;
				var mianbaiCount = 0;
				for(var i = 0; i < 4; ++i) {
					if(TWModel.getMianbai(i)) { ++ mianbaiCount; }
				}
				var second = ((TWModel.getGameRule().memberCount-mianbaiCount)*3*1.5+1.5)+2.5;
				var daqiangCount = self.getDaqiangCount(msg.data.resout);
				second += 1.5*daqiangCount;
				this.scheduleOnce(function() {
					self.scoreLabel.string = TWModel.getScoreByChairId(self.chairId);
					if(! TWModel.getPlayerByChairId(self.chairId)) {
						self.node.active = false;
					}
				}, second);
				this.setTypeSprite();
			}
			else if(msg.type === GameProto.GAME_CARDS_PUSH) {
				this.setTypeSprite();
			}
		}
		else if(router === 'RoomMessagePush') {
			if(msg.type === RoomProto.USER_OFF_LINE_PUSH) {
				if(msg.data.chairId === this.chairId) {
					this.setTypeSprite();
				}
			}
			else if(msg.type === RoomProto.OTHER_USER_ENTRY_ROOM_PUSH) {
				if(msg.data.chairId === this.chairId) {
					this.setTypeSprite();
				}
			}
			else if(msg.type === RoomProto.USER_READY_PUSH) {
				this.setTypeSprite();
			}
			else if(msg.type === RoomProto.USER_RECONNECT_PUSH) {
				this.setTypeSprite();
			}
		}
	},

	onButtonClick: function(event, param) {
		if (!Global.isStartBgMusic && Global.isBgMusicLoaded) {
            Global.isStartBgMusic = true;
            Global.AudioManager.startPlayBgMusic();
        }
		if(param === 'head') {
			var player = TWModel.getPlayerByChairId(this.chairId);

			if (player.userInfo.uid === Global.Player.getPy('uid')) {
                Global.DialogManager.createDialog('Hall/UserInfoDialog');
            } else {
                Global.DialogManager.createDialog('Hall/UserInfoDialog', {data: player.userInfo});
            }
		}
	},

	setNodeSpriteFrame: function(url, node) {
		cc.loader.loadRes(url, cc.SpriteFrame, function(err, spriteFrame) {
			if(! err) {
				node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
			}
		});
	},

	getDaqiangCount: function(resout) {
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
		var count = 0;
		for(i = 0; i < daqiangArr.length; ++i) {
			for(j = 0; j < daqiangArr[i].length; ++j) {
				if(daqiangArr[i][j] > 1) {
					++ count;
				}
			}
		}
		return count;
	},

	getChairId: function() {
		return this.chairId;
	},

	update: function(dt) {
	}
});
