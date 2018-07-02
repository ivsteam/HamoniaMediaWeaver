const pg = require('pg');
var config = require('./db_info').local;
//module.exports = function () {
//  return {
//    init: function () {
////      return pg.createConnection({
////        host: config.host,
////        port: config.port,
////        user: config.user,
////        password: config.password,
////        database: config.database
////      })
////    },
////    test_open: function (con) {
////      con.connect(function (err) {
////        if (err) {
////          console.error('db connection error :' + err);
////        } else {
////          console.info('db is connected successfully.');
////        }
////      })
//    }
//  }
//};

//const { Pool, Client } = require('pg')
//
//const client = new Pool({
//	host: config.host,
//        port: config.port,
//        user: config.user,
//        password: config.password,
//        database: config.database,
//  port: 5432
//})