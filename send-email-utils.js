const email_address = 'your_gmail_address@gmail.com';
const email_password = 'your_gmail_password';


//email
const smtpTransport = require('nodemailer-smtp-transport') 
const nodemailer = require('nodemailer');
const moment = require('moment');


exports.sendEmailFnt = function(err, logger, errLogger, title, callback){
	//메일 발송 설정
	var transporter = nodemailer.createTransport(smtpTransport({
		host: 'smtp.gmail.com', 
		port: 465, 
		secure: true,
		service: 'gmail',
		auth: {
			user: email_address,
			pass: email_password
		},
		tls: { rejectUnauthorized: false }
	}));
	
	// 메일 설정
	var errMessage = null;
	var errStack = null;
	
	if(err && err.message) errMessage = err.message;
	if(err && err.stack) errStack = err.stack;
	
	var mailOptions = {
		from: 'Hamonia <' + email_address + '>',
		to: email_address,
		subject: '[' + title + '] ' + errMessage,
		text: '['+(moment().format('YYYY-MM-DD HH:mm:ss'))+'] [ERROR] ' + title + ' ' + errStack
	};
	
	// 메일 발송
	transporter.sendMail(mailOptions, function(error, info){
		if (error) {
			errLogger.error('[ERROR] email ' + errStack);
		} else {
			logger.info('Email sent: ' + info.response);
		}
		
		if(callback) callback();
	});
}