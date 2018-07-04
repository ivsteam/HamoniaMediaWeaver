const log4js = require('log4js');
log4js.configure(
  {
    appenders: {
      file: {
        type: 'file',
        filename: './log/AppLogFile.log',
        maxLogSize: 1024*1024*10 ,
        numBackups: 10, // keep five backup files
        compress: true, // compress the backups
        encoding: 'utf-8',
        mode: 0o0640,
        flags: 'w+'
      },
      dateFile: {
        type: 'dateFile',
        filename: './log/more-AppLogFile.log',
        pattern: 'yyyy-MM-dd-hh',
        compress: true
      },
      out: {
        type: 'stdout'
      }
    },
    categories: {
      default: { appenders: ['file', 'dateFile', 'out'], level: 'debug' }
    }
  }
);

const logger = log4js.getLogger('normal');


exports.logger = function(){
	var logger = log4js.getLogger('normal');
/*	logger.debug('debug');
	logger.info('info');
	logger.error('error');
	logger.fatal('fatal');
	logger.trace('trace');
*/
    return logger;
}
