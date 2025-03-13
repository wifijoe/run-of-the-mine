import Phaser from "phaser";
import GameBoard from "../models/GameBoard";
import Level from "../models/Level";

class GameScene extends Phaser.Scene {
  private level: Level;
  gameEndText: Phaser.GameObjects.Text;

  score: number = 0;
  scoreText!: Phaser.GameObjects.Text;

  elapsedTime: number = 0;
  timerText!: Phaser.GameObjects.Text;
  timerEvent!: Phaser.Time.TimerEvent;

  isFlagMode: boolean = false;
  maxFlags: number = 20;
  remainingFlags: number = 20;
  flagText!: Phaser.GameObjects.Text;
  modeText!: Phaser.GameObjects.Text;
  flagButton!: Phaser.GameObjects.Rectangle;

  constructor() {
    super("GameScene");
  }

  preload() {
    // Attribution: "Designed by 0melapics / Freepik"
    this.load.image("dirt", "assets/dirt.jpg");
  }

  create() {
    const cellSize = 32;
    const boardWidth = 20;

    this.add.image(0, 0, "dirt").setOrigin(0, 0);

    const x =
      (this.game.config.width as number) / 2 - cellSize * (boardWidth / 2);
    const y =
      (this.game.config.height as number) / 2 - cellSize * (boardWidth / 2);

    this.level = new Level(
      this,
      x,
      y,
      boardWidth,
      boardWidth,
      cellSize,
      cellSize
    );
    this.add.existing(this.level.board);
    this.level.startLevel(boardWidth - 1, Math.floor(boardWidth / 2));

    // center
    const centerX = this.cameras.main.width / 2;
    //const centerY = this.cameras.main.height / 2;

    // title of game
    this.add.text(40, 15, "Run of the Mine", {
      fontSize: "30px",
      color: "#ffffff",
      fontFamily: '"Orbitron", sans-serif',
    });

    // game score, currently not synced with anything
    this.scoreText = this.add
      .text(centerX * 2 - 40, 30, "Score: 0", {
        fontSize: "30px",
        color: "#ffffff",
        fontFamily: '"Orbitron", sans-serif',
      })
      .setOrigin(1, 0);

    // timer, currently not synced with anything
    this.timerText = this.add
      .text(centerX * 2 - 40, 70, "Time: 0s", {
        fontSize: "30px",
        color: "#ff0000",
        fontFamily: '"Orbitron", sans-serif',
      })
      .setOrigin(1, 0);

    // timer functionality
    this.timerEvent = this.time.addEvent({
      delay: 1000, // 1 second
      callback: () => this.updateTimer(),
      callbackScope: this,
      loop: true,
    });

    // flags remaining display, currently not synced with anything
    this.flagText = this.add.text(40, 70, `Flags: ${this.remainingFlags}`, {
      fontSize: "24px",
      color: "#ffffff",
      fontFamily: '"Orbitron", sans-serif',
    });
  }
  updateScore(points: number) {
    this.score += points;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  updateTimer() {
    this.elapsedTime++;
    this.timerText.setText(`Time: ${this.elapsedTime}s`);
  }

  levelCompleted() {
    // reset board for new level
  }
}

export default GameScene;
