/**
 * Created by 苏永富 on 2017/6/30.
 */

var SDK = module.exports = {};

SDK.init = function () {
    //监听录音自动停止接口
    wx.onVoiceRecordEnd({
        // 录音时间超过一分钟没有停止的时候会执行 complete 回调
        complete: function (res) {
            var localId = res.localId;
            SDK.uploadVoice(localId);
            Global.MessageCallback.emitMessage('OnVoiceRecordEnd', {localId: localId});
        }
    });

    //监听语音播放完毕接口
    wx.onVoicePlayEnd({
        success: function (res) {
            var localId = res.localId; // 返回音频的本地ID
            Global.MessageCallback.emitMessage('OnVoicePlayEnd', {localId: localId});
        }
    });

    //录音授权
    SDK.auth = false;
};

//授权录音
SDK.authRecordVoice = function () {
    if (!SDK.auth) {
        wx.startRecord({
            success: function (res) {
                SDK.auth = true;
                wx.stopRecord();
            },
            fail: function (res) {
                wx.stopRecord();
            },
            cancel: function (res) {
                wx.stopRecord();
            }
        });
    }
};

//开始录音接口
SDK.startRecord = function () {
    wx.startRecord({
        fail: function (res) {
            alert('录音失败');
        },
        cancel: function (res) {
            alert('录音取消');
        }
    });
};

//停止录音接口
SDK.stopRecord = function (send) {
    wx.stopRecord({
        success: function (res) {
            var localId = res.localId;
            if (!!send) {
                SDK.uploadVoice(localId);
            }
        },
        fail: function () {
            alert('录音失败');
        }
    });
};

//播放语音接口
SDK.playVoice = function (serverId) {
    wx.downloadVoice({
        serverId: serverId, // 需要下载的音频的服务器端ID，由uploadVoice接口获得
        isShowProgressTips: 0, // 默认为1，显示进度提示
        success: function (res) {
            var localId = res.localId; // 返回音频的本地ID
            wx.playVoice({
                localId: localId // 需要播放的音频的本地ID，由stopRecord接口获得
            });
        }
    });
};

//暂停播放接口
SDK.pauseVoice = function (localId) {
    wx.pauseVoice({
        localId: localId // 需要暂停的音频的本地ID，由stopRecord接口获得
    });
};

//停止播放接口
SDK.stopVoice = function (localId) {
    wx.stopVoice({
        localId: localId // 需要停止的音频的本地ID，由stopRecord接口获得
    });
};

//上传语音接口
//备注：上传语音有效期3天，可用微信多媒体接口下载语音到自己的服务器，
// 此处获得的 serverId 即 media_id，参考文档 .目前多媒体文件下载接口的频率限制为10000次/天，
// 如需要调高频率，请登录微信公众平台，在开发 - 接口权限的列表中，申请提高临时上限。
SDK.uploadVoice = function (localId) {
    wx.uploadVoice({
        localId: localId, // 需要上传的音频的本地ID，由stopRecord接口获得
        isShowProgressTips: 0, // 默认为1，显示进度提示
        success: function (res) {
            var serverId = res.serverId; // 返回音频的服务器端ID
            Global.MessageCallback.emitMessage('UploadVoiceCompleted', {serverId: serverId});
            Global.DialogManager.addTipDialog('语音发送成功！');
        },
        fail: function (res) {
            Global.DialogManager.addTipDialog('语音发送失败！');
        }
    });
};