var express = require('express'); // express 모듈 사용하기 위함
var router = express.Router();
var path = require('path');

router.get('/', function(req, res) {
    var id = req.user;
    var user_id;
    var nickname;
    var auth_type;
    
    if(id && id.user_id) user_id = id.user_id;
    if(id && id.nickname) nickname = id.nickname;
    if(id && id.auth_type) auth_type = id.auth_type;

    if (!id) {
        res.render('./member/bottom_right_main.ejs', { isLogin: false , nickname : '' , auth_type : ''});
    }
    else {
        res.render('./member/bottom_right_main.ejs', { isLogin: true , nickname : nickname , auth_type : auth_type} );
    }

});

module.exports = router;