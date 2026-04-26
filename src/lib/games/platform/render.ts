import type { GameState, Guardian, Item, Palette, Room } from "./types";
import { COLS, ROWS, TILE, VIEW_H, VIEW_W } from "./types";
import { PLAYER_H, PLAYER_W } from "./engine";

interface PaletteColors {
  bgTop: string;
  bgBottom: string;
  block: string;
  blockHi: string;
  platform: string;
  ladder: string;
  water: string;
  spikes: string;
  accent: string;
}

const PALETTES: Record<Palette, PaletteColors> = {
  arctic:    { bgTop: "#0f2146", bgBottom: "#1a3a66", block: "#d1e7ff", blockHi: "#ffffff", platform: "#a0c8f0", ladder: "#f59e0b", water: "#1d4ed8", spikes: "#38bdf8", accent: "#fbbf24" },
  aurora:    { bgTop: "#0b1b2a", bgBottom: "#1f4d3b", block: "#86efac", blockHi: "#dcfce7", platform: "#4ade80", ladder: "#f472b6", water: "#14532d", spikes: "#22d3ee", accent: "#f472b6" },
  ocean:     { bgTop: "#0c2d53", bgBottom: "#0b4575", block: "#7dd3fc", blockHi: "#e0f2fe", platform: "#38bdf8", ladder: "#fde047", water: "#0c4a6e", spikes: "#67e8f9", accent: "#fde047" },
  ice:       { bgTop: "#172554", bgBottom: "#2e4e82", block: "#bae6fd", blockHi: "#f0f9ff", platform: "#7dd3fc", ladder: "#f59e0b", water: "#1e3a8a", spikes: "#e0f2fe", accent: "#fbbf24" },
  lab:       { bgTop: "#1a1a2e", bgBottom: "#2b2b4a", block: "#94a3b8", blockHi: "#cbd5e1", platform: "#64748b", ladder: "#10b981", water: "#1e293b", spikes: "#10b981", accent: "#10b981" },
  cave:      { bgTop: "#020617", bgBottom: "#0b1a33", block: "#334155", blockHi: "#64748b", platform: "#475569", ladder: "#fbbf24", water: "#0f172a", spikes: "#a78bfa", accent: "#a78bfa" },
  wreck:     { bgTop: "#1f2937", bgBottom: "#0f172a", block: "#78350f", blockHi: "#a16207", platform: "#92400e", ladder: "#fbbf24", water: "#0c4a6e", spikes: "#9a3412", accent: "#facc15" },
  tropical:  { bgTop: "#134e4a", bgBottom: "#065f46", block: "#d97706", blockHi: "#fbbf24", platform: "#b45309", ladder: "#fb923c", water: "#047857", spikes: "#22c55e", accent: "#fb923c" },
  sunset:    { bgTop: "#9a3412", bgBottom: "#7c2d12", block: "#44403c", blockHi: "#78716c", platform: "#57534e", ladder: "#fde047", water: "#7c2d12", spikes: "#f97316", accent: "#fde047" },
  night:     { bgTop: "#020617", bgBottom: "#0f172a", block: "#1e293b", blockHi: "#334155", platform: "#1e293b", ladder: "#facc15", water: "#020617", spikes: "#38bdf8", accent: "#facc15" },
  candy:     { bgTop: "#831843", bgBottom: "#9d174d", block: "#fb7185", blockHi: "#fda4af", platform: "#f472b6", ladder: "#fde047", water: "#500724", spikes: "#fcd34d", accent: "#fde047" },
  emperor:   { bgTop: "#1e3a8a", bgBottom: "#0f172a", block: "#0ea5e9", blockHi: "#7dd3fc", platform: "#0284c7", ladder: "#facc15", water: "#0c4a6e", spikes: "#e0f2fe", accent: "#facc15" },
  magellan:  { bgTop: "#44403c", bgBottom: "#292524", block: "#78716c", blockHi: "#a8a29e", platform: "#57534e", ladder: "#fbbf24", water: "#1c1917", spikes: "#f87171", accent: "#fbbf24" },
  galapagos: { bgTop: "#15803d", bgBottom: "#166534", block: "#ca8a04", blockHi: "#eab308", platform: "#a16207", ladder: "#fde047", water: "#0f766e", spikes: "#22c55e", accent: "#fde047" },
};

export function drawScene(ctx: CanvasRenderingContext2D, state: GameState): void {
  const room = state.rooms.get(state.currentRoomId)!;
  const pal = PALETTES[room.palette];

  // Sky gradient
  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, pal.bgTop);
  g.addColorStop(1, pal.bgBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  drawBackdrop(ctx, room, state.time);

  // Tiles
  for (let r = 0; r < ROWS; r++) {
    const row = room.tiles[r];
    for (let c = 0; c < COLS; c++) {
      const t = row[c];
      const x = c * TILE;
      const y = r * TILE;
      if (t === "#") drawSolidBlock(ctx, pal, x, y, room.palette);
      else if (t === "=") drawPlatform(ctx, pal, x, y, room.palette);
      else if (t === "H") drawLadder(ctx, pal, x, y);
      else if (t === "~") drawWater(ctx, pal, x, y, state.time);
      else if (t === "*") drawSpikes(ctx, pal, x, y);
      else if (t === "C" || t === "c") drawConveyor(ctx, pal, x, y, t === "C");
      else if (t === "b") drawBreakable(ctx, pal, x, y);
    }
  }

  drawExitHints(ctx, pal, room);
  for (const it of room.items) drawItem(ctx, it, state.time);
  for (const gu of room.guardians) drawGuardian(ctx, gu, state.time);
  drawPlayer(ctx, state.player, state.time);
}

// =====================  BACKDROPS  =====================

function drawBackdrop(ctx: CanvasRenderingContext2D, room: Room, t: number): void {
  switch (room.palette) {
    case "arctic":   drawArcticBackdrop(ctx, t); break;
    case "aurora":   drawAuroraBackdrop(ctx, t); break;
    case "ocean":    drawOceanBackdrop(ctx, t); break;
    case "ice":      drawIceBackdrop(ctx, t); break;
    case "lab":      drawLabBackdrop(ctx, t); break;
    case "cave":     drawCaveBackdrop(ctx, t); break;
    case "wreck":    drawWreckBackdrop(ctx, t); break;
    case "tropical": drawTropicalBackdrop(ctx, t); break;
    case "sunset":   drawSunsetBackdrop(ctx, t); break;
    case "night":    drawNightBackdrop(ctx, t); break;
    case "candy":    drawCandyBackdrop(ctx, t); break;
    case "emperor":  drawEmperorBackdrop(ctx, t); break;
    case "magellan": drawMagellanBackdrop(ctx, t); break;
    case "galapagos":drawGalapagosBackdrop(ctx, t); break;
  }
}

