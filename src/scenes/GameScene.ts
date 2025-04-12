import Phaser from "phaser";
import Level from "../models/Level";
import ShopBoard from "../models/ShopBoard";

class GameScene extends Phaser.Scene {
  private level: Level;
  private shop: ShopBoard;
  gameEndText: Phaser.GameObjects.Text;
  gameOver: boolean = false;

  score: number = 0;
  scoreText!: Phaser.GameObjects.Text;

  timerBar!: Phaser.GameObjects.Graphics;
  outlineBar!: Phaser.GameObjects.Graphics;
  timeLeft!: number;
  totalTime!: number;
  barWidth: number = 635;
  barHeight: number = 20;
  barX!: number;
  barY!: number;
  countdownEvent!: Phaser.Time.TimerEvent;
  CELL_SIZE: number = 32; // Size of each cell in pixels

  modeText!: Phaser.GameObjects.Text;
  basicDifficulty = [0, 0, 0.15]; // size, time, mine density

  private keydownListener: (event: KeyboardEvent) => void;

  constructor() {
    super("GameScene");
  }

  create() {
    this.resetLevel();
    // this.enterShop();
    this.events.on("gameOver", () => {
      this.gameOver = true;
      this.stopTimer();
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
          this.basicDifficulty = [0, 0, 0];
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
        "You escaped! Press N to Continue.",
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
        if (event.key === "n" || event.key === "N") {
          this.enterShop();
          // this.nextLevel();
        }
      };
      this.input.keyboard?.on("keydown", this.keydownListener);
    });

