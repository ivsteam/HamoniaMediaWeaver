module.exports = (function () {
  return {
    local: { // localhost
      host: '52.231.15.128',
      port: '5432',
      user: 'ivs01',
      password: 'exitem08EXITEM)*',
      database: 'hamonia',
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
