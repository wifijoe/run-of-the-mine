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
    cellHeight: number
  ) {
    this.board = new GameBoard(
      scene,
      x,
      y,
      width,
      height,
      cellWidth,
      cellHeight,
      this.movePlayer
    );
    this.playerPosition = [0, 0]; //todo: start the player in the starting revealed space of the GameBoard
    this.timePlayed = 0;
    this.points = 0;
    this.hasWon = false;
  }

  startLevel(startX: number, startY: number) {
    this.board.revealCell(startX, startY);
  }

  movePlayer(x: number, y: number) {
    this.playerPosition = [x, y]; //todo: make this dynamic movement with pathfinding/animation
  }
}

export default Level;
