import { TileManager } from "../tiles/TileManager";
import { TileIndices } from "../types";
import { isValidPosition } from "../utils";

export class GameLogic {
  private tileManager: TileManager;
  private gameOver: boolean = false;
  private boardWidth: number;
  private boardHeight: number;

  constructor(
    tileManager: TileManager,
    boardWidth: number,
    boardHeight: number
  ) {
    this.tileManager = tileManager;
    this.boardWidth = boardWidth;
    this.boardHeight = boardHeight;
  }

  public revealCell(x: number, y: number) {
    if (!isValidPosition(x, y, this.boardWidth, this.boardHeight)) {
      return;
    }

    const cover = this.tileManager.getCoverLayer().getTileAt(x, y);
    if (!cover) {
      return;
    }

    this.tileManager.getCoverLayer().removeTileAt(x, y);
    const cell = this.tileManager.getTileLayer().getTileAt(x, y);
    if (cell.index < TileIndices.WALL || cell.index >= TileIndices.NUMBER_1) {
      cell.index = this.getNumberTileIndex(
        cell.properties.adjacentMines,
        cell.index
      );
    }
    const hazard = this.tileManager.getHazardLayer().getTileAt(x, y);

    if (cell.properties.adjacentMines === 0 && !hazard) {
      // If cell has no adjacent mines, reveal all surrounding cells
      this.revealCell(x - 1, y);
      this.revealCell(x + 1, y);
      this.revealCell(x, y - 1);
      this.revealCell(x, y + 1);
      this.revealCell(x - 1, y - 1);
      this.revealCell(x - 1, y + 1);
      this.revealCell(x + 1, y - 1);
      this.revealCell(x + 1, y + 1);
    } else {
      // Otherwise just set adjacent cells to visible
      this.setCellVisible(x - 1, y);
      this.setCellVisible(x + 1, y);
      this.setCellVisible(x, y - 1);
      this.setCellVisible(x, y + 1);
      this.setCellVisible(x - 1, y - 1);
      this.setCellVisible(x - 1, y + 1);
      this.setCellVisible(x + 1, y - 1);
      this.setCellVisible(x + 1, y + 1);
    }
  }

  private setCellVisible(x: number, y: number) {
    if (!isValidPosition(x, y, this.boardWidth, this.boardHeight)) {
      return;
    }

    const cover = this.tileManager.getCoverLayer().getTileAt(x, y);
    const tile = this.tileManager.getTileLayer().getTileAt(x, y);
    if (cover) {
      cover.index =
        tile.properties.tileType == "speckled"
          ? TileIndices.VISIBLE_SPECKLED
          : TileIndices.VISIBLE_STONY;
    }
  }

  public revealAllCells() {
    for (let i = 0; i < this.boardWidth; i++) {
      for (let j = 0; j < this.boardHeight; j++) {
        this.tileManager.getCoverLayer().removeTileAt(i, j);
      }
    }
  }

  private getNumberTileIndex(
    adjacentMines: number,
    originalTileIndex: number
  ): number {
    switch (adjacentMines) {
      case 1:
        return TileIndices.NUMBER_1;
      case 2:
        return TileIndices.NUMBER_2;
      case 3:
        return TileIndices.NUMBER_3;
      case 4:
        return TileIndices.NUMBER_4;
      case 5:
        return TileIndices.NUMBER_5;
      case 6:
        return TileIndices.NUMBER_6;
      case 7:
        return TileIndices.NUMBER_7;
      case 8:
        return TileIndices.NUMBER_8;
      default:
        return originalTileIndex;
    }
  }

  public isGameOver(): boolean {
    return this.gameOver;
  }

  public setGameOver(value: boolean) {
    this.gameOver = value;
  }
}
