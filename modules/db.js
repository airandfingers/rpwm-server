var db_config = require('./db.config') //connection information for users-db
    , mongoose = require('mongoose') //MongoDB abstraction layer

mongoose.connect(
    'mongodb://' + db_config.DB_HOST +
    ':' + db_config.DB_PORT +
    '/' + db_config.DB_NAME,
    { user: db_config.DB_USER, pass: db_config.DB_PASSWORD}
);
mongoose.connection.on('error', function(err) { console.err(err); });