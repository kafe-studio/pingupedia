import type { Hero, Level, Obstacle } from "./types";
import { CANVAS_H, CANVAS_W, HERO_H, HERO_W } from "./types";
import { getLevel, MAX_LEVEL } from "./levels";
import { drawScene } from "./render";

const GRAVITY = 0.4;
const MOVE_SPEED = 2;
const JUMP_V = -7;
const CLIMB_SPEED = 1.5;

export type GameStatus = "playing" | "win" | "gameover" | "levelDone";

export interface GameHooks {
  onStatus(status: GameStatus): void;
  onHud(hud: { level: number; lives: number; score: number }): void;
}

export class Game {
  private ctx: CanvasRenderingContext2D;
  private level: Level;
  private hero: Hero;
  private obstacles: Obstacle[] = [];
  private keys = { left: false, right: false, up: false, down: false, jump: false };
  private lives = 3;
  private score = 0;
  private levelNum = 1;
  private status: GameStatus = "playing";
  private lastTime = 0;
  private spawnTimer = 0;
  private rafId = 0;
  private hooks: GameHooks;

  constructor(canvas: HTMLCanvasElement, hooks: GameHooks) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d context missing");
    this.ctx = ctx;
    this.hooks = hooks;
    this.level = getLevel(1);
    this.hero = this.makeHero();
    this.bindKeys();
    this.emitHud();
    this.hooks.onStatus("playing");
    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }

  destroy(): void {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  restart(): void {
    this.lives = 3;
    this.score = 0;
    this.levelNum = 1;
    this.loadLevel(1);
    this.status = "playing";
    this.hooks.onStatus("playing");
    this.emitHud();
  }

  nextLevel(): void {
    if (this.levelNum >= MAX_LEVEL) {
      this.status = "win";
      this.hooks.onStatus("win");
      return;
    }
    this.levelNum++;
    this.loadLevel(this.levelNum);
    this.status = "playing";
    this.hooks.onStatus("playing");
    this.emitHud();
  }

  private loadLevel(n: number): void {
    this.level = getLevel(n);
    this.hero = this.makeHero();
    this.obstacles = [];
    this.spawnTimer = -this.level.spawnStartMs;
  }

  private makeHero(): Hero {
    return {
      x: this.level.heroStart.x,
      y: this.level.heroStart.y,
      w: HERO_W,
      h: HERO_H,
      vx: 0,
      vy: 0,
      onGround: false,
      onLadder: false,
      facing: 1,
    };
  }

  private emitHud(): void {
    this.hooks.onHud({ level: this.levelNum, lives: this.lives, score: this.score });
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

  private tick(time: number): void {
    const dt = this.lastTime === 0 ? 16 : time - this.lastTime;
    this.lastTime = time;
    if (this.status === "playing") {
      this.update(Math.min(dt, 40));
    }
    drawScene(this.ctx, this.level, this.hero, this.obstacles, time);
    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }

  private update(dt: number): void {
    this.updateHero();
    this.updateObstacles(dt);
    this.checkCollisions();
    this.checkGoal();
  }

  private updateHero(): void {
    const h = this.hero;
    const k = this.keys;
    h.vx = k.left ? -MOVE_SPEED : k.right ? MOVE_SPEED : 0;
    if (h.vx !== 0) h.facing = h.vx > 0 ? 1 : -1;
    const onLadder = this.detectLadder();
    if (onLadder && (k.up || k.down)) {
      h.onLadder = true;
      h.vy = k.up ? -CLIMB_SPEED : CLIMB_SPEED;
    } else if (h.onLadder && onLadder) {
      h.vy = 0;
    } else {
      h.onLadder = false;
      h.vy += GRAVITY;
      if (k.jump && h.onGround) {
        h.vy = JUMP_V;
        h.onGround = false;
      }
    }
    h.x += h.vx;
    h.y += h.vy;
    if (h.x < 0) h.x = 0;
    else if (h.x + h.w > CANVAS_W) h.x = CANVAS_W - h.w;
    this.resolvePlatforms();
  }

  private detectLadder(): boolean {
    const h = this.hero;
    const cx = h.x + h.w / 2;
    const cy = h.y + h.h / 2;
    for (const l of this.level.ladders) {
      if (cx >= l.x && cx <= l.x + l.w && cy >= l.y - 4 && cy <= l.y + l.h + 4) return true;
    }
    return false;
  }

  private resolvePlatforms(): void {
    const h = this.hero;
    if (h.onLadder) {
      h.onGround = false;
      return;
    }
    h.onGround = false;
    for (const p of this.level.platforms) {
      const overlapX = h.x + h.w > p.x && h.x < p.x + p.w;
      const feet = h.y + h.h;
      if (overlapX && h.vy >= 0 && feet >= p.y && feet <= p.y + p.h + 2) {
        h.y = p.y - h.h;
        h.vy = 0;
        h.onGround = true;
      }
    }
    if (h.y + h.h > CANVAS_H) {
      h.y = CANVAS_H - h.h;
      h.vy = 0;
      h.onGround = true;
    }
  }

  private updateObstacles(dt: number): void {
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.level.spawnRateMs) {
      this.spawnTimer = 0;
      this.obstacles.push({
        x: this.level.goal.x + 6 + Math.random() * 12,
        y: this.level.goal.y - 20,
        vx: Math.random() < 0.5 ? -this.level.obstacleSpeed : this.level.obstacleSpeed,
        vy: 0,
        size: 14,
      });
    }
    for (const o of this.obstacles) {
      o.x += o.vx;
      o.y += o.vy + this.level.obstacleSpeed * 0.3;
      let onPlatform = false;
      for (const p of this.level.platforms) {
        const bottom = o.y + o.size;
        if (
          bottom >= p.y &&
          bottom <= p.y + p.h + 4 &&
          o.x + o.size > p.x &&
          o.x < p.x + p.w
        ) {
          o.y = p.y - o.size;
          onPlatform = true;
          break;
        }
      }
      if (!onPlatform) o.vy = this.level.obstacleSpeed;
      else o.vy = 0;
      if (o.x < -20) o.vx = Math.abs(o.vx);
      if (o.x + o.size > CANVAS_W + 20) o.vx = -Math.abs(o.vx);
    }
    this.obstacles = this.obstacles.filter((o) => o.y < CANVAS_H + 40);
  }

  private checkCollisions(): void {
    const h = this.hero;
    for (const o of this.obstacles) {
      if (
        h.x + h.w > o.x + 2 &&
        h.x < o.x + o.size - 2 &&
        h.y + h.h > o.y + 2 &&
        h.y < o.y + o.size - 2
      ) {
        this.onHit();
        return;
      }
    }
  }

  private onHit(): void {
    this.lives--;
    if (this.lives <= 0) {
      this.status = "gameover";
      this.hooks.onStatus("gameover");
      this.emitHud();
      return;
    }
    this.hero = this.makeHero();
    this.obstacles = [];
    this.spawnTimer = -600;
    this.emitHud();
  }

  private checkGoal(): void {
    const h = this.hero;
    const g = this.level.goal;
    if (h.x + h.w > g.x && h.x < g.x + g.w && h.y + h.h > g.y && h.y < g.y + g.h) {
      this.score += 100 + this.lives * 20;
      this.status = "levelDone";
      this.hooks.onStatus("levelDone");
      this.emitHud();
    }
  }
}
