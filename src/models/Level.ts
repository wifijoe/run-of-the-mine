import Board from "./Board";
import GameBoard, { Compass } from "./GameBoard"
import { Player } from "./Player";
import ShopBoard from "./ShopBoard";

class Level {
  board: Board;
  timePlayed: number;
  points: number;
  hasWon: boolean;
  levelDifficulty: number[];
  player: Player;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    cellWidth: number,
    cellHeight: number,
    levelDifficulty: number[],
    levelType: number
  ) {
    console.log("levelDifficulty: ", levelDifficulty);
    if (levelType == 1) {
      this.board = new GameBoard(
        scene,
        x,
        y,
        width,
        height,
        cellWidth,
        cellHeight,
        Compass.SOUTH,
        levelDifficulty[2]
      );
      this.timePlayed = 0;
      this.points = 0;
      this.hasWon = false;
      this.levelDifficulty = levelDifficulty;

    } else if (levelType == 2) {
      this.board = new ShopBoard(
        scene,
        x,
        y,
        width,
        height,
        cellWidth,
        cellHeight
      );
    }
  }

  startLevel() {
    this.board.revealStart();
  }
}

export default Level;
