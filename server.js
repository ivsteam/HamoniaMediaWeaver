function resolveURL(url) {
    var isWin = !!process.platform.match(/^win/);
    if (!isWin) return url;
    return url.replace(/\//g, '\\');
}

// Please use HTTPs on non-localhost domains.
var isUseHTTPs = true;

var port = 443;

try {
    process.argv.forEach(function(val, index, array) {
        if (!val) return;

        if (val === '--ssl') {
            isUseHTTPs = true;
        }
    });
} catch (e) { console.log(' ==== error : ' + e); }

var fs = require('fs');
var path = require('path');

var ssl_key = fs.readFileSync(path.join(__dirname, resolveURL('fake-keys/privatekey.pem')));
var ssl_cert = fs.readFileSync(path.join(__dirname, resolveURL('fake-keys/certificate.pem')));
var ssl_cabundle = null;

// force auto reboot on failures
var autoRebootServerOnFailure = false;


// see how to use a valid certificate:
var options = {
    key: ssl_key,
    cert: ssl_cert, passphrase : '******',
    ca: ssl_cabundle
};

// You don't need to change anything below

//var server = require(isUseHTTPs ? 'https' : 'http');
var server = require('https');
var url = require('url');
//var ip;
function serverHandler(request, response) {


    try {
        var uri = url.parse(request.url).pathname,
            filename = path.join(process.cwd(), uri);

        if (filename && filename.search(/server.js|Scalable-Broadcast.js|Signaling-Server.js/g) !== -1) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write('404 Not Found 2---------------------: ' + path.join('/', uri) + '\n');
            response.end();
            return;
        }

        ['Video-Broadcasting', 'Screen-Sharing', 'Switch-Cameras'].forEach(function(fname) {
            if (filename && filename.indexOf(fname + '.html') !== -1) {
                filename = filename.replace(fname + '.html', fname.toLowerCase() + '.html');
				console.log("filename="+filename);
            }
        });

        var stats;
        try {
            stats = fs.lstatSync(filename);

            if (filename && filename.search(/views/g) === -1 && stats.isDirectory()) {
                if (response.redirect) {
                    response.redirect('/views/');
                } else {
                    response.writeHead(301, {
                        'Location': '/views/'
                    });
                }
                response.end();
                return;
            }
        } catch (e) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write('404 Not Found 1----------------: ' + e.message+ '\n');
            response.end();
            return;
        }

        if (fs.statSync(filename).isDirectory()) {
            response.writeHead(404, {
                'Content-Type': 'text/html'
            });
            if (filename.indexOf(resolveURL('/views')) !== -1) {
                filename = filename.replace(resolveURL('/views/'), '');
                filename = filename.replace(resolveURL('/views'), '');
                filename += resolveURL('/views/index.html');
            } else {
                filename += resolveURL('/views/index.html');
            }
        }

        var contentType = 'text/plain';
        if (filename.toLowerCase().indexOf('.html') !== -1) {
            contentType = 'text/html';
        }
        if (filename.toLowerCase().indexOf('.css') !== -1) {
            contentType = 'text/css';
        }
        if (filename.toLowerCase().indexOf('.png') !== -1) {
            contentType = 'image/png';
        }

        fs.readFile(filename, 'binary', function(err, file) {
            if (err) {
                response.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                response.write('404 Not Found 3 -----------------: ' + path.join('/', uri) + '\n');
                response.end();
                return;
            }


            response.writeHead(200, {
                'Content-Type': contentType
            });
            response.write(file, 'binary');
            response.end();
        });
    } catch (e) {
        response.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        response.write('<h1>Unexpected error:</h1><br><br>' + e.stack || e.message || JSON.stringify(e));
        response.end();
    }
}


// http -> https porwording start
var express = require('express');
var app= express();
var http_app;
var http = require('http');
var HTTP_PORT = 80;

http_app = express();
http_app.set('port', port);
var router = require('./router/index');

if (isUseHTTPs) {
    app = server.createServer(options, http_app);
}
var bodyParser = require('body-parser'); 
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');
var ejs = require('ejs');
var path = require('path');



