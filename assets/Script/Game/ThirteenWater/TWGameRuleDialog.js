cc.Class({
    extends: cc.Component,

    properties: {
        content: cc.Node,
        ruleItem: cc.Prefab,
        titleImg: cc.Sprite
    },

    createContent: function () {
        var rule = [
            {typ: 'title', text: '人数'},
            {typ: 'des', text: '最多4人'},
            {typ: 'title', text: '牌数'},
            {typ: 'des', text: '一副牌除去大小王52张，每位玩家13张牌'},
            {typ: 'title', text: '流程'},
            {typ: 'des', text: '将52张牌依次发给四位玩家，玩家进入理牌阶段，将十三张牌按照3,5,5的张数组成牌型，放置到头道，中道和尾道上，若玩家获得特殊牌型，可以选择免摆直接比牌，所有玩家理牌完成后进入比牌阶段，所有玩家相互比较牌型计算得分'},
            {typ: 'title', text: '牌型'},
            {typ: 'des', text: '单牌：全部由单张组成\n' +
                                '对子：1对牌加上单张组成\n' +
                                '两对：2对牌加上单张组成\n' +
                                '三条：3张同点数牌加单张组成\n' +
                                '顺子：5张点数连续的牌组成\n' +
                                '同花：5张相同花色的牌组成\n' +
                                '葫芦：3张同点数的牌加一对牌组成\n' +
                                '四条：4张同点数的牌加一张组成\n' +
                                '同花顺：5花色相同数字连续的牌组成\n' +
                                '金刚：头道三张点数相同的牌\n' +
                                '三顺：3道牌都由顺子组成\n' +
                                '三花：3道牌都由同花组成\n' +
                                '6对半：手牌6个对加一张\n' +
                                '一条龙：由A--K十三张连续的牌组成'},
            {typ: 'title', text: '牌型大小'},
            {typ: 'des', text: '同花顺-四条-葫芦-同花-顺子-三条-两对-对子-单牌\n' +
                                '牌型相同时侧由大到小比点数，如单牌双方先比较最大的单牌，相同则比第二张，若所有点数都相同则比花色'},
            {typ: 'title', text: '花色大小'},
            {typ: 'des', text: '黑桃-红桃-梅花-方块'},
            {typ: 'title', text: '点数大小'},
            {typ: 'des', text: 'A-K-Q-J-10-9-8-7-6-5-4-3-2'},
            {typ: 'title', text: '积分算法'},
            {typ: 'des', text: '普通的三道输各计1分\n' +
                                '打穿分数翻倍\n' +
                                '三顺，三花，6对半计3分   一条龙计13分\n' +
                                '额外加分，金刚头加2分，中道葫芦加1分，中道四条加6分，中道同花顺加8分，尾道4条加4分，尾道同花顺加5分，怪牌不算三穿\n' +
                                '选择黑桃A翻倍模式，自动翻倍'}
        ];

        for (var i = 0; i < rule.length; i ++) {
            var item = cc.instantiate(this.ruleItem);
            item.parent = this.content;
            item.getComponent('TWGameRuleItem').updateUI(rule[i]);
        }
    },
    
    createScoreContent: function () {
        Global.Tools.updateSpriteFrame('Hall/labelImg_scoreIntroduction', this.titleImg);
        var rule = [
            {typ: 'title', text: '积分获取途径'},
            {typ: 'des', text: Global.Data.getData('couponObtainWayText')},
            {typ: 'title', text: '积分使用方法'},
            {typ: 'des', text: Global.Data.getData('couponObtainUseWayText')}
        ];

        for (var i = 0; i < rule.length; i ++) {
            var item = cc.instantiate(this.ruleItem);
            item.parent = this.content;
            item.getComponent('GameRuleItem').updateUI(rule[i]);
        }
    },

    // use this for initialization
    onLoad: function () {
        if (!!this.dialogParameters) {
            var typ = this.dialogParameters.typ;
            if (!!typ && typ === 'score') {
                this.createScoreContent();
                return;
            }
        }

        this.createContent();
    },

    onBtnClk: function (event, param) {
        cc.log(param);
        switch (param) {
            case 'close':
                Global.DialogManager.destroyDialog(this);
                break;
        }

    },
});
