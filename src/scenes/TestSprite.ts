import { Scene } from "phaser";
import { Player } from "../models/Player";

export class TestSprite extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  player: Player;

  constructor() {
    super("TestSprite");
  }

  create() {
    // Set up background
    this.background = this.add.image(0, 0, "dirt");
    this.background.setOrigin(0, 0);
    this.background.setDisplaySize(this.scale.width, this.scale.height);

    // Create player
    this.player = new Player(this, 400, 300);

    // Set up camera
    this.physics.world.bounds.width = 800;
    this.physics.world.bounds.height = 600;
    this.camera = this.cameras.main;
    this.camera.setBounds(0, 0, 400, 300);
    this.camera.startFollow(this.player, true, 0.5, 0.5);
  }

  update() {
    // Delegate player update to the Player class
    this.player.update();
  }
}
