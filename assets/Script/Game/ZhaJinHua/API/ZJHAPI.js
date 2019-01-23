var gameProto = require('./Protos/GameProtoZJH');

var api = module.exports;

api.stake = function (stakeLevel){
    var router = 'game.gameHandler.gameMessageNotify';
    var msg = gameProto.userStakeNotify(stakeLevel);
    Global.NetworkManager.notify(router, msg);
};

api.giveUp = function () {
    var router = 'game.gameHandler.gameMessageNotify';
    var msg = gameProto.userGiveUpNotify();
    Global.NetworkManager.notify(router, msg);
};

api.lookCard = function () {
    var router = 'game.gameHandler.gameMessageNotify';
    var msg = gameProto.userLookCardNotify();
    Global.NetworkManager.notify(router, msg);
};

api.showdown = function () {
    var router = 'game.gameHandler.gameMessageNotify';
    var msg = gameProto.userShowDownNotify();
    Global.NetworkManager.notify(router, msg);
};

api.compare = function (comparechairId) {
    var router = 'game.gameHandler.gameMessageNotify';
    var msg = gameProto.userCompareNotify(comparechairId);
    Global.NetworkManager.notify(router, msg);
};

api.getGameData = function () {
    var router = 'game.gameHandler.gameMessageNotify';
    var msg = gameProto.getGameDataNotify();
    Global.NetworkManager.notify(router, msg);
};

api.guzhuyizhi = function (data) {
    var router = 'game.gameHandler.gameMessageNotify';
    var msg = gameProto.guzhuyizhiNotify(data);
    Global.NetworkManager.notify(router, msg);
};