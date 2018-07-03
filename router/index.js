var express = require('express'); // express 모듈 사용하기 위함
var router = express.Router();
var path = require('path');

var first = require('./bottom_right_main/index');
var email = require('./email/email');
var join = require('./join/index');
var login = require('./login/index');
var logout = require('./logout/index');

router.use('/bottom_right_main', first);
router.use('/email', email);
router.use('/join', join);
router.use('/login', login);
router.use('/logout', logout);

module.exports = router;

