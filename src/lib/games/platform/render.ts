import type { Hero, Level, Obstacle } from "./types";
import { CANVAS_H, CANVAS_W } from "./types";

export function drawBackground(ctx: CanvasRenderingContext2D): void {
  const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  g.addColorStop(0, "#1e3a5f");
  g.addColorStop(0.6, "#0c2843");
  g.addColorStop(1, "#06111f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  for (let i = 0; i < 20; i++) {
    const x = (i * 73) % CANVAS_W;
    const y = (i * 41 + 30) % CANVAS_H;
    ctx.fillRect(x, y, 2, 2);
  }
}

export function drawPlatform(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "#bae6fd");
  g.addColorStop(0.5, "#7dd3fc");
  g.addColorStop(1, "#0ea5e9");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillRect(x, y, w, 2);
  ctx.fillStyle = "rgba(6,17,31,0.15)";
  for (let i = 0; i < w; i += 12) {
    ctx.fillRect(x + i, y + h - 2, 6, 2);
  }
}

export function drawLadder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  ctx.strokeStyle = "#fef3c7";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 3, y);
  ctx.lineTo(x + 3, y + h);
  ctx.moveTo(x + w - 3, y);
  ctx.lineTo(x + w - 3, y + h);
  ctx.stroke();
  ctx.lineWidth = 2;
  for (let i = 6; i < h; i += 10) {
    ctx.beginPath();
    ctx.moveTo(x + 3, y + i);
    ctx.lineTo(x + w - 3, y + i);
    ctx.stroke();
  }
}

export function drawGoal(
  ctx: CanvasRenderingContext2D,
  gx: number,
  gy: number,
  t: number,
): void {
  const bob = Math.sin(t / 300) * 3;
  const cy = gy + 14 + bob;
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(gx + 18, cy + 6, 10, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(gx + 18, cy + 8, 6, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.moveTo(gx + 16, cy + 8);
  ctx.lineTo(gx + 14, cy + 10);
  ctx.lineTo(gx + 16, cy + 11);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(gx + 17, cy + 5, 1, 1);
  ctx.fillRect(gx + 19, cy + 5, 1, 1);
  ctx.fillStyle = "#fca5a5";
  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("!", gx + 18, cy - 4);
}

export function drawHero(ctx: CanvasRenderingContext2D, h: Hero): void {
  const { x, y, w, h: hh, facing, onLadder } = h;
  ctx.save();
  ctx.translate(x + w / 2, y);
  if (facing === -1) ctx.scale(-1, 1);
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(0, hh / 2 + 2, w / 2, hh / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(0, hh / 2 + 4, w / 2 - 3, hh / 2 - 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(-3, 6, 2.5, 0, Math.PI * 2);
  ctx.arc(3, 6, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(-2.5, 6, 1.2, 0, Math.PI * 2);
  ctx.arc(3.5, 6, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.moveTo(-2, 10);
  ctx.lineTo(3, 12);
  ctx.lineTo(-2, 13);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fbbf24";
  const feetOffset = onLadder ? 0 : Math.floor((Date.now() / 120) % 2) * 2 - 1;
  ctx.fillRect(-6 + feetOffset, hh - 3, 5, 3);
  ctx.fillRect(1 - feetOffset, hh - 3, 5, 3);
  ctx.restore();
}

export function drawObstacle(
  ctx: CanvasRenderingContext2D,
  o: Obstacle,
  t: number,
): void {
  ctx.save();
  ctx.translate(o.x + o.size / 2, o.y + o.size / 2);
  ctx.rotate((t / 400) % (Math.PI * 2));
  ctx.fillStyle = "#e0f2fe";
  ctx.strokeStyle = "#7dd3fc";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const s = o.size / 2;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const r = i % 2 === 0 ? s : s / 2;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  level: Level,
  hero: Hero,
  obstacles: Obstacle[],
  t: number,
): void {
  drawBackground(ctx);
  for (const l of level.ladders) drawLadder(ctx, l.x, l.y, l.w, l.h);
  for (const p of level.platforms) drawPlatform(ctx, p.x, p.y, p.w, p.h);
  drawGoal(ctx, level.goal.x, level.goal.y, t);
  for (const o of obstacles) drawObstacle(ctx, o, t);
  drawHero(ctx, hero);
}
