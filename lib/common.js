/**
 * Created by Administrator on 2017/6/22 0022.
 */
var log4js = require('log4js');

exports.publicHeaders=function(req){
    return {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        "X-Auth-Token": req.cookies.XAuthToken
    }
};

exports.createUUID=function uuid(len) {
    radix = 16;
    var chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;

    if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
        // rfc4122, version 4 form
        var r;

        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random()*16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }

    return uuid.join('');
};

exports.initPage = function(req){
    var initPage = req.query.initPage;
    if(null == initPage || ''==initPage){
        initPage = req.body.initPage;
    }
    if(null == initPage || ''==initPage){
        initPage = 1;
    }
    return initPage;
};

//日志管理
exports.logger=function(name){
    var logger = log4js.getLogger(name);
    logger.setLevel("DEBUG");
    return logger;
};

//字符串强制为数组
exports.paramStrToArray = function(data){
    if(typeof data == 'string'){
        return [data];
    }
    else{
        return data;
    }
}

//字符串对象强制为数组
exports.paramJsonToArray = function(data){
    if(null != data && "" != data){
        if(typeof data == 'string'){
            return [JSON.parse(data)];
        }
        else{
            var s = new Array();
            for(var i = 0; i< data.length; i++){
                s += JSON.parse(data[i]);
            }
            return s;
        }
    }
    else{
        return "";
    }
}

//文件上传，转为单文件对象
exports.parseFilesToJson = function (data){
    if(typeof data == 'string'){
        return  JSON.parse(data);
    }
    else{
        return JSON.parse(data[data.length-1]);
    }
}

//文件上传，转为多文件对象
exports.parseFilesToJsonArray = function (data){
    if(typeof data == 'string'){
        return  [JSON.parse(data)];
    }
    else{
        var a = [];
        for(var i=0 ;i<data.length;i++){
            a.push(JSON.parse([data[i]]));
        }
        return a;
    }
}