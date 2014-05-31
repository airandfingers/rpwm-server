//test boilerplate
var tu = require('../../modules/test_utils')
//modules being tested
  , app = require('./app')(tu.starter_app_generator);

describe('portal', function() {

describe('routes', function() {
  var app_tester = new tu.AppTester(app);
  app_tester.testGet('/home', {
    navbar: true
  , banner: true
  });

  app_tester.testGet('/about', {
    navbar: true
  , banner: true
  });

  app_tester.testGet('/contact', {
    navbar: true
  , banner: true
  });

  app_tester.testGet('/asdf', {
    type: 'text'
  , redirect: '/404.html'
  });
});

});