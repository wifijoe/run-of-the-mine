import GameBoard from "./GameBoard";

// This class represents a wrapper around a Phaser.Tilemaps.Tile
// It handles the tile's appearance and behavior
class Cell extends Phaser.GameObjects.Rectangle {
  tile: Phaser.Tilemaps.Tile;
  cellState: CellState;
  contains: CellContent;
  adjacentMines: number;
  textOfCell: Phaser.GameObjects.Text;
  board: GameBoard;
  image: Phaser.GameObjects.Image;
  imageName: string;
  exitImageName: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    tile: Phaser.Tilemaps.Tile,
    exitImageName: string,
    contains: CellContent,
    board: GameBoard
  ) {
    super(scene, x, y, width, height);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.tile = tile;
    this.cellState = CellState.HIDDEN;
    this.contains = contains;
    this.adjacentMines = 0;
    this.board = board;
    this.exitImageName = exitImageName;

    // Randomly switch between "stony" and "speckled"
    const random = Math.random();
    this.imageName = random < 0.5 ? "speckled" : "stony";

    // Store custom properties on the tile
    this.tile.properties = this.tile.properties || {};
    this.tile.properties.cellState = this.cellState;
    this.tile.properties.contains = this.contains;
    this.tile.properties.adjacentMines = this.adjacentMines;
    this.tile.properties.imageName = this.imageName;
    this.tile.properties.exitImageName = this.exitImageName;

    this.updateAppearance();

    // Set up click handling for this tile
    this.setupInteraction(scene);
  }

  setupInteraction(scene: Phaser.Scene) {
    // Calculate world position for this tile
    const worldX = this.getBoundsX();
    const worldY = this.getBoundsY();

    // Create an invisible interactive rectangle over this tile
    const hitArea = scene.add.rectangle(
      worldX,
      worldY,
      this.tile.width,
      this.tile.height,
      0xffffff,
      0
    );

    hitArea.setInteractive();
    hitArea.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.button === 0) {
        // Left click
        if (
          this.cellState != CellState.HIDDEN &&
          this.cellState != CellState.FLAGGED
        ) {
          this.handleCellContent();
        }
      } else if (pointer.button === 2) {
        // Right click
        if (this.cellState == CellState.FLAGGED) {
          this.cellState = CellState.VISIBLE;
        } else if (this.cellState == CellState.VISIBLE) {
          this.cellState = CellState.FLAGGED;
        } else if (this.cellState == CellState.REVEALED) {
          //TODO: place a bomb
        }

        // Update the tile property
        this.tile.properties.cellState = this.cellState;
        this.updateAppearance();
      }
    });

    // Store the hit area on the tile properties for later reference
    this.tile.properties.hitArea = hitArea;
  }

  update() {
    this.updateAppearance();
  }

  /**
   * Updates the appearance of the cell based on its state and content.
   */
  updateAppearance() {
    // Get world position for the center of this tile
    const centerX = this.getBoundsX();
    const centerY = this.getBoundsY();

    // Remove any existing images for this tile
    if (this.image) {
      this.image.destroy();
    }

    // Update the tile index based on state and content
    if (this.cellState === CellState.HIDDEN) {
      this.tile.index = TileIndices.HIDDEN;
    } else if (this.cellState === CellState.FLAGGED) {
      this.tile.index = TileIndices.HIDDEN; // Keep the base tile as hidden
      this.image = this.board.scene.add.image(centerX, centerY, "flag");
      this.image.setDepth(1); // Ensure flag appears above tile
    } else if (this.contains === CellContent.WALL) {
      this.tile.index = TileIndices.WALL;
    } else if (this.contains === CellContent.EXIT) {
      this.tile.index = TileIndices.EXIT;
      this.image = this.board.scene.add.image(
        centerX,
        centerY,
        this.exitImageName
      );
      this.image.setDepth(1);
    } else if (this.cellState === CellState.VISIBLE) {
      this.tile.index = TileIndices.VISIBLE;
      this.image = this.board.scene.add.image(
        centerX,
        centerY,
        this.imageName + "_brown"
      );
      this.image.setDepth(1);
    } else if (this.contains === CellContent.EMPTY) {
      // Revealed empty cell
      if (this.adjacentMines > 0) {
        this.tile.index = TileIndices.REVEALED;
        this.image = this.board.scene.add.image(
          centerX,
          centerY,
          this.imageName + "_tan"
        );
        this.image.setDepth(1);

        // Add or update number text
        if (!this.textOfCell) {
          this.textOfCell = this.board.scene.add.text(
            centerX,
            centerY,
            this.adjacentMines.toString(),
            {
              fontSize: "20px",
              color: "#000000",
            }
          );
          this.textOfCell.setOrigin(0.5);
          this.textOfCell.setDepth(2); // Ensure text is above the tile image
        } else {
          this.textOfCell.setPosition(centerX, centerY);
          this.textOfCell.setDepth(2);
        }
      } else {
        this.tile.index = TileIndices.REVEALED;
        this.image = this.board.scene.add.image(
          centerX,
          centerY,
          this.imageName + "_tan"
        );
        this.image.setDepth(1);
      }
    } else if (this.contains === CellContent.HAZARD) {
      this.tile.index = TileIndices.HAZARD;
      this.image = this.board.scene.add.image(centerX, centerY, "mine");
      this.image.setDepth(1);
    }
  }

  /**
   * Handles the content of the cell based on its state and content.
   */
  private handleCellContent(): void {
    if (this.contains === CellContent.WALL) {
      return; // Don't do anything if the cell is a wall
    } else if (this.contains === CellContent.EXIT) {
      this.board.winLevel();
      return;
    } else if (this.contains === CellContent.HAZARD) {
      this.cellState = CellState.REVEALED;
      this.tile.properties.cellState = this.cellState;
      this.board.loseGame();
    } else if (this.cellState === CellState.REVEALED) {
      this.board.movePlayer(this.getGridX(), this.getGridY());
    } else {
      this.board.revealCell(this.getGridX(), this.getGridY());
    }
  }

  // Helper methods to get grid position
  getGridX(): number {
    return this.tile.x;
  }

  getGridY(): number {
    return this.tile.y;
  }

  getBoundsX(): number {
    return this.getBounds().x;
  }

  getBoundsY(): number {
    return this.getBounds().y;
  }

  // Method to clean up resources when cell is no longer needed
  destroy() {
    if (this.image) {
      this.image.destroy();
    }
    if (this.textOfCell) {
      this.textOfCell.destroy();
    }
    if (this.tile.properties.hitArea) {
      this.tile.properties.hitArea.destroy();
    }
  }
}

// Define tile indices for the tilemap
export enum TileIndices {
  HIDDEN = 0,
  VISIBLE = 1,
  REVEALED = 2,
  WALL = 3,
  EXIT = 4,
  HAZARD = 5,
  NUMBER_1 = 6,
  NUMBER_2 = 7,
  NUMBER_3 = 8,
  NUMBER_4 = 9,
  NUMBER_5 = 10,
  NUMBER_6 = 11,
  NUMBER_7 = 12,
  NUMBER_8 = 13,
  FLAG = 14,
}

export enum CellState {
  HIDDEN,
  VISIBLE,
  REVEALED,
  FLAGGED,
}

export enum CellContent {
  EMPTY,
  HAZARD,
  TREASURE,
  WALL,
  EXIT,
}

export default Cell;
