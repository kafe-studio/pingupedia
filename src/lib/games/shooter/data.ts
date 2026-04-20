import type { Enemy, EnemyKind, UpgradeOption, WaveSpec } from "./types";

export const ENEMY_SPECS: Record<
  EnemyKind,
  { w: number; h: number; hp: number; score: number; xp: number; speed: number }
> = {
  skua: { w: 22, h: 20, hp: 1, score: 10, xp: 8, speed: 1.0 },
  seal: { w: 32, h: 26, hp: 3, score: 30, xp: 20, speed: 0.7 },
  orca: { w: 44, h: 30, hp: 6, score: 80, xp: 45, speed: 0.5 },
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
  };
}

export const WAVES: WaveSpec[] = [
  { skua: 10, seal: 0, orca: 0, spawnRateMs: 900, baseSpeed: 1.0 },
  { skua: 14, seal: 4, orca: 0, spawnRateMs: 800, baseSpeed: 1.1 },
  { skua: 16, seal: 8, orca: 1, spawnRateMs: 700, baseSpeed: 1.15 },
  { skua: 20, seal: 10, orca: 3, spawnRateMs: 600, baseSpeed: 1.25 },
  { skua: 24, seal: 14, orca: 5, spawnRateMs: 500, baseSpeed: 1.4 },
];

export const UPGRADES: UpgradeOption[] = [
  {
    id: "damage",
    icon: "💪",
    title: "Silnější sněhule",
    description: "Sněhové koule dají nepříteli o 1 bod zranění víc.",
    apply(h) {
      h.damage += 1;
    },
  },
  {
    id: "multi",
    icon: "❄️",
    title: "Vějířovitý výstřel",
    description: "Tučňák vystřelí o jednu kouli navíc v širším rozptylu.",
    apply(h) {
      h.multiShot += 1;
    },
  },
  {
    id: "rate",
    icon: "⚡",
    title: "Rychlejší střelba",
    description: "Prodleva mezi výstřely se zkrátí o 25 %.",
    apply(h) {
      h.fireIntervalMs = Math.max(90, h.fireIntervalMs * 0.75);
    },
  },
  {
    id: "speed",
    icon: "🏃",
    title: "Hbitější tučňák",
    description: "Pohyb o 30 % rychlejší — lepší úhybové manévry.",
    apply(h) {
      h.speed *= 1.3;
    },
  },
  {
    id: "heal",
    icon: "❤️",
    title: "Ocelové peří",
    description: "Maximální životy +25 a okamžité plné vyléčení.",
    apply(h) {
      h.maxHp += 25;
      h.hp = h.maxHp;
    },
  },
];

export function pickThreeUpgrades(): UpgradeOption[] {
  const pool = [...UPGRADES];
  const picked: UpgradeOption[] = [];
  while (picked.length < 3 && pool.length) {
    const i = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(i, 1)[0]);
  }
  return picked;
}
