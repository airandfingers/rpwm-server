var db_config = require('./db.config') //connection information for users-db
  , mongoose = require('mongoose') //MongoDB abstraction layer
  , MongoStore = require('connect-mongodb') //used as our session store
  , mongodb = require('mongodb');

mongoose.connect(
  'mongodb://' + db_config.DB_HOST +
  ':' + db_config.DB_PORT +
  '/' + db_config.DB_NAME,
  { user: db_config.DB_USER, pass: db_config.DB_PASSWORD }
);
mongoose.connection.on('error', function(err) { console.error(err); });

var server_config = new mongodb.Server(db_config.DB_HOST, db_config.DB_PORT, {
    auto_reconnect: true
  , native_parser: true
  }
)
  , db = new mongodb.Db(db_config.DB_NAME, server_config, { w: -1 });

var session_store = new MongoStore({
  db: db
, username: db_config.DB_USER
, password: db_config.DB_PASSWORD
});

module.exports = {
  TEST_USERNAME: db_config.TEST_USERNAME
, TEST_PASSWORD: db_config.TEST_PASSWORD
, session_store: session_store
, SESSION_SECRET: db_config.SESSION_SECRET
}