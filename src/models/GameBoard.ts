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
  player: Player;
  entranceDirection: Compass;
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
    this.grid = [];
    this.numberOfMines = 0;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.boardWidth = width;
    this.boardHeight = height;
    this.width = width;
    this.height = height;

    //TODO: put the player in the revealed space by the entrance of the board
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
          this
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
    const startCell = this.grid[startX][startY];
    // Place mines, avoiding the edge tiles
    this.player = new Player(
      this.scene,
      startCell.getBoundsX(),
      startCell.getBoundsY()
    );
    this.playerPosition = [startX, startY];
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

  /**
   * Finds the nearest revealed cell to the target coordinates
   * @param targetX Target X coordinate
   * @param targetY Target Y coordinate
   * @returns Array of [x, y] coordinates for the path to the nearest revealed cell
   */
  private findNearestRevealedCell(
    targetX: number,
    targetY: number
  ): [number, number][] {
    const visited = new Set<string>();
    const queue: [number, number][] = [[targetX, targetY]];
    const parent = new Map<string, [number, number]>();

    while (queue.length > 0) {
      const [x, y] = queue.shift()!;
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      visited.add(key);

      // Check if this cell is revealed
      if (this.grid[x][y].cellState === CellState.REVEALED) {
        // Reconstruct path
        const path: [number, number][] = [];
        let current: [number, number] = [x, y];
        while (parent.has(`${current[0]},${current[1]}`)) {
          path.unshift(current);
          current = parent.get(`${current[0]},${current[1]}`)!;
        }
        path.unshift(current);
        return path;
      }

      // Add adjacent cells to queue
      const directions = [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
      ]; // down, right, up, left
      for (const [dx, dy] of directions) {
        const newX = x + dx;
        const newY = y + dy;

        if (
          newX >= 0 &&
          newX < this.boardWidth &&
          newY >= 0 &&
          newY < this.boardHeight
        ) {
          const newKey = `${newX},${newY}`;
          if (!visited.has(newKey)) {
            queue.push([newX, newY]);
            parent.set(newKey, [x, y]);
          }
        }
      }
    }

    return []; // No path found
  }

  /**
   * Moves the player to the specified coordinates with animation
   * @param targetX Target X coordinate in pixels
   * @param targetY Target Y coordinate in pixels
   */
  movePlayer(targetX: number, targetY: number) {
    const targetGridX = Math.floor((targetX - this.x) / this.cellWidth);
    const targetGridY = Math.floor((targetY - this.y) / this.cellHeight);

    // Find path to nearest revealed cell
    const path = this.findNearestRevealedCell(targetGridX, targetGridY);
    if (path.length === 0) return; // No valid path found

    // Animate movement along the path
    let currentStep = 0;
    const moveStep = () => {
      if (currentStep >= path.length) return;

      const [x, y] = path[currentStep];
      const pixelX = this.x + x * this.cellWidth + this.cellWidth / 2;
      const pixelY = this.y + y * this.cellHeight + this.cellHeight / 2;

      // Calculate direction for animation
      const prevX =
        currentStep > 0 ? path[currentStep - 1][0] : this.playerPosition[0];
      const prevY =
        currentStep > 0 ? path[currentStep - 1][1] : this.playerPosition[1];
      const direction = this.getDirection(prevX, prevY, x, y);

      // Play walking animation
      this.player.anims.play(direction, true);

      // Create tween for grid-based movement
      this.scene.tweens.add({
        targets: this.player,
        x: pixelX,
        y: pixelY,
        duration: 300,
        ease: "Linear",
        onComplete: () => {
          currentStep++;
          if (currentStep < path.length) {
            moveStep();
          } else {
            // Update final position
            this.playerPosition = [x, y];
            this.player.anims.play(`idle_${direction}`);
          }
        },
      });
    };

    // Start from the player's current position
    const [startX, startY] = this.playerPosition;
    const startPixelX = this.x + startX * this.cellWidth + this.cellWidth / 2;
    const startPixelY = this.y + startY * this.cellHeight + this.cellHeight / 2;
    this.player.x = startPixelX;
    this.player.y = startPixelY;

    moveStep();
  }

  /**
   * Gets the animation direction based on movement
   */
  private getDirection(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): string {
    if (toY > fromY) return "down";
    if (toY < fromY) return "up";
    if (toX > fromX) return "right";
    return "left";
  }
}

export enum Compass {
  NORTH,
  EAST,
  SOUTH,
  WEST,
}
export default GameBoard;
