var api = module.exports = {};

//进入大厅
api.entry = function (token, userInfo, cbRouter) {
    var router = 'connector.entryHandler.entry';
    var requestData = {
        token: token,
        userInfo: userInfo
    };
    Global.NetworkManager.send(router, requestData, cbRouter || 'EntryHallResponse');
};

// --------------------------------------------用户相关------------------------------------------
//查找玩家，获取玩家信息
api.searchRequest = function (uid, cbRouter) {
    var router = 'hall.userHandler.searchUserData';
    var requestData = {
        uid:uid
    };
    Global.NetworkManager.send(router, requestData, cbRouter || 'SearchResponse')
};

//绑定手机号
api.bindPhoneRequest = function (phone, verificationCode, imgCodeInfo, cbRouter) {
    var router = 'hall.userHandler.bindPhone';
    var requestData = {
        phone: phone,
        verificationCode: verificationCode,
        imgCodeInfo: imgCodeInfo
    };
    Global.NetworkManager.send(router, requestData, cbRouter || 'BindPhoneResponse');
};

// 修改昵称
api.changeNicknameRequest = function (nickname, cbRouter) {
    var router = 'hall.userHandler.updateNickname';
    var requestData = {
        nickname: nickname
    };
    Global.NetworkManager.send(router, requestData, cbRouter || 'ChangeNicknameResponse');
};

// 更新银行卡信息
api.updateBankCardInfoRequest = function (cardNumber, bankName, ownerName, cbRouter) {
    var router = 'hall.userHandler.updateBankCardInfo';
    var requestData = {
        bankCardInfo: {
            cardNumber: cardNumber,
            bankName: bankName,
            ownerName: ownerName
        }
    };
    Global.NetworkManager.send(router, requestData, cbRouter || 'UpdateBankCardInfoResponse');
};

// 保险柜操作
/**
 * @param count 大于0为存入，小于0为取出
 * @param password 取出时需要密码
 * @param cbRouter
 */
api.safeBoxOperationRequest = function (count, password, cbRouter) {
    var router = 'hall.userHandler.safeBoxOperation';
    var requestData = {
        count: count,
        safePassword: password
    };
    Global.NetworkManager.send(router, requestData, cbRouter || 'SafeBoxOperationResponse');
};

// 修改登录密码
api.updateLoginPasswordRequest = function (oldPassword, newPassword, cbRouter) {
    var router = 'hall.userHandler.updateLoginPassword';
    var requestData = {
        oldPassword: oldPassword,
        newPassword: newPassword
    };
    Global.NetworkManager.send(router, requestData, cbRouter || 'UpdateLoginPasswordResponse');
};

// 修改保险柜密码
api.updateSafePasswordRequest = function (oldPassword, newPassword, cbRouter) {
    var router = 'hall.userHandler.updateSafePassword';
    var requestData = {
        oldPassword: oldPassword,
        newPassword: newPassword
    };
    Global.NetworkManager.send(router, requestData, cbRouter || 'UpdateSafePasswordResponse');
};

// 提款申请
api.withdrawCashRequest = function (count, cbRouter) {
    var router = 'hall.currencyHandler.withdrawCashRequest';
    var requestData = {
        count: count
    };
    Global.NetworkManager.send(router, requestData, cbRouter || 'WithdrawCashResponse');
};

// 提取佣金
api.extractionCommissionRequest = function (cbRouter) {
    var router = 'hall.currencyHandler.extractionCommission';
    var requestData = {};
    Global.NetworkManager.send(router, requestData, cbRouter || 'ExtractionCommissionResponse');
};

// --------------------------------------------充值相关------------------------------------------
//购买商城物品
api.purchaseRechargeItemRequest = function(itemID, rechargePlatform, rechargeInfo, cbRouter){
    var router = 'hall.rechargeHandler.purchaseItem';
    var requestData = {
        itemID: itemID,
        rechargePlatform: rechargePlatform,
        rechargeInfo: rechargeInfo
    };
    Global.NetworkManager.send(router, requestData, cbRouter || 'PurchaseRechargeItemResponse');
};

// --------------------------------------------记录相关------------------------------------------
// 获取记录
/**
 * recordType : enumeration.recordType
 */
api.getRecordDataRequest = function(recordType, startIndex, count, cbRouter){
    var router = 'hall.recordHandler.getRecordData';
    var requestData = {
        recordType: recordType,
        startIndex: startIndex,
        count: count
    };
    Global.NetworkManager.send(router, requestData, cbRouter || 'GetRecordDataResponse')
};

api.getDirectlyMemberRecordDataRequest = function (startIndex, count, cbRouter) {
    var router = 'hall.recordHandler.getDirectlyMemberRecordData';
    var requestData = {
        startIndex: startIndex,
        count: count
    };
    Global.NetworkManager.send(router, requestData, cbRouter || 'GetDirectlyMemberRecordDataResponse')
};

api.getAgentMemberRecordDataRequest = function (startIndex, count, cbRouter) {
    var router = 'hall.recordHandler.getAgentMemberRecordData';
    var requestData = {
        startIndex: startIndex,
        count: count
    };
    Global.NetworkManager.send(router, requestData, cbRouter || 'GetAgentMemberRecordDataResponse')
};

// --------------------------------------------房间相关------------------------------------------
api.createRoomRequest = function (parameters, gameTypeID, cbRouter){
    var router = 'hall.gameHandler.createRoom';
    var requestData = {
        gameRule: parameters,
        gameTypeID: gameTypeID
    };
    Global.NetworkManager.send(router, requestData, cbRouter || 'CreateRoomResponse');
};

api.joinRoomRequest = function (joinRoomID, cbRouter){
    var router = 'hall.gameHandler.joinRoom';
    var requestData = {
        roomId: joinRoomID
    };
    Global.NetworkManager.send(router, requestData, cbRouter || 'JoinRoomResponse');
};

api.exitRoomRequest = function(cbRouter){
    var router = 'hall.gameHandler.exitRoom';
    var requestData = {};
    Global.NetworkManager.send(router, requestData, cbRouter || 'ExitRoomResponse');
};

api.matchRoomRequest = function (gameTypeID, cbRouter) {
    var router = 'hall.gameHandler.matchRoom';
    var requestData = {
        gameTypeID: gameTypeID
    };
    Global.NetworkManager.send(router, requestData, cbRouter || 'MatchRoomResponse');
};
