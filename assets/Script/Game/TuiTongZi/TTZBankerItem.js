cc.Class({
	extends: cc.Component,
	properties: {
		bankerBg: cc.Node,
		nameLabel: cc.Label,
		goldLabel: cc.Label,
	},

	start () { },

	setNameAndGold (name, gold, isBanker) {
		this.bankerBg.active = isBanker;
		this.nameLabel.string = name;
		this.goldLabel.string = gold;
	},
});
