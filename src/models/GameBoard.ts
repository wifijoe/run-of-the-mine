import GameScene from "../scenes/GameScene";
import Cell, { CellContent, CellState } from "./Cell";
import { Player } from "./Player";

class GameBoard extends Phaser.GameObjects.Container {
  grid: Cell[][];
  numberOfMines: number;
  cellWidth: number;
  cellHeight: number;
  boardWidth: number;
  boardHeight: number;
  gameOver: boolean = false;
  playerPosition: [number, number];
  entranceDirection: Compass;
  player: Player;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    cellWidth: number,
    cellHeight: number,
    entranceDirection: Compass,
    player: Player
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
    this.player = player;
    //todo: put the player in the revealed space by the entrance of the board
    this.generateBoard(cellWidth, cellHeight, width, height, entranceDirection);

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
    entranceDirection: Compass
  ) {
    this.entranceDirection = entranceDirection;
    //randomly select four points for the exits/entrance
    const exits = [
      Math.floor(Math.random() * (width - 2)) + 1, // north exit west cell
      Math.floor(Math.random() * (height - 2)) + 1, // east exit north cell
      Math.floor(Math.random() * (width - 2)) + 1, // south exit west cell
      Math.floor(Math.random() * (height - 2)) + 1, // west exit north cell
    ];

    for (let i = 0; i < width; i++) {
      this.grid[i] = [];
      for (let j = 0; j < height; j++) {
        let cellContent = CellContent.EMPTY;
        let exitImageName = "";
        // Create wall cells around the border
        if (i === 0 || i === width - 1 || j === 0 || j === height - 1) {
          cellContent = CellContent.WALL;

          // Create exit cells in two cells of each edge
          // top
          if ((i === exits[0] || i === exits[0] + 1) && j === 0) {
            if (entranceDirection != Compass.NORTH) {
              cellContent = CellContent.EXIT;
            }
            // TODO: get an entrance sprite (collapsed tunnel?) and use in all cases
            if (i === exits[0]) {
              exitImageName = "exit_top_left";
            } else {
              exitImageName = "exit_top_right";
            }
          } // bottom
          else if ((i === exits[2] || i === exits[2] + 1) && j === height - 1) {
            if (entranceDirection != Compass.SOUTH) {
              cellContent = CellContent.EXIT;
            }
            if (i === exits[2]) {
              exitImageName = "exit_bottom_left";
            } else {
              exitImageName = "exit_bottom_right";
            }
          } // left
          else if ((j === exits[3] || j === exits[3] + 1) && i === 0) {
            if (entranceDirection != Compass.WEST) {
              cellContent = CellContent.EXIT;
            }
            if (j === exits[3]) {
              exitImageName = "exit_left_top";
            } else {
              exitImageName = "exit_left_bottom";
            }
          } // right
          else if ((j === exits[1] || j === exits[1] + 1) && i === width - 1) {
            if (entranceDirection != Compass.EAST) {
              cellContent = CellContent.EXIT;
            }
            if (j === exits[1]) {
              exitImageName = "exit_right_top";
            } else {
              exitImageName = "exit_right_bottom";
            }
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
          this,
          this.scene as GameScene
        );
        this.grid[i][j] = cell;
        this.add(cell); // Add cell to the container
      }
    }

    let startX, startY: number;
    switch (entranceDirection) {
      case Compass.NORTH:
        startX = exits[0];
        startY = 1;
        break;
      case Compass.EAST:
        startX = width - 2;
        startY = exits[1];
        break;
      case Compass.SOUTH:
        startX = exits[2];
        startY = height - 2;
        break;
      case Compass.WEST:
        startX = 1;
        startY = exits[3];
        break;
    }
    // Place mines, avoiding the edge tiles
    this.playerPosition = [startX!, startY!];
    this.placeMines(startX!, startY!, 0.15);
    this.calculateAdjacentMines();
    //  this.revealCell(startX, startY); this breaks for reasons inexplicable to me
  }

  /**
   * Places mines on the game board
   * @param startX x coordinate of the starting cell
   * @param startY y coordinate of the starting cell
   * @param mineDensity density of mines on the board
   */
  placeMines(startX: number, startY: number, mineDensity: number) {
    // place 1 potion
    const x = Math.floor(Math.random() * (this.boardWidth - 2)) + 1;
    const y = Math.floor(Math.random() * (this.boardHeight - 2)) + 1;
    this.grid[x][y].contains = CellContent.POTION;

    this.numberOfMines = this.boardWidth * this.boardHeight * mineDensity;
    let minesPlaced = 0;

    while (minesPlaced < this.numberOfMines) {
      // We need an x and a y that are random and within the bounds of the board
      const x = Math.floor(Math.random() * (this.boardWidth - 2)) + 1;
      const y = Math.floor(Math.random() * (this.boardHeight - 2)) + 1;

      // Check if current position is in the start area
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
   * Reveals all adjacent cells
   * @param x x coordinate of the cell
   * @param y y coordinate of the cell
   */
  revealCell(x: number, y: number) {
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
      this.revealCell(x - 1, y);
      this.revealCell(x + 1, y);
      this.revealCell(x, y - 1);
      this.revealCell(x, y + 1);
      this.revealCell(x - 1, y - 1);
      this.revealCell(x - 1, y + 1);
      this.revealCell(x + 1, y - 1);
      this.revealCell(x + 1, y + 1);
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

  revealStart() {
    this.revealCell(this.playerPosition[0], this.playerPosition[1]);
  }

  movePlayer(x: number, y: number) {
    this.playerPosition = [x, y]; //todo: make this dynamic movement with pathfinding/animation
  }
}

export enum Compass {
  NORTH,
  EAST,
  SOUTH,
  WEST,
}
export default GameBoard;
