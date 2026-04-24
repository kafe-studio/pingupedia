import type { Enemy, EnemyKind, PowerUpKind, UpgradeSpec, WaveSpec } from "./types";

export const ENEMY_SPECS: Record<
  EnemyKind,
  { w: number; h: number; hp: number; score: number; xp: number; speed: number }
> = {
  skua:    { w: 24, h: 22, hp: 1,  score: 10,  xp: 8,  speed: 1.0 },
  seal:    { w: 34, h: 28, hp: 3,  score: 30,  xp: 20, speed: 0.7 },
  leopard: { w: 40, h: 28, hp: 4,  score: 50,  xp: 28, speed: 1.25 },
  petrel:  { w: 30, h: 22, hp: 2,  score: 40,  xp: 22, speed: 0.9 },
  orca:    { w: 48, h: 34, hp: 7,  score: 90,  xp: 48, speed: 0.55 },
  boss:    { w: 180, h: 90, hp: 120, score: 1000, xp: 0, speed: 0.25 },
};

export function makeEnemy(kind: EnemyKind, x: number, speedMul: number): Enemy {
  const s = ENEMY_SPECS[kind];
  return {
    kind,
    x,
    y: -s.h,
    w: s.w,
    h: s.h,
    vx: 0,
    vy: s.speed * speedMul,
    hp: s.hp,
    maxHp: s.hp,
    scoreValue: s.score,
    xpValue: s.xp,
    zigPhase: Math.random() * Math.PI * 2,
    fireTimer: kind === "petrel" ? 1400 + Math.random() * 600 : kind === "boss" ? 2000 : 0,
    phase: 0,
    phaseTimer: 0,
  };
}

// 6 waves: 5 standard + boss final.
// leopard appears wave 2+, petrel wave 3+, orca wave 4+.
export const WAVES: WaveSpec[] = [
  { skua: 10, seal: 0,  leopard: 0, petrel: 0, orca: 0, boss: 0, spawnRateMs: 900, baseSpeed: 1.0 },
  { skua: 12, seal: 4,  leopard: 2, petrel: 0, orca: 0, boss: 0, spawnRateMs: 800, baseSpeed: 1.05 },
  { skua: 14, seal: 6,  leopard: 3, petrel: 3, orca: 0, boss: 0, spawnRateMs: 720, baseSpeed: 1.1 },
  { skua: 16, seal: 8,  leopard: 4, petrel: 4, orca: 2, boss: 0, spawnRateMs: 640, baseSpeed: 1.18 },
  { skua: 18, seal: 10, leopard: 5, petrel: 6, orca: 4, boss: 0, spawnRateMs: 550, baseSpeed: 1.3 },
  { skua: 0,  seal: 0,  leopard: 0, petrel: 0, orca: 0, boss: 1, spawnRateMs: 2000, baseSpeed: 1.0 },
];

export const UPGRADES: Record<PowerUpKind, UpgradeSpec> = {
  damage: {
    kind: "damage",
    icon: "💪",
    title: "Silnější sněhule",
    apply(h) {
      h.damage += 1;
    },
  },
  multi: {
    kind: "multi",
    icon: "❄️",
    title: "Vějíř",
    apply(h) {
      h.multiShot += 1;
    },
  },
  rate: {
    kind: "rate",
    icon: "⚡",
    title: "Rychlejší střelba",
    apply(h) {
      h.fireIntervalMs = Math.max(90, h.fireIntervalMs * 0.78);
    },
  },
  speed: {
    kind: "speed",
    icon: "🏃",
    title: "Rychlejší tučňák",
    apply(h) {
      h.speed *= 1.2;
    },
  },
  heal: {
    kind: "heal",
    icon: "❤️",
    title: "Doplnění životů",
    apply(h) {
      h.hp = Math.min(h.maxHp, h.hp + 30);
    },
  },
};

const POWER_UP_KINDS: PowerUpKind[] = ["damage", "multi", "rate", "speed", "heal"];

export function randomPowerUpKind(): PowerUpKind {
  return POWER_UP_KINDS[Math.floor(Math.random() * POWER_UP_KINDS.length)];
}
