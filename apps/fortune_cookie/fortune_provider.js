module.exports = (function() {
  var mongodb = require('mongodb')
  ,   ObjectID = mongodb.ObjectID
  ,   connection = require('./.connection')

  ,   FortuneProvider = function() {
    var db = this.db = new mongodb.Db(connection.DB_NAME,
      new mongodb.Server(connection.DB_HOST, connection.DB_PORT, {}),
      {w: 1}
    );
    db.open(function (err, db_p) {
      if (err) { throw err; }
      db.authenticate(connection.DB_USER, connection.DB_PASSWORD, function (err, replies) {
        // You are now connected and authenticated.
      });
    });
  };

  FortuneProvider.prototype.getCollection= function(callback) {
    this.db.collection('fortunes', function(error, fortune_collection) {
      if (error) callback(error);
      else callback(null, fortune_collection);
    });
  };

  FortuneProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, fortune_collection) {
      if (error) callback(error);
      else {
        fortune_collection.find().sort({_id:1}).toArray(function(error, results) {
          if (error) callback(error);
          else callback(null, results)
        });
      }
    });
  };

  FortuneProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, fortune_collection) {
      if (error) callback(error);
      else {
        fortune_collection.findOne({_id: ObjectID.createFromHexString(id)}, function(error, result) {
          if (error) callback(error);
          else callback(null, result)
        });
      }
    });
  };

  FortuneProvider.prototype.findRandom = function(callback) {
    this.getCollection(function(error, fortune_collection) {
      if (error) callback(error);
      else {
        fortune_collection.count({}, function(error, fortunes_count) {
          if (error) callback(error);
          else {
            var num_to_skip = Math.floor(Math.random() * fortunes_count);
            //console.log(num_to_skip);
            fortune_collection.find().limit(1).skip(num_to_skip).toArray(function(error, results) {
              if (error) callback(error);
              else if (results.length !== 1) callback(results.length, ' results returned by findRandom!')
              else callback(null, results[0])
            });
          }
        });
      }
    });
  };

  FortuneProvider.prototype.save = function(fortunes, callback) {
    this.getCollection(function(error, fortune_collection) {
      if (error) callback(error);
      else {
        if (typeof(fortunes.length) === "undefined")
          fortunes = [fortunes];

        for (var i = 0, max = fortunes.length; i < max; i++) {
          fortune = fortunes[i];
          fortune.created_at = new Date();
        }

        fortune_collection.insert(fortunes, {safe: true}, function() {
          callback(null, fortunes);
        });
      }
    });
  };

  FortuneProvider.prototype.remove = function(id, callback) {
    this.getCollection(function(error, fortune_collection) {
      if (error) callback(error);
      else {
        fortune_collection.remove({_id: ObjectID.createFromHexString(id)}, function(error, result) {
          if (error) callback(error);
          else callback(null, result)
        });
      }
    });
  };

  FortuneProvider.prototype.update = function(id, new_fortune, callback) {
    this.getCollection(function(error, fortune_collection) {
      if (error) callback(error);
      else {
        //console.log("Updating fortunes with id=", id, ", new_fortune=\"", new_fortune, "\"..");
        fortune_collection.findAndModify(
          {_id: ObjectID(id)},
          [['_id', 'asc']],
          {$set: {fortune: new_fortune,
                  modified_at: new Date()
          }      },
          {},
          function(error, result) {
            if (error)  callback(error);
            else        callback(null, result); }
        );
      }
    });
  };

  return FortuneProvider;
})();