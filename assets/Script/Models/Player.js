/**
 * Created by 苏永富 on 2017/6/26.
 */

//Player 属性一览
// uid: {type: String, default: ""},                           // 用户唯一ID
// nickname: {type: String, default: ""},                      // 昵称
// gold: {type: Number, default: 1000},                        // 金币
// diamond: {type: Number, default: 0},                        // 钻石
// roomCard: {type: Number, default: 999},                     // 房卡
// coupon: {type: Number, default: 0},                         // 礼券
// avatar: {type: Number, default: 0},                         // 头像
// createTime: {type: Number, default: 0},                     // 创建时间
//
// spreaderID:{type: Number, default: 0},                      // 推广人员ID
//
// spreadCount: {type: Number, default: 0},                    // 成功推广好友数量
// spreadGainedGold: {type: Number, default: 0},               // 推广已领取的金币
// spreadGainedDiamond: {type: Number, default: 0},            // 推广已领取的钻石
// spreadGainGold: {type: Number, default: 0},                 // 推广待领取的金币
// spreadGainDiamond: {type: Number, default: 0},              // 推广待领取的钻石
//
// bankGold: {type: Number, default: 0},                       // 银行金额
//
// lastSignTime: {type: Number, default: 0},                   // 上次签到时间
// continueSignTimes: {type: Number, default: 0},              // 连续签到次数
//
// lastTakeBaseEnsureTime: {type: Number, default: 0},         // 上次领取低保的时间
// takeBaseEnsureTimes: {type: Number, default: 0},            // 最后领取低保当日的已领取次数
//
// lastSharedTime: {type: Number, default: 0},                 // 上一次分享的时间
//
// friendIDArr: {type: [String], default: []},                 // 好友IDs
// friendRequestIDArr: {type: [String], default: []},          // 主动加好友列表
// friendApplyIDArr: {type: [String], default: []},            // 被动加好友列表
//
// tradeRecordArr: {type: [Number], default: []}                // 交易记录

let Player = module.exports = {};

Player.init = function (data) {
    //聊天数据存放表
    this.chatContent = {};

    this.friendUserShortInfoArr = [];
    this.friendSendMessageArr = [];

    //广播数据
    // this.broadcastContents = [];
    // this.broadcastContents.push({content: Global.Constant.BROADCAST_CONTENT[0]});

    //服务器发过来的数据初始化
    this.setProperties(data);

    Global.MessageCallback.addListener('UpdateUserInfoPush', this);
    Global.MessageCallback.addListener('BroadcastPush', this);
    Global.MessageCallback.addListener('UpdateTradeRecordDetailPush', this);
};

Player.messageCallbackHandler = function (router, msg) {
    switch (router) {
        case 'UpdateUserInfoPush':
            delete msg.pushRouter;
            this.setProperties(msg);
            Global.MessageCallback.emitMessage('UpdateUserInfoUI');
            break;
        case 'BroadcastPush':
            this.setBroadCastContent(msg);
            break;
        case 'UpdateTradeRecordDetailPush':
            this.setTradeHistory(msg);
            break;
    }
};

Player.setProperties = function (properties) {
    for (let key in properties) {
        if (properties.hasOwnProperty(key)) {
            // //好友简略信息只有添加操作，故做特殊处理
            // if (!!this[key] && key === 'friendUserShortInfoArr' && properties[key].length > 0) {
            //     for (let i = 0; i < properties[key].length; i++) {
            //         this[key][this[key].length] = properties[key][i];
            //     }
            // //聊天推送特殊处理
            // } else if (!!this[key] && key === 'friendSendMessageArr' && properties[key].length > 0) {
            //     let chatData = properties[key][0];
            //     let friendUserShortInfoArr = this.getPy('friendUserShortInfoArr');
            //     let data = {};
            //     for (let j = 0; j < friendUserShortInfoArr.length; j ++) {
            //         if (friendUserShortInfoArr[j].uid === chatData.uid) {
            //             data.uid = friendUserShortInfoArr[j].uid;
            //             data.avatar = friendUserShortInfoArr[j].avatar;
            //             data.nickname = friendUserShortInfoArr[j].nickname;
            //             data.content = chatData.content;
            //             break;
            //         }
            //     }
            //
            //     this.setChatContent(data.uid, data);
            // } else {
                this[key] = properties[key];
            // }
        }
    }
};

//获取短昵称
Player.getShortNickname = function (length) {
    let nickname = this.getPy('nickname');
    if (nickname.length > length) {
        nickname = nickname.substr(0, length) + '...';
    }

    return nickname;
};

//获取属性
Player.getPy = function (property) {
    if (Global.Tools.isWechatBrowser()) {
        if (property === 'avatar') {
            return Global.PlayerWechat.getPy('headimgurl');
        }

        if (property === 'nickname') {
            return Global.PlayerWechat.getPy('nickname');
        }
    }

    //金币保留两位小数，转换之后是字符串
    if (property === 'gold') {
        return this[property].toFixed(2);
    }

    //账号是手机号，做中间4位手机号变*处理
    if (property === 'account') {
        if (this[property].length === 11) {
            return this[property].substring(0, 3) + '****' + this[property].substring(7, 11);
        }
    }

    //如果昵称和账号一样，则做变*处理
    if (property === 'nickname') {
        if (this['nickname'] === this['account']) {
            return this.getPy('account');
        }
    }

    return this[property];
};

