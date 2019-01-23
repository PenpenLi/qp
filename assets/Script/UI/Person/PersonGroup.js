// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        userInfoGroup: cc.Node,
        changePhoneGroup: cc.Node,
        bankGroup: cc.Node,
        gameRecordGroup: cc.Node,
        loginRecordGroup: cc.Node,
        changeLoginPasswordGroup: cc.Node,
        changeTikuanPasswordGroup: cc.Node,
        rewardGroup: cc.Node,

        gameRecordContent: cc.Node,
        loginRecordItem: cc.Prefab,
        gameRecordItem: cc.Prefab,

        //个人信息
        nicknameEdit: cc.EditBox,
        accountText: cc.Label,
        IDText: cc.Label,
        goldText: cc.Label,
        phoneText: cc.Label,

        //绑定新手机
        changePhoneEdit: cc.EditBox,
        changePhoneImgCodeEdit: cc.EditBox,
        changePhonePhoneCodeEdit: cc.EditBox,
        changePhoneImgCode: cc.Sprite,
        changePhoneGetPhoneCodeBtn: cc.Button,
        changePhoneGetPhoneCodeBtnText: cc.Label,

        //保险柜
        bankGoldNumText: cc.Label,
        bankSafeGoldText: cc.Label,
        bankGoldEdit: cc.EditBox,
        bankPwdEdit: cc.EditBox,

        //修改登陆密码
        loginPwdOldEdit: cc.EditBox,
        loginPwdNewEdit: cc.EditBox,
        loginPwdNewConfirmEdit: cc.EditBox,

        //修改提款密码
        tikuanPwdOldEdit: cc.EditBox,
        tikuanPwdNewEdit: cc.EditBox,
        tikuanPwdNewConfirmEdit: cc.EditBox
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    resetInfo () {
        this.nicknameEdit.string = '';
        this.nicknameEdit.placeholder = '昵称：' + Global.Player.getPy('nickname');
        this.accountText.string = '账号：' + Global.Player.getPy('account');
        this.IDText.string = '用户ID：' + Global.Player.getPy('uid');
        this.goldText.string = '金币：' + Global.Player.getPy('gold');
        this.phoneText.string = '手机号码：' + Global.Player.getPy('account');

        this.changePhoneEdit.string = '';
        this.changePhoneImgCodeEdit.string = '';
        this.changePhonePhoneCodeEdit.string = '';

        this.bankGoldNumText.string = '金币：' + Global.Player.getPy('gold');
        this.bankSafeGoldText.string = '保险柜金币：' + Global.Player.getPy('safeGold');
        this.bankGoldEdit.string = '';
        this.bankPwdEdit.string = '';

        this.loginPwdOldEdit.string = '';
        this.loginPwdNewEdit.string = '';
        this.loginPwdNewConfirmEdit.string = '';

        this.tikuanPwdOldEdit.string = '';
        this.tikuanPwdNewEdit.string = '';
        this.tikuanPwdNewConfirmEdit.string = '';
    },

    updateChangePhoneImgCode () {
        this.changePhoneImgCodeUniqueID = Global.Tools.updateImgCode(this.changePhoneImgCode);
    },

    start () {
        this.showGroup('userInfo');
        this.createLoginRecord();
        this.createGameRecord();
        this.resetInfo();
    },

    createLoginRecord () {
        let pageTurn = cc.instantiate(Global.PageTurnItem);
        pageTurn.parent = this.loginRecordGroup;
        pageTurn.getComponent('PageTurnGroup').setData({
            callback: function (param) {

            }.bind(this),
            count: 0,
            maxCount: Global.Constant.ListMaxItem,
            scriptName: 'LoginRecordItem',
            group: this.loginRecordGroup,
            cellItem: this.loginRecordItem,
            getDataAPI: function (startIndex, count, cb) {
                Global.API.hall.getRecordDataRequest(Global.Enum.recordType.LOGIN, startIndex, count, function (msg) {
                    if (!!cb) {
                        cb(msg.msg.recordArr, msg.msg.totalCount);
                    }
                })
            }
        });
    },

    createGameRecord () {
        this.gameRecordContent.destroyAllChildren();
        let pageTurn = cc.instantiate(Global.PageTurnItem);
        pageTurn.parent = this.gameRecordContent;
        pageTurn.getComponent('PageTurnGroup').setData({
            callback: function (param) {

            }.bind(this),
            count: 0,
            maxCount: Global.Constant.ListMaxItem,
            scriptName: 'GameRecordItem',
            group: this.gameRecordContent,
            cellItem: this.gameRecordItem,
            getDataAPI: function (startIndex, count, cb) {
                Global.API.hall.getRecordDataRequest(Global.Enum.recordType.GAME, startIndex, count, function (msg) {
                    if (!!cb) {
                        cb(msg.msg.recordArr, msg.msg.totalCount);
                    }
                })
            }
        });
    },

    showGroup (groupName) {
        this.userInfoGroup.active = groupName === 'userInfo';
        this.changePhoneGroup.active = groupName === 'changePhone';
        this.bankGroup.active = groupName === 'bank';
        this.gameRecordGroup.active = groupName === 'gameRecord';
        this.loginRecordGroup.active = groupName === 'loginRecord';
        this.changeLoginPasswordGroup.active = groupName === 'changeLoginPassword';
        this.changeTikuanPasswordGroup.active = groupName === 'changeTikuanPassword';
        this.rewardGroup.active = groupName === 'reward';

        if (groupName === 'changePhone') {
            this.updateChangePhoneImgCode();
        }
    },

    onDestroy () {
        if (!!this.phoneCodeTick) {
            clearInterval(this.phoneCodeTick);
        }
    },

    onBtnClk (event, param) {
        cc.log(param);
        switch (param) {
            case 'userInfo':
            case 'changePhone':
            case 'bank':
            case 'gameRecord':
            case 'loginRecord':
            case 'changeLoginPassword':
            case 'changeTikuanPassword':
            case 'reward':
                this.showGroup(param);
                break;
            case 'gameRecord_refresh':
                this.createGameRecord();
                break;




            case 'changeUserInfo_confirm':
                let nickname = this.nicknameEdit.string;
                if (nickname === '' || nickname === Global.Player.getPy('nickname')) {
                    Global.DialogManager.addTipDialog('请输入新的昵称！');
                    return;
                }

                Global.API.hall.changeNicknameRequest(nickname, function () {
                    Global.DialogManager.addTipDialog('修改成功！');
                }.bind(this));
                break;





            case 'bank_in':
            case 'bank_out':
                let num = parseFloat(this.bankGoldEdit.string);
                if (this.bankGoldEdit.string === '' || num <= 0) {
                    Global.DialogManager.addTipDialog('请输入0以上的金额数量！');
                    return;
                }

                if (param === 'bank_out') {
                    if (this.bankPwdEdit.string !== (Global.Player.getPy('safePassword'))) {
                        Global.DialogManager.addTipDialog('提取密码不正确，请重新输入！');
                        return;
                    }

                    if (num > Global.Player.getPy('safeGold')) {
                        Global.DialogManager.addTipDialog('您的保险柜金额不足，无法取出！');
                        return;
                    }
                } else {
                    if (num > Global.Player.getPy('gold')) {
                        Global.DialogManager.addTipDialog('您的金额不足，无法存入！');
                        return;
                    }
                }

                num *= param === 'bank_in'?1:-1;
                Global.API.hall.safeBoxOperationRequest(num, this.bankPwdEdit.string, function () {
                    let tipText = param === 'bank_in'?'存入成功！':'取出成功！';
                    Global.DialogManager.addTipDialog(tipText);
                });
                break;





            case 'loginPwd_confirm':
                let oldPwd = this.loginPwdOldEdit.string;
                let newPwd = this.loginPwdNewEdit.string;
                let newPwdC = this.loginPwdNewConfirmEdit.string;

                if (oldPwd === '') {
                    Global.DialogManager.addTipDialog('请输入旧密码！');
                    return;
                }

                if (newPwd === '') {
                    Global.DialogManager.addTipDialog('请输入新密码！');
                    return;
                }

                if (newPwd !== newPwdC) {
                    Global.DialogManager.addTipDialog('两次输入的新密码不一致！');
                    return;
                }

                if (newPwd === oldPwd) {
                    Global.DialogManager.addTipDialog('新密码不能和旧密码相同！');
                    return;
                }

                Global.API.hall.updateLoginPasswordRequest(oldPwd, newPwd, function () {
                    Global.DialogManager.addTipDialog('修改成功！');
                    this.resetInfo();
                }.bind(this));
                break;




            case 'changeImgCode':
                this.updateChangePhoneImgCode();
                break;
            case 'changePhoneConfirm':
                let newPhone = this.changePhoneEdit.string;
                if (newPhone.length !== 11) {
                    Global.DialogManager.addTipDialog('请输入正确的11位手机号！');
                    return;
                }

                let imgCode = this.changePhoneImgCodeEdit.string;
                let phoneCode = this.changePhonePhoneCodeEdit.string;
                if (imgCode === '') {
                    Global.DialogManager.addTipDialog('请输入图片验证码！');
                    return;
                }

                if (phoneCode === '') {
                    Global.DialogManager.addTipDialog('请输入手机验证码！');
                    return;
                }

                let imgCodeInfo = {
                    uniqueID: this.changePhoneImgCodeUniqueID,
                    code: imgCode
                };

                Global.API.hall.bindPhoneRequest(newPhone, phoneCode, imgCodeInfo, function (msg) {
                    if (msg.code !== Global.Code.OK) {
                        this.updateChangePhoneImgCode();
                        return;
                    }
                    Global.DialogManager.addTipDialog('绑定新手机成功！');
                    this.showGroup('userInfo');
                }.bind(this));
                break;
            case 'changePhoneBack':
                this.onBtnClk(null, 'userInfo');
                break;
            case 'changePhone_getPhoneCode':
                if (this.changePhoneEdit.string.length !== 11) {
                    Global.DialogManager.addTipDialog('请输入正确的11位手机号！');
                    return;
                }

                if (this.changePhoneEdit.string === Global.Player.getBindPhone()) {
                    Global.DialogManager.addTipDialog('您当前已绑定此手机号！');
                    return;
                }

                Global.Tools.getPhoneCode(this.changePhoneEdit.string);

                this.changePhoneGetPhoneCodeBtn.interactable = false;
                this.changePhoneGetPhoneCodeBtnText.string = '60s';
                this.changePhoneGetPhoneCodeBtnText.node.color = cc.Color.WHITE;
                let time = 60;
                this.phoneCodeTick = setInterval(function () {
                    time -= 1;
                    this.changePhoneGetPhoneCodeBtnText.string = time + 's';
                    if (time < 0) {
                        clearInterval(this.phoneCodeTick);
                        this.phoneCodeTick = null;
                        this.changePhoneGetPhoneCodeBtn.interactable = true;
                        this.changePhoneGetPhoneCodeBtnText.string = '获取验证码';
                        this.changePhoneGetPhoneCodeBtnText.node.color = cc.Color.BLACK;
                    }
                }.bind(this), 1000);
                break;





            case 'changeTikuanPwd_confirm':
                let oldSafePwd = this.tikuanPwdOldEdit.string;
                let newSafePwd = this.tikuanPwdNewEdit.string;
                let newSafePwdC = this.tikuanPwdNewConfirmEdit.string;
                if (oldSafePwd === '') {
                    Global.DialogManager.addTipDialog('请输入旧密码！');
                    return;
                }

                if (newSafePwd === '') {
                    Global.DialogManager.addTipDialog('请输入新密码！');
                    return;
                }

                if (newSafePwd !== newSafePwdC) {
                    Global.DialogManager.addTipDialog('两次输入的新密码不一致！');
                    return;
                }

                if (newSafePwd === oldSafePwd) {
                    Global.DialogManager.addTipDialog('新密码不能和旧密码相同！');
                    return;
                }

                if (oldSafePwd !== Global.Player.getPy('safePassword')) {
                    Global.DialogManager.addTipDialog('您输入的旧密码不正确，请重新输入！');
                    return;
                }

                Global.API.hall.updateSafePasswordRequest(oldSafePwd, newSafePwd, function () {
                    Global.DialogManager.addTipDialog('修改成功！');
                });
                break;
        }
    }

    // update (dt) {},
});
