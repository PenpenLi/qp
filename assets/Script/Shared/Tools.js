/**
 * Created by 苏永富 on 2017/6/22.
 */

let Tools = module.exports = {};

Tools.init = function () {
    Tools.Utils = require('./utils');
    Tools.httpIp = Global.Constant.httpRequestIP;
    Tools.httpPort = Global.Constant.httpRequestPort;

    Tools.http = 'http://' + Tools.httpIp + ':' + Tools.httpPort;
    Tools.transferHttpGet = Tools.http + '/httpGet?url=';//转发httpGet
    Tools.transferHttpPost = Tools.http + '/httpPost?url=';//转发httpPost
    Tools.httpGetUserInfo = Tools.http + '/GetUserInfo';//获取用户微信信息
    Tools.httpGetJSSDKSignature = Tools.http + '/GetJSSDKSignature';//获取JSSDK签名
    Tools.httpGetPhoneCode = Tools.http + '/GetSMSCode';//获取手机验证码

    //图片
    Tools.httpGetQRCode = Tools.http + '/GetQRCode';//获取推广二维码
    Tools.httpGetQRCodeWithUrl = Tools.http + '/GetQRCodeImgWithUrl';//获取带链接的二维码
    Tools.httpGetImgCode = Tools.http + '/GetImgCode';//获取验证码图片

};


//获取手机验证码
Tools.getPhoneCode = function (phoneNumber) {
    this.httpRequest({
        url: Global.Tools.httpGetPhoneCode,
        method: 'POST',
        data: JSON.stringify({phoneNumber: phoneNumber}),
    });
};

//获取验证码图片
Tools.updateImgCode = function (target, cb) {
    Global.DialogManager.addLoadingCircle();
    let uniqueID = Global.Tools.Utils.randomString();
    let url = Tools.httpGetImgCode + '?uniqueID=' + uniqueID;
    this.updateServerImg(url, target, function () {
        Global.DialogManager.removeLoadingCircle();
        if (!!cb) {
            cb();
        }
    });
    return uniqueID;
};

//从服务器的图片
Tools.updateServerImg = function (imgUrl, target_, cb) {
    this.updateSpriteFrame(imgUrl, target_, cb, 'server');
};

//从web服务器的图片
Tools.updateStoreImg = function (imgUrl, target_, cb) {
    this.updateSpriteFrame(imgUrl, target_, cb, 'store');
};

//跨域图片或者本地图片
Tools.updateSpriteFrame = function (imgUrl, target_, cb, other) {
    let target = target_;
    if ((imgUrl && imgUrl.indexOf('http') >= 0) || (!!other && other === 'store')) {
        let Base64 = {
            _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            // public method for encoding
            encode: function encode(input) {
                let output = "";
                let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                let i = 0;

                while (i < input.length) {
                    chr1 = input[i++];
                    chr2 = input[i++];
                    chr3 = input[i++];

                    enc1 = chr1 >> 2;
                    enc2 = (chr1 & 3) << 4 | chr2 >> 4;
                    enc3 = (chr2 & 15) << 2 | chr3 >> 6;
                    enc4 = chr3 & 63;

                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }
                    output = output + Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) + Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);
                }
                return output;
            }
        };

        let url = Tools.transferHttpGet + imgUrl;
        if (!!other && other === 'store') {
            url = Global.Constant.storeImgIP + imgUrl;
        }

        if (!!other && other === 'server') {
            url = imgUrl;
        }

        cc.loader.load({url: url, type: "png"}, function (err, texture) {
            if (!!err) {
                console.log(err);
            } else {
                if (target.isValid) {
                    target.spriteFrame =  new cc.SpriteFrame(texture);
                    if (!!cb) {
                        cb();
                    }
                }
            }
        });

        // this.httpRequest({
        //     url: url,
        //     async: true,
        //     responseType: 'arraybuffer',
        //     callback: function (data) {
        //         let blob = new Uint8Array(data.response);
        //         let img = new Image();
        //         img.src = "data:image/png;base64," + Base64.encode(blob);
        //         img.onload = function () {
        //             let texture = new cc.Texture2D();
        //             texture.generateMipmaps = false;
        //             texture.initWithElement(img);
        //             texture.handleLoadedTexture();
        //             target.spriteFrame = new cc.SpriteFrame(texture);
        //
        //             if (!!cb) {
        //                 cb();
        //             }
        //         }
        //     }.bind(this)
        // });
    //加载本地图片
    } else {
        cc.loader.loadRes(imgUrl, cc.SpriteFrame, function (err, spriteFrame){
            if (!!err){
                console.error(err);
            }else{
                if (target.isValid){
                    target.spriteFrame = spriteFrame;
                    if (!!cb) {
                        cb();
                    }
                }
            }
        });
    }
};

