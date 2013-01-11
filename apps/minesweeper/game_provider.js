module.exports = (function() {
  var mongodb = require('mongodb')
  ,   _ = require('underscore')
  ,   ObjectID = mongodb.ObjectID
  ,   connection = require('./.connection')

  ,   GameProvider = function(host, port) {
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

  GameProvider.prototype.getCollection= function(callback) {
    this.db.collection('games', function(error, game_collection) {
      if (error) callback(error);
      else callback(null, game_collection);
    });
  };

  GameProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, game_collection) {
      if (error) callback(error);
      else {
        game_collection.findOne({_id: ObjectID.createFromHexString(id)}, function(error, game) {
          if (error) callback(error);
          else if (game == null) callback("Game not found!");
          else callback(null, game);
        });
      }
    });
  };

  GameProvider.prototype.save = function(games, callback) {
    this.getCollection(function(error, game_collection) {
      if (error) callback(error);
      else {
        if (typeof(games.length) === "undefined")
          games = [games];

        for (var i = 0, max = games.length; i < max; i++) {
          game = games[i];
          game.created_at = new Date();
        }

        game_collection.insert(games, {safe: true}, function() {
          callback(null, games);;
        });
      }
    });
  };

  GameProvider.prototype.step = function(id, new_board, game_result, callback) {
    this.getCollection(function(error, game_collection) {
      if (error) callback(error);
      else {
        game_collection.findAndModify(
          {_id: ObjectID(id)},
          [['_id', 'asc']],
          {$set: {board: new_board,
                  result: game_result,
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

  GameProvider.prototype.update = function(id, update_obj, callback) {
    this.getCollection(function(error, game_collection) {
      if (error) callback(error);
      else {
        game_collection.findAndModify(
          {_id: ObjectID(id)},
          [['_id', 'asc']],
          {$set: _.extend(update_obj, {modified_at: new Date()})},
          {},
          function(error, result) {
            if (error)  callback(error);
            else        callback(null, result); }
        );
      }
    });
  };

  GameProvider.prototype.remove = function(id, callback) {
    this.getCollection(function(error, game_collection) {
      if (error) callback(error);
      else {
        game_collection.remove({_id: ObjectID.createFromHexString(id)}, function(error, result) {
          if (error) callback(error);
          else callback(null, result);
        });
      }
    });
  };

  GameProvider.prototype.removeAll = function(callback) {
    this.getCollection(function(error, game_collection) {
      if (error) callback(error);
      else {
        game_collection.remove({}, function(error, result) {
          if (error) callback(error);
          else callback(null, result);
        });
      }
    });
  };

  /*Get and modify a tile in one step
  GameProvider.prototype.step = function(id, row, col, callback) {
    console.log("Stepping on board with id=%s, location %d,%d", id, row, col);
    this.getCollection(function(error, game_collection) {
      if (error) callback(error)
      else {
        //console.log("Updating games with id=", id, ", new_game=\"", new_game, "\"..");
        var visited_key = 'board.' + row + '.' + col + '.visited'
        , visited_at_key = visited_key + '_at'
        , set_object = {}
        set_object[visited_key] = true;
        set_object[visited_at_key] = new Date();
        //console.log(set_object);

        game_collection.findAndModify(
          {_id: id},
          [['_id', 'asc']],
          {$set: set_object},
          {new: true, safe: true},
          function(error, game) {
            if (error)  callback(error);
            else if (game == null) callback("Game not found!");
            else callback(null, game.board[row][col]);
        });
      }
    });
  };
  */

  return GameProvider;
})();