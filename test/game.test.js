//test boilerplate
var tu = require('./test_utils')
//modules being tested
  , db = require('../modules/db')
  , Game = require('../apps/minesweeper/game');

describe('Game', function() {
  var game_doc = {
      numRows: 10
    , numCols: 10
    , numMines: 100
    , board: {}
    , mines: {}
    , cheated: true
  }, game_docs = [game_doc];
  tu.testModel(Game, game_docs);
});