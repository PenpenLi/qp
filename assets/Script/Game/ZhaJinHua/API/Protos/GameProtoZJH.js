var proto = module.exports;

// 通用常量
proto.GAME_NAME = "扎金花";

//房卡模式计分档位
proto.STAKE_LEVEL_BASE = [1, 2, 3, 4, 5];
proto.STAKE_XUE_PIN_BASE = 50;

//加注的档位(具体数值由服务器决定)
proto.STAKE_LEVEL = [1, 2, 3, 4, 5];
proto.STAKE_XUE_PIN = 50;

proto.LOOK_CARD_MULTIPLE = 2;//看牌之后的下注倍率
proto.MAX_ROUND = 10;//最大下注次数

//牌型
proto.CARD_TYPE_ZASE_235 = 1;
proto.CARD_TYPE_DAN_ZHANG = 10;
proto.CARD_TYPE_DUI_ZI = 20;
proto.CARD_TYPE_SHUN_ZI = 30;
proto.CARD_TYPE_TONG_HUA = 40;
proto.CARD_TYPE_TONG_HUA_SHUN = 50;
proto.CARD_TYPE_BAO_ZI = 60;


//玩家状态
proto.NORMAL_PLAYING = 10000;//正常玩状态
proto.LOOK_CARD = 10001;//已看牌
proto.LOSE = 10002;//已输
proto.GIVE_UP = 10003;//弃牌
proto.LEAVE = 10004;//离开

//消息类型
//接收消息
proto.GAME_OPERATE_STAKE_NOTIFY = 401;//玩家下注信息
proto.GAME_OPERATE_GIVEUP_NOTIFY = 402;//弃牌
proto.GAME_OPERATE_LOOK_NOTIFY = 403;//看牌
proto.GAME_OPERATE_COMPARE_NOTIFY = 404;//比牌
proto.GAME_OPERATE_SHOWDOWN_NOTIFY = 405;//亮牌
proto.GAME_OPERATE_GET_GAME_DATA_NOTIFY = 406;//新进入游戏的玩家获取游戏数据
proto.GAME_OPERATE_GU_ZHU_YI_ZHI_NOTIFY = 407;//玩家孤注一掷

//推送消息
proto.GAME_OPERATE_STAKE_PUSH = 301;//推送下注信息
proto.GAME_OPERATE_GIVEUP_PUSH = 302;//推送弃牌信息
proto.GAME_OPERATE_LOOK_PUSH = 303;//推送看牌
proto.GAME_OPERATE_COMPARE_PUSH = 304;//推送比牌
proto.GAME_OPERATE_SHOWDOWN_PUSH = 305;//推送亮牌
proto.GAME_OPERATE_GET_GAME_DATA_PUSH = 306;//新进入游戏的玩家获取游戏数据
proto.GAME_OPERATE_GU_ZHU_YI_ZHI_PUSH = 307;//玩家孤注一掷推送

//游戏数据验证错误推送
proto.GAME_DATA_AUTH_ERROR_PUSH = 601;
proto.GAME_DATA_CHAIR_ERROR = 701;//当前下注的椅子验证错误
proto.GAME_DATA_STAKE_LEVEL_ERROR = 702;//当前下注等级错误

//游戏流程
proto.GAME_START_PUSH = 201;//游戏开局
proto.GAME_END_PUSH = 202;//游戏结束+结算

//其他推送
proto.GAME_CHAIR_TURN_PUSH = 501;//轮到哪张椅子操作了
proto.GAME_UPDATE_SCORE = 502;//用户分数推送


//结算时的赢类型
proto.WIN_TYPE_OTHERS_GIVE = 1;//其他人均弃牌或离开
proto.WIN_TYPE_WIN = 2;//到达最大下注数，靠实力赢

proto.gameUpdateScorePush = function (data) {
    return {
        type: proto.GAME_UPDATE_SCORE,
        data: data
    }
};

proto.gameStartPush = function (data) {
    return {
        type: proto.GAME_START_PUSH,
        data: data
    }
};

proto.gameEndPush = function (data) {
    return {
        type: proto.GAME_END_PUSH,
        data: data
    }
};

proto.userStakeNotify = function (stakeLevel) {
    return {
        type: proto.GAME_OPERATE_STAKE_NOTIFY,
        data: {
            stakeLevel: stakeLevel
        }
    }
};

proto.userGiveUpNotify = function () {
    return {
        type: proto.GAME_OPERATE_GIVEUP_NOTIFY,
        data: {}
    }
};

proto.userLookCardNotify = function () {
    return {
        type: proto.GAME_OPERATE_LOOK_NOTIFY
    }
};

proto.userShowDownNotify = function (showchairId) {
    return {
        type: proto.GAME_OPERATE_SHOWDOWN_NOTIFY,
        data: {
            showchairId: showchairId
        }
    }
};

proto.userCompareNotify = function (comparechairId) {
    return {
        type: proto.GAME_OPERATE_COMPARE_NOTIFY,
        data: {
            comparechairId: comparechairId
        }
    }
};

proto.getGameDataNotify = function () {
    return {
        type: proto.GAME_OPERATE_GET_GAME_DATA_NOTIFY
    }
};

proto.guzhuyizhiNotify = function (data) {
    return {
        type: proto.GAME_OPERATE_GU_ZHU_YI_ZHI_NOTIFY,
        data: data
    }
};

proto.guzhuyizhiPush = function (data) {
    return {
        type: proto.GAME_OPERATE_GU_ZHU_YI_ZHI_PUSH,
        data: data
    }
};

proto.getGameDataPush = function (data) {
    return {
        type: proto.GAME_OPERATE_GET_GAME_DATA_PUSH,
        data: data
    }
};

proto.userComparePush = function (data) {
    return {
        type: proto.GAME_OPERATE_COMPARE_PUSH,
        data: {
            loserchairId: data.loserchairId,
            comparechairId: data.comparechairId,
            chairId: data.chairId
        }
    }
};

proto.userShowdownPush = function (data, chairId) {
    return {
        type: proto.GAME_OPERATE_SHOWDOWN_PUSH,
        data: {
            chairId: chairId,
            cards: data
        }
    }
};

proto.userLookCardPush = function (data, cardType, chairId) {
    return {
        type: proto.GAME_OPERATE_LOOK_PUSH,
        data: {
            cardType: cardType,
            cards: data,
            chairId: chairId
        }
    }
};

proto.userStakePush = function (data, chairId) {
    return {
        type: proto.GAME_OPERATE_STAKE_PUSH,
        data: {
            chairId: chairId,
            stakeLevel: data.stakeLevel,
            goldSumAmount: data.goldSumAmount,
            round: data.round,
            multiple: data.multiple
        }
    }
};

proto.userGiveUpPush = function (chairId) {
    return {
        type: proto.GAME_OPERATE_GIVEUP_PUSH,
        data: {
            chairId: chairId
        }
    }
};

proto.chairTurnPush = function (data) {
    return {
        type: proto.GAME_CHAIR_TURN_PUSH,
        data: data
    }
};

proto.dataAuthErrorPush = function (data) {
    return {
        type: proto.GAME_DATA_AUTH_ERROR_PUSH,
        data: data
    }
};