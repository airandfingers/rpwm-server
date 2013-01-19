module.exports = function(app) {
  var _ = require('underscore')
  , util = require('util')
  , Game = require('./game')
  , LOSS = "LOSS"
  , WIN = "WIN"
  , numRows = 8 //default to be overriden if resuming a game
  , numCols = 8 //default to be overriden if resuming a game
  , numMines = 10; //default to be overriden if resuming a game

  app.get('/', function(req, res) {
    console.log('index called!');
    var id = req.session.game_id;
    if (id !== undefined) {
      Game.findById(id, function(error, result) {
        if (error) console.error(error);
        var visited;
        numRows = result.numRows;
        numCols = result.numCols;
        numMines = result.numMines;
        if (result.result === undefined || result.result === null) {
          //resume an unfinished game
          var board = result.board
          , i
          , j
          , cell;
          delete result.board;
          console.log('Resuming game...\nMetadata:\n', result);
          console.log('Board:');
          console.log(util.inspect(board, false, null));
          //populate visited - an object containing the contents
          //of those spaces that have been stepped on
          visited = {};
          for (i = 0; i < numRows; i++) {
            for (j = 0; j < numCols; j++) {
              cell = board[i][j];
              if (cell.visited !== undefined) {
                if (visited[i] === undefined) visited[i] = {};
                visited[i][j] = cell.contents;
              }
            }
          }
          console.log("About to render index with: ",
            {title: 'Minesweeper!', numRows: numRows, numCols: numCols,
            numMines: numMines, visited: visited, board_contents_only: false});
          res.render('index', {
            title: 'Minesweeper!',
            numRows: numRows,
            numCols: numCols,
            numMines: numMines,
            visited: visited,
            board_contents_only: false
          });
        }
        else {
          console.log('game_id %s refers to a finished game with result %s!', id, result.result);
          console.log("Rendering a new game...");
          res.render('index', {
            title: 'Minesweeper!',
            numRows: numRows,
            numCols: numCols,
            numMines: numMines,
            visited: undefined, //undefined => new game
            board_contents_only: false
          });
        }
      });
    }
    else {
      console.log("Rendering a new game...");
      res.render('index', {
        title: 'Minesweeper!',
        numRows: numRows,
        numCols: numCols,
        numMines: numMines,
        visited: undefined, //undefined => new game
        board_contents_only: false
      });
    }
  });
  
  app.post('/new_game', function(req, res, next) {
    console.log('new_game called!');
    var numRows = req.body.numRows
    , numCols = req.body.numCols
    , numMines = req.body.numMines
    //which row and column the user's initial step is at (if any)
    , row = req.body.row
    , col = req.body.col
    , board = []
    , tiles = []
    , mines = {}
    , i, j, k, max
    , initialIndex
    , randomIndex
    , nextMineIndex, nextMineRow, nextMineCol
    , currentRow, currentCol, currentVal
    , reveal;

    //TODO: Error-checking on values
    console.log('numRows=%d, numCols=%d, numMines=%d, row=%d, col=%d',
                numRows, numCols, numMines, row, col);
    //populate board with all zeroes
    for (i = 0; i < numRows; i++) {
      board[i] = [];
      for (j = 0; j < numRows; j++) {
        board[i][j] = {contents: 0};
      }
    }
    //(Note: a tile's "index" = [tile's row number]*[number of columns]+[tile's column number])
    //calculate the index of the initial step (if any)
    if (row !== undefined && col !== undefined) {
      initialIndex = row * numCols + Number(col);
      if (_.isNaN(initialIndex)) {
        console.error('Invalid row %s or col %s!', row, col);
        initialIndex = undefined;
      }
    }
    //populate tiles with an entry for each tile
    for (i = 0, max = numRows * numCols; i < max; i++) {
      tiles.push(i);
    }
    //remove the index of the initial step, if any (no mines there)
    if (initialIndex !== undefined) {
      console.log("Removing index %d from tiles", initialIndex);
      tiles = _.without(tiles, initialIndex);
    }

    //randomly lay the mines
    for (i = 0; i < numMines; i++) {
      //choose a random number between 0 and tiles.length - 1
      randomIndex = Math.floor(Math.random() * (tiles.length));
      //get the chosen index from tiles (and remove it)
      nextMineIndex = tiles.splice(randomIndex, 1);
      //calculate the tile's row and column number from its index
      nextMineRow = Math.floor(nextMineIndex / numCols);
      nextMineCol = nextMineIndex % numCols;
      //"lay" the mine
      board[nextMineRow][nextMineCol].contents = -1;
      if (mines[nextMineRow] === undefined) mines[nextMineRow] = {};
      mines[nextMineRow][nextMineCol] = -1;

      for (j = -1; j <= 1; j++) {
        currentRow = nextMineRow + j;
        if (currentRow == -1 || currentRow == numRows) continue;
        for (k = -1; k <= 1; k++) {
          if (j === 0 && k === 0) continue;
          currentCol = nextMineCol + k;
          if (currentCol == -1 || currentCol == numCols ) continue;
          currentVal = board[currentRow][currentCol].contents;
          if (currentVal === -1) {
            continue;
          }
          else {
            board[currentRow][currentCol].contents = currentVal + 1;
          }
        }
      }
    }
    if (initialIndex !== undefined) {
      var step_result = step(board, row, col);
      //console.log("Initial step result is ", step_result);
      reveal = step_result.reveal;
    }

    new Game({numRows: numRows, numCols: numCols, numMines: numMines, board: board, mines: mines})
      .save(function(err, game) {
      if (err) { return next(err); }
      var game_id = game._id;
      console.log("Game saved: ", game);
      req.session.game_id = game_id;
      console.log("About to render index with: ",
                  {title: 'Minesweeper!', numRows: numRows, numCols: numCols,
                  numMines: numMines, visited: reveal, board_contents_only: true, layout: false});
      res.render('index',
      {title: 'Minesweeper!', numRows: numRows, numCols: numCols,
       numMines: numMines, visited: reveal, board_contents_only: true, layout: false});
    });
  });

  app.post('/step', function(req, res, next) {
    console.log('step called!');
    var row = req.body.row
    , col = req.body.col
    , cell_contents
    , response = {}
    , board
    , step_result
    , response;
    var id = req.session.game_id;
    if (id === undefined) {
      console.error("req.session.game_id is undefined!");
      res.json({ error: "req.session.game_id is undefined!" });
    }
    else {
      Game.findById(id, function(err, result) {
        if (err) { return next(err); }
        board = result.board;
        //perform the step using our helper function below
        step_result = step(board, row, col);
        //console.log("step_result is ", step_result);
        //send the newly-revealed cells to the browser
        response = {reveal: step_result.reveal, result: step_result.result};
        console.log("response is ", response);
        res.json(response);
        //update the game board in the database
        Game.step(id, step_result.board, step_result.result,
                            function(err, result) {
          if (err) console.error(err);
        });
      });
    }
  });
  //helper function - performs a step, returning a reveal object and
  //the modified board. called by both the step and new_game routes
  var step = function(board, row, col) {
    var cell = board[row][col]
    , cell_contents = cell.contents
    , reveal = {}
    , result;
    reveal[row] = {};
    reveal[row][col] = cell_contents;
    board[row][col].visited = true;
    board[row][col].visited_at = new Date();
    if (cell_contents === -1) {
      console.log("Player stepped on a mine at %d,%d!", row, col);
      result = LOSS;
    }
    else if (cell_contents === 0) {
      console.log("Player stepped on a 0 at %d,%d!", row, col);
      //TODO: call step on each adjacent cell
    }
    else {
      console.log("User stepped on a %d at %d,%d!", cell_contents, row, col);
    }
    //TODO: somehow check if all non-mine cells have been visited
    //(and set result to WIN if so)
    console.log("reveal is ", reveal);
    return {board: board, reveal: reveal, result: result};
  };

  app.get('/validate', function(req, res, next) {
    console.log('validate called!');
    var id = req.session.game_id;
    if (id === undefined) { console.error('req.session.game_id is undefined!'); }
    else {
      Game.findById(id, function(err, result) {
        if (err) { return next(err); }
        var numRows = result.numRows
        , numCols = result.numCols
        , numMines = result.numMines
        , board = result.board
        , i, j
        , row, cell
        , contents, visited
        , response = {}
        , reveal = {};
        for (i = 0; i < numRows; i++) {
          row = board[i];
          for (j = 0; j < numCols; j++) {
            cell = row[j];
            contents = cell.contents;
            visited = cell.visited;
            if (visited !== true) {
              if (reveal[i] === undefined) reveal[i] = {};
              if (contents !== -1) {
                //loss
                response.result = LOSS;
                reveal[i][j] = contents;
              }
            }
          }
        }
        if (response.result === undefined) {
          response.result = WIN;
        }
        response.reveal = reveal;
        console.log('response: ', response);
        res.json(response);
        Game.findById(id, function(err, game) {
          if (err) { return next(err); }
          game.result = response.result;
          game.save(function(err2) {
            if (err2) { console.error(err2); }
          });
        });
      });
    }
  });

  app.get('/cheat', function(req, res, next) {
    console.log('cheat called!');
    var id = req.session.game_id
    , response = {};
    if (id === undefined) { console.error('req.session.game_id is undefined!'); }
    else {
      Game.findById(id, function(error, result) {
        if (error) console.error(error);
        response.reveal = result.mines;
        console.log('response: ', response);
        res.json(response);
        Game.findById(id, function(err, game) {
          if (err) { return next(err); }
          game.cheated = true;
          game.save(function(err2) {
            if (err2) { console.error(err2); }
          });
        });
      });
    }
  });

  /*Handle all other cases with a 404
  ONLY do this if app.use(app.router) comes after app.use(express.static)
  in this app's configuration; otherwise, this route will catch
  all incoming requests, including requests for static files that exist.*/
  app.all('*', function(req, res) {
    console.log("404'd while trying to reach %s", req.originalUrl);
  	res.redirect('/404.html');
	});
};