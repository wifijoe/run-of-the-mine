class Cell extends Phaser.Tilemaps.Tile {
  adjacentMines: number;
  tileType: string;
}

// Define tile indices for the tilemap
export enum TileIndices {
  HIDDEN = 0,
  VISIBLE_STONY = 1,
  VISIBLE_SPECKLED = 2,
  REVEALED_STONY = 3,
  REVEALED_SPECKLED = 4,
  WALL = 5,
  EXIT_TOP_RIGHT = 6,
  EXIT_TOP_LEFT = 7,
  EXIT_BOTTOM_RIGHT = 8,
  EXIT_BOTTOM_LEFT = 9,
  EXIT_RIGHT_TOP = 10,
  EXIT_RIGHT_BOTTOM = 11,
  EXIT_LEFT_TOP = 12,
  EXIT_LEFT_BOTTOM = 13,
  HAZARD = 14,
  NUMBER_1 = 15,
  NUMBER_2 = 16,
  NUMBER_3 = 17,
  NUMBER_4 = 18,
  NUMBER_5 = 19,
  NUMBER_6 = 20,
  NUMBER_7 = 21,
  NUMBER_8 = 22,
  FLAG = 23,
}

export enum CellState {
  HIDDEN,
  VISIBLE,
  REVEALED,
  FLAGGED,
}

export enum CellContent {
  EMPTY,
  HAZARD,
  TREASURE,
  WALL,
  EXIT,
}

export default Cell;
