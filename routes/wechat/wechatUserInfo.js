/**
 * ecModuleEditElement
 * Date 2017/7/6 3:37:29
 */
var express = require('express');
var router = require('express-promise-router')();
var cRequest = require("../../lib/customRequest");
var common = require("../../lib/common");
var constant = require("../../constant");
var Promise = require("bluebird");
var logger = require("../../lib/common").logger("wechatUserInfo");

//controller匹配前缀
var controllerPrefix = '/h/wechat/wechatUserInfo';
//ejs文件路径前缀
var ejsPrefix = 'wechat/wechatUserInfo';

/**
 * 初始化
 */
router.get('/init', function (req, res, next) {
    var data = {
        initPage:common.initPage(req),
        message:'',
        code:''
    }
    res.render(ejsPrefix, data);
});

/**
 * 列表
 */
router.get('/list', function (req, res, next) {
    return Promise.try(function () {
        return  cRequest.sendRequest(req, res, {
            url: constant.BASE_PATH+controllerPrefix+"/selectPage",
            qs:req.query,
            method: 'GET'
        });
    }).then(function (data) {
        res.render(ejsPrefix+'_list', data.data);
    });
});

/**
 * 编辑
 */
router.get('/edit', function (req, res, next) {
    return Promise.try(function () {
        return cRequest.sendRequest(req, res, {
            url: constant.BASE_PATH+controllerPrefix+"/selectById",
            qs:req.query,
            method: 'GET'
        });
    }).then(function (data) {
        if(null == data.data){
            data.data = {
                id:common.createUUID(32)
            };
        }
        data.editFlag = req.query.editFlag;
        data.initPage = common.initPage(req);
        res.render(ejsPrefix+'_edit', data);
    });
});

/**
 * 新增&更新
 */
router.post('/save', function (req, res, next) {
    return Promise.try(function () {
        var url = "";
        var method="";
        if("add" == req.body.editFlag){
            url = constant.BASE_PATH+controllerPrefix+"/add";
            method = 'post';
        }
        else{
            url = constant.BASE_PATH+controllerPrefix+"/update";
            method = 'put';
        }
        return cRequest.sendRequest(req, res, {
            url: url,
            method: method,
            json:true,
            body:req.body
        });
    }).then(function (data) {
        data.initPage = common.initPage(req);
        res.render(ejsPrefix, data);
    });
});

/**
 * 逻辑删除
 */
router.get('/delete', function (req, res, next) {
    return Promise.try(function () {
        return cRequest.sendRequest(req, res, {
            url: constant.BASE_PATH+controllerPrefix+"/delete",
            qs:{
                id:req.query.id,
                delFlag:'1'
            },
            method: 'delete'
        });
    }).then(function (data) {
        res.json( data);
    });
});

module.exports = router;
