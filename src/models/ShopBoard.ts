import GameScene from "../scenes/GameScene";
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
    this.width = width;
    this.height = height;

    this.generateBoard(cellWidth, cellHeight, width, height);

    this.setSize(width * cellWidth, height * cellHeight);

    this.setInteractive();
  }

  clickCell(cell: Cell, pointer: Phaser.Input.Pointer): void {
    console.log("Shop Cell clicked:", cell.x, cell.y, pointer.button);
    if (pointer.button === 0) {
      if (cell.contains === CellContent.WALL) {
        return; // Don't do anything if the cell is a wall
      } else if (cell.contains === CellContent.EXIT) {
        console.log("Exit clicked!");
        this.nextLevel(cell);
        return;
      } else {
        console.log("returning");
        return;
      }
    } else if (pointer.button === 2) {
      return;
    }
  }

  nextLevel(cell: Cell) {
    if (cell.exitImageName === "exit_top_left") {
      this.scene.events.emit("nextLevel", false);
    } else if (cell.exitImageName === "exit_top_right") {
      this.scene.events.emit("nextLevel", true);
    }
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
        let cellContent = CellContent.EMPTY;
        let exitImageName = "";
        if (i === 0 || i === width - 1 || j === 0 || j === height - 1) {
          cellContent = CellContent.WALL;
        }

        if (
          j === middleRow &&
          (i === position3rdQuadrant || i === position4thQuadrant)
        ) {
          cellContent = CellContent.EXIT;
          {
            i === position3rdQuadrant
              ? (exitImageName = "exit_top_left")
              : "exit_top_right";
          }
          //Not a clue why this needs to be done both ways like this. I could do if statements
          //but I am leaving it to show the stupidity of it
          {
            i === position4thQuadrant
              ? (exitImageName = "exit_top_right")
              : "exit_top_left";
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
          this.scene as GameScene,
          CellState.REVEALED
        );

        // cell.update();
        // cell.setFillStyle(0x000000, 0); // Transparent fill

        this.grid[i][j] = cell;
        this.add(cell);
        cell.updateAppearance();
      }
    }
  }
}

export default ShopBoard;
