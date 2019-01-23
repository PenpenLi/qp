var CSV = require("csv.min");

var StaticData = module.exports = {};

StaticData.loadCSV = function(key, fileName, cb) {
    cc.loader.loadRes(fileName, function(err, data){
        if (!!err){
            console.log("load CSV file error:" + fileName);
        }
        else{
            // 解析csv并存储在StaticData中
            var dataArr = new CSV(data, { header: true }).parse();
            var keyDataArr = StaticData[key] = {};
            for (var i = 0; i < dataArr.length; ++i){
                var dataItem = dataArr[i];
                keyDataArr[dataItem.ID] = dataItem;
            }
        }

        // 释放资源
        cc.loader.releaseRes(fileName);

        if (!!cb) cb(err);
    });
};

// 初始化CSV数据
StaticData.init = function(cb){
    var csvArr = ["Texts", "Globals"];
    var allCount = csvArr.length;
    var count = 0;
    var callBack = function(err){
        if (!!err){
            console.error('load static data error');
        }
        else{
            count++;
            var per = count/allCount;
            cb(err, per);
        }
    };
    for (var i = 0; i < allCount; ++i){
        StaticData.loadCSV(csvArr[i], "CSV/" + csvArr[i], callBack);
    }
};