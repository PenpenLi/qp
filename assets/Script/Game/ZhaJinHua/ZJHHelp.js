var DialogManager = require('../../Shared/DialogManager');
var AudioManager = require('../../Shared/AudioManager');

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        ruleText: cc.Label
    },

    // use this for initialization
    onLoad: function () {
        this.ruleText.string = '' +
            '牌型：\n' +
            '豹子：三张点相同的牌。例：AAA、222。\n' +
            '同花顺：花色相同的顺子。例：黑桃456、红桃789。最大的同花顺为花色相同的QKA，最小的同花顺为花色相同的123。\n' +
            '同花：花色相同，非顺子。例：黑桃368，方块145。\n' +
            '顺子：花色不同的顺子。例：黑桃5红桃6方块7。最大的顺子为花色不同的QKA，最小的顺子为花色不同的123。\n' +
            '对子：两张点数相同的牌。例：223，334。\n' +
            '高牌：三张牌不组成任何类型的牌。\n' +
            '杂色235：属于特殊高牌的一种，但牌点数由2，3，5组成。\n' +
            '\n' +

            '牌型大小：\n' +
            '杂色235 > 豹子 > 同花顺 > 同花 > 顺子 > 对子 > 高牌 > 杂色235\n' +
            '豹子、同花、对子、高牌的比较，按照顺序比点的规则比较大小。 牌点从大到小为：A、K、Q、J、10、9、8、7、6、5、4、3、2，各花色不分大小。\n' +
            '同花顺、顺子按照顺序比点。AKQ> KQJ>…>32A。\n' +
            '同种牌型，对子时比对子的大小，其它牌型比最大的牌张，如最大牌张相同则比第二大的张，以此类推。当两牌型大小完全相同时，主动比牌者负。\n' +
            '杂色235只比豹子大，比其它的牌型小。\n' +
            '如果两人的牌型和点数大小一样，则先开牌的人输。比如的两个人都是同花123，则先开牌的人输。\n' +
            '\n' +

            '特殊规则：\n' +
            '只能和已看牌的人比牌。\n' +
            '看牌后要下注数x2。\n' +
            '比牌时下注数x2。';
    },

    onBtnClk: function (event, param) {
        AudioManager.playCommonSoundClickButton();

        switch (param) {
            case 'back':
                DialogManager.destroyDialog('ZhaJinHua/UIPrefabs/ZJHHelp');
                break;
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
