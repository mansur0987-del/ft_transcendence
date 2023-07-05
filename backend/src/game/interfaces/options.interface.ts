import { Mode } from './mode.interface';

interface Field {
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
  field: Field;
  ball: Ball;
  paddle: Paddle;
  score: Score;
  mode: Mode;
}