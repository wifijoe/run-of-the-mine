import Cell, { CellContent, CellState, TileIndices } from "./Cell";
import { Player } from "./Player";
import { Pathfinder } from "./Pathfinder";
import { GridEngine, GridEngineConfig } from "grid-engine";
class GameBoard extends Phaser.GameObjects.Container {
  tilemap: Phaser.Tilemaps.Tilemap;
  tileLayer: Phaser.Tilemaps.TilemapLayer;
  cells: Cell[][];
  numberOfMines: number;
  cellWidth: number;
  cellHeight: number;
  boardWidth: number;
  boardHeight: number;
  gameOver: boolean = false;
  playerPosition: [number, number];
  player: Player;
  entranceDirection: Compass;

  private readonly pathfinder: Pathfinder;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    cellWidth: number,
    cellHeight: number,
    entranceDirection: Compass
  ) {
    super(scene, x, y);
    this.cells = [];
    this.numberOfMines = 0;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.boardWidth = width;
    this.boardHeight = height;
    this.width = width;
    this.height = height;
    this.pathfinder = new Pathfinder(this);

    // Create the tilemap
    this.createTilemap();

    // Generate the board with cells
    this.generateBoard(cellWidth, cellHeight, width, height, entranceDirection);

    this.setSize(width * cellWidth, height * cellHeight);
    this.setInteractive();

    // Initialize pathfinder
  }

  createTilemap() {
    // Create a blank tilemap with the specified dimensions
    this.tilemap = this.scene.make.tilemap({
      tileWidth: this.cellWidth,
      tileHeight: this.cellHeight,
      width: this.boardWidth,
      height: this.boardHeight,
    });

    // Add tileset - you should have a tileset image with all the different types of tiles
    const tileset = this.tilemap.addTilesetImage("minesweeper_tiles");
    if (!tileset) {
      throw new Error("Failed to load tileset");
    }

    // Create the main layer where all our game tiles will be placed
    const bounds = this.getBounds();
    const layer = this.tilemap.createBlankLayer(
      "main",
      tileset,
      bounds.x,
      bounds.y
    );
    if (!layer) {
      throw new Error("Failed to create tile layer");
    }
    this.tileLayer = layer;
  }

  /**
   * Generates a new game board (populates this.cells with Cell objects)
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

    // First fill the tilemap with hidden tiles
    for (let i = 0; i < width; i++) {
      this.cells[i] = [];
      for (let j = 0; j < height; j++) {
        // Place a hidden tile at this position
        const tile = this.tileLayer.putTileAt(TileIndices.HIDDEN, i, j);

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

        // Create a cell object that wraps the tile
        const cell = new Cell(
          this.scene,
          this.x + i * cellWidth + cellWidth,
          this.y + j * cellHeight + cellHeight,
          cellWidth,
          cellHeight,
          tile,
          exitImageName,
          cellContent,
          this
        );

        this.cells[i][j] = cell;
      }
    }

    // Set player starting position
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

    const startCell = this.cells[startX][startY];

    // Place the player
    this.player = new Player(
      this.scene,
      startCell.getBoundsX() + cellWidth / 2,
      startCell.getBoundsY() + cellHeight / 2
    );
    this.scene.cameras.main.startFollow(this.player, true);
    this.scene.cameras.main.setFollowOffset(
      -this.player.width / 2,
      -this.player.height / 2
    );
    this.playerPosition = [startX, startY];

    const gridEngineConfig: GridEngineConfig = {
      characters: [
        {
          id: "player",
          sprite: this.player,
          walkingAnimationMapping: 0,
          startPosition: {
            x: startX,
            y: startY,
          },
          offsetY: -4,
        },
      ],
    };

    // this.scene.gridEngine.create(this.tilemap, gridEngineConfig);
    // Place mines
    this.placeMines(startX, startY, 0.15);
    this.calculateAdjacentMines();

    this.scene.add.existing(this.player);
    // this.movePlayer(startX, startY);
    //  this.revealCell(startX, startY); this breaks for reasons inexplicable to me
  }

  /**
   * Places mines on the game board
   * @param startX x coordinate of the starting cell
   * @param startY y coordinate of the starting cell
   * @param mineDensity density of mines on the board
   */
  placeMines(startX: number, startY: number, mineDensity: number) {
    this.numberOfMines = Math.floor(
      this.boardWidth * this.boardHeight * mineDensity
    );
    let minesPlaced = 0;

    while (minesPlaced < this.numberOfMines) {
      // We need an x and a y that are random and within the bounds of the board
      const x = Math.floor(Math.random() * (this.boardWidth - 2)) + 1;
      const y = Math.floor(Math.random() * (this.boardHeight - 2)) + 1;

      // Check if current position is in the start area
      if (Math.abs(x - startX) <= 1 && Math.abs(y - startY) <= 1) {
        continue;
      }

      if (this.cells[x][y].contains === CellContent.EMPTY) {
        this.cells[x][y].contains = CellContent.HAZARD;
        this.cells[x][y].tile.properties.contains = CellContent.HAZARD;
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
        const cell = this.cells[i][j];
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
            if (this.cells[x][y].contains === CellContent.HAZARD) {
              adjacentMines++;
            }
          }
        }
        cell.adjacentMines = adjacentMines;
        cell.tile.properties.adjacentMines = adjacentMines;
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

    const cell = this.cells[x][y];
    if (cell.cellState === CellState.REVEALED) {
      return;
    }

    cell.cellState = CellState.REVEALED;
    cell.tile.properties.cellState = CellState.REVEALED;
    cell.updateAppearance();

    if (cell.adjacentMines === 0 && cell.contains === CellContent.EMPTY) {
      // If cell has no adjacent mines, reveal all surrounding cells
      this.revealCell(x - 1, y);
      this.revealCell(x + 1, y);
      this.revealCell(x, y - 1);
      this.revealCell(x, y + 1);
      this.revealCell(x - 1, y - 1);
      this.revealCell(x - 1, y + 1);
      this.revealCell(x + 1, y - 1);
      this.revealCell(x + 1, y + 1);
    } else {
      // Otherwise just set adjacent cells to visible
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

    const cell = this.cells[x][y];
    if (cell.cellState === CellState.HIDDEN) {
      cell.cellState = CellState.VISIBLE;
      cell.tile.properties.cellState = CellState.VISIBLE;
      cell.updateAppearance();
    }
  }

  /**
   * Reveals all cells (the player selected a mine)
   */
  revealAllCells() {
    for (let i = 0; i < this.boardWidth; i++) {
      for (let j = 0; j < this.boardHeight; j++) {
        this.cells[i][j].cellState = CellState.REVEALED;
        this.cells[i][j].tile.properties.cellState = CellState.REVEALED;
        this.cells[i][j].updateAppearance();
      }
    }
  }

  /**
   * Move the player to a specific position
   * @param x The x-coordinate to move to
   * @param y The y-coordinate to move to
   */
  movePlayer(x: number, y: number) {
    // Convert to grid coordinates if they're world coordinates
    let gridX = x,
      gridY = y;

    if (x >= this.cellWidth || y >= this.cellHeight) {
      gridX = Math.floor(x / this.cellWidth);
      gridY = Math.floor(y / this.cellHeight);
    }

    // Check if position is valid
    if (
      gridX < 0 ||
      gridX >= this.boardWidth ||
      gridY < 0 ||
      gridY >= this.boardHeight
    ) {
      return;
    }

    const cell = this.cells[gridX][gridY];

    // Check if the destination is walkable
    if (cell.contains === CellContent.WALL) {
      return;
    }

    // Check for hazard
    if (cell.contains === CellContent.HAZARD) {
      this.loseGame();
      return;
    }

    // Check for exit
    if (cell.contains === CellContent.EXIT) {
      this.winLevel();
      return;
    }

    // Find path to target using pathfinder
    const path = this.pathfinder.findPath(
      this.playerPosition[0],
      this.playerPosition[1],
      gridX,
      gridY
    );
    if (path.length === 0) return;

    // Animate movement along path
    this.animateMovement(path);
  }

  /**
   * Animate player movement along a path
   * @param path Array of [x,y] coordinates to move through
   */
  private animateMovement(path: [number, number][]) {
    // Remove first position (current position)
    path.shift();

    // Create a tween for each step in the path
    path.forEach(([x, y], index) => {
      const cell = this.cells[x][y];
      const centerX = cell.getBoundsX();
      const centerY = cell.getBoundsY();

      // Calculate direction for animation
      const prevX = index === 0 ? this.playerPosition[0] : path[index - 1][0];
      const prevY = index === 0 ? this.playerPosition[1] : path[index - 1][1];
      const direction = this.getDirection(prevX, prevY, x, y);

      // // Create tween
      // this.scene.tweens.add({
      //   targets: this.player,
      //   x: centerX,
      //   y: centerY,
      //   duration: 200,
      //   onStart: () => {
      //     this.player.anims.play(direction, true);
      //   },
      //   onComplete: () => {
      //     // Update player position
      //     this.playerPosition = [x, y];
      //     this.player.x = centerX;
      //     this.player.y = centerY;
      //     // Play idle animation when movement is complete
      //     if (index === path.length - 1) {
      //       this.player.anims.play(`idle_${direction}`, true);
      //     }
      //   },
      // });
      this.scene.gridEngine.moveTo("player", {
        x: centerX,
        y: centerY,
      });
    });
  }

  /**
   * Get the direction string for animation based on movement
   */
  private getDirection(
    prevX: number,
    prevY: number,
    nextX: number,
    nextY: number
  ): string {
    if (nextX > prevX) return "right";
    if (nextX < prevX) return "left";
    if (nextY > prevY) return "down";
    return "up";
  }

  loseGame() {
    this.revealAllCells();
    this.scene.add.text(8, 120, "You lose!", {
      fontSize: "32px",
      color: "#ff0000",
    });
    this.removeInteractive();
    this.gameOver = true;

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

    this.scene.events.emit("levelComplete");
  }

  revealStart() {
    this.revealCell(this.playerPosition[0], this.playerPosition[1]);
  }

  // Clean up resources when board is destroyed
  destroy() {
    // Clean up all cell resources
    for (let i = 0; i < this.boardWidth; i++) {
      for (let j = 0; j < this.boardHeight; j++) {
        this.cells[i]?.[j]?.destroy();
      }
    }

    // Call the parent's destroy method
    super.destroy();
  }
}

// Add this if it doesn't exist elsewhere
export enum Compass {
  NORTH,
  EAST,
  SOUTH,
  WEST,
}

export default GameBoard;
