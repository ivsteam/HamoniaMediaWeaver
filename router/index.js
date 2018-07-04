var express = require('express'); // express 모듈 사용하기 위함
var router = express.Router();
var path = require('path');

var first = require('./bottom_right_main/index');

router.use('/bottom_right_main', first);

module.exports = router;

