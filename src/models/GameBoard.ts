import Cell, { CellContent, CellState } from "./Cell";

class GameBoard extends Phaser.GameObjects.Container {
  grid: Cell[][];
  numberOfMines: number;
  cellWidth: number;
  cellHeight: number;
  boardWidth: number;
  boardHeight: number;
  gameOver: boolean = false;

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
  }

  /**
   * Generates a new game board (populates this.grid with cells)
   */
  generateBoard(
    cellWidth: number,
    cellHeight: number,
    width: number,
    height: number,
    startX: number = width - 2,
    startY: number = Math.floor(height / 2) - 1
  ) {
    for (let i = 0; i < width; i++) {
      this.grid[i] = [];
      for (let j = 0; j < height; j++) {
        let cellContent = CellContent.EMPTY;
        let exitImageName = "";
        // Create wall cells around the border
        if (i === 0 || i === width - 1 || j === 0 || j === height - 1) {
          cellContent = CellContent.WALL;

          // Create exit cells in the middle two cells of each edge
          if (
            (i === Math.floor(width / 2) || i === Math.floor(width / 2) - 1) &&
            j === 0
          ) {
            // top
            if (i === Math.floor(width / 2)) {
              exitImageName = "exit_top_right";
            } else {
              exitImageName = "exit_top_left";
            }

            cellContent = CellContent.EXIT;
          } else if (
            // bottom
            (i === Math.floor(width / 2) || i === Math.floor(width / 2) - 1) &&
            j === height - 1
          ) {
            if (i === Math.floor(width / 2)) {
              exitImageName = "exit_bottom_right";
            } else {
              exitImageName = "exit_bottom_left";
            }
            cellContent = CellContent.EXIT;
          } else if (
            // left
            (j === Math.floor(height / 2) ||
              j === Math.floor(height / 2) - 1) &&
            i === 0
          ) {
            if (j === Math.floor(height / 2)) {
              exitImageName = "exit_left_bottom";
            } else {
              exitImageName = "exit_left_top";
            }
            cellContent = CellContent.EXIT;
          } else if (
            // right
            (j === Math.floor(height / 2) ||
              j === Math.floor(height / 2) - 1) &&
            i === width - 1
          ) {
            if (j === Math.floor(height / 2)) {
              exitImageName = "exit_right_bottom";
            } else {
              exitImageName = "exit_right_top";
            }
            cellContent = CellContent.EXIT;
          }
        }

        const cell = new Cell(
          this.scene,
          i * cellWidth,
          j * cellHeight,
          exitImageName,
          cellWidth,
          cellHeight,
          cellContent,
          this
        );
        this.grid[i][j] = cell;
        this.add(cell); // Add cell to the container
      }
    }

    // Place mines, avoiding the edge tiles
    this.placeMines(startX, startY, 0.15);
    this.calculateAdjacentMines();
  }

  /**
   * Places mines on the game board
   * @param startX x coordinate of the starting cell
   * @param startY y coordinate of the starting cell
   * @param mineDensity density of mines on the board
   */
  placeMines(
    startX: number = this.boardWidth - 2,
    startY: number = Math.floor(this.boardHeight / 2) - 1,
    mineDensity: number = 0.15
  ) {
    this.numberOfMines = this.boardWidth * this.boardHeight * mineDensity;
    let minesPlaced = 0;

    while (minesPlaced < this.numberOfMines) {
      // We need an x and a y that are random and within the bounds of the board
      const x = Math.floor(Math.random() * this.boardWidth);
      const y = Math.floor(Math.random() * this.boardHeight);

      // Check if current position is on the edge or the start position
      if (
        x === 0 ||
        x === this.boardWidth - 1 ||
        y === 0 ||
        y === this.boardHeight - 1 ||
        (Math.abs(x - startX) <= 1 && Math.abs(y - startY) <= 1)
      ) {
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
    //  if (cell.cellState != CellState.HIDDEN) {
    if (cell.contains === CellContent.HAZARD) {
      return CellContent.HAZARD;
    }
    if (cell.contains === CellContent.EMPTY) {
      this.revealAdjacentCells(x, y);
    }
    //  }
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
    cell.updateAppearance();
    if (cell.adjacentMines === 0) {
      this.revealAdjacentCells(x - 1, y);
      this.revealAdjacentCells(x + 1, y);
      this.revealAdjacentCells(x, y - 1);
      this.revealAdjacentCells(x, y + 1);
      this.revealAdjacentCells(x - 1, y - 1);
      this.revealAdjacentCells(x - 1, y + 1);
      this.revealAdjacentCells(x + 1, y - 1);
      this.revealAdjacentCells(x + 1, y + 1);
    } else {
      this.setCellVisible(x - 1, y);
      this.setCellVisible(x + 1, y);
      this.setCellVisible(x, y - 1);
      this.setCellVisible(x, y + 1);
      this.setCellVisible(x - 1, y - 1);
      this.setCellVisible(x - 1, y + 1);
      this.setCellVisible(x + 1, y - 1);
      this.setCellVisible(x + 1, y + 1);
    }
  }

  setCellVisible(x: number, y: number) {
    // Check to make sure x and y are valid
    if (x < 0 || x >= this.boardWidth || y < 0 || y >= this.boardHeight) {
      return;
    }
    const cell = this.grid[x][y];
    if (cell.cellState === CellState.HIDDEN) {
      cell.cellState = CellState.VISIBLE;
      cell.updateAppearance();

      return;
    }
    //   cell.update();
  }

  /**
   * Reveals all cells (the player selected a mine)
   *
   */
  revealAllCells() {
    for (let i = 0; i < this.boardWidth; i++) {
      for (let j = 0; j < this.boardHeight; j++) {
        this.grid[i][j].cellState = CellState.REVEALED;
        this.grid[i][j].updateAppearance();
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
    this.gameOver = true;

    // Disable interaction on each cell
    for (let i = 0; i < this.boardWidth; i++) {
      for (let j = 0; j < this.boardHeight; j++) {
        this.grid[i][j].disableInteractive();
      }
    }

    this.scene.events.emit("gameOver");
  }

  winLevel() {
    this.revealAllCells();
    this.scene.add.text(8, 120, "You win!", {
      fontSize: "32px",
      color: "#00ff00",
    });
    this.removeInteractive();
    this.gameOver = true;

    // Disable interaction on each cell
    for (let i = 0; i < this.boardWidth; i++) {
      for (let j = 0; j < this.boardHeight; j++) {
        this.grid[i][j].disableInteractive();
      }
    }

    this.scene.events.emit("levelComplete");
  }
}

export default GameBoard;
