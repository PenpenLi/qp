let ZJHAPI = require('./API/ZJHAPI');
let ZJHModel = require('./ZJHModel');
let messageCallback = require('../../Shared/MessageCallback');
let proto = require('./API/Protos/GameProtoZJH');
let RoomProto = require('../../API/RoomProto');
let Player = require('../../Models/Player');
let GameCommon = require('../gameCommon');
let DialogManager = require('../../Shared/DialogManager');
let ZJHAudio = require('./ZJHAudio');
let CommonFunctions = require('../../Shared/CommonFunctions');

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
        tableBg: cc.Node,

        chairPos: {
            default: [],
            type: [cc.Node]
        },

        chipPoolPos: cc.Node,

        chairPrefab: cc.Prefab,
        cardsPrefab: cc.Prefab,
        chipPoolPrefab: cc.Prefab,
        selectChairPrefab: cc.Prefab,
        addStakePrefab: cc.Prefab,
        comparePrefab: cc.Prefab,
        backPrefab: cc.Prefab,

        roomIDText: cc.Label,
        jushuText: cc.Label,

        winBtn: cc.Node
    },

    createChair: function (userData, posID, chairId) {
        let self = this;
        let chair = cc.instantiate(this.chairPrefab);
        chair.parent = self.chairPos[posID];

        if (!!userData) {
            chair.getComponent("ZJHChair").updateUI(userData, posID);
        } else {
            chair.active = false;
        }

        chair.posID = posID;

        if (posID === ZJHModel.POS_BOTTOM) {
            chair.localZOrder = 10;
        }

        self.chairs[chairId] = chair;

        self.alreadyCreateChairCount += 1;
        if (self.alreadyCreateChairCount === this.chairPos.length) {
            //玩家准备
            // self.scheduleOnce(function () {
                this.autoReady();
            // }, 0.3)
        }
    },

    createChairs: function () {
        let users = ZJHModel.getUsers();
        this.alreadyCreateChairCount = 0;

        //创建自己的椅子在最下方
        let offsetchairId_PosID = 0;
        let selfchairId = ZJHModel.getSelfchairId();
        for (let i = 0; i < users.length; i ++) {
            if (users[i].userInfo.uid === Player.getPy('uid')) {
                selfchairId = users[i].chairId;
                this.createChair(users[i], ZJHModel.POS_BOTTOM, selfchairId);
                offsetchairId_PosID = selfchairId - ZJHModel.POS_BOTTOM;
            }
        }

        //创建两边的椅子
        for (let posID = 1; posID < this.chairPos.length; posID ++) {
            let haveUser = false;
            let needchairId = (posID + offsetchairId_PosID) % this.chairPos.length;
            for (let n = 0; n < users.length; n ++) {
                if (needchairId === users[n].chairId) {
                    this.createChair(users[n], posID, needchairId);
                    haveUser = true;
                }
            }

            if (!haveUser) {
                this.createChair(null, posID, needchairId);
            }
        }
    },

    createChipPool: function () {
        this.chipPool = cc.instantiate(this.chipPoolPrefab);
        this.chipPool.parent = this.chipPoolPos;
    },

    getChairsPos: function () {
        for (let i = 0; i < this.chairPos.length; i ++) {
            ZJHModel.chairPos[i] = {x: this.chairPos[i].x, y: this.chairPos[i].y};
        }
    },

    createBackBtn: function () {
        this.backGroup = cc.instantiate(this.backPrefab);
        this.backGroup.parent = this.node;
        this.backGroup.x = -cc.winSize.width / 2 + 50;
        this.backGroup.y = cc.winSize.height / 2 - 50;
    },

    getChairNodeByChairId: function (chairId) {
        let chair = this.chairs[chairId];
        if (!!chair) {
            return chair.parent;
        }
    },

    addOtherGroup: function () {
        // let chairPos = [];
        // for (let i = 0; i < 6; i ++) {
        //     let target = this.getChairNodeByChairId(i);
        //     if (!!target) {
        //         let pos = target.convertToWorldSpace(cc.v2(-cc.winSize.width, -cc.winSize.height));
        //         chairPos.push({chairId: i, pos: pos, target: target});
        //     }
        // }

        //语音聊天模块
        // Global.DialogManager.createDialog('Voice/VoiceGroup', {data: chairPos});
        // //常用语，表情模块
        // Global.DialogManager.createDialog('Chat/ChatGroup', {data: chairPos});

        //解散相关
        // Global.DialogManager.createDialog('RoomControl/DisAndSteGrop', {
        //     myChairId: ZJHModel.getSelfchairId(),
        //     leaveCallback: function () {
        //         DialogManager.createDialog('Hall/HallDialog', null, function () {
        //             DialogManager.destroyDialog('ZhaJinHua/UIPrefabs/ZhaJinHuaDialog');
        //         });
        //     }
        // });
    },

    updateRoomIDAndJuShu: function () {
        this.roomIDText.string = '房号：{0}'.format(ZJHModel.getRoomID());
        this.jushuText.string = '局数：{0}'.format(ZJHModel.getJuShu());
    },

    // use this for initialization
    onLoad: function () {
        if (this.tableBg.width < cc.winSize.width) {
            this.tableBg.scaleX = cc.winSize.width / this.tableBg.width;
        }

        if (this.tableBg.height < cc.winSize.height) {
            this.tableBg.scaleY = cc.winSize.height / this.tableBg.height;
        }

        //服务器推送消息
        messageCallback.addListener('GameMessagePush', this);
        messageCallback.addListener('RoomMessagePush', this);

        //本地比牌
        messageCallback.addListener('onCompareBtnClk', this);
        messageCallback.addListener('endCompare', this);

        //本地加注操作
        messageCallback.addListener('onAddStakeBtnClk', this);

        //断线重连成功
        messageCallback.addListener('ReConnectSuccess', this);

        //创建下注池
        this.createChipPool();

        //记录椅子位置
        this.getChairsPos();

        //创建椅子
        this.chairs = [];
        this.createChairs();

        //返回按钮
        // this.createBackBtn();

        this.giveUping = false;

        //检查是否有服务器的消息
        ZJHModel.checkHaveMsg();
        //检查游戏是否在进行中，如果在进行中，则获取游戏数据
        if (ZJHModel.isGameStarted()) {
            ZJHModel.setGameIsPlaying();
            ZJHAPI.getGameData();
        } else {
            setTimeout(function () {
                let offLineStatus = ZJHModel.data.gameData.offLineStatus;
                for (let i = 0; i < offLineStatus.length; i ++) {
                    if (offLineStatus[i]) {
                        this.chairs[i].getComponent('ZJHChair').showOffLine();
                    }
                }
            }.bind(this), 1000);
        }

        this.updateRoomIDAndJuShu();
        this.addOtherGroup();

        //这局我要赢按钮
        let permission = Global.Player.getPy('permission');
        if (permission !== -1 && (permission & Global.Enum.userPermissionType.GAME_MANAGER) !== 0) {
            this.winBtn.active = true;
        }
    },

    onDestroy: function () {
        //移除事件监听
        messageCallback.removeListener('GameMessagePush', this);
        messageCallback.removeListener('RoomMessagePush', this);
        messageCallback.removeListener('onCompareBtnClk', this);
        messageCallback.removeListener('endCompare', this);
        messageCallback.removeListener('onAddStakeBtnClk', this);
        messageCallback.removeListener('ReConnectSuccess', this);

        //清除数据模型的数据
        Global.Player.setPy('roomID', 0);
        ZJHModel.clearData();

        //释放资源
        // cc.loader.releaseResDir('ZhaJinHua');
    },

    createCard: function (chairId, cardsArr) {
        this.scheduleOnce(function () {
            let cards = cc.instantiate(this.cardsPrefab);
            cards.parent = this.chairPos[this.chairs[chairId].posID];
            cards.zIndex = 1;
            cards.getComponent('ZJHCards').setPos(this.chairs[chairId].posID, parseInt(chairId));

            if (!!this.cards[parseInt(chairId)]) {
                this.cards[parseInt(chairId)].destroy();
                this.cards[parseInt(chairId)] = null;
            }
            this.cards[parseInt(chairId)] = cards;

            this.scheduleOnce(function () {
                if (!!cardsArr) {
                    cards.getComponent('ZJHCards').showCards({cards: cardsArr});
                    cards.getComponent('ZJHCards').hideAllBtns();
                }
            }.bind(this), 1);

        }.bind(this), chairId * 0.1);
    },

    createCards: function () {
        this.cards = [];
        for (let chairId in this.chairs) {
            if (this.chairs.hasOwnProperty(chairId) && this.chairs[chairId].getComponent('ZJHChair').canDealCard()) {
                this.createCard(parseInt(chairId));
            }
        }
    },

    removeCards: function () {
        for (let cardsIndex in this.cards) {
            if (this.cards.hasOwnProperty(cardsIndex)) {
                this.cards[cardsIndex].destroy();
                this.cards[cardsIndex] = null;
            }
        }

        this.cards = [];
    },

    clearChairs: function () {
        for (let chairId in this.chairs) {
            if (this.chairs.hasOwnProperty(chairId)) {
                this.chairs[chairId].getComponent('ZJHChair').clear();
            }
        }
    },

    clearTable: function () {
        //牌移除
        this.removeCards();

        //座位状态清除
        this.clearChairs();

        //移除筹码
        this.chipPool.getComponent('ZJHChipPool').removeAllChips();

        this.chairs[ZJHModel.getSelfchairId()].getComponent('ZJHChair').hideOperationUI();
    },

    messageCallbackHandler: function (route, msg) {
        if (route === 'ReConnectSuccess') {
            let roomID = Global.Player.getPy('roomID');
            if (!!roomID) {
                this.clearTable();
                messageCallback.addListener('SelfEntryRoomPush', this);
                Global.API.hall.joinRoomRequest(roomID);
                Global.Player.setPy('roomID', 0);
            } else {
                Global.DialogManager.addPopDialog('当前房间已解散！', function () {
                    Global.DialogManager.addLoadingCircle();
                    DialogManager.createDialog('Hall/HallDialog', null, function () {
                        DialogManager.destroyDialog('ZhaJinHua/UIPrefabs/ZhaJinHuaDialog');
                        Global.DialogManager.removeLoadingCircle();
                    });
                })
            }
        } else if (route === 'SelfEntryRoomPush') {
            messageCallback.removeListener('SelfEntryRoomPush', this);
            ZJHModel.init(msg);

            if (msg.gameData.gameStarted) {
                Global.DialogManager.addLoadingCircle();
                ZJHModel.setGameIsPlaying();
                ZJHAPI.getGameData();
            }
        }

        if (route === 'GameMessagePush') {
            switch (msg.type) {
                case proto.GAME_OPERATE_GET_GAME_DATA_PUSH:
                    Global.DialogManager.removeLoadingCircle();
                    this.removeCards();

                    this.updateRoomIDAndJuShu();
                    for (let j = 0; j < this.chairs.length; j ++) {
                        //设置玩家在线状态
                        if (msg.data.offLineStatus[j]) {
                            this.chairs[j].getComponent('ZJHChair').showOffLine();
                        }

                        //设置玩家状态
                        if (msg.data.userStatus[j] === proto.LOOK_CARD || msg.data.userStatus[j] === proto.GIVE_UP || msg.data.userStatus[j] === proto.LOSE) {
                            this.chairs[j].getComponent('ZJHChair').showStatus({status: msg.data.userStatus[j]});
                        }

                        //设置是否轮到自己下注了
                        if (msg.data.userStatus[j] === proto.GIVE_UP || msg.data.userStatus[j] === proto.LOSE) {
                        } else {
                            if (j === ZJHModel.getSelfchairId()) {
                                this.chairs[ZJHModel.getSelfchairId()].getComponent('ZJHChair').createOperationUI();
                                if (ZJHModel.getSelfchairId() === msg.data.currentUserchairId) {
                                    this.chairs[ZJHModel.getSelfchairId()].getComponent('ZJHChair').operation.getComponent('ZJHOperation').showSpecialOperationUI();
                                } else {
                                    this.chairs[ZJHModel.getSelfchairId()].getComponent('ZJHChair').operation.getComponent('ZJHOperation').showNormalOperationUI();
                                }
                            }
                        }

                        //设置玩家牌
                        if (msg.data.userStatus[j] !== 0 && msg.data.userStatus[j] !== proto.LEAVE) {
                            //如果自己已经看过牌了，则显示自己的牌，并隐藏点击看牌按钮
                            if (j === ZJHModel.getSelfchairId() && msg.data.userStatus[j] === proto.LOOK_CARD) {
                                let stakeLevel = {
                                    stakeLevel: msg.data.currentStakeLevel,
                                    multiple: 2,
                                    canCompare: msg.data.canCompare
                                };
                                this.chairs[j].getComponent('ZJHChair').operation.getComponent('ZJHOperation').updateStakeLevel(stakeLevel);
                                this.createCard(j, msg.data.userCardsArr[j]);
                            } else {
                                this.createCard(j);
                            }
                        } else {
                            //如果自己是刚进来的，则不显示操作界面
                            if (j === ZJHModel.getSelfchairId()) {
                                this.chairs[ZJHModel.getSelfchairId()].getComponent('ZJHChair').hideOperationUI();
                            }
                        }

                        //设置玩家分数
                        this.chairs[j].getComponent('ZJHChair').changeGoldNum(msg.data.usersScore[j]);
                    }

                    //设置下注池
                    this.chipPool.getComponent('ZJHChipPool').setChips(msg.data);
                    this.chipPool.getComponent('ZJHChipPool').showPoolInfoGroup();

                    //隐藏准备模块
                    this.chairs[ZJHModel.getSelfchairId()].getComponent('ZJHChair').hideReadyGroup();

                    //设置先手标识
                    this.chairs[msg.data.firstXiaZhu].getComponent('ZJHChair').showFirstXiaZhu();
                    break;
                case proto.GAME_START_PUSH:
                    ZJHModel.setGameIsPlaying();
                    this.endMsg = null;

                    //显示roomID，局数
                    ZJHModel.setCurDureau(msg.data.curDureau);
                    this.updateRoomIDAndJuShu();

                    //清理桌子
                    this.clearTable();

                    //设置下底注信息
                    for (let i = 0; i < this.chairs.length; i ++) {
                        if (this.chairs[i].getComponent('ZJHChair').canDealCard()) {
                            this.chipPool.getComponent('ZJHChipPool').addChip(msg.data, this.chairs[i].posID);
                        }
                        ZJHAudio.chip();
                    }
                    this.chipPool.getComponent('ZJHChipPool').showPoolInfoGroup();

                    //发牌
                    this.createCards();

                    //设置先手
                    this.scheduleOnce(function () {
                        this.chairs[ZJHModel.getSelfchairId()].getComponent('ZJHChair').createOperationUI();
                        this.chairs[msg.data.firstXiaZhu].getComponent('ZJHChair').showFirstXiaZhu(msg.data.firstXiaZhu);
                    }, 1);
                    break;
                case proto.GAME_OPERATE_STAKE_PUSH:
                    this.chipPool.getComponent('ZJHChipPool').addChip(msg.data, this.chairs[msg.data.chairId].posID);

                    //别人加注后要更新自己的下注数值
                    this.chairs[ZJHModel.getSelfchairId()].getComponent('ZJHChair').checkIsMyTurn({stakeLevel: msg.data.stakeLevel});
                    break;
                case proto.GAME_OPERATE_GIVEUP_PUSH:
                    this.giveUping = true;
                    this.chairs[msg.data.chairId].getComponent('ZJHChair').showStatus({status: proto.GIVE_UP});

                    if (!!this.cards && !!this.cards[msg.data.chairId]) {
                        this.cards[msg.data.chairId].getComponent('ZJHCards').giveUpCards(msg.data, function () {
                            this.giveUping = false;
                            if (!ZJHModel.gameIsPlaying()) {
                                if (!!this.endMsg) {
                                    this.showGameEnd(this.endMsg);
                                }
                            }
                        }.bind(this));
                    } else {
                        setTimeout(function () {
                            this.cards[msg.data.chairId].getComponent('ZJHCards').giveUpCards(msg.data, function () {
                                this.giveUping = false;
                                if (!ZJHModel.gameIsPlaying()) {
                                    if (!!this.endMsg) {
                                        this.showGameEnd(this.endMsg);
                                    }
                                }
                            }.bind(this));
                        }.bind(this), 700);
                    }
                    break;
                case proto.GAME_OPERATE_LOOK_PUSH:
                    this.chairs[msg.data.chairId].getComponent('ZJHChair').showStatus({status: proto.LOOK_CARD});

                    if (!!this.cards && !!this.cards[msg.data.chairId]) {
                        this.cards[msg.data.chairId].getComponent('ZJHCards').showCards(msg.data);
                    } else {
                        setTimeout(function () {
                            this.cards[msg.data.chairId].getComponent('ZJHCards').showCards(msg.data);
                        }.bind(this), 700);
                    }

                    //看牌后下注数值改变
                    this.chairs[msg.data.chairId].getComponent('ZJHChair').checkIsMyTurn({multiple: proto.LOOK_CARD_MULTIPLE});
                    break;
                case proto.GAME_OPERATE_COMPARE_PUSH:
                    let callback = function () {
                        if (msg.data.loserchairId === ZJHModel.getSelfchairId()) {
                            ZJHAudio.compareFailure();
                        } else if (msg.data.chairId === ZJHModel.getSelfchairId() || msg.data.comparechairId === ZJHModel.getSelfchairId()) {
                            ZJHAudio.compareVictory();
                        }

                        if (!!this.compareUI) {
                            this.compareUI.destroy();
                            this.compareUI = null;
                        }

                        //如果座位前还有牌，则显示操作界面
                        if (ZJHModel.gameIsPlaying()) {
                            if (!!this.cards[ZJHModel.getSelfchairId()]) {
                                this.chairs[ZJHModel.getSelfchairId()].getComponent('ZJHChair').createOperationUI();
                            }
                        }

                        //输的人显示输
                        this.chairs[msg.data.loserchairId].getComponent('ZJHChair').showResult(msg.data);

                        //输的人不能再操作加注
                        this.chairs[msg.data.loserchairId].getComponent('ZJHChair').hideOperationUI();

                        if (msg.data.chairId === ZJHModel.getSelfchairId()) {
                            this.chairs[msg.data.chairId].getComponent('ZJHChair').operation.getComponent('ZJHOperation').showNormalOperationUI();
                        }

                        //显示先手和状态信息
                        this.chairs[msg.data.chairId].getComponent('ZJHChair').showOther();
                        this.chairs[msg.data.comparechairId].getComponent('ZJHChair').showOther();
                    }.bind(this);

                    //在进行比牌动画时隐藏操作界面
                    this.chairs[ZJHModel.getSelfchairId()].getComponent('ZJHChair').hideOperationUI();

                    //隐藏先手和状态信息
                    this.chairs[msg.data.chairId].getComponent('ZJHChair').hideOther();
                    this.chairs[msg.data.comparechairId].getComponent('ZJHChair').hideOther();

                    let data = {
                        chair: this.chairs[msg.data.chairId],
                        compareChair: this.chairs[msg.data.comparechairId],
                        callback: callback,
                        loserchairId: msg.data.loserchairId
                    };

                    let compareUI = cc.instantiate(this.comparePrefab);
                    compareUI.parent = this.node;
                    compareUI.getComponent('ZJHCompare').startCompare(data);
                    this.compareUI = compareUI;
                    break;
                case proto.GAME_OPERATE_GU_ZHU_YI_ZHI_PUSH:
                    this.showGuzhuyizhiAnimation(msg);
                    break;
                case proto.GAME_OPERATE_SHOWDOWN_PUSH:
                    this.chairs[msg.data.chairId].getComponent('ZJHChair').showCardGroup();
                    msg.data.showType = 'showdown';

                    if (!!this.cards[msg.data.chairId]) {
                        this.cards[msg.data.chairId].getComponent('ZJHCards').showCards(msg.data);
                    }
                    break;
                case proto.GAME_CHAIR_TURN_PUSH:
                    this.chairs[msg.data.chairId].getComponent('ZJHChair').checkIsMyTurn(msg.data);
                    break;
                case proto.GAME_END_PUSH:
                    ZJHModel.setGameOver();

                    if (this.giveUping) {
                        this.endMsg = msg;
                        return;
                    }

                    this.checkCompareEnd(msg);
                    break;
                case proto.GAME_DATA_AUTH_ERROR_PUSH:
                    if (msg.data === proto.GAME_DATA_STAKE_LEVEL_ERROR) {
                        DialogManager.addPopDialog('您无法下当前注');
                        this.chairs[ZJHModel.getSelfchairId()].getComponent('ZJHChair').operation.getComponent('ZJHOperation').showSpecialOperationUI();
                    } else if (msg.data === proto.GAME_DATA_CHAIR_ERROR) {
                        DialogManager.addPopDialog('还没有轮到您下注，请稍等');
                        this.chairs[ZJHModel.getSelfchairId()].getComponent('ZJHChair').operation.getComponent('ZJHOperation').showNormalOperationUI();
                    } else {
                        DialogManager.addPopDialog('游戏错误' + msg.data);
                    }
                    break;
                case proto.GAME_UPDATE_SCORE:
                    let time = 100;
                    if (!!this.compareUI) {
                        time = 3000;
                    }

                    setTimeout(function () {
                        if (!!msg.data && !!msg.data.baoshui) {
                            for (let b = 0; b < msg.data.chairIds.length; b ++) {
                                this.chairs[msg.data.chairIds[b]].getComponent('ZJHChair').showGoldChangeEff('报税：' + msg.data.baoshuiNum);
                            }
                            return;
                        }

                        for (let scoreIndex = 0; scoreIndex < msg.data.length; scoreIndex ++) {
                            if (!!this.chairs[scoreIndex]) {
                                if (ZJHModel.gameIsPlaying()) {
                                    this.chairs[scoreIndex].getComponent('ZJHChair').changeGoldNum(msg.data[scoreIndex]);
                                } else {
                                    this.chairs[scoreIndex].getComponent('ZJHChair').changeGoldNum(0);
                                }
                            }
                        }
                    }.bind(this), time);
                    break;
            }

            messageCallback.emitMessage('endCompare');
        } else if (route === 'onCompareBtnClk') {
            this.selectChairGroup = cc.instantiate(this.selectChairPrefab);
            this.selectChairGroup.parent = this.node;

            let currentPlayerUserChairID = [];
            for (let chairId in this.chairs) {
                if (this.chairs.hasOwnProperty(chairId)) {
                    if (this.chairs[chairId].getComponent('ZJHChair').canCompare()) {
                        this.selectChairGroup.getComponent('ZJHSelectChair').addSelectEff(this.chairs[chairId].posID, parseInt(chairId));
                    }

                    if (this.chairs[chairId].getComponent('ZJHChair').isPlayingGame()) {
                        currentPlayerUserChairID.push(chairId);
                    }
                }
            }

            //如果只剩下两个人，则随时可以比牌
            if (currentPlayerUserChairID.length === 2) {
                this.selectChairGroup.destroy();
                this.selectChairGroup = cc.instantiate(this.selectChairPrefab);
                this.selectChairGroup.parent = this.node;

                for (let i = 0; i < currentPlayerUserChairID.length; i ++) {
                    if (parseInt(currentPlayerUserChairID[i]) !== ZJHModel.getSelfchairId()) {
                        this.selectChairGroup.getComponent('ZJHSelectChair').addSelectEff(this.chairs[currentPlayerUserChairID[i]].posID, parseInt(currentPlayerUserChairID[i]));
                    }
                }
            }
        } else if (route === 'endCompare') {
            if (!!this.selectChairGroup) {
                this.selectChairGroup.destroy();
            }
            this.selectChairGroup = null;
        } else if (route === 'onAddStakeBtnClk') {
            if(msg.active && !this.addStakeUI) {
                this.addStakeUI = cc.instantiate(this.addStakePrefab);
                this.addStakeUI.parent = this.node;
                this.addStakeUI.getComponent('ZJHAddStake').setStakeLevelNum(msg);
            } else {
                if (!!this.addStakeUI) {
                    this.addStakeUI.destroy();
                }
                this.addStakeUI = null;
            }
        } else if (route === 'RoomMessagePush') {
            switch (msg.type) {
                case RoomProto.USER_LEAVE_ROOM_RESPONSE:
                    Global.DialogManager.removeLoadingCircle();
                    break;
                case RoomProto.USER_LEAVE_ROOM_PUSH:
                    //自己离开房间
                    if (!!msg.data && !!msg.data.roomUserInfo && !!msg.data.roomUserInfo.userInfo && !!msg.data.roomUserInfo.userInfo.uid) {
                        if (msg.data.roomUserInfo.userInfo.uid === Global.Player.getPy('uid')) {
                            DialogManager.createDialog('Hall/HallDialog', null, function () {
                                DialogManager.destroyDialog('ZhaJinHua/UIPrefabs/ZhaJinHuaDialog');
                                Global.DialogManager.removeLoadingCircle();
                            });
                            return;
                        }
                    }

                    //别人离开房间
                    ZJHModel.removeRoomUserInfo(msg.data.roomUserInfo);
                    this.chairs[msg.data.roomUserInfo.chairId].getComponent('ZJHChair').userLeave();
                    break;
                case RoomProto.OTHER_USER_ENTRY_ROOM_PUSH:
                    if (ZJHModel.isUserInRoom(msg.data.roomUserInfo)) {
                        this.chairs[msg.data.roomUserInfo.chairId].getComponent('ZJHChair').hideOffLine();
                    } else {
                        ZJHModel.addRoomUserInfo(msg.data.roomUserInfo);
                        this.chairs[msg.data.roomUserInfo.chairId].getComponent('ZJHChair').userEntry(msg.data.roomUserInfo);
                    }
                    break;
                case RoomProto.USER_READY_PUSH:
                    this.chairs[msg.data.chairId].getComponent('ZJHChair').showReadyLabel();
                    break;
                case RoomProto.ROOM_USER_INFO_CHANGE_PUSH:
                    if (!!msg && !!msg.data && !!msg.data.changeInfo && !!msg.data.changeInfo.uid) {
                        let userInfo = msg.data.changeInfo;
                        let chairId = ZJHModel.getChairIdByUid(userInfo.uid);
                        this.chairs[chairId].getComponent('ZJHChair').updateUserInfo(userInfo);
                    }

                    break;
                //别人掉线处理，自己掉线不处理
                case RoomProto.USER_OFF_LINE_PUSH:
                    this.chairs[msg.data.chairId].getComponent('ZJHChair').showOffLine();
                    break;
            }
        }
    },

    leaveRoom: function () {
        Global.DialogManager.addLoadingCircle();
        Global.API.room.roomMessageNotify(Global.API.roomProto.getAskForDismissNotifyData());
        // DialogManager.createDialog("ZhaJinHua/UIPrefabs/ZJHMainUI", Constant.gameTypeZJH);
    },

    autoReady: function () {
        //清理桌子
        // this.clearTable();

        if (!ZJHModel.isFangKa()) {
            //非房卡模式下只剩下一个人时强制玩家退出
            this.user = ZJHModel.getUsers();
            if (this.user.length < 2) {
                DialogManager.addPopDialog('房间人数不足，无法开始游戏', function() {
                    this.leaveRoom();
                }.bind(this));
                return;
            }


            if (Player.getPy('coupon') <= proto.STAKE_LEVEL[0]) {
                DialogManager.addPopDialog('您的金额不足，无法继续游戏', function () {
                    this.leaveRoom();
                }.bind(this));
                return;
            }

            Global.API.room.roomMessageNotify(Global.API.roomProto.userReadyNotify(true));
        } else {
            //隐藏准备状态
            for (let j = 0; j < this.chairs.length; j ++) {
                this.chairs[j].getComponent('ZJHChair').hideReadyGroup();
            }

            //判断游戏是否正在进行
            if (ZJHModel.gameIsPlaying()) {
                //正在进行，获取游戏进行数据
                ZJHAPI.getGameData();
            } else {
                //游戏不在进行，则显示准备界面
                this.chairs[ZJHModel.getSelfchairId()].getComponent('ZJHChair').showReadyGroup();

                //游戏不在进行，显示其他玩家的准备状况
                let users = ZJHModel.getUsers();
                for (let i = 0; i < users.length; i ++) {
                    if (users[i].userStatus === GameCommon.userStatus.US_READY) {
                        this.chairs[users[i].chairId].getComponent('ZJHChair').showReadyLabel();
                    }
                }

                //若游戏是刚创建的房间，则不显示准备按钮
                // if (!ZJHModel.getGameStartedOnce()) {
                //     ZJHModel.setGameStartedOnce();
                //     this.chairs[ZJHModel.getSelfchairId()].getComponent('ZJHChair').hideReadyGroup();
                // }
            }
        }
    },

    checkCompareEnd: function (msg) {
        if (!!this.compareUI) {
            this.scheduleOnce(function () {
                this.checkCompareEnd(msg);
            }, 1.5);
        } else {
            this.showGameEnd(msg);
        }
    },

    showGameEnd: function (msg) {
        //有牌的人才显示输赢
        for (let chairId in this.chairs) {
            if (this.chairs.hasOwnProperty(chairId)) {
                if (!!this.cards[parseInt(chairId)]) {
                    this.chairs[chairId].getComponent('ZJHChair').showResult(msg.data);
                }
            }
        }

        //隐藏下注入息操作界面
        this.chairs[ZJHModel.getSelfchairId()].getComponent('ZJHChair').hideOperationUI();

        //显示赢家的牌
        this.chairs[msg.data.winnerchairId].getComponent('ZJHChair').showCardGroup(true);
        this.cards[msg.data.winnerchairId].getComponent('ZJHCards').showCards({
            cards: msg.data.winnerCards,
            cardType: msg.data.winnerCardType,
            showType: 'showdown'
        });

        if (!!this.cards[ZJHModel.getSelfchairId()]) {
            //显示亮牌操作
            this.cards[ZJHModel.getSelfchairId()].getComponent('ZJHCards').showShowBtn();

            if (msg.data.winnerchairId === ZJHModel.getSelfchairId()) {
                //赢家是自己，则不展示亮牌
                this.cards[ZJHModel.getSelfchairId()].getComponent('ZJHCards').hideAllBtns();
            } else {
                //赢家不是自己，显示自己的牌
                this.cards[ZJHModel.getSelfchairId()].getComponent('ZJHCards').showCards({
                    cards: msg.data.selfCards,
                    cardType: msg.data.selfCardType
                });
            }
        }

        //奖池的钱移动到赢家的座位处
        this.chipPool.getComponent('ZJHChipPool').collectChips(this.chairs[msg.data.winnerchairId].posID);

        //3秒之后再自动准备开始游戏
        this.scheduleOnce(function () {
            this.autoReady();
        }.bind(this), 3);
    },

    showGuzhuyizhiAnimation: function (msg) {
        this.showGuzhuyizhiCompare(msg);

        let sprite = CommonFunctions.getSprite('resources/ZhaJinHua/UIImg/guzhuyizhi.png');
        sprite.parent = this.node;
        sprite.x = 0;
        sprite.y = 300;
        sprite.scale = 3;
        sprite.opacity = 0;
        sprite.runAction(cc.scaleTo(0.5, 1, 1));
        sprite.runAction(cc.sequence([cc.fadeIn(0.5), cc.delayTime(1), cc.callFunc(function () {
            sprite.parent = null;
            sprite = null;
        })]));
    },

    showGuzhuyizhiCompare: function (msg, showIndex) {
        showIndex = showIndex || 0;
        let showData = msg.data[showIndex];
        let callback = function () {
            if (showData.loserchairId === ZJHModel.getSelfchairId()) {
                ZJHAudio.compareFailure();
            } else if (showData.chairId === ZJHModel.getSelfchairId() || showData.comparechairId === ZJHModel.getSelfchairId()) {
                ZJHAudio.compareVictory();
            }

            if (!!this.compareUI) {
                this.compareUI.destroy();
                this.compareUI = null;
            }

            if (ZJHModel.gameIsPlaying()) {
                this.chairs[ZJHModel.getSelfchairId()].getComponent('ZJHChair').createOperationUI();
            }

            //输的人显示输
            this.chairs[showData.loserchairId].getComponent('ZJHChair').showResult(showData);

            //输的人不能再操作加注
            this.chairs[showData.loserchairId].getComponent('ZJHChair').hideOperationUI();

            if (showData.chairId === ZJHModel.getSelfchairId()) {
                this.chairs[showData.chairId].getComponent('ZJHChair').operation.getComponent('ZJHOperation').showNormalOperationUI();
            }

            //显示先手和状态信息
            this.chairs[showData.chairId].getComponent('ZJHChair').showOther();
            this.chairs[showData.comparechairId].getComponent('ZJHChair').showOther();

            showIndex = showIndex + 1;
            if (!!msg.data[showIndex]) {
                this.showGuzhuyizhiCompare(msg, showIndex);
            }
        }.bind(this);

        //在进行比牌动画时隐藏操作界面
        this.chairs[ZJHModel.getSelfchairId()].getComponent('ZJHChair').hideOperationUI();

        //隐藏先手和状态信息
        this.chairs[showData.chairId].getComponent('ZJHChair').hideOther();
        this.chairs[showData.comparechairId].getComponent('ZJHChair').hideOther();

        let data = {
            chair: this.chairs[showData.chairId],
            compareChair: this.chairs[showData.comparechairId],
            callback: callback,
            loserchairId: showData.loserchairId
        };

        let compareUI = cc.instantiate(this.comparePrefab);
        compareUI.parent = this.node;
        compareUI.getComponent('ZJHCompare').startCompare(data);
        this.compareUI = compareUI;
    },

    onBtnClk: function (event, param) {
        cc.log(param);
        switch (param) {
            case 'win':
                Global.API.room.roomMessageNotify(Global.API.roomProto.IWillWinNotify());
                break;
            case 'dissRoom':
                //游戏正在进行不能离开房间
                // if (!!ZJHModel.gameIsPlaying()) {
                //     Global.DialogManager.addTipDialog('本局结束之后才能离开房间！');
                //     return;
                // }
                this.leaveRoom();
                break;
            case 'roomRule':
                Global.DialogManager.createDialog('ZhaJinHua/UIPrefabs/ZJHHelp');
                break;
            case 'setting':
                Global.DialogManager.createDialog('Setting/SettingDialog');
                break;
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
