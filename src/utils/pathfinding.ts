export interface Position {
  x: number;
  y: number;
}

export interface PathNode extends Position {
  g: number; // Cost from start
  h: number; // Heuristic cost to end
  f: number; // Total cost
  parent?: PathNode;
}

// Manhattan distance heuristic
const heuristic = (a: Position, b: Position): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

const getNeighbors = (pos: Position, grid: number[][]): Position[] => {
  const neighbors: Position[] = [];
  const directions = [
    { x: 0, y: -1 }, // up
    { x: 1, y: 0 },  // right
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }, // left
  ];

  for (const dir of directions) {
    const newX = pos.x + dir.x;
    const newY = pos.y + dir.y;

    if (
      newX >= 0 &&
      newX < grid[0].length &&
      newY >= 0 &&
      newY < grid.length &&
      grid[newY][newX] === 0
    ) {
      neighbors.push({ x: newX, y: newY });
    }
  }

  return neighbors;
};

export const findPathAStar = (
  grid: number[][],
  start: Position,
  end: Position,
  onExplore?: (pos: Position) => void
): Position[] => {
  const openSet: PathNode[] = [];
  const closedSet: Set<string> = new Set();

  const startNode: PathNode = {
    ...start,
    g: 0,
    h: heuristic(start, end),
    f: heuristic(start, end),
  };

  openSet.push(startNode);

  while (openSet.length > 0) {
    // Find node with lowest f score
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;

    const key = `${current.x},${current.y}`;
    if (closedSet.has(key)) continue;

    closedSet.add(key);
    onExplore?.(current);

    // Found the end
    if (current.x === end.x && current.y === end.y) {
      const path: Position[] = [];
      let node: PathNode | undefined = current;
      while (node) {
        path.unshift({ x: node.x, y: node.y });
        node = node.parent;
      }
      return path;
    }

    // Check neighbors
    const neighbors = getNeighbors(current, grid);
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (closedSet.has(neighborKey)) continue;

      const g = current.g + 1;
      const h = heuristic(neighbor, end);
      const f = g + h;

      const existingNode = openSet.find(
        (n) => n.x === neighbor.x && n.y === neighbor.y
      );

      if (!existingNode || g < existingNode.g) {
        const neighborNode: PathNode = {
          ...neighbor,
          g,
          h,
          f,
          parent: current,
        };

        if (!existingNode) {
          openSet.push(neighborNode);
        } else {
          Object.assign(existingNode, neighborNode);
        }
      }
    }
  }

  return []; // No path found
};

export const findPathDijkstra = (
  grid: number[][],
  start: Position,
  end: Position,
  onExplore?: (pos: Position) => void
): Position[] => {
  const distances: Map<string, number> = new Map();
  const previous: Map<string, Position> = new Map();
  const unvisited: PathNode[] = [];

  const startNode: PathNode = {
    ...start,
    g: 0,
    h: 0,
    f: 0,
  };

  unvisited.push(startNode);
  distances.set(`${start.x},${start.y}`, 0);

  while (unvisited.length > 0) {
    // Find node with smallest distance
    unvisited.sort((a, b) => a.g - b.g);
    const current = unvisited.shift()!;

    const currentKey = `${current.x},${current.y}`;
    onExplore?.(current);

    // Found the end
    if (current.x === end.x && current.y === end.y) {
      const path: Position[] = [];
      let pos: Position = end;
      while (true) {
        path.unshift(pos);
        const prevKey = `${pos.x},${pos.y}`;
        const prev = previous.get(prevKey);
        if (!prev || (prev.x === start.x && prev.y === start.y)) {
          if (prev) path.unshift(start);
          break;
        }
        pos = prev;
      }
      return path;
    }

    const neighbors = getNeighbors(current, grid);
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      const newDistance = current.g + 1;
      const oldDistance = distances.get(neighborKey) ?? Infinity;

      if (newDistance < oldDistance) {
        distances.set(neighborKey, newDistance);
        previous.set(neighborKey, { x: current.x, y: current.y });

        const neighborNode: PathNode = {
          ...neighbor,
          g: newDistance,
          h: 0,
          f: newDistance,
        };

        unvisited.push(neighborNode);
      }
    }
  }

  return []; // No path found
};
