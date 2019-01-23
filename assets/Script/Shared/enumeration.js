/**
 * Created by yuzheng on 2017/3/14.
 */
var enumeration = module.exports;

enumeration.gameType = {
    ZJH: 1,               //扎金花
    NN: 10,               //牛牛
    SSS: 20,              //十三水
    TTZ: 30,              //推筒子
};

enumeration.gameName = [];
enumeration.gameName[1] = '扎金花';
enumeration.gameName[10] = '牛牛';
enumeration.gameName[20] = '十三水';
enumeration.gameName[30] = '推筒子';

enumeration.goodsType = {
    NONE: 0,
    RMB: 1,
    GOLD: 2,
    DIAMOND: 3,
    TICKET: 4,
    COUPON: 5
};

enumeration.goodsName = [];
enumeration.goodsName[enumeration.goodsType.RMB] = '人民币';
enumeration.goodsName[enumeration.goodsType.GOLD] = '金币';
enumeration.goodsName[enumeration.goodsType.DIAMOND] = '钻石';
enumeration.goodsName[enumeration.goodsType.TICKET] = '门票';
enumeration.goodsName[enumeration.goodsType.COUPON] = '礼券';

enumeration.goodsImg = [];
enumeration.goodsImg[enumeration.goodsType.TICKET] = 'Sell/ticket';
enumeration.goodsImg[enumeration.goodsType.COUPON] = 'Sell/prop';

// 游戏模式
enumeration.roomSettlementMethod = {
    NONE: 0,
    GOLD: 1,                    // 金币模式
    SCORE: 2,                   // 积分模式
    LIMIT_GOLD: 3,              // 限制金币模式
};

// 房间类型
enumeration.roomType = {
    NONE: 0,
    NORMAL: 1,                  // 匹配类型
    PRIVATE: 2,                 // 私有房间（房卡房间）
    HUNDRED: 3                  // 百人房间
};

// 操作类型
enumeration.updateDataType = {
    NONE: 0,
    ADD: 1,
    REMOVE:2,
    UPDATE: 3
};

//玩家性别
enumeration.PlayerSex = {
    MAN: 0,
    WOMAN: 1
};

// 登录平台
enumeration.loginPlatform = {
    NONE: 0,
    ACCOUNT: 1,
    WEI_XIN: 2,
    MOBILE_PHONE: 3
};

enumeration.userRoomState = {
    NONE: 0,
    ENTERING: 1,
    IN_ROOM: 2
};

enumeration.gameRoomStatus = {
    NONE: 0,
    FREE: 1,
    PLAYING: 2
};

enumeration.gameRoomStartType = {
    NONE: 0,
    ALL_READY: 1,
    AUTO_START: 2
};

enumeration.userOnlineStatus = {
    NONE: 0,
    OFF_LINE: 1,
    ON_LINE: 2
};

enumeration.gameRoomChatContentType = {
    NONE: 0,
    EMOTION: 1,
    QUICK_TEXT: 2,
    TEXT: 3,
    VOICE: 4
};

enumeration.VOICE = {
    PU_TONG_HUA: 'putonghua',
    GAN_ZHOU_HUA: 'ganzhouhua'
};

enumeration.ShopType = {
    NONE: 0,
    SHOP_GOLD: 1,
    SHOP_DIAMOND:2
};

enumeration.RoomUserStatus = {
    NONE: 0,
    ONLINE: 1,
    OFFLINE: 2
};

// 第三方支付平台中的选择支付方式
enumeration.PAY_TYPE = {
    NONE: 0,
    ALI_PAY: 1,                 // 支付宝
    WE_CHAT: 2,                 // 微信
    QQ_PAY: 3,                  // QQ支付
    UNION_PAY: 4                // 银联
};

// 充值平台
enumeration.RechargePlatform = {
    NONE: 0,
    JFT: 1,                     // 骏付通
    QMJF:2,                      // 全名金服
    ALI: 3,                        //支付宝
    WX: 4,                        //微信
    RM: 5,                       //融脉
    JXYL: 6                     // 聚闲娱乐支付
};

// 系统平台
enumeration.SystemPlatform = {
    NONE: 0,
    ANDROID: 1,
    IOS: 2,
    WEB: 3
};

// 权限类型
enumeration.userPermissionType = {
    NONE: 0,
    LOGIN_CLIENT:                   0x0001,             // 登录客户端
    LOGIN_MT:                       0x0002,             // 登录管理工具
    USER_MANAGER:                   0x0004,             // 用户管理
    USER_SYSTEM_MANAGER:            0x0008,             // 系统管理
    EXCHANGE_MANAGER:               0x0010,             // 兑换管理
    SPREAD_MANAGER:                 0x0020,             // 推广管理
    GAME_MANAGER:                   0x0040,             // 游戏管理
    DATA_MANAGER:                   0x0080              // 数据统计
};

// 邮件状态
enumeration.emailStatus = {
    NONE: 0,
    NOT_RECEIVE: 1,
    RECEIVED: 2
};

// 兑换订单状态
enumeration.exchangeRecordStatus = {
    NONE: 0,
    WAIT_DELIVERY: 1,                   // 备货中
    ALREADY_DELIVERY: 2                 // 已发货
};

// 订单状态
enumeration.orderStatus = {
    WAIT_HANDLE: 0,                     // 未处理
    ALREADY_HANDLE: 1                   // 已处理
};

// 记录类型
enumeration.recordType = {
    NONE: 0,
    RECHARGE: 1,                        // 充值记录
    WITHDRAWALS: 2,                     // 提现记录
    GAME: 3,                            // 游戏记录
    LOGIN: 4,                            // 登录记录
    EXTRACT_COMMISSION: 5,              // 提取佣金记录
    GAME_PROFIT: 6,                     // 游戏抽水记录
    EXTRACT_INVENTORY: 7,                // 库存抽取记录
    ADMIN_GRANT: 8                      // 管理员赠送记录
};