/**
 * ecModuleEditElement
 * Date 2017/6/30 4:59:11
 */
var express = require('express');
var router = require('express-promise-router')();
var cRequest = require("../../lib/customRequest");
var common = require("../../lib/common");
var constant = require("../../constant");
var Promise = require("bluebird");
var logger = require("../../lib/common").logger("sysPageElement");

//controller匹配前缀
var controllerPrefix = '/h/sys/sysPageElement';
//ejs文件路径前缀
var ejsPrefix = 'sys/sysPageElement';

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
    var returnData ;
    return Promise.try(function () {
        return cRequest.sendRequest(req, res, {
            url: constant.BASE_PATH+controllerPrefix+"/selectById",
            qs:req.query,
            method: 'GET'
        });
    }).then(function (data) {
        console.log("124------"+JSON.stringify(data));
        returnData = data;
        if(null == returnData.data){
            returnData.data = {
                id:common.createUUID(32)
            };
        }
        returnData.editFlag = req.query.editFlag;
        returnData.initPage = common.initPage(req);
        return cRequest.sendRequest(req, res, {
            url: constant.BASE_PATH+controllerPrefix+"/selectList",
            qs:{},
            method: 'GET'
        });

    }).then(function(data){
        if(returnData.data.permits == null){
            returnData.data.permits= [];
        }

        returnData.menuTrees = new Array();

        data.data.forEach(function(menu){
            if(returnData.data.id != menu.id){
                if(returnData.data.parent == menu.id){
                    menu.checked = true;
                    menu.open = true;
                }
                else{
                    menu.checked = false;
                }
            }
            else{
                menu.chkDisabled=true
            }
            returnData.menuTrees.push(menu);
        });

        /*for(var i=0;i<data.data.length;i++) {
            if(returnData.data.id == data.data[i].id){
                continue;
            }

        }*/
        returnData.menuTrees.push({
            title:"显示菜单",
            id:"1",
            parent:"0"
        });
        returnData.menuTrees.push({
            title:"隐藏菜单",
            id:"2",
            parent:"0"
        });
        returnData.menuList = JSON.stringify(returnData.menuTrees);
        res.render(ejsPrefix+'_edit', returnData);
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

        var reqData = req.body;

        //设置列表权限
        if(null != req.body.permit){
            var permits = common.paramStrToArray(req.body.permit);
            var permitTypes = common.paramStrToArray(req.body.permitType)
            var permitJsonArray = new Array();
            for(var i = 0; i< permits.length;i++){
                permitJsonArray.push({
                    pageElementId:reqData.id,
                    url:permits[i],
                    type:permitTypes[i]
                });
            }
            reqData.permits = permitJsonArray;
        }

        return cRequest.sendRequest(req, res, {
            url: url,
            method: method,
            json:true,
            body:reqData
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
