import Phaser from "phaser";

export class Player extends Phaser.Physics.Arcade.Sprite {
  inventory: Item[] = [];
  health: number = 100;
  maxHealth: number = 100;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  private currentDirection: string = "down";

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "knight", 32);

    // Add the sprite to the scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configure sprite properties
    this.scale = 2;
    this.setCollideWorldBounds(true);

    // Create animations
    this.createAnimations(scene);

    // Set up input
    this.cursors = scene.input.keyboard?.createCursorKeys();

    this.setDepth(1000);
  }

  private createAnimations(scene: Phaser.Scene) {
    // Walking animations
    this.createWalkAnimations(scene);

    // Idle animations
    this.createIdleAnimations(scene);

    // Mining animations
    this.createMiningAnimations(scene);
  }

  private createWalkAnimations(scene: Phaser.Scene) {
    const walkAnimations = [
      {
        key: "down",
        frames: [1, 2, 3, 0],
        direction: "down",
      },
      {
        key: "up",
        frames: [49, 50, 51, 48],
        direction: "up",
      },
      {
        key: "left",
        frames: [17, 18, 19, 16],
        direction: "left",
      },
      {
        key: "right",
        frames: [33, 34, 35, 32],
        direction: "right",
      },
    ];

    walkAnimations.forEach((anim) => {
      scene.anims.create({
        key: anim.key,
        frames: scene.anims.generateFrameNumbers("knight", {
          frames: anim.frames,
        }),
        frameRate: 8,
        repeat: -1,
      });
    });
  }

  private createIdleAnimations(scene: Phaser.Scene) {
    const idleAnimations = [
      { key: "idle_down", frame: 0 },
      { key: "idle_up", frame: 48 },
      { key: "idle_left", frame: 16 },
      { key: "idle_right", frame: 32 },
    ];

    idleAnimations.forEach((anim) => {
      scene.anims.create({
        key: anim.key,
        frames: scene.anims.generateFrameNumbers("knight", {
          frames: [anim.frame],
        }),
        frameRate: 8,
      });
    });
  }

  private createMiningAnimations(scene: Phaser.Scene) {
    const miningAnimations = [
      {
        key: "mine_down",
        frames: [13, 14, 15, 12],
        direction: "down",
      },
      {
        key: "mine_up",
        frames: [61, 62, 63, 60],
        direction: "up",
      },
      {
        key: "mine_left",
        frames: [29, 30, 31, 28],
        direction: "left",
      },
      {
        key: "mine_right",
        frames: [45, 46, 47, 44],
        direction: "right",
      },
    ];

    miningAnimations.forEach((anim) => {
      scene.anims.create({
        key: anim.key,
        frames: scene.anims.generateFrameNumbers("knight", {
          frames: anim.frames,
        }),
        frameRate: 8,
        repeat: -1,
      });
    });
  }

  update() {
    if (this.body) {
      // Reset velocity
      // Ensure we have a dynamic body before setting velocity
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0);

      // Handle movement and animations
      if (this.cursors?.left.isDown) {
        body.setVelocityX(-64);
        this.anims.play("left", true);
        this.currentDirection = "left";
      } else if (this.cursors?.right.isDown) {
        this.anims.play("right", true);
        body.setVelocityX(64);
        this.currentDirection = "right";
      } else if (this.cursors?.up.isDown) {
        this.anims.play("up", true);
        body.setVelocityY(-64);
        this.currentDirection = "up";
      } else if (this.cursors?.down.isDown) {
        this.anims.play("down", true);
        body.setVelocityY(64);
        this.currentDirection = "down";
      } else if (this.cursors?.space.isDown) {
        this.anims.play(`mine_${this.currentDirection}`, true);
      } else {
        this.anims.play(`idle_${this.currentDirection}`, true);
      }
    }
  }
}

class Item extends Phaser.GameObjects.Sprite {
  // TODO: It doesn't matter so much what this looks
  // like for now, but eventually we'll need to update this
  description: string;
  value: number;
}
