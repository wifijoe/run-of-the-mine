import { Scene } from "phaser";
import GameBoard, { CellState } from "../models/GameBoard";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  gameBoard: GameBoard;
  gameText: Phaser.GameObjects.Text;

  constructor() {
    super("Game");
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x999999);

    // this.background = this.add.image(512, 384, "background");
    // this.background.setAlpha(0.5);

    // this.gameBoard = new GameBoard(this, 512, 384, 10, 10, 10, 10);
    // this.gameBoard.fillColor = 0x000000;
    // this.gameBoard.strokeColor = 0xffffff;
    // this.gameBoard.generateBoard();

    // generate tiles for the game board
    // for (let i = 0; i < this.gameBoard.width; i++) {
    //   for (let j = 0; j < this.gameBoard.height; j++) {
    //     if (this.gameBoard.grid[i][j].cellState == CellState.HIDDEN) {
    //       this.gameBoard.grid[i][j].setInteractive();
    //     } else if (this.gameBoard.grid[i][j].cellState == CellState.REVEALED) {
    //       this.gameBoard.grid[i][j].setInteractive();
    //     }
    //     this.add.existing(this.gameBoard.grid[i][j]);
    //   }
    // }

    this.add.existing(this.gameText);

    this.add.existing(this.gameBoard);
  }
}
