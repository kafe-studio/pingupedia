import type { Level } from "./types";

const LADDER_W = 22;
const PLATFORM_H = 14;

function makeLevel(n: number): Level {
  const base: Level = {
    name: `Úroveň ${n}`,
    platforms: [
      { x: 0, y: 572, w: 400, h: PLATFORM_H },
      { x: 70, y: 460, w: 330, h: PLATFORM_H },
      { x: 0, y: 348, w: 330, h: PLATFORM_H },
      { x: 70, y: 236, w: 330, h: PLATFORM_H },
      { x: 100, y: 124, w: 220, h: PLATFORM_H },
    ],
    ladders: [
      { x: 330, y: 460, w: LADDER_W, h: 112 },
      { x: 40, y: 348, w: LADDER_W, h: 112 },
      { x: 250, y: 236, w: LADDER_W, h: 112 },
      { x: 190, y: 124, w: LADDER_W, h: 112 },
    ],
    goal: { x: 180, y: 94, w: 40, h: 30 },
    spawnStartMs: 1600,
    spawnRateMs: 1800,
    obstacleSpeed: 1.6,
    heroStart: { x: 20, y: 544 },
  };
  if (n >= 2) {
    base.spawnRateMs = 1400;
    base.obstacleSpeed = 2.0;
  }
  if (n >= 3) {
    base.spawnRateMs = 1000;
    base.obstacleSpeed = 2.4;
  }
  return base;
}

export function getLevel(n: number): Level {
  return makeLevel(Math.min(Math.max(n, 1), 3));
}

export const MAX_LEVEL = 3;
