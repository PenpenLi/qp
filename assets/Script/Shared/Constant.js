/**
 * Created by zjgame on 2017/2/26.
 */

require('./../Shared/utils');
let Constant = module.exports = {};

//Constant.AccountHost = 'server.juxianyule.com';//外网测试服
Constant.AccountHost = 'server.java1234.cn';//外网测试服
// Constant.AccountHost = '127.0.0.1';//本地测试
// Constant.AccountHost = '192.168.1.238';//suyongfu
Constant.AccountPort = 11011;                                                     //登录端口
Constant.httpRequestIP = Constant.AccountHost;                                    //http转发服务器，通常和游戏服务器在一台机器上
// Constant.httpRequestPort = 80;                                                  //http转发服务器端口
Constant.httpRequestPort = 3002;                                                  //http转发服务器端口
Constant.storeImgIP = 'http://{0}:3001/'.format(Constant.AccountHost);            //商城图片地址，通常和游戏服务器在一台机器上
// Constant.storeImgIP = 'http://wx.java1234.cn/';                                  //商城图片地址，通常和游戏服务器在一台机器上
// Constant.storeImgIP = 'http://wx.juxianyule.com/';                              //商城图片地址，通常和游戏服务器在一台机器上

//公众号appID
Constant.wxAppID = '';


Constant.ServerConnected = 1;
Constant.ServerClosed = 2;

//游戏的类型ID定义
Constant.gameNotOpen                  = 0;//游戏未开放；

// 游戏全局参数
// Constant.PORTARIT = true;                                   // 是否使用竖版


//kind为0的游戏为未开放；
Constant.gameTypesConf = [
    // {kind: Constant.gameTypeAB, name:"顺宝", imgName:"303", roomCard: false}
];

Constant.TITLE = {
    STORE: '商城',
    HALL: '游戏大厅',
    GAME: '游戏中'
};

Constant.ListMaxItem = 10;//各种列表中最大显示数目

//密保问题
Constant.Questions = {
    Q1: [
        '您父亲的姓名是？',
        '您母亲亲的姓名是？',
        '您父亲的生日是？',
        '您母亲的生日是？',
    ],

    Q2: [
        '您小时候最好的朋友是？',
        '您小时候的别名是？',
        '您的小学校名是？',
        '您的中学校名是？',
    ],

    Q3: [
        '您的出生地是？',
        '您的第一个网名是？',
        '您最想做的工作是？',
        '您最喜欢的食物是？',
    ]
};
