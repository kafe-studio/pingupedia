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
  arctic: {
    bgTop: "#0f2146", bgBottom: "#1a3a66",
    block: "#d1e7ff", blockHi: "#ffffff",
    platform: "#a0c8f0", ladder: "#f59e0b",
    water: "#1d4ed8", spikes: "#38bdf8",
    accent: "#fbbf24",
  },
  aurora: {
    bgTop: "#0b1b2a", bgBottom: "#1f4d3b",
    block: "#86efac", blockHi: "#dcfce7",
    platform: "#4ade80", ladder: "#f472b6",
    water: "#14532d", spikes: "#22d3ee",
    accent: "#f472b6",
  },
  ocean: {
    bgTop: "#0c2d53", bgBottom: "#0b4575",
    block: "#7dd3fc", blockHi: "#e0f2fe",
    platform: "#38bdf8", ladder: "#fde047",
    water: "#0c4a6e", spikes: "#67e8f9",
    accent: "#fde047",
  },
  ice: {
    bgTop: "#172554", bgBottom: "#2e4e82",
    block: "#bae6fd", blockHi: "#f0f9ff",
    platform: "#7dd3fc", ladder: "#f59e0b",
    water: "#1e3a8a", spikes: "#e0f2fe",
    accent: "#fbbf24",
  },
  lab: {
    bgTop: "#1a1a2e", bgBottom: "#2b2b4a",
    block: "#94a3b8", blockHi: "#cbd5e1",
    platform: "#64748b", ladder: "#10b981",
    water: "#1e293b", spikes: "#10b981",
    accent: "#10b981",
  },
  cave: {
    bgTop: "#020617", bgBottom: "#0b1a33",
    block: "#334155", blockHi: "#64748b",
    platform: "#475569", ladder: "#fbbf24",
    water: "#0f172a", spikes: "#a78bfa",
    accent: "#a78bfa",
  },
  wreck: {
    bgTop: "#1f2937", bgBottom: "#0f172a",
    block: "#78350f", blockHi: "#a16207",
    platform: "#92400e", ladder: "#fbbf24",
    water: "#0c4a6e", spikes: "#9a3412",
    accent: "#facc15",
  },
  tropical: {
    bgTop: "#134e4a", bgBottom: "#065f46",
    block: "#d97706", blockHi: "#fbbf24",
    platform: "#b45309", ladder: "#fb923c",
    water: "#047857", spikes: "#22c55e",
    accent: "#fb923c",
  },
  sunset: {
    bgTop: "#9a3412", bgBottom: "#7c2d12",
    block: "#44403c", blockHi: "#78716c",
    platform: "#57534e", ladder: "#fde047",
    water: "#7c2d12", spikes: "#f97316",
    accent: "#fde047",
  },
  night: {
    bgTop: "#020617", bgBottom: "#0f172a",
    block: "#1e293b", blockHi: "#334155",
    platform: "#1e293b", ladder: "#facc15",
    water: "#020617", spikes: "#38bdf8",
    accent: "#facc15",
  },
  candy: {
    bgTop: "#831843", bgBottom: "#9d174d",
    block: "#fb7185", blockHi: "#fda4af",
    platform: "#f472b6", ladder: "#fde047",
    water: "#500724", spikes: "#fcd34d",
    accent: "#fde047",
  },
  emperor: {
    bgTop: "#1e3a8a", bgBottom: "#0f172a",
    block: "#0ea5e9", blockHi: "#7dd3fc",
    platform: "#0284c7", ladder: "#facc15",
    water: "#0c4a6e", spikes: "#e0f2fe",
    accent: "#facc15",
  },
  magellan: {
    bgTop: "#44403c", bgBottom: "#292524",
    block: "#78716c", blockHi: "#a8a29e",
    platform: "#57534e", ladder: "#fbbf24",
    water: "#1c1917", spikes: "#f87171",
    accent: "#fbbf24",
  },
  galapagos: {
    bgTop: "#15803d", bgBottom: "#166534",
    block: "#ca8a04", blockHi: "#eab308",
    platform: "#a16207", ladder: "#fde047",
    water: "#0f766e", spikes: "#22c55e",
    accent: "#fde047",
  },
};

