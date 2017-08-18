/**
 * ecModuleEditElement
 * Date 2017/7/6 10:21:15
 */
var express = require('express');
var router = require('express-promise-router')();
var cRequest = require("../../lib/customRequest");
var common = require("../../lib/common");
var constant = require("../../constant");
var Promise = require("bluebird");
var logger = require("../../lib/common").logger("wechatPublicPlatform");

//controller匹配前缀
var controllerPrefix = '/h/wechat/wechatPublicPlatform';
//ejs文件路径前缀
var ejsPrefix = 'wechat/wechatPublicPlatform';

/**
 * 初始化
 * 公众号只有一个，直接查询
 */
router.get('/init', function (req, res, next) {
    return Promise.try(function () {
        return cRequest.sendRequest(req, res, {
            url: constant.BASE_PATH+controllerPrefix+"/selectPublicPlatform",
            method: 'GET'
        });
    }).then(function (data) {
       logger.debug(JSON.stringify(data));
        res.render(ejsPrefix+'_edit', data);
    });
});

/**
 * 新增&更新
 */
router.post('/save', function (req, res, next) {
    return Promise.try(function () {
        var url = constant.BASE_PATH+controllerPrefix+"/update";
        var method='put';
        return cRequest.sendRequest(req, res, {
            url: url,
            method: method,
            json:true,
            body:req.body
        });
    }).then(function (data) {
       res.json(data);
    });
});

module.exports = router;
