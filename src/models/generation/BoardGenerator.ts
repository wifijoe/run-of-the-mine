import { GameConfig, TileIndices, CellContent } from "../types";
import { TileManager } from "../tiles/TileManager";
import { getStartPosition, isValidPosition, isMine } from "../utils";

export class BoardGenerator {
  private readonly tileManager: TileManager;
  private readonly config: GameConfig;
  private startPosition: [number, number];

  constructor(tileManager: TileManager, config: GameConfig) {
    this.tileManager = tileManager;
    this.config = config;
  }

  public generateBoard() {
    const exits = this.generateExitPositions();

    // Fill the tilemap with base tiles
    for (let i = 0; i < this.config.width; i++) {
      for (let j = 0; j < this.config.height; j++) {
        this.tileManager.placeBaseTile(
          i,
          j,
          this.config.width,
          this.config.height,
          exits
        );
      }
    }

    // Set player starting position
    this.startPosition = getStartPosition(
      this.config.width,
      this.config.height,
      exits,
      this.config.entranceDirection
    );

    // Place mines and calculate adjacent mines
    this.placeMines();
    this.calculateAdjacentMines();
  }

  private generateExitPositions(): number[] {
    return [
      Math.floor(Math.random() * (this.config.width - 4)) + 1, // north exit west cell
      Math.floor(Math.random() * (this.config.height - 4)) + 1, // east exit north cell
      Math.floor(Math.random() * (this.config.width - 4)) + 1, // south exit west cell
      Math.floor(Math.random() * (this.config.height - 4)) + 1, // west exit north cell
    ];
  }

  private placeMines() {
    const numberOfMines = Math.floor(
      this.config.width * this.config.height * this.config.mineDensity
    );
    let minesPlaced = 0;

    while (minesPlaced < numberOfMines) {
      const x = Math.floor(Math.random() * (this.config.width - 2)) + 1;
      const y = Math.floor(Math.random() * (this.config.height - 2)) + 1;

      // Check if current position is in the start area
      if (
        Math.abs(x - this.startPosition[0]) <= 1 &&
        Math.abs(y - this.startPosition[1]) <= 1
      ) {
        continue;
      }

      if (!this.tileManager?.getHazardLayer()?.getTileAt(x, y)) {
        const tile = this.tileManager
          ?.getHazardLayer()
          ?.putTileAt(TileIndices.HAZARD, x, y);
        if (tile) {
          tile.properties.contains = CellContent.HAZARD;
          minesPlaced++;
        }
      }
    }
  }

  private calculateAdjacentMines() {
    for (let i = 0; i < this.config.width; i++) {
      for (let j = 0; j < this.config.height; j++) {
        const hazard = this.tileManager.getHazardLayer()?.getTileAt(i, j);
        if (!hazard) {
          const tile = this.tileManager.getTileLayer().getTileAt(i, j);
          tile.properties.adjacentMines = this.countAdjacentMines(i, j);
        }
      }
    }
  }

  private countAdjacentMines(x: number, y: number): number {
    let count = 0;

    for (let i = x - 1; i <= x + 1; i++) {
      for (let j = y - 1; j <= y + 1; j++) {
        if (
          isValidPosition(i, j, this.config.width, this.config.height) &&
          isMine(i, j, this.tileManager.getHazardLayer())
        ) {
          count++;
        }
      }
    }
    return count;
  }

  public getStartPosition(): [number, number] {
    return this.startPosition;
  }
}
