$(document).ready(function()
{
  //set the handlers for the buttons
  BOARD.setButtonHandlers();
});

var BOARD = (function() {        
  //private properties
  //global constants
  var WIN = 'WIN'
  , LOSS = 'LOSS'
  //number of rows/columns/cells/mines in current game
  , numRows = $('#numRows').val()
  , numCols = $('#numCols').val()
  , numCells = numRows * numCols
  , numMines = $('#numMines').val()
  //jQuery selectors for page elements
  , $board = $('#board')
  , $newGameButton = $('#new-game-button')
  , $validateButton = $('#validate-button')
  , $cheatButton = $('#cheat-button')
  //list of buttons that hide mines
  , $mines = []
  //whether the game has been started or not
  //calculate by checking for "preloaded" class on board div,
  //which is only added to boards that are build with some revealed cells
  , activeGame = $('#board').hasClass('preloaded')
  //relative path to images folder
  , imagesPath = '/img/'
  
  //private methods to be revealed in BOARD's public API
  /**
   * Starts a new game of Minesweeper.
   * This method can be called through the developer console to create a custom board,
   * e.g. BOARD.newGame(16, 16, 256) will create a new 16x16 board with mines in every location.
   * (Note: this functionality has barely been tested, and none of the appropriate parameter-checking is being done.)
   *
   * @param {Number} rowsToBuild  the number of rows the board will have.
   * @param {Number} colsToBuild  the number of columns the board will have.
   * @param {Number} minesToLay   the number of mines the board will have.
   * @param {Number} row          the row number of the initial step (if any).
   * @param {Number} col          the column number of the initial step (if any).
   */
  , newGame = function(rowsToBuild, colsToBuild, minesToLay, row, col) {
    console.log('New game started!');
    rowsToBuild = typeof rowsToBuild !== 'undefined' ? rowsToBuild : numRows;
    colsToBuild = typeof colsToBuild !== 'undefined' ? colsToBuild : numCols;
    minesToLay = typeof minesToLay !== 'undefined' ? minesToLay : numMines;
    //clear board and result containers
    cleanup();

    if (row !== undefined && col !== undefined) {
      $.post('/new_game',
        {numRows: rowsToBuild, numCols: colsToBuild, numMines: minesToLay, row: row, col: col}
      ).success(function(response) {
          initialize(response);
        }
      ).error(function(jqXHR, textStatus, errorThrown) {
        console.error('Error while starting new game: ', textStatus, errorThrown);
      });
    }
    else {
      $.post('/new_game', 
        {numRows: rowsToBuild, numCols: colsToBuild, numMines: minesToLay}
      ).success(function(response) {
          initialize(response);
        }
      ).error(function(jqXHR, textStatus, errorThrown) {
        console.error('Error while starting new game: ', textStatus, errorThrown);
      });
    }
  }
  , initialize = function(board_contents) {
    //console.log('Board Contents: ', board_contents);
    console.log('Initializing board...')
    $board.html(board_contents);
    activeGame = true;
    //enable tiles' click handlers and re-enable disabled buttons
    enableTileHandlersAndButtons();
  }
  /**
   * Click handler for "Validate" button.
   * Checks whether all non-mine tiles have been clicked.
   * If so, calls win(); otherwise, calls loss().
   */
  , validate = function() {
    $.get('/validate',
      {}
    ).success(function(response) {
      if (response.result === WIN) {
        win();
      }
      else if (response.result === LOSS) {
        loss(response.reveal);
      }
      else {
        console.error('Invalid result: ', response.result);
      }
    }).error(function(jqXHR, textStatus, errorThrown) {
      console.error('Error while validating: ', textStatus, errorThrown);
    });
  }
  /**
   * Click handler for "Cheat" button.
   * Reveals all mines (by calling revealMines()).
   */
  , cheat = function() {
    console.log('User cheated!');
    //if user has already cheated (and so $mines are already stored)
    if ($mines.length !== 0) revealMines(true);
    else {
      $.get('/cheat',
        {}
      ).success(function(response) {
        console.log('cheat response:', response);
        //reveal all mines
        revealMines(true, response.reveal);
      }).error(function(jqXHR, textStatus, errorThrown) {
        console.error('Error while cheating: ', textStatus, errorThrown)
      });
    }
    //change "Cheat" button to "Stop Cheating" button
    $cheatButton
      .text('Stop Cheating')
      .attr('title', 'Okay, I\'m done peeking.')
      .off('click')
      .on('click', stopCheating);
  }
  /**
   * Click handler for "Stop Cheating" button.
   * Hides all mines (by calling hideMines()).
   */
  , stopCheating = function() { 
    //hide all mines
    hideMines();
    //change "Stop Cheating" button back to "Cheat" button
    $cheatButton
      .text('Cheat')
      .attr('title', 'Just a peek couldn\'t hurt..')
      .off('click')
      .on('click', cheat);
  }
  /**
   * Sets the handlers for the "New Game", "Validate", and "Cheat" buttons.
   * Only gets called once, the first time newGame() is called.
   */
  , setButtonHandlers = function() {
    //enable click handler for new-game button
    $newGameButton.on('click', function() { newGame(); });
    //enable click handler for validate button
    $validateButton.on('click', validate);
    //enable click handler for cheat button
    $cheatButton.on('click', cheat);
    //enable click handler for unclicked tiles
    $('.boardTile').on('click', step);
  }
  //BOARD's public API to be returned
  , api = {
      newGame: newGame
    , validate: validate
    , cheat: cheat
    , stopCheating: stopCheating
    , setButtonHandlers: setButtonHandlers
  }
  //private methods not to be revealed
  /**
   * Click handler for active game board tiles.
   * Calls loss() and displays explosion image if this tile has a mine.
   * Otherwise, counts number of adjacent mines and displays appropriate image.
   */
  , step = function() {
    var $this = $(this)
    //get this button's ID - board-tile-[row]-[column]
    , idSplit = $this.attr('id').split('-')
    //calculate its row and column number from its ID
    , this_row = idSplit[idSplit.length-2]
    , this_col = idSplit[idSplit.length-1]
    , contents
    , result;

    if (! activeGame) {
      newGame(numRows, numCols, numMines, this_row, this_col);
    }
    else {
      $.post('/step',
        {row: this_row, col: this_col}
      ).success(function(response) {
        result = response.result;
        //console.log('Response: ', response);
        if (result === LOSS) {
          loss(response.reveal);
        }
        else if (result === WIN) {
          //Relies on TODO in step route
          win();
        }
        else {
          contents = response.reveal[this_row][this_col];
          //change the clicked cell to show the image for the number of adjacent mines
          revealCell($this, contents);
          delete response.reveal[this_row][this_col];
          if (contents === 0) {
            $.each(response.reveal, function(row, reveal_row) {
              $.each(reveal_row, function(col, cell) {
                contents = cell.contents;
                revealCell($('#board-tile-'+row+'-'+col), contents);
              });
            });
          }
        }
      }).error(function(jqXHR, textStatus, errorThrown) {
        console.error('Error while stepping: ', textStatus, errorThrown);
      });
    }
  }
  /**
   * Enables the handlers for active game board tiles.
   * Enables the "Validate" and "Cheat" buttons.
   * Changes "Stop Cheating" button to "Cheat" button if necessary.
   */
  , enableTileHandlersAndButtons = function() {
    //enable click handler for unclicked tiles
    $('.boardTile').on('click', step);
    //re-enable validate button (if it was disabled)
    $validateButton.removeAttr('disabled');
    //re-enable cheat button (if it was disabled)
    $cheatButton.removeAttr('disabled');
    //toggle cheat button (if it was in "Stop Cheating" mode)
    if ($cheatButton.text() === 'Stop Cheating') {
      stopCheating();
    }
  }
  /**
   * Disables the handlers for active game board tiles.
   * Disables the "Validate" and "Cheat" buttons.
   */
  , disableTileAndButtonHandlers = function() {
    //disable click handler for unclicked tiles
    $('.boardTile').off('click');
    //disable click handler for validate button
    $validateButton.attr('disabled', 'disabled');
    //disable click handler for cheat button
    $cheatButton.attr('disabled', 'disabled');
  }

  , revealCell = function($tile, contents, explode) {
    if (contents == '-1') contents = (explode) ? 'explosion' : 'mine';
    $tile
      //access the boardCell holding this button
      .parent()
        //remove the button from it
        .empty()
        //add an image showing the number of adjacent mines
        .append($('<img />')
          .attr('src', imagesPath+contents+'_50px.jpg')
          );
  }
  /**
   * Reveals all the mines in the current game board.
   */
  , revealMines = function(cheater, minesToReveal) {
    var $mine;
    console.log('revealMines called with minesToReveal =', minesToReveal, ', $mines =', $mines);
    if (minesToReveal === undefined) {
      if ($mines.length === 0) {
        //handle the case in which gameOver calls revealMines
        //and the user hasn't cheated
        $.get('/cheat',
          {}
        ).success(function(response) {
          //recursively call this method to reveal all mines
          revealMines(cheater, response.reveal);
        }).error(function(jqXHR, textStatus, errorThrown) {
          console.error('Error while cheating: ', textStatus, errorThrown)
        });
      }
    }
    else {
      $.each(minesToReveal, function(row, reveal_row) {
        $.each(reveal_row, function(col, cell) {
          $mine = $('#board-tile-'+row+'-'+col);
          if ($mine.size() > 0) {
            if ($.inArray($mine, $mines) === -1) {
              $mines.push($mine);
            }
            else {
              console.error('revealMines called with duplicate cell at ', row, ',', col, '!');
            }
          }
        });
      });
    }
    if (cheater) {
        $.each($mines, function(i, $mine) {
              $mine.css('background-image', 'url('+imagesPath+'mine_50px.jpg)');

    });    }
    else {
          $.each($mines, function(i, $mine) {
              revealCell($mine, -1, false);

    });
    }
  }
  /**
   * Hides all the mines in the current game board.
   */
  , hideMines = function() {
    $.each($mines, function(i, $mine) {
        $mine.css('background-image', '');
    });
  }
  /**
   * Handles the fact that the user just lost:
   * Adds the 'failure' class to the cell(s) that caused the user to lose.
   * Displays "You Lose!" message and "Try Again!" button.
   * Calls gameOver().
   * @param {Object} cells a map of the cell(s) that resulted in the user's loss
   */
  , loss = function(cells) {
    console.log('User lost!');
    var $cell;
    $.each(cells, function(row, reveal_row) {
      $.each(reveal_row, function(col, cell_contents) {
        $cell = $('#board-tile-'+row+'-'+col);
        $cell.parent().addClass('failure');
        revealCell($cell, cell_contents, true);
      });
    });
    //inform the player of his/her loss
    var message = ($mines.length !== 0) ? 'And you cheated, too!' : 'Better luck next time!';
    $('#result')
      .text('You Lose! :(')
      .after($('<h3></h3>')
        .text(message)
        //display "Try Again!" button
        .after($('<button>Try Again!</button>')
          .attr('id', 'restart-game-button')
          .click(function() { newGame(numRows, numCols, numMines); })
      ));
    gameOver(LOSS);
  }
  /**
   * Handles the fact that the user just won:
   * Adds the 'success' class to the whole $board-table.
   * Displays "You Win!" message and "Play Again!" button.
   * Calls gameOver().
   */
  , win = function() {
    console.log('User won!');
    $('#board-table').addClass('success');
    //inform the player of his/her victory
    var message = ($mines.length !== 0) ? '(Too bad you cheated)' : 'You\'re good at this!';
    $('#result')
      .text('You Win! :)')
      .after($('<h3></h3>')
        .text(message)
        //display "Play Again!" button
        .after($('<button>Play Again!</button>')
          .attr('id', 'restart-game-button')
          .click(function() { newGame(numRows, numCols, numMines); })
      ));
    gameOver(WIN);
  }
  /**
   * Performs some end-of-game housekeeping:
   * Disables handlers and buttons that only make sense during an active game.
   * Reveals all mines (by calling revealMines()).
   * Inserts information about this game into gamesPlayed.
   * @param {String} winOrLoss  whether the game was a 'win' or a 'loss'
   */
  , gameOver = function(winOrLoss) {
    activeGame = false;
    //remove tiles' click handlers and disable "Validate" and "Cheat" buttons
    disableTileAndButtonHandlers();
    //reveal all mines
    revealMines(false);

  }
  /**
   * Performs some between-games housekeeping:
   * Empties $board.
   * Reinitializes the result container.
   */
  , cleanup = function() {
    //empty the board div
    $board.empty();
    //reinitialize $mines
    $mines = [];
    //reinitialize the result div
    $('#result-container')
      .html('<h1 id="result"></h1>');
  }
  //reveal public API
  return api;
}());