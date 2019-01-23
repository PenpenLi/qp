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
        tikuanGroup: cc.Node,
        recordGroup: cc.Node,

        bankCardInfoGroup: cc.Node,
        bankCardInfoSettingGroup: cc.Node,

        recordContent: cc.Node,
        recordItem: cc.Prefab,

        userGoldText: cc.Label,
        tikuanNumEdit: cc.EditBox,
        needGoldText: cc.Label,
        bankCardText: cc.Label,

        userNameEdit: cc.EditBox,
        bankNameEdit: cc.EditBox,
        bankCardNumEdit: cc.EditBox,
        userNameEditBtn: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    createTikuanRecordList: function () {
        this.recordContent.destroyAllChildren();
        let pageTurn = cc.instantiate(Global.PageTurnItem);
        pageTurn.parent = this.recordContent;
        pageTurn.getComponent('PageTurnGroup').setData({
            callback: function (param) {

            }.bind(this),
            count: 0,
            maxCount: Global.Constant.ListMaxItem,
            scriptName: 'TikuanRecordItem',
            group: this.recordContent,
            cellItem: this.recordItem,
            getDataAPI: function (startIndex, count, cb) {
                Global.API.hall.getRecordDataRequest(Global.Enum.recordType.WITHDRAWALS, startIndex, count, function (msg) {
                    if (!!cb) {
                        cb(msg.msg.recordArr, msg.msg.totalCount);
                    }
                })
            }
        });
    },

    inputChange (event) {
        this.needGoldText.string = this.tikuanNumEdit.string;
        if (this.tikuanNumEdit.string === '') {
            this.needGoldText.string = 0;
        }
    },

    updateInfo () {
        this.userGoldText.string = '用户金币：{0}（1元={1}金币）'.format(Global.Player.getPy('gold'), Global.Data.getData('oneRMBToGold'));
        this.tikuanNumEdit.string = '';
        this.needGoldText.string = 0;

        if (Global.Player.isBindBankCard()) {
            let bankCardInfo = Global.Player.getPy('bankCardInfo');
            this.bankCardText.string = bankCardInfo.cardNumber;

            this.userNameEdit.string = bankCardInfo.ownerName;
            this.bankNameEdit.string = bankCardInfo.bankName;
            this.bankCardNumEdit.string = bankCardInfo.cardNumber;
            this.userNameEditBtn.active = true;
        } else {
            this.bankCardText.string = '银行卡未绑定请点击修改按钮绑定';
            this.userNameEditBtn.active = false;
        }
    },

    start () {
        this.bankCardInfoGroup.active = true;
        this.bankCardInfoSettingGroup.active = false;
        this.onBtnClk(null, 'tikuan');
        this.createTikuanRecordList();
    },

    onBtnClk (event, param) {
        cc.log(param);
        switch (param) {
            case 'tikuan':
            case 'record':
                this.tikuanGroup.active = param === 'tikuan';
                this.recordGroup.active = param === 'record';
                break;
            case 'changeCard':
                this.bankCardInfoGroup.active = false;
                this.bankCardInfoSettingGroup.active = true;
                break;
            case 'confirm_change_card':
                let name = this.userNameEdit.string;
                let bankName = this.bankNameEdit.string;
                let bankCardNum = this.bankCardNumEdit.string;
                if (name === '' || bankName === '' || bankCardNum === '') {
                    Global.DialogManager.addTipDialog('请填写完整的银行卡信息！');
                    return;
                }

                Global.API.hall.updateBankCardInfoRequest(bankCardNum, bankName, name, function () {
                    Global.DialogManager.addTipDialog('绑定成功！');
                    this.bankCardInfoGroup.active = true;
                    this.bankCardInfoSettingGroup.active = false;
                }.bind(this));
                break;
            case 'tikuan_confirm':
                if (this.tikuanNumEdit.string === '') {
                    Global.DialogManager.addTipDialog('请输入提款金额！');
                    return;
                }

                let count = parseFloat(this.tikuanNumEdit.string);
                if (count < Global.Data.getData('minWithdrawCash') || (count + Global.Data.getData('minKeepGold') > Global.Player.getPy('gold'))) {
                    Global.DialogManager.addTipDialog('最少保留{0}，最低{1}可提款{2}'.format(Global.Data.getData('minKeepGold'), parseInt(Global.Data.getData('minKeepGold')) + parseInt(Global.Data.getData('minWithdrawCash')), Global.Data.getData('minWithdrawCash')));
                    return;
                }

                if (count > Global.Player.getPy('gold')) {
                    Global.DialogManager.addTipDialog('您所持有的金币不足，请重新输入！');
                    return;
                }

                if (Global.Player.isBindBankCard()) {
                    Global.API.hall.withdrawCashRequest(count, function () {
                        Global.DialogManager.addTipDialog('提交成功！');
                    })
                } else {
                    Global.DialogManager.addTipDialog('请先绑定银行卡！');
                }
                break;
            case 'refresh':
                this.createTikuanRecordList();
                break;
        }
    }

    // update (dt) {},
});
