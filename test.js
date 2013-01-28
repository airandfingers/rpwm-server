//utility libraries
var crypto = require('crypto')
  , _ = require('underscore')
//test boilerplate
  , tu = require('./modules/test_utils')
//modules being tested
  , User = require('./modules/user');

describe('User', function() {
  var user_tester = new tu.ModelTester(User);
  user_tester.testModel();
  user_tester.testSchema();
  describe('test instance', function() {
    var user_def = {
      username: 'test_user'
    , password: 'test_password'
    }, user = new User(user_def);
    before(function(done) {
      User.remove(user_def, done);
    });
    user_tester.testProperties(user, user_def);
    
    var shasum = crypto.createHash('sha1');
    shasum.update(user_def.password);
    shasum = shasum.digest('hex');
    _.extend(user_def, { password: shasum });
    
    user_tester.testSave(user);
    user_tester.testFind(user_def, user);
    user_tester.testRemove(user);
    user_tester.testFind(user_def, null);
    user_tester.testFind({ _id: user._id }, null);
  });
});