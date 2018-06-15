var express = require('express'); // express 모듈 사용하기 위함
var app = express();
var router = express.Router();
var path = require('path');
var mysql = require('mysql');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var KakaoStrategy = require('passport-kakao').Strategy;
var NaverStrategy = require('passport-naver').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var bcrypt = require('bcrypt-nodejs');
var logger = require('../../log4js-utils').logger();






//const Influx = require('influxdb-nodejs');
//const client = new Influx('http://192.168.0.60:8086/testdb');
//client.query('http')
//  .where('spdy', '1')
//  .where('method', ['GET', 'POST'])
//  .where('use', 300, '>=')
//  .then(console.info)
//  .catch(console.error);
////////// => influx ql: select * from "http" where "spdy" = '1' and "use" >= 300 and ("method" = 'GET' or "method" = 'POST')

//
const Influx = require('influxdb-nodejs');
const client = new Influx('http://192.168.0.60:8086/testdb');
function loginStatus(account, ip, type) {
  client.write('login')
    .tag({
      type,  
    })
    .field({
      account,
      ip,  
    })
    .queue();
  if (client.writeQueueLength >= 10) {
    client.syncWrite()
      .then(() => console.info('sync write queue success'))
      .catch(err => console.error(`sync write queue fail, ${err.message}`));
  }
}
 

 client.query('http')
  .addFunction('max', 'use')
  .addGroup('type')
  .subQuery()
  .addFunction('sum', 'max')
  .then((data) => {
    // { name: 'http', columns: [ 'time', 'sum' ], values: [ [ '1970-01-01T00:00:00Z', 904 ] ] }
    console.info(data.results[0].series[0]);
  }).catch(console.error);

setInterval(() => {
  loginStatus('vicanso', '127.0.0.1', 'vip2');
}, 5000);

//
// Routing
router.get('/', function(req, res) {

    res.render('influx.ejs'); // login.ejs 호출
});





module.exports = router;