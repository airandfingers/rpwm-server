//test boilerplate
var tu = require('./test_utils')
//modules being tested
  , db = require('../modules/db')
  , Wish = require('../apps/wishing_well/wish')
  , User = require('../modules/user');

describe('Wish', function() {
  var user_wish_doc = {
    wish: 'test wish',
    user: new User({
      username: 'test_user',
      password: 'test_password'
    })._id
  }, anonymous_wish_doc = {
    wish: 'test wish'
  }, wish_docs = [user_wish_doc, anonymous_wish_doc];
  tu.testModel(Wish, wish_docs);
});