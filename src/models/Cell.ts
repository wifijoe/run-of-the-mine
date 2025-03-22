import GameBoard from "./GameBoard";

class Cell extends Phaser.GameObjects.Rectangle {
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
    exitImageName: string,
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
    this.on("pointerdown", () => {
      if (this.cellState != CellState.HIDDEN) {
        // hidden cells are unclickable
        if (this.contains === CellContent.WALL) {
          return; // Don't do anything if the cell is a wall
        }
        if (this.contains === CellContent.EXIT) {
          board.winLevel();
          return;
        }
        const cellContains = this.board.checkCell(
          this.getGridX(),
          this.getGridY()
        );
        if (cellContains === CellContent.HAZARD) {
          this.cellState = CellState.REVEALED;
          board.loseGame();
        }
      }
    });
  }

  update() {
    this.updateAppearance();
  }

  updateAppearance() {
    const bounds = this.getBounds(); // Get world bounds of the cell
    if (this.cellState === CellState.HIDDEN) {
      this.setFillStyle(0x808080); // Grey for hidden cells
    } else if (this.cellState === CellState.FLAGGED) {
      this.setFillStyle(0xffff00); // whatever color this is for flagged cells
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