function drawTwinkleStars(ctx: CanvasRenderingContext2D, t: number, count = 22, yMax = VIEW_H / 2): void {
  for (let i = 0; i < count; i++) {
    const x = (i * 71 + 17) % VIEW_W;
    const y = (i * 41 + 7) % yMax;
    const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t / 400 + i));
    ctx.fillStyle = `rgba(255,255,255,${tw})`;
    ctx.fillRect(x, y, 1, 1);
    if (i % 5 === 0) {
      ctx.fillRect(x - 1, y, 1, 1);
      ctx.fillRect(x + 1, y, 1, 1);
      ctx.fillRect(x, y - 1, 1, 1);
      ctx.fillRect(x, y + 1, 1, 1);
    }
  }
}

function drawSnowfall(ctx: CanvasRenderingContext2D, t: number, count = 20): void {
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  for (let i = 0; i < count; i++) {
    const baseX = (i * 37 + 11) % VIEW_W;
    const x = (baseX + Math.sin(t / 600 + i) * 6) % VIEW_W;
    const y = ((i * 19 + Math.floor(t / 22)) % VIEW_H);
    ctx.fillRect(Math.floor(x), y, 1, 1);
  }
}

function drawMountains(ctx: CanvasRenderingContext2D, color: string, baseY: number, peaks: Array<[number, number]>): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  for (const [px, ph] of peaks) ctx.lineTo(px, baseY - ph);
  ctx.lineTo(VIEW_W, baseY);
  ctx.lineTo(VIEW_W, VIEW_H);
  ctx.lineTo(0, VIEW_H);
  ctx.closePath();
  ctx.fill();
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 4 * scale, 0, Math.PI * 2);
  ctx.arc(x + 5 * scale, y - 2 * scale, 5 * scale, 0, Math.PI * 2);
  ctx.arc(x + 11 * scale, y, 4 * scale, 0, Math.PI * 2);
  ctx.arc(x + 5 * scale, y + 1, 4 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawArcticBackdrop(ctx: CanvasRenderingContext2D, t: number): void {
  // Northern lights faint pulse
  for (let i = 0; i < 2; i++) {
    ctx.fillStyle = `rgba(186, 230, 253, ${0.05 + i * 0.04})`;
    const y = 30 + i * 14 + Math.sin(t / 700 + i) * 4;
    ctx.fillRect(0, y, VIEW_W, 6);
  }
  drawTwinkleStars(ctx, t, 14, 80);
  // Far ice peaks
  drawMountains(ctx, "rgba(186,230,253,0.18)", VIEW_H - 35, [
    [40, 22], [90, 14], [140, 28], [200, 16], [260, 26], [310, 18],
  ]);
  drawMountains(ctx, "rgba(255,255,255,0.10)", VIEW_H - 22, [
    [30, 12], [80, 8], [130, 14], [180, 6], [230, 12], [280, 8],
  ]);
  drawSnowfall(ctx, t, 14);
}

function drawAuroraBackdrop(ctx: CanvasRenderingContext2D, t: number): void {
  drawTwinkleStars(ctx, t, 28, 100);
  // 3 colored aurora bands
  const colors = ["rgba(34, 197, 94, 0.16)", "rgba(45, 212, 191, 0.14)", "rgba(244, 114, 182, 0.12)"];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    for (let x = 0; x <= VIEW_W; x += 4) {
      const y = 24 + i * 18 + Math.sin(x / 30 + t / 400 + i) * 6;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    for (let x = VIEW_W; x >= 0; x -= 4) {
      const y = 38 + i * 18 + Math.sin(x / 30 + t / 400 + i) * 6;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }
  drawMountains(ctx, "rgba(0,0,0,0.35)", VIEW_H - 34, [
    [30, 28], [80, 18], [140, 32], [210, 22], [280, 30],
  ]);
}

function drawOceanBackdrop(ctx: CanvasRenderingContext2D, t: number): void {
  // Sun
  ctx.fillStyle = "rgba(253, 224, 71, 0.65)";
  ctx.beginPath();
  ctx.arc(VIEW_W - 50, 40, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(253, 224, 71, 0.18)";
  ctx.beginPath();
  ctx.arc(VIEW_W - 50, 40, 24, 0, Math.PI * 2);
  ctx.fill();
  // Clouds drifting
  drawCloud(ctx, ((t / 80) % (VIEW_W + 60)) - 30, 28, 1, "rgba(255,255,255,0.55)");
  drawCloud(ctx, ((t / 100 + 80) % (VIEW_W + 60)) - 30, 50, 0.8, "rgba(255,255,255,0.4)");
  // Far horizon
  drawMountains(ctx, "rgba(56,189,248,0.3)", VIEW_H - 60, [
    [60, 8], [140, 4], [220, 8], [290, 4],
  ]);
  // Wave caps in water area
  ctx.fillStyle = "rgba(186, 230, 253, 0.5)";
  for (let i = 0; i < 12; i++) {
    const x = (i * 28 + Math.floor(t / 30)) % VIEW_W;
    const y = VIEW_H - 50 + Math.sin(t / 200 + i) * 2;
    ctx.fillRect(x, y, 4, 1);
  }
}

function drawIceBackdrop(ctx: CanvasRenderingContext2D, t: number): void {
  drawTwinkleStars(ctx, t, 12, 70);
  drawMountains(ctx, "rgba(186,230,253,0.22)", VIEW_H - 38, [
    [30, 30], [80, 18], [130, 36], [200, 20], [260, 32], [310, 22],
  ]);
  drawMountains(ctx, "rgba(255,255,255,0.14)", VIEW_H - 24, [
    [50, 18], [110, 10], [180, 18], [250, 12], [310, 14],
  ]);
  drawSnowfall(ctx, t, 18);
}

function drawLabBackdrop(ctx: CanvasRenderingContext2D, t: number): void {
  // Grid wall
  ctx.strokeStyle = "rgba(16, 185, 129, 0.12)";
  ctx.lineWidth = 1;
  for (let x = 0; x < VIEW_W; x += 16) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, VIEW_H); ctx.stroke();
  }
  for (let y = 0; y < VIEW_H; y += 16) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(VIEW_W, y); ctx.stroke();
  }
  // Glowing science panels
  for (let i = 0; i < 4; i++) {
    const x = 30 + i * 80;
    const y = 18;
    ctx.fillStyle = `rgba(16, 185, 129, ${0.10 + 0.05 * Math.sin(t / 300 + i)})`;
    ctx.fillRect(x, y, 16, 8);
    ctx.fillStyle = "rgba(16, 185, 129, 0.3)";
    ctx.fillRect(x + 2, y + 2, 4, 1);
    ctx.fillRect(x + 8, y + 2, 6, 1);
  }
  // Beakers far behind
  ctx.fillStyle = "rgba(34, 197, 94, 0.25)";
  ctx.fillRect(20, VIEW_H - 30, 6, 10);
  ctx.fillRect(290, VIEW_H - 28, 7, 12);
  ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
  ctx.fillRect(60, VIEW_H - 32, 5, 14);
}

