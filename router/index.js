var express = require('express'); // express 모듈 사용하기 위함
var router = express.Router();
var path = require('path');

//var main = require('./main/main');
var email = require('./email/email');
var join = require('./join/index');
var login = require('./login/index');
var logout = require('./logout/index');
var movie = require('./movie/index');
//var influx = require('./influx/index');
//var exneo4j = require('./exneo4j/index');

// '/'로 들어오면 /public/main.html을 열어준다.
//router.get('/', function(req, res) {
//    res.render('main.ejs', {isLogin: false});
//});

//router.use('/main', main);
router.use('/email', email);
router.use('/join', join);
router.use('/login', login);
router.use('/logout', logout);
router.use('/movie', movie);
//router.use('/influx', influx);
//router.use('/exneo4j', exneo4j);

module.exports = router;

