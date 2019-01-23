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
	},

	setRecordData: function(name, avatar, score, showCrown) {
		this.nameLabel.string = name;
		this.scoreLabel.string = score;
		var headSprite = this.node.getChildByName('HeadSprite');
		if(! this.recordAvatar || this.recordAvatar !== avatar) {
			this.recordAvatar = avatar;
			Global.Tools.updateSpriteFrame(avatar, headSprite.getComponent(cc.Sprite));
		}
		var crownSprite = this.node.getChildByName('CrownSprite');
		crownSprite.active = showCrown;
	},

	update: function(dt) {
	}
});

