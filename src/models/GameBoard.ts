class GameBoard extends Phaser.GameObjects.Grid {
  grid: Cell[][];
  numberOfMines: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    cellWidth: number,
    cellHeight: number
  ) {
    super(scene, x, y, width, height, cellWidth, cellHeight);
    this.grid = [];
    this.numberOfMines = 0;
    this.generateBoard();
  }

  /**
   * Generates a new game board (populates this.grid with cells)
   */
  generateBoard() {
    for (let i = 0; i < this.width; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.height; j++) {
        this.grid[i][j] = new Cell(
          this.scene,
          i * this.cellWidth,
          j * this.cellHeight,
          this.cellWidth,
          this.cellHeight,
          CellContent.EMPTY
        );
      }
    }
  }

  /**
   * Determines what to do when a cell is clicked
   *
   * If the cell was a mine, you lose :(
   *
   * If the cell was empty, reveal all adjacent cells
   * @param x x coordinate of the cell
   * @param y y coordinate of the cell
   */
  checkCell(x: number, y: number): CellContent {
    const cell = this.grid[x][y];
    if (cell.contains === CellContent.HAZARD) {
      return CellContent.HAZARD;
    }
    if (cell.contains === CellContent.EMPTY) {
      this.revealAdjacentCells(x, y);
    }
    return cell.contains;
  }

  /**
   * Reveals all adjacent cells
   * @param x x coordinate of the cell
   * @param y y coordinate of the cell
   */
  revealAdjacentCells(x: number, y: number) {
    const cell = this.grid[x][y];
    if (cell.cellState === CellState.REVEALED) {
      return;
    }
    cell.cellState = CellState.REVEALED;
    if (cell.adjacentMines === 0) {
      this.revealAdjacentCells(x - 1, y);
      this.revealAdjacentCells(x + 1, y);
      this.revealAdjacentCells(x, y - 1);
      this.revealAdjacentCells(x, y + 1);
    }
  }
}

class Cell extends Phaser.GameObjects.Rectangle {
  cellState: CellState;
  contains: CellContent;
  adjacentMines: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    contains: CellContent
  ) {
    super(scene, x, y, width, height);
    this.cellState = CellState.HIDDEN;
    this.contains = contains;
    this.adjacentMines = 0;
  }
}

enum CellState {
  HIDDEN,
  REVEALED,
  FLAGGED,
}

enum CellContent {
  EMPTY,
  HAZARD,
  TREASURE,
}
export default GameBoard;
