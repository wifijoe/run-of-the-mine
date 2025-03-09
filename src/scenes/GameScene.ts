import Phaser from "phaser";
import GameBoard from "../models/GameBoard";

class GameScene extends Phaser.Scene {
  private gameBoard: GameBoard;
  gameEndText: Phaser.GameObjects.Text;

  constructor() {
    super("GameScene");
  }

  create() {
    const cellSize = 32;
    const boardWidth = 20;

    const x =
      (this.game.config.width as number) / 2 - cellSize * (boardWidth / 2);
    const y =
      (this.game.config.height as number) / 2 - cellSize * (boardWidth / 2);

    this.gameBoard = new GameBoard(
      this,
      x,
      y,
      boardWidth,
      boardWidth,
      cellSize,
      cellSize
    );
    this.add.existing(this.gameBoard);
  }
}

export default GameScene;
