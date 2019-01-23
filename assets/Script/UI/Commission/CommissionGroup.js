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

        weekTotalAchievementText: cc.Label,

        directlyMemberAchievementText: cc.Label,
        agentMemberAchievementText: cc.Label,
        thisWeekLowerAgentCommisionText: cc.Label,
        realCommisionText: cc.Label,
        totalCommisionText: cc.Label,
        lowerAgentCommisionText: cc.Label,
        currentLevelTip: cc.Label,

        directlyMemberCountText: cc.Label,
        weekAddedDirectlyMemberCountText: cc.Label,
        monthAddedDirectlyMemberCountText: cc.Label,

        agentMemberCountText: cc.Label,
        weekAddedAgentMemberCountText: cc.Label,
        monthAddedAgentMemberCountText: cc.Label,

        tixianDetailTitle: cc.Label,
        directlyMemberDetailTitle: cc.Label,
        agentMemberDetailTitle: cc.Label,

        allInfoGroup: cc.Node,
        tixianDetailGroup: cc.Node,
        memberDetailGroup: cc.Node,
        agentDetailGroup: cc.Node,

        tixianNoDataTip: cc.Node,
        memberDetailNoDataTip: cc.Node,
        agentDetailNoDataTip: cc.Node,

        tixianDetailContent: cc.Node,
        tixianDetailItem: cc.Prefab,
        memberDetailContent: cc.Node,
        memberDetailItem: cc.Prefab,
        agentDetailContent: cc.Node,
        agentDetailItem: cc.Prefab,

        agentContent: cc.Node,
        agentDetail: cc.Node,
        agentDetail_thisWeekAchievement: cc.Label,
        agentDetail_directlyMemberCount: cc.Label,
        agentDetail_agentMemberCount: cc.Label,
        agentDetail_loginTime: cc.Label,

        directlyContent: cc.Node,
        directlyDetail: cc.Node,
        directlyDetail_thisWeekAchievement: cc.Label,
        directlyDetail_loginTime: cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    updateInfo () {
        let info = Global.Player;

        this.weekTotalAchievementText.string = '本周总业绩' + (info.directlyMemberAchievement + info.agentMemberAchievement).toFixed(2);
        this.directlyMemberAchievementText.string = '直属会员业绩\n' + info.directlyMemberAchievement.toFixed(2);
        this.agentMemberAchievementText.string = '代理会员业绩\n' + info.agentMemberAchievement.toFixed(2);
        //本周我的佣金客户端根据比例计算
        let num = info.directlyMemberAchievement + info.agentMemberAchievement;
        let profit = Global.AgentProfit.getProportionByNum(num);
        this.thisWeekLowerAgentCommisionText.string = '本周我的佣金\n' + (num * profit.proportion).toFixed(2);
        this.currentLevelTip.string = '当前每万元返{0}元\n您产生的业绩量达到{1}即每万元返{2}元'.format(profit.proportion * 10000, profit.min, profit.proportion * 10000);
        if (num < profit.min) {
            this.currentLevelTip.string = '当前每万元返{0}元\n您产生的业绩量达到{1}即每万元返{2}元'.format(0, profit.min, profit.proportion * 10000);
        }
        this.realCommisionText.string = '可提现的佣金\n' + info.realCommision.toFixed(2);
        this.totalCommisionText.string = '总佣金\n' + info.totalCommision.toFixed(2);
        this.lowerAgentCommisionText.string = '下线代理佣金\n' + info.lowerAgentCommision.toFixed(2);

        this.directlyMemberCountText.string = '我的直属会员{0}个'.format(info.directlyMemberCount);
        this.weekAddedDirectlyMemberCountText.string = '本周新增\n' + info.weekAddedDirectlyMemberCount;
        this.monthAddedDirectlyMemberCountText.string = '本月新增\n' + info.monthAddedDirectlyMemberCount;

        this.agentMemberCountText.string = '我的代理{0}个'.format(info.agentMemberCount);
        this.weekAddedAgentMemberCountText.string = '本周新增\n' + info.weekAddedAgentMemberCount;
        this.monthAddedAgentMemberCountText.string = '本月新增\n' + info.monthAddedAgentMemberCount;

        this.tixianDetailTitle.string = '总提现金额：' + (info.totalCommision - info.realCommision).toFixed(2);
        this.directlyMemberDetailTitle.string = '我的直属会员：' + info.directlyMemberCount;
        this.agentMemberDetailTitle.string = '我的代理：' + info.agentMemberCount;
    },

    onLoad () {
        Global.MessageCallback.addListener('DirectlyMemberDetail', this);
        Global.MessageCallback.addListener('AgentMemberDetail', this);
    },

    onDestroy () {
        Global.MessageCallback.removeListener('DirectlyMemberDetail', this);
        Global.MessageCallback.removeListener('AgentMemberDetail', this);
    },

    messageCallbackHandler (route, data) {
        switch (route) {
            case 'DirectlyMemberDetail':
                this.directlyContent.active = false;
                this.directlyDetail.active = true;
                this.directlyDetail_thisWeekAchievement.string = data.achievement.toFixed(2);
                this.directlyDetail_loginTime.string = (new Date(data.lastLoginTime)).format('yyyy-MM-dd hh:mm:ss');
                break;
            case 'AgentMemberDetail':
                this.agentContent.active = false;
                this.agentDetail.active = true;
                this.agentDetail_thisWeekAchievement.string = (data.directlyMemberAchievement + data.agentMemberAchievement).toFixed(2);
                this.agentDetail_directlyMemberCount.string = data.directlyMemberCount;
                this.agentDetail_agentMemberCount.string = data.agentMemberCount;
                this.agentDetail_loginTime.string = (new Date(data.lastLoginTime)).format('yyyy-MM-dd hh:mm:ss');
                break;
        }
    },

    start () {
        this.directlyDetail.active = false;
        this.agentDetail.active = false;
        this.onBtnClk(null, 'all');
    },

    onBtnClk (event, param) {
        cc.log(param);
        switch (param) {
            case 'tixian':
                let info = Global.Player;
                if (info.realCommision <= 0) {
                    Global.DialogManager.addTipDialog('可提现佣金不足！');
                    return;
                }

                Global.API.hall.extractionCommissionRequest(function (msg) {
                    Global.DialogManager.addTipDialog('提取成功！');
                });
                break;
            case 'tixianDetail':
            case 'memberDetail':
            case 'agentDetail':
            case 'all':
                this.tixianDetailGroup.active = param === 'tixianDetail';
                this.memberDetailGroup.active = param === 'memberDetail';
                this.agentDetailGroup.active = param === 'agentDetail';

                if (param !== 'all') {
                    this.allInfoGroup.active = false;
                    this.createList(param);
                } else {
                    if (this.directlyDetail.active) {
                        this.directlyContent.active = true;
                        this.directlyDetail.active = false;
                        this.memberDetailGroup.active = true;
                        return;
                    }

                    if (this.agentDetail.active) {
                        this.agentContent.active = true;
                        this.agentDetail.active = false;
                        this.agentDetailGroup.active = true;
                        return;
                    }

                    this.allInfoGroup.active = param === 'all';
                }
                break;
        }
    },

    createList (groupName) {
        switch (groupName) {
            case 'tixianDetail':
            case 'memberDetail':
            case 'agentDetail':
                this.tixianDetailContent.destroyAllChildren();
                this.memberDetailContent.destroyAllChildren();
                this.agentDetailContent.destroyAllChildren();

                let prefab = groupName === 'tixianDetail'?this.tixianDetailItem:(groupName === 'memberDetail'?this.memberDetailItem:this.agentDetailItem);
                let content = groupName === 'tixianDetail'?this.tixianDetailContent:(groupName === 'memberDetail'?this.memberDetailContent:this.agentDetailContent);
                let scriptName = groupName === 'tixianDetail'?'TixianDetailItem':(groupName === 'memberDetail'?'MemberDetailItem':'MemberDetailItem');
                let getDataAPI = null;
                if (groupName === 'tixianDetail') {
                    getDataAPI = function (startIndex, count, cb) {
                        Global.API.hall.getRecordDataRequest(Global.Enum.recordType.EXTRACT_COMMISSION, startIndex, count, function (msg) {
                            if (!!cb) {
                                cb(msg.msg.recordArr, msg.msg.totalCount);
                                if (msg.msg.totalCount > 0) {
                                    this.tixianNoDataTip.active = false;
                                }
                            }
                        }.bind(this));
                    }.bind(this);
                } else if (groupName === 'memberDetail') {
                    getDataAPI = function (startIndex, count, cb) {
                        Global.API.hall.getDirectlyMemberRecordDataRequest(startIndex, count, function (msg) {
                            if (!!cb) {
                                cb(msg.msg.recordArr, msg.msg.totalCount);
                                if (msg.msg.totalCount > 0) {
                                    this.memberDetailNoDataTip.active = false;
                                }
                            }
                        }.bind(this));
                    }.bind(this);
                } else if (groupName === 'agentDetail') {
                    getDataAPI = function (startIndex, count, cb) {
                        Global.API.hall.getAgentMemberRecordDataRequest(startIndex, count, function (msg) {
                            if (!!cb) {
                                cb(msg.msg.recordArr, msg.msg.totalCount);
                                if (msg.msg.totalCount > 0) {
                                    this.agentDetailNoDataTip.active = false;
                                }
                            }
                        }.bind(this));
                    }.bind(this);
                }

                let pageTurn = cc.instantiate(Global.PageTurnItem);
                pageTurn.parent = content;
                pageTurn.getComponent('PageTurnGroup').setData({
                    callback: function (param) {

                    }.bind(this),
                    count: 0,
                    maxCount: Global.Constant.ListMaxItem,
                    scriptName: scriptName,
                    group: content,
                    cellItem: prefab,
                    getDataAPI: getDataAPI
                });

                break;
        }
    }

    // update (dt) {},
});
