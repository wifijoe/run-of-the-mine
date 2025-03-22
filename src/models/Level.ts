import GameBoard from "./GameBoard";

class Level {
  board: GameBoard;
  timePlayed: number;
  points: number;
  hasWon: boolean;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    cellWidth: number,
    cellHeight: number
  ) {
    this.board = new GameBoard(
      scene,
      x,
      y,
      width,
      height,
      cellWidth,
      cellHeight
    );
    this.timePlayed = 0;
    this.points = 0;
    this.hasWon = false;
  }

  startLevel(startX: number, startY: number) {
    this.board.revealCell(startX, startY);
  }
}

export default Level;
