//test boilerplate
var tu = require('../../modules/test_utils')
//modules being tested
  , app = require('./app')(tu.starter_app_generator)
  , Wish = require('./wish')
  , User = require('../../modules/user');

describe('wishing_well', function() {

var wish_tester = new tu.ModelTester(Wish);
describe('Wish', function() {
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

var app_tester = new tu.AppTester(app);
describe('routes', function() {
  app_tester.testGet('/', {
    navbar: true
  , banner: false
  });

  app_tester.testGet('/asdf', {
    type: 'text'
  , redirect: '/404.html'
  });

  app_tester.testGet('/view_wishes', {
    type: 'text'
  , redirect: '/login?next=/view_wishes'
  });

  describe('/wish', function() {
    var wish_def = { wish : 'test wish' };
    app_tester.testPost('/wish', wish_def, {
      describe: false
    });
    wish_tester.testFind(wish_def);
    wish_tester.testRemove(wish_def);
  });
});

});