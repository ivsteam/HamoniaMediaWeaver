var express = require('express'); // express 모듈 사용하기 위함
var router = express.Router();
var path = require('path');

// DATABASE SETTING
// Change to Google Cloud Database
//var connection = mysql.createConnection({
//
//    host     : 'localhost',
//    port     : '3306',
//    user     : 'root',
//    password : '1234',
//    database : 'test'
//});

const { Pool, Client } = require('pg')

const connection = new Pool({
  user: 'ivs',
  host: '52.231.15.128',
  database: 'hamonia',
  password: 'exitem08',
  port: 5432,
})
connection.connect();

router.get('/list', function(req, res) {
    res.render('movie.ejs');
});

// 1. /movie, GET
router.get('/', function(req, res) {
    var responseData = {};

    connection.query('select title from movie', function (err, rows) {
        if (err) throw err;

        if(rows.length) {
            responseData.result = 1;
            responseData.data = rows;
        }
        else {
            responseData.result = 0;
        }

        res.json(responseData); // 비동기라 이 블록 안에서 줘야 함
    })
});

// 2. /movie, POST
router.post('/', function(req, res) {
    var title = req.body.title;
    var type = req.body.type;
    var grade = req.body.grade;
    var actor = req.body.actor;


    var sql = {title, type, grade, actor};

    connection.query('insert into movie set ?', sql, function (err, rows) {
        if (err) throw err;
        return res.json({'result': 1});
    });
});


// 3. /movie/:title, GET
router.get('/:title', function(req, res) {
    var title = req.params.title;
    var responseData = {};

    connection.query('select title from movie', function (err, rows) {
        if (err) throw err;

        if(rows[0]) {
            responseData.result = 1;
            responseData.data = rows;
        }
        else {
            responseData.result = 0;
        }

        res.json(responseData); // 비동기라 이 블록 안에서 줘야 함
    })
});

// 4. /movie/:title, DELTE
router.get('/:title', function(req, res) {
    var title = req.params.title;

    var responseData = {};

    connection.query('delete from movie where title =?', [title], function (err, rows) {
        if (err) throw err;

        if(rows.affectedRows > 0) {
            responseData.result = 1;
            responseData.data = title;
        }
        else {
            responseData.result = 0;
        }

        res.json(responseData); // 비동기라 이 블록 안에서 줘야 함
    })
});

module.exports = router;