Tools.loadRes = function (needLoad, cb) {
    let loadingCount = 0;
    for (let i = 0; i < needLoad.length; i ++) {
        cc.loader.loadResDir(needLoad[i], function (err) {
            loadingCount += 1;
            if (loadingCount >= (needLoad.length)) {
                cb();
            }
        }.bind(this));
    }
};

Tools.getSprite = function(src) {
    let node = new cc.Node();
    let sprite = node.addComponent(cc.Sprite);
    sprite.spriteFrame = new cc.SpriteFrame();
    sprite.spriteFrame.setTexture(cc.url.raw(src));
    return node;

};

Tools.numberToString = function (number, length, char){
    let str = number.toString();
    if (!!length && !!char){
        while (str.length < length){
            str = char + str;
        }
    }
    return str;
};

Tools.getDist = function (fromPos, toPos) {
    let dx = toPos.x - fromPos.x;
    let dy = toPos.y - fromPos.y;
    return Math.sqrt(dx * dx + dy * dy);
};

Tools.formatGoldString = function(goldNumber, length){
    if (!length) length = 4;
    if (goldNumber < 10000){
        return goldNumber.toString();
    }else {
        let str = '';
        if (goldNumber < 100000000){
            str = (goldNumber/10000).toString().substring(0, length);
            if (str.indexOf('.') === (str.length - 1)){
                str = str.substring(0, str.length - 1);
            }
            str += '万';
        } else {
            str = (goldNumber/100000000).toString().substring(0, length);
            if (str.indexOf('.') === (str.length - 1)){
                str = str.substring(0, str.length - 1);
            }
            str += '亿';
        }
        return str;
    }
};

Tools.formatNumber = function (num) {
    if (num >= 100000000) {
        return (num / 100000000).toFixed(0) + "亿";
    } else if (num >= 10000) {
        return (num / 10000).toFixed(0) + '万';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(0) + '千';
    } else {
        return num
    }
};

// 聊天文本
Tools.getChatText = function() {
	let txt1 = "大家好，很高兴见到各位。";
	let txt2 = "初来乍到，请大家手下留情。";
	let txt3 = "快点吧，等得我花儿都谢了";
	let txt4 = "别拼了，没牛就是没牛!";
	let txt5 = "不好意思，又赢了。";
	let txt6 = "底裤都要输掉了。";
	let txt7 = "别高兴太早，等我回来！";
	return [txt1, txt2, txt3, txt4, txt5, txt6, txt7];
};

// 获取表情url
Tools.getEmotionUrlByIndex = function(index) {
	return "Emotion/" + index + "_se";
};

//查看用户信息公用方法
// data = {uid: uid}
Tools.openUserInfo = function (data) {
    Global.DialogManager.createDialog('Friend/FriendInfoDialog', {data: data});
};

// 获取玩家说话url
Tools.getChatSoundUrl = function(index, sex) {
	let url;
	if(sex === Global.Enum.PlayerSex.MAN) {
		url = "Chat/man/chat" + index;
	} else {
		url = "Chat/woman/chat" + index;
	}
	return url;
};

// 获取随机名字
Tools.getRandomName = function() {
	let names = ["晴天", "好汉", "我是谁", "温柔一笑", "落叶", "cly", "sfmy", "syf", "yz", "just soso", "阿萨卡", "爱丽丝", "赌徒", "岁", "罗"];
	let index = Math.floor(Math.random()*names.length);
	return names[index];
};

