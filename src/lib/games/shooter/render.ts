import type { Bullet, Enemy, EnemyProjectile, Hero, PowerUp, PowerUpKind } from "./types";
import { CANVAS_H, CANVAS_W } from "./types";

// Safari < 16 nemá CanvasRenderingContext2D.roundRect — fallback na manuální path.
function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  const radius = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function drawBackground(ctx: CanvasRenderingContext2D, t: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  g.addColorStop(0, "#020617");
  g.addColorStop(0.55, "#0b1a33");
  g.addColorStop(1, "#1e3a5f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // Stars / snow drift
  ctx.fillStyle = "rgba(186, 230, 253, 0.75)";
  for (let i = 0; i < 30; i++) {
    const x = (i * 73 + ((t / 50) | 0)) % CANVAS_W;
    const y = (i * 41 + ((t / 20) | 0) * 2) % CANVAS_H;
    const s = (i % 3) + 1;
    ctx.fillRect(x, y, s, s);
  }
  // Iceberg silhouettes along the bottom.
  ctx.fillStyle = "rgba(148, 163, 184, 0.18)";
  ctx.beginPath();
  ctx.moveTo(0, CANVAS_H);
  ctx.lineTo(40, CANVAS_H - 30);
  ctx.lineTo(100, CANVAS_H - 18);
  ctx.lineTo(160, CANVAS_H - 36);
  ctx.lineTo(240, CANVAS_H - 16);
  ctx.lineTo(320, CANVAS_H - 32);
  ctx.lineTo(CANVAS_W, CANVAS_H - 22);
  ctx.lineTo(CANVAS_W, CANVAS_H);
  ctx.closePath();
  ctx.fill();
}

export function drawHero(ctx: CanvasRenderingContext2D, h: Hero, t: number): void {
  const { x, y, w, h: hh } = h;
  const flicker = h.invulnerableMs > 0 && ((t / 60) | 0) % 2 === 0;
  const pickupGlow = h.pickupFlashMs > 0;
  if (flicker) ctx.globalAlpha = 0.35;
  ctx.save();
  ctx.translate(x + w / 2, y);
  // Glow ring when picking up a power-up.
  if (pickupGlow) {
    ctx.save();
    ctx.globalAlpha = h.pickupFlashMs / 400;
    ctx.fillStyle = "#fde047";
    ctx.beginPath();
    ctx.ellipse(0, hh / 2 + 4, w / 2 + 8, hh / 2 + 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Body (black)
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(0, hh / 2 + 2, w / 2, hh / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  // Belly (white)
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(0, hh / 2 + 6, w / 2 - 6, hh / 2 - 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Eyes (white)
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(-6, 12, 4.5, 0, Math.PI * 2);
  ctx.arc(6, 12, 4.5, 0, Math.PI * 2);
  ctx.fill();
  // Pupils
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(-5, 12, 2.2, 0, Math.PI * 2);
  ctx.arc(7, 12, 2.2, 0, Math.PI * 2);
  ctx.fill();
  // Beak
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.moveTo(-3, 20);
  ctx.lineTo(6, 21);
  ctx.lineTo(-3, 24);
  ctx.closePath();
  ctx.fill();
  // Feet
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(-10, hh - 4, 7, 4);
  ctx.fillRect(3, hh - 4, 7, 4);
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
  // Weddell — gray with spots
  ctx.fillStyle = "#64748b";
  ctx.beginPath();
  ctx.ellipse(0, 0, e.w / 2, e.h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#94a3b8";
  ctx.beginPath();
  ctx.ellipse(0, 2, e.w / 2 - 3, e.h / 2 - 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Spots
  ctx.fillStyle = "#475569";
  ctx.beginPath();
  ctx.arc(-8, 0, 1.5, 0, Math.PI * 2);
  ctx.arc(8, 2, 1.5, 0, Math.PI * 2);
  ctx.arc(-4, 6, 1.3, 0, Math.PI * 2);
  ctx.fill();
  // Eyes
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(-5, -4, 1.6, 0, Math.PI * 2);
  ctx.arc(5, -4, 1.6, 0, Math.PI * 2);
  ctx.fill();
  // Mouth
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 2, 4, 0.2, Math.PI - 0.2);
  ctx.stroke();
  // Flippers
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

function drawLeopard(ctx: CanvasRenderingContext2D, e: Enemy): void {
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
  // Darker, longer body
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.ellipse(0, 0, e.w / 2, e.h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#475569";
  ctx.beginPath();
  ctx.ellipse(0, 3, e.w / 2 - 4, e.h / 2 - 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Leopard spots
  ctx.fillStyle = "#0f172a";
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.arc(i * 5, -2, 1.5, 0, Math.PI * 2);
    ctx.arc(i * 5 + 2, 4, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
  // Open jaws (menacing)
  ctx.fillStyle = "#7f1d1d";
  ctx.beginPath();
  ctx.ellipse(0, 6, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  for (let i = -2; i <= 2; i++) {
    ctx.fillRect(i * 2 - 0.5, 5, 1, 2);
  }
  // Eyes (red tint)
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(-6, -5, 2, 0, Math.PI * 2);
  ctx.arc(6, -5, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(-6, -5, 1, 0, Math.PI * 2);
  ctx.arc(6, -5, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPetrel(ctx: CanvasRenderingContext2D, e: Enemy, t: number): void {
  const flap = Math.sin(t / 100 + e.zigPhase) * 5;
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
  // Body
  ctx.fillStyle = "#334155";
  ctx.beginPath();
  ctx.ellipse(0, 0, e.w / 2, e.h / 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // White belly stripe
  ctx.fillStyle = "#cbd5e1";
  ctx.beginPath();
  ctx.ellipse(0, 2, e.w / 2 - 4, e.h / 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wings (longer + narrower)
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.moveTo(-e.w / 2 + 2, -1);
  ctx.lineTo(-e.w / 2 - 6, -10 + flap);
  ctx.lineTo(-e.w / 2 - 2, 3);
  ctx.closePath();
  ctx.moveTo(e.w / 2 - 2, -1);
  ctx.lineTo(e.w / 2 + 6, -10 + flap);
  ctx.lineTo(e.w / 2 + 2, 3);
  ctx.closePath();
  ctx.fill();
  // Beak (hooked)
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(e.w / 2 - 2, -1, 5, 2);
  // Eye
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-2, -3, 3, 2);
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(-1, -2, 1, 1);
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
  else if (e.kind === "leopard") drawLeopard(ctx, e);
  else if (e.kind === "petrel") drawPetrel(ctx, e, t);
  else if (e.kind === "orca") drawOrca(ctx, e);
  if (e.hp < e.maxHp) {
    const ratio = e.hp / e.maxHp;
    ctx.fillStyle = "rgba(6,17,31,0.7)";
    ctx.fillRect(e.x, e.y - 6, e.w, 3);
    ctx.fillStyle = ratio > 0.5 ? "#10b981" : ratio > 0.25 ? "#fbbf24" : "#ef4444";
    ctx.fillRect(e.x, e.y - 6, e.w * ratio, 3);
  }
}

export function drawBoss(ctx: CanvasRenderingContext2D, e: Enemy, t: number): void {
  const { x, y, w, h } = e;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  // Big orca-like body
  const pulse = 1 + Math.sin(t / 300) * 0.02;
  ctx.scale(pulse, pulse);
  // Body
  ctx.fillStyle = "#020617";
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  // White belly patch
  ctx.fillStyle = "#f1f5f9";
  ctx.beginPath();
  ctx.ellipse(0, 12, w / 2 - 20, h / 2 - 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Eye patches (classic orca)
  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(-46, -18, 22, 10);
  ctx.fillRect(24, -18, 22, 10);
  // Eyes
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(-36, -12, 4, 0, Math.PI * 2);
  ctx.arc(36, -12, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(-36, -12, 2, 0, Math.PI * 2);
  ctx.arc(36, -12, 2, 0, Math.PI * 2);
  ctx.fill();
  // Teeth
  ctx.fillStyle = "#ffffff";
  for (let i = -4; i <= 4; i++) {
    ctx.fillRect(i * 8 - 2, 20, 3, 5);
  }
  // Dorsal fin (top)
  ctx.fillStyle = "#020617";
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(-12, -h / 2 - 20);
  ctx.lineTo(14, -h / 2 - 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // HP bar above boss
  const ratio = e.hp / e.maxHp;
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(x, y - 10, w, 6);
  ctx.fillStyle = ratio > 0.5 ? "#10b981" : ratio > 0.25 ? "#fbbf24" : "#ef4444";
  ctx.fillRect(x, y - 10, w * ratio, 6);
}

const POWERUP_COLORS: Record<PowerUpKind, { bg: string; glow: string; icon: string }> = {
  damage: { bg: "#f97316", glow: "#fdba74", icon: "💪" },
  multi:  { bg: "#38bdf8", glow: "#bae6fd", icon: "❄" },
  rate:   { bg: "#fbbf24", glow: "#fde68a", icon: "⚡" },
  speed:  { bg: "#22c55e", glow: "#bbf7d0", icon: "🏃" },
  heal:   { bg: "#ef4444", glow: "#fecaca", icon: "❤" },
};

export function drawPowerUp(ctx: CanvasRenderingContext2D, p: PowerUp, t: number): void {
  const c = POWERUP_COLORS[p.kind];
  const bob = Math.sin(p.bobPhase) * 2;
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h / 2 + bob;
  // Glow
  ctx.save();
  ctx.globalAlpha = 0.35 + 0.25 * Math.sin(t / 200);
  ctx.fillStyle = c.glow;
  ctx.beginPath();
  ctx.arc(cx, cy, p.w / 2 + 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Container box
  ctx.fillStyle = c.bg;
  ctx.beginPath();
  drawRoundRect(ctx, p.x, p.y + bob, p.w, p.h, 5);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Icon
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(c.icon, cx, cy + 1);
}

export function drawEnemyProjectile(ctx: CanvasRenderingContext2D, p: EnemyProjectile, t: number): void {
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h / 2;
  if (p.kind === "water") {
    // Water jet — blue droplet
    ctx.fillStyle = "rgba(56, 189, 248, 0.5)";
    ctx.beginPath();
    ctx.ellipse(cx, cy, p.w / 2 + 2, p.h / 2 + 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.ellipse(cx, cy, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f0f9ff";
    ctx.beginPath();
    ctx.ellipse(cx - 1, cy - 2, 1.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Ice shard — sharp white diamond
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t / 200);
    ctx.fillStyle = "#bae6fd";
    ctx.beginPath();
    ctx.moveTo(0, -p.h / 2);
    ctx.lineTo(p.w / 2, 0);
    ctx.lineTo(0, p.h / 2);
    ctx.lineTo(-p.w / 2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
}
