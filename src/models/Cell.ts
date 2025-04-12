import GameScene from "../scenes/GameScene";
import Board from "./Board";

class Cell extends Phaser.GameObjects.Rectangle {
  cellState: CellState;
  contains: CellContent;
  adjacentMines: number;
  textOfCell: Phaser.GameObjects.Text;
  board: Board;
  gameScene: GameScene;
  image: Phaser.GameObjects.Image;
  imageName: string;
  exitImageName: string;
  flagImage: Phaser.GameObjects.Image | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    exitImageName: string,
    width: number,
    height: number,
    contains: CellContent,
    board: Board,
    gameScene: GameScene,
    cellState: CellState = CellState.HIDDEN
  ) {
    super(scene, x, y, width, height);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.cellState = cellState;
    this.contains = contains;
    this.adjacentMines = 0;
    this.board = board;
    this.gameScene = gameScene;
    this.exitImageName = exitImageName;
    // randomly switch between "stony" and "speckled"
    const random = Math.random();
    this.imageName = "stony";
    if (random < 0.5) {
      this.imageName = "speckled";
    }

    this.updateAppearance();

    // this.setStrokeStyle(1, 0x000000);
    // Black border for all cells

    // Ensure the hit area is set correctly
    this.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, width, height),
      Phaser.Geom.Rectangle.Contains
    );

    // Add an event listener to detect clicks on this cell
    this.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      board.clickCell(this, pointer);
      this.update();
    });
  }

  update() {
    this.updateAppearance();
  }

  updateAppearance() {
    if (this.flagImage) {
      this.flagImage.destroy();
    }

    const bounds = this.getBounds(); // Get world bounds of the cell
    if (this.cellState === CellState.HIDDEN) {
      this.setFillStyle(0x808080); // Grey for hidden cells
    } else if (this.cellState === CellState.FLAGGED) {
      this.flagImage = this.scene.add.image(this.x + 192, this.y + 64, "flag");
      this.flagImage.setScale(0.0157);
    } else if (this.contains === CellContent.WALL) {
      // revealed/visible doesn't
      this.setFillStyle(0x000000); // Black          // matter for walls or exit
    } else if (this.contains === CellContent.EXIT) {
      this.image = this.scene.add.image(
        bounds.centerX,
        bounds.centerY,
        this.exitImageName
      );
    } else if (this.cellState === CellState.VISIBLE) {
      this.image = this.scene.add.image(
        bounds.centerX,
        bounds.centerY,
        this.imageName + "_brown"
      );
      this.image.setToTop();
    } else if (this.contains === CellContent.EMPTY) {
      // all branches from here are revealed
      this.setFillStyle(0xffffff);
      const bounds = this.getBounds(); // Get world bounds of the cell
      this.image = this.scene.add.image(
        bounds.centerX,
        bounds.centerY,
        this.imageName + "_tan"
      );
      if (this.adjacentMines > 0) {
        //todo: bug here (I think). If already-revealed cell is updated, the number disapears. I *think* the if block below fails and so the text is not updated, leading to it being behind the cell's image.
        if (!this.textOfCell) {
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
        } else {
          this.textOfCell.setAbove(this.image);
        }
      }
    } else if (this.contains === CellContent.HAZARD) {
      this.setFillStyle(0xff0000);
    }
  }

  // Helper methods to get grid position
  getGridX(): number {
    return Math.floor(this.x / this.width);
  }

  getGridY(): number {
    return Math.floor(this.y / this.height);
  }
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
