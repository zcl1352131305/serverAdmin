var express = require('express');
var router = require('express-promise-router')();
var cRequest = require("../lib/customRequest");
var constant = require("../constant");
var Promise = require("bluebird");
var logger = require("../lib/common").logger("index");


/* GET home page. */
router.get('/', function (req, res, next) {
    return Promise.all([
         cRequest.sendRequest(req, res, {
            url: constant.BASE_PATH+"/h/home"+"/index",
            method: 'GET'
        }),
        cRequest.sendRequest(req, res, {
            url: constant.BASE_PATH+"/h/home"+"/userInfo",
            method: 'GET'
        })
    ]).then(function (datas) {
        var data = datas[0];
        data.userInfo = datas[1];
        console.log("menu--"+JSON.stringify(data));
        res.render('index', data);
    });

});


router.get('/home', function (req, res, next) {
   res.render('home');
});

/**
 * 登录页引导
 */
router.get('/login', function (req, res, next) {
    var redirectUrl = req.query.redirect_url;
    return Promise.try(function () {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        
       // var redirectUrl = req.query.redirect_url;
        //尝试获取token，用以判断用户是否已经登录
        var token = req.cookies.XAuthToken;
        if (token) {
            logger.info("token存在");
            //校验token有效性
            var options = {
                url: constant.TOKEN_VERIFY,
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Accept-Charset': 'utf-8'
                },
                form: {
                    token: token,
                    ip: ip.replace("::ffff:", "")
                }
            };
            return cRequest.sendRequest(req, res, options);
        } else {
            logger.info('token 不存在');
            res.clearCookie('XAuthToken', {path: '/'});
            res.render('login', {redirectUrl: redirectUrl, loginUrl: constant.SYSTEM_INDEX + "/login"});
            return Promise.reject({
                status: 601
            });
        }
    }).then(function (data) {
        logger.debug("token校验结果：" + JSON.stringify(data));
        logger.debug("token 解析成功");
        if (data.code == "200" && data.data.isOK) {
            //已登录，跳转至来时页面
            if (redirectUrl) {
                res.redirect(redirectUrl);
            } else {
                res.redirect(constant.SYSTEM_INDEX);
            }
        } else {
            res.clearCookie('XAuthToken', {path: '/'});
            res.render('login', {redirectUrl: redirectUrl, loginUrl: constant.SYSTEM_INDEX + "/login"});
        }
    });

});

/**
 * 获取登录token
 */
router.get("/login/token", function (req, res, next) {
    return Promise.try(function () {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        var options = {
            url: constant.LOGIN_TOKEN_URL,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Accept-Charset': 'utf-8',
                'X-Real-IP': ip.replace("::ffff:", "")
            }
        };
        return cRequest.sendRequest(req, res, options);
    }).then(function (data) {
        logger.error(JSON.stringify(data));
        if (data.code == "200") {
            res.json(data);
        } else {
            var err = {code: 500};
            res.json(err);
        }
    })
});

router.get("/err", function (req, res) {
    return Promise.try(function () {
        throw new Error('something bad happened');
    }).then(function (newValue) {
        res.send("Done!");
    });
});


/**
 * 登录操作，获取表单信息，验证用户名密码
 */
router.route('/loginSys').post(function (req, res) {
    var options = {
        url: constant.LOGIN_URL,
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8'
        },
        form: {
            password: req.body.password,
            timestamp: req.body.timestamp,
            userName: req.body.userName,
            loginToken: req.body.loginToken
        }
    };
    return Promise.try(function () {
        return cRequest.sendRequest(req, res, options);
    }).then(function (data) {
        var code = data.code;
        logger.debug("系统登录结果：  " + JSON.stringify(data));
        if (code == "200") {
            data.redirectUrl = constant.SYSTEM_LOGIN_CONFIRM+"?ticket="+data.data.ticket;
            /*if (req.body.redirectUrl) {
                //TODO 存在重定向时，需要配置各系统登录确认接口
                res.redirect(constant.SYSTEM_LOGIN_CONFIRM + "?redirectUrl=" + req.body.redirectUrl + "&ticket="
                    + data.data.ticket);
            } else {
                //不存在重定向链接，进入本系统
                res.redirect(constant.SYSTEM_LOGIN_CONFIRM + "?redirectUrl=" + req.body.redirectUrl + "&ticket="
                    + data.data.ticket);
            }
            return;*/
        }
       // res.render('login', {redirectUrl: req.body.redirectUrl, loginUrl: constant.SYSTEM_INDEX + "/login", data:data});
        res.json(data);
    });
});


/**
 * 登录确认
 * 获取到ticket后，请求token
 */
router.get('/confirmLogin', function (req, res) {
    var ticket = req.query.ticket;
    if (ticket && ticket != "") {
        //尝试获取token
        var options = {
            url: constant.GET_TOKEN_URL,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Accept-Charset': 'utf-8'
            },
            qs: {
                ticket: ticket
            }
        };

        return Promise.try(function () {
            return cRequest.sendRequest(req, res, options);
        }).then(function (data) {
            var redirectUrl = req.query.redirectUrl;
            logger.debug("token获取结果：  " + JSON.stringify(data));
            if (data.code == "200") {
                res.cookie("XAuthToken", data.data.token, {httpOnly: true});
                if (redirectUrl) {
                    res.redirect(redirectUrl);
                } else {
                    //不存在重定向链接，进入本系统主页
                    res.redirect(constant.SYSTEM_INDEX);
                }
            } else {
                res.redirect(constant.LOGIN_URL);
            }
        });

        /*cRequest.sendRequest(req, res, options, function (err, resp, data) {
         //var data = JSON.parse(body);
         var redirectUrl = req.query.redirectUrl;
         console.log("token获取结果：  " + JSON.stringify(data));
         if (data.code == "200") {
         res.cookie("XAuthToken", data.data.token);
         if (redirectUrl) {
         res.redirect(redirectUrl);
         } else {
         //不存在重定向链接，进入本系统主页
         res.redirect(constant.SYSTEM_INDEX);
         }
         } else {
         res.redirect("http://127.0.0.1:3000/login");
         }
         });*/

    }

});

router.get("/logout", function (req, res) {
    res.clearCookie('XAuthToken', {path: '/'});
    res.render('login', {loginUrl : constant.LOGIN_URL, redirectUrl:""});
});


router.get('/getRole', function (req, res) {
    logger.debug("/getRole  cookie : " + req.cookies.XAuthToken);
    var options = {
        url: constant.BASE_PATH + "/h/sysRole/selectPage",
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8',
            "X-Auth-Token": req.cookies.XAuthToken
        }
    };
    cRequest.sendRequest(req, res, options, function (err, resp, body) {
        res.send(body);
    })

});


module.exports = router;
