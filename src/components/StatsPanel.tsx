import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface StatsPanelProps {
  algorithm: string;
  pathLength: number;
  explored: number;
  obstacles: number;
  status: string;
  timeTaken: number;
}

export const StatsPanel = ({
  algorithm,
  pathLength,
  explored,
  obstacles,
  status,
  timeTaken,
}: StatsPanelProps) => {
  const stats = [
    { label: "Algorithm", value: algorithm.toUpperCase(), color: "bg-primary" },
    { label: "Path Length", value: pathLength > 0 ? `${pathLength} units` : "N/A", color: "bg-accent" },
    { label: "Nodes Explored", value: explored, color: "bg-secondary" },
    { label: "Obstacles", value: obstacles, color: "bg-destructive" },
    { label: "Time Taken", value: `${timeTaken}ms`, color: "bg-muted" },
  ];

  return (
    <Card className="cyber-border bg-card/50 backdrop-blur-sm p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-primary">Mission Status</h3>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            key={status}
          >
            <Badge variant="outline" className="text-sm animate-pulse-glow">
              {status}
            </Badge>
          </motion.div>
        </div>

        <div className="space-y-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex justify-between items-center"
            >
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <span className="text-sm font-mono font-semibold">{stat.value}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
};
