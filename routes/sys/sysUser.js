/**
 * ecModuleEditElement
 * Date 2017/6/27 3:38:2
 */
var express = require('express');
var router = require('express-promise-router')();
var cRequest = require("../../lib/customRequest");
var common = require("../../lib/common");
var constant = require("../../constant");
var Promise = require("bluebird");
var logger = require("../../lib/common").logger("sysUser");

//controller匹配前缀
var controllerPrefix = '/h/sys/sysUser';
//ejs文件路径前缀
var ejsPrefix = 'sys/sysUser';


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
    var returnData;
    return Promise.try(function () {
        return cRequest.sendRequest(req, res, {
            url: constant.BASE_PATH+controllerPrefix+"/selectById",
            qs:req.query,
            method: 'GET'
        });
    }).then(function (data) {

        if('200' == data.code){
            if(null == data.data){
                data.data = {
                    id:common.createUUID(32)
                };
            }
            if(null == data.data.roles){
                data.data.roles = [];
            }
            if(null == data.data.headImgFile){
                data.data.headImgFile = [];
            }
            data.editFlag = req.query.editFlag;
            data.initPage = common.initPage(req);
            returnData = data;

            return  cRequest.sendRequest(req, res, {
                url: constant.BASE_PATH+"/h/sys/sysRole/selectList",
                method: 'GET'
            });
        }else {
            return Promise.reject({code:'500', msg:'服务器错误'});
        }
    }).then(function (data) {
        if(data.code == "200"){
            returnData.selectRoles = data.data;
        }
        else{
            return Promise.reject({code:'500', msg:'服务器错误'});
        }
            console.log("userInfo---" + JSON.stringify(returnData));
            res.render(ejsPrefix + '_edit', returnData);

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

        //头像图片上传（单图片）
        var reqData = req.body;
        var headImgGroup = reqData.headImgGroup;
        if(headImgGroup != null){
            reqData.headImgFile = common.parseFilesToJsonArray(headImgGroup);
        }

        var roles = new Array();
        var addRoles = common.paramStrToArray(reqData.addRoles);
        if(addRoles != null ){
            addRoles.forEach(function (roleID) {
                var role = {
                    id:roleID
                }
                roles.push(role);
            });
            reqData.roles = roles;
        }
        reqData.addRoles = null;
        logger.debug("======="+ JSON.stringify(reqData));
        if(reqData.deptId){
            var deptIdStr = "";
            for(var i=0;i<reqData.deptId.length;i++){
                deptIdStr += reqData.deptId[i]+","
            }
            reqData.deptId = deptIdStr;
        }
        return cRequest.sendRequest(req, res, {
            url: url,
            method: method,
            body:reqData,
            json:true
        });
    }).then(function (data) {
        console.log(JSON.stringify(data));
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
