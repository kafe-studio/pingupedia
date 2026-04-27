import type {
  Bullet,
  Enemy,
  EnemyKind,
  EnemyProjectile,
  GameStatus,
  Hero,
  PowerUp,
} from "./types";
import { CANVAS_H, CANVAS_W, HERO_H, HERO_W } from "./types";
import { makeEnemy, randomPowerUpKind, UPGRADES, WAVES } from "./data";
import {
  drawBackground,
  drawBoss,
  drawBullet,
  drawEnemy,
  drawEnemyProjectile,
  drawHero,
  drawPowerUp,
} from "./render";

// Chance that a dead enemy drops a power-up container.
const DROP_CHANCE: Record<EnemyKind, number> = {
  skua: 0.08,
  seal: 0.22,
  leopard: 0.3,
  petrel: 0.25,
  orca: 0.55,
  boss: 0,
};

export interface GameHud {
  wave: number;
  maxWave: number;
  hp: number;
  maxHp: number;
  score: number;
  level: number;
  xp: number;
  xpToLevel: number;
  isBossWave: boolean;
  bossHpRatio: number;
}

export interface GameHooks {
  onStatus(_s: GameStatus): void;
  onHud(_h: GameHud): void;
}

export class Game {
  private ctx: CanvasRenderingContext2D;
  private hero!: Hero;
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private enemyProjectiles: EnemyProjectile[] = [];
  private powerUps: PowerUp[] = [];
  private keys = { left: false, right: false, fire: false };
  private score = 0;
  private level = 1;
  private xp = 0;
  private xpToLevel = 60;
  private waveIdx = 0;
  private spawnedInWave: Record<EnemyKind, number> = {
    skua: 0, seal: 0, leopard: 0, petrel: 0, orca: 0, boss: 0,
  };
  private spawnTimer = 0;
  private waveTransitionTimer = 0;
  private status: GameStatus = "playing";
  private lastTime = 0;
  private rafId = 0;
  private disposed = false;
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
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  restart(): void {
    this.score = 0;
    this.level = 1;
    this.xp = 0;
    this.xpToLevel = 60;
    this.waveIdx = 0;
    this.enemies = [];
    this.bullets = [];
    this.enemyProjectiles = [];
    this.powerUps = [];
    this.spawnedInWave = { skua: 0, seal: 0, leopard: 0, petrel: 0, orca: 0, boss: 0 };
    this.spawnTimer = 0;
    this.waveTransitionTimer = 0;
    this.resetHero();
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
      speed: 3.4,
      damage: 1,
      multiShot: 1,
      fireIntervalMs: 320,
      fireTimer: 0,
      invulnerableMs: 0,
      pickupFlashMs: 0,
    };
  }

  private emitHud(): void {
    const boss = this.enemies.find((e) => e.kind === "boss");
    this.hooks.onHud({
      wave: this.waveIdx + 1,
      maxWave: WAVES.length,
      hp: Math.max(0, Math.round(this.hero.hp)),
      maxHp: this.hero.maxHp,
      score: this.score,
      level: this.level,
      xp: this.xp,
      xpToLevel: this.xpToLevel,
      isBossWave: this.waveIdx === WAVES.length - 1,
      bossHpRatio: boss ? boss.hp / boss.maxHp : 0,
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
    if (this.disposed) return;
    const dt = this.lastTime === 0 ? 16 : Math.min(40, time - this.lastTime);
    this.lastTime = time;
    if (this.status === "playing") this.update(dt);
    drawBackground(this.ctx, time);
    for (const p of this.powerUps) drawPowerUp(this.ctx, p, time);
    for (const e of this.enemies) {
      if (e.kind === "boss") drawBoss(this.ctx, e, time);
      else drawEnemy(this.ctx, e, time);
    }
    for (const b of this.bullets) drawBullet(this.ctx, b);
    for (const p of this.enemyProjectiles) drawEnemyProjectile(this.ctx, p, time);
    drawHero(this.ctx, this.hero, time);
    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }

  private update(dt: number): void {
    this.moveHero();
    this.fireIfNeeded(dt);
    this.moveBullets();
    this.spawnWave(dt);
    this.moveEnemies(dt);
    this.movePowerUps();
    this.moveEnemyProjectiles();
    this.collideBullets();
    this.collideHero(dt);
    this.collectPowerUps();
    this.collideEnemyProjectiles();
    this.cleanup();
    this.checkWaveEnd(dt);
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
        h: 10,
        vy: -7,
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
      (wave.skua - sp.skua) +
      (wave.seal - sp.seal) +
      (wave.leopard - sp.leopard) +
      (wave.petrel - sp.petrel) +
      (wave.orca - sp.orca) +
      (wave.boss - sp.boss);
    if (remaining <= 0) return;
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    this.spawnTimer = wave.spawnRateMs;
    // Boss spawns centered with custom logic.
    if (sp.boss < wave.boss) {
      const boss = makeEnemy("boss", CANVAS_W / 2 - 90, 1.0);
      boss.y = -boss.h;
      this.enemies.push(boss);
      sp.boss++;
      return;
    }
    const pool: EnemyKind[] = [];
    if (sp.skua < wave.skua) for (let i = 0; i < 3; i++) pool.push("skua");
    if (sp.seal < wave.seal) for (let i = 0; i < 2; i++) pool.push("seal");
    if (sp.leopard < wave.leopard) for (let i = 0; i < 2; i++) pool.push("leopard");
    if (sp.petrel < wave.petrel) for (let i = 0; i < 2; i++) pool.push("petrel");
    if (sp.orca < wave.orca) pool.push("orca");
    if (pool.length === 0) return;
    const kind = pool[Math.floor(Math.random() * pool.length)];
    const x = 20 + Math.random() * (CANVAS_W - 60);
    this.enemies.push(makeEnemy(kind, x, wave.baseSpeed));
    sp[kind]++;
  }

  private moveEnemies(dt: number): void {
    for (const e of this.enemies) {
      if (e.kind === "boss") {
        this.updateBoss(e, dt);
        continue;
      }
      e.y += e.vy;
      if (e.kind === "skua") {
        e.zigPhase += 0.06;
        e.x += Math.sin(e.zigPhase) * 1.2;
      } else if (e.kind === "leopard") {
        e.zigPhase += 0.09;
        e.x += Math.sin(e.zigPhase) * 2.2;
      } else if (e.kind === "petrel") {
        e.zigPhase += 0.05;
        e.x += Math.sin(e.zigPhase) * 1.6;
        e.fireTimer -= dt;
        if (e.fireTimer <= 0 && e.y > 30 && e.y < CANVAS_H - 200) {
          e.fireTimer = 1600 + Math.random() * 800;
          this.enemyProjectiles.push({
            x: e.x + e.w / 2 - 3,
            y: e.y + e.h,
            w: 6, h: 8,
            vx: 0, vy: 3.2,
            damage: 8,
            kind: "ice",
          });
        }
      }
      if (e.x < 0) e.x = 0;
      if (e.x + e.w > CANVAS_W) e.x = CANVAS_W - e.w;
    }
  }

  // Boss has 3 phases: descend, strafe+shoot, spawn minions.
  private updateBoss(b: Enemy, dt: number): void {
    b.phaseTimer += dt;
    if (b.phase === 0) {
      // Descend to y=60, then start fighting.
      b.y += 0.6;
      if (b.y >= 60) {
        b.y = 60;
        b.phase = 1;
        b.phaseTimer = 0;
      }
      return;
    }
    // Strafing.
    b.zigPhase += 0.012;
    b.x = CANVAS_W / 2 - b.w / 2 + Math.sin(b.zigPhase) * 100;
    // Fire pattern every 1.6s.
    b.fireTimer -= dt;
    if (b.fireTimer <= 0) {
      b.fireTimer = 1800;
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h;
      // 3-way spread of water jets.
      for (let i = -1; i <= 1; i++) {
        this.enemyProjectiles.push({
          x: cx - 4, y: cy,
          w: 8, h: 12,
          vx: i * 1.6, vy: 3,
          damage: 12,
          kind: "water",
        });
      }
    }
    // Every 6s, phase toggle (spawns 2 skuas from sides).
    if (b.phaseTimer > 6000) {
      b.phaseTimer = 0;
      const left = makeEnemy("skua", 20, 1.2);
      left.y = b.y + b.h / 2;
      this.enemies.push(left);
      const right = makeEnemy("skua", CANVAS_W - 40, 1.2);
      right.y = b.y + b.h / 2;
      this.enemies.push(right);
    }
  }

  private movePowerUps(): void {
    for (const p of this.powerUps) {
      p.y += p.vy;
      p.bobPhase += 0.08;
    }
  }

  private moveEnemyProjectiles(): void {
    for (const p of this.enemyProjectiles) {
      p.x += p.vx;
      p.y += p.vy;
    }
    this.enemyProjectiles = this.enemyProjectiles.filter(
      (p) => p.y < CANVAS_H + 20 && p.x > -20 && p.x < CANVAS_W + 20,
    );
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
    }
    // Possible power-up drop.
    if (Math.random() < DROP_CHANCE[e.kind]) {
      this.powerUps.push({
        kind: randomPowerUpKind(),
        x: e.x + e.w / 2 - 11,
        y: e.y + e.h / 2 - 11,
        w: 22,
        h: 22,
        vy: 1.2,
        bobPhase: Math.random() * Math.PI * 2,
      });
    }
    this.emitHud();
  }

  private collideHero(dt: number): void {
    const h = this.hero;
    h.invulnerableMs = Math.max(0, h.invulnerableMs - dt);
    h.pickupFlashMs = Math.max(0, h.pickupFlashMs - dt);
    if (h.invulnerableMs > 0) return;
    for (const e of this.enemies) {
      if (e.hp <= 0 || e.kind === "boss") continue;
      if (
        h.x + h.w > e.x &&
        h.x < e.x + e.w &&
        h.y + h.h > e.y &&
        h.y < e.y + e.h
      ) {
        h.hp -=
          e.kind === "orca" ? 30 :
          e.kind === "leopard" ? 22 :
          e.kind === "seal" ? 18 :
          e.kind === "petrel" ? 12 : 10;
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

  private collectPowerUps(): void {
    const h = this.hero;
    this.powerUps = this.powerUps.filter((p) => {
      const collected =
        h.x + h.w > p.x &&
        h.x < p.x + p.w &&
        h.y + h.h > p.y &&
        h.y < p.y + p.h;
      if (collected) {
        UPGRADES[p.kind].apply(h);
        h.pickupFlashMs = 400;
        this.emitHud();
        return false;
      }
      return p.y < CANVAS_H + 20;
    });
  }

  private collideEnemyProjectiles(): void {
    const h = this.hero;
    if (h.invulnerableMs > 0) {
      this.enemyProjectiles = this.enemyProjectiles.filter(
        (p) =>
          !(
            h.x + h.w > p.x &&
            h.x < p.x + p.w &&
            h.y + h.h > p.y &&
            h.y < p.y + p.h
          ),
      );
      return;
    }
    this.enemyProjectiles = this.enemyProjectiles.filter((p) => {
      const hit =
        h.x + h.w > p.x &&
        h.x < p.x + p.w &&
        h.y + h.h > p.y &&
        h.y < p.y + p.h;
      if (hit) {
        h.hp -= p.damage;
        h.invulnerableMs = 500;
        if (h.hp <= 0) {
          this.status = "gameover";
          this.hooks.onStatus("gameover");
        }
        this.emitHud();
        return false;
      }
      return true;
    });
  }

  private cleanup(): void {
    this.enemies = this.enemies.filter((e) => e.hp > 0 && e.y < CANVAS_H + 40);
  }

  private checkWaveEnd(dt: number): void {
    if (this.status !== "playing") return;
    const wave = WAVES[this.waveIdx];
    const sp = this.spawnedInWave;
    const allSpawned =
      sp.skua >= wave.skua &&
      sp.seal >= wave.seal &&
      sp.leopard >= wave.leopard &&
      sp.petrel >= wave.petrel &&
      sp.orca >= wave.orca &&
      sp.boss >= wave.boss;
    if (!allSpawned || this.enemies.length > 0) return;
    // Final wave cleared.
    if (this.waveIdx >= WAVES.length - 1) {
      this.status = "win";
      this.hooks.onStatus("win");
      return;
    }
    // Delay before next wave starts (no dialog — automatic continuation).
    this.waveTransitionTimer += dt;
    if (this.waveTransitionTimer >= 1200) {
      this.waveTransitionTimer = 0;
      this.waveIdx++;
      this.spawnedInWave = { skua: 0, seal: 0, leopard: 0, petrel: 0, orca: 0, boss: 0 };
      this.spawnTimer = 0;
      this.hero.hp = Math.min(this.hero.maxHp, this.hero.hp + 15);
      this.emitHud();
    }
  }
}
