import type { Bullet, Enemy, Hero } from "./types";
import { CANVAS_H, CANVAS_W } from "./types";

export function drawBackground(ctx: CanvasRenderingContext2D, t: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  g.addColorStop(0, "#020617");
  g.addColorStop(0.55, "#0b1a33");
  g.addColorStop(1, "#1e3a5f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = "rgba(186, 230, 253, 0.75)";
  for (let i = 0; i < 30; i++) {
    const x = (i * 73 + ((t / 50) | 0)) % CANVAS_W;
    const y = (i * 41 + ((t / 20) | 0) * 2) % CANVAS_H;
    const s = (i % 3) + 1;
    ctx.fillRect(x, y, s, s);
  }
}

export function drawHero(ctx: CanvasRenderingContext2D, h: Hero, t: number): void {
  const { x, y, w, h: hh } = h;
  const flicker = h.invulnerableMs > 0 && ((t / 60) | 0) % 2 === 0;
  if (flicker) {
    ctx.globalAlpha = 0.35;
  }
  ctx.save();
  ctx.translate(x + w / 2, y);
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(0, hh / 2 + 2, w / 2, hh / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(0, hh / 2 + 4, w / 2 - 4, hh / 2 - 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(-4, 8, 3, 0, Math.PI * 2);
  ctx.arc(4, 8, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(-3.5, 8, 1.4, 0, Math.PI * 2);
  ctx.arc(4.5, 8, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.moveTo(-2, 13);
  ctx.lineTo(4, 14);
  ctx.lineTo(-2, 16);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(-7, hh - 3, 5, 3);
  ctx.fillRect(2, hh - 3, 5, 3);
  ctx.restore();
  ctx.globalAlpha = 1;
}

export function drawBullet(ctx: CanvasRenderingContext2D, b: Bullet): void {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(186, 230, 253, 0.8)";
  ctx.beginPath();
  ctx.arc(b.x + b.w / 2, b.y + b.h / 2 + 4, b.w / 2 + 1, 0, Math.PI * 2);
  ctx.fill();
}

function drawSkua(ctx: CanvasRenderingContext2D, e: Enemy, t: number): void {
  const flap = Math.sin(t / 120 + e.zigPhase) * 4;
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
  ctx.fillStyle = "#475569";
  ctx.beginPath();
  ctx.ellipse(0, 0, e.w / 2, e.h / 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.moveTo(-e.w / 2 + 2, -2);
  ctx.lineTo(-e.w / 2 - 4, -8 + flap);
  ctx.lineTo(-e.w / 2 - 2, 2);
  ctx.closePath();
  ctx.moveTo(e.w / 2 - 2, -2);
  ctx.lineTo(e.w / 2 + 4, -8 + flap);
  ctx.lineTo(e.w / 2 + 2, 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(e.w / 2 - 4, -1, 6, 2);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-3, -3, 2, 2);
  ctx.restore();
}

function drawSeal(ctx: CanvasRenderingContext2D, e: Enemy): void {
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
  ctx.fillStyle = "#64748b";
  ctx.beginPath();
  ctx.ellipse(0, 0, e.w / 2, e.h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#94a3b8";
  ctx.beginPath();
  ctx.ellipse(0, 2, e.w / 2 - 3, e.h / 2 - 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(-5, -4, 1.6, 0, Math.PI * 2);
  ctx.arc(5, -4, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 2, 4, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.fillStyle = "#334155";
  ctx.beginPath();
  ctx.moveTo(-e.w / 2, 4);
  ctx.lineTo(-e.w / 2 - 6, 8);
  ctx.lineTo(-e.w / 2 + 2, 8);
  ctx.moveTo(e.w / 2, 4);
  ctx.lineTo(e.w / 2 + 6, 8);
  ctx.lineTo(e.w / 2 - 2, 8);
  ctx.fill();
  ctx.restore();
}

function drawOrca(ctx: CanvasRenderingContext2D, e: Enemy): void {
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(0, 0, e.w / 2, e.h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(0, 4, e.w / 2 - 4, e.h / 2 - 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-8, -6, 4, 3);
  ctx.fillRect(4, -6, 4, 3);
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.moveTo(0, -e.h / 2);
  ctx.lineTo(-6, -e.h / 2 - 8);
  ctx.lineTo(4, -e.h / 2 - 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(-2, 3, 4, 2);
  ctx.restore();
}

export function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, t: number): void {
  if (e.kind === "skua") drawSkua(ctx, e, t);
  else if (e.kind === "seal") drawSeal(ctx, e);
  else drawOrca(ctx, e);
  if (e.hp < e.maxHp) {
    const ratio = e.hp / e.maxHp;
    ctx.fillStyle = "rgba(6,17,31,0.7)";
    ctx.fillRect(e.x, e.y - 6, e.w, 3);
    ctx.fillStyle = ratio > 0.5 ? "#10b981" : ratio > 0.25 ? "#fbbf24" : "#ef4444";
    ctx.fillRect(e.x, e.y - 6, e.w * ratio, 3);
  }
}
