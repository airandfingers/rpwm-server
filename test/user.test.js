//test boilerplate
var tu = require('./test_utils')
//modules being tested
  , db = require('../modules/db')
  , User = require('../modules/user');

describe('User', function() {
  var user_doc = {
    username: 'test_user',
    password: 'test_password'
  }, user_docs = [user_doc];
  tu.testModel(User, user_docs);
});