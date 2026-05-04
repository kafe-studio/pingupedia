import type {
  GameHooks,
  GameState,
  Guardian,
  Item,
  PlayerState,
  Room,
} from "./types";
import { COLS, ROWS, TILE, VIEW_H, VIEW_W, KEY_TO_MINIGAME } from "./types";
import { ROOMS, START_ROOM_ID } from "./levels";
import { placeChicksAndIglus } from "./levels-chicks";
import { drawScene } from "./render";

// Physics constants tuned for 320×224 logical world.
// Jump apex ≈ JUMP_V² / (2·GRAVITY) — needs to clear 4 tiles (≈64 px).
const GRAVITY = 0.30;
const WALK_SPEED = 1.4;
const JUMP_V = -7.0;
const MAX_FALL = 6;
const CLIMB_SPEED = 1.1;
const INVULN_MS = 900;
const TRANSITION_INVULN_MS = 1500;
const PLAYER_W = 16;
const PLAYER_H = 20;
const MAX_LIVES = 5;
const HEART_SPAWN_INTERVAL_MS = 7_000;  // try to spawn a new heart every 7s
const HEART_MAX_ALIVE = 8;              // never more than this many on the map at once
const HEART_LIVES = 3;                  // each heart restores up to 3 lives
const PECK_COOLDOWN_MS = 500;           // delay between successive pecks
const BOMB_FUSE_MS = 1500;              // čas po stisknutí ALT do výbuchu
const BOMB_COOLDOWN_MS = 2500;          // mezi položením dvou bomb
const BOMB_FLASH_MS = 350;              // doba výbuchového flashe v rendereru
const BOMB_RADIUS = 1;                  // tile radius — 3×3 zóna
const DOUBLE_JUMP_V = -6.0;             // druhý skok ve vzduchu (mírně slabší než JUMP_V)
const IGLU_DELIVER_COOLDOWN_MS = 600;   // mezi po sobě jdoucími doručeními do iglu
const CHICK_DELIVER_BONUS = 50;         // body za doručené mládě
const CONFETTI_COUNT = 24;              // počet částic na jedno doručení

export class PlatformGame {
  private ctx: CanvasRenderingContext2D;
  private state: GameState;
  private hooks: GameHooks;
  private keys = { left: false, right: false, up: false, down: false, jump: false, bigJump: false, bomb: false };
  private lastTime = 0;
  private rafId = 0;
  private disposed = false;
  private heartSpawnTimer = HEART_SPAWN_INTERVAL_MS / 2;
  private peckCooldown = 0;
  private bombCooldown = 0;
  private igluCooldown = 0;
  private hasDoubleJumped = false;

  constructor(canvas: HTMLCanvasElement, hooks: GameHooks) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d missing");
    this.ctx = ctx;
    this.hooks = hooks;
    // 2× internal resolution for crisp anti-aliased graphics.
    const SCALE = 2;
    canvas.width = VIEW_W * SCALE;
    canvas.height = VIEW_H * SCALE;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.scale(SCALE, SCALE);

