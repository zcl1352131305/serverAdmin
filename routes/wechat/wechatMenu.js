/**
 * ecModuleEditElement
 * Date 2017/7/6 4:57:5
 */
var express = require('express');
var router = require('express-promise-router')();
var cRequest = require("../../lib/customRequest");
var common = require("../../lib/common");
var constant = require("../../constant");
var Promise = require("bluebird");
var logger = require("../../lib/common").logger("wechatMenu");

//controller匹配前缀
var controllerPrefix = '/h/wechat/wechatMenu';
//ejs文件路径前缀
var ejsPrefix = 'wechat/WechatMenu';

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
    //分别查询菜单信息和父级菜单信息
    return Promise.all([
         cRequest.sendRequest(req, res, {
            url: constant.BASE_PATH+controllerPrefix+"/selectById",
            qs:req.query,
            method: 'GET'
        }),
        cRequest.sendRequest(req, res, {
            url: constant.BASE_PATH+controllerPrefix+"/selectList",
            qs:{
                parent:0
            },
            method: 'GET'
        })
    ]).then(function (datas) {
        var data = datas[0];
        var data2 = datas[1];
        //判断两个任务的返回值
        if(null == data.data){
            data.data = {
                id:common.createUUID(32)
            };
        }
        data.editFlag = req.query.editFlag;
        data.initPage = common.initPage(req);
        if(data2.code == '200' && data2.data){
            data.parents = data2.data;
        }else {
            data.parents = [];
        }
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

/**
 * 发布菜单
 */
router.put('/pushMenu', function (req, res, next) {
    return Promise.try(function () {
       return cRequest.sendRequest(req, res, {
           url: constant.BASE_PATH + controllerPrefix + "/pushMenu",
           method:'put'
       });
    }).then(function (data) {
        res.json(data);
    });
});

module.exports = router;
