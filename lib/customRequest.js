/**
 * Created by lhl on 2017/06/16.
 * http请求发起
 * 拦截授权跳转
 */
var request = require("request");
var Promise = require("bluebird");
var constant = require("../constant");
var logger = require("./common").logger('customRequest');

/*exports.sendRequest = function (req, res, option, callback) {
 request(option, function (err, resp, body) {
 if(err){
 //出错将返回，由外部调用方法处理
 callback(err, resp, body);
 return;
 }
 console.log(body);
 var data = JSON.parse(body);
 if (data.code == "401") {
 //未授权，引导至认证中心
 res.clearCookie('XAuthToken', { path: '/' });
 res.redirect("http://127.0.0.1:3000/login");
 } else if (data.status == "403" || data.code=="403") {
 res.send("您未被授权访问此页");
 }
 else {
 callback(err, resp, data);
 }
 });
 };*/

exports.sendRequest = function (req, res, option) {
    option.headers = {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        "X-Auth-Token": req.cookies.XAuthToken
    };
    return new Promise(function (resolve, reject) {
        request(option, function (err, resp, body) {
            if (err) {
                logger.error('sendRequest err ' + err);
                reject(err);
            }else  if(!body){
                logger.error("后台无返回数据");
                reject({code:'500', msg:'服务器错误'});
            }
            else {
                var data;
                console.log(data);
                if(body instanceof Object){
                    data = body;
                }else {
                    data = JSON.parse(body);
                }
                if (data.code == "401") {
                    logger.debug("token认证失败");
                    //未授权，引导至认证中心
                    res.clearCookie('XAuthToken', {path: '/'});
                    res.redirect(constant.SYSTEM_INDEX + "/login");
                    reject({
                        status: 601
                    });
                } else if (data.status == "403" || data.code == "403") {
                    res.status(403);
                    res.send("您未被授权访问此页");
                    reject({
                        status: 601
                    });
                } else {
                    //后台路径
                    data.basePath = constant.BASE_PATH;
                    resolve(data);
                }
            }
        });
    })
};