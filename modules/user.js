module.exports = (function() {
  var mongoose = require('mongoose') //MongoDB abstraction layer
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId

    , _ = require('underscore') // list utility library
    , crypto = require('crypto')
    
    , GuestCounter = require('./guest_counter')

    , db = require('./db')

    , UserSchema = new Schema({
      username: { type: String, unique: true } //the user's username
    , password: String //the user's password, hashed with SHA-1
    });

    // static methods - Model.method()
  UserSchema.statics.createUser = function(spec, cb) {
    var username = spec.username
      , pt_password = spec.pt_password
      , error;
    console.log('createUser called for', spec);
    if (_.escape(username) !== username) {
      error = 'The following characters are not allowed in usernames: & < > " \' /';
    }
    else if (User.isGuest(username)) {
      error = 'non-guest usernames may not begin with "guest"!';
    }
    else if (! _.isString(pt_password)) {
      error = 'User.createUser called without pt_password!';
    }
    if (error) {
      console.error(error);
      return cb(error);
    }

    spec.password = User.encryptPassword(pt_password);
    delete spec.pt_password;

    var user = new User(spec);
    console.log('created user with', spec, user);
    user.save(function(save_err, result) {
      if (save_err) {
        error = 'Error during save: ' + save_err;
      }
      cb(error);
    });
  };

  UserSchema.statics.createGuestUser = function(cb) {
    GuestCounter.increment(function (increment_err, guest_num) {
      if (increment_err) {
        console.error('Error during GuestCounter.increment:', increment_err);
        return cb(increment_err);
      }
      var username = 'guest' + guest_num
        , user = new User({ username: username });
      console.log('Created guest user:', user);
      cb(null, user);
    });
  };

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

  UserSchema.statics.isGuest = function(username) {
    return username.substring(0, 5) === 'guest';
  };

  UserSchema.statics.getByIdWithoutPassword = function(id, cb) {
    User.findOne({ _id: id }, { password: false }, cb);
  };

  // instance methods - document.method()
  UserSchema.methods.convertFromGuest = function(spec, cb) {
    var self = this
      , username = spec.username
      , pt_password = spec.pt_password
      , keys = _.keys(spec)
      , error;
    console.log('convertFromGuest called for', username);

    if (! User.isGuest(self.username)) {
      error = 'User.convertFromGuest called for non-guest user! ' + username;
    }
    else if (! _.isString(username)) {
      error = 'User.convertFromGuest called without username!';
    }
    else if (_.escape(username) !== username) {
      error = 'The following characters are not allowed in usernames: & < > " \' /';
    }
    else if (User.isGuest(username)) {
      error = 'non-guest usernames may not begin with "guest"!';
    }
    else if (! _.isString(pt_password)) {
      error = 'User.convertFromGuest called without pt_password!';
    }
    if (error) {
      console.error(error);
      return cb(error);
    }

    // encrypt pt_password and save it as password
    spec.password = User.encryptPassword(pt_password);
    delete spec.pt_password;
    
    console.log('updating user with', spec);
    _.extend(self, spec);
    self.save(function(update_err, result) {
      console.log('update callback called with', update_err, result);
      if (update_err) {
        error = 'Error in User.convertFromGuest: ' + update_err.message;
        console.error(error);
      }
      cb(error);
    });
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