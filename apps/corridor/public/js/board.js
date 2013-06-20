var BOARD =
    {
    players: {1: {'color': 'red'}, 2: {'color': 'blue'}},
    starting_row: {},
    winning_row: {},
    //2-D array of jQuery-selected TDs, accessible by board_array[row][col]
    board_spaces: [[]],
    gaps: {},
    current_player: -1,
    num_fences: -1,
    num_cols: -1,
    num_rows: -1,
    cell_size: 50,
    cell_padding: 5,
    last_move: undefined,

    initialize: function()
        {
        var _board = this;
        //initialize variables
        _board.current_player = 1;
        //get number of columns, rows, and fences from the hidden values in the form below the board
        _board.num_cols = parseInt($('[name="current_cols"]').val());
        _board.num_rows = parseInt($('[name="current_rows"]').val());
        _board.num_fences = parseInt($('[name="current_fences"]').val());
        _board.starting_row[1] = 1;
        _board.starting_row[2] = _board.num_rows;
        _board.winning_row[1] = _board.num_rows;
        _board.winning_row[2] = 1;
        },

    buildControls: function()
        {
        var _board = this;
        $('<button></button>')
            .attr('id', 'undo_button')
            .text('Undo')
            .click(function() {
                $('.undoHint').removeClass('undoHint');
                if (_board.last_move === undefined) return;
                var data = {last_move: _board.last_move};
                console.log('Emitting message', 'undo', data);
                socket.emit('undo', data);
            })
            .hover(function() {
                var last_move = _board.last_move;
                if (last_move === undefined) return;
                if (last_move.type === 'placeFence')
                    {
                    $('.lastMoveFence').addClass('undoHint');
                    }
                else if (last_move.type === 'move')
                    {
                    var old_space = last_move.old_space,
                        $space = _board.board_spaces
                            [old_space.row][old_space.col].$;
                    $space.addClass('undoHint');
                    }
            }, function() {
                $('.undoHint').removeClass('undoHint');
            })
            .css('font-size', (BOARD.cell_size / 2) + 'px')
            .insertBefore('#board');
        _board.disableUndoButton();
        $('<span></span>')
            .append($('<form></form>',
                { id: 'new_game_form' })
                .append($('<label># Rows</label>',
                    { for: 'new_game_num_rows' }))
                .append($('<input></input>',
                    { id: 'new_game_num_rows',
                      type: 'text'
                    }).val(_board.num_rows))
                .append($('<label># Columns</label>',
                    { for: 'new_game_num_cols' }))
                .append($('<input></input>',
                    { id: 'new_game_num_cols',
                      type: 'text'
                    }).val(_board.num_cols))
                .append($('<input type="submit" />')
                    .val('Start a New Game'))
                .submit(function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    var num_rows = parseInt($('#new_game_num_rows').val()),
                        num_cols = parseInt($('#new_game_num_cols').val());
                    console.log(window.location.host + '?num_rows=' + num_rows + '&num_cols=' + num_cols);
                    window.location.href = 'http://' + window.location.host + '?num_rows=' + num_rows + '&num_cols=' + num_cols;
                    return false;
                })
                )
            .insertBefore('#board');
        $('<span></span>')
            .attr('id', 'fence_counters')
            .append('Fences Placed: ')
            .append($('<strong>0</strong>')
                .attr(
                { id: 'red_fence_counter',
                  class: 'fenceCounter' })
                )
            .append('-')
            .append($('<strong>0</strong>')
                .attr(
                { id: 'blue_fence_counter',
                  class: 'fenceCounter' })
                )
            .insertBefore('#board')
            .after('<br /><br /><br /><br />') //hack to make positioning work
            .css('font-size', BOARD.cell_size + 'px');
        $('.fenceCounter').bind('increment', function()
            {
                $(this).text(Number($(this).text()) + 1)
            }).bind('decrement', function()
            {
                $(this).text(Number($(this).text()) - 1)
            });
        },

    buildBoard: function()
        {
        var _board = this,
            dist = _board.cell_size + _board.cell_padding,
        //add board table
            board_height = (2+_board.num_rows)*_board.cell_size+(1+_board.num_rows)*_board.cell_padding,
            board_width = (2+_board.num_cols)*_board.cell_size+(1+_board.num_cols)*_board.cell_padding;
        $('<table></table>')
            .attr('id', 'board-table')
            .css('height', board_height)
            .css('width', board_width)
            .appendTo('#board');
        //add table header row (top column guides)
        $('<thead id="board-table-head"><tr id="board-table-head-row"></tr></thead>')
            .appendTo('#board-table');
        $('<td></td>')
            .css('top', '0px')
            .css('left', '0px')            
            .appendTo('#board-table-head-row');
        for (var j=0; j<_board.num_cols; j++)
            {
                var c = String.fromCharCode("A".charCodeAt(0)+j);
                $('<td>'+c+'</td>')
                    .css('top', '0px')
                    .css('left', dist*(j+1)+'px')
                    .appendTo('#board-table-head-row');
            }
        $('<td></td>')
            .css('top', '0px')
            .css('left', dist*(j+1)+'px')
            .appendTo('#board-table-head-row');
        
        console.log('Building board with num_rows=%d, num_cols=%d', _board.num_rows, _board.num_cols);
        //add table body
        $('<tbody id="board-table-body"></tbody>')
            .appendTo('#board-table');
        for (var i=0; i<_board.num_rows; i++)
            {
            _board.board_spaces[i+1] = [];
            var $this_row = $('<tr></tr>').attr('id', '#row'+(i+1));
            //add left row guides
            $('<td>'+(i+1)+'</td>')
                .css('top', dist*(i+1)+'px')
                .css('left', '0px')
                .appendTo($this_row);
            //actually add board spaces
            for (var j=0; j<_board.num_cols; j++)
                {
                var $this_cell=$('<td></td>')
                    .attr('id', 'row'+(i+1)+'col'+(j+1))
                    .css('top', dist*(i+1)+'px')
                    .css('left', dist*(j+1)+'px')
                    .addClass('boardSpace')
                    .appendTo($this_row);
                _board.board_spaces[i+1][j+1] = new BoardSpace(i+1, j+1, $this_cell);
                }
            //add right row guides
            $('<td>'+(i+1)+'</td>')
                .css('top', dist*(i+1)+'px')
                .css('left', dist*(j+1)+'px')
                .appendTo($this_row);
            $this_row.appendTo('#board-table-body');
            }
        //add table footer row (bottom column guides)
        $('<tfoot id="board-table-foot"><tr id="board-table-foot-row"></tr></tfoot>')
            .appendTo('#board-table');
        $('<td></td>')
            .css('top', dist*(i+1)+'px')
            .css('left', '0px')            
            .appendTo('#board-table-foot-row');
        for (var j=0; j<_board.num_cols; j++)
            {
            c = String.fromCharCode("A".charCodeAt(0)+j);
            $('<td>'+c+'</td>')
                .css('top', dist*(i+1)+'px')
                .css('left', dist*(j+1)+'px')
                .appendTo('#board-table-foot-row');
            }
        $('<td></td>')
            .css('top', dist*(i+1)+'px')
            .css('left', dist*(j+1)+'px')
            .appendTo('#board-table-foot-row');
        //add container representing active portion of board
        var active_board_height = _board.num_rows*_board.cell_size+(_board.num_rows-1)*_board.cell_padding,
            active_board_width = _board.num_cols*_board.cell_size+(_board.num_cols-1)*_board.cell_padding;
        $('<div></div>')
            .attr('id', 'active-board')
            .css('height', active_board_height)
            .css('width', active_board_width)
            .css('left', dist)
            .css('top', dist)
            .appendTo('#board');
        //add board gaps
        //vertical
        for (var i=0; i<_board.num_rows; i++)
            {
            _board.gaps[i+1] = [];
            for (var j=1.5; j<_board.num_cols; j++)
                {
                var top = dist*i,
                    left = _board.cell_size+dist*(j-1.5),
                    $this_gap=$('<span></span>')
                    .attr('id', 'row'+(i+1)+'col'+(j))
                    .css('top', top+'px')
                    .css('left', left+'px')
                    .addClass('verticalGap')
                    .appendTo('#active-board');
                _board.gaps[i+1][j] = new BoardGap(i+1, j, $this_gap);
                }
            }
        //horizontal
        for (var i=0; i<_board.num_cols; i++)
            {
            for (var j=1.5; j<_board.num_rows; j++)
                {
                if (! _board.gaps[j])
                    {
                    _board.gaps[j] = [];
                    }
                var top = _board.cell_size+dist*(j-1.5),
                    left = dist*i,
                    $this_gap=$('<span></span>')
                    .attr('id', 'row'+(j)+'col'+(i+1))
                    .css('top', top+'px')
                    .css('left', left+'px')
                    .addClass('horizontalGap')
                    .appendTo('#active-board');
                _board.gaps[j][i+1] = new BoardGap(j, i+1, $this_gap);
                }
            }
        /*Removed because required changes to board-classes are less-than-elegant
        //gap gaps
        for (var i=1.5; i<_board.num_rows; i++)
            {
            _board.gaps[i] = [];
            for (var j=1.5; j<_board.num_cols; j++)
                {
                var top = _board.cell_size+dist*(i-1.5),
                    left = _board.cell_size+dist*(j-1.5),
                    $this_gap=$('<span></span>')
                    .attr('id', 'row'+(i)+'col'+(j))
                    .css('top', top+'px')
                    .css('left', left+'px')
                    .addClass('gapGap')
                    .appendTo('#active-board');
                _board.gaps[i][j] = new BoardGap(i, j, $this_gap);
                }
            }
        */
        },

    buildChat: function()
        {
        var _board = this,
            board_width = (2+_board.num_cols)*_board.cell_size+(1+_board.num_cols)*_board.cell_padding;
        $('<div></div>')
            .attr('id', 'chat')
            .insertAfter('#board')
        $('<div></div>')
            .attr('id', 'chat_messages')
            .css('height', (1+_board.num_rows)*_board.cell_size+(1+_board.num_rows)*_board.cell_padding+_board.cell_size/2)
            .css('width', board_width)
            .css('overflow', 'auto')
            .appendTo('#chat');
        $('<form></form>')
            .append($('<input type="text" />')
                .attr('id', 'chat_sender')
                .attr('placeholder', 'My Name')
                .css('width', board_width / 4))
            .append($('<input type="text" />')
                .attr('id', 'chat_message')
                .attr('placeholder', 'Message')
                .css('width', board_width / 2))
            .append($('<input type="submit" />')
                .attr('id', 'chat_submit')
                .val('Send Message')
                .css('width', board_width / 4))
            .submit(function(e) {
                e.stopPropagation();
                e.preventDefault();
                var data = {sender: $('#chat_sender').val(), message: $('#chat_message').val()};
                $('#chat_message').val('');
                console.log('Emitting message', 'chatMessage', data);
                socket.emit('chatMessage', data);
            })
            .appendTo('#chat');
        },

    addHandlers: function()
        {
        var _board = this;
        $('.boardSpace')
            .click(function(e)
            {
            if ($(this).children('.possibleMove').size() > 0)
                {
                var row = $(this).data('row'),
                    col = $(this).data('col'),
                    player = _board.current_player,
                    data = {row: row, col: col, player: player};
                console.log('Emitting message', 'move', data);
                socket.emit('move', data);
                }
            e.stopPropagation();
            });
        _board.addGapHandlers($('.verticalGap,.horizontalGap'))
        $('#active-board')
            .click(function(e)
            {
            var top_left=$(this).offset(),
                x=e.pageX-top_left.left,
                y=e.pageY-top_left.top;
            console.log(x + ',' + y);
            });
        },

    addGapHandlers: function($gaps)
        {
        var _board = this;
        $gaps
            .hover(function(e)
                {
                $('.placeFenceHint').removeClass('placeFenceHint');
                $(this)
                    .addClass('placeFenceHint');
                var gap = $(this).data('gap'),
                    adjacent_gaps = gap.adjacent_gaps(e),
                    closer_gap = adjacent_gaps.closer,
                    farther_gap = adjacent_gaps.farther;
                if (closer_gap && ! closer_gap.$.hasClass('fence'))
                    {
                        closer_gap.$.addClass('placeFenceHint');
                    }
                else if (farther_gap && ! farther_gap.$.hasClass('fence'))
                    {
                        farther_gap.$.addClass('placeFenceHint');
                    }
                },
            function(e)
                {
                //$(this)
                //    .removeClass('placeFenceHint');
                //var gap = $(this).data('gap');
                //var $adjacent = gap.adjacent(e).$.removeClass('placeFenceHint');
                $('.placeFenceHint').removeClass('placeFenceHint');
                })
            .mousemove(function(e)
                {
                var gap = $(this).data('gap'),
                    adjacent_gaps = gap.adjacent_gaps(e),
                    closer_gap = adjacent_gaps.closer,
                    farther_gap = adjacent_gaps.farther;
                //if nothing's changed, just return
                if (closer_gap && closer_gap.$.hasClass('placeFenceHint')) return;
                //otherwise... reset placeFenceHints
                $('.placeFenceHint').removeClass('placeFenceHint');
                $(this)
                    .addClass('placeFenceHint');
                if (closer_gap && ! closer_gap.$.hasClass('fence'))
                    {
                        closer_gap.$.addClass('placeFenceHint');
                    }
                else if (farther_gap && ! farther_gap.$.hasClass('fence'))
                    {
                        farther_gap.$.addClass('placeFenceHint');
                    }
                })
            .click(function(e)
                {
                var data = {player: _board.current_player},
                    ids = [],
                    id;
                $('.placeFenceHint')
                    .each(function(i, gap) {
                        id = $(gap).attr('id');
                        ids.push(id);
                    });
                data['ids'] = ids;
                console.log('Emitting message', 'placeFence', data);
                socket.emit('placeFence', data);
                e.stopPropagation();
                });
        },

    initializeBoard: function()
        {
        var _board = this,
        //pawns start at the middle of the board. this line SHOULD divide the number of columns by 2, rounding down.
            starting_col = (Math.round(parseInt(_board.num_cols)+.5))/2;
        //display pawns at starting positions
        _board.displayPawn(1,String(_board.starting_row[1]),String(starting_col));
        _board.displayPawn(2,String(_board.starting_row[2]),String(starting_col));
        },

    displayPawn: function(player, row, col)
        {
        console.log('Displaying player #', player, '\'s pawn at ', row, ', ', col);
        var _board = this,
            space = _board.board_spaces[row][col],
            color = _board.players[player]['color'],
            img_name = '../img/' + color + '_pawn_50.jpg',
            img_url = 'images/' + img_name,
            img = $('<img></img>').attr('src',img_url);
        _board.players[player]['space'] = space;
        space.$
            .append(img.addClass('pawn'));
//        $('#col'+col+'row'+row).html(img);
        },

    move: function(row, col, player, undo)
        {
        var _board = this,
        //TODO: check to make sure move is valid?
        //Remove player's pawn
            space = _board.players[player]['space'],
            winning_row = _board.winning_row[player];
        space.$
            .empty()
        //Remove move hints
        _board.removeMoveHints();
        //Display player's pawn
        _board.displayPawn(player, row, col);
        //if
        if (row === winning_row)
            {
            var losing_player = (player == 2) ? 1 : 2,
                losing_row = _board.winning_row[losing_player];
            for (var j = 1, max = _board.num_cols; j <= max; j++)
                {
                    $('#row' + winning_row + 'col' + j).addClass('victory');
                    $('#row' + losing_row + 'col' + j).addClass('loss');
                }
            }
        else
            {
            var 
                other_player = (player == 2) ? 1 : 2,
                other_row = _board.winning_row[other_player];
            for (var j = 1, max = _board.num_cols; j <= max; j++)
                {
                    $('#row' + winning_row + 'col' + j).removeClass('victory');
                    $('#row' + other_row + 'col' + j).removeClass('loss');
                }
            }
        if (undo === undefined)
            {
            //Update last_move
            _board.setLastMove({type: 'move', player: player,
                    old_space: {row: space.row, col: space.col},
                    new_space: {row: row, col: col}});
            //Update current player and add move hints
            _board.switchPlayer(player);
            }
        $('.lastMoveFence').removeClass('lastMoveFence');
        },

    placeFence: function(ids, player)
        {
        var _board = this,
            color = _board.players[player]['color'],
            //turn our list of ids into a list of HTML elements $spaces
            $spaces = _board.idsTo$objs(ids);
        $('.lastMoveFence').removeClass('lastMoveFence');
        //Place the fences
        $spaces
            .addClass('fence')
            .addClass(color + 'Fence')
            .addClass('lastMoveFence')
            .removeClass('placeFenceHint')
            .effect('highlight', {color: 'chartreuse'}, 3000)
            .unbind('click')
            .unbind('hover')
            .unbind('mousemove')
            .click(function(e)
                {
                var data;
                if ($spaces.first().hasClass('lastMoveFence'))
                    {
                        data = {last_move: _board.last_move};
                        console.log('Emitting message', 'undo', data);
                        socket.emit('undo', data);
                    }
                else
                    {
                        data = {ids: ids};
                        console.log('Emitting message', 'removeFence', data);
                        socket.emit('removeFence', data);
                    e.stopPropagation();
                    }
                })
            .hover(function(e)
                {
                $('.removeFenceHint').removeClass('removeFenceHint');
                $spaces.addClass('removeFenceHint');
                },
            function(e)
                {
                $('.removeFenceHint').removeClass('removeFenceHint');
                });
        //Update appropriate fence counter
        $('#' + color + '_fence_counter')
            .trigger('increment');
        //Update last_move
        _board.setLastMove({type: 'placeFence',
            player: player, ids: ids});
        //Update current player and add move hints
        _board.switchPlayer(player);
        },

    removeFence: function(ids)
        {
        var _board = this,
            $spaces = _board.idsTo$objs(ids),
            color = $spaces.hasClass('redFence') ? 'red' : 'blue';
        $spaces
            .removeClass('fence')
            .removeClass(color + 'Fence')
            .removeClass('removeFenceHint')
            .removeClass('lastMoveFence')
            .unbind('click');
        //Update appropriate fence counter
        $('#' + color + '_fence_counter')
            .trigger('decrement');
        BOARD.addGapHandlers($spaces);
        BOARD.refreshMoveHints();
        },

    idsTo$objs: function(ids)
        {
            var $objs = [];
            //turn our list of ids into a list of HTML elements $objs
            $.each(ids, function(i, id)
            {
                //console.log(id, id.replace(/\./g, '\\.'), $('#' + id.replace(/\./g, '\\.')));
                $objs.push($('#' + id.replace(/\./g, '\\.'))[0]);
            });
            //convert $objs into a list of jQuery objects
            $objs = $($objs);
            return $objs;
        },

    switchPlayer: function(current_player, next_player)
        {
        if (next_player === undefined)
            {
            next_player = (current_player == 2) ? 1 : 2;
            }
        BOARD.current_player = next_player;
        BOARD.refreshMoveHints();
        },

    addMoveHints: function()
        {
        var _board = this,
            player_obj = _board.players[_board.current_player],
            pawn_loc = player_obj['space'],
            color = player_obj['color'];
        $.each(pawn_loc.adjacentSpaces(), function(direction, adj)
            {
            if (adj != null && !(adj.gap.$.hasClass('fence')))
                {
                var space = adj.space,
                    img_name = '../img/' + color + '_arrow_' + direction + '_50.jpg',
                    img_url = 'images/' + img_name,
                    $img = $('<img></img>').attr('src', img_url);
                if (space.$.children('.pawn').size() === 0)
                    {
                    space.$
                        .append(
                            $img.addClass('possibleMove')
                                .addClass('move_' + direction)
                        );
                    }
                else
                    {
                    space.$
                        .append($img.addClass('jumpMove'));
                    $.each(space.adjacentSpaces(), function(direction2, adj2)
                        {
                        if (adj2 != null && !(adj2.gap.$.hasClass('fence')) && adj2.space.$.children('.pawn').size() === 0)
                            {
                            var img_name2 = '../img/' + color + '_arrow_' + direction2 + '_50.jpg',
                                img_url2 = 'images/' + img_name2,
                                $img2 = $('<img></img>').attr('src', img_url2).hover(function() {
                                    $('.jumpMove').css('opacity', .75);
                                }, function() {
                                    $('.jumpMove').css('opacity', '');
                                });
                            adj2.space.$
                                .append($img2.addClass('possibleMove'));
                            }
                        });
                    }
                }
            });
        },

    removeMoveHints: function()
        {
        $('img.possibleMove')
            .remove();
        $('img.jumpMove')
            .remove();
        },

    refreshMoveHints: function()
        {
        var _board = this;
        _board.removeMoveHints();
        _board.addMoveHints();
        },

    undo: function(last_move)
        {
        var _board = this,
            player = last_move.player;
        if (last_move === undefined)
            {
            return;
            }
        if (last_move.type === 'move')
            {
            _board.move(last_move.old_space.row, last_move.old_space.col,
                        player, true);
            }
        else if (last_move.type === 'placeFence')
            {
            _board.removeFence(last_move.ids);
            }
        _board.last_move = undefined;
        //switch player back to last player who moved
        _board.switchPlayer(undefined, player);
        _board.disableUndoButton();
        },

    setLastMove: function(last_move)
        {
        var _board = this;
        _board.last_move = last_move;
        _board.enableUndoButton();
        },

    disableUndoButton: function()
        {
        $('#undo_button').attr('disabled', 'disabled');
        },

    enableUndoButton: function()
        {
        $('#undo_button').removeAttr('disabled');
        },
    }
    
