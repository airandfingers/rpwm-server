//test boilerplate
var tu = require('../../modules/test_utils')
//modules being tested
  , app = require('./app')(tu.starter_app_generator)
  , Game = require('./game');

describe('minesweeper', function() {

describe('app', function() {
  var app_tester = new tu.AppTester(app);
  app_tester.testHtmlGet('/', {
    navbar: true
  , banner: false
  });
});

describe('Game', function() {
  var game_tester = new tu.ModelTester(Game);
  game_tester.testModel();
  game_tester.testSchema();
  describe('test instance', function() {
    var game_def = {
      numRows: 10
    , numCols: 10
    , numMines: 100
    //, board: {} //doesn't work - Mixed type "eats" {}s
    //, mines: {} //see https://github.com/LearnBoost/mongoose/issues/848
    , cheated: true
    }, game = new Game(game_def);
    before(function(done) {
      Game.remove(game_def, done);
    });
    game_tester.testProperties(game, game_def);
    game_tester.testSave(game);
    game_tester.testFind(game_def, game);
    game_tester.testRemove(game);
    game_tester.testFind(game_def, null);
    game_tester.testFind({ _id: game._id }, null);
  });
});

});