var express = require('express'); // express 모듈 사용하기 위함
var app = express();
var router = express.Router();
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var KakaoStrategy = require('passport-kakao').Strategy;
var NaverStrategy = require('passport-naver').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var bcrypt = require('bcrypt-nodejs');
var logger = require('../../log4js-utils').logger();
const pg = require('pg');
var config = require('../../db_info').local;
var connection = new pg.Pool(config);

// Routing
router.get('/', function(req, res) {
	var msg;
	var errMsg = req.flash('error');
	if (errMsg) msg = errMsg;

	var id = req.user;
	var isLogin = false;
    if (!id) {
		isLogin = false;
    }
    else {
		isLogin = true;
    }
    
    res.render('./member/login.ejs', {'message' : msg, 'isLogin' : isLogin}); // login.ejs 호출
});

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(id, done) {
    done(null, id);
});


function loginByThirdparty(info, done) {
//	console.log("done======"+ done);

	var stmt_duplicated = 'select * from tbl_user where user_id=$1 ';
	var data = [info.auth_id];

	connection.query(stmt_duplicated, data, function (err, result) {
		if (err) {
			return done(err);
		} else {

//			logger.info("result.length ==="+ JSON.stringify(result) );
			if (result.rowCount === 0) {
				// 신규 유저는 회원 가입 이후 로그인 처리
				var query = 'insert into tbl_user ( user_id, nickname, auth_type, email) values($1, $2, $3, $4) ' ;
				
				connection.query(query, [info.auth_id, info.auth_name, info.auth_type, info.auth_email], function (err, result2) {
					if(err){
						return done(err);
					}else{
						done(null, {
							'user_id': info.auth_id,
							'nickname': info.auth_name,
							'auth_type' : info.auth_type
						});
					}
				});
			} else {
				//기존유저 로그인 처리
				console.log('Old User' + result.rows[0].user_id +"=="+ result.rows[0].nickname);
				done(null, {
					'user_id': result.rows[0].user_id,
					'nickname': result.rows[0].nickname,
					'auth_type' : result.rows[0].auth_type
				});
			}
		}
	});
}




////////////////////////////////////////////////
//	이메일, 비밀번호 로그인,
router.post('/', function(req, res, next) {
    console.log('login local');
    passport.authenticate('login-local', function(err, user, info) {
        if (err) {
            res.status(500).json(err); // 500 : Server Error
		}
        if (!user) {
            return res.status(401).json(info.message); // 401 : 권한없음
		}

        req.logIn(user, function(err) {
            if (err) return next(err);
            
            return res.json(user);
        });
    }) (req, res, next);
});

passport.use('login-local', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },

    function(req, email, password, done) {
		connection.query('select * from tbl_user where email= $1', [email], function (err, result) {
			console.log("err=="+err );
			if (err) return done(err);

			if (result.rows.length) {
				bcrypt.compare(password, result.rows[0].password, function(err, res) {
					if (res) {
//						return done(null, { 'email' : email, 'id' : result.rows[0].id });
						return done(null, { 'user_id' : result.rows[0].id , 'nickname' : result.rows[0].nickname , 'auth_type' : result.rows[0].auth_type });
					}else {
						return done(null, false, {'message' : 'Your password is incorrect'});
					}
				});
			}else {
				return done(null, false, {'message' : 'Your login info is not found'});
			}
		})
	}
));


////////////////////////////////////////////////////////////////////////////////////////
//https://developers.kakao.com/apps/201830/settings/general
// for Kakao Auth
passport.use('login-kakao', new KakaoStrategy({
        clientID : '221ab97e8df21111185a122fbc0a440f',
		clientSecret : 'DwYk6hkJB5ikTkpLgw2RNgW1bvYjzF37',
        callbackURL : '/login/oauth/kakao/callback'
    },
    function(accessToken, refreshToken, profile, done) {
		var _profile = profile._json;
		loginByThirdparty({
		  'auth_type': 'kakao',
		  'auth_id': _profile.id,
		  'auth_name': _profile.properties.nickname,
		  'auth_email': _profile.id
		}, done);
    }
));




router.get('/kakao', passport.authenticate('login-kakao'));
router.get('/oauth/kakao/callback', passport.authenticate('login-kakao', {
    successRedirect: '/',
    failureRedirect: '/'
}));

////////////////////////////////////////////////////////////////////////////////////////
var bodyParser = require('body-parser'); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

router.post('/oauth/hamonikr/callback', passport.authenticate('login-hamonikr', {failureRedirect: '/', failureFlash: true}), // 인증 실패 시 401 리턴, {} -> 인증 스트레티지
	function (req, res) {
		res.redirect('/');
	}
);


