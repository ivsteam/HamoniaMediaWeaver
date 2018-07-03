module.exports = (function () {
  return {
    local: { // localhost
      host: 'localhost',
      port: '5432',
      user: 'user',
      password: 'pw',
      database: 'db',
      multipleStatements : true	
    },
    real: { // real server db info
      host: '',
      port: '',
      user: '',
      password: '!',
      database: ''
    },
    dev: { // dev server db info
      host: '',
      port: '',
      user: '',
      password: '',
      database: ''
    }
  }
})();
