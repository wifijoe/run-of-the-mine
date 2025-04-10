export enum Compass {
  NORTH,
  EAST,
  SOUTH,
  WEST,
}

export interface GameConfig {
  width: number;
  height: number;
  cellWidth: number;
  cellHeight: number;
  entranceDirection: Compass;
  mineDensity: number;
}

export interface BoardPosition {
  x: number;
  y: number;
}

export interface ExitPositions {
  north: number;
  east: number;
  south: number;
  west: number;
}

export enum CellState {
  HIDDEN,
  VISIBLE,
  REVEALED,
}

export enum CellContent {
  EMPTY,
  WALL,
  HAZARD,
  EXIT,
}

export enum TileIndices {
  HIDDEN = 0,
  VISIBLE_SPECKLED = 1,
  VISIBLE_STONY = 2,
  REVEALED_SPECKLED = 3,
  REVEALED_STONY = 4,
  WALL = 5,
  HAZARD = 6,
  FLAG = 7,
  NUMBER_1 = 8,
  NUMBER_2 = 9,
  NUMBER_3 = 10,
  NUMBER_4 = 11,
  NUMBER_5 = 12,
  NUMBER_6 = 13,
  NUMBER_7 = 14,
  NUMBER_8 = 15,
  EXIT_TOP_LEFT = 16,
  EXIT_TOP_RIGHT = 17,
  EXIT_BOTTOM_LEFT = 18,
  EXIT_BOTTOM_RIGHT = 19,
  EXIT_LEFT_TOP = 20,
  EXIT_LEFT_BOTTOM = 21,
  EXIT_RIGHT_TOP = 22,
  EXIT_RIGHT_BOTTOM = 23,
}
