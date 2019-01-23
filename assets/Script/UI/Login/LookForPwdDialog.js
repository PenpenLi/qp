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

        phoneGroup: cc.Node,
        questionsGroup: cc.Node,

        phoneEdit: cc.EditBox,
        phoneNewPwd: cc.EditBox,
        phoneConfirmNewPwd: cc.EditBox,
        phoneCode: cc.EditBox,
        phoneImgCode: cc.Sprite,
        phoneImgCodeEdit: cc.EditBox,
        phoneGetPhoneCodeBtn: cc.Button,
        phoneGetPhoneCodeBtnText: cc.Label,

        Q1: cc.Label,
        A1: cc.EditBox,
        A1Btn: cc.Node,
        Q2: cc.Label,
        A2: cc.EditBox,
        A2Btn: cc.Node,
        Q3: cc.Label,
        A3: cc.EditBox,
        A3Btn: cc.Node,
        QPhoneEdit: cc.EditBox,
        QPhoneBtn: cc.Node,
        QnewPwdEdit: cc.EditBox,
        QconfirmNewPwdEdit: cc.EditBox,
        QImgCode: cc.Sprite,
        QImgCodeEdit: cc.EditBox
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.QphoneNumberRight = false;
        this.QARight = false;

        this.Q1.node.active = false;
        this.A1.node.active = false;
        this.Q2.node.active = false;
        this.A2.node.active = false;
        this.Q3.node.active = false;
        this.A3.node.active = false;
        this.QnewPwdEdit.node.active = false;
        this.QconfirmNewPwdEdit.node.active = false;
        this.QPhoneBtn.active = false;
        this.QImgCodeEdit.node.active = false;

        let data = this.dialogParameters;
        this.QPhoneEdit.string = data.account;
        this.phoneEdit.string = data.account;

        this.onBtnClk(null, 'phone');
    },

    updateImgCode: function () {
        this.phoneImgCodeEdit.string = '';
        this.uniqueID = Global.Tools.updateImgCode(this.phoneImgCode);
    },

    updateQImgCode: function () {
        this.QImgCodeEdit.string = '';
        this.QuniqueID = Global.Tools.updateImgCode(this.QImgCode);
    },

    checkStep: function () {
        this.updateQImgCode();
        if (this.questionsGroup.active) {
            if (this.QphoneNumberRight) {
                this.QPhoneBtn.active = true;
                this.QImgCodeEdit.node.active = true;

                this.Q1.node.active = true;
                this.A1.node.active = true;
                this.Q2.node.active = true;
                this.A2.node.active = true;
                this.Q3.node.active = true;
                this.A3.node.active = true;

                this.Q1.string = this.questions[0];
                this.Q2.string = this.questions[1];
                this.Q3.string = this.questions[2];
            }

            if (this.QARight) {
                this.A1Btn.active = true;
                this.A2Btn.active = true;
                this.A3Btn.active = true;

                this.QnewPwdEdit.node.active = true;
                this.QconfirmNewPwdEdit.node.active = true;
            }
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
            case 'phone':
            case 'questions':
                this.phoneGroup.active = param === 'phone';
                this.questionsGroup.active = param === 'questions';

                if (param === 'questions') {
                    this.updateQImgCode();
                    if (!this.QphoneNumberRight) {
                        this.onBtnClk(null, 'nextStep');
                    }
                } else {
                    this.updateImgCode();
                }
                break;
            case 'changeImgCode':
                if (this.phoneGroup.active) {
                    this.updateImgCode();
                } else {
                    this.updateQImgCode();
                }
                break;
            case 'getPhoneCode':
                let phoneNumber = this.phoneEdit.string;
                if (phoneNumber.length !== 11) {
                    Global.DialogManager.addTipDialog('请输入正确的11位手机号码！');
                    return;
                }

                Global.Tools.getPhoneCode(phoneNumber);

                this.phoneGetPhoneCodeBtn.interactable = false;
                let time = 60;
                this.phoneGetPhoneCodeBtnText.string = '60s';
                this.phoneGetPhoneCodeBtnText.node.color = cc.Color.WHITE;
                this.phoneCodeTick = setInterval(function () {
                    cc.log(time);
                    time -= 1;
                    this.phoneGetPhoneCodeBtnText.string = time + 's';
                    if (time < 0) {
                        clearInterval(this.phoneCodeTick);
                        this.phoneCodeTick = null;
                        this.phoneGetPhoneCodeBtn.interactable = true;
                        this.phoneGetPhoneCodeBtnText.string = '获取验证码';
                        this.phoneGetPhoneCodeBtnText.node.color = cc.Color.BLACK;
                    }
                }.bind(this), 1000);
                break;
            case 'lookForPwd':
                if (this.phoneGroup.active) {
                    let account = this.phoneEdit.string;
                    let newPwd = this.phoneNewPwd.string;
                    let newPwdC = this.phoneConfirmNewPwd.string;
                    let imgCode = this.phoneImgCodeEdit.string;
                    let phoneCode = this.phoneCode.string;
                    if (account === '') {
                        Global.DialogManager.addTipDialog('请输入账号！');
                        return;
                    }

                    if (newPwd === '' || newPwdC === '') {
                        Global.DialogManager.addTipDialog('请输入新密码！');
                        return;
                    }

                    if (newPwd !== newPwdC) {
                        Global.DialogManager.addTipDialog('两次输入的密码不一致！');
                        return;
                    }

                    if (imgCode === '') {
                        Global.DialogManager.addTipDialog('请输入图片验证码！');
                        return;
                    }

                    if (phoneCode === '') {
                        Global.DialogManager.addTipDialog('请输入手机验证码！');
                        return;
                    }

                    let imgCodeInfo = {
                        uniqueID: this.uniqueID,
                        code: imgCode
                    };

                    Global.API.account.resetPasswordByPhoneRequest(account, newPwd, phoneCode, imgCodeInfo, function (msg) {
                        if (msg.code !== Global.Code.OK) {
                            this.updateImgCode();
                            return;
                        }

                        Global.DialogManager.addTipDialog('您的密码重置成功！');
                        Global.DialogManager.destroyDialog(this);
                    }.bind(this));
                } else {

                }
                break;
            case 'login':
                Global.DialogManager.destroyDialog(this);
                break;
            case 'nextStep':
                //手机号获取问题
                if (!this.QphoneNumberRight) {
                    let phoneNumber = this.QPhoneEdit.string;
                    if (phoneNumber === '') {
                        Global.DialogManager.addTipDialog('请输入手机号！');
                        return;
                    }

                    Global.API.account.getSecurityQuestionRequest(this.QPhoneEdit.string, function (msg) {
                        if (!!msg.msg.questionArr && msg.msg.questionArr.length > 0) {
                            this.QphoneNumberRight = true;
                            this.questions = msg.msg.questionArr;
                            this.checkStep();
                        } else {
                            Global.DialogManager.addTipDialog('您没有设置密保问题！');
                        }
                    }.bind(this));
                    return;
                }

                //回答问题
                if (!this.QARight) {
                    let A1 = this.A1.string;
                    let A2 = this.A2.string;
                    let A3 = this.A3.string;

                    if (A1 === '' || A2 === '' || A3 === '') {
                        Global.DialogManager.addTipDialog('请回答问题！');
                        return;
                    }

                    if (this.QImgCodeEdit.string === '') {
                        Global.DialogManager.addTipDialog('请输入图片验证码！');
                        return;
                    }

                    let imgCodeInfo = {
                        uniqueID: this.QuniqueID,
                        code: this.QImgCodeEdit.string
                    };

                    let securityQuestions = [
                        {
                            question: this.questions[0],
                            answer: A1
                        },

                        {
                            question: this.questions[1],
                            answer: A2
                        },

                        {
                            question: this.questions[2],
                            answer: A3
                        }
                    ];

                    Global.API.account.validateSecurityQuestionRequest(this.QPhoneEdit.string, securityQuestions, imgCodeInfo, function (msg) {
                        if (msg.code !== Global.Code.OK) {
                            this.updateQImgCode();
                            return;
                        }

                        this.QARight = true;
                        this.checkStep();
                    }.bind(this));
                    return;
                }

                //重置密码
                let newPwd = this.QnewPwdEdit.string;
                let newPwdC = this.QconfirmNewPwdEdit.string;
                if (newPwd === '') {
                    Global.DialogManager.addTipDialog('请输入新密码！');
                    return;
                }

                if (newPwd !== newPwdC) {
                    if (newPwd !== newPwdC) {
                        Global.DialogManager.addTipDialog('两次输入的密码不一致！');
                        return;
                    }
                }

                let imgCodeInfo = {
                    uniqueID: this.QuniqueID,
                    code: this.QImgCodeEdit.string
                };

                let A1 = this.A1.string;
                let A2 = this.A2.string;
                let A3 = this.A3.string;

                let securityQuestions = [
                    {
                        question: this.questions[0],
                        answer: A1
                    },

                    {
                        question: this.questions[1],
                        answer: A2
                    },

                    {
                        question: this.questions[2],
                        answer: A3
                    }
                ];

                Global.API.account.resetPasswordBySecurityQuestionRequest(this.QPhoneEdit.string, newPwd, securityQuestions, imgCodeInfo, function (msg) {
                    if (msg.code === Global.Code.IMG_CODE_ERROR) {
                        this.updateQImgCode();
                        return;
                    }

                    Global.DialogManager.addTipDialog('密码重置成功！');
                    Global.DialogManager.destroyDialog(this);
                }.bind(this));
                break;
        }
    }

    // update (dt) {},
});
