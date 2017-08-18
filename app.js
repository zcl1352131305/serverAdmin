var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cluster = require('cluster');
var log4js = require('log4js');
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});
var url = require('url');
var constant = require('./constant');
var moment = require('moment');
log4js.configure({
    appenders: [
        { type: 'console' },{
            type: 'file',
            filename: 'logs/access.log',
            maxLogSize: 1024,
            backups:2,
            category: 'normal'
        }
    ],
    replaceConsole: true
});
var logger = require("./lib/common").logger('normal');

//系统
var index = require('./routes/index');
var users = require('./routes/sys/sysUser');
var roles = require('./routes/sys/sysRole');
var sysPageElement = require('./routes/sys/sysPageElement');
var sysDictionary = require('./routes/sys/sysDictionary');
var fileUpload = require('./routes/file/fileUpload');

//微信
var wechatPublicPlatform = require("./routes/wechat/wechatPublicPlatform");
var wechatUserInfo = require('./routes/wechat/wechatUserInfo');
var wechatMenu = require("./routes/wechat/wechatMenu");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(log4js.connectLogger(logger));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static( path.join(__dirname, 'public')));

//系统
app.use('/', index);
app.use('/sys/sysUser', users);
app.use("/sys/sysRole", roles);
app.use('/file/fileUpload', fileUpload);
app.use("/sys/sysPageElement", sysPageElement);
app.use("/sys/sysDictionary",sysDictionary);

//微信
app.use("/wechat/wechatPublicPlatform",wechatPublicPlatform);
app.use("/wechat/wechatUserInfo",wechatUserInfo);
app.use("/wechat/wechatMenu", wechatMenu);

//反向代理 所有在/proxy/下的路由将被拦截
app.use('/proxy/**', function (req, res) {
    var pathname = url.parse(req.originalUrl).pathname;
    logger.debug(constant.BASE_PATH+ pathname);
    proxy.web(req, res, { target: constant.BASE_PATH+ pathname });
});

////////////////////


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    console.log("404 error");
    var err = new Error('Not Found');
    err.status = 404;
    res.status(404);
    res.render("error/404",{});
    //next(err);
});

//数据格式化
app.locals.myDateFormat = function(date){
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
};



module.exports = app;

