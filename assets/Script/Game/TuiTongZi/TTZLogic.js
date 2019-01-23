var logic = module.exports;
var gameProto = require('./TTZProto');

logic.CARDS_COUNT = 40;					// 所有牌张数
logic.CARDS_BUREAU_COUNT = 8;			// 每局牌张数


/* 获取牌 */
logic.getCards= function() {
	var cards = [];
	var i, ran1, ran2, tmp;
	for(i = 0; i < this.CARDS_COUNT; ++i) { 
		cards[i] = i; 
	}
	for(i = 0; i < 100; ++i) {	/* 洗牌 */
		ran1 = Math.floor(Math.random()*52);
		ran2 = Math.floor(Math.random()*52);
		tmp = cards[ran1];
		cards[ran1] = cards[ran2];
		cards[ran2] = tmp;
	}
	return cards;
};

// 获取第n局的牌
logic.getCardsArrByBureau = function(cards, bureau) {
	var cardsArr = [[], [], [], []];
	var begPos = (bureau-1)*8;
	for(var i = 0; i < 8; ++i) {
		cardsArr[Math.floor(i/2)][i%2] = cards[begPos+i];
	}
	return cardsArr;
};

// 获取牌的点数
logic.getCardNumber = function(cardId) {
	if(cardId%10 === 0) {
		return 0.5;
	} else {
		return cardId%10;
	}
};

// 判断是否是豹子
logic.verifyCardsIsBaozi = function(cardArr) {
	return (cardArr[0]%10 === cardArr[1]%10);
};

// 比较牌的大小	cardArr1>cardArr2-> 返回1
logic.compareCards = function(cardArr1, cardArr2) {
	var isBao1 = this.verifyCardsIsBaozi(cardArr1); 
	var isBao2 = this.verifyCardsIsBaozi(cardArr2);
	var num1 = this.getCardNumber(cardArr1[0]);
	var num2 = this.getCardNumber(cardArr2[0]);
	if(isBao1 && !isBao2) {
		return 1;
	}
	else if(!isBao1 && isBao2) {
		return -1;
	}
	else if(isBao1 && isBao2){
		if(num1 === num2) {
			return 0;
		} 
		else if(num1 === 0.5) {
			return 1;
		}
		else if(num2 === 0.5) {
			return -1;
		} else {
			return (num1-num2 > 0)? 1:-1;
		}
	} else {
		num1 = (num1+this.getCardNumber(cardArr1[1]))%10;
		num2 = (num2+this.getCardNumber(cardArr2[1]))%10;
		if(num1 === num2) {
			return 0;
		} else {
			return (num1-num2 > 0)? 1:-1;
		}
	}
};

// 计算结果
logic.getResout = function(cardsArr, pourPool) {
	var bankerWin = 0;
	var usersWin = {};
	var winArr = [];
	var sortArr = [gameProto.TIANMEN, gameProto.ZHONGMEN, gameProto.DIMEN];
	for(var i = 0; i < 3; ++i) {
		var dir = sortArr[i];
		var flag = this.compareCards(cardsArr[gameProto.ZHUANGJIA], cardsArr[dir]);
		if(flag === 0) {
			flag = -1;
		}
		winArr.push((flag === 1)? true : false);
		for(var j = 0; j < pourPool[dir].length; ++j) {
			bankerWin -= flag*pourPool[dir][j].pourGold;
			if(usersWin[pourPool[dir][j].uid]) {
				usersWin[pourPool[dir][j].uid] += flag*pourPool[dir][j].pourGold;
			} else {
				usersWin[pourPool[dir][j].uid] = flag*pourPool[dir][j].pourGold;
			}
		}
	}
	return {
		cardsArr: cardsArr,
		winArr: winArr,
		bankerWin: bankerWin,
		usersWin: usersWin
	};
};


