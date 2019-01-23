var messageCallback = module.exports = {};
//添加监听
messageCallback.addListener = function (route, handler) {
    this.handlers = this.handlers || [];

    var handlers = this.handlers[route] || null;
    if (!!handlers){
        var isHandlerExist = false;
        for (var i in handlers){
            if (handlers.hasOwnProperty(i) && (handlers[i] === handler)){
                isHandlerExist = true;
                break;
            }
        }
        if (!isHandlerExist){
            handlers.push(handler);
        }
    }
    else{
        handlers = [];
        handlers.push(handler);
        this.handlers[route] = handlers;
    }
};
//移除监听
messageCallback.removeListener = function (route, handler) {
    this.handlers = this.handlers || [];
    var handlers = this.handlers[route] || null;
    if (!!handlers){
        for (var i = 0; i < handlers.length; ++i){
            if (handlers[i] === handler){
                handlers.splice(i,1);
                break;
            }
        }
    }
};
//广播消息
messageCallback.emitMessage = function (route, msg) {
    this.handlers = this.handlers || [];

    var handlers = this.handlers[route] || [];
    if (!!handlers){
        var handlersTemp = handlers.slice();
        for (var i in handlersTemp){
            if (handlersTemp.hasOwnProperty(i) && !!handlersTemp[i].messageCallbackHandler && !handlersTemp[i].isDestroy){
                handlersTemp[i].messageCallbackHandler(route, msg);
            }
        }
    }
};