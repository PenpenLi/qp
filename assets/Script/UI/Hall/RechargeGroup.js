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
        onlineGroup: cc.Node,
        offlineGroup: cc.Node,
        recordGroup: cc.Node,

        offlineTip: cc.Node,
        offlineRechargeNumEdit: cc.EditBox,
        offlineNameEdit: cc.EditBox,
        offlineEditGroup: cc.Node,
        offlineOrderGroup: cc.Node,
        offlineTipGroup: cc.Node,
        offlineRechargeService: cc.Label,

        offlineRechargeNum: cc.RichText,
        offlineRechargeName: cc.Label,
        offlineRechargeBankName: cc.Label,
        offlineRechargeCardNum: cc.Label,
        offlineTip1: cc.RichText,
        offlineTip2: cc.RichText,
        offlineTip3: cc.RichText,
        offlineTip4: cc.RichText,

        recordItem: cc.Prefab,


        userGoldText: cc.Label,
        safeGoldText: cc.Label,
        rechargeNumEdit: cc.EditBox,
        canGetGoldText: cc.Label,

        rechargeAddText: [cc.Label],

        leastRechargeTip: cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    createRechargeRecordList: function () {
        let pageTurn = cc.instantiate(Global.PageTurnItem);
        pageTurn.parent = this.recordGroup;
        pageTurn.getComponent('PageTurnGroup').setData({
            callback: function (param) {

            }.bind(this),
            count: 0,
            maxCount: Global.Constant.ListMaxItem,
            scriptName: 'RechargeRecordItem',
            group: this.recordGroup,
            cellItem: this.recordItem,
            getDataAPI: function (startIndex, count, cb) {
                Global.API.hall.getRecordDataRequest(Global.Enum.recordType.RECHARGE, startIndex, count, function (msg) {
                    if (!!cb) {
                        cb(msg.msg.recordArr, msg.msg.totalCount);
                    }
                })
            }
        });
    },

    rechargeNumEditChange (event) {
        this.canGetGoldText.string = this.rechargeNumEdit.string * Global.Data.getData('oneRMBToGold');
        if (this.rechargeNumEdit.string === '') {
            this.canGetGoldText.string = 0;
        }
    },

    updateInfo () {
        this.userGoldText.string = '用户金币：' + Global.Player.getPy('gold');
        this.safeGoldText.string = '保险柜金币：' + Global.Player.getPy('safeGold');
        this.rechargeNumEdit.string = '';
        this.canGetGoldText.string = '0';
    },

    start () {
        this.rechargeAddNum = [];
        let data = Global.Data.getData('shopItems');
        if (!!data) {
            data = JSON.parse(data);
            for (let i = 0; i < 6; i ++) {
                if (!!data[i]) {
                    this.rechargeAddNum[i] = data[i].priceCount;
                } else {
                    this.rechargeAddText[i].node.parent.active = false;
                }
            }
        }
        this.shopItems = data;

        for (let i = 0; i < this.rechargeAddNum.length; i ++) {
            this.rechargeAddText[i].string = this.rechargeAddNum[i];
        }

        this.onlineRechargeType = 'wx';
        this.offlineRechargeType = 'offline_wx';

        this.offlineTip.active = false;
        this.offlineNameEdit.node.active = false;
        this.offlineEditGroup.active = false;
        this.offlineOrderGroup.active = false;
        this.offlineTipGroup.active = true;
        this.offlineRechargeService.string = Global.Data.getData('rechargeService');

        this.leastRechargeTip.string = "{0}（1元={1}金币）".format(Global.Data.getData('minRechargeCount'), Global.Data.getData('oneRMBToGold'));

        this.onBtnClk(null, 'wx');
        this.createRechargeRecordList();
    },

    onBtnClk (event, param) {
        cc.log(param);
        switch (param) {
            case 'wx':
            case 'ali':
            case 'offline':
            case 'union':
            case 'record':
                this.onlineGroup.active = param === 'wx' || param === 'ali' || param === 'union';
                this.offlineGroup.active = param === 'offline';
                this.recordGroup.active = param === 'record';

                this.offlineOrderGroup.active = false;
                this.offlineEditGroup.active = false;
                this.offlineTipGroup.active = true;

                if (param === 'wx' || param === 'ali' || param === 'union') {
                    this.onlineRechargeType = param;

                    //微信充值超过98的都屏蔽
                    if (param === 'wx') {
                        for (let i = 0; i < this.rechargeAddNum.length; i ++) {
                            if (this.rechargeAddNum[i] > 98) {
                                this.rechargeAddText[i].node.parent.active = false;
                            }
                        }
                    } else {
                        for (let i = 0; i < this.rechargeAddNum.length; i ++) {
                            this.rechargeAddText[i].node.parent.active = true;
                        }
                    }
                }
                break;
            case 'clear':
                this.rechargeNumEdit.string = '';
                this.rechargeNumEditChange(null);
                break;
            case 'add_1':
            case 'add_2':
            case 'add_3':
            case 'add_4':
            case 'add_5':
            case 'add_6':
                let level = param.split('_')[1] - 1;
                // if (this.rechargeNumEdit.string === '') {
                //     this.rechargeNumEdit.string += this.rechargeAddNum[level];
                // } else {
                //     this.rechargeNumEdit.string = parseFloat(this.rechargeNumEdit.string) + this.rechargeAddNum[level];
                // }
                this.rechargeLevel = level;
                this.rechargeNumEdit.string = this.rechargeAddNum[level];
                this.rechargeNumEditChange(null);
                break;
            case 'confirm':
                if (this.rechargeNumEdit.string === '') {
                    Global.DialogManager.addTipDialog('请选择充值金额！');
                    return;
                }

                let count = parseFloat(this.rechargeNumEdit.string);
                if (count < Global.Data.getData('minRechargeCount')) {
                    Global.DialogManager.addTipDialog('单次最少充值{0}元'.format(Global.Data.getData('minRechargeCount')));
                    return;
                }

                if (this.rechargeLevel === 0 || !!this.rechargeLevel) {
                } else {
                    Global.DialogManager.addTipDialog('请选择充值金额!');
                    return;
                }

                let itemID = this.shopItems[this.rechargeLevel].key;
                let rechargeInfo = {};
                rechargeInfo.payType = Global.Enum.PAY_TYPE.WE_CHAT;
                if (this.onlineRechargeType === 'ali') {
                    rechargeInfo.payType = Global.Enum.PAY_TYPE.QQ_PAY;
                }
                if (this.onlineRechargeType === 'union') {
                    rechargeInfo.payType = Global.Enum.PAY_TYPE.UNION_PAY;
                }

                Global.API.hall.purchaseRechargeItemRequest(itemID, Global.Enum.RechargePlatform.JXYL, rechargeInfo, function (msg) {
                    location.href = msg.url;
                });
                break;
            case 'offline_wx':
            case 'offline_ali':
            case 'offline_bank':
                this.offlineRechargeType = param;
                this.offlineTip.active = param === 'offline_bank' || param === 'offline_ali';
                this.offlineNameEdit.node.active = param === 'offline_bank' || param === 'offline_ali';
                this.offlineNameEdit.placeholder = param === 'offline_bank'?'用于转账的银行卡户名':(param === 'offline_ali'?'用于转账的支付宝的姓名':'');
                break;
            case 'confirm_offline':
                let rechargeNum = parseFloat(this.offlineRechargeNumEdit.string);
                if (rechargeNum < Global.Data.getData('minRechargeCount')) {
                    Global.DialogManager.addTipDialog('单次最少充值{0}元'.format(Global.Data.getData('minRechargeCount')));
                    return;
                }

                if (this.offlineRechargeType === 'offline_ali' || this.offlineRechargeType === 'offline_bank') {
                    let nickname = this.offlineNameEdit.string;
                    if (!nickname) {
                        Global.DialogManager.addTipDialog('请输入真实姓名！');
                        return;
                    }
                }

                Global.DialogManager.addPopDialog('请确保您输入的姓名正确，以保证您的充值及时到账！无误请确认，修改请拒绝！', function () {
                    this.offlineEditGroup.active = false;
                    this.offlineOrderGroup.active = true;

                    this.offlineRechargeNum.string = '<color=#000000>￥<color=#AD1B1B>{0}</c>元</c>'.format(rechargeNum.toFixed(2));
                    this.offlineRechargeName.string = Global.Data.getData('offlineRechargeOwnerName');
                    this.offlineRechargeBankName.string = Global.Data.getData('offlineRechargeBankName');
                    this.offlineRechargeCardNum.string = Global.Data.getData('offlineRechargeBankCardNum');

                    let text = [
                        '<outline=1><color=#000000>银行卡转账步骤：<color=#AD1B1B></c></c>',
                        '<color=#000000>1.确保储蓄卡里有足够的充值金额<color=#AD1B1B></c></c>',
                        '<color=#000000>2.不能使用信用卡<color=#AD1B1B></c></c>',
                        '<color=#000000>3.登录网银向上面展示的收款卡和转账金额进行转账<color=#AD1B1B></c></c>',
                    ];
                    if (this.offlineRechargeType === 'offline_ali') {
                        text = [
                            '<outline=1><color=#000000>支付宝转账步骤：<color=#AD1B1B></c></c>',
                            '<color=#000000>1.支付宝首页左上角点击<color=#AD1B1B>《转账》</c></c>',
                            '<color=#000000>2.选择<color=#AD1B1B>《转到银行卡》</c></c>',
                            '<color=#000000>3.填写上面的收款卡信息和转账金额进行转账<color=#AD1B1B></c></c>',
                        ];
                    } else if (this.offlineRechargeType === 'offline_wx') {
                        text = [
                            '<outline=1><color=#000000>微信转账步骤：<color=#AD1B1B></c></c>',
                            '<color=#000000>1.确保微信更到最新版（确保有<color=#047DA3>微信转银行卡</c>功能</c>',
                            '<color=#000000>2.点击微信聊天页面右上角+号，选择<color=#AD1B1B>《收付款》</c>拉到最后一个<color=#AD1B1B>《转账到银行卡》</c></c>',
                            '<color=#000000>3.填写上面的收款卡信息和转账金额进行转账<color=#AD1B1B></c></c>',
                        ];
                    }

                    this.offlineTip1.string = text[0];
                    this.offlineTip2.string = text[1];
                    this.offlineTip3.string = text[2];
                    this.offlineTip4.string = text[3];
                }.bind(this), function () {
                }.bind(this));
                break;
        }
    }

    // update (dt) {},
});
