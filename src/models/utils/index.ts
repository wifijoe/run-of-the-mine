import { Compass } from "../types";

export function isValidPosition(
  x: number,
  y: number,
  boardWidth: number,
  boardHeight: number
): boolean {
  return x >= 0 && x < boardWidth && y >= 0 && y < boardHeight;
}

export function countAdjacentMines(
  x: number,
  y: number,
  boardWidth: number,
  boardHeight: number,
  hazardLayer: Phaser.Tilemaps.TilemapLayer
): number {
  let count = 0;
  for (let i = x - 1; i <= x + 1; i++) {
    for (let j = y - 1; j <= y + 1; j++) {
      if (
        isValidPosition(i, j, boardWidth, boardHeight) &&
        isMine(i, j, hazardLayer)
      ) {
        count++;
      }
    }
  }
  return count;
}

export function isMine(
  x: number,
  y: number,
  hazardLayer: Phaser.Tilemaps.TilemapLayer
): boolean {
  const hazard = hazardLayer.getTileAt(x, y);
  return hazard !== null;
}

export function getStartPosition(
  width: number,
  height: number,
  exits: number[],
  entranceDirection: Compass
): [number, number] {
  switch (entranceDirection) {
    case Compass.NORTH:
      return [exits[0], 1];
    case Compass.EAST:
      return [width - 2, exits[1]];
    case Compass.SOUTH:
      return [exits[2], height - 2];
    case Compass.WEST:
      return [1, exits[3]];
    default:
      throw new Error(`Invalid entrance direction: ${entranceDirection}`);
  }
}
