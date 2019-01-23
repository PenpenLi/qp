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
        matchContent: cc.Node,
        matchItem: cc.Prefab,
        tip: cc.Node,

        matchListGroup: cc.Node,
        ruleGroup: cc.Node,
        recordGroup: cc.Node,

        matchRuleItem: cc.Prefab
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    showGroup (groupName) {
        this.matchListGroup.active = groupName === 'match';
        this.ruleGroup.active = groupName === 'rule';
        this.recordGroup.active = groupName === 'record';
    },

    createList () {
        for (let i = 0; i < 10; i ++) {
            let item = cc.instantiate(this.matchItem);
            item.parent = this.matchContent;
            item.getComponent('MatchItem').updateUI();
            this.tip.active = false;
        }
    },

    createRule () {
        let rule = [
            {title: '参赛条件：', des: 'laskjdfljasdlfjalsjdflajsdlfjasldjfasdf'},
            {title: '积分获取：', des: 'laskjdfljasdlfjalsjdflajsdlfjasldjfasdf'},
            {title: '奖励发放：', des: 'laskjdfljasdlfjalsjdflajsdlfjasldjfasdf'},
            {title: '警告：', des: 'laskjdfljasdlfjalsjdflajsdlfjasldjfasdf'},
        ];

        for (let i = 0; i < rule.length; i ++) {
            let item = cc.instantiate(this.matchRuleItem);
            item.parent = this.ruleGroup;
            item.getComponent('MatchRuleItem').updateUI(rule[i]);
        }
    },

    start () {
        this.createList();
        this.createRule();
        this.showGroup('match');
    },

    onBtnClk (event, param) {
        cc.log(param);
        switch (param) {
            case 'match':
            case 'rule':
            case 'record':
                this.showGroup(param);
                break;
        }
    }

    // update (dt) {},
});
