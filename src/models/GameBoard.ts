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

    this.placeMines();
    this.calculateAdjacentMines();
  }

  /**
   * Places mines on the game board
   * @param startX x coordinate of the starting cell
   * @param startY y coordinate of the starting cell
   * @param mineDensity density of mines on the board
   */
  placeMines(
    startX: number = this.width - 1,
    startY: number = Math.floor(this.height / 2),
    mineDensity: number = 0.15
  ) {
    this.numberOfMines = this.width * this.height * mineDensity;
    let minesPlaced = 0;

    while (minesPlaced < this.numberOfMines) {
      const x = Math.floor(Math.random() * this.width);
      const y = Math.floor(Math.random() * this.height);

      // Check if current position is the start position or adjacent to it
      if (Math.abs(x - startX) <= 1 && Math.abs(y - startY) <= 1) {
        continue;
      }

      if (this.grid[x][y].contains === CellContent.EMPTY) {
        this.grid[x][y].contains = CellContent.HAZARD;
        minesPlaced++;
      }
    }
  }

  /**
   * Calculates the number of adjacent mines for each cell
   */
  calculateAdjacentMines() {
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        const cell = this.grid[i][j];
        if (cell.contains === CellContent.HAZARD) {
          continue;
        }

        let adjacentMines = 0;
        for (let x = i - 1; x <= i + 1; x++) {
          for (let y = j - 1; y <= j + 1; y++) {
            if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
              continue;
            }
            if (this.grid[x][y].contains === CellContent.HAZARD) {
              adjacentMines++;
            }
          }
        }
        cell.adjacentMines = adjacentMines;
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
