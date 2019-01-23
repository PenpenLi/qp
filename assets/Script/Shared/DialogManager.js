var DialogManager = module.exports = {};

DialogManager.init = function (rootNode) {
    this.rootNode = rootNode;
    // 创建dialog node
    this.dialogNode = new cc.Node();
    this.dialogNode.parent = this.rootNode;
    this.dialogNode.width  = rootNode.width ;
    this.dialogNode.height  = rootNode.height ;
    this.frontNode = new cc.Node();
    this.frontNode.parent = this.rootNode;
    this.frontNode.width  = rootNode.width ;
    this.frontNode.height  = rootNode.height ;

    this.loadedDialogPrefabs = {};
    this.uiPrefabsPath = 'UIPrefabs/';
    this.createdDialogs = {};

    this.loadingCircleDialog = null;
    this.popDialog = null;
};

/**
 * 创建dialog
 * @param dialogRes dialog种类，必须与prefab和dialog对应的管理js脚本名字相同
 * @param params 创建dialog需要传入的参数
 * @param cb 创建完成的会调
 */
DialogManager.createDialog = function (dialogRes, params, cb) {
    cc.log('create dialog:' + dialogRes);
    var callback = ((typeof cb) === 'function') ? cb:null;
    var fileName = dialogRes;
    var arr = dialogRes.split('/');
    var dialogType = arr[arr.length-1];
    // 验证数据
    if (!dialogRes){
        console.error('Create Dialog failed: dialog type is null');
        if (!!callback) callback("create failed", null);
        return;
    }
    var createdDialogs = this.createdDialogs;
    // 判定是否已创建
    var createDialog = createdDialogs[dialogRes] || null;
    if (!!createDialog){
        console.error('Create dialog is exist');
        createDialog.zIndex += 1;
        if (!!callback) callback(null, createDialog);
    }
    else{
        // 加载过则直接创建
        var loadedDialogPrefabs = this.loadedDialogPrefabs;
        if (!!loadedDialogPrefabs[dialogRes]){
            createDialog = cc.instantiate(loadedDialogPrefabs[dialogRes]);
            createdDialogs[dialogRes] = createDialog;
            createDialog.getComponent(dialogType).dialogParameters = params;
            createDialog.getComponent(dialogType).isDestroy = false;
            createDialog.parent = this.dialogNode;
            if (!!callback) callback(null, createDialog);
            return;
        }
        // 现加载资源创建
        var self = this;
        cc.loader.loadRes(fileName, function(err, data){
            if (!!err){
                if (!!callback) callback(err, null);
                console.error(err);
            }
            else{
                loadedDialogPrefabs[dialogRes] = data;
                createDialog = cc.instantiate(data);
                createdDialogs[dialogRes] = createDialog;
                createDialog.getComponent(dialogType).dialogParameters = params;
                createDialog.getComponent(dialogType).isDestroy = false;
                createDialog.parent = self.dialogNode;
                if (!!callback) callback(null, createDialog);
            }
        });
    }
};


DialogManager.isDialogExit = function(dialogRes) {
    var createDialog = this.createdDialogs[dialogRes];
	if(createDialog) {
		return true;
	} else {
		return false;
	}
};

/**
 * 将dialog添加进dialogManager
 * @param dialogType dialog类型
 * @param dialog dialog节点
 */
DialogManager.addDialogToManager = function (dialogType, dialog) {
    this.createdDialogs[dialogType] = this.createdDialogs[dialogType] || dialog;
};

/**
 * 删除dialog
 * @param dialogRes 删除的dialog类型
 * @param isClearPrefabs 是否清除dialog对应的prefab
 */
