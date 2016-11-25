var db_config = require('./db.config') //connection information for users-db
  , mongoose = require('mongoose') //MongoDB abstraction layer
  , express = require('express')
  , MongoStore = require('connect-mongo')(express); //used as our session store

mongoose.connect(
  'mongodb://' + db_config.DB_HOST +
  ':' + db_config.DB_PORT +
  '/' + db_config.DB_NAME,
  { user: db_config.DB_USER, pass: db_config.DB_PASSWORD }
);
mongoose.connection.on('error', function(err) { console.error(err); });

var session_store = new MongoStore({ mongooseConnection: mongoose.connection });

module.exports = {
  TEST_USERNAME: db_config.TEST_USERNAME
, TEST_PASSWORD: db_config.TEST_PASSWORD
, session_store: session_store
, SESSION_SECRET: db_config.SESSION_SECRET
};