export function drawScene(ctx: CanvasRenderingContext2D, state: GameState): void {
  const room = state.rooms.get(state.currentRoomId)!;
  const pal = PALETTES[room.palette];

  // Background gradient
  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, pal.bgTop);
  g.addColorStop(1, pal.bgBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  drawBackdrop(ctx, pal, room, state.time);

  // Tiles
  for (let r = 0; r < ROWS; r++) {
    const row = room.tiles[r];
    for (let c = 0; c < COLS; c++) {
      const t = row[c];
      const x = c * TILE;
      const y = r * TILE;
      if (t === "#") drawSolidBlock(ctx, pal, x, y);
      else if (t === "=") drawPlatform(ctx, pal, x, y);
      else if (t === "H") drawLadder(ctx, pal, x, y);
      else if (t === "~") drawWater(ctx, pal, x, y, state.time);
      else if (t === "*") drawSpikes(ctx, pal, x, y);
      else if (t === "C" || t === "c") drawConveyor(ctx, pal, x, y, t === "C");
    }
  }

  drawExitHints(ctx, pal, room);

  for (const it of room.items) drawItem(ctx, it, state.time);
  for (const gu of room.guardians) drawGuardian(ctx, gu, state.time);

  drawPlayer(ctx, state.player);
}

function drawBackdrop(ctx: CanvasRenderingContext2D, _pal: PaletteColors, room: Room, t: number): void {
  // Stars
  if (["night", "cave", "lab", "aurora", "emperor"].includes(room.palette)) {
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    for (let i = 0; i < 18; i++) {
      const x = (i * 53 + Math.floor(t / 60)) % VIEW_W;
      const y = (i * 29) % Math.floor(VIEW_H / 2);
      ctx.fillRect(x, y, 1, 1);
    }
  }
  // Distant mountains
  if (["arctic", "ice", "sunset", "galapagos", "tropical"].includes(room.palette)) {
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.moveTo(0, VIEW_H - 40);
    ctx.lineTo(40, VIEW_H - 70);
    ctx.lineTo(90, VIEW_H - 50);
    ctx.lineTo(140, VIEW_H - 80);
    ctx.lineTo(200, VIEW_H - 55);
    ctx.lineTo(260, VIEW_H - 75);
    ctx.lineTo(320, VIEW_H - 50);
    ctx.lineTo(320, VIEW_H);
    ctx.lineTo(0, VIEW_H);
    ctx.closePath();
    ctx.fill();
  }
  // Aurora bands
  if (room.palette === "aurora") {
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = `rgba(34, 197, 94, ${0.06 + i * 0.04})`;
      const y = 20 + i * 18 + Math.sin(t / 500 + i) * 3;
      ctx.fillRect(0, y, VIEW_W, 8);
    }
  }
  // Lab grid lines
  if (room.palette === "lab") {
    ctx.strokeStyle = "rgba(16, 185, 129, 0.1)";
    ctx.lineWidth = 1;
    for (let x = 0; x < VIEW_W; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, VIEW_H);
      ctx.stroke();
    }
  }
}

function drawSolidBlock(ctx: CanvasRenderingContext2D, pal: PaletteColors, x: number, y: number): void {
  ctx.fillStyle = pal.block;
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = pal.blockHi;
  ctx.fillRect(x, y, TILE, 2);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(x, y + TILE - 2, TILE, 2);
}

function drawPlatform(ctx: CanvasRenderingContext2D, pal: PaletteColors, x: number, y: number): void {
  ctx.fillStyle = pal.platform;
  ctx.fillRect(x, y, TILE, 4);
  ctx.fillStyle = pal.blockHi;
  ctx.fillRect(x, y, TILE, 1);
}

