var express = require('express'); // express 모듈 사용하기 위함
var app = express();


const { Pool, Client } = require('pg')

const connection = new Pool({
  user: 'ivs01',
  host: '52.231.15.128',
  database: 'hamonia',
  password: 'exitem08EXITEM)*',
  port: 5432,
})



//connection.connect();