/**
 *  created by cly 17/4/10
 */

var gameLogic = module.exports = {};
gameLogic.rule = {
	shangzhuang: {
		niuniushangzhuang:	1,
		gudingzhuangjia:	2,
		ziyouqiangzhuang:	4,
		mingpaiqiangzhuang:	8,
		tongbiniuniu:		16	
	},
	fanbei: {
		xiaofan:	1,
		dafan:		2
	},
	teshupai: {
		meiyou:		0,
		wuhuaniu:	1,
		zhadanniu:	2,
		wuxiaoniu:	4
	},
	tuizhu: {
		lingbei:	0,
		wubei:		1,
		shibei:		2,
		ershibei:	4
	},
	shangzhuangfen: {
		lingfen:		0,
		yibaifen:		100,
		yibaiwushi:		150,
		liangbaifen:	200,
	},
	qiangzhuang: {
		yibei:		1,
		liangbei:	2,
		sanbei:		3,
		sibei:		4
	},
	difenArr: {
		difen1: [1, 2],
		difen2: [2, 4],
		difen3: [4, 8],
		difen4: [1],
		difen5: [2],
		difen6: [4]
	}
};

gameLogic.CARDS				= [];
gameLogic.COLOR_FANGKUAI	= 0;	
gameLogic.COLOR_CAOHUA		= 1;	
gameLogic.COLOR_HONGTAO		= 2;	
gameLogic.COLOR_HEITAO		= 3;	

gameLogic.RATE_THREE		= 3;
gameLogic.RATE_FOUR			= 4;
gameLogic.RATE_TEN			= 10;

gameLogic.SNATCH_BANK		= 0;
gameLogic.WINNER_BANK		= 1;
gameLogic.CHANGE_BANK		= 2;
gameLogic.ALWAYS_BANK		= 3;
gameLogic.ALL_BANK			= 4;

gameLogic.LOSE				= 0;
gameLogic.WIN				= 1;

gameLogic.setRoomData = function(data) {
	this.PLAYER_COUNT = data.playerCount;
	this.RATE = data.rate;
	this.RULE = data.rule;
	this.CARDS_COUNT = this.PLAYER_COUNT * 13;
};

gameLogic.getResout = function(cardsArr, scoreArr, gameRule, bankIndex, robRate, baseScore, bankGold) {
	if(! baseScore) { baseScore = 1; }
	var resout = [], i, j, hasSame = false;
	for(i = 0; i < cardsArr.length; ++i) {
		resout[i] = {
			normal: this.getNormalCardType(cardsArr[i]),
			special: this.getSpecialCardType(cardsArr[i], gameRule),
			maxCard: this.getMaxCard(cardsArr[i]),
		};
	}
	var finalScoreArr = [];
	for(i = 0; i < scoreArr.length; ++i) { finalScoreArr[i] = 0; }
	// 通比最大牌为庄家
	if(gameRule.otherRule.shangzhuang !== this.rule.shangzhuang.ziyouqiangzhuang && 
		gameRule.otherRule.shangzhuang !== this.rule.shangzhuang.mingpaiqiangzhuang) {
		robRate = 1;
	}

	var bankSpeRate = this.getSpecialTypeRate(resout[bankIndex].special);
	var bankNorRate = this.getNormalTypeRate(resout[bankIndex].normal, gameRule);
	for(i = 0; i < cardsArr.length; ++i) {
		if(i !== bankIndex) {
			var userSpeRate = this.getSpecialTypeRate(resout[i].special);
			var userNorRate = this.getNormalTypeRate(resout[i].normal, gameRule);
			if(this.compareCardArr(cardsArr[bankIndex], cardsArr[i], gameRule) > 0) {
				var rate = (bankSpeRate>0)? bankSpeRate:bankNorRate;
				finalScoreArr[bankIndex] += scoreArr[i]*rate*robRate*baseScore;
				finalScoreArr[i] -= scoreArr[i]*rate*robRate*baseScore;
			} else {
				rate = (userSpeRate>0)? userSpeRate:userNorRate;
				finalScoreArr[bankIndex] -= scoreArr[i]*rate*robRate*baseScore;
				finalScoreArr[i] += scoreArr[i]*rate*robRate*baseScore;
			}
		}
	}
	if(finalScoreArr[bankIndex]+bankGold < 0) { // 庄家不够赔付
		finalScoreArr[bankIndex] = -bankGold; 
		var indexArr = this.getPaySortIndexArr(bankIndex, resout);
		for(i = 0; i < indexArr.length; ++i) {
			var index = indexArr[i];
			if(finalScoreArr[index] > 0) {
				if(finalScoreArr[index] <= bankGold) {
					bankGold -= finalScoreArr[index];
				} else {
					finalScoreArr[index] = (bankGold>0)? bankGold:0;
					bankGold = 0;
				}
			}
		}
	}
	return {
		cardsArr: cardsArr,
		finalScoreArr: finalScoreArr,
		bankIndex: bankIndex
	};
};

