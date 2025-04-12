import GameBoard, { Compass } from "./GameBoard";

class Level {
  board: GameBoard;
  timePlayed: number;
  points: number;
  hasWon: boolean;
  levelDifficulty: number[];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    cellWidth: number,
    cellHeight: number,
    levelDifficulty: number[]
  ) {
    console.log("levelDifficulty: ", levelDifficulty);
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
  }

  startLevel() {
    this.board.revealStart();
  }
}

export default Level;