function drawLadder(ctx: CanvasRenderingContext2D, pal: PaletteColors, x: number, y: number): void {
  ctx.strokeStyle = pal.ladder;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 4, y);
  ctx.lineTo(x + 4, y + TILE);
  ctx.moveTo(x + TILE - 4, y);
  ctx.lineTo(x + TILE - 4, y + TILE);
  for (let r = 0; r < 4; r++) {
    ctx.moveTo(x + 3, y + r * 4 + 2);
    ctx.lineTo(x + TILE - 3, y + r * 4 + 2);
  }
  ctx.stroke();
}

function drawWater(ctx: CanvasRenderingContext2D, pal: PaletteColors, x: number, y: number, t: number): void {
  ctx.fillStyle = pal.water;
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  const wave = Math.sin(t / 200 + x / 8) * 1.5;
  ctx.fillRect(x, y + 2 + wave, TILE, 1);
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
  }
}

function drawConveyor(ctx: CanvasRenderingContext2D, pal: PaletteColors, x: number, y: number, right: boolean): void {
  ctx.fillStyle = pal.platform;
  ctx.fillRect(x, y, TILE, 5);
  ctx.fillStyle = pal.accent;
  const off = (Math.floor(performance.now() / 100) * (right ? 1 : -1)) % 4;
  for (let i = -1; i < 5; i++) {
    ctx.fillRect(x + i * 4 + off, y + 1, 2, 1);
  }
}

function drawExitHints(ctx: CanvasRenderingContext2D, pal: PaletteColors, room: Room): void {
  ctx.fillStyle = pal.accent;
  for (const ex of room.exits) {
    if (ex.side === "left") ctx.fillRect(0, Math.floor(VIEW_H / 2), 3, 4);
    else if (ex.side === "right") ctx.fillRect(VIEW_W - 3, Math.floor(VIEW_H / 2), 3, 4);
    else if (ex.side === "top") ctx.fillRect(Math.floor(VIEW_W / 2), 0, 4, 3);
    else if (ex.side === "bottom") ctx.fillRect(Math.floor(VIEW_W / 2), VIEW_H - 3, 4, 3);
  }
}

// --- Items ---

