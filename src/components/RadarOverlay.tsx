import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Radar } from "lucide-react";
import { MovingObstacle } from "@/types/simulation";
import { Position } from "@/utils/pathfinding";

interface RadarOverlayProps {
  dronePosition: Position | null;
  movingObstacles: MovingObstacle[];
  gridSize: number;
  isActive: boolean;
}

export const RadarOverlay = ({ dronePosition, movingObstacles, gridSize, isActive }: RadarOverlayProps) => {
  const radarRange = 5;
  
  const getRelativePosition = (obstacle: MovingObstacle) => {
    if (!dronePosition) return null;
    const dx = obstacle.x - dronePosition.x;
    const dy = obstacle.y - dronePosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > radarRange) return null;
    
    return {
      x: (dx / radarRange) * 40 + 50,
      y: (dy / radarRange) * 40 + 50,
      distance,
    };
  };

  const getObstacleColor = (type: string) => {
    switch (type) {
      case 'car': return 'hsl(var(--secondary))';
      case 'bird': return 'hsl(var(--accent))';
      case 'drone': return 'hsl(var(--destructive))';
      default: return 'hsl(var(--primary))';
    }
  };

  return (
    <Card className="cyber-border bg-card/50 backdrop-blur-sm p-4 w-48">
      <div className="flex items-center gap-2 mb-2">
        <Radar className="w-4 h-4 text-primary" />
        <h3 className="text-xs font-semibold text-primary">Proximity Radar</h3>
      </div>
      
      <div className="relative aspect-square bg-background/50 rounded border border-border/50">
        {/* Radar rings */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.2" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.2" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.2" />
          <circle cx="50" cy="50" r="10" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.2" />
          
          {/* Crosshairs */}
          <line x1="50" y1="10" x2="50" y2="90" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.2" />
          <line x1="10" y1="50" x2="90" y2="50" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.2" />
        </svg>

        {/* Drone center */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={isActive ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <div className="w-2 h-2 rounded-full bg-primary" />
        </motion.div>

        {/* Moving obstacles */}
        {isActive && movingObstacles.map((obstacle) => {
          const pos = getRelativePosition(obstacle);
          if (!pos) return null;
          
          return (
            <motion.div
              key={obstacle.id}
              className="absolute"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: getObstacleColor(obstacle.type) }}
              />
            </motion.div>
          );
        })}

        {/* Scanning sweep */}
        {isActive && (
          <motion.div
            className="absolute inset-0"
            style={{ transformOrigin: '50% 50%' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-full h-full relative">
              <div 
                className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left"
                style={{
                  background: 'linear-gradient(to right, transparent, hsl(var(--primary) / 0.5))',
                }}
              />
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="mt-2 text-xs text-muted-foreground text-center">
        Range: {radarRange} units
      </div>
    </Card>
  );
};
