import { Scene } from "phaser";

export class TestSprite extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  currentDirection: string;

  constructor() {
    super("TestSprite");
  }

  create() {
    this.background = this.add.image(0, 0, "dirt");
    this.background.setOrigin(0, 0);
    this.background.setDisplaySize(this.scale.width, this.scale.height);
    const walk_down = {
      key: "down",
      frames: this.anims.generateFrameNumbers("knight", {
        frames: [1, 2, 3, 0],
      }),
      frameRate: 8,
      repeat: -1,
    };

    const walk_up = {
      key: "up",
      frames: this.anims.generateFrameNumbers("knight", {
        frames: [49, 50, 51, 48],
      }),
      frameRate: 8,
      repeat: -1,
    };

    const walk_left = {
      key: "left",
      frames: this.anims.generateFrameNumbers("knight", {
        frames: [17, 18, 19, 16],
      }),
      frameRate: 8,
      repeat: -1,
    };

    const walk_right = {
      key: "right",
      frames: this.anims.generateFrameNumbers("knight", {
        frames: [33, 34, 35, 32],
      }),
      frameRate: 8,
      repeat: -1,
    };

    const mine_down = {
      key: "mine_down",
      frames: this.anims.generateFrameNumbers("knight", {
        frames: [13, 14, 15, 12],
      }),
      frameRate: 8,
      repeat: -1,
    };

    const mine_up = {
      key: "mine_up",
      frames: this.anims.generateFrameNumbers("knight", {
        frames: [61, 62, 63, 60],
      }),
      frameRate: 8,
      repeat: -1,
    };

    const mine_left = {
      key: "mine_left",
      frames: this.anims.generateFrameNumbers("knight", {
        frames: [29, 30, 31, 28],
      }),
      frameRate: 8,
      repeat: -1,
    };

    const mine_right = {
      key: "mine_right",
      frames: this.anims.generateFrameNumbers("knight", {
        frames: [45, 46, 47, 44],
      }),
      frameRate: 8,
      repeat: -1,
    };

    const idle_up = {
      key: "idle_up",
      frames: this.anims.generateFrameNumbers("knight", {
        frames: [48],
      }),
      frameRate: 8,
    };

    const idle_down = {
      key: "idle_down",
      frames: this.anims.generateFrameNumbers("knight", {
        frames: [0],
      }),
      frameRate: 8,
    };

    const idle_left = {
      key: "idle_left",
      frames: this.anims.generateFrameNumbers("knight", {
        frames: [16],
      }),
      frameRate: 8,
    };

    const idle_right = {
      key: "idle_right",
      frames: this.anims.generateFrameNumbers("knight", {
        frames: [32],
      }),
      frameRate: 8,
    };

    this.anims.create(idle_down);
    this.anims.create(idle_up);
    this.anims.create(idle_left);
    this.anims.create(idle_right);

    this.anims.create(walk_down);
    this.anims.create(walk_up);
    this.anims.create(walk_left);
    this.anims.create(walk_right);
    this.anims.create(mine_down);
    this.anims.create(mine_up);
    this.anims.create(mine_left);
    this.anims.create(mine_right);
    this.player = this.physics.add.sprite(400, 300, "knight", 32);
    this.player.scale = 2;
    this.player.setCollideWorldBounds(true);
    // this.player.play("mine_down", true);
    this.cursors = this.input.keyboard?.createCursorKeys();

    this.physics.world.bounds.width = 800;
    this.physics.world.bounds.height = 600;
    this.camera = this.cameras.main;
    this.camera.setBounds(0, 0, 400, 300);
    this.camera.startFollow(this.player, true, 0.5, 0.5);
  }

  update() {
    this.player.body.setVelocity(0);
    if (this.cursors?.left.isDown) {
      this.player.body.setVelocityX(-64);
      this.player.anims.play("left", true);
      this.currentDirection = "left";
    } else if (this.cursors?.right.isDown) {
      this.player.anims.play("right", true);
      this.player.body.setVelocityX(64);
      this.currentDirection = "right";
    } else if (this.cursors?.up.isDown) {
      this.player.anims.play("up", true);
      this.player.body.setVelocityY(-64);
      this.currentDirection = "up";
    } else if (this.cursors?.down.isDown) {
      this.player.anims.play("down", true);
      this.player.body.setVelocityY(64);
      this.currentDirection = "down";
    } else if (this.cursors?.space.isDown) {
      this.player.anims.play("mine_" + this.currentDirection, true);
    } else {
      this.player.anims.play("idle_" + this.currentDirection, true);
    }
  }
}
