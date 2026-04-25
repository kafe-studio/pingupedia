import type {
  GameHooks,
  GameState,
  Guardian,
  Item,
  PlayerState,
  Room,
} from "./types";
import { COLS, ROWS, TILE, VIEW_H, VIEW_W } from "./types";
import { ROOMS, START_ROOM_ID } from "./levels";
import { drawScene } from "./render";

// Physics constants tuned for 320×224 pixel world.
const GRAVITY = 0.35;
const WALK_SPEED = 1.4;
const JUMP_V = -4.8;
const MAX_FALL = 6;
const CLIMB_SPEED = 1.1;
const INVULN_MS = 900;
const PLAYER_W = 16;
const PLAYER_H = 20;

export class PlatformGame {
  private ctx: CanvasRenderingContext2D;
  private state: GameState;
  private hooks: GameHooks;
  private keys = { left: false, right: false, up: false, down: false, jump: false };
  private lastTime = 0;
  private rafId = 0;

  constructor(canvas: HTMLCanvasElement, hooks: GameHooks) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d missing");
    this.ctx = ctx;
    this.hooks = hooks;
    ctx.imageSmoothingEnabled = false;
    canvas.width = VIEW_W;
    canvas.height = VIEW_H;

    const rooms = new Map<string, Room>();
    let totalItems = 0;
    for (const r of ROOMS) {
      // Deep-clone guardians/items so restart resets their state.
      const cloned: Room = {
        ...r,
        guardians: r.guardians.map((g) => ({ ...g, phase: 0 })),
        items: r.items.map((it) => ({ ...it })),
      };
      rooms.set(r.id, cloned);
      totalItems += r.items.length;
    }

