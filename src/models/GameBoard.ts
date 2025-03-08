class GameBoard extends Phaser.GameObjects.Container {
  grid: Cell[][];
  numberOfMines: number;
  cellWidth: number;
  cellHeight: number;
  boardWidth: number;
  boardHeight: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    cellWidth: number,
    cellHeight: number,
    numberOfMines: number = 0
  ) {
    super(scene, x, y);
    this.grid = [];
    this.numberOfMines = 0;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.boardWidth = width;
    this.boardHeight = height;

    this.generateBoard(cellWidth, cellHeight, width, height);

    this.setSize(width * cellWidth, height * cellHeight);
    this.setInteractive();

    // Handle click events on the board
    this.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      console.log("Pointer down on board", pointer);
      this.handlePointerDown(pointer);
    });
  }

  /**
   * Handles click events on the board
   * @param pointer the pointer that was clicked
   */
  handlePointerDown(pointer: Phaser.Input.Pointer) {
    const cellX = Math.floor(pointer.x / this.cellWidth);
    const cellY = Math.floor(pointer.y / this.cellHeight);

    // Ensure the click is within the board bounds
    if (cellX >= 0 && cellX < this.width && cellY >= 0 && cellY < this.height) {
      this.checkCell(cellX, cellY);
    }
  }

  /**
   * Generates a new game board (populates this.grid with cells)
   */
  generateBoard(
    cellWidth: number,
    cellHeight: number,
    width: number,
    height: number
  ) {
    for (let i = 0; i < width; i++) {
      this.grid[i] = [];
      for (let j = 0; j < height; j++) {
        const cell = new Cell(
          this.scene,
          i * cellWidth,
          j * cellHeight,
          cellWidth,
          cellHeight,
          CellContent.EMPTY
        );
        this.grid[i][j] = cell;
        this.add(cell); // Add cell to the container
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
    cell.update();
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

    this.setFillStyle(0x808080); // Grey for hidden cells

    this.setStrokeStyle(1, 0x000000); // Black border for all cells
  }

  update() {
    if (this.cellState === CellState.REVEALED) {
      if (this.contains === CellContent.HAZARD) {
        this.setFillStyle(0xff0000);
      } else if (this.contains === CellContent.EMPTY) {
        this.setFillStyle(0xffffff);
      }
    } else if (this.cellState === CellState.FLAGGED) {
      this.setFillStyle(0xffff00);
    }
  }
}

export enum CellState {
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
