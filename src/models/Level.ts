import GameBoard, { Compass } from "./GameBoard";
import { Player } from "./Player";

class Level {
  board: GameBoard;
  timePlayed: number;
  points: number;
  hasWon: boolean;
  levelDifficulty: number;
  player: Player;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    cellWidth: number,
    cellHeight: number,
    levelDifficulty: number,
    player: Player
  ) {
    this.player = player;
    this.board = new GameBoard(
      scene,
      x,
      y,
      width,
      height,
      cellWidth,
      cellHeight,
      Compass.SOUTH,
      this.player
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
