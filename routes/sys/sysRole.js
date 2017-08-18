/**
 * ecModuleEditElement
 * Date 2017/6/30 11:58:51
 */
var express = require('express');
var router = require('express-promise-router')();
var cRequest = require("../../lib/customRequest");
var common = require("../../lib/common");
var logger = common.logger('sysRole');
var constant = require("../../constant");
var Promise = require("bluebird");
//controller匹配前缀
var controllerPrefix = '/h/sys/sysRole';
//ejs文件路径前缀
var ejsPrefix = 'sys/sysRole';

/**
 * 初始化
 */
router.get('/init', function (req, res, next) {
    var data = {
        initPage:common.initPage(req),
        message:'',
        code:''
    };
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
    var roleDetail ;
    return Promise.try(function () {
        return cRequest.sendRequest(req, res, {
            url: constant.BASE_PATH+controllerPrefix+"/selectById",
            qs:{
                id:req.query.id
            },
            method: 'GET'
        });
    }).then(function (data) {
        if(data.code=="200"){
            data.editFlag = req.query.editFlag;
            data.initPage = common.initPage(req);
            roleDetail = data;
            //查询用户菜单信息
            return cRequest.sendRequest(req, res, {
                url: constant.BASE_PATH+"/h/sys/sysRolePageElement/selectList",
                qs:{
                    roleId:data.data.id
                },
                method: 'GET'
            });
            

        }else {
           return Promise.reject({code:'500', msg:'服务器错误'});
        }

    }).then(function (data) {
        //用户菜单信息查询成功
        var pageElements = {};
        if(data.code == "200" && data.data.length > 0){
            var size = data.data.length;
            for(var i=0;i<size;i++){
                var pageElement = data.data[i];
                pageElements[pageElement.pageElementId] = pageElement.hasPermit.split(',');
            }
        }

        roleDetail.pageElement = pageElements;
        logger.error("----"+JSON.stringify(roleDetail));
        res.render(ejsPrefix+'_edit', roleDetail);
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
        //解析参数
        var privileges = req.body.privilege;
        var allPrivileges = [];
        if(privileges){
            var tempPrivilege = {};
            privileges.forEach(function (e, i) {
                var p = e.split(",");
                logger.info("p length: "+ p.length);
                if(p.length == 2){
                    if(tempPrivilege[p[0]]){
                        tempPrivilege[p[0]] =tempPrivilege[p[0]]+","+ p[1];
                    }else {
                        tempPrivilege[p[0]] = p[1];
                    }
                }
            });
            //生成参数
            var index = 0;
            for(var tp in tempPrivilege){
                if(!tempPrivilege.hasOwnProperty(tp)) continue;
                var record = {};
                record.roleId = req.body.id;
                record.pageElementId = tp;
                record.hasPermit = tempPrivilege[tp];
                record.id = common.createUUID(32);
                allPrivileges[index] = record;
                index ++;
            }
            logger.info("xxxxxx:  "+ JSON.stringify(allPrivileges));
        }
      
        return cRequest.sendRequest(req, res, {
            url: url,
            method: method,
            json:true,
            body:{
                id:req.body.id,
                roleName:req.body.roleName,
                sysRolePageElements:allPrivileges
            }
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
 * 查询菜单树
 */
router.get('/privilege/tree', function (req, res, next) {
   return Promise.try(function () {
       //查询所有权限
       return cRequest.sendRequest(req, res, {
           url: constant.BASE_PATH + "/h/sys/sysPageElement/selectList",
           method:'get'
       });
   }).then(function (data) {
        logger.info(JSON.stringify(data));
       var tree = [];
       if(data.code == "200"){
           data.data.forEach(function (e, i) {
               var temp = {};
               temp.id = e.id;
               temp.parent = e.parent;
               temp.name = e.title;
               tree[i] = temp;
           })
       }
       res.json(tree);
   })

});

module.exports = router;
