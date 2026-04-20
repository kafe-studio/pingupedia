import type {
  Bullet,
  Enemy,
  EnemyKind,
  GameStatus,
  Hero,
  UpgradeOption,
} from "./types";
import { CANVAS_H, CANVAS_W, HERO_H, HERO_W } from "./types";
import { makeEnemy, pickThreeUpgrades, WAVES } from "./data";
import { drawBackground, drawBullet, drawEnemy, drawHero } from "./render";

const BASE_XP_TO_LEVEL = 60;

export interface GameHud {
  wave: number;
  maxWave: number;
  hp: number;
  maxHp: number;
  score: number;
  level: number;
  xp: number;
  xpToLevel: number;
}

export interface GameHooks {
  onStatus(s: GameStatus, options?: UpgradeOption[]): void;
  onHud(h: GameHud): void;
}

export class Game {
  private ctx: CanvasRenderingContext2D;
  private hero!: Hero;
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private keys = { left: false, right: false, fire: false };
  private score = 0;
  private level = 1;
  private xp = 0;
  private xpToLevel = BASE_XP_TO_LEVEL;
  private waveIdx = 0;
  private spawnedInWave = { skua: 0, seal: 0, orca: 0 };
  private spawnTimer = 0;
  private status: GameStatus = "playing";
  private lastTime = 0;
  private rafId = 0;
  private hooks: GameHooks;

