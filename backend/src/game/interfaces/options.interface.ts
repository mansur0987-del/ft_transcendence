import { Mode } from './mode.interface';

interface Playground { // == DISPLAY
  width: number;
  height: number;
}

interface Ball {
  speed: number;
  radius: number;
}

interface Paddle {
  width: number;
  height: number;
  x: number;
}

interface Score {
  y: number;
  max: number;
}

export interface GameOptions {
  playground: Playground;
  ball: Ball;
  paddle: Paddle;
  score: Score;
  mode: Mode;
}