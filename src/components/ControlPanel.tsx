import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Play, RotateCcw, Shuffle, Pause, PlayCircle } from "lucide-react";
import { SimulationSpeed } from "@/types/simulation";

interface ControlPanelProps {
  algorithm: "astar" | "dijkstra";
  onAlgorithmChange: (algorithm: "astar" | "dijkstra") => void;
  onSimulate: () => void;
  onReset: () => void;
  onRandomize: () => void;
  isSimulating: boolean;
  mode: "start" | "end" | "obstacle";
  onModeChange: (mode: "start" | "end" | "obstacle") => void;
  dynamicMode: boolean;
  onDynamicModeChange: (enabled: boolean) => void;
  speed: SimulationSpeed;
  onSpeedChange: (speed: SimulationSpeed) => void;
  isPaused: boolean;
  onPauseToggle: () => void;
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
  dynamicMode,
  onDynamicModeChange,
  speed,
  onSpeedChange,
  isPaused,
  onPauseToggle,
}: ControlPanelProps) => {
  const speedToValue = (s: SimulationSpeed) => {
    switch (s) {
      case 0.5: return 0;
      case 1: return 1;
      case 2: return 2;
    }
  };
  
  const valueToSpeed = (v: number): SimulationSpeed => {
    switch (v) {
      case 0: return 0.5;
      case 2: return 2;
      default: return 1;
    }
  };
  return (
    <Card className="cyber-border bg-card/50 backdrop-blur-sm p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-primary">Flight Controls</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">Dynamic Mode</Label>
            <Switch 
              checked={dynamicMode} 
              onCheckedChange={onDynamicModeChange}
              disabled={isSimulating}
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm text-muted-foreground">Speed</Label>
              <span className="text-xs font-mono">{speed}x</span>
            </div>
            <Slider
              value={[speedToValue(speed)]}
              onValueChange={(v) => onSpeedChange(valueToSpeed(v[0]))}
              min={0}
              max={2}
              step={1}
              disabled={isSimulating}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>
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
        {!isSimulating ? (
          <Button 
            onClick={onSimulate} 
            className="w-full glow-cyan"
            size="lg"
          >
            <Play className="w-4 h-4 mr-2" />
            Simulate Flight
          </Button>
        ) : (
          <Button 
            onClick={onPauseToggle} 
            className="w-full"
            size="lg"
            variant="secondary"
          >
            {isPaused ? <PlayCircle className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
            {isPaused ? "Resume" : "Pause"}
          </Button>
        )}
        
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
