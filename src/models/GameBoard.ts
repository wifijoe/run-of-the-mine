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
    cellHeight: number
  ) {
    super(scene, x, y);
    this.grid = [];
    this.numberOfMines = 0;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.boardWidth = width;
    this.boardHeight = height;
    this.width = width;
    this.height = height;

    this.generateBoard(cellWidth, cellHeight, width, height);

    this.setSize(width * cellWidth, height * cellHeight);

    this.setInteractive();

    // // Handle click events on the board
    // this.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
    //   console.log("Pointer down on board", pointer);
    //   this.handlePointerDown(pointer);
    // });
  }

  /**
   * Handles click events on the board
   * @param pointer the pointer that was clicked
   */
  handlePointerDown(pointer: Phaser.Input.Pointer) {
    const localX = pointer.x - this.x;
    const localY = pointer.y - this.y;

    const cellX = Math.floor(localX / this.cellWidth);
    const cellY = Math.floor(localY / this.cellHeight);

    // Ensure the click is within the board bounds
    if (
      cellX >= 0 &&
      cellX < this.boardWidth &&
      cellY >= 0 &&
      cellY < this.boardHeight
    ) {
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
          CellContent.EMPTY,
          this
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
    startX: number = this.boardWidth - 1,
    startY: number = Math.floor(this.boardHeight / 2),
    mineDensity: number = 0.15
  ) {
    this.numberOfMines = this.boardWidth * this.boardHeight * mineDensity;
    let minesPlaced = 0;

    while (minesPlaced < this.numberOfMines) {
      // We need an x and a y that are random and within the bounds of the board
      const x = Math.floor(Math.random() * this.boardWidth);
      const y = Math.floor(Math.random() * this.boardHeight);

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
    for (let i = 0; i < this.boardWidth; i++) {
      for (let j = 0; j < this.boardHeight; j++) {
        const cell = this.grid[i][j];
        if (cell.contains === CellContent.HAZARD) {
          continue;
        }

        let adjacentMines = 0;
        for (let x = i - 1; x <= i + 1; x++) {
          for (let y = j - 1; y <= j + 1; y++) {
            if (
              x < 0 ||
              x >= this.boardWidth ||
              y < 0 ||
              y >= this.boardHeight
            ) {
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
    // Check to make sure x and y are valid
    if (x < 0 || x >= this.boardWidth || y < 0 || y >= this.boardHeight) {
      return;
    }
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

  /**
   * Reveals all cells (the player selected a mine)
   *
   */
  revealAllCells() {
    for (let i = 0; i < this.boardWidth; i++) {
      for (let j = 0; j < this.boardHeight; j++) {
        this.grid[i][j].cellState = CellState.REVEALED;
        this.grid[i][j].update();
      }
    }
  }

  loseGame() {
    this.revealAllCells();
    this.scene.add.text(8, 120, "You lose!", {
      fontSize: "32px",
      color: "#ff0000",
    });
    this.removeInteractive();
  }
}

class Cell extends Phaser.GameObjects.Rectangle {
  cellState: CellState;
  contains: CellContent;
  adjacentMines: number;
  textOfCell: Phaser.GameObjects.Text;
  board: GameBoard;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    contains: CellContent,
    board: GameBoard
  ) {
    super(scene, x, y, width, height);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.cellState = CellState.HIDDEN;
    this.contains = contains;
    this.adjacentMines = 0;
    this.board = board;

    this.setFillStyle(0x808080); // Grey for hidden cells

    this.setStrokeStyle(1, 0x000000);
    // Black border for all cells

    // Ensure the hit area is set correctly
    this.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, width, height),
      Phaser.Geom.Rectangle.Contains
    );

    // Add an event listener to detect clicks on this cell
    this.on("pointerdown", () => {
      const cellContains = this.board.checkCell(
        this.getGridX(),
        this.getGridY()
      );
      if (cellContains === CellContent.HAZARD) {
        this.cellState = CellState.REVEALED;
        board.loseGame();
      }
    });
  }

  // Helper methods to get grid position
  getGridX(): number {
    return Math.floor(this.x / this.width);
  }

  getGridY(): number {
    return Math.floor(this.y / this.height);
  }

  update() {
    if (this.cellState === CellState.REVEALED) {
      if (this.contains === CellContent.HAZARD) {
        this.setFillStyle(0xff0000);
      } else if (this.contains === CellContent.EMPTY) {
        this.setFillStyle(0xffffff);
        if (this.adjacentMines > 0) {
          if (!this.textOfCell) {
            const bounds = this.getBounds(); // Get world bounds of the cell
            this.textOfCell = this.scene.add.text(
              bounds.centerX, // World X position
              bounds.centerY, // World Y position
              this.adjacentMines.toString(),
              {
                fontSize: "20px",
                color: "#000000",
              }
            );

            this.textOfCell.setOrigin(0.5); // Center the text inside the cell
            this.scene.add.existing(this.textOfCell); // Ensure it's added to the scene
          }
        }
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
