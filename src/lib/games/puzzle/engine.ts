import type { Piece, PuzzleHooks, PuzzleImage, PuzzleState } from "./types";

const SNAP_TOLERANCE = 28; // px — drop within this distance → snap to slot

function pickGrid(imgW: number, imgH: number): { cols: number; rows: number } {
  // Target: ~56 pieces, adapt to aspect ratio.
  const ratio = imgW / imgH;
  if (ratio > 1.25) return { cols: 8, rows: 7 }; // landscape 56
  if (ratio < 0.8) return { cols: 6, rows: 9 };  // portrait 54
  return { cols: 8, rows: 8 };                    // near-square 64
}

function scrambleRegion(target: PuzzleState["target"], viewportW: number, viewportH: number) {
  // Scatter zone = union of space left/right of target (and below on narrow screens).
  const safeLeft = { x: 8, y: target.y, w: Math.max(0, target.x - 16), h: target.h };
  const safeRight = {
    x: target.x + target.w + 8,
    y: target.y,
    w: Math.max(0, viewportW - (target.x + target.w) - 16),
    h: target.h,
  };
  const safeBottom = {
    x: 8,
    y: target.y + target.h + 8,
    w: viewportW - 16,
    h: Math.max(0, viewportH - (target.y + target.h) - 16),
  };
  return { safeLeft, safeRight, safeBottom };
}

export class PuzzleGame {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private state: PuzzleState;
  private hooks: PuzzleHooks;
  private rafId = 0;

