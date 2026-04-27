import type { Difficulty, Edge, Piece, PuzzleHooks, PuzzleImage, PuzzleState } from "./types";

const SNAP_TOLERANCE = 28; // px — drop within this distance → snap to slot
const NEIGHBOUR_SNAP_TOLERANCE = 48; // when a neighbour piece is already placed, accept a looser drop
// Tab size as fraction of piece width/height — must match drawJigsawPath geometry.
const TAB_SIZE = 0.22;

function pickGrid(imgW: number, imgH: number, difficulty: Difficulty): { cols: number; rows: number } {
  const ratio = imgW / imgH;
  if (difficulty === "easy") {
    if (ratio > 1.25) return { cols: 7, rows: 5 }; // 35
    if (ratio < 0.8) return { cols: 5, rows: 7 };  // 35
    return { cols: 6, rows: 6 };                    // 36
  }
  if (difficulty === "hard") {
    if (ratio > 1.25) return { cols: 12, rows: 8 };  // 96
    if (ratio < 0.8) return { cols: 8, rows: 12 };   // 96
    return { cols: 10, rows: 10 };                   // 100
  }
  // medium (default, ~56)
  if (ratio > 1.25) return { cols: 8, rows: 7 }; // 56
  if (ratio < 0.8) return { cols: 6, rows: 9 };  // 54
  return { cols: 8, rows: 8 };                    // 64
}

// Builds a jigsaw-piece outline as a Path2D. Coordinates are local —
// piece slice origin is (0,0); tabs extend outside that box.
// `w`/`h` are the slice dimensions; `edges` tell which side bulges out (1), in (-1) or is flat (0).
function buildJigsawPath(w: number, h: number, edges: Piece["edges"]): Path2D {
  const p = new Path2D();
  const tw = w * TAB_SIZE;
  const th = h * TAB_SIZE;
  // Starting point: top-left corner
  p.moveTo(0, 0);

  // --- TOP edge (left → right) ---
  drawEdge(
    p,
    0, 0,      // start
    w, 0,      // end
    1, 0,      // direction along edge (unit)
    0, -1,     // outward normal (up)
    w, tw, th, // length, tab width (along edge), tab height (outward)
    edges.top,
  );
  // --- RIGHT edge (top → bottom) ---
  drawEdge(
    p,
    w, 0,
    w, h,
    0, 1,
    1, 0,
    h, th, tw,
    edges.right,
  );
  // --- BOTTOM edge (right → left) ---
  drawEdge(
    p,
    w, h,
    0, h,
    -1, 0,
    0, 1,
    w, tw, th,
    edges.bottom,
  );
  // --- LEFT edge (bottom → top) ---
  drawEdge(
    p,
    0, h,
    0, 0,
    0, -1,
    -1, 0,
    h, th, tw,
    edges.left,
  );
  p.closePath();
  return p;
}

