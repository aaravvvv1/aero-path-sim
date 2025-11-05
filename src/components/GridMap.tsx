import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import { Position } from "@/utils/pathfinding";

interface GridMapProps {
  grid: number[][];
  start: Position | null;
  end: Position | null;
  path: Position[];
  explored: Position[];
  dronePosition: Position | null;
  onCellClick: (x: number, y: number) => void;
  isSimulating: boolean;
}

export const GridMap = ({
  grid,
  start,
  end,
  path,
  explored,
  dronePosition,
  onCellClick,
  isSimulating,
}: GridMapProps) => {
  const isExplored = (x: number, y: number) =>
    explored.some((p) => p.x === x && p.y === y);
  
  const isPath = (x: number, y: number) =>
    path.some((p) => p.x === x && p.y === y);

  const getCellColor = (x: number, y: number, cell: number) => {
    if (start && x === start.x && y === start.y) return "bg-primary glow-cyan";
    if (end && x === end.x && y === end.y) return "bg-accent glow-green";
    if (dronePosition && x === dronePosition.x && y === dronePosition.y) return "bg-primary";
    if (isPath(x, y)) return "bg-[hsl(var(--path))]";
    if (isExplored(x, y)) return "bg-[hsl(var(--explored))]";
    if (cell === 1) return "bg-destructive glow-red";
    return "bg-card/50 hover:bg-card/70";
  };

  return (
    <div className="cyber-border rounded-lg p-6 bg-card/30 backdrop-blur-sm">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))` }}>
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <motion.button
              key={`${x}-${y}`}
              onClick={() => !isSimulating && onCellClick(x, y)}
              className={`aspect-square rounded-sm transition-all ${getCellColor(x, y, cell)} border border-border/30`}
              whileHover={!isSimulating ? { scale: 1.1 } : {}}
              whileTap={!isSimulating ? { scale: 0.95 } : {}}
              disabled={isSimulating}
            >
              {start && x === start.x && y === start.y && (
                <div className="flex items-center justify-center h-full">
                  <Plane className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              {end && x === end.x && y === end.y && (
                <div className="flex items-center justify-center h-full">
                  <div className="w-2 h-2 rounded-full bg-accent-foreground" />
                </div>
              )}
              {dronePosition && x === dronePosition.x && y === dronePosition.y && (
                <motion.div
                  className="flex items-center justify-center h-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Plane className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
};
