var express = require('express'); // express 모듈 사용하기 위함
var router = express.Router();
var path = require('path');

router.get('/', function(req, res) {
    var id = req.user;

    console.log("id : " + id);

    if (!id) {
        res.render('main.ejs', { isLogin: false });
    }
    else {
        res.render('main.ejs', { isLogin: true } );
    }

});

module.exports = router;