  constructor(canvas: HTMLCanvasElement, hooks: GameHooks) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d missing");
    this.ctx = ctx;
    this.hooks = hooks;
    this.resetHero();
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
    this.score = 0;
    this.level = 1;
    this.xp = 0;
    this.xpToLevel = BASE_XP_TO_LEVEL;
    this.waveIdx = 0;
    this.enemies = [];
    this.bullets = [];
    this.spawnedInWave = { skua: 0, seal: 0, orca: 0 };
    this.spawnTimer = 0;
    this.resetHero();
    this.status = "playing";
    this.hooks.onStatus("playing");
    this.emitHud();
  }

  applyUpgrade(opt: UpgradeOption): void {
    opt.apply(this.hero);
    this.status = "playing";
    this.hooks.onStatus("playing");
    this.emitHud();
  }

  startNextWave(): void {
    if (this.waveIdx >= WAVES.length - 1) {
      this.status = "win";
      this.hooks.onStatus("win");
      return;
    }
    this.waveIdx++;
    this.spawnedInWave = { skua: 0, seal: 0, orca: 0 };
    this.spawnTimer = 0;
    this.hero.hp = Math.min(this.hero.maxHp, this.hero.hp + 20);
    this.status = "playing";
    this.hooks.onStatus("playing");
    this.emitHud();
  }

  private resetHero(): void {
    this.hero = {
      x: CANVAS_W / 2 - HERO_W / 2,
      y: CANVAS_H - HERO_H - 12,
      w: HERO_W,
      h: HERO_H,
      hp: 100,
      maxHp: 100,
      speed: 3.2,
      damage: 1,
      multiShot: 1,
      fireIntervalMs: 320,
      fireTimer: 0,
      invulnerableMs: 0,
    };
  }

  private emitHud(): void {
    this.hooks.onHud({
      wave: this.waveIdx + 1,
      maxWave: WAVES.length,
      hp: Math.max(0, Math.round(this.hero.hp)),
      maxHp: this.hero.maxHp,
      score: this.score,
      level: this.level,
      xp: this.xp,
      xpToLevel: this.xpToLevel,
    });
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    const k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") this.keys.left = true;
    else if (k === "ArrowRight" || k === "d" || k === "D") this.keys.right = true;
    else if (k === " " || k === "Enter") this.keys.fire = true;
    else return;
    e.preventDefault();
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    const k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") this.keys.left = false;
    else if (k === "ArrowRight" || k === "d" || k === "D") this.keys.right = false;
    else if (k === " " || k === "Enter") this.keys.fire = false;
  };

  private bindKeys(): void {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  private tick(time: number): void {
    const dt = this.lastTime === 0 ? 16 : Math.min(40, time - this.lastTime);
    this.lastTime = time;
    if (this.status === "playing") this.update(dt);
    drawBackground(this.ctx, time);
    for (const e of this.enemies) drawEnemy(this.ctx, e, time);
    for (const b of this.bullets) drawBullet(this.ctx, b);
    drawHero(this.ctx, this.hero, time);
    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }

  private update(dt: number): void {
    this.moveHero();
    this.fireIfNeeded(dt);
    this.moveBullets();
    this.spawnWave(dt);
    this.moveEnemies();
    this.collideBullets();
    this.collideHero(dt);
    this.cleanup();
    this.checkWaveEnd();
  }

  private moveHero(): void {
    const h = this.hero;
    if (this.keys.left) h.x -= h.speed;
    if (this.keys.right) h.x += h.speed;
    if (h.x < 0) h.x = 0;
    if (h.x + h.w > CANVAS_W) h.x = CANVAS_W - h.w;
  }

  private fireIfNeeded(dt: number): void {
    const h = this.hero;
    h.fireTimer -= dt;
    if (!this.keys.fire || h.fireTimer > 0) return;
    h.fireTimer = h.fireIntervalMs;
    const spread = 8;
    const n = h.multiShot;
    for (let i = 0; i < n; i++) {
      const offset = n === 1 ? 0 : (i - (n - 1) / 2) * spread;
      this.bullets.push({
        x: h.x + h.w / 2 - 3 + offset,
        y: h.y - 4,
        w: 6,
        h: 8,
        vy: -6,
        damage: h.damage,
        pierce: 0,
        hit: new Set<Enemy>(),
      });
    }
  }

  private moveBullets(): void {
    for (const b of this.bullets) b.y += b.vy;
    this.bullets = this.bullets.filter((b) => b.y + b.h > 0);
  }

  private spawnWave(dt: number): void {
    const wave = WAVES[this.waveIdx];
    const sp = this.spawnedInWave;
    const remaining =
      wave.skua - sp.skua + (wave.seal - sp.seal) + (wave.orca - sp.orca);
    if (remaining <= 0) return;
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    this.spawnTimer = wave.spawnRateMs;
    const pool: EnemyKind[] = [];
    if (sp.skua < wave.skua) for (let i = 0; i < 3; i++) pool.push("skua");
    if (sp.seal < wave.seal) for (let i = 0; i < 2; i++) pool.push("seal");
    if (sp.orca < wave.orca) pool.push("orca");
    const kind = pool[Math.floor(Math.random() * pool.length)];
    const x = 20 + Math.random() * (CANVAS_W - 60);
    this.enemies.push(makeEnemy(kind, x, wave.baseSpeed));
    sp[kind]++;
  }

  private moveEnemies(): void {
    for (const e of this.enemies) {
      e.y += e.vy;
      if (e.kind === "skua") {
        e.zigPhase += 0.06;
        e.x += Math.sin(e.zigPhase) * 1.2;
      }
      if (e.x < 0) e.x = 0;
      if (e.x + e.w > CANVAS_W) e.x = CANVAS_W - e.w;
    }
  }

  private collideBullets(): void {
    for (const b of this.bullets) {
      for (const e of this.enemies) {
        if (b.hit.has(e)) continue;
        if (
          b.x + b.w > e.x &&
          b.x < e.x + e.w &&
          b.y + b.h > e.y &&
          b.y < e.y + e.h
        ) {
          e.hp -= b.damage;
          b.hit.add(e);
          if (b.pierce <= 0) b.y = -999;
          else b.pierce -= 1;
          if (e.hp <= 0) this.killEnemy(e);
          break;
        }
      }
    }
  }

  private killEnemy(e: Enemy): void {
    this.score += e.scoreValue;
    this.xp += e.xpValue;
    e.hp = 0;
    while (this.xp >= this.xpToLevel) {
      this.xp -= this.xpToLevel;
      this.level++;
      this.xpToLevel = Math.round(this.xpToLevel * 1.25);
      this.triggerLevelUp();
    }
    this.emitHud();
  }

  private triggerLevelUp(): void {
    this.status = "levelUp";
    const opts = pickThreeUpgrades();
    this.hooks.onStatus("levelUp", opts);
  }

  private collideHero(dt: number): void {
    const h = this.hero;
    h.invulnerableMs = Math.max(0, h.invulnerableMs - dt);
    if (h.invulnerableMs > 0) return;
    for (const e of this.enemies) {
      if (e.hp <= 0) continue;
      if (
        h.x + h.w > e.x &&
        h.x < e.x + e.w &&
        h.y + h.h > e.y &&
        h.y < e.y + e.h
      ) {
        h.hp -= e.kind === "orca" ? 30 : e.kind === "seal" ? 18 : 10;
        h.invulnerableMs = 800;
        e.hp = 0;
        if (h.hp <= 0) {
          this.status = "gameover";
          this.hooks.onStatus("gameover");
        }
        this.emitHud();
        break;
      }
      if (e.y + e.h > CANVAS_H - 4) {
        h.hp -= 12;
        e.hp = 0;
        if (h.hp <= 0) {
          this.status = "gameover";
          this.hooks.onStatus("gameover");
        }
        this.emitHud();
      }
    }
  }

  private cleanup(): void {
    this.enemies = this.enemies.filter((e) => e.hp > 0 && e.y < CANVAS_H + 40);
  }

  private checkWaveEnd(): void {
    const wave = WAVES[this.waveIdx];
    const sp = this.spawnedInWave;
    const allSpawned =
      sp.skua >= wave.skua && sp.seal >= wave.seal && sp.orca >= wave.orca;
    if (allSpawned && this.enemies.length === 0 && this.status === "playing") {
      if (this.waveIdx >= WAVES.length - 1) {
        this.status = "win";
        this.hooks.onStatus("win");
      } else {
        this.status = "waveDone";
        this.hooks.onStatus("waveDone");
      }
    }
  }
}