function drawItem(ctx: CanvasRenderingContext2D, it: Item, t: number): void {
  const cx = it.x * TILE + TILE / 2;
  const cy = it.y * TILE + TILE / 2 + Math.sin(t / 200 + it.x) * 1.5;
  if (it.kind === "fish") {
    ctx.fillStyle = "#fde047";
    ctx.beginPath();
    ctx.ellipse(cx, cy, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.moveTo(cx + 5, cy);
    ctx.lineTo(cx + 8, cy - 2);
    ctx.lineTo(cx + 8, cy + 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(cx - 3, cy - 1, 1, 1);
  } else if (it.kind === "egg") {
    ctx.fillStyle = "#fffbeb";
    ctx.beginPath();
    ctx.ellipse(cx, cy, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(251,191,36,0.8)";
    ctx.beginPath();
    ctx.ellipse(cx - 1, cy - 1, 1.5, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (it.kind === "medal") {
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (it.kind === "flag") {
    ctx.strokeStyle = "#78350f";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy + 6);
    ctx.lineTo(cx - 3, cy - 6);
    ctx.stroke();
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(cx - 3, cy - 6, 8, 5);
  } else if (it.kind === "crystal") {
    const flash = 0.75 + 0.25 * Math.sin(t / 150);
    ctx.fillStyle = `rgba(167, 139, 250, ${flash})`;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 5);
    ctx.lineTo(cx + 4, cy);
    ctx.lineTo(cx, cy + 5);
    ctx.lineTo(cx - 4, cy);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ddd6fe";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 5);
    ctx.lineTo(cx + 2, cy);
    ctx.lineTo(cx, cy + 2);
    ctx.closePath();
    ctx.fill();
  } else if (it.kind === "heart") {
    // Pulsing red heart (two top circles + bottom triangle).
    const beat = 1 + Math.sin(t / 120) * 0.08;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(beat, beat);
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(-2.5, -1, 3, 0, Math.PI * 2);
    ctx.arc(2.5, -1, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(0, 5);
    ctx.lineTo(5, 0);
    ctx.closePath();
    ctx.fill();
    // Highlight.
    ctx.fillStyle = "#fecaca";
    ctx.beginPath();
    ctx.arc(-2.5, -1.5, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// --- Guardians ---

function drawGuardian(ctx: CanvasRenderingContext2D, g: Guardian, _t: number): void {
  const cx = g.x + g.w / 2;
  const cy = g.y + g.h / 2;
  const phase = g.phase ?? 0;
  if (g.sprite === "skua") {
    const flap = Math.sin(phase * 6) * 3;
    ctx.fillStyle = "#475569";
    ctx.beginPath();
    ctx.ellipse(cx, cy, g.w / 2, g.h / 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.moveTo(cx - g.w / 2 + 2, cy - 1);
    ctx.lineTo(cx - g.w / 2 - 4, cy - 6 + flap);
    ctx.lineTo(cx - g.w / 2, cy + 1);
    ctx.closePath();
    ctx.moveTo(cx + g.w / 2 - 2, cy - 1);
    ctx.lineTo(cx + g.w / 2 + 4, cy - 6 + flap);
    ctx.lineTo(cx + g.w / 2, cy + 1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(cx + g.w / 2 - 3, cy - 1, 3, 2);
  } else if (g.sprite === "seal") {
    ctx.fillStyle = "#64748b";
    ctx.beginPath();
    ctx.ellipse(cx, cy, g.w / 2, g.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 2, 1, 0, Math.PI * 2);
    ctx.arc(cx + 3, cy - 2, 1, 0, Math.PI * 2);
    ctx.fill();
  } else if (g.sprite === "leopard") {
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.ellipse(cx, cy, g.w / 2, g.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    for (let i = -1; i <= 1; i++) ctx.fillRect(cx + i * 4 - 1, cy - 2, 2, 1);
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(cx - 4, cy - 4, 2, 1);
    ctx.fillRect(cx + 2, cy - 4, 2, 1);
  } else if (g.sprite === "orca") {
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.ellipse(cx, cy, g.w / 2, g.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, g.w / 2 - 4, g.h / 2 - 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - 6, cy - 3, 2, 2);
    ctx.fillRect(cx + 4, cy - 3, 2, 2);
  } else if (g.sprite === "petrel") {
    const flap = Math.sin(phase * 8) * 4;
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.ellipse(cx, cy, g.w / 2, g.h / 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.moveTo(cx - g.w / 2, cy);
    ctx.lineTo(cx - g.w / 2 - 5, cy - 8 + flap);
    ctx.lineTo(cx - g.w / 2 + 1, cy + 1);
    ctx.closePath();
    ctx.moveTo(cx + g.w / 2, cy);
    ctx.lineTo(cx + g.w / 2 + 5, cy - 8 + flap);
    ctx.lineTo(cx + g.w / 2 - 1, cy + 1);
    ctx.closePath();
    ctx.fill();
  } else if (g.sprite === "crystal") {
    const flash = 0.7 + 0.3 * Math.sin(phase * 4);
    ctx.fillStyle = `rgba(167, 139, 250, ${flash})`;
    ctx.beginPath();
    ctx.moveTo(cx, g.y);
    ctx.lineTo(g.x + g.w, cy);
    ctx.lineTo(cx, g.y + g.h);
    ctx.lineTo(g.x, cy);
    ctx.closePath();
    ctx.fill();
  } else if (g.sprite === "snowwind") {
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.4 + 0.2 * Math.sin(phase * 3 + i)})`;
      const dx = Math.cos(phase * 4 + i * 1.5) * 5;
      const dy = Math.sin(phase * 4 + i * 1.5) * 5;
      ctx.fillRect(cx + dx - 1, cy + dy - 1, 2, 2);
    }
  } else if (g.sprite === "icicle") {
    ctx.fillStyle = "#bae6fd";
    ctx.beginPath();
    ctx.moveTo(g.x + g.w / 2, g.y + g.h);
    ctx.lineTo(g.x, g.y);
    ctx.lineTo(g.x + g.w, g.y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#e0f2fe";
    ctx.fillRect(g.x + 2, g.y, g.w - 4, 2);
  } else if (g.sprite === "bubble") {
    ctx.fillStyle = `rgba(191, 219, 254, ${0.6 + 0.3 * Math.sin(phase * 3)})`;
    ctx.beginPath();
    ctx.arc(cx, cy, g.w / 2 - 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillRect(cx - 3, cy - 3, 2, 2);
  }
}

// --- Player (16×20 pixel-art penguin) ---

function drawPlayer(ctx: CanvasRenderingContext2D, p: GameState["player"]): void {
  const flicker = p.invulnerableMs > 0 && Math.floor(p.invulnerableMs / 80) % 2 === 0;
  if (flicker) ctx.globalAlpha = 0.4;
  const x = p.x;
  const y = p.y;
  const cx = x + PLAYER_W / 2;
  const isMoving = Math.abs(p.vx) > 0.05;
  // 4-frame walk cycle.
  const walkFrame = isMoving ? Math.floor(p.animPhase * 2) % 4 : 0;
  // Slight body bob during movement.
  const bob = isMoving && p.onGround ? (walkFrame === 1 || walkFrame === 3 ? -1 : 0) : 0;
  const yb = y + bob;

  // Body (black ellipse)
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(cx, yb + PLAYER_H / 2, PLAYER_W / 2, PLAYER_H / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly (white) — slightly offset
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(cx, yb + PLAYER_H / 2 + 2, PLAYER_W / 2 - 3, PLAYER_H / 2 - 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wings (flap a bit while jumping/falling).
  const wingFlap = !p.onGround ? 1 : (walkFrame === 1 || walkFrame === 3 ? 1 : 0);
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(x + 1, yb + 9 - wingFlap, 2, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(x + PLAYER_W - 1, yb + 9 - wingFlap, 2, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (white surrounds)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(cx - 5, yb + 4, 4, 4);
  ctx.fillRect(cx + 1, yb + 4, 4, 4);

  // Pupils — track facing
  ctx.fillStyle = "#0f172a";
  const pupX = p.facing === 1 ? 2 : 0;
  ctx.fillRect(cx - 5 + pupX, yb + 5, 2, 2);
  ctx.fillRect(cx + 1 + pupX, yb + 5, 2, 2);

  // Beak (orange triangle, points forward)
  ctx.fillStyle = "#fbbf24";
  if (p.facing === 1) {
    ctx.fillRect(cx - 1, yb + 9, 4, 2);
    ctx.fillRect(cx, yb + 11, 2, 1);
  } else {
    ctx.fillRect(cx - 3, yb + 9, 4, 2);
    ctx.fillRect(cx - 2, yb + 11, 2, 1);
  }

  // Feet (orange) — animated walk cycle.
  ctx.fillStyle = "#f59e0b";
  if (p.onGround) {
    const ly = y + PLAYER_H - 2;
    if (walkFrame === 0) {
      ctx.fillRect(x + 3, ly, 4, 2);
      ctx.fillRect(x + PLAYER_W - 7, ly, 4, 2);
    } else if (walkFrame === 1) {
      ctx.fillRect(x + 1, ly, 4, 2);
      ctx.fillRect(x + PLAYER_W - 5, ly, 4, 2);
    } else if (walkFrame === 2) {
      ctx.fillRect(x + 3, ly, 4, 2);
      ctx.fillRect(x + PLAYER_W - 7, ly, 4, 2);
    } else {
      ctx.fillRect(x + 5, ly, 4, 2);
      ctx.fillRect(x + PLAYER_W - 9, ly, 4, 2);
    }
  } else {
    // Mid-air: feet tucked.
    const ly = y + PLAYER_H - 1;
    ctx.fillRect(x + 4, ly, 3, 1);
    ctx.fillRect(x + PLAYER_W - 7, ly, 3, 1);
  }
  ctx.globalAlpha = 1;
}
