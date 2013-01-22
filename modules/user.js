module.exports = (function() {
  var db_config = require('./db.config') //connection information for users-db
    , mongoose = require('mongoose') //MongoDB abstraction layer
    , crypto = require('crypto')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId

    , UserSchema = new Schema({
      username        : String //the user's username
    , password        : String //the user's password, hashed with SHA-1
    });

  mongoose.connect(
    'mongodb://' + db_config.DB_HOST +
    ':' + db_config.DB_PORT +
    '/' + db_config.DB_NAME,
    { user: db_config.DB_USER, pass: db_config.DB_PASSWORD}
  );
  mongoose.connection.on('error', function(e, r, a, b, c) { console.log(e, r, a, b, c); });

  UserSchema.statics.authenticate = function(username, password, cb) {
    var model = this,
        shasum = crypto.createHash('sha1');
    shasum.update(password);
    shasum = shasum.digest('hex');
    // look for a matching username/password combination
    model.findOne({
      username: username,
      password: shasum
    }, function(err, result) {
      if (err) cb(error);
      else cb(null, result)
    });
  };

  UserSchema.pre('save', function(next) {
    var user = this,
        shasum = crypto.createHash('sha1');
    shasum.update(user.password);
    shasum = shasum.digest('hex');
    user.password = shasum;

    User.findOne({username : user.username}, function(err, result) {
        if (err) {
            next(err);
        } else if(result) {
            user.invalidate("username", "username must be unique");
            next(new Error("username must be unique"));
        } else {
            next();
        }
    });
  });

  var User = mongoose.model('User', UserSchema);

  return User;
})();