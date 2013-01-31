//test boilerplate
var tu = require('../../modules/test_utils')
//modules being tested
  , app = require('./app')(tu.starter_app_generator)
  , Fortune = require('./fortune');

describe('fortune_cookie', function() {

describe('app', function() {
  var app_tester = new tu.AppTester(app);
  app_tester.testHtmlGet('/', {
    navbar: true
  , banner: true
  });

  app_tester.testHtmlGet('/fortune_teller', {
    navbar: true
  , banner: true
  });

  app_tester.testHtmlGet('/fortune_cookie', {
    navbar: true
  , banner: true
  });

  app_tester.testHtmlGet('/view_fortunes', {
    navbar: true
  , banner: true
  });

  app_tester.testHtmlGet('/manage_fortunes', {
    type: 'text'
  , redirect: '/login\\?next=/manage_fortunes'
  });

  app_tester.testHtmlGet('/asdf', {
    type: 'text'
  , redirect: '/404.html'
  });
});

describe('Fortune', function() {
  var fortune_tester = new tu.ModelTester(Fortune);
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

});