passport.use('login-hamonikr', new LocalStrategy({
        usernameField: 'id',
        passwordField: 'name',
        passReqToCallback: true
    },

    function(req, email, password, done) {
		var stmt_duplicated = 'select * from tbl_user where user_id=$1 ';
		var data = [req.body.id];

		connection.query(stmt_duplicated, data, function (err, result) {
			if (err) {
				return done(err);
			} else {

	//			logger.info("result.length ==="+ JSON.stringify(result) );
				if (result.rowCount === 0) {
					// 신규 유저는 회원 가입 이후 로그인 처리
					var query = 'insert into tbl_user ( user_id, nickname, auth_type, email) values($1, $2, $3, $4) ' ;
					
					connection.query(query, [req.body.id, req.body.name, 'hamonikr', req.body.email], function (err, result2) {
						if(err){
							return done(err);
						}else{
							done(null, {
								'user_id': req.body.id,
								'nickname': req.body.name,
								'auth_type' : req.body.auth_type
							});
						}
					});
				} else {
					//기존유저 로그인 처리
					console.log('Old User' + result.rows[0].user_id +"=="+ result.rows[0].nickname);
					done(null, {
						'user_id': result.rows[0].user_id,
						'nickname': result.rows[0].nickname,
						'auth_type' : result.rows[0].auth_type
					});
				}
			}
		});
	}
));




////////////////////////////////////////////////////////////////////////////////////////
//https://developers.naver.com/apps
// for Naver Auth
passport.use('login-naver', new NaverStrategy({
//		clientID : 'lXcYqHZGWz8A0zEy5_00',
//		clientSecret : '0HejW2Rynn',
        clientID : '3waik800SSUnar7dVamk',
		clientSecret : 'wG1_yTjwQU',
        callbackURL : '/login/oauth/naver/callback'
    },
    function(accessToken, refreshToken, profile, done) {
		process.nextTick(function () {
			// data to be saved in DB
	
			console.log("profile.displayName=="+ profile.displayName);
			console.log("profile.emails[0].value==="+ profile.emails[0].value);
			console.log("profile._json==="+ profile._json);
	
//			user = {
//				name: profile.displayName,
//				email: profile.emails[0].value,
//				username: profile.displayName,
//				provider: 'naver',
//				naver: profile._json
//			};
//			return done(null, profile);
	
			var _profile = profile._json;
			loginByThirdparty({
				'auth_type': 'naver',
				'auth_id': _profile.id,
				'auth_name': _profile.nickname,
				'auth_email': _profile.email
			}, done);
	
		});
	}
));


router.get('/naver', passport.authenticate('login-naver'));
router.get('/oauth/naver/callback', passport.authenticate('login-naver', {
    successRedirect: '/',
    failureRedirect: '/'
//	failureRedirect: '/'
}));



////////////////////////////////////////////////////////////////////////////////////////
//https://developers.facebook.com/apps
// for facebook Auth
passport.use('login-facebook', new FacebookStrategy({
//		clientID : '244239102977944',
//		clientSecret : '5525a20d2764a6f5181086f84e000249',
        clientID : '192538538067835',
		clientSecret : 'd092ebeefcf9f08068eab400bbebc0c3',
        callbackURL : 'https://localhost/login/oauth/facebook/callback'
    },
    function(accessToken, refreshToken, profile, done) {
		process.nextTick(function () {
			// data to be saved in DB
	
			console.log("profile.displayName=="+ profile.displayName);
			console.log("profile.id==="+ profile.id);
			console.log("profile.username==="+ profile.username);
	
		console.log("profile._json=="+ JSON.stringify(profile._json));
			var _profile = profile._json;
			loginByThirdparty({
				'auth_type': 'facebook',
				'auth_id': _profile.id,
				'auth_name': _profile.name
//				'auth_email': _profile.email
			}, done);
	
		});
	}
));


router.get('/facebook', passport.authenticate('login-facebook'));
router.get('/oauth/facebook/callback', passport.authenticate('login-facebook', {
    successRedirect: '/',
    failureRedirect: '/'
//	failureRedirect: '/'
}));



////////////////////////////////////////////////////////////////////////////////////////
//https://console.developers.google.com/apis
// for google Auth
passport.use('login-google', new GoogleStrategy({
        clientID : '1032950526761-m7sg19smer4ea3gd2k83ok63j6q9s56q.apps.googleusercontent.com',
		clientSecret : 'EtYuXGTnS7mUQ8cf9W-aFZi-',
        callbackURL : '/login/oauth/google/callback',
		scope: ['https://www.googleapis.com/auth/plus.me']

    },
    function(accessToken, refreshToken, profile, done) {
		process.nextTick(function () {
			// data to be saved in DB
	
			console.log("profile.displayName=="+ profile.displayName);
			console.log("profile.id==="+ profile.id);
			console.log("profile.username==="+ profile.username);
			
			var _profile = profile._json;
			loginByThirdparty({
				'auth_type': 'google',
				'auth_id': _profile.id,
				'auth_name': _profile.displayName
//				'auth_email': _profile.email
			}, done);
		});
	}
));


router.get('/google', passport.authenticate('login-google'));
router.get('/oauth/google/callback', passport.authenticate('login-google', {
    successRedirect: '/',
    failureRedirect: '/'
//	failureRedirect: '/'
}));



module.exports = router;