// 截屏
Tools.capScreen = function(node) {
	if (CC_JSB) {
		let width = cc.visibleRect.width;
		let height = cc.visibleRect.height;
		let renderTexture = cc.RenderTexture.create(width, height);
		node.parent._sgNode.addChild(renderTexture);

		renderTexture.begin();
		node._sgNode.visit();
		renderTexture.end();
		let url = Date.now() + ".png";
		renderTexture.saveToFile(url, cc.ImageFormat.PNG, true, function () {
			node.parent._sgNode.removeChild(renderTexture);
		});
	}
};

//截屏分享
Tools.screenShoot = function (func) {
    if (!cc.sys.isNative) return;
    if (CC_JSB) {
        let dirpath = jsb.fileUtils.getWritablePath() + 'ScreenShoot/';
        if (!jsb.fileUtils.isDirectoryExist(dirpath)) {
            jsb.fileUtils.createDirectory(dirpath);
        }
        let name = 'ScreenShoot-' + (new Date()).valueOf() + '.png';
        let filepath = dirpath + name;
        let size = cc.visibleRect;
        let rt = cc.RenderTexture.create(size.width, size.height);
        cc.director.getScene()._sgNode.addChild(rt);
        rt.setVisible(false);
        rt.begin();
        cc.director.getScene()._sgNode.visit();
        rt.end();
        rt.saveToFile('ScreenShoot/' + name, cc.ImageFormat.PNG, true, function () {
            cc.log('save succ');
            rt.removeFromParent(true);
            if (func) {
                func(filepath);
            }
        });
    }
};

//分享平台参数wechat1为微信朋友，wechat2为微信朋友圈
Tools.shareImg = function (wechat) {
    this.screenShoot(function (filePath) {
        Global.SDK.share(null, null, filePath, null, wechat, 'onlyImg');
    });
};

//邀请好友加入房间
Tools.showInviteFriends = function (roomID) {
    Global.DialogManager.createDialog('RoomControl/SelectFriendDialog', {type: 'invite', roomID: roomID});
};

//http请求
/*params
url
method
async
callback
data
 */
Tools.httpRequest = function (params) {
    cc.log('发送请求', params.url);

    let urlStr = params.url;
    let methodStr = params.method || 'GET';

    let async = false;
    if (!!params.async) {
        async = true;
    }

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 400)) {
            if (!!params.callback) {
                cc.log('收到数据', xhr);
                params.callback(xhr);
            }
        }
    };

    if (!!params.responseType) {
        xhr.responseType = params.responseType;
    }
    xhr.open(methodStr, urlStr, async);

    if (methodStr === 'POST') {
        xhr.setRequestHeader("CONTENT-TYPE", "application/x-www-form-urlencoded");
    }

    if (!!params.data) {
        cc.log('post参数', params.data);
        xhr.send('params=' + params.data);
    } else {
        xhr.send();
    }
};

