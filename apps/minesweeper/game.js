module.exports = (function() {
  var mongoose = require('mongoose') //MongoDB abstraction layer
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId

    , GameSchema = new Schema({
      numRows     : Number
    , numCols     : Number
    , numMines    : Number
    , board       : Schema.Types.Mixed
    , mines       : Schema.Types.Mixed
    , cheated     : Boolean
    , result      : String
    , created_at  : { type : Date, default: Date.now } //when the game was created
    });

  GameSchema.statics.step = function(id, new_board, game_result, cb) {
    var model = this;
    model.findById(id, function(err, game) {
      if (err) { return cb(err); }
      game.set({
        board: new_board
      , result: game_result
      , modified_at: new Date()
      });
      game.save(function(err2) {
        if (err2) { cb(err2); }
        else { cb(null, game) }
      });
    });
  };

  var Game = mongoose.model('Game', GameSchema);

  return Game;
})();