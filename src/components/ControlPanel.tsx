import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Play, RotateCcw, Shuffle, MapPin } from "lucide-react";

interface ControlPanelProps {
  algorithm: "astar" | "dijkstra";
  onAlgorithmChange: (algorithm: "astar" | "dijkstra") => void;
  onSimulate: () => void;
  onReset: () => void;
  onRandomize: () => void;
  isSimulating: boolean;
  mode: "start" | "end" | "obstacle";
  onModeChange: (mode: "start" | "end" | "obstacle") => void;
}

export const ControlPanel = ({
  algorithm,
  onAlgorithmChange,
  onSimulate,
  onReset,
  onRandomize,
  isSimulating,
  mode,
  onModeChange,
}: ControlPanelProps) => {
  return (
    <Card className="cyber-border bg-card/50 backdrop-blur-sm p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-primary">Flight Controls</h3>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Placement Mode</Label>
            <RadioGroup value={mode} onValueChange={(v) => onModeChange(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="start" id="start" disabled={isSimulating} />
                <Label htmlFor="start" className="cursor-pointer">Set Start Point</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="end" id="end" disabled={isSimulating} />
                <Label htmlFor="end" className="cursor-pointer">Set Target Point</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="obstacle" id="obstacle" disabled={isSimulating} />
                <Label htmlFor="obstacle" className="cursor-pointer">Add Obstacles</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Algorithm</Label>
            <RadioGroup value={algorithm} onValueChange={(v) => onAlgorithmChange(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="astar" id="astar" disabled={isSimulating} />
                <Label htmlFor="astar" className="cursor-pointer">A* (Optimal & Fast)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dijkstra" id="dijkstra" disabled={isSimulating} />
                <Label htmlFor="dijkstra" className="cursor-pointer">Dijkstra (Guaranteed Shortest)</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Button 
          onClick={onSimulate} 
          disabled={isSimulating}
          className="w-full glow-cyan"
          size="lg"
        >
          <Play className="w-4 h-4 mr-2" />
          Simulate Flight
        </Button>
        
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={onReset} 
            variant="outline"
            disabled={isSimulating}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          
          <Button 
            onClick={onRandomize} 
            variant="outline"
            disabled={isSimulating}
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Randomize
          </Button>
        </div>
      </div>
    </Card>
  );
};