//生成随机字符串
Tools.randomString = function (len) {
    len = len || 16;
    let chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    let maxPos = chars.length;
    let pwd = '';
    for (i = 0; i < len; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
};

//修改网页的标题
Tools.setPageTitle = function(titleText) {
    // document.title = titleText;
};

Tools.isPointInPolygon = function(point, pointArray) {
	let x = point.x, y = point.y;
	let i, crossx1 = null, crossx2 = null, crossx;
	for(i = 0; i < pointArray.length; ++i) {
		let px = pointArray[i].x;
		let py = pointArray[i].y;
		let nx = pointArray[(i+1)%pointArray.length].x;
		let ny = pointArray[(i+1)%pointArray.length].y;
		if(px === nx) {
			if((y >= py && y <= ny) || (y >= ny && y <= py)) {
				if(crossx1) {
					crossx2 = px; 
				} else {
					crossx1 = px; 
				}   
			}   
		}   
		else if((y-py)*(y-ny) <= 0) {
			crossx = (y-py)/(ny-py)*(nx-px)+px;
			if((crossx-px)*(crossx-nx) <= 0) {
				if(crossx1) {
					crossx2 = crossx;
				} else {
					crossx1 = crossx;
				}   
			}   
		}   
	}   
	if(!!crossx1 && !!crossx2) {
		if((x-crossx1)*(x-crossx2) <= 0) {
			return true;
		}   
	}   
	return false;
};

//检查是不是微信浏览器
Tools.isWechatBrowser = function () {
    //安卓的微信webview由qq浏览器x5内核提供技术支持，所以加BROWSER_TYPE_MOBILE_QQ
    return false;
    // return (cc.sys.browserType === cc.sys.BROWSER_TYPE_WECHAT || cc.sys.browserType === cc.sys.BROWSER_TYPE_MOBILE_QQ);
};

//设置分享内容，默认设置在游戏中分享
// 分享到朋友圈
Tools.setShareTimeline = function (params_) {
    if (!!Global.wx) {
        let params = params_ || {};
        let imgUrl = params.imgUrl || Global.Data.getData('share_game_timeline_img_url');

        Global.wx.onMenuShareTimeline({
            title: params.title || Global.Data.getData('share_game_timeline_title'), // 分享标题
            link: params.link || Global.Data.getData('share_game_link') + '?state=' + params.roomID, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl: Global.Constant.storeImgIP + imgUrl + '?ver=' + (new Date()).valueOf(), // 分享图标
            success: function () {
                alert('分享成功');
                if (!!params.cb) {
                    params.cb('success');
                }
            },
            cancel: function () {
                alert('取消分享');
                if (!!params.cb) {
                    params.cb('cancel');
                }
            },
            fail: function () {
                alert('分享失败');
                if (!!params.cb) {
                    params.cb('fail');
                }
            }
        });
    }
};

//分享给朋友
Tools.setShareFriend = function (params_) {
    if (!!Global.wx) {
        let params = params_ || {};
        let imgUrl = params.imgUrl || Global.Data.getData('share_game_friend_img_url');

        Global.wx.onMenuShareAppMessage({
            title: params.title || Global.Data.getData('share_game_friend_title'), // 分享标题
            desc: params.desc || Global.Data.getData('share_game_friend_desc').format(params.roomID), // 分享描述
            link: params.link || Global.Data.getData('share_game_link') + '?state=' + params.roomID, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl: Global.Constant.storeImgIP + imgUrl + '?ver=' + (new Date()).valueOf(), // 分享图标
            type: params.type || '', // 分享类型,music、video或link，不填默认为link
            dataUrl: params.dataUrl || '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function () {
                alert('分享成功');
                if (!!params.cb) {
                    params.cb('success');
                }
            },
            cancel: function () {
                alert('取消分享');
                if (!!params.cb) {
                    params.cb('cancel');
                }
            },
            fail: function () {
                alert('分享失败');
                if (!!params.cb) {
                    params.cb('fail');
                }
            }
        });
    }
};

// 截取英文字符的长度
Tools.getStringByRealLength = function(str, length) {
	let realLength = 0;
	for(let i = 0; i < str.length; ++i) {
		let count = str.charCodeAt(i);
		if(count >= 0 && count <= 128) {
			++ realLength;
		} else {
			realLength += 2;
		}
		if(realLength >= length) {
			break;
		}
	}
	return str.substring(0, i+1);
};

Tools.getStringRealLength = function(str) {
	let realLength = 0;
	for(let i = 0; i < str.length; ++i) {
		let count = str.charCodeAt(i);
		if(count >= 0 && count <= 128) {
			++ realLength;
		} else {
			realLength += 2;
		}
	}
	return realLength;
};

Tools.convertNickname = function (nickname) {
    let isNumber = true;
    let newNickname = nickname;
    if (nickname.length === 11) {
        for (let i = 0; i < nickname.length; i ++) {
            if (isNaN(nickname[i])) {
                isNumber = false;
            }
        }

        if (isNumber) {
            newNickname = nickname.substring(0, 3) + '****' + nickname.substring(7, 11);
        }
    }

    return newNickname;
};

Tools.playPreSound = function () {
    cc.loader.loadRes('Sound/button', function (err, clip) {
        if (!!err){
        }else{
            cc.audioEngine.play(clip, false, 0);
        }
    });
};