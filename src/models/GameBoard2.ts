import { GameConfig } from "./types";
import GameScene from "../scenes/GameScene";
import { TileManager } from "./tiles/TileManager";
import { BoardGenerator } from "./generation/BoardGenerator";
import { GameLogic } from "./game/GameLogic";
import { PlayerManager } from "./player/PlayerManager";

import { Compass } from "./GameBoard";
import { Player } from "./player/Player";

class GameBoard extends Phaser.GameObjects.Container {
  private readonly config: GameConfig;
  private readonly tileManager: TileManager;
  private readonly boardGenerator: BoardGenerator;
  private readonly gameLogic: GameLogic;
  private readonly playerManager: PlayerManager;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    cellWidth: number,
    cellHeight: number,
    entranceDirection: Compass,
    gameScene: GameScene
  ) {
    super(gameScene, x, y);

    this.config = {
      width,
      height,
      cellWidth,
      cellHeight,
      entranceDirection,
      mineDensity: 0.15,
    };

    // Initialize components
    this.tileManager = new TileManager(gameScene, this.config);
    this.boardGenerator = new BoardGenerator(this.tileManager, this.config);
    this.gameLogic = new GameLogic(this.tileManager, width, height);

    // Generate the board
    this.boardGenerator.generateBoard();
    const startPosition = this.boardGenerator.getStartPosition();

    // Initialize player
    this.playerManager = new PlayerManager(
      gameScene,
      startPosition,
      this.tileManager
    );

    this.setSize(width * cellWidth, height * cellHeight);
    this.setInteractive();
  }

  public revealStart() {
    const startPosition = this.boardGenerator.getStartPosition();
    this.gameLogic.revealCell(startPosition[0], startPosition[1]);
  }

  public revealCell(x: number, y: number) {
    this.gameLogic.revealCell(x, y);
  }

  public revealAllCells() {
    this.gameLogic.revealAllCells();
  }

  public isGameOver(): boolean {
    return this.gameLogic.isGameOver();
  }

  public setGameOver(value: boolean) {
    this.gameLogic.setGameOver(value);
  }

  public getPlayer(): Player {
    return this.playerManager.getPlayer();
  }
}

export default GameBoard;
