//test boilerplate
var tu = require('../../modules/test_utils')
//modules being tested
  , app = require('./app')(tu.starter_app_generator)
  , Wish = require('./wish')
  , User = require('../../modules/user');

describe('wishing_well', function() {

describe('app', function() {
  var app_tester = new tu.AppTester(app);
  app_tester.testHtmlGet('/', {
    navbar: true
  , banner: false
  });

  app_tester.testHtmlGet('/view_wishes', {
    type: 'text'
  , redirect: '/login\\?next=/view_wishes'
  });

  app_tester.testHtmlGet('/asdf', {
    type: 'text'
  , redirect: '/404.html'
  });
});

describe('Wish', function() {
  var wish_tester = new tu.ModelTester(Wish);
  wish_tester.testModel();
  wish_tester.testSchema();
  describe('wish with user', function() {
    var wish_def = {
        wish: 'test wish',
        user: new User({
          username: 'test_user',
          password: 'test_password'
        })._id
      }, wish = new Wish(wish_def);
    before(function(done) {
      Wish.remove(wish_def, done);
    });
    wish_tester.testProperties(wish, wish_def);
    wish_tester.testSave(wish);
    wish_tester.testFind(wish_def, wish);
    wish_tester.testRemove(wish);
    wish_tester.testFind(wish_def, null);
    wish_tester.testFind({ _id: wish._id }, null);
  });
  describe('wish without user', function() {
    var wish_def = {
        wish: 'test wish',
      }, wish = new Wish(wish_def);
    before(function(done) {
      Wish.remove(wish_def, done);
    });
    wish_tester.testProperties(wish, wish_def);
    wish_tester.testSave(wish);
    wish_tester.testFind(wish_def, wish);
    wish_tester.testRemove(wish);
    wish_tester.testFind(wish_def, null);
    wish_tester.testFind({ _id: wish._id }, null);
  });
});

});