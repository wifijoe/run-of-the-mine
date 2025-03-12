import GameBoard from "./GameBoard";

class Level {
  board: GameBoard;
  playerPosition: [number, number];
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
    cellHeight: number,
    startX: number = width - 1,
    startY: number = Math.floor(height / 2)
  ) {
    this.board = new GameBoard(
      scene,
      x,
      y,
      width,
      height,
      cellWidth,
      cellHeight,
      startX,
      startY
    );
    // this.board.revealAdjacentCells(startX, startY);
    this.playerPosition = [0, 0];
    this.timePlayed = 0;
    this.points = 0;
    this.hasWon = false;
  }

  startLevel(startX: number, startY: number) {
    this.board.revealAdjacentCells(19, 10);
  }
}

export default Level;
