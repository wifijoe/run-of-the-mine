import { Scene } from "phaser";
import Button from "../components/button";

const ButtonUp = "button_up";
const ButtonDown = "button_down";
const Background = "background";

export class MainMenu extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  logo: Phaser.GameObjects.Image;
  startButton: Button;

  constructor() {
    super("MainMenu");
  }

  preload() {
    this.load.image(ButtonUp, "assets/startButton.png");
    this.load.image(ButtonDown, "assets/startButtonDown.png");
    this.load.image(Background, 'assets/itsthe90s.png');
  }

  create() {
    // background
    this.add.image(0, 0, Background)
    .setOrigin(0, 0)
    .setDisplaySize(this.scale.width, this.scale.height);

    this.logo = this.add.image(512, 384, "logo");
    this.logo.setOrigin(0.5);

    this.startButton = new Button(this, 512, 600, ButtonUp).setDownTexture(
      ButtonDown
    );
    this.startButton.scale = 0.4;
    this.add.existing(this.startButton);

    this.startButton.on("pointerup", () => {
      this.scene.start("GameScene");
    });
  }
}