// 获取赔付顺序
gameLogic.getPaySortIndexArr = function(bankIndex, resout) {
	var sortArr = [];
	var loopCount = 0;
	for(var i = 0; sortArr.length !== resout.length-1; i = (i+1)%resout.length) {
		if(i !== bankIndex) {
			var canInsert = true;
			for(var j = 0; j < resout.length; ++j) {
				if(sortArr.indexOf(j) === -1 && j !== bankIndex) {
					if(resout[i].special === resout[j].special) {
						if(!this.compareCard(resout[i].maxCard, resout[j].maxCard)) {
							canInsert = false; break;
						}
					}
					else if(resout[i].special < resout[j].special) {
							canInsert = false; break;
					} 
					else if(resout[i].special > resout[j].special) {
					}
					else if(resout[i].normal === resout[j].normal) {
						if(!this.compareCard(resout[i].maxCard, resout[j].maxCard)) {
							canInsert = false; break;
						}
					}
					else if(resout[i].normal < resout[j].normal) {
						canInsert = false; break;
					}
					else if(resout[i].normal > resout[j].normal) {
					}
					else if(!this.compareCard(resout[i].maxCard, resout[j].maxCard)) {
						canInsert = false; break;
					}
				}
			}
			if(canInsert) {
				sortArr.push(i);
			}
		}

		++ loopCount;
		if(loopCount > 2*resout.length) {
			console.log('error getPaySortIndexArr'); break;
		}
	}
	return sortArr;
};

// 获取最大牌
gameLogic.getMaxCard = function(cardArr) {
	var maxCard = cardArr[0];
	for(var i = 1; i < cardArr.length; ++i) {
		if(!this.compareCard(maxCard, cardArr[i])) {
			maxCard = cardArr[i];
		}
	}
	return maxCard;
};

gameLogic.compareCard = function(card1, card2) {
	if(card1%13 === card2%13) {
		if(card1/13 < card2/13) {
			return false;
		}
	} else {
		if(card2%13 === 0) {
			return false;
		} 
		else if(card1%13 !== 0 && card2%13 > card1%13) {
			return false;
		}
	}
	return true;
};

gameLogic.compareCardArr = function(cards1, cards2, gameRule) {
	var rate1 = this.getNormalCardType(cards1);
	var rate2 = this.getNormalCardType(cards2);
	var spe1 = this.getSpecialCardType(cards1, gameRule);
	var spe2 = this.getSpecialCardType(cards2, gameRule);
	if(spe1 !== spe2) {
		return (spe1 - spe2);
	} else {
		if(rate1 !== rate2) {
			return (rate1 - rate2);
		} else {
			return this.compareCountThenColor(cards1, cards2);
		}
	}
	return 0;
};

gameLogic.getSpecialTypeRate = function(type) {
	if((type&this.rule.teshupai.wuxiaoniu) > 0) {
		return 8;
	}
	else if((type&this.rule.teshupai.zhadanniu) > 0) {
		return 6;
	}
	else if((type&this.rule.teshupai.wuhuaniu) > 0) {
		return 5;
	}
	return 0;
};

gameLogic.getNormalTypeRate = function(type, gameRule) {
	var rate = 0;
	if(gameRule.otherRule.fanbei === this.rule.fanbei.xiaofan) {
		if(type === 10) {
			rate = 3;
		}
		else if(type === 9 || type === 8) {
			rate = 2;
		}
		else {
			rate = 1;
		}
	} else {
		if(type === 10) {
			rate = 4;
		}
		else if(type === 9) {
			rate = 3;
		}
		else if(type === 8 || type === 7) {
			rate = 2;
		}
		else {
			rate = 1;
		}
	}
	return rate;
};

