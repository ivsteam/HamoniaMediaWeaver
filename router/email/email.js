var express = require('express'); // express 모듈 사용하기 위함
var router = express.Router();
var path = require('path');

const pg = require('pg');
var config = require('../../db_info').local;
var connection = new pg.Pool(config);

// Routing
// email_post는 포맷에 받음
router.post('/form', function(req, res) {
    // get : req.param('email')
    // res.send("welcome : " + req.body.email);
    // email.ejs를 여는데, 이 때 email에는 req.body.email의 값을 넣어서 반환한다.
    res.render('email.ejs', {'email' : req.body.email})
});

router.post('/ajax', function(req, res) {
    var email = req.body.email;
    var responseData = {};

    connection.query('select name from user where email="' + email + '"', function (err, rows) {
        if (err) throw err;

        if(rows[0]) {
            responseData.result = "ok";
            responseData.name = rows[0].name;
        }
        else {
            responseData.result = "none";
            responseData.name = "";
        }

        res.json(responseData); // 비동기라 이 블록 안에서 줘야 함
    });

});

module.exports = router;