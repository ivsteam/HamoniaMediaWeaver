var logger = require('./log4js-utils').logger();
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
} catch (e) { logger.info(' ==== error : ' + e); }

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


var server = require('https');
var url = require('url');
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


http_app.get('/*', function(req, res){
	
	if (/^http$/.test(req.protocol)) {
		var host = req.headers.host.replace(/:[0-9]+$/g, "");
		var url = encodeURI(req.url, 'UTF-8');

		if ((port != null) && port !== port) {
			return res.redirect("https://" + host + ":" + port + url, 301);
		} else {
			return res.redirect("https://" + host + url, 301);
		}
	} 
	
	fs.readFile(__dirname + '/views/room.ejs', 'utf8', function(error, data) {
		res.writeHead(200, {'content-type' : 'text/html'});   
		res.end(ejs.render(data, {  
			roomID : '',  
			userName : '',  
			psycare : '',
			description : 'Hello .. !'  
		}));  
	});  
});


// translation] naver
var express = require('express');
var client_id = '******';
var client_secret = '*********';
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
    logger.info(foo.stdout);

    try {
        var pidToBeKilled = foo.stdout.split('\nnode    ')[1].split(' ')[0];
        logger.info('------------------------------');
        logger.info('Please execute below command:');
        logger.info('\x1b[31m%s\x1b[0m ' +  'kill ' + pidToBeKilled);
        logger.info('Then try to run "server.js" again.');
        logger.info('------------------------------');

    } catch (e) {}
}

function runServer() {
    app.on('error', function(e) {
        if (e.code == 'EADDRINUSE') {
            if (e.address === '0.0.0.0') {
                e.address = 'localhost';
            }

            var socketURL = (isUseHTTPs ? 'https' : 'http') + '://' + e.address + ':' + e.port + '/';

            logger.info('------------------------------ socketURL : ' + socketURL);
            logger.info('\x1b[31m%s\x1b[0m ' + 'Unable to listen on port: ' + e.port);
            logger.info('\x1b[31m%s\x1b[0m ' +  socketURL + ' is already in use. Please kill below processes using "kill PID".');
            logger.info('------------------------------');

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

        logger.info('------------------------------ domainURL : ' + domainURL);

        logger.info('socket.io is listening at:');
        logger.info('\x1b[31m%s\x1b[0m ' +  '\t' + domainURL);

        if (!isUseHTTPs) {
            logger.info('use --ssl to enable HTTPs:');
            logger.info('\x1b[31m%s\x1b[0m ' +  '\t' + 'node server.js --ssl');
        }

        logger.info('Your web-browser (HTML file) MUST set this line:');
        logger.info('\x1b[31m%s\x1b[0m ' +  'connection.socketURL = "' + domainURL + '";');

        if (addr.address != 'localhost' && !isUseHTTPs) {
            logger.info('Warning:');
            logger.info('\x1b[31m%s\x1b[0m ' +  'Please set isUseHTTPs=true to make sure audio,video and screen demos can work on Google Chrome as well.');
        }

        logger.info('------------------------------');
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
                } catch (e) { logger.info(' ==== error : ' + e); }
            });
        } catch (e) { logger.info(' ==== error : ' + e); }
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
    	return logger.info("HTTP to HTTPS redirect app launched.");
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
