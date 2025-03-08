import Phaser from "phaser";
import GameBoard from "../models/GameBoard";

class GameScene extends Phaser.Scene {
  private gameBoard: GameBoard;

  constructor() {
    super("GameScene");
  }

  preload() {
    // Load any necessary assets here
  }

  create() {
    this.gameBoard = new GameBoard(this, 0, 0, 400, 400, 20, 20);
    this.add.existing(this.gameBoard);
  }

  //   update(time: number, delta: number) {
  //     // Update logic goes here
  //   }
}

export default GameScene;
