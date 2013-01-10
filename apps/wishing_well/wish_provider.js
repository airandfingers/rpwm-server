module.exports = (function() {
  var mongodb = require('mongodb')
  ,   ObjectID = mongodb.ObjectID

  ,   WishProvider = function() {
    var db = this.db = new mongodb.Db('nodejitsu_airandfingers_nodejitsudb7948049551',
      new mongodb.Server('ds043937.mongolab.com', 43937, {}), 
      {w: 1}
    );
    db.open(function (err, db_p) {
      if (err) { throw err; }
      db.authenticate('nodejitsu_airandfingers', 'lhr2gt3oghbmc4ql40n2tbqs3e', function (err, replies) {
        // You are now connected and authenticated.
      });
    });
  };

  WishProvider.prototype.getCollection = function(callback) {
    this.db.collection('wishes', function(error, wish_collection) {
      //console.log('collection returns:', error, wish_collection);
      if (error) callback(error);
      else callback(null, wish_collection);
    });
  };

  WishProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, wish_collection) {
      if (error) callback(error);
      else {
        wish_collection.find().sort({_id:1}).toArray(function(error, results) {
          //console.log('find returns:', error, results);
          if (error) callback(error);
          else callback(null, results)
        });
      }
    });
  };

  WishProvider.prototype.save = function(wishes, callback) {
    this.getCollection(function(error, wish_collection) {
      if (error) callback(error);
      else {
        if (typeof(wishes.length) === "undefined")
          wishes = [wishes];

        for (var i = 0, max = wishes.length; i < max; i++) {
          wish = wishes[i];
          wish.created_at = new Date();
        }

        wish_collection.insert(wishes, {safe: true}, function(err, results) {
          //console.log('insert returns:', err, results);
          callback(null, wishes);
        });
      }
    });
  };

  return WishProvider;
})();