Player.getBindPhone = function () {
    return this.account;
};

//设置属性
Player.setPy = function (property, value) {
    this[property] = value;
};

//是否今天已经申请过退款
Player.isRefund = function () {
    cc.log(this.getPy('lastWithdrawCashTime'), Date.now(), Global.Tools.Utils.getIntervalDay(this.getPy('lastWithdrawCashTime'), Date.now()));


    return Global.Tools.Utils.getIntervalDay(this.getPy('lastWithdrawCashTime'), Date.now()) === 0;
};

//是否今天已签到
Player.isSign = function () {
    return Global.Tools.Utils.getIntervalDay(this.getPy('lastSignTime'), Date.now()) === 0;
};

//是否绑定银行卡
Player.isBindBankCard = function () {
    let bankCardInfo = this.getPy('bankCardInfo');
    return !!bankCardInfo && bankCardInfo.cardNumber !== '';
};

//是否是好友
Player.isFriend = function (friendUid) {
    let friendIDArr = this.getPy('friendIDArr');
    for (let i = 0; i < friendIDArr.length; i ++) {
        if (friendIDArr[i] === friendUid) {
            return true;
        }
    }

    return false;
};

//获取好友基本信息
Player.getFriendShortInfo = function (friendUid) {
    for (let i = 0; i < this.friendUserShortInfoArr.length; i ++) {
        if (this.friendUserShortInfoArr[i].uid === friendUid) {
            return this.friendUserShortInfoArr[i];
        }
    }

    return null;
};

//是否在好友列表或好友申请列表或被申请列表
Player.isInFriendRequestOrApplyArr = function (friendUid) {
    let friendIDArr = this.getPy('friendIDArr');
    let friendRequestIDArr = this.getPy('friendRequestIDArr');
    let friendApplyIDArr = this.getPy('friendApplyIDArr');

    for (let i = 0; i < friendIDArr.length; i ++) {
        if (friendIDArr[i] === friendUid) {
            return true;
        }
    }

    for (let i = 0; i < friendRequestIDArr.length; i ++) {
        if (friendRequestIDArr[i] === friendUid) {
            return true;
        }
    }

    for (let i = 0; i < friendApplyIDArr.length; i ++) {
        if (friendApplyIDArr[i] === friendUid) {
            return true;
        }
    }

    return false;
};

//设置聊天内容
Player.setChatContent = function (uid, contentData) {
    if (!this.chatContent[uid]) {
        this.chatContent[uid] = [];
    }
    contentData.time = Date.now();
    this.chatContent[uid].push(contentData);

    Global.MessageCallback.emitMessage('NEW_CHAT', {data: contentData});
};

//根据UID获取聊天内容
Player.getChatContentByUid = function (uid) {
    if (this.chatContent[uid]) {
        return this.chatContent[uid];
    }

    return [];
};

//获取所有聊天内容
Player.getAllChatContent = function () {
    return this.chatContent;
};

//设置广播内容
Player.setBroadCastContent = function (data) {
    this.broadcastContents.push(data);
};

//获取广播内容
Player.getBroadCastContents = function () {
    return this.broadcastContents;
};

//设置拍卖行交易记录
Player.setTradeHistory = function (data) {
    if (data.type === Global.Enum.updateDataType.ADD) {
        this.tradeRecordDetailArr.push(data.tradeOrderData);
    } else if (data.type === Global.Enum.updateDataType.REMOVE) {

    } else if (data.type === Global.Enum.updateDataType.UPDATE) {
        for (let i = 0; i < this.tradeRecordDetailArr.length; i ++) {
            if (this.tradeRecordDetailArr[i].orderID === data.tradeOrderData.orderID) {
                this.tradeRecordDetailArr[i] = data.tradeOrderData;
            }
        }
    }
};

//获取拍卖行交易记录
Player.getTradeHistory = function () {
    return this.tradeRecordDetailArr;
};

//邀请的好友
Player.setInviteFriends = function (uidArr) {
    this.friends = uidArr;
};

Player.getInvitedFriends = function () {
    return this.friends;
};

Player.isInRoom = function () {
    return !!this.getPy('roomID') && this.getPy('roomID') > 0;
};

//是否有可领取邮件
Player.checkCanGet = function () {
    let mails = Global.Player.getPy('emailArr');
    if (!!mails) {
        for (let i = mails.length - 1; i >= 0; i --) {
            let data = JSON.parse(mails[i]);
            if (data.coupon || data.diamond) {
                if (parseInt(data.status) === Global.Enum.emailStatus.NOT_RECEIVE) {
                    return true;
                }
            }
        }
    }
    return false;
};