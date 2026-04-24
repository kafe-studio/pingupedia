export type EnemyKind = "skua" | "seal" | "leopard" | "petrel" | "orca" | "boss";

export type PowerUpKind = "damage" | "multi" | "rate" | "speed" | "heal";

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
  fireTimer: number;
  // For boss: attack phase timer + shooter pattern
  phase: number;
  phaseTimer: number;
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

export interface EnemyProjectile {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  damage: number;
  kind: "ice" | "water";
}

export interface PowerUp {
  kind: PowerUpKind;
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
  bobPhase: number;
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
  pickupFlashMs: number;
}

export interface UpgradeSpec {
  kind: PowerUpKind;
  icon: string;
  title: string;
  apply(_h: Hero): void;
}

export interface WaveSpec {
  skua: number;
  seal: number;
  leopard: number;
  petrel: number;
  orca: number;
  boss: number;
  spawnRateMs: number;
  baseSpeed: number;
}

export type GameStatus = "playing" | "win" | "gameover";

export const CANVAS_W = 400;
export const CANVAS_H = 600;
export const HERO_W = 44;
export const HERO_H = 52;