$(document).ready(function()
{
    BOARD.initialize();
    BOARD.buildBoard();
    BOARD.buildControls();
    BOARD.buildChat();
    BOARD.addHandlers();
    BOARD.initializeBoard();
    console.log('Connecting to ', window.location.href);
    socket = io.connect(window.location.href, {transports: ['websocket', 'xhr-multipart', 'htmlfile', 'xhr-polling', 'jsonp-polling']});
    var name = prompt('Please enter a name for yourself.') || 'Lazy Person';
    $('#chat_sender').val(name);
    socket.emit('setName', { name: name } );
    $('#chat_message').focus();
    $(document).on('keydown', function(e)
    {
        var $chat_sender = $('#chat_sender'),
            $chat_message = $('#chat_message'),
            $new_game_num_rows = $('#new_game_num_rows'),
            $new_game_num_cols = $('#new_game_num_cols'),
            key_code = e.which;
        if (key_code < 32 || key_code > 126)
        {
            return;
        }
        else if (key_code > 36 && key_code < 41)
        {
            //don't move pieces if the user means to navigate a text field
            if ($chat_sender.is(':focus') && $chat_sender.val() !== ''
            || $chat_message.is(':focus') && $chat_message.val() !== '')
            {
                return;
            }
            var arrow_id = '.move_';
            switch(key_code)
            {
                case 37:
                    arrow_id += 'left';
                    break;
                case 38:
                    arrow_id += 'up';
                    break;
                case 39:
                    arrow_id += 'right';
                    break;
                case 40:
                    arrow_id += 'down';
                    break;
            }
            $(arrow_id).parent().click();
            e.stopPropagation();
            e.preventDefault();
        }
        else if ($chat_sender.is(':focus') || $chat_message.is(':focus') ||
                 $new_game_num_rows.is(':focus') || $new_game_num_cols.is(':focus'))
        {
            //don't focus $chat_message if the user's typing in a text field
            return;
        }
        else
        {
            $chat_message
                .focus();
        }
    });
    /*socket.on('connect', function () { console.log('connect'); });
    socket.on('connecting', function () { console.log('connecting'); });
    socket.on('disconnect', function () { console.log('disconnect'); });
    socket.on('connect_failed', function () { console.log('connect_failed'); });
    socket.on('error', function () { console.log('error'); });
    socket.on('reconnect_failed', function () { console.log('reconnect_failed'); });
    socket.on('reconnect', function () { console.log('reconnect'); });
    socket.on('reconnecting', function () { console.log('reconnecting'); });*/
    socket.on('syn ack', function () {
        console.log('Syn Ack received.');
        socket.emit('ack');
        //show arrows for starting player's possible pawn moves
        BOARD.refreshMoveHints();
    });

    socket.on('placeFence', function(data) {
        console.log('placeFence message received: ', data);
        var ids = data.ids,
            player = data.player;
        BOARD.placeFence(ids, player);
    });

    socket.on('removeFence', function(data) {
        console.log('removeFence message received: ', data);
        var ids = data.ids;
        BOARD.removeFence(ids);
    });

    socket.on('move', function(data) {
        console.log('move message received: ', data);
        var row = data.row,
            col = data.col,
            player = data.player;
        BOARD.move(row, col, player);
    });

    socket.on('undo', function(data) {
        console.log('undo message received: ', data);
        var last_move = data.last_move;
        BOARD.undo(last_move);
    });

    socket.on('chatMessage', function(data) {
        console.log('chatMessage message received: ', data);
        var sender = data.sender,
            message = data.message;
        $('#chat_messages')
            .append($('<p></p>')
                .attr('id', 'new_message')
                .append($('<strong></strong>')
                    .text(sender + ' : '))
                .append($('<span></span>')
                    .text(message)))
            .scrollTop($('#chat_messages').height());
        $('#new_message')
            .effect('highlight', {color: 'chartreuse'}, 4000)
            .removeAttr('id');
    });

    socket.on('logMessage', function(data) {
        //console.log('chatMessage message received: ', data);
        var message = data.message;
        $('#chat_messages')
            .append($('<p></p>')
                .attr('id', 'new_message')
                .append($('<span></span>')
                    .text(message))
            .scrollTop($('#chat_messages').height()));
        $('#new_message')
            .effect('highlight', {color: 'chartreuse'}, 4000)
            .removeAttr('id');
    });

    //not working in Chrome (untested in other browsers)
    //neither does on('beforeunload') or $('body').unload
    $(window).unload(function() {
        var data = {name: $('#chat_sender').val()};
        console.log('Emitting message', 'unload', data);
        socket.emit('unload', data);
        socket.disconnect();
    });
});