  constructor(canvas: HTMLCanvasElement, image: HTMLImageElement, meta: PuzzleImage, hooks: PuzzleHooks) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d missing");
    this.canvas = canvas;
    this.ctx = ctx;
    this.hooks = hooks;
    const grid = pickGrid(image.naturalWidth, image.naturalHeight);
    this.state = {
      grid,
      pieces: [],
      image,
      imageMeta: meta,
      target: { x: 0, y: 0, w: 0, h: 0, pieceW: 0, pieceH: 0 },
      placedCount: 0,
      dragPieceIdx: null,
      dragOffsetX: 0,
      dragOffsetY: 0,
      peekUntil: 0,
      startTime: performance.now(),
      completed: false,
    };
    this.bindEvents();
    this.layout();
    this.makePieces();
    this.hooks.onImage(meta);
    this.hooks.onProgress(0, this.state.pieces.length);
    this.rafId = requestAnimationFrame(() => this.tick());
  }

  destroy(): void {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener("resize", this.onResize);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerUp);
  }

  peek(ms = 1500): void {
    this.state.peekUntil = performance.now() + ms;
  }

  private bindEvents(): void {
    window.addEventListener("resize", this.onResize);
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerUp);
  }

  private onResize = (): void => {
    const prev = { ...this.state.target };
    this.layout();
    // Re-map piece positions from old scale to new.
    const scaleX = this.state.target.w / (prev.w || 1);
    const scaleY = this.state.target.h / (prev.h || 1);
    for (const p of this.state.pieces) {
      if (p.placed) {
        p.targetX = this.state.target.x + p.col * this.state.target.pieceW;
        p.targetY = this.state.target.y + p.row * this.state.target.pieceH;
        p.currentX = p.targetX;
        p.currentY = p.targetY;
      } else {
        p.targetX = this.state.target.x + p.col * this.state.target.pieceW;
        p.targetY = this.state.target.y + p.row * this.state.target.pieceH;
        // Keep relative X/Y with simple rescale.
        p.currentX = (p.currentX - prev.x) * scaleX + this.state.target.x;
        p.currentY = (p.currentY - prev.y) * scaleY + this.state.target.y;
      }
    }
  };

  private layout(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Target region: leave HUD space on top (60px) + padding.
    const hudTop = 60;
    const pad = 16;
    const isPortraitScreen = h > w;
    const { cols, rows } = this.state.grid;
    const pieceRatio = cols / rows; // target region has same ratio as grid

    let targetMaxW, targetMaxH;
    if (isPortraitScreen) {
      // Screen portrait — scramble pool below target.
      targetMaxW = w - pad * 2;
      targetMaxH = Math.floor((h - hudTop - pad * 3) * 0.6);
    } else {
      // Landscape — pool at the right.
      targetMaxW = Math.floor((w - pad * 3) * 0.72);
      targetMaxH = h - hudTop - pad * 2;
    }

    let tw: number, th: number;
    if (targetMaxW / targetMaxH > pieceRatio) {
      th = targetMaxH;
      tw = Math.floor(th * pieceRatio);
    } else {
      tw = targetMaxW;
      th = Math.floor(tw / pieceRatio);
    }
    const pieceW = Math.floor(tw / cols);
    const pieceH = Math.floor(th / rows);
    tw = pieceW * cols;
    th = pieceH * rows;

    const tx = pad;
    const ty = hudTop + pad;
    this.state.target = { x: tx, y: ty, w: tw, h: th, pieceW, pieceH };
  }

  private makePieces(): void {
    const { cols, rows } = this.state.grid;
    const { image } = this.state;
    const sliceW = image.naturalWidth / cols;
    const sliceH = image.naturalHeight / rows;
    const { target } = this.state;
    const pieces: Piece[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        pieces.push({
          idx,
          col: c,
          row: r,
          sx: c * sliceW,
          sy: r * sliceH,
          sw: sliceW,
          sh: sliceH,
          targetX: target.x + c * target.pieceW,
          targetY: target.y + r * target.pieceH,
          currentX: 0,
          currentY: 0,
          placed: false,
        });
      }
    }
    // Scatter pieces into the safe region.
    const { safeRight, safeBottom, safeLeft } = scrambleRegion(target, window.innerWidth, window.innerHeight);
    const zones = [safeRight, safeBottom, safeLeft].filter((z) => z.w > target.pieceW * 1.1 && z.h > target.pieceH * 1.1);
    const zoneChoice = (i: number) => zones[i % Math.max(1, zones.length)] ?? safeRight;
    const shuffled = [...pieces];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    shuffled.forEach((p, i) => {
      const z = zoneChoice(i);
      const maxX = Math.max(z.x, z.x + z.w - target.pieceW);
      const maxY = Math.max(z.y, z.y + z.h - target.pieceH);
      p.currentX = z.x + Math.random() * (maxX - z.x);
      p.currentY = z.y + Math.random() * (maxY - z.y);
    });
    this.state.pieces = pieces;
  }

  private onPointerDown = (e: PointerEvent): void => {
    if (this.state.completed) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Topmost unplaced piece hit-test (iterate in reverse = top).
    const { pieceW, pieceH } = this.state.target;
    for (let i = this.state.pieces.length - 1; i >= 0; i--) {
      const p = this.state.pieces[i];
      if (p.placed) continue;
      if (
        x >= p.currentX &&
        x <= p.currentX + pieceW &&
        y >= p.currentY &&
        y <= p.currentY + pieceH
      ) {
        this.state.dragPieceIdx = p.idx;
        this.state.dragOffsetX = x - p.currentX;
        this.state.dragOffsetY = y - p.currentY;
        // Bring to top of stack.
        this.state.pieces.splice(i, 1);
        this.state.pieces.push(p);
        try { this.canvas.setPointerCapture(e.pointerId); } catch { /* ignore */ }
        break;
      }
    }
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (this.state.dragPieceIdx === null) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const piece = this.state.pieces.find((p) => p.idx === this.state.dragPieceIdx);
    if (!piece) return;
    piece.currentX = x - this.state.dragOffsetX;
    piece.currentY = y - this.state.dragOffsetY;
  };

  private onPointerUp = (): void => {
    if (this.state.dragPieceIdx === null) return;
    const piece = this.state.pieces.find((p) => p.idx === this.state.dragPieceIdx);
    this.state.dragPieceIdx = null;
    if (!piece) return;
    const dx = piece.currentX - piece.targetX;
    const dy = piece.currentY - piece.targetY;
    if (Math.hypot(dx, dy) <= SNAP_TOLERANCE) {
      piece.currentX = piece.targetX;
      piece.currentY = piece.targetY;
      piece.placed = true;
      this.state.placedCount++;
      this.hooks.onProgress(this.state.placedCount, this.state.pieces.length);
      if (this.state.placedCount === this.state.pieces.length) {
        this.state.completed = true;
        const elapsed = Math.round((performance.now() - this.state.startTime) / 1000);
        this.hooks.onComplete(elapsed);
      }
    }
  };

  private tick(): void {
    this.draw();
    this.rafId = requestAnimationFrame(() => this.tick());
  }

  private draw(): void {
    const { ctx } = this;
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Background.
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#0b1a33");
    g.addColorStop(1, "#020617");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Target outline — drawn as grid of subtle slots.
    const { target, pieces, image, grid, peekUntil, completed } = this.state;
    ctx.save();
    ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
    ctx.lineWidth = 1;
    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.cols; c++) {
        ctx.strokeRect(
          target.x + c * target.pieceW,
          target.y + r * target.pieceH,
          target.pieceW,
          target.pieceH,
        );
      }
    }
    ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(target.x - 1, target.y - 1, target.w + 2, target.h + 2);
    ctx.restore();

    // Peek mode: draw full image ghosted over target.
    const now = performance.now();
    if (peekUntil > now) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.drawImage(image, target.x, target.y, target.w, target.h);
      ctx.restore();
    }

    // Draw pieces: placed ones first, then floating.
    for (const p of pieces) {
      if (!p.placed) continue;
      this.drawPiece(p);
    }
    for (const p of pieces) {
      if (p.placed) continue;
      this.drawPiece(p);
    }

    // Completion fanfare overlay — handled in outer UI, engine just draws image clean.
    if (completed) {
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = "#10b981";
      ctx.fillRect(target.x, target.y, target.w, target.h);
      ctx.restore();
    }
  }

  private drawPiece(p: Piece): void {
    const { ctx } = this;
    const { pieceW, pieceH } = this.state.target;
    const isDragging = this.state.dragPieceIdx === p.idx;
    ctx.save();
    if (isDragging) {
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 4;
    } else if (!p.placed) {
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
    }
    ctx.drawImage(
      this.state.image,
      p.sx, p.sy, p.sw, p.sh,
      p.currentX, p.currentY, pieceW, pieceH,
    );
    ctx.restore();
    // Border around floating pieces.
    if (!p.placed) {
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.strokeRect(p.currentX + 0.5, p.currentY + 0.5, pieceW - 1, pieceH - 1);
      ctx.restore();
    }
  }
}
