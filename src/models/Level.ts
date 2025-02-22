import GameBoard from "./GameBoard";

class Level extends Phaser.Scene {
  board: GameBoard;
  playerPosition: [number, number];
  timePlayed: number;
  points: number;
  hasWon: boolean;
}

export default Level;