function drawEdge(
  path: Path2D,
  x0: number, y0: number,
  x1: number, y1: number,
  dx: number, dy: number,   // unit along edge
  nx: number, ny: number,   // unit normal (points outward from piece)
  len: number,
  tabW: number, tabH: number,
  edge: Edge,
): void {
  if (edge === 0) {
    path.lineTo(x1, y1);
    return;
  }
  const sign = edge === 1 ? 1 : -1;
  // Points along edge (as fractions of len): 0 → 0.36 (shoulder start), 0.5 center, 0.64 (shoulder end), 1 end.
  const a = 0.36;
  const b = 0.5;
  const c = 0.64;
  const halfTab = tabW / 2;
  // 1. line to shoulder start (a * len)
  const sx = x0 + dx * len * a;
  const sy = y0 + dy * len * a;
  path.lineTo(sx, sy);
  // 2. neck curve up to tab base on the outside
  const neckOutX = sx + nx * sign * tabH * 0.35;
  const neckOutY = sy + ny * sign * tabH * 0.35;
  // 3. tab head apex (outside) — using bezier. Control points produce smooth circular knob.
  const apexX = x0 + dx * len * b + nx * sign * tabH;
  const apexY = y0 + dy * len * b + ny * sign * tabH;
  const leftKnobX = x0 + dx * (len * b - halfTab * 0.7) + nx * sign * tabH * 1.05;
  const leftKnobY = y0 + dy * (len * b - halfTab * 0.7) + ny * sign * tabH * 1.05;
  const rightKnobX = x0 + dx * (len * b + halfTab * 0.7) + nx * sign * tabH * 1.05;
  const rightKnobY = y0 + dy * (len * b + halfTab * 0.7) + ny * sign * tabH * 1.05;
  path.bezierCurveTo(neckOutX, neckOutY, leftKnobX, leftKnobY, apexX, apexY);
  // 4. curve back down to opposite shoulder
  const sx2 = x0 + dx * len * c;
  const sy2 = y0 + dy * len * c;
  const neckOut2X = sx2 + nx * sign * tabH * 0.35;
  const neckOut2Y = sy2 + ny * sign * tabH * 0.35;
  path.bezierCurveTo(rightKnobX, rightKnobY, neckOut2X, neckOut2Y, sx2, sy2);
  // 5. line to edge end
  path.lineTo(x1, y1);
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
  private disposed = false;

  constructor(
    canvas: HTMLCanvasElement,
    image: HTMLImageElement,
    meta: PuzzleImage,
    hooks: PuzzleHooks,
    difficulty: Difficulty = "medium",
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d missing");
    this.canvas = canvas;
    this.ctx = ctx;
    this.hooks = hooks;
    const grid = pickGrid(image.naturalWidth, image.naturalHeight, difficulty);
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
    this.disposed = true;
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

  // Rescatter all unplaced pieces into the scramble zone. Placed pieces stay.
  reshuffleUnplaced(): void {
    const { target } = this.state;
    const { safeLeft, safeRight, safeBottom } = scrambleRegion(
      target,
      window.innerWidth,
      window.innerHeight,
    );
    const zones = [safeRight, safeBottom, safeLeft].filter(
      (z) => z.w > target.pieceW * 1.1 && z.h > target.pieceH * 1.1,
    );
    if (zones.length === 0) return;
    const unplaced = this.state.pieces.filter((p) => !p.placed);
    // Shuffle piece order to randomize which zone each lands in.
    const bag = [...unplaced];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    bag.forEach((p, i) => {
      const z = zones[i % zones.length];
      const maxX = Math.max(z.x, z.x + z.w - target.pieceW);
      const maxY = Math.max(z.y, z.y + z.h - target.pieceH);
      p.currentX = z.x + Math.random() * (maxX - z.x);
      p.currentY = z.y + Math.random() * (maxY - z.y);
    });
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
    // Generate edges matrix first — each inner edge between two pieces must be
    // tab on one side and pocket on the other.
    // horizEdges[r][c] = right edge of piece (r,c) = left edge of piece (r, c+1)
    const horizEdges: Edge[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: Edge[] = [];
      for (let c = 0; c < cols - 1; c++) row.push(Math.random() < 0.5 ? 1 : -1);
      horizEdges.push(row);
    }
    // vertEdges[r][c] = bottom edge of piece (r,c) = top edge of piece (r+1, c)
    const vertEdges: Edge[][] = [];
    for (let r = 0; r < rows - 1; r++) {
      const row: Edge[] = [];
      for (let c = 0; c < cols; c++) row.push(Math.random() < 0.5 ? 1 : -1);
      vertEdges.push(row);
    }
    const opposite = (e: Edge): Edge => (e === 1 ? -1 : e === -1 ? 1 : 0);

    const pieces: Piece[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const top: Edge = r === 0 ? 0 : opposite(vertEdges[r - 1][c]);
        const bottom: Edge = r === rows - 1 ? 0 : vertEdges[r][c];
        const left: Edge = c === 0 ? 0 : opposite(horizEdges[r][c - 1]);
        const right: Edge = c === cols - 1 ? 0 : horizEdges[r][c];
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
          edges: { top, right, bottom, left },
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
    const tabW = pieceW * TAB_SIZE;
    const tabH = pieceH * TAB_SIZE;
    for (let i = this.state.pieces.length - 1; i >= 0; i--) {
      const p = this.state.pieces[i];
      if (p.placed) continue;
      // Expand hit area by tab size where a tab sticks out.
      const x0 = p.currentX - (p.edges.left === 1 ? tabW : 0);
      const y0 = p.currentY - (p.edges.top === 1 ? tabH : 0);
      const x1 = p.currentX + pieceW + (p.edges.right === 1 ? tabW : 0);
      const y1 = p.currentY + pieceH + (p.edges.bottom === 1 ? tabH : 0);
      if (x >= x0 && x <= x1 && y >= y0 && y <= y1) {
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

  private hasPlacedNeighbour(piece: Piece): boolean {
    return this.state.pieces.some((o) => {
      if (!o.placed) return false;
      const dc = Math.abs(o.col - piece.col);
      const dr = Math.abs(o.row - piece.row);
      return (dc === 1 && dr === 0) || (dc === 0 && dr === 1);
    });
  }

  private onPointerUp = (): void => {
    if (this.state.dragPieceIdx === null) return;
    const piece = this.state.pieces.find((p) => p.idx === this.state.dragPieceIdx);
    this.state.dragPieceIdx = null;
    if (!piece) return;
    const dx = piece.currentX - piece.targetX;
    const dy = piece.currentY - piece.targetY;
    // Widen tolerance when a correctly placed neighbour is already on the board —
    // makes building outward from a seed feel magnetic.
    const tol = this.hasPlacedNeighbour(piece) ? NEIGHBOUR_SNAP_TOLERANCE : SNAP_TOLERANCE;
    if (Math.hypot(dx, dy) <= tol) {
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
    if (this.disposed) return;
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

    const { target, pieces, image, peekUntil, completed } = this.state;
    // Outer target board — solid outline only (per-cell grid would clash with jigsaw silhouette).
    ctx.save();
    ctx.fillStyle = "rgba(148, 163, 184, 0.05)";
    ctx.fillRect(target.x, target.y, target.w, target.h);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
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
    const tabW = pieceW * TAB_SIZE;
    const tabH = pieceH * TAB_SIZE;
    // Build path in local coordinates, then translate canvas to piece origin.
    const path = buildJigsawPath(pieceW, pieceH, p.edges);
    // Source image rectangle must expand to cover tab areas.
    const srcTabW = p.sw * TAB_SIZE;
    const srcTabH = p.sh * TAB_SIZE;
    const srcX = p.sx - (p.edges.left === 1 ? srcTabW : 0);
    const srcY = p.sy - (p.edges.top === 1 ? srcTabH : 0);
    const srcW = p.sw
      + (p.edges.left === 1 ? srcTabW : 0)
      + (p.edges.right === 1 ? srcTabW : 0);
    const srcH = p.sh
      + (p.edges.top === 1 ? srcTabH : 0)
      + (p.edges.bottom === 1 ? srcTabH : 0);
    const destX = p.currentX - (p.edges.left === 1 ? tabW : 0);
    const destY = p.currentY - (p.edges.top === 1 ? tabH : 0);
    const destW = pieceW
      + (p.edges.left === 1 ? tabW : 0)
      + (p.edges.right === 1 ? tabW : 0);
    const destH = pieceH
      + (p.edges.top === 1 ? tabH : 0)
      + (p.edges.bottom === 1 ? tabH : 0);

    ctx.save();
    if (isDragging) {
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 5;
    } else if (!p.placed) {
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 7;
      ctx.shadowOffsetY = 2;
    }
    ctx.translate(p.currentX, p.currentY);
    ctx.clip(path);
    ctx.translate(-p.currentX, -p.currentY);
    ctx.drawImage(this.state.image, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
    ctx.restore();

    // Outline around floating pieces for readability.
    if (!p.placed) {
      ctx.save();
      ctx.translate(p.currentX, p.currentY);
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 1.2;
      ctx.stroke(path);
      ctx.restore();
    }
  }
}
