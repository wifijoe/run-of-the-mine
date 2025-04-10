import { Compass } from "./GameBoard";
import GameBoard from "./GameBoard2";
import GameScene from "../scenes/GameScene";
class Level {
  board: GameBoard;
  timePlayed: number;
  points: number;
  hasWon: boolean;
  levelDifficulty: number;

  constructor(
    scene: GameScene,
    x: number,
    y: number,
    width: number,
    height: number,
    cellWidth: number,
    cellHeight: number,
    levelDifficulty: number
  ) {
    this.board = new GameBoard(
      x,
      y,
      width,
      height,
      cellWidth,
      cellHeight,
      Compass.SOUTH,
      scene
    );
    this.timePlayed = 0;
    this.points = 0;
    this.hasWon = false;
    this.levelDifficulty = levelDifficulty;
  }

  startLevel() {
    this.board.revealStart();
  }
}

export default Level;
