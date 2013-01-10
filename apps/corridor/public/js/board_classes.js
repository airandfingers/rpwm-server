function BoardSpace (row, col, selected)
    {
    var _board = BOARD;
    this.row = row;
    this.col = col;
    this.$ = selected;
    this.$.data('row', row);
    this.$.data('col', col);
    this.adjacentSpaces = function()
        {
        return {
            'left': this.left(),
            'up': this.up(),
            'right': this.right(),
            'down': this.down()
            };
        }
    }
BoardSpace.prototype.left = function()
    {
    var col_left = this.col - 1,
        gap_col_left = this.col - .5;
    if (col_left < 1)
        {
        return null;
        }
    return {space: BOARD.board_spaces[this.row][col_left],
            gap: BOARD.gaps[this.row][gap_col_left]};
    };

BoardSpace.prototype.up = function()
    {
    var row_above = this.row - 1,
        gap_row_above = this.row - .5;
    if (row_above < 1)
        {
        return null;
        }
    return {space: BOARD.board_spaces[row_above][this.col],
            gap: BOARD.gaps[gap_row_above][this.col]};
    };
    
BoardSpace.prototype.right = function()
    {
    var col_right = this.col + 1,
        gap_col_right = this.col + .5;
    if (col_right > BOARD.num_cols)
        {
        return null;
        }
    return {space: BOARD.board_spaces[this.row][col_right],
            gap: BOARD.gaps[this.row][gap_col_right]};
    };
    
BoardSpace.prototype.down = function()
    {
    var row_below = this.row + 1,
        gap_row_below = this.row + .5;
    if (row_below > BOARD.num_rows)
        {
        return null;
        }
    return {space: BOARD.board_spaces[row_below][this.col],
            gap: BOARD.gaps[gap_row_below][this.col]};
    };

function BoardGap (row, col, selected)
    {
    var _board = BOARD;
    this.row = row;
    this.col = col;
    this.direction = (this.row % 1 == 0) ? 'vertical' : 'horizontal'; //vertical or horizontal gap
    this.$ = selected;
    this.$.data('gap', this);
    }

BoardGap.prototype.before = function()
    {
    if (this.beforeGap === undefined)
        {
        if (this.direction == 'vertical')
            {
            if (this.row == 1)
                {
                this.beforeGap = null;
                }
            else
                {
                this.beforeGap = BOARD.gaps[this.row-1][this.col];
                }
            }
        else
            {
            if (this.col == 1)
                {
                this.beforeGap = null;
                }
            else
                {
                this.beforeGap = BOARD.gaps[this.row][this.col-1];
                }
            }
        }
    return this.beforeGap;
    }

BoardGap.prototype.after = function()
    {
    if (this.afterGap === undefined)
        {
        if (this.direction == 'vertical')
            {
            if (this.row == BOARD.num_rows)
                {
                this.afterGap = null;
                }
            else
                {
                this.afterGap = BOARD.gaps[this.row+1][this.col];
                }
            }
        else
            {
            if (this.col == BOARD.num_cols)
                {
                this.afterGap = null;
                }
            else
                {
                this.afterGap = BOARD.gaps[this.row][this.col+1];
                }
            }
        }
    return this.afterGap;
    }

BoardGap.prototype.adjacent_gaps = function(e)
    {
    var cursor_loc = null;
    if (this.direction == 'vertical')
        {
        cursor_loc = e.pageY - this.$.offset().top;
        }
    else
        {
        cursor_loc = e.pageX - this.$.offset().left;
        }
    var closer_gap,
        farther_gap = null,
        before = this.before(),
        after = this.after();
    if (cursor_loc <= (BOARD.cell_size/2))
        {
        if (before === null)
            {
                closer_gap = after;
            }
        else
            {
                closer_gap = before;
                farther_gap = after;
            }
        }
    else if (cursor_loc > (BOARD.cell_size/2))
        {
        if (after === null)
            {
                closer_gap = before;
            }
        else
            {
                closer_gap = after;
                farther_gap = before;
            }
        }
    else
        {
        alert("ERROR! cursor is not within gap that adjacent() was called on!");
        closer_gap = null;
        }
    return {closer: closer_gap, farther: farther_gap};
    };