gameLogic.getWinnerBankResout = function(resout, cardsArray) {
	if(this.RULE !== this.WINNER_BANK) return; 
	var maxIndex = 0, compareResout, winIndexs = []; 
	var i, j, hasSame = false;

	for(i = 1; i < cardsArray.length; ++i) {
		if(resout[i].finalRate > resout[maxIndex].finalRate)
			maxIndex = i;
		else if(resout[i].finalRate === resout[maxIndex].finalRate) {
			compareResout = this.compareCountThenColor(cardsArray[i], cardsArray[maxIndex]);
			if(compareResout > 0) 
				maxIndex = i;
			else if(compareResout === 0)
				hasSame = true;
		}
	}
	winIndexs.push(maxIndex);
	if(hasSame) {
		for(i = 0; i < cardsArray.length; ++i) {
			if((i !== maxIndex) && (resout[i].finalRate === resout[maxIndex].finalRate)) {
				if(this.compareCountThenColor(cardsArray[i], cardsArray[maxIndex]) === 0)
					winIndexs.push(i);
			}
		}
	}
	for(i = 0; i < cardsArray.length; ++i) {
		if(winIndexs.indexOf(i) === -1) {
			for(j = 0; j < winIndexs.length; ++j) {
				resout[winIndexs[j]].scores[i] = resout[winIndexs[j]].finalRate;
				resout[i].scores[winIndexs[j]] = -resout[winIndexs[j]].finalRate;
			}
		}
	}

	return resout;
};

gameLogic.getAllBankResout = function(resout, cardsArray) {
	if(this.RULE !== this.ALL_BANK) return;
	var i, j, compareResout;

	for(j = 0; j < cardsArray.length; ++j) {
		for(i = j+1; i < cardsArray.length; ++i) {
			compareResout = resout[i].finalRate - resout[j].finalRate;
			if(compareResout > 0) {
				resout[i].scores[j] = resout[i].finalRate;
				resout[j].scores[i] = -resout[i].finalRate;
			}
			else if(compareResout < 0) {
				resout[i].scores[j] = -resout[j].finalRate;
				resout[j].scores[i] = resout[j].finalRate;
			}
			else {
				compareResout = this.compareCountThenColor(cardsArray[i], cardsArray[j]);
				if(compareResout > 0) {
					resout[i].scores[j] = resout[i].finalRate;
					resout[j].scores[i] = -resout[i].finalRate;
				}
				else if(compareResout < 0) {
					resout[i].scores[j] = -resout[j].finalRate;
					resout[j].scores[i] = resout[j].finalRate;
				}
			}
		}
	}
};

gameLogic.getConfirmBankResout = function(resout, cardsArray, bankIndex) {
	if((this.RULE === this.ALL_BANK) || (this.RULE === this.WINNER_BANK)) return;
	var i, compareResout;
	for(i = 0; i < cardsArray.length; ++i) {
		if(i !== bankIndex) {
			if(resout[i].finalRate > resout[bankIndex].finalRate) {
				resout[i].scores[bankIndex] = resout[i].finalRate;
				resout[bankIndex].scores[i] = -resout[i].finalRate;
			}
			else if(resout[i].finalRate < resout[bankIndex].finalRate) {
				resout[i].scores[bankIndex] = -resout[bankIndex].finalRate;
				resout[bankIndex].scores[i] = resout[bankIndex].finalRate;
			} else {
				compareResout = this.compareCountThenColor(cardsArray[i], cardsArray[bankIndex]);
				if(compareResout > 0) {
					resout[i].scores[bankIndex] = resout[i].finalRate;
					resout[bankIndex].scores[i] = -resout[i].finalRate;
				}
				else if(compareResout < 0) {
					resout[i].scores[bankIndex] = -resout[bankIndex].finalRate;
					resout[bankIndex].scores[i] = resout[bankIndex].finalRate;
				}
			}
		}
	}

	return resout;
};

// 获取牌
gameLogic.getCardsArr = function(count) {
	var cardArr = [];
	for(var i = 0; i < 52; ++i) {
		cardArr[i] = i;
	}
	var index1, index2, tmp;
	for(var j = 0; j < cardArr.length; ++j) {
		index1 = Math.floor(Math.random()*cardArr.length);
		index2 = Math.floor(Math.random()*cardArr.length);
		tmp = cardArr[index1];
		cardArr[index1] = cardArr[index2];
		cardArr[index2] = tmp;
	}
	var cardsArr = [];
	for(var k = 0; k < count; ++k) {
		tmp = [];
		for(var m = 0; m < 5; ++m) {
			tmp.push(cardArr.pop());
		}
		cardsArr.push(tmp);
	}
	return cardsArr;
};