http_app.use(express.static(path.join(__dirname, 'public')));
http_app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true
}));
http_app.use(bodyParser.json({limit: '50mb'}));
http_app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
http_app.set('view engine', 'ejs'); 
http_app.use(passport.initialize());
http_app.use(passport.session());
http_app.use(flash());
http_app.use(router);




//화이트보드] 이미지 저장
http_app.post('/cavasImgSave', function(req, res){
	
	req.session.user_id = req.body.user_id;
	req.session.name = req.body.room_name;
	
	var data_url = req.body.imgBase64;
	var matches = data_url.match(/^data:.+\/(.+);base64,(.*)$/);	///data:(.*);base64,(.*)/
	var ext = matches[1];
	var base64_data = matches[2];
	var buffer = new Buffer(base64_data, 'base64');
	var fileNm = req.body.fileNm;
	
	var filedirectory = __dirname + '/upload/' + req.session.user_id;
	
	
	try{
		fs.mkdirSync(filedirectory);
	}catch(e){ 
		if ( e.code != 'EEXIST' ) throw e; // 존재할경우 패스처리함. 
	}

	fs.writeFile(filedirectory +"/"+fileNm +'.png', buffer, function (err) {
		var resData = {}
		resData.success = 'Y';
		resData.user_id = req.session.user_id;
		resData.fileNm = fileNm;
		res.send(resData);
		console.log(err);
	});

});




//이미지 뷰어
http_app.get('/img/:path/:imgnm', function(req, res){
	console.log("path==="+  req.params.path +"=="+ req.params.imgnm);
	var filename ='pageNum1';
	var img = fs.readFileSync('./upload/' + req.params.path + '/' + req.params.imgnm +'.png');
	res.writeHead(200, {'Content-Type': 'image/png' });
	res.end(img, 'binary');
	console.log('view PNG: '+filename+'.png');
});


// translation] naver
var express = require('express');
var client_id = '*******';
var client_secret = '***************';
var request = require('request');
http_app.post('/translate', function(req, res){

	var api_url = 'https://openapi.naver.com/v1/papago/n2mt';
	var queryText = req.body.textData;
	var sourceLanguage = req.body.source;
	var targetLanguage = req.body.target;
	
	var options = {
		url: api_url,
		form: {'source': sourceLanguage, 'target': targetLanguage, 'text': queryText},
		headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
	};

	request.post(options, function (error, response, body) {

		if (!error && response.statusCode == 200) {
			var jsonData = JSON.parse(body);

			var resData = {}
			resData.success = 'Y';
			resData.translateData = jsonData.message.result.translatedText;
			res.send(resData);

		} else {
			res.status(response.statusCode).end();
			console.log('error = ' + response.statusCode);
		}
	});
});


http_app.get('/privacy', function(req, res){

	fs.readFile(__dirname + '/views/privacy.html', 'utf8', function(error, data) {  
		res.writeHead(200, {'content-type' : 'text/html'});   
		res.end(ejs.render(data, {  
			roomID : '',  
			userName : '',  
			psycare : '',
			description : 'Hello .. !'  
		}));  
	});  
});



http_app.get('/', function(req, res){


	if (/^http$/.test(req.protocol)) {
		var host = req.headers.host.replace(/:[0-9]+$/g, "");

		if ((port != null) && port !== port) {
			return res.redirect("https://" + host + ":" + port + req.url, 301);
		} else {
			return res.redirect("https://" + host + req.url, 301);
		}
	} 


	fs.readFile(__dirname + '/views/index.ejs', 'utf8', function(error, data) {  
		res.writeHead(200, {'content-type' : 'text/html'});   
		res.end(ejs.render(data, {  
			roomID : '',  
			userName : '',  
			psycare : '',
			description : 'Hello .. !'  
		}));  
	});  
});


//심리상담 접속 URL
http_app.get('/psycare', function(req, res){
	fs.readFile(__dirname + '/views/index.ejs', 'utf8', function(error, data) {  
		res.writeHead(200, {'content-type' : 'text/html'});   
		res.end(ejs.render(data, {  
			roomID : req.query.roomID,  
			userName : req.query.name,  
			psycare : "psycare",
//			isLogin : isLogin,
			description : 'Hello .. !'  
		}));  
	});  
});


