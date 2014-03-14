module.exports = (function() {
  var mongoose = require('mongoose') //MongoDB abstraction layer
    , _ = require('underscore') // list utility library
    , crypto = require('crypto')
    , db = require('./db')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId

    , UserSchema = new Schema({
      username : String //the user's username (uniqueness guaranteed below)
    , password : String //the user's password, hashed with SHA-1
    });

  UserSchema.statics.authenticate = function(username, password, cb) {
    var model = this;
    // look for a matching username/password combination
    model.findOne({
      username: username,
      password: User.encryptPassword(password)
    }, cb);
  };

  UserSchema.statics.encryptPassword = function(pt_password) {
    var shasum;
    if (_.isString(pt_password)) {
      shasum = crypto.createHash('sha1');
      shasum.update(pt_password);
      shasum = shasum.digest('hex');
    }
    else {
      console.log('User.encryptPassword called without pt_password!');
      shasum = null;
    }
    return shasum;
  };

  UserSchema.pre('save', function(next) {
    var user = this;
    user.password = User.encryptPassword(user.password);

    User.findOne({ username : user.username }, function(err, result) {
      if (err) {
        next(err);
      } else if (result) {
        user.invalidate('username', 'username must be unique');
        next(new Error('username must be unique'));
      } else {
        next();
      }
    });
  });

  var User = mongoose.model('User', UserSchema);

  return User;
})();