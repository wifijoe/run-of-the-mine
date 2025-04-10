import { Player } from "./Player";
import GameScene from "../../scenes/GameScene";
import { GridEngineConfig } from "grid-engine";
import { TileManager } from "../tiles/TileManager";

export class PlayerManager {
  private player: Player;
  private readonly gameScene: GameScene;
  private readonly startPosition: [number, number];
  private readonly tileManager: TileManager;

  constructor(
    gameScene: GameScene,
    startPosition: [number, number],
    tileManager: TileManager
  ) {
    this.gameScene = gameScene;
    this.startPosition = startPosition;
    this.tileManager = tileManager;
    this.placePlayer();
  }

  private placePlayer() {
    this.player = new Player(
      this.gameScene,
      this.startPosition[0],
      this.startPosition[1]
    );

    const gridEngineConfig: GridEngineConfig = {
      characters: [
        {
          id: "player",
          sprite: this.player,
          walkingAnimationMapping: 0,
          startPosition: {
            x: this.startPosition[0],
            y: this.startPosition[1],
          },
          offsetY: -4,
        },
      ],
    };

    this.gameScene.gridEngine.create(
      this.tileManager.getTileLayer().tilemap,
      gridEngineConfig
    );
  }

  public getPlayer(): Player {
    return this.player;
  }
}
