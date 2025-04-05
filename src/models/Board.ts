import Cell from "./Cell";

abstract class Board extends Phaser.GameObjects.Container {
  grid: Cell[][];
  boardWidth: number;
  boardHeight: number;
  cellWidth: number;
  cellHeight: number;
  playerPosition: [number, number];

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
    this.boardWidth = width;
    this.boardHeight = height;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.width = width;
    this.height = height;

    // this.setSize(width * cellWidth, height * cellHeight);
    this.setInteractive();
  }

  /**
   * Checks if coordinates are within the bounds of the board
   */
  isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.boardWidth && y >= 0 && y < this.boardHeight;
  }

  /**
   * Gets a cell at the specified coordinates if valid
   */
  getCell(x: number, y: number): Cell | null {
    if (!this.isValidPosition(x, y)) {
      return null;
    }
    return this.grid[x][y];
  }

  /**
   * Abstract method that child classes must implement to handle cell clicks
   * @param cell The cell that was clicked
   */
  abstract clickCell(cell: Cell, pointer: Phaser.Input.Pointer): void;

  /**
   * Abstract method that child classes must implement to generate their board
   */
  abstract generateBoard(...args: any[]): void;
}

export default Board;
