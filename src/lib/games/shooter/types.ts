export type EnemyKind = "skua" | "seal" | "orca";

export interface Enemy {
  kind: EnemyKind;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  scoreValue: number;
  xpValue: number;
  zigPhase: number;
}

export interface Bullet {
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
  damage: number;
  pierce: number;
  hit: Set<Enemy>;
}

export interface Hero {
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  multiShot: number;
  fireIntervalMs: number;
  fireTimer: number;
  invulnerableMs: number;
}

export interface UpgradeOption {
  id: string;
  icon: string;
  title: string;
  description: string;
  apply(_h: Hero): void;
}

export interface WaveSpec {
  skua: number;
  seal: number;
  orca: number;
  spawnRateMs: number;
  baseSpeed: number;
}

export type GameStatus = "playing" | "levelUp" | "waveDone" | "win" | "gameover";

export const CANVAS_W = 400;
export const CANVAS_H = 600;
export const HERO_W = 30;
export const HERO_H = 34;
