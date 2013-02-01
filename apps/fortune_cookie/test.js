//test boilerplate
var tu = require('../../modules/test_utils')
//modules being tested
  , app = require('./app')(tu.starter_app_generator)
  , Fortune = require('./fortune');

describe('fortune_cookie', function() {

var fortune_tester = new tu.ModelTester(Fortune);
describe('Fortune', function() {
  fortune_tester.testModel();
  fortune_tester.testSchema();
  describe('test instance', function() {
    var fortune_def = {
        fortune: 'test fortune'
      }, fortune = new Fortune(fortune_def);
    before(function(done) {
      Fortune.remove(fortune_def, done);
    });
    fortune_tester.testProperties(fortune, fortune_def);
    fortune_tester.testSave(fortune);
    fortune_tester.testFind(fortune_def, fortune);
    fortune_tester.testRemove(fortune);
    fortune_tester.testFind(fortune_def, null);
    fortune_tester.testFind({ _id: fortune._id }, null);
  });
  describe('findRandom', function() {
    it('should find a Fortune', function(done) {
      Fortune.findRandom(function(err, fortune) {
        if (err) { done(err); }
        else {
          tu.should.exist(fortune);
          fortune.should.be.an.instanceof(Fortune);
          done();
        }
      });
    });
  });
});

var app_tester = new tu.AppTester(app);
describe('routes', function() {
  app_tester.testGet('/', {
    navbar: true
  , banner: true
  });

  app_tester.testGet('/fortune_teller', {
    navbar: true
  , banner: true
  });

  describe('/new_fortune', function() {
    var fortune_def = { fortune : 'test fortune' };
    app_tester.testPost('/new_fortune', fortune_def, {
      describe: false
    , redirect: '/'
    });
    fortune_tester.testFind(fortune_def);
    fortune_tester.testRemove(fortune_def);
  });

  app_tester.testGet('/fortune_cookie', {
    navbar: true
  , banner: true
  });

  app_tester.testGet('/view_fortunes', {
    navbar: true
  , banner: true
  });

  app_tester.testGet('/view_fortunes.json', {
    type: 'json'
  , navbar: false
  , banner: false
  });

  app_tester.testGet('/manage_fortunes', {
    type: 'text'
  , redirect: '/login?next=/manage_fortunes'
  });

  app_tester.testGet('/asdf', {
    type: 'text'
  , redirect: '/404.html'
  });
});

});