// 获取牌面值
gameLogic.getCardNumber = function(cardId) {
	return cardId%13+1;
};

// convert JQK to 10 获取计算牛时牌值
gameLogic.getCardCount = function(cardId) {
	var count = this.getCardNumber(cardId);
	if(count > 10) count = 10;
	return count;
};

// 获取牌花色
gameLogic.getCardColor = function(cardId) {
	return Math.floor(cardId%52/13);
};

// 5小牛
gameLogic.isFiveLittleNiu = function(cards) {
	var count, sum = 0;
	for(var i = 0; i < cards.length; ++i) {
		count = this.getCardCount(cards[i]);
		if(count < 5)
			sum += count;
		else 
			return false;
	}

	return (sum <= 10);
};

// 5花牛
gameLogic.isFiveColorNiu = function(cards) {
	for(var i = 0; i < cards.length; ++i) {
		if(this.getCardNumber(cards[i]) <= 10)
			return false;
	}
	return true;
};

// 炸弹牛
gameLogic.isFourSameCard = function(cards) {
	var card1 = cards[0], card2 = cards[1];
	var count1 = 0, count2 = 0;
	for(var i = 0; i < cards.length; ++i) {
		if(this.getCardNumber(cards[i]) === this.getCardNumber(card1)) {
			++ count1;
		}
		if(this.getCardNumber(cards[i]) === this.getCardNumber(card2)) {
			++ count2;
		}
	}

	return ((count1 >= 4) || (count2 >= 4));
};

// 获取特殊牌型
gameLogic.getSpecialCardType = function(cards, gameRule) {
	var type = 0;
	if(this.isFiveLittleNiu(cards) && (gameRule.otherRule.teshupai&this.rule.teshupai.wuxiaoniu) > 0) {
		type = this.rule.teshupai.wuxiaoniu;
	}
	else if(this.isFourSameCard(cards) && (gameRule.otherRule.teshupai&this.rule.teshupai.zhadanniu) > 0) {
		type = this.rule.teshupai.zhadanniu;
	}
	else if(this.isFiveColorNiu(cards) && (gameRule.otherRule.teshupai&this.rule.teshupai.wuhuaniu) > 0) {
		type = this.rule.teshupai.wuhuaniu;
	}
	return type;
};

// 获取牛牛牌型
gameLogic.getNormalCardType = function(cards) {
	var i, j, k, sum = 0, rate = 0;
	var hasRate = false;
	var cardArr = [];
	for(i = 0; i < cards.length; ++i) {
		cardArr[i] = this.getCardCount(cards[i]);
		sum += cardArr[i];
	}

	for(i = 0; i < cardArr.length; ++i) {
		for(j = i+1; j < cardArr.length; ++j) {
			for(k = j+1; k < cardArr.length; ++k) {
				if((cardArr[i] + cardArr[j] + cardArr[k]) % 10 === 0) {
					hasRate = true;
					rate = (sum - cardArr[i] - cardArr[j] - cardArr[k]) % 10;
					break;
				}
			}
		}
	}
	if(rate === 0 && hasRate) rate = 10;

	return rate;
};

// 先比大小后比花色
gameLogic.compareCountThenColor = function(cardArr1, cardArr2) {
	cardArr1 = cardArr1.sort(this.bigToSmallFunc);	// 大到小
	cardArr2 = cardArr2.sort(this.bigToSmallFunc); // 大到小
	for(var i = 0; i < cardArr1.length; ++i) {	// 比大小
		if(cardArr1[i]%13 !== cardArr2[i]%13) {
			return cardArr1[i]%13-cardArr2[i]%13;
		}
	}
	for(var i = 0; i < cardArr1.length; ++i) {	// 比花色
		if(Math.floor(cardArr1[i]/13) !== Math.floor(cardArr2[i]/13)) {
			return Math.floor(cardArr1[i]/13)-Math.floor(cardArr2[i]/13);
		}
	}
	return 0;
};

gameLogic.bigToSmallFunc = function(a, b) {
	if(a%13 === b%13) {
		return Math.floor(b/13) - Math.floor(a/13);
	} else {
		return b%13 - a%13;
	}
};

// 比两张牌大小
gameLogic.compareTwoCard = function(card1, card2) {
	var number1 = this.getCardNumber(card1);
	var number2 = this.getCardNumber(card2);
	if(number1 !== number2)
		return number1 - number2;
	else
		return this.getCardColor(card1) - this.getCardColor(card2);
};

