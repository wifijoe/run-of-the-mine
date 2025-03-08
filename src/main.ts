import { Boot } from "./scenes/Boot";
import { Game as MainGame } from "./scenes/Game";
import { GameOver } from "./scenes/GameOver";
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";
import Phaser from "phaser";
import GameScene from "./scenes/GameScene";

import { Game, Types } from "phaser";

const config: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: "game-container",
  backgroundColor: "#028af8",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  callbacks: {
    preBoot: (game) => {
      game.registry.merge({
        totalPoints: 0,
        levelsComleted: 0,
        hasLost: false,
      });
    },
  },
  scene: [Boot, Preloader, MainMenu, GameScene, GameOver], // Replace MainGame with GameScene
};

export default new Game(config);
