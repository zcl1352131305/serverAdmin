/**
 * ecModuleEditElement
 * Date 2017/6/27 3:38:2
 */
var express = require('express');
var router = require('express-promise-router')();
var constant = require("../../constant");
var formidable = require('formidable');
var fs = require('fs');
var logger = require("../../lib/common").logger("index");

function makeDir(path){
    var paths = path.split("/");
    for(var i = 1;i<paths.length;i++){
        var path1 = "";
        for (var j = 1;j<=i;j++){
            path1 += "/"+ paths[j]
        }
        if(!fs.existsSync(path1)){
            console.log(i+"---"+path1);
            fs.mkdirSync(path1);
        }
    }
}


router.post('/upload', function(req, res) {
    var date = new Date();
    var lastPath = date.getFullYear()+((date.getMonth()+1)>10?(date.getMonth()+1):("0"+(date.getMonth()+1)))+(date.getDate()>10?date.getDate():("0"+date.getDate())) + "";
    var realPath = constant.PROJECT_ROOT_FOLDER + constant.UPLOAD_ROOT_FOLDER + "n4/" + lastPath ;
    var pictPath = "../" + constant.UPLOAD_ROOT_FOLDER + "n4/" + lastPath;

    makeDir(constant.PROJECT_ROOT_FOLDER + constant.UPLOAD_ROOT_FOLDER + "n4/" + lastPath );
    makeDir(constant.PROJECT_ROOT_FOLDER + constant.UPLOAD_ROOT_FOLDER + "n3/" + lastPath );
    makeDir(constant.PROJECT_ROOT_FOLDER + constant.UPLOAD_ROOT_FOLDER + "n2/" + lastPath );
    makeDir(constant.PROJECT_ROOT_FOLDER + constant.UPLOAD_ROOT_FOLDER + "n1/" + lastPath );




    var form = new formidable.IncomingForm();   //创建上传表单
    form.encoding = 'utf-8';		//设置编码
    form.uploadDir = pictPath;	 //设置上传目录
    form.keepExtensions = true;	 //保留后缀
    //form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小

    form.parse(req, function(err, fields, files) {
        console.log("-----------------"+JSON.stringify(fields));
        console.log("-----------------"+JSON.stringify(files));
        if (err) {
            res.locals.error = err;
            res.json({data: "上传失败！" });
            return;
        }

        var extName = "";  //后缀名


        var avatarName = Math.random() + '.' + extName;
        var newPath = form.uploadDir + avatarName;

        var file = {
            fileName:fields.name,
            fileUrl:files.file.path.replace(/\\/g, "/").replace("../public", ""),
            idUpload:fields.id,
            size:files.file.size
        }
        console.log(JSON.stringify(file));


        res.locals.success = '上传成功';
        res.json({fileData: JSON.stringify(file) });
    });


});


module.exports = router;