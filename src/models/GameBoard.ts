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
  generateBoard() {}

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
    return CellContent.EMPTY;
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