    const start = rooms.get(START_ROOM_ID)!;
    this.state = {
      rooms,
      currentRoomId: START_ROOM_ID,
      player: this.freshPlayer(start),
      lives: 3,
      collected: new Set(),
      totalItems,
      time: 0,
      completed: false,
      gameover: false,
      lastHintRoom: null,
      hintUntil: 0,
    };
    this.bindKeys();
    this.showHintIfNew(start);
    this.emitHud();
    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }

  destroy(): void {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  restart(): void {
    this.state.rooms = new Map<string, Room>();
    for (const r of ROOMS) {
      this.state.rooms.set(r.id, {
        ...r,
        guardians: r.guardians.map((g) => ({ ...g, phase: 0 })),
        items: r.items.map((it) => ({ ...it })),
      });
    }
    this.state.currentRoomId = START_ROOM_ID;
    const start = this.state.rooms.get(START_ROOM_ID)!;
    this.state.player = this.freshPlayer(start);
    this.state.lives = 3;
    this.state.collected = new Set();
    this.state.time = 0;
    this.state.completed = false;
    this.state.gameover = false;
    this.state.lastHintRoom = null;
    this.showHintIfNew(start);
    this.emitHud();
  }

  // Virtual controls for mobile buttons.
  setKey(k: "left" | "right" | "up" | "down" | "jump", down: boolean): void {
    this.keys[k] = down;
  }

  private freshPlayer(room: Room): PlayerState {
    return {
      x: room.spawn.x,
      y: room.spawn.y,
      vx: 0,
      vy: 0,
      onGround: false,
      onLadder: false,
      facing: 1,
      animPhase: 0,
      invulnerableMs: 0,
    };
  }

  private emitHud(): void {
    const room = this.state.rooms.get(this.state.currentRoomId)!;
    const hintActive = performance.now() < this.state.hintUntil;
    this.hooks.onHud({
      roomName: room.name,
      hint: hintActive ? (room.hint ?? null) : null,
      lives: this.state.lives,
      collected: this.state.collected.size,
      total: this.state.totalItems,
    });
  }

  private showHintIfNew(room: Room): void {
    if (!room.hint) return;
    if (this.state.lastHintRoom === room.id) return;
    this.state.lastHintRoom = room.id;
    this.state.hintUntil = performance.now() + 3500;
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    const k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") this.keys.left = true;
    else if (k === "ArrowRight" || k === "d" || k === "D") this.keys.right = true;
    else if (k === "ArrowUp" || k === "w" || k === "W") this.keys.up = true;
    else if (k === "ArrowDown" || k === "s" || k === "S") this.keys.down = true;
    else if (k === " " || k === "Enter") this.keys.jump = true;
    else return;
    e.preventDefault();
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    const k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") this.keys.left = false;
    else if (k === "ArrowRight" || k === "d" || k === "D") this.keys.right = false;
    else if (k === "ArrowUp" || k === "w" || k === "W") this.keys.up = false;
    else if (k === "ArrowDown" || k === "s" || k === "S") this.keys.down = false;
    else if (k === " " || k === "Enter") this.keys.jump = false;
  };

  private bindKeys(): void {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  // --- Tile helpers ---

  private roomTileAt(room: Room, col: number, row: number): string {
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return ".";
    return room.tiles[row][col];
  }

  private isSolid(t: string): boolean {
    return t === "#";
  }
  private isPlatform(t: string): boolean {
    return t === "=";
  }
  private isLadder(t: string): boolean {
    return t === "H";
  }
  private isDeadly(t: string): boolean {
    return t === "~" || t === "*";
  }

  // --- Physics ---

  private tick(time: number): void {
    const dt = this.lastTime === 0 ? 16 : Math.min(40, time - this.lastTime);
    this.lastTime = time;
    this.state.time += dt;

    if (!this.state.completed && !this.state.gameover) {
      this.updatePlayer(dt);
      this.updateGuardians(dt);
      this.checkCollectibles();
      this.checkRoomExit();
    }
    drawScene(this.ctx, this.state);
    this.emitHud();
    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }

  private updatePlayer(dt: number): void {
    const p = this.state.player;
    const room = this.state.rooms.get(this.state.currentRoomId)!;

    // Ladder detection: center column tile is ladder.
    const cx = p.x + PLAYER_W / 2;
    const cy = p.y + PLAYER_H / 2;
    const ladderHere = this.isLadder(this.roomTileAt(room, Math.floor(cx / TILE), Math.floor(cy / TILE)));
    p.onLadder = ladderHere && (this.keys.up || this.keys.down || p.onLadder);
    if (!ladderHere) p.onLadder = false;

    // Horizontal input.
    p.vx = 0;
    if (this.keys.left) {
      p.vx = -WALK_SPEED;
      p.facing = -1;
    }
    if (this.keys.right) {
      p.vx = WALK_SPEED;
      p.facing = 1;
    }

    // Conveyor tiles under feet.
    const feetRow = Math.floor((p.y + PLAYER_H + 1) / TILE);
    const feetColL = Math.floor(p.x / TILE);
    const feetColR = Math.floor((p.x + PLAYER_W - 1) / TILE);
    for (const c of [feetColL, feetColR]) {
      const t = this.roomTileAt(room, c, feetRow);
      if (t === "C") p.vx += 0.8;
      else if (t === "c") p.vx -= 0.8;
    }

    if (p.onLadder) {
      if (this.keys.up) p.vy = -CLIMB_SPEED;
      else if (this.keys.down) p.vy = CLIMB_SPEED;
      else p.vy = 0;
    } else {
      if (this.keys.jump && p.onGround) {
        p.vy = JUMP_V;
        p.onGround = false;
      }
      p.vy += GRAVITY;
      if (p.vy > MAX_FALL) p.vy = MAX_FALL;
    }

    // Move + collide — X first then Y (per-axis solid collision).
    this.moveAndCollide(p, room);

    // Don't clamp X / top-Y here — checkRoomExit needs the player to actually cross
    // the edge to fire a transition, and bounces him back if that edge has no exit.
    if (p.y > VIEW_H + 8) {
      // Fell off the bottom.
      this.handleDeath();
      return;
    }

    // Walk-cycle phase: increments while moving on ground (or climbing on ladder).
    const movingScalar = p.onLadder ? Math.abs(p.vy) : Math.abs(p.vx);
    p.animPhase = (p.animPhase + movingScalar * 0.12) % 1000;
    p.invulnerableMs = Math.max(0, p.invulnerableMs - dt);

    // Deadly tile at feet?
    const deadlyRow = Math.floor((p.y + PLAYER_H - 1) / TILE);
    const t = this.roomTileAt(room, Math.floor(cx / TILE), deadlyRow);
    if (this.isDeadly(t) && p.invulnerableMs <= 0) {
      this.handleDeath();
    }
  }

  private moveAndCollide(p: PlayerState, room: Room): void {
    // X axis
    const nextX = p.x + p.vx;
    if (p.vx !== 0) {
      const dir = p.vx > 0 ? 1 : -1;
      const probeX = dir > 0 ? nextX + PLAYER_W - 1 : nextX;
      const topRow = Math.floor(p.y / TILE);
      const botRow = Math.floor((p.y + PLAYER_H - 1) / TILE);
      const col = Math.floor(probeX / TILE);
      let blocked = false;
      for (let r = topRow; r <= botRow; r++) {
        if (this.isSolid(this.roomTileAt(room, col, r))) {
          blocked = true;
          break;
        }
      }
      if (!blocked) p.x = nextX;
      else p.x = dir > 0 ? col * TILE - PLAYER_W : (col + 1) * TILE;
    }

    // Y axis
    const nextY = p.y + p.vy;
    p.onGround = false;
    if (p.vy !== 0) {
      const dir = p.vy > 0 ? 1 : -1;
      const probeY = dir > 0 ? nextY + PLAYER_H - 1 : nextY;
      const leftCol = Math.floor(p.x / TILE);
      const rightCol = Math.floor((p.x + PLAYER_W - 1) / TILE);
      const row = Math.floor(probeY / TILE);
      let landed = false;
      for (let c = leftCol; c <= rightCol; c++) {
        const t = this.roomTileAt(room, c, row);
        if (this.isSolid(t)) {
          landed = true;
          break;
        }
        // Jump-through platform: only land when falling and previous tile wasn't already inside.
        if (this.isPlatform(t) && dir > 0) {
          const prevBottomRow = Math.floor((p.y + PLAYER_H - 1) / TILE);
          if (prevBottomRow < row) {
            landed = true;
            break;
          }
        }
      }
      if (!landed) p.y = nextY;
      else {
        if (dir > 0) {
          p.y = row * TILE - PLAYER_H;
          p.vy = 0;
          p.onGround = true;
        } else {
          p.y = (row + 1) * TILE;
          p.vy = 0;
        }
      }
    }

    // Refresh onGround by probing 1px below even if we didn't collide this frame.
    if (!p.onGround && p.vy >= 0) {
      const feetY = p.y + PLAYER_H;
      const row = Math.floor(feetY / TILE);
      const leftCol = Math.floor(p.x / TILE);
      const rightCol = Math.floor((p.x + PLAYER_W - 1) / TILE);
      for (let c = leftCol; c <= rightCol; c++) {
        const t = this.roomTileAt(room, c, row);
        if (this.isSolid(t)) { p.onGround = true; break; }
        if (this.isPlatform(t) && (feetY | 0) % TILE === 0) { p.onGround = true; break; }
      }
    }
  }

  // --- Guardians ---

  private updateGuardians(dt: number): void {
    const room = this.state.rooms.get(this.state.currentRoomId)!;
    const step = dt / 16;  // normalize to 60fps frame units
    for (const g of room.guardians) {
      if (g.kind === "horiz" && g.vx !== undefined && g.minX !== undefined && g.maxX !== undefined) {
        g.x += g.vx * step;
        if (g.x < g.minX) { g.x = g.minX; g.vx = -g.vx; }
        if (g.x > g.maxX) { g.x = g.maxX; g.vx = -g.vx; }
      } else if (g.kind === "vert" && g.vy !== undefined && g.minY !== undefined && g.maxY !== undefined) {
        g.y += g.vy * step;
        if (g.y < g.minY) { g.y = g.minY; g.vy = -g.vy; }
        if (g.y > g.maxY) { g.y = g.maxY; g.vy = -g.vy; }
      } else if (g.kind === "diag" && g.vx !== undefined && g.vy !== undefined && g.minX !== undefined && g.maxX !== undefined && g.minY !== undefined && g.maxY !== undefined) {
        g.x += g.vx * step;
        g.y += g.vy * step;
        if (g.x < g.minX) { g.x = g.minX; g.vx = -g.vx; }
        if (g.x > g.maxX) { g.x = g.maxX; g.vx = -g.vx; }
        if (g.y < g.minY) { g.y = g.minY; g.vy = -g.vy; }
        if (g.y > g.maxY) { g.y = g.maxY; g.vy = -g.vy; }
      }
      g.phase = (g.phase ?? 0) + dt * 0.004;
    }

    // Hit test against player.
    const p = this.state.player;
    if (p.invulnerableMs > 0) return;
    for (const g of room.guardians) {
      if (
        p.x + PLAYER_W > g.x &&
        p.x < g.x + g.w &&
        p.y + PLAYER_H > g.y &&
        p.y < g.y + g.h
      ) {
        this.handleDeath();
        return;
      }
    }
  }

  // --- Collectibles ---

  private checkCollectibles(): void {
    const room = this.state.rooms.get(this.state.currentRoomId)!;
    const p = this.state.player;
    const remaining: Item[] = [];
    for (const it of room.items) {
      const px = it.x * TILE + 4;
      const py = it.y * TILE + 4;
      if (
        p.x + PLAYER_W > px &&
        p.x < px + 10 &&
        p.y + PLAYER_H > py &&
        p.y < py + 10
      ) {
        this.state.collected.add(it.id);
        if (this.state.collected.size >= this.state.totalItems) {
          // Need to return to iglu to win.
          // We'll mark completion when the player returns with everything.
        }
      } else {
        remaining.push(it);
      }
    }
    room.items = remaining;
  }

  // --- Room transitions ---

  private checkRoomExit(): void {
    const room = this.state.rooms.get(this.state.currentRoomId)!;
    const p = this.state.player;
    // Which side crossed?
    let side: "left" | "right" | "top" | "bottom" | null = null;
    if (p.x + PLAYER_W < 0) side = "left";
    else if (p.x > VIEW_W) side = "right";
    else if (p.y + PLAYER_H < 0) side = "top";
    else if (p.y > VIEW_H) side = "bottom";
    if (!side) return;

    const exit = room.exits.find((e) => e.side === side);
    if (!exit) {
      // Bounce back — no exit on this edge.
      if (side === "left") p.x = 0;
      else if (side === "right") p.x = VIEW_W - PLAYER_W;
      else if (side === "top") p.y = 0;
      else if (side === "bottom") p.y = VIEW_H - PLAYER_H;
      p.vx = 0;
      p.vy = 0;
      return;
    }
    const nextRoom = this.state.rooms.get(exit.toRoom);
    if (!nextRoom) return;
    this.state.currentRoomId = nextRoom.id;

    // Position in next room: mirror from crossed side unless explicit target given.
    if (exit.toX !== undefined && exit.toY !== undefined) {
      p.x = exit.toX * TILE;
      p.y = exit.toY * TILE;
    } else {
      if (side === "right") p.x = 0 + 2;
      else if (side === "left") p.x = VIEW_W - PLAYER_W - 2;
      else if (side === "bottom") p.y = 0 + 2;
      else if (side === "top") p.y = VIEW_H - PLAYER_H - 2;
    }
    p.vx = 0;
    p.vy = 0;

    this.showHintIfNew(nextRoom);

    // Returning to iglu with everything → win.
    if (nextRoom.id === "iglu" && this.state.collected.size >= this.state.totalItems) {
      this.state.completed = true;
      this.hooks.onWin(Math.round(this.state.time / 1000));
    }
  }

  // --- Death / respawn ---

  private handleDeath(): void {
    this.state.lives -= 1;
    if (this.state.lives <= 0) {
      this.state.gameover = true;
      this.hooks.onGameover();
      return;
    }
    const room = this.state.rooms.get(this.state.currentRoomId)!;
    this.state.player = this.freshPlayer(room);
    this.state.player.invulnerableMs = INVULN_MS;
  }
}

// Re-export commonly used constants for layout code.
export { VIEW_W as CANVAS_LOGICAL_W, VIEW_H as CANVAS_LOGICAL_H };
export { PLAYER_W, PLAYER_H };
export type { Guardian, Room };
