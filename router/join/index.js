var express = require('express'); // express 모듈 사용하기 위함
var router = express.Router();
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');

// DATABASE SETTING (Google Cloud SQL)
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

// Routing
router.get('/', function(req, res) {
    var msg;
    var errMsg = req.flash('error');

    if (errMsg) msg = errMsg;

    res.render('./member/join.ejs', {'message' : msg});
});

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    done(null, id);
});

// 성공했을때 리다이렉트 시키는 부분
router.post('/', passport.authenticate('join-local', {
    successRedirect: '/login',
    failureRedirect: '/join',
    failureFlash: true
}));

passport.use('join-local', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, email, password, done) {

        connection.query('select * from tbl_user where email=$1', [email], function (err, rows) {
            if (err) { return done(err); }

            if (rows.length) {
                return done(null, false, {message: 'your email is already used'});
            }
            else {
                bcrypt.hash(password, null, null, function(err, hash) {
                    var sql = [email, hash, email, 'email'];
                    connection.query('insert into tbl_user ( email, password, nickname, auth_type) values($1, $2, $3, $4) RETURNING email, id ', sql, function (err, result) {
                        if (err) throw err;
						console.log("rows=="+ JSON.stringify(rows));
						console.log("rows=="+ result.rows[0].email);
						console.log("rows=="+ result.rows[0].id);
                        return done(null, { 'email' : result.rows[0].email, 'id' : result.rows[0].id});
                    });
                });
            }
        })
    }
));

module.exports = router;