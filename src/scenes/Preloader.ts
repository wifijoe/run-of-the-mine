import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    //  We loaded this image in our Boot Scene, so we can display it here
    //this.add.image(512, 384, "background");

    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress: number) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath("assets");

    this.load.image("logo", "mineslogo.png");
    this.load.spritesheet("knight", "Knight_10.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    // this.load.image("flag", "flag.webp");
    this.load.image("flag", "Minesweeper_flag.svg.png");

    // Attribution: "Designed by 0melapics / Freepik"
    this.load.image("dirt", "dirt.jpg");
    this.load.image("exit", "tiles/exit.png");
    this.load.image("blank_brown", "tiles/blank_brown.png");
    this.load.image("speckled_brown", "tiles/speckled_brown.png");
    this.load.image("speckled_tan", "tiles/speckled_tan.png");
    this.load.image("stony_brown", "tiles/stony_brown.png");
    this.load.image("stony_tan", "tiles/stony_tan.png");
    this.load.image("exit_top_right", "tiles/exit_top_right.png");
    this.load.image("exit_top_left", "tiles/exit_top_left.png");
    this.load.image("exit_bottom_right", "tiles/exit_bottom_right.png");
    this.load.image("exit_bottom_left", "tiles/exit_bottom_left.png");
    this.load.image("exit_left_top", "tiles/exit_left_top.png");
    this.load.image("exit_left_bottom", "tiles/exit_left_bottom.png");
    this.load.image("exit_right_top", "tiles/exit_right_top.png");
    this.load.image("exit_right_bottom", "tiles/exit_right_bottom.png");
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start("MainMenu");
  }
}
