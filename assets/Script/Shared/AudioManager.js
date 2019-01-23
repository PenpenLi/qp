var constant = require('./Constant');

var AudioManager = module.exports = {};

AudioManager.currentBgMusic = -1;

AudioManager.isMusicEnabled = true;
AudioManager.isSoundEnabled = true;

AudioManager.musicVolume = 1; //音乐音量
AudioManager.soundVolume = 1; //音效音量

AudioManager.voice = '';

AudioManager.commonSoundPath = {
    clickButtonSound: 'Sound/button'
};

AudioManager.commonSound = {
    clickButton: null
};

//0为静音，1为开启声音
AudioManager.initMS = function () {
    this.setSoundOn();
    this.setMusicOn();

    cc.log(cc.sys.localStorage.getItem('Music'), 'Music');
    cc.log(cc.sys.localStorage.getItem('Sound'), 'Sound');
    cc.log(cc.sys.localStorage.getItem('MusicVolume'), 'MusicVolume');
    cc.log(cc.sys.localStorage.getItem('SoundVolume'), 'SoundVolume');

    //初始化开关声音
    if (cc.sys.localStorage.getItem('Music') == 0) {
        this.isMusicEnabled = false;
    } else {
        cc.sys.localStorage.setItem('Music', 1);
    }

    if (cc.sys.localStorage.getItem('Sound') == 0) {
        this.isSoundEnabled = false;
    } else {
        cc.sys.localStorage.setItem('Sound', 1);
    }

    //初始化音乐和音效的音量
    if (cc.sys.localStorage.getItem('MusicVolume') === null) {
        cc.sys.localStorage.setItem('MusicVolume', this.musicVolume);
        cc.sys.localStorage.setItem('SoundVolume', this.soundVolume);
    } else {
        this.musicVolume = parseFloat(cc.sys.localStorage.getItem('MusicVolume'));
        this.soundVolume = parseFloat(cc.sys.localStorage.getItem('SoundVolume'));
    }

    //游戏中的语音初始化
    if (cc.sys.localStorage.getItem('voice') && cc.sys.localStorage.getItem('voice') !== '') {
    } else {
        cc.sys.localStorage.setItem('voice', Global.Enum.VOICE.GAN_ZHOU_HUA);
        this.voice = Global.Enum.VOICE.GAN_ZHOU_HUA;
    }
    this.voice = cc.sys.localStorage.getItem('voice');
    cc.log('voice', cc.sys.localStorage.getItem('voice'));
};

AudioManager.startPlayBgMusic = function (url, cb){
    if (!url) url = constant.DEFUALT_BG_MUSIC_PATH;
    AudioManager.stopBgMusic();
    cc.loader.loadRes(url, function (err, clip) {
        if (!!err){
            cc.log('startPlayBgMusic failed');
        }else{
            AudioManager.currentBgMusic = cc.audioEngine.play(clip, true, AudioManager.isMusicEnabled? AudioManager.musicVolume:0);
            if (!AudioManager.isMusicEnabled){
                cc.audioEngine.pause(AudioManager.currentBgMusic);
            }
        }
        if(!!cb) cb(err);
    });
};

AudioManager.stopBgMusic = function(){
    if (this.currentBgMusic === null || this.currentBgMusic < 0) return;
    cc.audioEngine.stop(this.currentBgMusic);
    this.currentBgMusic = -1;
};

AudioManager.playSound = function(url, loop){
    if (!url || !AudioManager.isSoundEnabled) return;
    if (loop !== true) loop = false;
    cc.loader.loadRes(url, function (err, clip) {
        if (!!err){
            console.error('playSound failed:' + url);
        }else{
            cc.audioEngine.play(clip, loop, AudioManager.soundVolume);
        }
    });
};

AudioManager.playCommonSoundClickButton = function (){
    if (!AudioManager.isSoundEnabled) return;
    if (AudioManager.commonSound.clickButton !== null){
        cc.audioEngine.play(AudioManager.commonSound.clickButton, false, AudioManager.soundVolume);
    }else {
        cc.loader.loadRes(AudioManager.commonSoundPath.clickButtonSound, function (err, clip) {
            if (!!err){
                cc.log("playCommonSoundClickButton failed");
            }else{
                AudioManager.commonSound.clickButton = clip;
                cc.audioEngine.play(AudioManager.commonSound.clickButton, false, AudioManager.soundVolume);
            }
        });
    }
};

//Music 1为开，0为关
AudioManager.setMusicOn = function () {
    cc.sys.localStorage.setItem('Music', 1);
    cc.audioEngine.setVolume(this.currentBgMusic, 1);
    cc.audioEngine.resume(this.currentBgMusic);
    this.isMusicEnabled = true;
};

AudioManager.setMusicOff = function () {
    cc.sys.localStorage.setItem('Music', 0);
    cc.audioEngine.setVolume(this.currentBgMusic, 0);
    this.isMusicEnabled = false;
};

AudioManager.getMusicEnabled = function () {
    return this.isMusicEnabled;
};

//Sound 1为开，0为关
AudioManager.setSoundOn = function () {
    cc.sys.localStorage.setItem('Sound', 1);
    this.isSoundEnabled = true;
};

AudioManager.setSoundOff = function () {
    cc.sys.localStorage.setItem('Sound', 0);
    this.isSoundEnabled = false;
};

AudioManager.getSoundEnabled = function () {
    return this.isSoundEnabled;
};

AudioManager.setMusicVolume = function (volume) {
    this.musicVolume = parseFloat(volume.toFixed(1));
    if (this.musicVolume === parseFloat(cc.sys.localStorage.getItem('MusicVolume'))) {
    } else {
        cc.sys.localStorage.setItem('MusicVolume', this.musicVolume);
    }

    if (AudioManager.currentBgMusic >= 0){
        cc.audioEngine.setVolume(AudioManager.currentBgMusic, this.musicVolume);
    }
};

AudioManager.getMusicVolume = function () {
    return this.musicVolume;
};

AudioManager.setSoundVolume = function (volume) {
    this.soundVolume = parseFloat(volume.toFixed(1));
    if (this.soundVolume === parseFloat(cc.sys.localStorage.getItem('SoundVolume'))) {
    } else {
        cc.sys.localStorage.setItem('SoundVolume', this.soundVolume);
    }
};

AudioManager.getSoundVolume = function () {
    return this.soundVolume;
};

AudioManager.setVoice = function (voice) {
    cc.sys.localStorage.setItem('voice', voice);
    this.voice = voice;
};

AudioManager.getVoice = function () {
    return this.voice;
};
