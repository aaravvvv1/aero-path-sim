import { useState, useEffect, useRef } from "react";
import { GridMap } from "@/components/GridMap";
import { ControlPanel } from "@/components/ControlPanel";
import { StatsPanel } from "@/components/StatsPanel";
import { POVCamera } from "@/components/POVCamera";
import { RadarOverlay } from "@/components/RadarOverlay";
import { Position, findPathAStar, findPathDijkstra } from "@/utils/pathfinding";
import { MovingObstacle, SimulationSpeed } from "@/types/simulation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Plane } from "lucide-react";

const GRID_SIZE = 20;

const Index = () => {
  const [grid, setGrid] = useState<number[][]>(() =>
    Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0))
  );
  const [start, setStart] = useState<Position | null>({ x: 2, y: 2 });
  const [end, setEnd] = useState<Position | null>({ x: 17, y: 17 });
  const [path, setPath] = useState<Position[]>([]);
  const [explored, setExplored] = useState<Position[]>([]);
  const [dronePosition, setDronePosition] = useState<Position | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [algorithm, setAlgorithm] = useState<"astar" | "dijkstra">("astar");
  const [mode, setMode] = useState<"start" | "end" | "obstacle">("obstacle");
  const [status, setStatus] = useState("Waiting for input...");
  const [stats, setStats] = useState({ pathLength: 0, explored: 0, obstacles: 0, timeTaken: 0 });
  
  const [dynamicMode, setDynamicMode] = useState(false);
  const [speed, setSpeed] = useState<SimulationSpeed>(1);
  const [isPaused, setIsPaused] = useState(false);
  const [movingObstacles, setMovingObstacles] = useState<MovingObstacle[]>([]);
  const [replansCount, setReplansCount] = useState(0);
  const [recalculatedPath, setRecalculatedPath] = useState<Position[]>([]);
  
  const simulationRef = useRef<{ shouldStop: boolean }>({ shouldStop: false });

  const generateMovingObstacles = () => {
    const count = 3 + Math.floor(Math.random() * 3);
    const obstacles: MovingObstacle[] = [];
    const types: Array<'car' | 'bird' | 'drone'> = ['car', 'bird', 'drone'];
    
    for (let i = 0; i < count; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * GRID_SIZE);
        y = Math.floor(Math.random() * GRID_SIZE);
      } while (
        grid[y][x] === 1 ||
        (start && x === start.x && y === start.y) ||
        (end && x === end.x && y === end.y) ||
        obstacles.some(o => o.x === x && o.y === y)
      );
      
      obstacles.push({
        id: `obstacle-${i}`,
        x,
        y,
        direction: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)] as any,
        type: types[Math.floor(Math.random() * types.length)],
        speed: 1,
      });
    }
    
    return obstacles;
  };
  
  const moveObstacles = () => {
    setMovingObstacles(prev => prev.map(obstacle => {
      let newX = obstacle.x;
      let newY = obstacle.y;
      let newDirection = obstacle.direction;
      
      // Try to move in current direction
      switch (obstacle.direction) {
        case 'up':
          newY = obstacle.y - 1;
          break;
        case 'down':
          newY = obstacle.y + 1;
          break;
        case 'left':
          newX = obstacle.x - 1;
          break;
        case 'right':
          newX = obstacle.x + 1;
          break;
      }
      
      // Check if new position is valid
      if (
        newX < 0 || newX >= GRID_SIZE ||
        newY < 0 || newY >= GRID_SIZE ||
        grid[newY][newX] === 1
      ) {
        // Change direction randomly
        const directions: Array<'up' | 'down' | 'left' | 'right'> = ['up', 'down', 'left', 'right'];
        newDirection = directions[Math.floor(Math.random() * directions.length)];
        newX = obstacle.x;
        newY = obstacle.y;
      }
      
      return {
        ...obstacle,
        x: newX,
        y: newY,
        direction: newDirection,
      };
    }));
  };
  
  const checkCollisionWithPath = (obstacles: MovingObstacle[], currentPath: Position[]) => {
    for (const obstacle of obstacles) {
      if (currentPath.some(p => p.x === obstacle.x && p.y === obstacle.y)) {
        return true;
      }
    }
    return false;
  };

  const handleCellClick = (x: number, y: number) => {
    if (mode === "start") {
      setStart({ x, y });
      const newGrid = [...grid];
      newGrid[y][x] = 0;
      setGrid(newGrid);
      toast.success("Start point set");
    } else if (mode === "end") {
      setEnd({ x, y });
      const newGrid = [...grid];
      newGrid[y][x] = 0;
      setGrid(newGrid);
      toast.success("Target point set");
    } else if (mode === "obstacle") {
      const newGrid = [...grid];
      newGrid[y][x] = newGrid[y][x] === 1 ? 0 : 1;
      setGrid(newGrid);
      setStats(prev => ({ ...prev, obstacles: prev.obstacles + (newGrid[y][x] === 1 ? 1 : -1) }));
    }
  };

  const randomizeGrid = () => {
    const newGrid = Array(GRID_SIZE).fill(0).map(() =>
      Array(GRID_SIZE).fill(0).map(() => (Math.random() > 0.7 ? 1 : 0))
    );
    
    // Ensure start and end are clear
    if (start) newGrid[start.y][start.x] = 0;
    if (end) newGrid[end.y][end.x] = 0;
    
    setGrid(newGrid);
    const obstacleCount = newGrid.flat().filter(cell => cell === 1).length;
    setStats(prev => ({ ...prev, obstacles: obstacleCount }));
    toast.success("Terrain randomized");
  };

  const resetSimulation = () => {
    simulationRef.current.shouldStop = true;
    setPath([]);
    setExplored([]);
    setDronePosition(null);
    setIsSimulating(false);
    setIsPaused(false);
    setStatus("Waiting for input...");
    setStats({ pathLength: 0, explored: 0, obstacles: stats.obstacles, timeTaken: 0 });
    setMovingObstacles([]);
    setReplansCount(0);
    setRecalculatedPath([]);
  };

  const simulateFlight = async () => {
    if (!start || !end) {
      toast.error("Please set both start and target points");
      return;
    }

    simulationRef.current.shouldStop = false;
    setPath([]);
    setExplored([]);
    setDronePosition(null);
    setIsSimulating(true);
    setIsPaused(false);
    setReplansCount(0);
    setRecalculatedPath([]);
    setStatus("Computing path...");

    // Generate moving obstacles if dynamic mode is on
    if (dynamicMode) {
      const obstacles = generateMovingObstacles();
      setMovingObstacles(obstacles);
    } else {
      setMovingObstacles([]);
    }

    const startTime = performance.now();
    const exploredNodes: Position[] = [];

    const pathFinder = algorithm === "astar" ? findPathAStar : findPathDijkstra;
    
    let computedPath = pathFinder(grid, start, end, (pos) => {
      exploredNodes.push(pos);
    });

    const endTime = performance.now();
    const timeTaken = Math.round(endTime - startTime);

    if (computedPath.length === 0) {
      setStatus("No path found!");
      setIsSimulating(false);
      toast.error("No path found");
      return;
    }

    setStatus("Path found! Executing flight...");
    setStats({
      pathLength: computedPath.length,
      explored: exploredNodes.length,
      obstacles: stats.obstacles,
      timeTaken,
    });

    // Animate exploration
    for (let i = 0; i < exploredNodes.length; i += 3) {
      if (simulationRef.current.shouldStop) return;
      setExplored(exploredNodes.slice(0, i + 3));
      await new Promise((resolve) => setTimeout(resolve, 10 / speed));
    }

    setExplored(exploredNodes);
    setPath(computedPath);
    await new Promise((resolve) => setTimeout(resolve, 300 / speed));

    // Animate drone movement with dynamic obstacle avoidance
    setStatus("Drone in flight...");
    let currentPathIndex = 0;
    let currentPath = [...computedPath];
    
    while (currentPathIndex < currentPath.length) {
      if (simulationRef.current.shouldStop) return;
      
      // Wait if paused
      while (isPaused && !simulationRef.current.shouldStop) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      
      if (simulationRef.current.shouldStop) return;
      
      const currentPos = currentPath[currentPathIndex];
      setDronePosition(currentPos);
      
      // Move obstacles if dynamic mode
      if (dynamicMode && currentPathIndex % 2 === 0) {
        moveObstacles();
        
        // Check for collision with remaining path
        const remainingPath = currentPath.slice(currentPathIndex + 1);
        const needsReplan = checkCollisionWithPath(movingObstacles, remainingPath);
        
        if (needsReplan) {
          setStatus("Obstacle detected! Recalculating...");
          toast.warning("Path recalculated!");
          
          // Recalculate path from current position
          const newExplored: Position[] = [];
          const newPath = pathFinder(grid, currentPos, end, (pos) => {
            newExplored.push(pos);
          });
          
          if (newPath.length > 0) {
            currentPath = newPath;
            currentPathIndex = 0;
            setRecalculatedPath(newPath);
            setReplansCount(prev => prev + 1);
            setStats(prev => ({
              ...prev,
              pathLength: newPath.length,
              explored: prev.explored + newExplored.length,
            }));
            
            // Brief pause to show recalculation
            await new Promise((resolve) => setTimeout(resolve, 500 / speed));
            setStatus("Following new path...");
            continue;
          } else {
            setStatus("No alternative path!");
            toast.error("Cannot find alternative path");
            break;
          }
        }
      }
      
      currentPathIndex++;
      await new Promise((resolve) => setTimeout(resolve, 100 / speed));
    }

    if (!simulationRef.current.shouldStop) {
      setStatus("Mission complete!");
      toast.success("Flight completed successfully!");
    }
    setIsSimulating(false);
    setIsPaused(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Plane className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              AeroPath
            </h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            Autonomous Drone Path Planning Simulator
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <GridMap
                grid={grid}
                start={start}
                end={end}
                path={path}
                explored={explored}
                dronePosition={dronePosition}
                onCellClick={handleCellClick}
                isSimulating={isSimulating}
                movingObstacles={movingObstacles}
                recalculatedPath={recalculatedPath}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-end"
            >
              <RadarOverlay
                dronePosition={dronePosition}
                movingObstacles={movingObstacles}
                gridSize={GRID_SIZE}
                isActive={isSimulating && !isPaused}
              />
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ControlPanel
                algorithm={algorithm}
                onAlgorithmChange={setAlgorithm}
                onSimulate={simulateFlight}
                onReset={resetSimulation}
                onRandomize={randomizeGrid}
                isSimulating={isSimulating}
                mode={mode}
                onModeChange={setMode}
                dynamicMode={dynamicMode}
                onDynamicModeChange={setDynamicMode}
                speed={speed}
                onSpeedChange={setSpeed}
                isPaused={isPaused}
                onPauseToggle={() => setIsPaused(!isPaused)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <StatsPanel
                algorithm={algorithm}
                pathLength={stats.pathLength}
                explored={stats.explored}
                obstacles={stats.obstacles}
                status={status}
                timeTaken={stats.timeTaken}
                dynamicMode={dynamicMode}
                replansCount={replansCount}
                movingObstaclesCount={movingObstacles.length}
                isPaused={isPaused}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <POVCamera isActive={isSimulating} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
