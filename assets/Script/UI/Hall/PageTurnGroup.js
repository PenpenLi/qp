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
        pageNumText: cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    onBtnClk (event, param) {
        cc.log(param);
        switch (param) {
            case 'left':
                if (this.currentPageNum > 1) {
                    this.currentPageNum --;
                    this.updateCurrentPage();
                }
                break;
            case 'right':
                if (this.currentPageNum < this.pageNum) {
                    this.currentPageNum ++;

                    let startIndex = (this.currentPageNum - 1) * this.data.maxCount;
                    if (!!this.dataArr[startIndex]) {
                        this.updateCurrentPage();
                    } else {
                        this.requestData(startIndex, this.data.maxCount);
                    }
                }
                break;
        }
    },

    setData (data) {
        this.data = data;
        this.currentPageNum = 1;
        this.pageNum = Math.ceil(data.count / data.maxCount);
        this.items = [];
        this.dataArr = [];
        this.requestData(0, this.data.maxCount);
    },

    requestData (startIndex, count) {
        if (!!this.data.getDataAPI) {
            Global.DialogManager.addLoadingCircle();
            this.data.getDataAPI(startIndex, count, function (data, totalCount) {
                for (let i = 0; i < data.length; i ++) {
                    this.dataArr[this.dataArr.length] = data[i];
                }

                this.data.count = totalCount;
                this.pageNum = Math.ceil(totalCount / this.data.maxCount);

                this.updateCurrentPage();

                Global.DialogManager.removeLoadingCircle();
            }.bind(this));
        }
    },

    updateCurrentPage () {
        this.pageNumText.string = this.currentPageNum + '/' + this.pageNum;
        this.node.zIndex = 10;

        let startIndex = (this.currentPageNum - 1) * this.data.maxCount;
        let endIndex = startIndex + this.data.maxCount;
        if (endIndex > this.data.count) {
            endIndex = this.data.count;
        }

        for (let j = 0; j < this.items.length; j ++) {
            if (!!this.items[j]) {
                this.items[j % 10].active = false;
            }
        }

        for (let i = startIndex; i < endIndex; i ++) {
            if (!!this.items[i % 10]) {
                this.items[i % 10].active = true;
                this.items[i % 10].getComponent(this.data.scriptName).updateUI(this.dataArr[i]);
            } else {
                let item = cc.instantiate(this.data.cellItem);
                item.parent = this.data.group;
                item.getComponent(this.data.scriptName).updateUI(this.dataArr[i]);
                this.items[i % 10] = item;
            }
        }

        if (this.data.count <= this.data.maxCount) {
            this.node.active = false;
        }

        if (!!this.data.callback) {
            this.data.callback({
                startIndex: startIndex,
                endIndex: endIndex
            });
        }
    }

    // update (dt) {},
});
