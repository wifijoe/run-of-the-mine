import Board from "./Board";
import Cell, { CellContent, CellState } from "./Cell";

class ShopBoard extends Board {
  grid: Cell[][];
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
    super(scene, x, y, width, height, cellWidth, cellHeight);
    this.grid = [];
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.boardWidth = width;
    this.boardHeight = height;
    // this.setSize(width * cellWidth, height * cellHeight);
    this.generateBoard(cellWidth, cellHeight, width, height);
    this.setInteractive();
  }

  clickCell(cell: Cell, pointer: Phaser.Input.Pointer): void {
    throw new Error("Method not implemented.");
  }

  generateBoard(
    cellWidth: number,
    cellHeight: number,
    width: number,
    height: number
  ) {
    const middleRow = Math.floor(height / 2);

    const position3rdQuadrant = Math.floor(width / 4);
    const position4thQuadrant = Math.floor((3 * width) / 4);

    for (let i = 0; i < width; i++) {
      this.grid[i] = [];
      for (let j = 0; j < height; j++) {
        const cell = new Cell(
          this.scene,
          this.x + i * cellWidth,
          this.y + j * cellHeight,
          "",
          cellWidth,
          cellHeight,
          CellContent.EMPTY,
          this as any
        );

        // Set all cells to revealed state
        cell.cellState = CellState.REVEALED;

        if (
          j === middleRow &&
          (i === position3rdQuadrant || i === position4thQuadrant)
        ) {
          cell.contains = CellContent.EXIT;
        }

        cell.update();
        cell.setFillStyle(0x000000, 0); // Transparent fill

        this.grid[i][j] = cell;
        this.add(cell);
      }
    }
  }
}

export default ShopBoard;
