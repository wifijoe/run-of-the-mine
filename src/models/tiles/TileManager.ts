import { GameConfig, TileIndices } from "../types";
import GameScene from "../../scenes/GameScene";

export class TileManager {
  private tilemap: Phaser.Tilemaps.Tilemap;
  private tileset: Phaser.Tilemaps.Tileset | null;
  private tileLayer: Phaser.Tilemaps.TilemapLayer;
  private hazardLayer: Phaser.Tilemaps.TilemapLayer;
  private coverLayer: Phaser.Tilemaps.TilemapLayer;
  private flagLayer: Phaser.Tilemaps.TilemapLayer;
  private gameScene: GameScene;
  private config: GameConfig;

  constructor(gameScene: GameScene, config: GameConfig) {
    this.gameScene = gameScene;
    this.config = config;
    this.createTilemap();
  }

  private createTilemap() {
    this.tilemap = this.gameScene.make.tilemap({
      tileWidth: this.config.cellWidth,
      tileHeight: this.config.cellHeight,
      width: this.config.width,
      height: this.config.height,
    });

    this.tileset = this.tilemap.addTilesetImage("minesweeper_tiles");
    if (!this.tileset) {
      throw new Error("Failed to load tileset");
    }

    const centerX =
      (this.gameScene.scale.width - this.config.width * this.config.cellWidth) /
      2;
    const centerY =
      (this.gameScene.scale.height -
        this.config.height * this.config.cellHeight) /
      2;

    const layer = this.tilemap.createBlankLayer(
      "main",
      this.tileset,
      centerX,
      centerY
    );
    if (!layer) {
      throw new Error("Failed to create tile layer");
    }
    this.tileLayer = layer;
  }

  public placeBaseTile(
    i: number,
    j: number,
    width: number,
    height: number,
    exits: number[]
  ) {
    if (i === 0 || i === width - 1 || j === 0 || j === height - 1) {
      const exitPlaced = this.placeExitTile(i, j, width, height, exits);
      if (!exitPlaced) {
        this.tileLayer.putTileAt(TileIndices.WALL, i, j);
      }
    } else {
      const random = Math.random();
      const tileType = random < 0.5 ? "speckled" : "stony";
      const tile = this.tileLayer.putTileAt(
        tileType == "speckled"
          ? TileIndices.REVEALED_SPECKLED
          : TileIndices.REVEALED_STONY,
        i,
        j
      );
      tile.properties.tileType = tileType;
    }
  }

  private placeExitTile(
    i: number,
    j: number,
    width: number,
    height: number,
    exits: number[]
  ): boolean {
    const exitImageName = this.getExitImageName(i, j, width, height, exits);
    if (exitImageName) {
      this.tileLayer.putTileAt(this.getExitIndex(exitImageName), i, j);
      return true;
    }
    return false;
  }

  private getExitImageName(
    i: number,
    j: number,
    width: number,
    height: number,
    exits: number[]
  ): string | null {
    if (i === exits[0] && j === 0) return "exit_top_left";
    if (i === exits[0] + 1 && j === 0) return "exit_top_right";
    if (i === exits[2] && j === height - 1) return "exit_bottom_left";
    if (i === exits[2] + 1 && j === height - 1) return "exit_bottom_right";
    if (j === exits[3] && i === 0) return "exit_left_top";
    if (j === exits[3] + 1 && i === 0) return "exit_left_bottom";
    if (j === exits[1] && i === width - 1) return "exit_right_top";
    if (j === exits[1] + 1 && i === width - 1) return "exit_right_bottom";
    return null;
  }

  private getExitIndex(exitImageName: string): number {
    switch (exitImageName) {
      case "exit_top_left":
        return TileIndices.EXIT_TOP_LEFT;
      case "exit_top_right":
        return TileIndices.EXIT_TOP_RIGHT;
      case "exit_bottom_left":
        return TileIndices.EXIT_BOTTOM_LEFT;
      case "exit_bottom_right":
        return TileIndices.EXIT_BOTTOM_RIGHT;
      case "exit_left_top":
        return TileIndices.EXIT_LEFT_TOP;
      case "exit_left_bottom":
        return TileIndices.EXIT_LEFT_BOTTOM;
      case "exit_right_top":
        return TileIndices.EXIT_RIGHT_TOP;
      case "exit_right_bottom":
        return TileIndices.EXIT_RIGHT_BOTTOM;
      default:
        return TileIndices.WALL;
    }
  }

  public getTileLayer(): Phaser.Tilemaps.TilemapLayer {
    return this.tileLayer;
  }

  public getHazardLayer(): Phaser.Tilemaps.TilemapLayer {
    return this.hazardLayer;
  }

  public getCoverLayer(): Phaser.Tilemaps.TilemapLayer {
    return this.coverLayer;
  }

  public getFlagLayer(): Phaser.Tilemaps.TilemapLayer {
    return this.flagLayer;
  }
}
