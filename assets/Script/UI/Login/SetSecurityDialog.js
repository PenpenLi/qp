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
        Q1Text: cc.Label,
        A1Edit: cc.EditBox,
        Q2Text: cc.Label,
        A2Edit: cc.EditBox,
        Q3Text: cc.Label,
        A3Edit: cc.EditBox,

        selectGroup: cc.Prefab
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.Q1Text.string = Global.Constant.Questions.Q1[0];
        this.Q2Text.string = Global.Constant.Questions.Q2[0];
        this.Q3Text.string = Global.Constant.Questions.Q3[0];
    },

    onBtnClk: function (event, param) {
        cc.log(param);
        switch (param) {
            case 'confirm':
                let A1 = this.A1Edit.string;
                let A2 = this.A2Edit.string;
                let A3 = this.A3Edit.string;

                if (A1 === '' || A2 === '' || A3 === '') {
                    Global.DialogManager.addTipDialog('请输入每个问题的答案！');
                    return;
                }

                let account = this.dialogParameters.account;
                let password = this.dialogParameters.password;
                let questions = [
                    {
                        question: this.Q1Text.string,
                        answer: A1
                    },
                    {
                        question: this.Q2Text.string,
                        answer: A2
                    },
                    {
                        question: this.Q3Text.string,
                        answer: A3
                    },
                ];

                Global.API.account.setSecurityQuestionRequest(account, password, questions, function () {
                    Global.DialogManager.addTipDialog('设置成功，可以登录了！');
                    Global.DialogManager.destroyDialog(this);
                }.bind(this));
                break;
            case 'Q1':
            case 'Q2':
            case 'Q3':
                let targetBtn = null;
                let targetText = null;
                let selectText = [];

                if (param === 'Q1') {
                    targetBtn = this.Q1Text.node.parent;
                    targetText = this.Q1Text;
                    selectText = Global.Constant.Questions.Q1;
                } else if (param === 'Q2') {
                    targetBtn = this.Q2Text.node.parent;
                    targetText = this.Q2Text;
                    selectText = Global.Constant.Questions.Q2;
                } else if (param === 'Q3') {
                    targetBtn = this.Q3Text.node.parent;
                    targetText = this.Q3Text;
                    selectText = Global.Constant.Questions.Q3;
                }

                let btnPos = targetBtn.convertToWorldSpace(0, 0);
                let args = {
                    pos: {x: btnPos.x - targetBtn.width / 2, y: btnPos.y - targetBtn.height / 2},
                    width: targetBtn.width,
                    selectText: selectText,
                    callback: function (index) {
                        if (index !== null) {
                            cc.log(index, selectText[index]);
                            targetText.string = selectText[index];
                        }
                    }.bind(this)
                };

                let selectGroup = cc.instantiate(this.selectGroup);
                selectGroup.parent = this.node;
                selectGroup.getComponent('SelectGroup').updateUI(args);
                break;
        }
    }

    // update (dt) {},
});
