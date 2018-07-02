var express = require('express'); // express 모듈 사용하기 위함
var app = express();
var router = express.Router();
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var logger = require('../../log4js-utils').logger();



// Routing
router.get('/', function(req, res) {
    res.render('exneo4j.ejs'); // login.ejs 호출
});
module.exports = router;


//1 select ==================

//var neo4j = require('neo4j');
//var db = new neo4j.GraphDatabase('http://neo4j:exitem08@192.168.0.60:7474');
//db.cypher({
//    query: 'MATCH (p:Person {name: {name}}) RETURN p',
//    params: {
//        name: 'Alice',
//    },
//}, function (err, results) {
//    if (err) throw err;
//    var result = results[0];
//    if (!result) {
//        console.log('No user found.');
//    } else {
//        var user = result['p'];
//        console.log(JSON.stringify(user, null, 4));
//    }
//});

//2 create =====================
const neo4jv1 = require('neo4j-driver').v1;
const driver = neo4jv1.driver("bolt://192.168.0.60:7687", neo4jv1.auth.basic("neo4j", "exitem08"));
const session = driver.session();

const personName = 'Alice';
const resultPromise = session.run(
//  'CREATE (a:Person {name: $name, auth_type : $auth_type}  ) RETURN a',
	'CREATE (a:kind {name: $name, auth_type : $auth_type}  ) RETURN a',
  {name: 'aaa', auth_type : 'kakao'}
);

resultPromise.then(result => {
  session.close();

  const singleRecord = result.records[0];
  const node = singleRecord.get(0);

  console.log(node.properties.name);

  // on application exit:
  driver.close();
});



