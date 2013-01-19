module.exports = (function() {
  var db_config = require('./db.config') //connection information for users-db
    , mongoose = require('mongoose') //MongoDB abstraction layer
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId

    , UserSchema = new Schema({
      username        : String //the user's username
    , password        : String //the user's password, hashed with SHA-1
    })

    , User = mongoose.model('User', UserSchema);

    mongoose.connect(
      'mongodb://' + db_config.DB_HOST +
      ':' + db_config.DB_PORT +
      '/' + db_config.DB_NAME,
      { user: db_config.DB_USER, pass: db_config.DB_PASSWORD}
    );
    mongoose.connection.on('error', function(e, r, a, b, c) { console.log(e, r, a, b, c); });

  return User;
})();