function drawCaveBackdrop(ctx: CanvasRenderingContext2D, t: number): void {
  // Stalactites top
  ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
  for (let i = 0; i < 8; i++) {
    const x = i * 42 + 8;
    const h = 6 + (i % 3) * 4;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 6, 0);
    ctx.lineTo(x + 3, h);
    ctx.closePath();
    ctx.fill();
  }
  // Distant glowing crystals
  for (let i = 0; i < 5; i++) {
    const x = 30 + i * 64;
    const y = VIEW_H - 26;
    const flash = 0.3 + 0.2 * Math.sin(t / 250 + i);
    ctx.fillStyle = `rgba(167, 139, 250, ${flash})`;
    ctx.beginPath();
    ctx.moveTo(x, y - 4);
    ctx.lineTo(x + 3, y);
    ctx.lineTo(x, y + 4);
    ctx.lineTo(x - 3, y);
    ctx.closePath();
    ctx.fill();
  }
}

function drawWreckBackdrop(ctx: CanvasRenderingContext2D, t: number): void {
  // Distant ship mast silhouette
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(VIEW_W - 80, 60, 2, 100);
  ctx.fillRect(VIEW_W - 90, 65, 22, 1);
  ctx.fillRect(VIEW_W - 86, 80, 14, 1);
  // Shark fins drifting in water
  for (let i = 0; i < 2; i++) {
    const x = ((t / 80 + i * 160) % (VIEW_W + 80)) - 40;
    const y = VIEW_H - 22 + i * 4;
    ctx.fillStyle = "rgba(15, 23, 42, 0.5)";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 6, y - 5);
    ctx.lineTo(x + 10, y);
    ctx.closePath();
    ctx.fill();
  }
  // Bubbles
  for (let i = 0; i < 5; i++) {
    const x = (i * 53) % VIEW_W;
    const y = (VIEW_H - (t / 40 + i * 40) % VIEW_H);
    ctx.fillStyle = "rgba(186, 230, 253, 0.4)";
    ctx.beginPath();
    ctx.arc(x, y, 1 + (i % 2), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTropicalBackdrop(ctx: CanvasRenderingContext2D, t: number): void {
  // Big tropical sun
  ctx.fillStyle = "rgba(251, 191, 36, 0.55)";
  ctx.beginPath();
  ctx.arc(VIEW_W / 2, 30, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(251, 191, 36, 0.18)";
  ctx.beginPath();
  ctx.arc(VIEW_W / 2, 30, 30, 0, Math.PI * 2);
  ctx.fill();
  // Palm trees in distance
  for (let i = 0; i < 3; i++) {
    const x = 50 + i * 90;
    const sway = Math.sin(t / 600 + i) * 2;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(x, VIEW_H - 60, 2, 30);
    ctx.fillStyle = "rgba(34, 197, 94, 0.7)";
    ctx.beginPath();
    ctx.moveTo(x + 1, VIEW_H - 60);
    ctx.lineTo(x - 8 + sway, VIEW_H - 64);
    ctx.lineTo(x - 6, VIEW_H - 58);
    ctx.lineTo(x + 1, VIEW_H - 60);
    ctx.lineTo(x + 9 + sway, VIEW_H - 64);
    ctx.lineTo(x + 7, VIEW_H - 58);
    ctx.fill();
  }
}

function drawSunsetBackdrop(ctx: CanvasRenderingContext2D, t: number): void {
  // Orange sun on horizon
  const sunY = VIEW_H - 60;
  ctx.fillStyle = "rgba(254, 215, 170, 0.85)";
  ctx.beginPath();
  ctx.arc(VIEW_W / 2 - 20, sunY, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(254, 215, 170, 0.25)";
  ctx.beginPath();
  ctx.arc(VIEW_W / 2 - 20, sunY, 38, 0, Math.PI * 2);
  ctx.fill();
  // Pink horizontal cloud streaks
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = `rgba(251, 113, 133, ${0.15 + i * 0.04})`;
    const y = 40 + i * 18 + Math.sin(t / 800 + i) * 2;
    ctx.fillRect(0, y, VIEW_W, 4);
  }
  // Distant cliffs
  drawMountains(ctx, "rgba(0,0,0,0.45)", VIEW_H - 35, [
    [30, 24], [90, 14], [160, 30], [230, 18], [290, 26],
  ]);
}

function drawNightBackdrop(ctx: CanvasRenderingContext2D, t: number): void {
  drawTwinkleStars(ctx, t, 36, VIEW_H - 60);
  // Moon
  ctx.fillStyle = "rgba(254, 240, 138, 0.95)";
  ctx.beginPath();
  ctx.arc(VIEW_W - 40, 30, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(15,23,42,0.9)";
  ctx.beginPath();
  ctx.arc(VIEW_W - 36, 27, 10, 0, Math.PI * 2);
  ctx.fill();
  // Snow drift
  drawSnowfall(ctx, t, 12);
}

function drawCandyBackdrop(ctx: CanvasRenderingContext2D, t: number): void {
  // Soft pink puffy clouds
  drawCloud(ctx, ((t / 70) % (VIEW_W + 80)) - 40, 30, 1.2, "rgba(253, 164, 175, 0.7)");
  drawCloud(ctx, ((t / 90 + 100) % (VIEW_W + 80)) - 40, 60, 1, "rgba(254, 205, 211, 0.6)");
  drawCloud(ctx, ((t / 60 + 200) % (VIEW_W + 80)) - 40, 90, 0.8, "rgba(253, 164, 175, 0.5)");
  // Hearts confetti
  for (let i = 0; i < 8; i++) {
    const x = (i * 41 + Math.floor(t / 100)) % VIEW_W;
    const y = ((i * 23 + Math.floor(t / 30)) % VIEW_H);
    ctx.fillStyle = `rgba(244, 114, 182, ${0.3 + 0.2 * Math.sin(t / 200 + i)})`;
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawEmperorBackdrop(ctx: CanvasRenderingContext2D, t: number): void {
  // Pale ice floor in far distance with tiny penguin silhouettes
  drawTwinkleStars(ctx, t, 16, 50);
  // Aurora hint
  ctx.fillStyle = "rgba(125, 211, 252, 0.12)";
  ctx.fillRect(0, 32 + Math.sin(t / 600) * 2, VIEW_W, 8);
  // Silhouettes of distant penguin colony
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  for (let i = 0; i < 14; i++) {
    const x = 8 + i * 22;
    const y = VIEW_H - 28;
    ctx.fillRect(x, y, 3, 6);
    ctx.fillRect(x - 1, y + 5, 5, 1);
  }
  drawSnowfall(ctx, t, 18);
}

function drawMagellanBackdrop(ctx: CanvasRenderingContext2D, t: number): void {
  // Rocky landscape
  drawMountains(ctx, "rgba(120, 113, 108, 0.55)", VIEW_H - 40, [
    [30, 28], [80, 16], [140, 30], [200, 18], [260, 32], [310, 20],
  ]);
  drawMountains(ctx, "rgba(168, 162, 158, 0.4)", VIEW_H - 26, [
    [40, 16], [110, 8], [180, 14], [250, 10], [310, 12],
  ]);
  // Birds in distance
  for (let i = 0; i < 3; i++) {
    const x = ((t / 40 + i * 90) % (VIEW_W + 40)) - 20;
    const y = 30 + Math.sin(t / 200 + i) * 4;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(x, y, 2, 1);
    ctx.fillRect(x - 2, y + 1, 6, 1);
  }
}

function drawGalapagosBackdrop(ctx: CanvasRenderingContext2D, t: number): void {
  // Bright tropical sun
  ctx.fillStyle = "rgba(254, 240, 138, 0.85)";
  ctx.beginPath();
  ctx.arc(VIEW_W - 60, 30, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(254, 240, 138, 0.2)";
  ctx.beginPath();
  ctx.arc(VIEW_W - 60, 30, 26, 0, Math.PI * 2);
  ctx.fill();
  // Volcanic ridge
  drawMountains(ctx, "rgba(101, 163, 13, 0.5)", VIEW_H - 36, [
    [40, 20], [110, 32], [180, 22], [240, 28], [290, 18],
  ]);
  // Cactus
  ctx.fillStyle = "rgba(34, 197, 94, 0.85)";
  ctx.fillRect(60, VIEW_H - 36, 3, 12);
  ctx.fillRect(57, VIEW_H - 32, 3, 4);
  ctx.fillRect(63, VIEW_H - 30, 3, 4);
  // Distant clouds
  drawCloud(ctx, ((t / 80) % (VIEW_W + 60)) - 30, 18, 0.8, "rgba(255,255,255,0.5)");
}

// =====================  TILES  =====================

function drawSolidBlock(ctx: CanvasRenderingContext2D, pal: PaletteColors, x: number, y: number, palette: Palette): void {
  // Gradient block — lighter on top, darker on bottom
  const grad = ctx.createLinearGradient(x, y, x, y + TILE);
  grad.addColorStop(0, pal.blockHi);
  grad.addColorStop(0.4, pal.block);
  grad.addColorStop(1, pal.platform);
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, TILE, TILE);
  // Top sparkle / highlight
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillRect(x + 1, y + 1, TILE - 2, 1);
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(x + 2, y + 2, 4, 1);
  // Texture: ice cracks for icy palettes, stones for cave/wreck/magellan
  if (palette === "ice" || palette === "arctic" || palette === "emperor" || palette === "aurora") {
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 5); ctx.lineTo(x + 8, y + 9);
    ctx.moveTo(x + 11, y + 4); ctx.lineTo(x + 13, y + 8);
    ctx.stroke();
  } else if (palette === "cave" || palette === "magellan" || palette === "wreck") {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.arc(x + 5, y + 7, 1.2, 0, Math.PI * 2);
    ctx.arc(x + 11, y + 11, 1, 0, Math.PI * 2);
    ctx.arc(x + 8, y + 4, 0.8, 0, Math.PI * 2);
    ctx.fill();
  } else if (palette === "lab") {
    ctx.fillStyle = "rgba(16, 185, 129, 0.4)";
    ctx.fillRect(x + 5, y + 6, 6, 1);
    ctx.fillRect(x + 5, y + 9, 4, 1);
  } else if (palette === "candy") {
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath();
    ctx.arc(x + 4, y + 5, 1.2, 0, Math.PI * 2);
    ctx.arc(x + 11, y + 9, 1, 0, Math.PI * 2);
    ctx.fill();
  }
  // Bottom shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(x, y + TILE - 2, TILE, 2);
  // Side shading
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(x + TILE - 1, y + 2, 1, TILE - 4);
}

function drawPlatform(ctx: CanvasRenderingContext2D, pal: PaletteColors, x: number, y: number, palette: Palette): void {
  // Top edge — bright
  ctx.fillStyle = pal.blockHi;
  ctx.fillRect(x, y, TILE, 2);
  // Body (5-8px tall)
  const grad = ctx.createLinearGradient(x, y, x, y + 6);
  grad.addColorStop(0, pal.platform);
  grad.addColorStop(1, pal.block);
  ctx.fillStyle = grad;
  ctx.fillRect(x, y + 2, TILE, 4);
  // Underside shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(x, y + 6, TILE, 1);
  // Wood-grain or ice-shimmer per palette
  if (palette === "wreck" || palette === "tropical") {
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y + 4); ctx.lineTo(x + TILE, y + 4);
    ctx.stroke();
  } else if (palette === "ice" || palette === "arctic" || palette === "emperor") {
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillRect(x + 2, y + 3, 3, 1);
    ctx.fillRect(x + 9, y + 3, 4, 1);
  }
}

function drawLadder(ctx: CanvasRenderingContext2D, pal: PaletteColors, x: number, y: number): void {
  // Side rails — rounded
  ctx.fillStyle = pal.ladder;
  ctx.fillRect(x + 3, y, 2, TILE);
  ctx.fillRect(x + TILE - 5, y, 2, TILE);
  // Highlight
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillRect(x + 3, y, 1, TILE);
  ctx.fillRect(x + TILE - 5, y, 1, TILE);
  // Rungs
  ctx.fillStyle = pal.ladder;
  for (let r = 0; r < 4; r++) {
    ctx.fillRect(x + 4, y + r * 4 + 1, TILE - 8, 2);
  }
  // Rung highlight
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  for (let r = 0; r < 4; r++) {
    ctx.fillRect(x + 4, y + r * 4 + 1, TILE - 8, 1);
  }
}

function drawWater(ctx: CanvasRenderingContext2D, pal: PaletteColors, x: number, y: number, t: number): void {
  // Gradient water
  const grad = ctx.createLinearGradient(x, y, x, y + TILE);
  grad.addColorStop(0, pal.water);
  grad.addColorStop(1, "#0a1628");
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, TILE, TILE);
  // Wavy surface highlight
  const wave = Math.sin(t / 200 + x / 8) * 1.5;
  ctx.fillStyle = "rgba(186, 230, 253, 0.35)";
  ctx.fillRect(x, y + 1 + wave, TILE, 1);
  ctx.fillStyle = "rgba(186, 230, 253, 0.18)";
  ctx.fillRect(x, y + 4 + wave, TILE, 1);
  // Bubble
  if ((Math.floor(t / 200) + Math.floor(x / TILE)) % 3 === 0) {
    const by = (y + TILE) - ((t / 30 + x) % TILE);
    ctx.fillStyle = "rgba(186, 230, 253, 0.6)";
    ctx.beginPath();
    ctx.arc(x + 8, by, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSpikes(ctx: CanvasRenderingContext2D, pal: PaletteColors, x: number, y: number): void {
  ctx.fillStyle = pal.spikes;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * 4, y + TILE);
    ctx.lineTo(x + i * 4 + 2, y);
    ctx.lineTo(x + i * 4 + 4, y + TILE);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillRect(x + i * 4 + 1, y + 2, 1, 4);
    ctx.fillStyle = pal.spikes;
  }
}

function drawConveyor(ctx: CanvasRenderingContext2D, pal: PaletteColors, x: number, y: number, right: boolean): void {
  ctx.fillStyle = pal.platform;
  ctx.fillRect(x, y, TILE, 6);
  ctx.fillStyle = pal.accent;
  const off = (Math.floor(performance.now() / 100) * (right ? 1 : -1)) % 4;
  for (let i = -1; i < 5; i++) ctx.fillRect(x + i * 4 + off, y + 2, 2, 1);
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(x, y + 6, TILE, 1);
}

function drawBreakable(ctx: CanvasRenderingContext2D, pal: PaletteColors, x: number, y: number): void {
  // Like solid block but with prominent crack pattern + amber tint to signal breakability.
  const grad = ctx.createLinearGradient(x, y, x, y + TILE);
  grad.addColorStop(0, pal.blockHi);
  grad.addColorStop(0.5, pal.block);
  grad.addColorStop(1, pal.platform);
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, TILE, TILE);
  // Amber outline
  ctx.strokeStyle = "rgba(251, 191, 36, 0.6)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
  // Cracks
  ctx.strokeStyle = "rgba(15, 23, 42, 0.7)";
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(x + 3, y + 2); ctx.lineTo(x + 7, y + 7); ctx.lineTo(x + 5, y + 11); ctx.lineTo(x + 10, y + 14);
  ctx.moveTo(x + 11, y + 3); ctx.lineTo(x + 13, y + 8);
  ctx.stroke();
}

function drawExitHints(ctx: CanvasRenderingContext2D, pal: PaletteColors, room: Room): void {
  ctx.fillStyle = pal.accent;
  for (const ex of room.exits) {
    if (ex.side === "left")        { ctx.fillRect(0, Math.floor(VIEW_H / 2) - 1, 2, 6); ctx.fillRect(2, Math.floor(VIEW_H / 2), 1, 4); }
    else if (ex.side === "right")  { ctx.fillRect(VIEW_W - 2, Math.floor(VIEW_H / 2) - 1, 2, 6); ctx.fillRect(VIEW_W - 3, Math.floor(VIEW_H / 2), 1, 4); }
    else if (ex.side === "top")    { ctx.fillRect(Math.floor(VIEW_W / 2) - 1, 0, 6, 2); ctx.fillRect(Math.floor(VIEW_W / 2), 2, 4, 1); }
    else if (ex.side === "bottom") { ctx.fillRect(Math.floor(VIEW_W / 2) - 1, VIEW_H - 2, 6, 2); ctx.fillRect(Math.floor(VIEW_W / 2), VIEW_H - 3, 4, 1); }
  }
}

// =====================  ITEMS  =====================

function drawItem(ctx: CanvasRenderingContext2D, it: Item, t: number): void {
  const cx = it.x * TILE + TILE / 2;
  const cy = it.y * TILE + TILE / 2 + Math.sin(t / 200 + it.x) * 1.5;
  // Soft glow halo behind item
  const haloAlpha = 0.18 + 0.08 * Math.sin(t / 250 + it.x);
  if (it.kind !== "fish") {
    const halo = ctx.createRadialGradient(cx, cy, 1, cx, cy, 10);
    halo.addColorStop(0, `rgba(255,255,255,${haloAlpha})`);
    halo.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(cx - 12, cy - 12, 24, 24);
  }

  if (it.kind === "fish") {
    // Silvery body with side fin & sparkle eye
    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.ellipse(cx, cy, 6, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 1, 5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fde047";
    ctx.beginPath();
    ctx.moveTo(cx + 6, cy);
    ctx.lineTo(cx + 9, cy - 3);
    ctx.lineTo(cx + 9, cy + 3);
    ctx.fill();
    // Fin
    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 3); ctx.lineTo(cx - 1, cy - 6); ctx.lineTo(cx + 2, cy - 3);
    ctx.fill();
    // Eye
    ctx.fillStyle = "#0f172a"; ctx.fillRect(cx - 3, cy - 1, 1, 1);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(cx - 3, cy - 1, 0.6, 0.6);
    // Shine
    ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.fillRect(cx - 2, cy - 2, 2, 1);
  } else if (it.kind === "egg") {
    ctx.fillStyle = "#fffbeb";
    ctx.beginPath();
    ctx.ellipse(cx, cy, 4, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Speckles
    ctx.fillStyle = "rgba(120, 53, 15, 0.6)";
    ctx.beginPath();
    ctx.arc(cx - 1, cy + 1, 0.6, 0, Math.PI * 2);
    ctx.arc(cx + 2, cy - 1, 0.5, 0, Math.PI * 2);
    ctx.arc(cx, cy + 3, 0.6, 0, Math.PI * 2);
    ctx.fill();
    // Shine
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.ellipse(cx - 1.5, cy - 2, 1, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (it.kind === "medal") {
    // Ribbon
    ctx.fillStyle = "#1d4ed8";
    ctx.fillRect(cx - 3, cy - 7, 2, 4);
    ctx.fillRect(cx + 1, cy - 7, 2, 4);
    // Coin disc
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
    // Star
    ctx.fillStyle = "#fef3c7";
    ctx.fillRect(cx - 0.5, cy - 2, 1, 4);
    ctx.fillRect(cx - 2, cy - 0.5, 4, 1);
    // Highlight
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.arc(cx - 2, cy - 2, 1, 0, Math.PI * 2);
    ctx.fill();
  } else if (it.kind === "flag") {
    // Pole
    ctx.fillStyle = "#78350f";
    ctx.fillRect(cx - 4, cy - 7, 1, 14);
    // Flag waving
    const wave = Math.sin(t / 150) * 1.2;
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy - 7);
    ctx.lineTo(cx + 7, cy - 6 + wave);
    ctx.lineTo(cx + 6, cy - 3 + wave);
    ctx.lineTo(cx - 3, cy - 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fca5a5";
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy - 7);
    ctx.lineTo(cx + 4, cy - 6 + wave);
    ctx.lineTo(cx - 3, cy - 5);
    ctx.closePath();
    ctx.fill();
  } else if (it.kind === "crystal") {
    const flash = 0.7 + 0.3 * Math.sin(t / 150);
    // Sparkle
    if (Math.sin(t / 200 + it.x) > 0.7) {
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillRect(cx + 5, cy - 5, 1, 1);
      ctx.fillRect(cx + 4, cy - 5, 1, 1);
      ctx.fillRect(cx + 5, cy - 4, 1, 1);
    }
    ctx.fillStyle = `rgba(167, 139, 250, ${flash})`;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 6);
    ctx.lineTo(cx + 5, cy);
    ctx.lineTo(cx, cy + 6);
    ctx.lineTo(cx - 5, cy);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ddd6fe";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 6);
    ctx.lineTo(cx + 2, cy - 1);
    ctx.lineTo(cx, cy + 2);
    ctx.closePath();
    ctx.fill();
    // Glint
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cx - 1, cy - 4, 1, 2);
  } else if (it.kind === "heart") {
    const beat = 1 + Math.sin(t / 120) * 0.12;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(beat, beat);
    // Outline
    ctx.fillStyle = "#7f1d1d";
    ctx.beginPath();
    ctx.arc(-3, -1, 3.5, 0, Math.PI * 2);
    ctx.arc(3, -1, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-6, 0); ctx.lineTo(0, 6); ctx.lineTo(6, 0); ctx.closePath();
    ctx.fill();
    // Bright fill
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(-2.5, -1, 2.6, 0, Math.PI * 2);
    ctx.arc(2.5, -1, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-5, 0); ctx.lineTo(0, 5); ctx.lineTo(5, 0); ctx.closePath();
    ctx.fill();
    // Highlight
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.arc(-2.5, -2, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// =====================  GUARDIANS  =====================

function drawGuardian(ctx: CanvasRenderingContext2D, g: Guardian, t: number): void {
  const cx = g.x + g.w / 2;
  const cy = g.y + g.h / 2;
  const phase = g.phase ?? 0;
  switch (g.sprite) {
    case "skua":      return drawSkua(ctx, g, cx, cy, phase);
    case "seal":      return drawSeal(ctx, g, cx, cy, t);
    case "polarbear": return drawPolarbear(ctx, g, cx, cy, t);
    case "petrel":    return drawPetrel(ctx, g, cx, cy, phase);
    case "walrus":    return drawWalrus(ctx, g, cx, cy, t);
    case "crystal":   return drawCrystalEnemy(ctx, g, cx, cy, phase);
    case "snowwind":  return drawSnowwind(ctx, g, cx, cy, phase);
    case "icicle":    return drawIcicle(ctx, g, cx, cy);
    case "bubble":    return drawBubble(ctx, g, cx, cy, phase);
  }
}

function drawSkua(ctx: CanvasRenderingContext2D, g: Guardian, cx: number, cy: number, phase: number): void {
  const flap = Math.sin(phase * 6) * 4;
  // Body
  const grad = ctx.createLinearGradient(cx, cy - g.h / 3, cx, cy + g.h / 3);
  grad.addColorStop(0, "#64748b");
  grad.addColorStop(1, "#334155");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, g.w / 2, g.h / 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wings
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.moveTo(cx - g.w / 2 + 2, cy - 1);
  ctx.lineTo(cx - g.w / 2 - 5, cy - 8 + flap);
  ctx.lineTo(cx - g.w / 2 - 1, cy - 4 + flap / 2);
  ctx.lineTo(cx - g.w / 2, cy + 1);
  ctx.closePath();
  ctx.moveTo(cx + g.w / 2 - 2, cy - 1);
  ctx.lineTo(cx + g.w / 2 + 5, cy - 8 + flap);
  ctx.lineTo(cx + g.w / 2 + 1, cy - 4 + flap / 2);
  ctx.lineTo(cx + g.w / 2, cy + 1);
  ctx.closePath();
  ctx.fill();
  // Head highlight
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillRect(cx - 4, cy - 2, 4, 1);
  // Beak (yellow hooked)
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(cx + g.w / 2 - 4, cy - 1, 5, 2);
  ctx.fillStyle = "#f59e0b";
  ctx.fillRect(cx + g.w / 2 + 1, cy, 1, 1);
  // Mean eye
  ctx.fillStyle = "#fef3c7";
  ctx.fillRect(cx - 3, cy - 2, 2, 2);
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(cx - 2, cy - 2, 1, 2);
}

function drawSeal(ctx: CanvasRenderingContext2D, g: Guardian, cx: number, cy: number, t: number): void {
  const breathe = Math.sin(t / 400) * 0.5;
  // Body
  const grad = ctx.createRadialGradient(cx, cy - 2, 1, cx, cy, g.w / 2);
  grad.addColorStop(0, "#94a3b8");
  grad.addColorStop(1, "#475569");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, g.w / 2, g.h / 2 + breathe, 0, 0, Math.PI * 2);
  ctx.fill();
  // Belly
  ctx.fillStyle = "#cbd5e1";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2, g.w / 2 - 3, g.h / 2 - 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Spots
  ctx.fillStyle = "#334155";
  ctx.beginPath();
  ctx.arc(cx - 6, cy - 1, 0.8, 0, Math.PI * 2);
  ctx.arc(cx + 5, cy + 1, 0.8, 0, Math.PI * 2);
  ctx.arc(cx + 1, cy - 3, 0.6, 0, Math.PI * 2);
  ctx.fill();
  // Eyes (big & cute)
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx - 4, cy - 3, 2, 0, Math.PI * 2);
  ctx.arc(cx + 4, cy - 3, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(cx - 4, cy - 3, 1.2, 0, Math.PI * 2);
  ctx.arc(cx + 4, cy - 3, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(cx - 4, cy - 4, 0.8, 0.8);
  ctx.fillRect(cx + 4, cy - 4, 0.8, 0.8);
  // Whiskers
  ctx.strokeStyle = "rgba(15,23,42,0.7)";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + 2); ctx.lineTo(cx - 9, cy + 3);
  ctx.moveTo(cx - 6, cy + 3); ctx.lineTo(cx - 9, cy + 4);
  ctx.moveTo(cx + 6, cy + 2); ctx.lineTo(cx + 9, cy + 3);
  ctx.moveTo(cx + 6, cy + 3); ctx.lineTo(cx + 9, cy + 4);
  ctx.stroke();
  // Smile
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy + 2, 2, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

function drawPolarbear(ctx: CanvasRenderingContext2D, g: Guardian, cx: number, cy: number, t: number): void {
  const breathe = Math.sin(t / 500) * 0.4;
  // Body — fluffy
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(cx, cy, g.w / 2, g.h / 2 + breathe, 0, 0, Math.PI * 2);
  ctx.fill();
  // Subtle shadow
  ctx.fillStyle = "#cbd5e1";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4, g.w / 2 - 1, g.h / 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Fluff strands
  ctx.fillStyle = "#f8fafc";
  for (let i = -2; i <= 2; i++) {
    ctx.fillRect(cx + i * 3 - 1, cy - g.h / 2, 1, 2);
  }
  // Ears (round)
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx - g.w / 2 + 4, cy - g.h / 2 + 2, 2.5, 0, Math.PI * 2);
  ctx.arc(cx + g.w / 2 - 4, cy - g.h / 2 + 2, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fda4af";
  ctx.beginPath();
  ctx.arc(cx - g.w / 2 + 4, cy - g.h / 2 + 2, 1.2, 0, Math.PI * 2);
  ctx.arc(cx + g.w / 2 - 4, cy - g.h / 2 + 2, 1.2, 0, Math.PI * 2);
  ctx.fill();
  // Snout
  ctx.fillStyle = "#f1f5f9";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Big black nose
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 1, 2.5, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#475569";
  ctx.fillRect(cx - 1.5, cy + 0.3, 1, 0.6);
  // Eyes
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(cx - 4, cy - 1, 1.4, 0, Math.PI * 2);
  ctx.arc(cx + 4, cy - 1, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(cx - 4, cy - 1.5, 0.6, 0.6);
  ctx.fillRect(cx + 4, cy - 1.5, 0.6, 0.6);
  // Mouth (subtle smirk)
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(cx - 2, cy + 4); ctx.lineTo(cx, cy + 3); ctx.lineTo(cx + 2, cy + 4);
  ctx.stroke();
}

function drawWalrus(ctx: CanvasRenderingContext2D, g: Guardian, cx: number, cy: number, t: number): void {
  const breathe = Math.sin(t / 350) * 0.4;
  // Body
  const grad = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy, g.w / 2);
  grad.addColorStop(0, "#a8a29e");
  grad.addColorStop(1, "#57534e");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, g.w / 2, g.h / 2 + breathe, 0, 0, Math.PI * 2);
  ctx.fill();
  // Belly
  ctx.fillStyle = "#d6d3d1";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 3, g.w / 2 - 5, g.h / 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wrinkle lines
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy + 2); ctx.lineTo(cx - 4, cy + 2);
  ctx.moveTo(cx + 4, cy + 2); ctx.lineTo(cx + 8, cy + 2);
  ctx.stroke();
  // Eyes
  ctx.fillStyle = "#fef3c7";
  ctx.beginPath();
  ctx.arc(cx - 5, cy - 3, 1.6, 0, Math.PI * 2);
  ctx.arc(cx + 5, cy - 3, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(cx - 5, cy - 3, 0.9, 0, Math.PI * 2);
  ctx.arc(cx + 5, cy - 3, 0.9, 0, Math.PI * 2);
  ctx.fill();
  // Nose
  ctx.fillStyle = "#7c2d12";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 1, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(cx - 1, cy + 1, 0.6, 0.6);
  ctx.fillRect(cx + 0.5, cy + 1, 0.6, 0.6);
  // Mustache (curls)
  ctx.strokeStyle = "#1c1917";
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    ctx.moveTo(cx - 4 + i, cy + 3); ctx.lineTo(cx - 8 + i, cy + 4);
    ctx.moveTo(cx + 1 + i, cy + 3); ctx.lineTo(cx + 5 + i, cy + 4);
  }
  ctx.stroke();
  // Tusks (white, prominent)
  ctx.fillStyle = "#fffbeb";
  ctx.beginPath();
  ctx.moveTo(cx - 3, cy + 4); ctx.lineTo(cx - 2, cy + 9); ctx.lineTo(cx - 1, cy + 4); ctx.closePath();
  ctx.moveTo(cx + 1, cy + 4); ctx.lineTo(cx + 2, cy + 9); ctx.lineTo(cx + 3, cy + 4); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(cx - 3, cy + 5, 1, 3);
  ctx.fillRect(cx + 1, cy + 5, 1, 3);
}

function drawPetrel(ctx: CanvasRenderingContext2D, g: Guardian, cx: number, cy: number, phase: number): void {
  const flap = Math.sin(phase * 8) * 5;
  // Body — sleek
  ctx.fillStyle = "#334155";
  ctx.beginPath();
  ctx.ellipse(cx, cy, g.w / 2, g.h / 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // White belly stripe
  ctx.fillStyle = "#cbd5e1";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 1, g.w / 2 - 4, g.h / 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Long swept-back wings
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.moveTo(cx - g.w / 2, cy);
  ctx.lineTo(cx - g.w / 2 - 7, cy - 10 + flap);
  ctx.lineTo(cx - g.w / 2 - 4, cy - 5 + flap / 2);
  ctx.lineTo(cx - g.w / 2 + 1, cy + 1);
  ctx.closePath();
  ctx.moveTo(cx + g.w / 2, cy);
  ctx.lineTo(cx + g.w / 2 + 7, cy - 10 + flap);
  ctx.lineTo(cx + g.w / 2 + 4, cy - 5 + flap / 2);
  ctx.lineTo(cx + g.w / 2 - 1, cy + 1);
  ctx.closePath();
  ctx.fill();
  // Hooked beak
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(cx + g.w / 2 - 3, cy - 1, 4, 2);
  // Eye
  ctx.fillStyle = "#ffffff"; ctx.fillRect(cx - 3, cy - 3, 2, 2);
  ctx.fillStyle = "#0f172a"; ctx.fillRect(cx - 3, cy - 3, 1, 2);
}

function drawCrystalEnemy(ctx: CanvasRenderingContext2D, g: Guardian, cx: number, _cy: number, phase: number): void {
  const flash = 0.6 + 0.4 * Math.sin(phase * 4);
  // Halo
  ctx.fillStyle = `rgba(167, 139, 250, ${0.1 + 0.1 * flash})`;
  ctx.beginPath();
  ctx.arc(cx, g.y + g.h / 2, g.w / 2 + 4, 0, Math.PI * 2);
  ctx.fill();
  // Crystal
  ctx.fillStyle = `rgba(167, 139, 250, ${flash})`;
  ctx.beginPath();
  ctx.moveTo(cx, g.y);
  ctx.lineTo(g.x + g.w, g.y + g.h / 2);
  ctx.lineTo(cx, g.y + g.h);
  ctx.lineTo(g.x, g.y + g.h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ddd6fe";
  ctx.beginPath();
  ctx.moveTo(cx, g.y);
  ctx.lineTo(cx + 3, g.y + g.h / 2);
  ctx.lineTo(cx, g.y + g.h / 2 + 1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(cx - 1, g.y + 2, 1, 2);
}

function drawSnowwind(ctx: CanvasRenderingContext2D, _g: Guardian, cx: number, cy: number, phase: number): void {
  // Swirling snowflake cluster
  for (let i = 0; i < 6; i++) {
    const a = phase * 4 + i * (Math.PI / 3);
    const r = 5 + Math.sin(phase * 2 + i) * 2;
    const dx = Math.cos(a) * r;
    const dy = Math.sin(a) * r;
    ctx.fillStyle = `rgba(255,255,255,${0.5 + 0.3 * Math.sin(phase * 3 + i)})`;
    ctx.fillRect(cx + dx - 1, cy + dy - 1, 2, 2);
    // Small cross
    ctx.fillStyle = "rgba(186, 230, 253, 0.6)";
    ctx.fillRect(cx + dx, cy + dy - 0.5, 1, 0.6);
  }
  // Center swirl
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.beginPath();
  ctx.arc(cx, cy, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawIcicle(ctx: CanvasRenderingContext2D, g: Guardian, _cx: number, _cy: number): void {
  // Tapering icicle with light reflection
  const grad = ctx.createLinearGradient(g.x, g.y, g.x, g.y + g.h);
  grad.addColorStop(0, "#e0f2fe");
  grad.addColorStop(0.5, "#bae6fd");
  grad.addColorStop(1, "#7dd3fc");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(g.x + g.w / 2, g.y + g.h);
  ctx.lineTo(g.x, g.y);
  ctx.lineTo(g.x + g.w, g.y);
  ctx.closePath();
  ctx.fill();
  // Base highlight
  ctx.fillStyle = "#f0f9ff";
  ctx.fillRect(g.x + 2, g.y, g.w - 4, 1.5);
  // Inner shimmer
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillRect(g.x + g.w / 2 - 1, g.y + 2, 1, g.h - 6);
}

function drawBubble(ctx: CanvasRenderingContext2D, g: Guardian, cx: number, cy: number, phase: number): void {
  const r = g.w / 2 - 1;
  ctx.fillStyle = `rgba(186, 230, 253, ${0.5 + 0.2 * Math.sin(phase * 3)})`;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.arc(cx - r * 0.4, cy - r * 0.4, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

// =====================  PLAYER  =====================

function drawPlayer(ctx: CanvasRenderingContext2D, p: GameState["player"], t: number): void {
  // Pingu-style penguin: pointed cone-head + round body + classic black/white look.
  const flicker = p.invulnerableMs > 0 && Math.floor(p.invulnerableMs / 80) % 2 === 0;
  if (flicker) ctx.globalAlpha = 0.4;
  const x = p.x;
  const y = p.y;
  const cx = x + PLAYER_W / 2;
  const isMoving = Math.abs(p.vx) > 0.05;
  const walkFrame = isMoving ? Math.floor(p.animPhase * 2) % 4 : 0;
  const bob = isMoving && p.onGround ? (walkFrame === 1 || walkFrame === 3 ? -1 : 0) : 0;
  const yb = y + bob;
  const blink = Math.sin(t / 800) > 0.97;

  // Ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(cx, y + PLAYER_H + 1, PLAYER_W / 2 - 1, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // ---- BODY: cone-shaped head merging into round body ----
  // Outer black silhouette: cone (head) + circle (body)
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  // Start at left base of cone, go up to peak, down to right base
  ctx.moveTo(cx - 5, yb + 6);
  ctx.quadraticCurveTo(cx, yb - 1, cx + 5, yb + 6);
  // Right side of body — round down
  ctx.quadraticCurveTo(cx + PLAYER_W / 2, yb + 10, cx + 6, yb + PLAYER_H - 3);
  ctx.quadraticCurveTo(cx, yb + PLAYER_H, cx - 6, yb + PLAYER_H - 3);
  // Left side back up
  ctx.quadraticCurveTo(cx - PLAYER_W / 2, yb + 10, cx - 5, yb + 6);
  ctx.closePath();
  ctx.fill();

  // Body subtle gradient highlight on left
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.ellipse(cx - 4, yb + 12, 2, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // ---- WHITE BELLY (oval) ----
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(cx, yb + 13, PLAYER_W / 2 - 4, PLAYER_H / 2 - 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Belly highlight
  ctx.fillStyle = "#f1f5f9";
  ctx.beginPath();
  ctx.ellipse(cx - 1, yb + 11, 1.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // ---- WINGS (small paddles on sides) ----
  const wingDown = !p.onGround ? 2 : (walkFrame === 1 || walkFrame === 3 ? 1 : 0);
  ctx.fillStyle = "#0f172a";
  // Left wing
  ctx.beginPath();
  ctx.ellipse(x + 1, yb + 12 + wingDown, 2, 4, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Right wing
  ctx.beginPath();
  ctx.ellipse(x + PLAYER_W - 1, yb + 12 + wingDown, 2, 4, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // ---- EYES (big white ovals near top of cone) ----
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(cx - 2.5, yb + 5, 2, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 2.5, yb + 5, 2, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // ---- PUPILS (track facing) or BLINK ----
  if (!blink) {
    ctx.fillStyle = "#0f172a";
    const pupX = p.facing === 1 ? 0.5 : -0.5;
    ctx.beginPath();
    ctx.arc(cx - 2.5 + pupX, yb + 5.5, 1.1, 0, Math.PI * 2);
    ctx.arc(cx + 2.5 + pupX, yb + 5.5, 1.1, 0, Math.PI * 2);
    ctx.fill();
    // Pupil shine
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cx - 2.5 + pupX - 0.5, yb + 4.5, 0.7, 0.7);
    ctx.fillRect(cx + 2.5 + pupX - 0.5, yb + 4.5, 0.7, 0.7);
  } else {
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx - 4, yb + 5); ctx.lineTo(cx - 1, yb + 5);
    ctx.moveTo(cx + 1, yb + 5); ctx.lineTo(cx + 4, yb + 5);
    ctx.stroke();
  }

  // ---- BEAK (large orange diamond, classic Pingu) ----
  // Two layers: upper + lower beak
  ctx.fillStyle = "#f97316";
  if (p.facing === 1) {
    // Upper beak
    ctx.beginPath();
    ctx.moveTo(cx - 1, yb + 8);
    ctx.lineTo(cx + 5, yb + 9);
    ctx.lineTo(cx - 1, yb + 10);
    ctx.closePath();
    ctx.fill();
    // Lower beak (slightly darker)
    ctx.fillStyle = "#ea580c";
    ctx.beginPath();
    ctx.moveTo(cx - 1, yb + 10);
    ctx.lineTo(cx + 5, yb + 9.5);
    ctx.lineTo(cx - 1, yb + 11);
    ctx.closePath();
    ctx.fill();
    // Beak highlight
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(cx, yb + 8.5, 2, 0.7);
  } else {
    ctx.beginPath();
    ctx.moveTo(cx + 1, yb + 8);
    ctx.lineTo(cx - 5, yb + 9);
    ctx.lineTo(cx + 1, yb + 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ea580c";
    ctx.beginPath();
    ctx.moveTo(cx + 1, yb + 10);
    ctx.lineTo(cx - 5, yb + 9.5);
    ctx.lineTo(cx + 1, yb + 11);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(cx - 2, yb + 8.5, 2, 0.7);
  }

  // ---- FEET (large orange flippers) ----
  ctx.fillStyle = "#f97316";
  if (p.onGround) {
    const ly = y + PLAYER_H - 2;
    if (walkFrame === 0 || walkFrame === 2) {
      // Stand: feet symmetric
      ctx.beginPath(); ctx.ellipse(x + 4, ly + 1, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + PLAYER_W - 4, ly + 1, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    } else if (walkFrame === 1) {
      // Step left foot up
      ctx.beginPath(); ctx.ellipse(x + 3, ly, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + PLAYER_W - 4, ly + 1, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      // Step right foot up
      ctx.beginPath(); ctx.ellipse(x + 4, ly + 1, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + PLAYER_W - 3, ly, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    }
    // Toe lines
    ctx.strokeStyle = "#ea580c";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + PLAYER_H - 0.5); ctx.lineTo(x + 6, y + PLAYER_H - 0.5);
    ctx.moveTo(x + PLAYER_W - 6, y + PLAYER_H - 0.5); ctx.lineTo(x + PLAYER_W - 4, y + PLAYER_H - 0.5);
    ctx.stroke();
  } else {
    // Mid-air: feet tucked together
    const ly = y + PLAYER_H - 1;
    ctx.beginPath(); ctx.ellipse(x + 5, ly, 2, 1, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + PLAYER_W - 5, ly, 2, 1, 0, 0, Math.PI * 2); ctx.fill();
  }

  ctx.globalAlpha = 1;
}