function cmd_exec(cmd, args, cb_stdout, cb_end) {
    var spawn = require('child_process').spawn,
        child = spawn(cmd, args),
        me = this;
    me.exit = 0;
    me.stdout = "";
    child.stdout.on('data', function(data) {
        cb_stdout(me, data)
    });
    child.stdout.on('end', function() {
        cb_end(me)
    });
}

function log_console() {
    console.log(foo.stdout);

    try {
        var pidToBeKilled = foo.stdout.split('\nnode    ')[1].split(' ')[0];
        console.log('------------------------------');
        console.log('Please execute below command:');
        console.log('\x1b[31m%s\x1b[0m ', 'kill ' + pidToBeKilled);
        console.log('Then try to run "server.js" again.');
        console.log('------------------------------');

    } catch (e) {}
}

function runServer() {
    app.on('error', function(e) {
        if (e.code == 'EADDRINUSE') {
            if (e.address === '0.0.0.0') {
                e.address = 'localhost';
            }

            var socketURL = (isUseHTTPs ? 'https' : 'http') + '://' + e.address + ':' + e.port + '/';

            console.log('------------------------------ socketURL : ' + socketURL);
            console.log('\x1b[31m%s\x1b[0m ', 'Unable to listen on port: ' + e.port);
            console.log('\x1b[31m%s\x1b[0m ', socketURL + ' is already in use. Please kill below processes using "kill PID".');
            console.log('------------------------------');

            foo = new cmd_exec('lsof', ['-n', '-i4TCP:9001'],
                function(me, data) {
                    me.stdout += data.toString();
                },
                function(me) {
                    me.exit = 1;
                }
            );

            setTimeout(log_console, 250);
        }
    });

    app = app.listen(port, process.env.IP || '0.0.0.0', function(error) {
        var addr = app.address();

        if (addr.address === '0.0.0.0') {
            addr.address = 'localhost';
        }

        var domainURL = (isUseHTTPs ? 'https' : 'http') + '://' + addr.address + ':' + addr.port + '/';

        console.log('------------------------------ domainURL : ' + domainURL);

        console.log('socket.io is listening at:');
        console.log('\x1b[31m%s\x1b[0m ', '\t' + domainURL);

        if (!isUseHTTPs) {
            console.log('use --ssl to enable HTTPs:');
            console.log('\x1b[31m%s\x1b[0m ', '\t' + 'node server.js --ssl');
        }

        console.log('Your web-browser (HTML file) MUST set this line:');
        console.log('\x1b[31m%s\x1b[0m ', 'connection.socketURL = "' + domainURL + '";');

        if (addr.address != 'localhost' && !isUseHTTPs) {
            console.log('Warning:');
            console.log('\x1b[31m%s\x1b[0m ', 'Please set isUseHTTPs=true to make sure audio,video and screen demos can work on Google Chrome as well.');
        }

        console.log('------------------------------');
    });
    
    require('./Signaling-Server.js')(app, function(socket) {
        try {
            var params = socket.handshake.query;
            
            if (!params.socketCustomEvent) {
                params.socketCustomEvent = 'custom-message';
            }
            
            socket.on(params.socketCustomEvent, function(message) {
                try {
                    socket.broadcast.emit(params.socketCustomEvent, message);
                } catch (e) { console.log(' ==== error : ' + e); }
            });
        } catch (e) { console.log(' ==== error : ' + e); }
    });
    
    
    // http -> https porwording start
    http_app.all('/*', function(req, res, next) {
    	if (/^http$/.test(req.protocol)) {
    		var host = req.headers.host.replace(/:[0-9]+$/g, ""); // strip the port # if any

    		if ((port != null) && port !== port) {
    			return res.redirect("https://" + host + ":" + port + req.url, 301);
    		} else {
    			return res.redirect("https://" + host + req.url, 301);
    		}
    	} else {
    		return next();
    	}
    });

    http.createServer(http_app).listen(HTTP_PORT).on('listening', function() {
    	return console.log("HTTP to HTTPS redirect app launched.");
    });
}

if (autoRebootServerOnFailure) {
    // auto restart app on failure
    var cluster = require('cluster');
    if (cluster.isMaster) {
        cluster.fork();

        cluster.on('exit', function(worker, code, signal) {
            cluster.fork();
        });
    }

    if (cluster.isWorker) {
        runServer();
    }
} else {
    runServer();
}
