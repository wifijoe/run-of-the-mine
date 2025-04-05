import { CellContent, CellState } from "./Cell";
import GameBoard from "./GameBoard";

export class Pathfinder {
  private board: GameBoard;
  private boardWidth: number;
  private boardHeight: number;

  constructor(board: GameBoard) {
    this.board = board;
    this.boardWidth = board.boardWidth;
    this.boardHeight = board.boardHeight;
  }

  /**
   * Find a path from start to target using A* algorithm
   * @param startX Starting X coordinate
   * @param startY Starting Y coordinate
   * @param targetX Target X coordinate
   * @param targetY Target Y coordinate
   * @returns Array of [x,y] coordinates representing the path
   */
  findPath(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number
  ): [number, number][] {
    // If target is not visible, find the closest visible cell
    if (this.board.cells[targetX][targetY].cellState === CellState.HIDDEN) {
      const closestVisible = this.findClosestVisibleCell(targetX, targetY);
      if (!closestVisible) return [];
      [targetX, targetY] = closestVisible;
    }

    // Initialize open and closed sets
    const openSet: [number, number][] = [[startX, startY]];
    const closedSet: Set<string> = new Set();
    const cameFrom: Map<string, [number, number]> = new Map();
    const gScore: Map<string, number> = new Map();
    const fScore: Map<string, number> = new Map();

    // Initialize scores
    gScore.set(`${startX},${startY}`, 0);
    fScore.set(
      `${startX},${startY}`,
      this.heuristic(startX, startY, targetX, targetY)
    );

    while (openSet.length > 0) {
      // Find node with lowest fScore
      let current = openSet[0];
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        const score =
          fScore.get(`${openSet[i][0]},${openSet[i][1]}`) || Infinity;
        const currentScore =
          fScore.get(`${current[0]},${current[1]}`) || Infinity;
        if (score < currentScore) {
          current = openSet[i];
          currentIndex = i;
        }
      }

      // If we've reached the target
      if (current[0] === targetX && current[1] === targetY) {
        return this.reconstructPath(cameFrom, current);
      }

      // Move current from open to closed set
      openSet.splice(currentIndex, 1);
      closedSet.add(`${current[0]},${current[1]}`);

      // Check neighbors
      for (const [dx, dy] of [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
      ]) {
        const neighborX = current[0] + dx;
        const neighborY = current[1] + dy;

        // Skip if out of bounds or in closed set
        if (
          neighborX < 0 ||
          neighborX >= this.boardWidth ||
          neighborY < 0 ||
          neighborY >= this.boardHeight ||
          closedSet.has(`${neighborX},${neighborY}`)
        ) {
          continue;
        }

        const cell = this.board.cells[neighborX][neighborY];
        // Skip if wall or not visible
        if (
          cell.contains === CellContent.WALL ||
          cell.cellState === CellState.HIDDEN
        ) {
          continue;
        }

        // Calculate tentative gScore
        const tentativeGScore =
          (gScore.get(`${current[0]},${current[1]}`) || 0) + 1;

        // If this path to neighbor is better than any previous one
        if (!openSet.some(([x, y]) => x === neighborX && y === neighborY)) {
          openSet.push([neighborX, neighborY]);
        } else if (
          tentativeGScore >=
          (gScore.get(`${neighborX},${neighborY}`) || Infinity)
        ) {
          continue;
        }

        // This path is the best so far
        cameFrom.set(`${neighborX},${neighborY}`, current);
        gScore.set(`${neighborX},${neighborY}`, tentativeGScore);
        fScore.set(
          `${neighborX},${neighborY}`,
          tentativeGScore +
            this.heuristic(neighborX, neighborY, targetX, targetY)
        );
      }
    }

    // No path found
    return [];
  }

  /**
   * Find the closest visible cell to the target
   * @param targetX Target X coordinate
   * @param targetY Target Y coordinate
   * @returns [x,y] coordinates of closest visible cell or null if none found
   */
  findClosestVisibleCell(
    targetX: number,
    targetY: number
  ): [number, number] | null {
    const queue: [number, number][] = [[targetX, targetY]];
    const visited = new Set<string>();
    visited.add(`${targetX},${targetY}`);

    while (queue.length > 0) {
      const [x, y] = queue.shift()!;

      // Check if this cell is visible and walkable
      const cell = this.board.cells[x][y];
      if (
        cell.cellState !== CellState.HIDDEN &&
        cell.contains !== CellContent.WALL
      ) {
        return [x, y];
      }

      // Add neighbors to queue
      for (const [dx, dy] of [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
      ]) {
        const nx = x + dx;
        const ny = y + dy;
        const key = `${nx},${ny}`;

        if (
          nx >= 0 &&
          nx < this.boardWidth &&
          ny >= 0 &&
          ny < this.boardHeight &&
          !visited.has(key)
        ) {
          visited.add(key);
          queue.push([nx, ny]);
        }
      }
    }

    return null;
  }

  /**
   * Heuristic function for A* (Manhattan distance)
   */
  private heuristic(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  /**
   * Reconstruct path from cameFrom map
   */
  private reconstructPath(
    cameFrom: Map<string, [number, number]>,
    current: [number, number]
  ): [number, number][] {
    const path: [number, number][] = [current];
    let currentKey = `${current[0]},${current[1]}`;

    while (cameFrom.has(currentKey)) {
      current = cameFrom.get(currentKey)!;
      path.unshift(current);
      currentKey = `${current[0]},${current[1]}`;
    }

    return path;
  }
}
