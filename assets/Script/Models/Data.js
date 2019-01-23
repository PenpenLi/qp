/**
 * Created by 苏永富 on 2017/6/27.
 */

var Data = module.exports = {};

Data.init = function (datas) {
    cc.log(datas);

    this.setDatas(datas);
    Global.MessageCallback.addListener('UpdateData', this);
};

Data.messageCallbackHandler = function (router, data) {
    switch (router) {
        case 'UpdateData':
            break;
    }
};

Data.setDatas = function (datas) {
    for (var key in datas) {
        if (datas.hasOwnProperty(key)) {
            this[key] = datas[key];
        }
    }
};

Data.setData = function (key, value) {

};

Data.getData = function (key) {
    return this[key];
};

//根据金币数量获取玩家等级
Data.getLevelByGold = function (gold) {
    var levelDefine = this.getData('levelDefine');
    var data = {};

    //到达最大等级
    if (gold >= levelDefine[levelDefine.length - 1].exp) {
        var define1 = levelDefine[levelDefine.length - 1];
        data.levelStr = '{0}({1}级)'.format(define1.name, define1.level);
        data.progress = 1;
        data.progressStr = gold;
        data.level = define1.level;

        return data;
    }

    for (var i = 0; i < levelDefine.length; i ++) {
        var define = levelDefine[i];
        if (gold >= define.exp) {
            data.levelStr = '{0}({1}级)'.format(define.name, define.level);
            data.progress = gold / levelDefine[i + 1].exp;
            data.progressStr = gold + '/' + levelDefine[i + 1].exp;
            data.level = define.level;
        }
    }

    return data;
};
