import Phaser from "phaser";
import Level from "../models/Level";

class GameScene extends Phaser.Scene {
  private level: Level;
  gameEndText: Phaser.GameObjects.Text;
  gameOver: boolean = false;

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

  private keydownListener: (event: KeyboardEvent) => void;

  constructor() {
    super("GameScene");
  }

  preload() {
    // Attribution: "Designed by 0melapics / Freepik"
    this.load.image("dirt", "assets/dirt.jpg");
    this.load.image("exit", "assets/tiles/exit.png");
    this.load.image("blank_brown", "assets/tiles/blank_brown.png");
    this.load.image("speckled_brown", "assets/tiles/speckled_brown.png");
    this.load.image("speckled_tan", "assets/tiles/speckled_tan.png");
    this.load.image("stony_brown", "assets/tiles/stony_brown.png");
    this.load.image("stony_tan", "assets/tiles/stony_tan.png");
    this.load.image("exit_top_right", "assets/tiles/exit_top_right.png");
    this.load.image("exit_top_left", "assets/tiles/exit_top_left.png");
    this.load.image("exit_bottom_right", "assets/tiles/exit_bottom_right.png");
    this.load.image("exit_bottom_left", "assets/tiles/exit_bottom_left.png");
    this.load.image("exit_left_top", "assets/tiles/exit_left_top.png");
    this.load.image("exit_left_bottom", "assets/tiles/exit_left_bottom.png");
    this.load.image("exit_right_top", "assets/tiles/exit_right_top.png");
    this.load.image("exit_right_bottom", "assets/tiles/exit_right_bottom.png");
  }

  create() {
    this.resetLevel();

    this.events.on("gameOver", () => {
      this.gameOver = true;
      this.gameEndText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        "Game Over! Press R to Restart",
        {
          fontSize: "32px",
          color: "#000000",
          fontFamily: '"Arial Black", Arial, sans-serif',
          stroke: "#000000",
          strokeThickness: 0.5,
        }
      );
      this.gameEndText.setOrigin(0.5);
      this.keydownListener = (event: KeyboardEvent) => {
        if (event.key === "r" || event.key === "R") {
          this.resetLevel();
        }
      };
      this.input.keyboard?.on("keydown", this.keydownListener);
    });

    this.events.on("levelComplete", () => {
      this.gameOver = true;
      this.gameEndText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        "You escaped! Press R to Restart",
        {
          fontSize: "32px",
          color: "#000000",
          fontFamily: '"Arial Black", Arial, sans-serif',
          stroke: "#000000",
          strokeThickness: 0.5,
        }
      );
      this.gameEndText.setOrigin(0.5);
      this.keydownListener = (event: KeyboardEvent) => {
        if (event.key === "r" || event.key === "R") {
          this.resetLevel();
        }
      };
      this.input.keyboard?.on("keydown", this.keydownListener);
    });
  }

  resetLevel() {
    this.gameOver = false;
    if (this.level) {
      this.level.board.destroy();
    }

    // Remove other game objects
    if (this.gameEndText) {
      this.gameEndText.destroy();
    }

    // Remove the event listener
    this.input.keyboard?.off("keydown", this.keydownListener);

    // Reset other game objects
    if (this.scoreText) {
      this.scoreText.setText("Score: 0");
    }
    if (this.timerText) {
      this.timerText.setText("Time: 0s");
      this.elapsedTime = 0;
      if (this.timerEvent) {
        this.time.removeEvent(this.timerEvent);
      }
    }
    if (this.flagText) {
      this.flagText.setText(`Flags: ${this.remainingFlags}`);
    }

    // Create new Level
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
    this.level.startLevel(boardWidth - 2, Math.floor(boardWidth / 2) - 1);

    // Center
    const centerX = this.cameras.main.width / 2;
    // const centerY = this.cameras.main.height / 2;

    // Title of game
    this.add.text(40, 15, "Run of the Mine", {
      fontSize: "30px",
      color: "#ffffff",
      fontFamily: '"Orbitron", sans-serif',
    });

    // Game score, currently not synced with anything
    this.scoreText = this.add
      .text(centerX * 2 - 40, 30, "Score: 0", {
        fontSize: "30px",
        color: "#ffffff",
        fontFamily: '"Orbitron", sans-serif',
      })
      .setOrigin(1, 0);

    // Timer, currently not synced with anything
    this.timerText = this.add
      .text(centerX * 2 - 40, 70, "Time: 0s", {
        fontSize: "30px",
        color: "#ff0000",
        fontFamily: '"Orbitron", sans-serif',
      })
      .setOrigin(1, 0);

    // Timer functionality
    this.timerEvent = this.time.addEvent({
      delay: 1000, // 1 second
      callback: () => this.updateTimer(),
      callbackScope: this,
      loop: true,
    });

    // Flags remaining display, currently not synced with anything
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
    // Reset board for new level
  }
}

export default GameScene;