    const rooms = new Map<string, Room>();
    for (const r of ROOMS) {
      // Deep-clone guardians/items so restart resets their state.
      const cloned: Room = {
        ...r,
        // Tiles are mutated by peck; clone the array (strings inside are immutable, no deeper clone needed).
        tiles: [...r.tiles],
        guardians: r.guardians.map((g) => ({ ...g, phase: 0 })),
        items: r.items.map((it) => ({ ...it })),
      };
      rooms.set(r.id, cloned);
    }
    placeChicksAndIglus(rooms);
    let totalItems = 0;
    let totalChicks = 0;
    for (const r of rooms.values()) {
      for (const it of r.items) {
        if (it.kind === "chick") totalChicks++;
        else if (it.kind !== "heart" && it.kind !== "key" && it.kind !== "iglu") totalItems++;
      }
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
      keys: new Set(),
      openedDoors: new Set(),
      paused: false,
      chicks: [],
      deliveredChicks: 0,
      totalChicks,
      score: 0,
      bombs: [],
      confetti: [],
    };
    this.bindKeys();
    this.showHintIfNew(start);
    this.emitHud();
    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }

  destroy(): void {
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  restart(): void {
    this.state.rooms = new Map<string, Room>();
    for (const r of ROOMS) {
      this.state.rooms.set(r.id, {
        ...r,
        tiles: [...r.tiles],
        guardians: r.guardians.map((g) => ({ ...g, phase: 0 })),
        items: r.items.map((it) => ({ ...it })),
      });
    }
    placeChicksAndIglus(this.state.rooms);
    this.state.currentRoomId = START_ROOM_ID;
    const start = this.state.rooms.get(START_ROOM_ID)!;
    this.state.player = this.freshPlayer(start);
    this.state.lives = 3;
    this.state.collected = new Set();
    this.state.time = 0;
    this.state.completed = false;
    this.state.gameover = false;
    this.state.lastHintRoom = null;
    this.state.hintUntil = 0;
    this.state.keys = new Set();
    this.state.openedDoors = new Set();
    this.state.paused = false;
    this.state.bombs = [];
    this.state.confetti = [];
    this.state.chicks = [];
    this.state.deliveredChicks = 0;
    this.peckCooldown = 0;
    this.igluCooldown = 0;
    this.bombCooldown = 0;
    this.hasDoubleJumped = false;
    this.heartSpawnTimer = HEART_SPAWN_INTERVAL_MS / 2;
    this.showHintIfNew(start);
    this.emitHud();
  }

  /** Resume after a minigame closes. Optionally unlock the door that triggered it. */
  resumeAfterMinigame(doorId: string | null): void {
    if (doorId) this.state.openedDoors.add(doorId);
    this.state.paused = false;
    // Push the player slightly away from the door so they don't immediately re-trigger.
    this.state.player.invulnerableMs = TRANSITION_INVULN_MS;
    this.emitHud();
  }

  // Virtual controls for mobile buttons.
  setKey(k: "left" | "right" | "up" | "down" | "jump" | "bigJump" | "bomb", down: boolean): void {
    this.keys[k] = down;
  }

  /** Bomb request from keyboard (Alt) or mobile button. Cooldown-gated, max 1 active. */
  dropBomb(): void {
    if (this.bombCooldown > 0) return;
    if (this.state.completed || this.state.gameover || this.state.paused) return;
    if (this.state.bombs.some((b) => !b.exploded)) return;
    const p = this.state.player;
    this.state.bombs.push({
      x: p.x + PLAYER_W / 2,
      y: p.y + PLAYER_H - 4,
      fuseMs: BOMB_FUSE_MS,
      exploded: false,
      flashMs: 0,
    });
    this.bombCooldown = BOMB_COOLDOWN_MS;
    this.hooks.onSfx("ding");
  }

  /** Peck request from keyboard or mobile button. Cooldown-gated. */
  peck(): void {
    if (this.peckCooldown > 0) return;
    if (this.state.completed || this.state.gameover) return;
    const p = this.state.player;
    const room = this.state.rooms.get(this.state.currentRoomId)!;
    // Target tile is right under the player's feet (center column).
    const cx = p.x + PLAYER_W / 2;
    const targetCol = Math.floor(cx / TILE);
    const targetRow = Math.floor((p.y + PLAYER_H) / TILE);
    if (targetRow >= ROWS - 1) return;       // protect outer ground row
    if (targetCol < 1 || targetCol >= COLS - 1) return; // protect outer side cols
    const tile = room.tiles[targetRow]?.[targetCol];
    if (tile !== "#" && tile !== "b" && tile !== "=") return;
    // Mutate tile string → empty.
    const row = room.tiles[targetRow];
    room.tiles[targetRow] = row.slice(0, targetCol) + "." + row.slice(targetCol + 1);
    this.peckCooldown = PECK_COOLDOWN_MS;
    this.hooks.onSfx("ding");
  }

  private freshPlayer(room: Room): PlayerState {
    let { x, y } = room.spawn;
    // Snap up if spawn intersects solid floor.
    const topRow = Math.floor(y / TILE);
    const botRow = Math.floor((y + PLAYER_H - 1) / TILE);
    const leftCol = Math.floor(x / TILE);
    const rightCol = Math.floor((x + PLAYER_W - 1) / TILE);
    for (let r = topRow; r <= botRow; r++) {
      for (let c = leftCol; c <= rightCol; c++) {
        if (this.isSolid(this.roomTileAt(room, c, r))) {
          y = r * TILE - PLAYER_H;
          r = botRow + 1;
          break;
        }
      }
    }
    return { x, y, vx: 0, vy: 0, onGround: false, onLadder: false, facing: 1, animPhase: 0, invulnerableMs: 0 };
  }

  private emitHud(): void {
    const room = this.state.rooms.get(this.state.currentRoomId)!;
    const hintActive = performance.now() < this.state.hintUntil;
    const ids = [...this.state.rooms.keys()];
    const idx = ids.indexOf(this.state.currentRoomId);
    this.hooks.onHud({
      roomName: room.name,
      roomIndex: idx + 1,
      totalRooms: ids.length,
      hint: hintActive ? (room.hint ?? null) : null,
      lives: this.state.lives,
      collected: this.state.collected.size,
      total: this.state.totalItems,
      keys: [...this.state.keys],
      chicksFollowing: this.state.chicks.length,
      chicksDelivered: this.state.deliveredChicks,
      totalChicks: this.state.totalChicks,
      score: this.state.score,
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
    else if (k === "Control") this.keys.bigJump = true;
    else if (k === "Alt") this.dropBomb();
    else if (k === "x" || k === "X") this.peck();
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
    else if (k === "Control") this.keys.bigJump = false;
  };

  private bindKeys(): void {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  // --- Tile helpers ---

  private roomTileAt(room: Room, col: number, row: number): string {
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return ".";
    // Locked doors render as solid blocks; once unlocked, the cell is empty.
    const door = room.doors?.find((d) => d.col === col && d.row === row);
    if (door) {
      // Guard: state may not exist yet during constructor's freshPlayer call.
      const opened = this.state?.openedDoors ?? new Set<string>();
      return opened.has(door.id) ? "." : "#";
    }
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
  // Topmost ladder tile in a column behaves like a jump-through platform —
  // you land on it from above and can stand. Stack interior (ladder above) doesn't.
  private isLadderTop(room: Room, col: number, row: number): boolean {
    if (!this.isLadder(this.roomTileAt(room, col, row))) return false;
    return !this.isLadder(this.roomTileAt(room, col, row - 1));
  }
  private isDeadly(t: string): boolean {
    // Voda už nezabíjí — tučňák v ní plave. Jen ostny / krystaly zabíjejí.
    return t === "*";
  }
  private isWater(t: string): boolean {
    return t === "~";
  }

  // --- Physics ---

  private tick(time: number): void {
    if (this.disposed) return;
    const dt = this.lastTime === 0 ? 16 : Math.min(40, time - this.lastTime);
    this.lastTime = time;
    this.state.time += dt;

    if (!this.state.completed && !this.state.gameover && !this.state.paused) {
      this.peckCooldown = Math.max(0, this.peckCooldown - dt);
      this.bombCooldown = Math.max(0, this.bombCooldown - dt);
      this.igluCooldown = Math.max(0, this.igluCooldown - dt);
      this.updatePlayer(dt);
      this.updateChicks();
      this.updateGuardians(dt);
      this.updateBombs(dt);
      this.updateConfetti(dt);
      this.checkCollectibles();
      this.checkDoors();
      this.checkRoomExit();
      this.maybeSpawnHeart(dt);
    }
    drawScene(this.ctx, this.state);
    this.emitHud();
    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }

  private updatePlayer(dt: number): void {
    const step = dt / 16; // 1.0 at 60 Hz; konstanty fyziky byly tunované na 60 Hz frame
    const p = this.state.player;
    const room = this.state.rooms.get(this.state.currentRoomId)!;

    // Ladder detection: center column tile is ladder.
    const cx = p.x + PLAYER_W / 2;
    const cy = p.y + PLAYER_H / 2;
    const ladderHere = this.isLadder(this.roomTileAt(room, Math.floor(cx / TILE), Math.floor(cy / TILE)));
    p.onLadder = ladderHere && (this.keys.up || this.keys.down || p.onLadder);
    if (!ladderHere) p.onLadder = false;
    if (p.onLadder) this.hasDoubleJumped = false;

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

    // Detect swim — center tile is water.
    const inWater = this.isWater(this.roomTileAt(room, Math.floor(cx / TILE), Math.floor(cy / TILE)));

    if (p.onLadder) {
      // Skok ze žebříku: mezerník nebo CTRL spustí normální skok pryč.
      if (this.keys.jump || this.keys.bigJump) {
        p.vy = JUMP_V;
        p.onLadder = false;
        p.onGround = false;
        this.hasDoubleJumped = false;
        this.keys.bigJump = false;
        this.hooks.onSfx("boing");
      } else if (this.keys.up) p.vy = -CLIMB_SPEED;
      else if (this.keys.down) p.vy = CLIMB_SPEED;
      else p.vy = 0;
    } else if (inWater) {
      // Swim mode: 4-directional control, water resistance, slight upward buoyancy.
      const SWIM = 1.4;
      if (this.keys.up || this.keys.jump) p.vy = -SWIM;
      else if (this.keys.down) p.vy = SWIM;
      else p.vy = (p.vy * 0.85) - 0.04;   // damping + tiny buoyancy
      if (p.vy < -SWIM) p.vy = -SWIM;
      if (p.vy > SWIM) p.vy = SWIM;
      // Horizontal slightly slower in water
      p.vx *= 0.85;
      p.onGround = false;
    } else {
      // Down-press drop through jump-through platform: pokud stojím na "=" a držím dolů, propadnu.
      // Stejný gesture na vrcholu žebříku → znovu se přichytím a lezu dolů.
      if (this.keys.down && p.onGround) {
        const cxNow = p.x + PLAYER_W / 2;
        const feetRow = Math.floor((p.y + PLAYER_H) / TILE);
        const ladderCol = Math.floor(cxNow / TILE);
        const tileBelow = this.roomTileAt(room, ladderCol, feetRow);
        if (tileBelow === "=") {
          p.y += 2;
          p.onGround = false;
        } else if (tileBelow === "H") {
          p.x = ladderCol * TILE + (TILE - PLAYER_W) / 2;
          p.onLadder = true;
          p.onGround = false;
        }
      }
      if ((this.keys.jump || this.keys.bigJump) && p.onGround) {
        // První skok ze země — SPACE i CTRL fungují stejně.
        p.vy = JUMP_V;
        p.onGround = false;
        this.hasDoubleJumped = false;
        this.keys.bigJump = false;
        this.hooks.onSfx("boing");
      } else if (this.keys.bigJump && !p.onGround && !this.hasDoubleJumped) {
        // Druhý skok ve vzduchu — CTRL spustí double jump (jen jednou za skok).
        p.vy = DOUBLE_JUMP_V;
        this.hasDoubleJumped = true;
        this.keys.bigJump = false;
        this.hooks.onSfx("boing");
      }
      // Skip gravity while resting on ground — otherwise sub-pixel fall + re-snap
      // produces a constant jitter at every frame.
      if (!p.onGround) {
        p.vy += GRAVITY * step;
        if (p.vy > MAX_FALL) p.vy = MAX_FALL;
      } else {
        p.vy = 0;
      }
    }

    // Move + collide — X first then Y (per-axis solid collision).
    this.moveAndCollide(p, room, step);

    // Reset double-jump charge na zemi i ve vodě (oboje znamená kontakt).
    if (p.onGround || inWater) this.hasDoubleJumped = false;

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

  private moveAndCollide(p: PlayerState, room: Room, step: number): void {
    // X axis
    const nextX = p.x + p.vx * step;
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
    const nextY = p.y + p.vy * step;
    p.onGround = false;
    if (p.vy !== 0) {
      const dir = p.vy > 0 ? 1 : -1;
      // For falling, probe at the feet line (right at the top of the tile below) so
      // even sub-pixel descents detect the floor on the same frame.
      const probeY = dir > 0 ? nextY + PLAYER_H : nextY;
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
        // Ladder top behaves like jump-through platform — land when falling from above.
        if (dir > 0 && !p.onLadder && this.isLadderTop(room, c, row)) {
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
        if (!p.onLadder && this.isLadderTop(room, c, row) && (feetY | 0) % TILE === 0) { p.onGround = true; break; }
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

  // --- Chicks (follow-train) ---

  /** Mláďata se drží těsně u hráče — každé o pár pixelů za ním ve směru couvání.
   *  Bez trail bufferu, žádné zpoždění; vlak se sune přilepený dokud nedoručíš. */
  private updateChicks(): void {
    if (this.state.chicks.length === 0) return;
    const p = this.state.player;
    const STEP = 5; // px za hráčem na každé další mládě
    this.state.chicks.forEach((c, i) => {
      c.x = p.x - p.facing * STEP * (i + 1);
      c.y = p.y;
      c.facing = p.facing;
      c.trail = [];
    });
  }

  // --- Bombs ---

  /** Bomby odpočítávají; po vypršení knotu zničí #/=/b tiles v 3×3 zóně. */
  private updateBombs(dt: number): void {
    if (this.state.bombs.length === 0) return;
    const room = this.state.rooms.get(this.state.currentRoomId)!;
    for (const b of this.state.bombs) {
      if (!b.exploded) {
        b.fuseMs -= dt;
        if (b.fuseMs <= 0) {
          b.exploded = true;
          b.flashMs = BOMB_FLASH_MS;
          const cc = Math.floor(b.x / TILE);
          const cr = Math.floor(b.y / TILE);
          for (let r = cr - BOMB_RADIUS; r <= cr + BOMB_RADIUS; r++) {
            for (let c = cc - BOMB_RADIUS; c <= cc + BOMB_RADIUS; c++) {
              if (r < 1 || r >= ROWS - 1) continue;       // chrání horní/dolní rám
              if (c < 1 || c >= COLS - 1) continue;       // chrání boční rám
              const t = room.tiles[r]?.[c];
              if (t === "#" || t === "b" || t === "=") {
                const row = room.tiles[r];
                room.tiles[r] = row.slice(0, c) + "." + row.slice(c + 1);
              }
            }
          }
          this.hooks.onSfx("bzzt");
        }
      } else {
        b.flashMs -= dt;
      }
    }
    this.state.bombs = this.state.bombs.filter((b) => !b.exploded || b.flashMs > 0);
  }

  // --- Collectibles ---

  private checkCollectibles(): void {
    const room = this.state.rooms.get(this.state.currentRoomId)!;
    const p = this.state.player;
    const remaining: Item[] = [];
    for (const it of room.items) {
      const px = it.x * TILE + 4;
      const py = it.y * TILE + 4;
      const hit =
        p.x + PLAYER_W > px &&
        p.x < px + 10 &&
        p.y + PLAYER_H > py &&
        p.y < py + 10;
      if (!hit) {
        remaining.push(it);
        continue;
      }
      // Heart = okamžité +3 životy (cap MAX_LIVES), NE je počítán do totalItems.
      if (it.kind === "heart") {
        this.state.lives = Math.min(MAX_LIVES, this.state.lives + HEART_LIVES);
        this.hooks.onSfx("gulp");
        continue;
      }
      // Key = uložit barvu, NE je počítán do totalItems.
      if (it.kind === "key" && it.keyColor) {
        this.state.keys.add(it.keyColor);
        this.hooks.onSfx("ding");
        continue;
      }
      // Chick = přidat do follow-train, NE počítán do totalItems (cíl je doručit, ne sebrat).
      if (it.kind === "chick") {
        this.state.chicks.push({
          id: it.id,
          x: p.x,
          y: p.y,
          facing: p.facing,
          trail: [],
        });
        this.hooks.onSfx("peep");
        continue;
      }
      // Iglu = cíl doručení; nikdy se nesebere, jen aktivuje doručení jednoho mláděte.
      if (it.kind === "iglu") {
        if (this.igluCooldown <= 0 && this.state.chicks.length > 0) {
          this.deliverOneChick(it.x * TILE + TILE / 2, it.y * TILE + TILE / 2);
        }
        remaining.push(it);
        continue;
      }
      this.state.collected.add(it.id);
      this.state.score += it.kind === "fish" ? 5 : it.kind === "egg" ? 10 : 25;
      if (it.kind === "fish") this.hooks.onSfx("mlask");
      else if (it.kind === "egg") this.hooks.onSfx("pop");
      else this.hooks.onSfx("ding"); // medal / flag / crystal
    }
    room.items = remaining;
  }

  /** Doručí jedno mládě (FIFO) na pozici iglu, spustí konfety + fanfáru. */
  private deliverOneChick(centerX: number, centerY: number): void {
    this.state.chicks.shift();
    this.state.deliveredChicks++;
    this.state.score += CHICK_DELIVER_BONUS;
    this.igluCooldown = IGLU_DELIVER_COOLDOWN_MS;
    this.spawnConfetti(centerX, centerY);
    this.hooks.onSfx("fanfare");
  }

  /** Vyplive částice nad iglu — jasné barvy, gravitace, krátká životnost. */
  private spawnConfetti(cx: number, cy: number): void {
    const colors = ["#fbbf24", "#ef4444", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#fef3c7"];
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      this.state.confetti.push({
        x: cx + (Math.random() - 0.5) * 6,
        y: cy + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 4,
        vy: -3 - Math.random() * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        lifeMs: 1200 + Math.random() * 600,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.4,
      });
    }
  }

  /** Aktualizuje konfetí — gravitace, drag, doživotní úbytek. */
  private updateConfetti(dt: number): void {
    if (this.state.confetti.length === 0) return;
    const step = dt / 16;
    for (const c of this.state.confetti) {
      c.x += c.vx * step;
      c.y += c.vy * step;
      c.vy += 0.18 * step;
      c.vx *= 0.99;
      c.rot += c.vrot * step;
      c.lifeMs -= dt;
    }
    this.state.confetti = this.state.confetti.filter((c) => c.lifeMs > 0);
  }

  /** Pokud hráč stojí těsně vedle zamčených dveří a má klíč, spustí mini-hru. */
  private checkDoors(): void {
    const room = this.state.rooms.get(this.state.currentRoomId)!;
    if (!room.doors || room.doors.length === 0) return;
    const p = this.state.player;
    const leftCol = Math.floor(p.x / TILE);
    const rightCol = Math.floor((p.x + PLAYER_W - 1) / TILE);
    const topRow = Math.floor(p.y / TILE);
    const botRow = Math.floor((p.y + PLAYER_H - 1) / TILE);
    for (const door of room.doors) {
      if (this.state.openedDoors.has(door.id)) continue;
      // Adjacency check: player needs to stand next to the door (±1 column) at the same row.
      // Locked doors are solid walls so the player can never *overlap* them — adjacent triggers.
      const colAdjacent = door.col >= leftCol - 1 && door.col <= rightCol + 1;
      const rowOverlap = door.row >= topRow && door.row <= botRow + 1;
      if (colAdjacent && rowOverlap) {
        if (this.state.keys.has(door.color)) {
          this.state.paused = true;
          this.hooks.onMinigame(KEY_TO_MINIGAME[door.color], door.id);
          return;
        }
      }
    }
  }

  /** Periodicky spawne srdíčko v náhodné místnosti (max HEART_MAX_ALIVE). */
  private maybeSpawnHeart(dt: number): void {
    this.heartSpawnTimer -= dt;
    if (this.heartSpawnTimer > 0) return;
    this.heartSpawnTimer = HEART_SPAWN_INTERVAL_MS;
    let alive = 0;
    for (const r of this.state.rooms.values()) {
      for (const it of r.items) if (it.kind === "heart") alive++;
    }
    if (alive >= HEART_MAX_ALIVE) return;
    const ids = [...this.state.rooms.keys()];
    // Pick a non-iglu room so the start location isn't littered.
    const target = ids[Math.floor(Math.random() * ids.length)];
    if (target === "iglu") return;
    const room = this.state.rooms.get(target)!;
    // Find an empty tile that has a solid/platform tile directly below — heart sits on a surface.
    for (let attempt = 0; attempt < 25; attempt++) {
      const x = 1 + Math.floor(Math.random() * (COLS - 2));
      const y = 1 + Math.floor(Math.random() * (ROWS - 3));
      if (room.tiles[y][x] !== ".") continue;
      const below = room.tiles[y + 1][x];
      if (below !== "#" && below !== "=") continue;
      // Avoid stacking on top of an existing item.
      if (room.items.some((it) => it.x === x && it.y === y)) continue;
      room.items.push({ kind: "heart", x, y, id: `heart-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` });
      break;
    }
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

    // Top/bottom přechod = po žebříku. Player se snapne na ladder column toX:
    //   - bottom entry (zezdola nahoru) → spawn na row 9 (= top of catch platform), žebřík pokračuje dolů
    //   - top entry (z vrchu dolů)      → spawn na row 0 (těsně pod stropem), žebřík pokračuje dolů ke catch v row 5
    // Dál ho engine drží na žebříku (`onLadder=true`) — stačí tisknout up/down nebo nic, padání nehrozí.
    const ladderCol = exit.toX ?? 9;
    if (side === "bottom") {
      p.x = ladderCol * TILE + (TILE - PLAYER_W) / 2;
      p.y = 9 * TILE;
      p.onLadder = true;
    } else if (side === "top") {
      p.x = ladderCol * TILE + (TILE - PLAYER_W) / 2;
      p.y = 0;
      p.onLadder = true;
    } else if (exit.toX !== undefined && exit.toY !== undefined) {
      p.x = exit.toX * TILE;
      p.y = exit.toY * TILE;
    } else {
      if (side === "right") p.x = 0 + 2;
      else if (side === "left") p.x = VIEW_W - PLAYER_W - 2;
    }
    p.vx = 0;
    p.vy = 0;
    // Snap player up if landing position overlaps a solid tile below — jinak by první
    // frame X-axis collision viděl solid podlahu a zablokoval pohyb (= "neprůchozí").
    if (side !== "top" && side !== "bottom") {
      const topRow = Math.floor(p.y / TILE);
      const botRow = Math.floor((p.y + PLAYER_H - 1) / TILE);
      const leftCol = Math.floor(p.x / TILE);
      const rightCol = Math.floor((p.x + PLAYER_W - 1) / TILE);
      let snapRow = -1;
      for (let r = topRow; r <= botRow && snapRow < 0; r++) {
        for (let c = leftCol; c <= rightCol; c++) {
          if (this.isSolid(this.roomTileAt(nextRoom, c, r))) { snapRow = r; break; }
        }
      }
      if (snapRow >= 0) p.y = snapRow * TILE - PLAYER_H;
    }
    // Top/bottom přechod = 5s nezranitelnosti pro pohodlné vystoupení ze žebříku.
    // Boční přechody jen 1.5s (původní hodnota).
    p.invulnerableMs = (side === "top" || side === "bottom") ? 5000 : TRANSITION_INVULN_MS;

    this.hooks.onSfx("zbunk");
    this.showHintIfNew(nextRoom);

    // Returning to iglu with everything → win (collected + all chicks delivered).
    if (
      nextRoom.id === "iglu" &&
      this.state.collected.size >= this.state.totalItems &&
      this.state.deliveredChicks >= this.state.totalChicks
    ) {
      this.state.completed = true;
      this.hooks.onSfx("tada");
      this.hooks.onWin(Math.round(this.state.time / 1000));
    }
  }

  // --- Death / respawn ---

  private handleDeath(): void {
    this.state.lives -= 1;
    if (this.state.lives <= 0) {
      this.state.gameover = true;
      this.hooks.onSfx("bzzt");
      this.hooks.onGameover();
      return;
    }
    this.hooks.onSfx("ouch");
    const room = this.state.rooms.get(this.state.currentRoomId)!;
    this.state.player = this.freshPlayer(room);
    this.state.player.invulnerableMs = INVULN_MS;
  }
}

// Re-export commonly used constants for layout code.
export { VIEW_W as CANVAS_LOGICAL_W, VIEW_H as CANVAS_LOGICAL_H };
export { PLAYER_W, PLAYER_H };
export type { Guardian, Room };
