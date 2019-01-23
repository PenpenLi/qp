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
		cardsNode: cc.Node,
		itemId: cc.Integer,
	},

	onLoad: function() {
	},

	setRecordData: function(resout, chairId, myChairId) {
		this.itemId = parseInt(this.itemId);
		this.cardNodeArr = this.cardNodeArr || [];
		if(this.cardNodeArr.length === 0) {
			for(var i = 0; i < 13; ++i) {
				var node = new cc.Node();
				node.parent = this.cardsNode;
				node.addComponent(cc.Sprite);
				node.zIndex = i+1;
				this.cardNodeArr.push(node);
			}
		}
		this.setCardType1();
		this.setCardType2(resout, chairId, myChairId);
		this.setCardType3(resout, chairId, myChairId);
		this.setCardType4(resout, chairId, myChairId);
		this.setCardType5(resout, chairId, myChairId);
		this.setCardType6(resout, chairId, myChairId);
	},

	/* 未理牌状态 */
	setCardType1: function() {
		this.toudaoLabel.node.active = true;
		this.zhongdaoLabel.node.active = true;
		this.weidaoLabel.node.active = true;
		this.zongfenLabel.node.active = true;
	},

	/* 理牌状态 */
	setCardType2: function(resout, chairId, myChairId) {
		var posArr = [
			{x: -50, y: 172}, {x: 25, y: 173}, {x: 96, y: 154}, {x: -123, y: -16}, {x: -54, y: 11}, {x: 27, y: 8}, {x: 98, y: -4},
			{x: 165, y: -46}, {x: -123, y: -203}, {x: -49, y: -178}, {x: 27, y: -175}, {x: 95, y: -190}, {x: 170, y: -221}, 
		];
		var rotate = [ -23, -8, 10, -40, -22, -7, 12, 28, -40, -22, -5, 13, 28 ];
		var cardsNodePosArr = [ {x: 0, y: 66}, {x: 20, y: -72}, {x: 16, y: 70}, {x: -82, y: -68} ];
		this.cardsNode.setPosition(cardsNodePosArr[this.itemId].x, cardsNodePosArr[this.itemId].y);
		if(this.itemId !== 0) {
			this.cardsNode.setScale(0.7, 0.7);
		} else {
			this.cardsNode.setScale(1, 1);
		}
		for(var i = 0; i < this.cardNodeArr.length; ++i) {
			this.cardNodeArr[i].setPosition(posArr[i].x, posArr[i].y);
			this.cardNodeArr[i].rotation = rotate[i];
			this.cardNodeArr[i].setScale(1.2, 1.2);
		}
	},

	/* 明头牌状态 */
	setCardType3: function(resout, chairId, myChairId) {
		var cardIdArr = resout.cardsArr[chairId];
		for(var i = 0; i < 3; ++i) {
			this.setNodeSpriteFrame('ThirteenWater/TWCard/'+cardIdArr[i], this.cardNodeArr[i]);
		}
		var url = '', str = '';
		if(chairId !== myChairId) {
			var score = resout.scoresArr[myChairId][chairId][0];
			var daqiang = Math.abs(resout.daqiangArr[myChairId][chairId]);
			if(score >= 0) {
				str = '赢+' + score;
				url = 'Font/fnt_game2';
			} else {
				str = '输' + score;
				url = 'Font/fnt_game1';
			}
			if(daqiang > 1) { str += 'x' + daqiang; }
		} else {
			var score = 0;
			var rate;
			var daqiang;
			for(i = 0; i < resout.cardsArr.length; ++i) {
				daqiang = Math.abs(resout.daqiangArr[myChairId][i]);
				rate = resout.rateArr[i]*resout.rateArr[myChairId];
				score += resout.scoresArr[myChairId][i][0]*rate*daqiang;
			}
			if(score >= 0) {
				str = '头道+' + score;
				url = 'Font/fnt_game4';
			} else {
				str = '头道' + score;
				url = 'Font/fnt_game3';
			}
		}
		cc.loader.loadRes(url, cc.Font, function(err, font) {
			if(! err) { 
				this.toudaoLabel.font = font; 
				this.toudaoLabel.string = str;
				this.toudaoLabel.node.active = true;
			} 
		}.bind(this));
	},

	/* 明中牌状态 */
	setCardType4: function(resout, chairId, myChairId) {
		var cardIdArr = resout.cardsArr[chairId]
		var i;
		for(i = 3; i < 8; ++i) {
			this.setNodeSpriteFrame('ThirteenWater/TWCard/'+cardIdArr[i], this.cardNodeArr[i]);
		}
		var url = '', str = '';
		if(chairId !== myChairId) {
			var score = resout.scoresArr[myChairId][chairId][1];
			var daqiang = Math.abs(resout.daqiangArr[myChairId][chairId]);
			if(score >= 0) {
				str = '赢+' + score;
				url = 'Font/fnt_game2';
			} else {
				str = '输' + score;
				url = 'Font/fnt_game1';
			}
			if(daqiang > 1) { str += 'x' + daqiang; }
		} else {
			var score = 0;
			var rate;
			var daqiang;
			for(i = 0; i < resout.cardsArr.length; ++i) {
				daqiang = Math.abs(resout.daqiangArr[myChairId][i]);
				rate = resout.rateArr[i]*resout.rateArr[myChairId];
				score += resout.scoresArr[myChairId][i][1]*rate*daqiang;
			}
			if(score >= 0) {
				str = '中道+' + score;
				url = 'Font/fnt_game4';
			} else {
				str = '中道' + score;
				url = 'Font/fnt_game3';
			}
		}
		cc.loader.loadRes(url, cc.Font, function(err, font) {
			if(! err) { 
				this.zhongdaoLabel.font = font; 
				this.zhongdaoLabel.string = str;
				this.zhongdaoLabel.node.active = true;
			}
		}.bind(this));
	},

	/*明尾牌状态 */
	setCardType5: function(resout, chairId, myChairId) {
		var cardIdArr = resout.cardsArr[chairId];
		var i, str = '', url = '';
		for(i = 8; i < 13; ++i) {
			this.setNodeSpriteFrame('ThirteenWater/TWCard/'+cardIdArr[i], this.cardNodeArr[i]);
		}
		if(chairId !== myChairId) {
			var score = resout.scoresArr[myChairId][chairId][2];
			var daqiang = Math.abs(resout.daqiangArr[myChairId][chairId]);
			if(score >= 0) {
				str = '赢+' + score;
				url = 'Font/fnt_game2';
			} else {
				str = '输' + score;
				url = 'Font/fnt_game1';
			}
			if(daqiang > 1) { str += 'x' + daqiang; }
		} else {
			var score = 0;
			var rate;
			var daqiang;
			for(i = 0; i < resout.cardsArr.length; ++i) {
				daqiang = Math.abs(resout.daqiangArr[myChairId][i]);
				rate = resout.rateArr[i]*resout.rateArr[myChairId];
				score += resout.scoresArr[myChairId][i][2]*rate*daqiang;
			}
			if(score >= 0) {
				str = '尾道+' + score;
				url = 'Font/fnt_game4';
			} else {
				str = '尾道' + score;
				url = 'Font/fnt_game3';
			}
		}
		cc.loader.loadRes(url, cc.Font, function(err, font) {
			if(! err) { 
				this.weidaoLabel.font = font; 
				this.weidaoLabel.string = str;
				this.weidaoLabel.node.active = true;
			}
		}.bind(this));
	},

	/* 显示总分&倍率 */
	setCardType6: function(resout, chairId, myChairId) {
		var url = '', str = '';
		if(chairId === myChairId) {
			var score = TWLogic.getScoreArrByResout(resout)[chairId];
			if(score >= 0) {
				str = '总分:+' + score;
				url = 'Font/fnt_game4';
			} else {
				str = '总分:' + score;
				url = 'Font/fnt_game3';
			}
		} else {
			var rate = resout.rateArr[chairId]*resout.rateArr[myChairId];
			str = '翻倍';
			if(rate === 1) { str = '不翻倍'; }
			var score = 0;
			for(var i = 0; i < 3; ++i) {
				score += resout.scoresArr[myChairId][chairId][i];
			}
			if(score >= 0) {
				url = 'Font/fnt_game2';
			} else {
				url = 'Font/fnt_game1';
			}
			// 显示怪牌分
			if(resout.guaipaiScoreArr[myChairId]+resout.guaipaiScoreArr[chairId] > 0) {
				var guaiScore = resout.guaipaiScoreArr[myChairId] - resout.guaipaiScoreArr[chairId];
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
			} else {
					this.guaiLabel.node.active = false;
			}
		}
		cc.loader.loadRes(url, cc.Font, function(err, font) {
			if(! err) { 
				this.zongfenLabel.font = font; 
				this.zongfenLabel.string = str;
			}
		}.bind(this));
	},

	setNodeSpriteFrame: function(url, node) {
		cc.loader.loadRes(url, cc.SpriteFrame, function(err, spriteFrame) {
			if(! err) {
				node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
			}
		});
	},


	getTypeUrlByCardArr: function(cardArr) {
		var url = 'ThirteenWater/TWSort/danpai';
		if(TWLogic.hasTonghuashun(cardArr)) {
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
		}
		else if(TWLogic.hasLiangdui(cardArr)) {
			url = 'ThirteenWater/TWSort/liangdui';
		}
		else if(TWLogic.hasDuizi(cardArr)) {
			url = 'ThirteenWater/TWSort/duizi';
		}
		return url;
	},

	update: function(dt) {
	}
});


