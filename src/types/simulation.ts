export interface MovingObstacle {
  id: string;
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  type: 'car' | 'bird' | 'drone';
  speed: number;
}

export type SimulationSpeed = 0.5 | 1 | 2;

export interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  speed: SimulationSpeed;
  dynamicMode: boolean;
  replansCount: number;
}
