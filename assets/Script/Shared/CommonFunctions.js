/**
 * Created by cly on 2017/3/21.
 */

var dialogManager = require('../Shared/DialogManager');
var GameTypes = require("../Models/GameTypes");
var Constant = require('../Shared/Constant');

var CommonFunctions = module.exports = {};

/**
 *快速创建sprite
 *@param src        资源路径
 *@return           sprite
 */
CommonFunctions.getSprite = function(src) {
    var node = new cc.Node();
    var sprite = node.addComponent(cc.Sprite);
    sprite.spriteFrame = new cc.SpriteFrame();
    sprite.spriteFrame.setTexture(cc.url.raw(src)); 
    return node;

};

CommonFunctions.loadRes = function (url, type, completeCallback ){
    if (!!completeCallback){
        type = completeCallback
    }
    cc.loader.loadRes(url, type, completeCallback);
};

CommonFunctions.formatNumber = function (num) {
    if (num >= 100000000) {
        return (num / 100000000) + "亿";
    } else if (num >= 10000) {
        return (num / 10000) + '万';
    } else if (num >= 1000) {
        return (num / 1000) + '千';
    } else {
        return num
    }
};

//反回有保留有效数字的数值
CommonFunctions.formatNumberWithSD = function (num, sd) {
    var rangeArr = [
        {range: 1000000000000, unit: '万亿'},
        {range: 100000000, unit: '亿'},
        {range: 10000, unit: '万'}
    ];

    for (var i = 0; i < rangeArr.length; i ++) {
        if (num >= rangeArr[i].range) {
            return (num / rangeArr[i].range - 0.5).toPrecision(sd) + rangeArr[i].unit;
        }
    }

    return num;
};

CommonFunctions.stringFormat = function() {
    if (arguments.length === 0)
        return null;
    var str = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
        str = str.replace(re, arguments[i]);
    }
    return str;
};

CommonFunctions.showLoadingRes = function (res, cb) {
    dialogManager.createDialog('UIPrefabs/LoadingDialog', res, function (err, dialog) {
        if (!!dialog) {
            dialog.getComponent('LoadingDialog').setLoadingEndCallback(cb);
        }
    });
};

CommonFunctions.entryChooseRoomDialog = function (kindID, cb) {
    if (!kindID) return;
    switch(kindID) {
        case Constant.gameTypeMahJongBloodBattle:
        case Constant.gameTypeMahJongBloodFlow:
        case Constant.gameTypeMahJongGuangDong:
        case Constant.gameTypeMahJongPublic:
        {
            dialogManager.createDialog("Mahjong/Main/MahjongMainDialog", kindID, function () {
                if (!!cb) cb();
            });
            break;
        }
        case Constant.gameTypeZJH:
        {
            dialogManager.createDialog("ZhaJinHua/UIPrefabs/ZJHMainUI", kindID, function () {
                if (!!cb) cb();
            });
            break;
        }

        default :
        {
            dialogManager.createDialog("UIPrefabs/ChooseRoomDialog", kindID, function () {
                if (!!cb) cb();
            });
        }
    }
};

CommonFunctions.getDist = function (fromPos, toPos) {
    var dx = toPos.x - fromPos.x;
    var dy = toPos.y - fromPos.y;
    return Math.sqrt(dx * dx + dy * dy);
};

CommonFunctions.getRandomNum = function (Min, Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    return (Min + Math.round(Rand * Range));
};

CommonFunctions.getLength = function (obj) {
    var total = 0;
    for (var k in obj) {
        total++;
    }
    return total;
};

CommonFunctions.clone = function (origin) {
    if (!origin) {
        return;
    }

    var obj = {};
    for (var f in origin) {
        if (origin.hasOwnProperty(f)) {
            obj[f] = origin[f];
        }
    }
    return obj;
};

CommonFunctions.nodeMoveTo = function (node, endPos, endScale, endRotation, cb){
    var startPos = node.getPosition();
    var time = CommonFunctions.getDist(startPos, endPos)/2000;
    var spawnActionArr = [cc.moveTo(time, endPos)];
    var callback = cc.callFunc(function() {
        if (!!cb) cb();
    });
    if (endScale != null){
        spawnActionArr.push(cc.scaleTo(time, endScale));
    }
    if (endRotation != null){
        var rotation = endRotation - Math.floor(node.rotation)%360;
        rotation += (Math.floor(time * 10)*360);
        spawnActionArr.push(cc.rotateBy(time, rotation));
    }
    node.runAction(cc.sequence([cc.spawn(spawnActionArr), callback]));
};

CommonFunctions.updateSpriteFrame = function (imgUrl, target_, cb) {
    var target = target_;
    cc.loader.loadRes(imgUrl, cc.SpriteFrame, function (err, spriteFrame){
        if (!!err){
            console.error(err);
        }else{
            target.spriteFrame = spriteFrame;
            if (!!cb) {
                cb();
            }
        }
    });
};

CommonFunctions.numberToString = function (number, length, char){
    var str = number.toString();
    if (!!length && !!char){
        while (str.length < length){
            str = char + str;
        }
    }
    return str;
};

CommonFunctions.formatGoldString = function(goldNumber, length){
    if (!length) length = 4;
    if (goldNumber < 10000){
        return goldNumber.toString();
    }else {
        var str = '';
        if (goldNumber < 100000000){
            str = (goldNumber/10000).toString().substring(0, length);
            if (str.indexOf('.') === (str.length - 1)){
                str = str.substring(0, str.length - 1);
            }
            str += '万';
        } else {
            str = (goldNumber/100000000).toString().substring(0, length);
            if (str.indexOf('.') === (str.length - 1)){
                str = str.substring(0, str.length - 1);
            }
            str += '亿';
        }
        return str;
    }
};

