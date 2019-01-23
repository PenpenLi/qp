var TWModel = require('./TWModel');
var TWLogic = require('./TWLogic');
var RoomMessageRouter = 'game.gameHandler.roomMessageNotify';
var RoomProto = require('../../API/RoomProto');

cc.Class({
	extends: cc.Component,

	properties: {
		resoutNode0: cc.Node,
		resoutNode1: cc.Node,
		resoutNode2: cc.Node,
		resoutNode3: cc.Node
	},

	onLoad: function() {
		this.resoutNodeArr = [this.resoutNode0, this.resoutNode1, this.resoutNode2, this.resoutNode3];
		for(var i = TWModel.getGameRule().memberCount; i < 4; ++i) {
			this.resoutNodeArr[i].active = false;
		}
		Global.MessageCallback.addListener('RoomMessagePush', this);
		this.showResout();
	},

	onDestroy: function() {
		Global.MessageCallback.removeListener('GameMessagePush');
	},

	onButtonClick: function(event, param) {
		if(param === 'continue') {
			Global.NetworkManager.notify(RoomMessageRouter, RoomProto.userReadyNotify(true));
		}
		else if(param === 'show_resout') {
			Global.DialogManager.destroyDialog(this);
		}
		else if(param === 'close') {
			Global.DialogManager.destroyDialog(this);
		}
	},

	messageCallbackHandler: function(router, msg) {
		if(router === 'RoomMessagePush') {
			if(msg.type === RoomProto.USER_READY_PUSH) {
				if(msg.data.chairId === TWModel.getMyChairId()) {
					Global.DialogManager.destroyDialog(this);
				}
			}
			else if(msg.type === RoomProto.ROOM_DISMISS_PUSH) {
				Global.DialogManager.destroyDialog(this);
			}
		}
	},

	showResout: function() {
		var resout = TWModel.getResout();
		var i;
		for(i = 0; i < resout.cardsArr.length; ++i) {
			this.setResoutNode(resout, i);
		}
		var scoresArr = TWLogic.getScoreArrByResout(resout);
		var myChairIndex = TWModel.getChairIdIndex(TWModel.getMyChairId());
		if(scoresArr[myChairIndex] >= 0) {
			Global.AudioManager.playSound('ThirteenWater/TWSound/tw_danjushengli');
		} else {
			Global.AudioManager.playSound('ThirteenWater/TWSound/tw_danjushibai');
		}
	},

	setResoutNode: function(resout, index) {
		var myChairId = TWModel.getMyChairId();
		var myChairIndex = TWModel.getChairIdIndex(myChairId);
		var resoutNode = this.resoutNodeArr[index];
		var player = TWModel.getPlayerByChairId(TWModel.getChairIdByIndex(index));
		if(index === myChairIndex) {
			var frameNode = this.node.getChildByName('ResoutNode4');
			frameNode.active = true;
			frameNode.x = resoutNode.x;
			frameNode.y = resoutNode.y;
		}
		var touScore = 0, zhongScore = 0, weiScore = 0, rate, daqiang;
		var guaiScore = 0, i;
		for(i = 0; i < resout.rateArr.length; ++i) {
			if(index !== i) {
				rate = resout.rateArr[index]*resout.rateArr[i];
				daqiang = Math.abs(resout.daqiangArr[index][i]);
				touScore += resout.scoresArr[index][i][0]*rate*daqiang;
				zhongScore += resout.scoresArr[index][i][1]*rate*daqiang;
				weiScore += resout.scoresArr[index][i][2]*rate*daqiang;
				if(resout.guaipaiScoreArr[index] !== 0 && resout.guaipaiScoreArr[i] === 0) {
					guaiScore += resout.guaipaiScoreArr[index]*rate;
				} 
				else if(resout.guaipaiScoreArr[i] !== 0 && resout.guaipaiScoreArr[index] === 0) {
					guaiScore -= resout.guaipaiScoreArr[i]*rate;
				}
			}
		}
		var headSprite = resoutNode.getChildByName('HeadBackSprite').getChildByName('HeadSprite');
		Global.Tools.updateSpriteFrame(player.userInfo.avatar, headSprite.getComponent(cc.Sprite));
		var nameLabel = resoutNode.getChildByName('NameLabel').getComponent(cc.Label);
		var toudaoLabel = resoutNode.getChildByName('ToudaoLabel').getComponent(cc.Label);
		var zhongdaoLabel = resoutNode.getChildByName('ZhongdaoLabel').getComponent(cc.Label);
		var weidaoLabel = resoutNode.getChildByName('WeidaoLabel').getComponent(cc.Label);
		var zongfenLabel = resoutNode.getChildByName('ZongfenLabel').getComponent(cc.Label);
		var typeLabel = resoutNode.getChildByName('TypeLabel').getComponent(cc.Label);
		var nickName = player.userInfo.nickname;
		//if(Global.Tools.getStringRealLength(nickName) > 10) {
		//	nickName = Global.Tools.getStringByRealLength(nickName, 10) + '...';
		//}
		nameLabel.string = nickName;
		var zongfen = touScore+zhongScore+weiScore+guaiScore;
		if(zongfen > 0) zongfen = '+' + zongfen;
		if(touScore > 0) touScore = '+' + touScore;
		if(zhongScore > 0) zhongScore = '+' + zhongScore;
		if(weiScore > 0) weiScore = '+' + weiScore;
		toudaoLabel.string = '头道:' + touScore;
		zhongdaoLabel.string = '中道:' + zhongScore;
		weidaoLabel.string = '尾道:' + weiScore;
		zongfenLabel.string = '总分:' + zongfen;
		guaiScore = resout.guaipaiScoreArr[index];
		if(guaiScore === 0) {
			typeLabel.string = '无';
		} 
		else if(guaiScore === 13) {
			typeLabel.string = '一条龙';
		} else {
			var cardArr = resout.cardsArr[index];
			if(TWLogic.hasSanhua(cardArr)) {
				typeLabel.string = '三花';
			}
			else if(TWLogic.hasSanshun(cardArr)) {
				typeLabel.string = '三顺';
			}
			else if(TWLogic.hasLiuduiban(cardArr)) {
				typeLabel.string = '六对半';
			}
		}
	},

	setNodeSpriteFrame: function(url, node) {
		cc.loader.loadRes(url, cc.SpriteFrame, function(err, spriteFrame) {
			if(! err) {
				node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
			}
		});
	}
});