DialogManager.destroyDialog = function (dialogRes, isClearPrefabs) {
    isClearPrefabs = isClearPrefabs || false;
    var createdDialogs = this.createdDialogs;
    var dialog = null;
    var dialogController = null;
    var dialogKey = null;
    if (typeof (dialogRes) === 'object'){
        dialog = dialogRes.node;
        dialogController = dialogRes;

        for (var key in createdDialogs){
            if (createdDialogs.hasOwnProperty(key)){
                if (createdDialogs[key] === dialog){
                    dialogKey = key;
                    break;
                }
            }
        }
    } else{
        dialog = createdDialogs[dialogRes] || null;

        var arr = dialogRes.split('/');
        var dialogType = arr[arr.length-1];

		if(dialog) {
			dialogController = dialog.getComponent(dialogType);
		}

        dialogKey =dialogRes;
    }
    if (!dialog){
        console.error('destroy dialog not exist:' + dialogRes);
    }
    else{
        // 删除界面
        dialog.destroy();
        dialogController.isDestroy = true;
        // 移除属性
        delete createdDialogs[dialogKey];
        if (isClearPrefabs){
            var fileName = this.uiPrefabsPath + dialogKey;
            cc.loader.releaseRes(fileName);
            delete this.loadedDialogPrefabs[dialogKey];
        }
        cc.log('destroy dialog succeed:' + dialogKey);
    }
};

DialogManager.destroyAllDialog = function(){
    cc.log('destroyAllDialog');
    for (var key in this.createdDialogs){
        if (this.createdDialogs.hasOwnProperty(key)){
            var dialog = this.createdDialogs[key];
            // 删除界面
            dialog.destroy();
            var arr = key.split('/');
            var dialogType = arr[arr.length-1];
            dialog.getComponent(dialogType).isDestroy = true;
            // 移除属性
            delete this.createdDialogs[key];
        }
    }
};

DialogManager.addLoadingCircle = function (delay){
    var self = this;
    if (!this.loadingCircleDialog){
        cc.loader.loadRes('Loading/LoadingCircleDialog', function(err, data){
            if (!err){
                self.loadingCircleDialog = cc.instantiate(data);
                self.loadingCircleDialog.parent = self.frontNode;
                self.loadingCircleDialog.zIndex = 1;
                var loadingCircleDialog = self.loadingCircleDialog.getComponent('LoadingCircleDialog');
                if (!!loadingCircleDialog) loadingCircleDialog.addLoadingCircle(delay);
            }
        });
    }
    else{
        var loadingCircleDialog = self.loadingCircleDialog.getComponent('LoadingCircleDialog');
        if (!!loadingCircleDialog) loadingCircleDialog.addLoadingCircle(delay);
    }
};

DialogManager.removeLoadingCircle = function (){
    if (!!this.loadingCircleDialog){
        var loadingCircleDialog = this.loadingCircleDialog.getComponent('LoadingCircleDialog');
        if (!!loadingCircleDialog) loadingCircleDialog.removeLoadingCircle();
    }
};

DialogManager.addPopDialog = function(content, cbOK, cbCancel, isRotate ){
    var self = this;
    if (!this.popDialog){
        cc.loader.loadRes('Pop/PopDialog', function(err, data){
            if (!err){
                self.popDialog = cc.instantiate(data);
                self.popDialog.parent = self.frontNode;
                self.popDialog.zIndex = 1;
                var popDialog = self.popDialog.getComponent('PopDialog');
                if (!!popDialog) popDialog.addPopDialog(content, cbOK, cbCancel, isRotate);
            }
        });
    }
    else{
        var popDialog = self.popDialog.getComponent('PopDialog');
        if (!!popDialog) popDialog.addPopDialog(content, cbOK, cbCancel, isRotate);
    }
};

DialogManager.removeLastPopDialog = function(){
    if (!!this.popDialog){
        var popDialog = this.popDialog.getComponent('PopDialog');
        if (!!popDialog) popDialog.removeLastPopDialog();
    }
};

DialogManager.addTipDialog = function (content, cb) {
    this.createDialog('Pop/TipDialog', {content: content, cb: cb});
};
