cc.Class({
    extends: cc.Component,

    properties: {

    },

    start () { },

	onButtonClick (event, param) {
		if(param === 'close') {
			Global.DialogManager.destroyDialog(this);
		}
	},
});
