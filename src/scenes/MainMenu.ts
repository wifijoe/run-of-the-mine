import { Scene } from "phaser";
import Button from "../components/button";

const ButtonUp = "button_up";
const ButtonDown = "button_down";

export class MainMenu extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  logo: Phaser.GameObjects.Image;
  startButton: Button;

  constructor() {
    super("MainMenu");
  }

  preload() {
    this.load.image(ButtonUp, "assets/startButton.png");
    this.load.image(ButtonDown, "assets/startButtonDown.png");
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x999999);

    this.background = this.add.image(512, 384, "background");
    this.background.setAlpha(0.5);

    this.logo = this.add.image(512, 384, "logo");
    this.logo.setOrigin(0.5);

    this.startButton = new Button(this, 512, 600, ButtonUp).setDownTexture(
      ButtonDown
    );
    this.startButton.scale = 0.4;
    this.add.existing(this.startButton);

    this.startButton.on("pointerup", () => {
      this.scene.start("Game");
    });
  }
}