    this.events.on("nextLevel", (isRightExit: boolean) => {
      if (isRightExit) {
        console.log("Increase Mine Density");
        this.basicDifficulty[2] += 0.05;
      } else {
        console.log("Increase Board Size");
        this.basicDifficulty[0] += 1;
      }
      this.nextLevel();
    });
  }

  enterShop() {
    this.gameOver = false;

    // Clear all existing game objects
    this.children.removeAll();

    // Destroy specific objects if they exist
    if (this.level) {
      this.level.board.destroy();
    }
    if (this.shop) {
      this.shop.destroy();
    }
    if (this.gameEndText) {
      this.gameEndText.destroy();
    }
    if (this.timerBar) {
      this.timerBar.destroy();
    }
    if (this.outlineBar) {
      this.outlineBar.destroy();
    }
    if (this.countdownEvent) {
      this.countdownEvent.remove();
    }

    // Remove any event listeners
    this.input.keyboard?.removeAllListeners();

    const boardWidth = 20;
    this.add.image(0, 0, "dirt").setOrigin(0, 0);

    const x =
      (this.game.config.width as number) / 2 -
      this.CELL_SIZE * (boardWidth / 2);
    const y =
      (this.game.config.height as number) / 2 -
      this.CELL_SIZE * (boardWidth / 2);

    // Destroy existing shop board if it exists
    if (this.shop) {
      this.shop.destroy();
    }

    // Create new shop board
    this.shop = new ShopBoard(
      this,
      x,
      y,
      boardWidth,
      boardWidth,
      this.CELL_SIZE,
      this.CELL_SIZE
    );

    // Add the shop board to the scene
    this.add.existing(this.shop);
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
      this.scoreText.setText(`Score: ${this.score}`);
    }

    // Create new Level
    const boardWidth = 20;

    this.add.image(0, 0, "dirt").setOrigin(0, 0);

    const x =
      (this.game.config.width as number) / 2 -
      this.CELL_SIZE * (boardWidth / 2);
    const y =
      (this.game.config.height as number) / 2 -
      this.CELL_SIZE * (boardWidth / 2);

    this.level = new Level(
      this,
      x,
      y,
      boardWidth,
      boardWidth,
      this.CELL_SIZE,
      this.CELL_SIZE,
      this.basicDifficulty
    );
    this.add.existing(this.level.board);
    this.level.startLevel();

    // Center
    const centerX = this.cameras.main.width / 2;
    // const centerY = this.cameras.main.height / 2;

    // Title of game
    this.add.text(40, 15, "Run of the Mine", {
      fontSize: "30px",
      color: "#ffffff",
      fontFamily: '"Orbitron", sans-serif',
    });

    // Game score
    this.score = 0;
    this.scoreText = this.add
      .text(centerX * 2 - 40, 30, `Score: ${this.score}`, {
        fontSize: "30px",
        color: "#ffffff",
        fontFamily: '"Orbitron", sans-serif',
      })
      .setOrigin(1, 0);

    // Timer
    const { width, height } = this.scale;

    this.totalTime = 150; // maybe change?
    this.timeLeft = this.totalTime;

    // Position the bar centered at the bottom
    this.barX = width / 2 - this.barWidth / 2 - 13;
    this.barY = height - 50;

    // Create a background bar
    this.outlineBar = this.add.graphics();
    this.outlineBar.lineStyle(3, 0xffffff);
    this.outlineBar.strokeRect(
      this.barX - 3,
      this.barY - this.barHeight / 2 - 3,
      this.barWidth + 3,
      this.barHeight + 6
    );

    // Create a timer bar
    this.timerBar = this.add.graphics();
    this.updateTimerBar();

    this.countdownEvent = this.time.addEvent({
      delay: 80,
      callback: this.updateCountdown,
      callbackScope: this,
      loop: true,
    });
  }

  nextLevel() {
    // this.gameOver = false;
    // if (this.level) {
    //   this.level.board.destroy();
    // }

    // // Remove other game objects
    // if (this.gameEndText) {
    //   this.gameEndText.destroy();
    // }

    // // Remove the event listener
    // this.input.keyboard?.off("keydown", this.keydownListener);

    // Create new Level
    const boardWidth = 20 + this.basicDifficulty[0];

    this.add.image(0, 0, "dirt").setOrigin(0, 0);

    const x =
      (this.game.config.width as number) / 2 -
      this.CELL_SIZE * (boardWidth / 2);
    const y =
      (this.game.config.height as number) / 2 -
      this.CELL_SIZE * (boardWidth / 2);

    this.level = new Level(
      this,
      x,
      y,
      boardWidth,
      boardWidth,
      this.CELL_SIZE,
      this.CELL_SIZE,
      this.basicDifficulty
    );
    this.add.existing(this.level.board);
    this.level.startLevel();

    // Center
    const centerX = this.cameras.main.width / 2;
    // const centerY = this.cameras.main.height / 2;

    // Title of game
    this.add.text(40, 15, "Run of the Mine", {
      fontSize: "30px",
      color: "#ffffff",
      fontFamily: '"Orbitron", sans-serif',
    });

    // Game score
    this.scoreText = this.add
      .text(centerX * 2 - 40, 30, `Score: ${this.score}`, {
        fontSize: "30px",
        color: "#ffffff",
        fontFamily: '"Orbitron", sans-serif',
      })
      .setOrigin(1, 0);

    // Timer
    const { width, height } = this.scale;

    this.totalTime = 150; // maybe change?
    this.timeLeft = this.totalTime;

    // Position the bar centered at the bottom
    this.barX = width / 2 - this.barWidth / 2 - 13;
    this.barY = height - 50;

    // Create a background bar
    this.outlineBar = this.add.graphics();
    this.outlineBar.lineStyle(3, 0xffffff);
    this.outlineBar.strokeRect(
      this.barX - 3,
      this.barY - this.barHeight / 2 - 3,
      this.barWidth + 3,
      this.barHeight + 6
    );

    // Create a timer bar
    this.timerBar = this.add.graphics();
    this.updateTimerBar();

    this.countdownEvent = this.time.addEvent({
      delay: 100,
      callback: this.updateCountdown,
      callbackScope: this,
      loop: true,
    });
  }

  updateScore(points: number) {
    this.score += points;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  updateCountdown() {
    this.timeLeft -= 0.09;

    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.stopTimer();
      this.scene.start("GameOver");
    }

    this.updateTimerBar();
  }

  updateTimerBar() {
    this.timerBar.clear();

    // Calculate remaining width of the inner bar
    const remainingWidth = (this.timeLeft / this.totalTime) * this.barWidth;

    // Draw the shrinking inner bar (red)
    this.timerBar.fillStyle(0xff0000);
    this.timerBar.fillRect(
      this.barX + 2,
      this.barY - this.barHeight / 2 + 2,
      remainingWidth - 4,
      this.barHeight - 4
    );
  }

  stopTimer() {
    if (this.countdownEvent) {
      this.countdownEvent.remove();
    }
  }
}

export default GameScene;
