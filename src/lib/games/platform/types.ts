export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Platform extends Rect {}

export interface Ladder {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Hero {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  onGround: boolean;
  onLadder: boolean;
  facing: 1 | -1;
}

export interface Obstacle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

export interface Level {
  name: string;
  platforms: Platform[];
  ladders: Ladder[];
  goal: { x: number; y: number; w: number; h: number };
  spawnStartMs: number;
  spawnRateMs: number;
  obstacleSpeed: number;
  heroStart: { x: number; y: number };
}

export const CANVAS_W = 400;
export const CANVAS_H = 600;
export const HERO_W = 22;
export const HERO_H = 28;
