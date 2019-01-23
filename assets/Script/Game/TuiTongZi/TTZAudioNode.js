cc.Class({
	extends: cc.Component,
	properties: {
		dian0: cc.AudioSource,
		dian1: cc.AudioSource,
		dian2: cc.AudioSource,
		dian3: cc.AudioSource,
		dian4: cc.AudioSource,
		dian5: cc.AudioSource,
		dian6: cc.AudioSource,
		dian7: cc.AudioSource,
		dian8: cc.AudioSource,
		dian9: cc.AudioSource,
		backMusic: cc.AudioSource,
		startGame: cc.AudioSource,
		flipCard: cc.AudioSource,
		winAll: cc.AudioSource,
		loseAll: cc.AudioSource,
		baozi: cc.AudioSource,
		dice: cc.AudioSource,
	},

	start () {
		this.setVolume();
		//this.backMusic.loop = true;
		//this.backMusic.play();
		Global.AudioManager.startPlayBgMusic('TuiTongZi/Audio/BackMusic');
	},

	onDestroy () {
		Global.AudioManager.stopBgMusic();
		//this.backMusic.stop();
	},

	playDot (num) {
		var array = [this.dian0, this.dian1, this.dian2, this.dian3, this.dian4,
			this.dian5, this.dian6, this.dian7, this.dian8, this.dian9 ];
		var audioSource = array[num];
		audioSource.play();
	},

	playBaozi () {
		this.baozi.play();
	},

	playStartGame () {
		this.startGame.play();
	},

	playFlipCard () {
		this.flipCard.play();
	},

	playWinAll () {
		this.winAll.play();
	},

	playLoseAll () {
		this.loseAll.play();
	},

	playDice () {
		this.dice.play();
	},

	setVolume () {
	    var volume = Global.AudioManager.getSoundVolume();
		var array = [ this.dian0, this.dian1, this.dian2, this.dian3, this.dian4, this.dian5, 
			this.dian6, this.dian7, this.dian8, this.dian9, this.startGame, this.flipCard, 
			this.winAll, this.loseAll, this.baozi, this.dice];
		for(var i = 0; i < array.length; ++i) {
			array[i].volume = volume;
		}
	},
});

