// Mini-hry spouštěné po sebrání klíče a vstupu do zamčených dveří.
// Každá je samostatná smyčka na canvas overlay; po skončení vrátí skóre.

import type { MinigameKind } from "./types";

export interface MinigameOptions {
  canvas: HTMLCanvasElement;
  kind: MinigameKind;
  onFinish(_score: number, _label: string): void;
  onClose(): void;
}

export interface MinigameInstance {
  destroy(): void;
}

const VW = 480;
const VH = 320;

interface InputState {
  left: boolean;
  right: boolean;
  action: boolean;
}

function setupCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("ctx missing");
  canvas.width = VW * 2;
  canvas.height = VH * 2;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.scale(2, 2);
  return ctx;
}

function bindInputs(canvas: HTMLCanvasElement): { input: InputState; destroy: () => void } {
  const input: InputState = { left: false, right: false, action: false };
  const onKeyDown = (e: KeyboardEvent) => {
    const k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") input.left = true;
    else if (k === "ArrowRight" || k === "d" || k === "D") input.right = true;
    else if (k === " " || k === "Enter") input.action = true;
    else return;
    e.preventDefault();
  };
  const onKeyUp = (e: KeyboardEvent) => {
    const k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") input.left = false;
    else if (k === "ArrowRight" || k === "d" || k === "D") input.right = false;
    else if (k === " " || k === "Enter") input.action = false;
  };
  const onPointer = (e: PointerEvent) => {
    e.preventDefault();
    input.action = true;
    setTimeout(() => { input.action = false; }, 80);
  };
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  canvas.addEventListener("pointerdown", onPointer);
  return {
    input,
    destroy() {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointerdown", onPointer);
    },
  };
}

// =====================  SKI (lyžování)  =====================
function runSki(opts: MinigameOptions): MinigameInstance {
  const ctx = setupCanvas(opts.canvas);
  const { input, destroy: destroyInput } = bindInputs(opts.canvas);
  let raf = 0;
  let last = 0;
  const startTime = performance.now();
  const DURATION_MS = 30_000;
  const player = { x: VW / 2, y: VH - 50 };
  let scrollY = 0;
  let speed = 2.5;
  type Obstacle = { kind: "tree" | "flag"; x: number; y: number };
  const obstacles: Obstacle[] = [];
  let score = 0;
  let lives = 3;
  let nextSpawn = 0;
  let finished = false;

  function spawn(): void {
    const isFlag = Math.random() < 0.45;
    obstacles.push({
      kind: isFlag ? "flag" : "tree",
      x: 30 + Math.random() * (VW - 60),
      y: -20,
    });
  }

  function draw(): void {
    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, VH);
    sky.addColorStop(0, "#bae6fd");
    sky.addColorStop(0.6, "#e0f2fe");
    sky.addColorStop(1, "#f0f9ff");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VW, VH);
    // Snow lines (parallax)
    ctx.strokeStyle = "rgba(148,163,184,0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const y = ((i * 50 + scrollY * 0.7) % VH);
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(VW, y);
      ctx.stroke();
    }
    // Sun
    ctx.fillStyle = "#fde047";
    ctx.beginPath();
    ctx.arc(VW - 50, 40, 18, 0, Math.PI * 2);
    ctx.fill();
    // Obstacles
    for (const o of obstacles) {
      if (o.kind === "tree") {
        ctx.fillStyle = "#15803d";
        ctx.beginPath();
        ctx.moveTo(o.x, o.y - 20);
        ctx.lineTo(o.x - 12, o.y + 8);
        ctx.lineTo(o.x + 12, o.y + 8);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#166534";
        ctx.beginPath();
        ctx.moveTo(o.x, o.y - 14);
        ctx.lineTo(o.x - 9, o.y + 4);
        ctx.lineTo(o.x + 9, o.y + 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#78350f";
        ctx.fillRect(o.x - 1.5, o.y + 8, 3, 4);
      } else {
        // Flag
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(o.x - 0.5, o.y - 14, 1, 18);
        ctx.fillStyle = "#3b82f6";
        ctx.beginPath();
        ctx.moveTo(o.x, o.y - 14);
        ctx.lineTo(o.x + 12, o.y - 10);
        ctx.lineTo(o.x, o.y - 6);
        ctx.closePath();
        ctx.fill();
      }
    }
    // Player (Pingu)
    const px = player.x;
    const py = player.y;
    ctx.fillStyle = "#0a0f1f";
    ctx.beginPath();
    ctx.ellipse(px, py - 5, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(px, py - 2, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(px - 3, py - 10, 2.5, 0, Math.PI * 2);
    ctx.arc(px + 3, py - 10, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0a0f1f";
    ctx.beginPath();
    ctx.arc(px - 3, py - 10, 1.2, 0, Math.PI * 2);
    ctx.arc(px + 3, py - 10, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fb923c";
    ctx.beginPath();
    ctx.moveTo(px - 1.5, py - 6); ctx.lineTo(px + 4, py - 4); ctx.lineTo(px - 1.5, py - 4);
    ctx.fill();
    // Skis
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(px - 14, py + 8, 28, 2);
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(px - 14, py + 11, 28, 1);

    // HUD
    const t = Math.max(0, Math.ceil((DURATION_MS - (performance.now() - startTime)) / 1000));
    ctx.fillStyle = "rgba(15,23,42,0.7)";
    ctx.fillRect(0, 0, VW, 24);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px system-ui, sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(`🚩 ${score}`, 8, 12);
    ctx.textAlign = "center";
    ctx.fillText(`⏱ ${t}s`, VW / 2, 12);
    ctx.textAlign = "right";
    ctx.fillText(`❤ ${lives}`, VW - 8, 12);
  }

  function tick(time: number): void {
    if (finished) return;
    const dt = last === 0 ? 16 : Math.min(40, time - last);
    last = time;
    const elapsed = performance.now() - startTime;
    if (elapsed > DURATION_MS || lives <= 0) {
      finished = true;
      opts.onFinish(score, `🚩 ${score} vlajek za 30 s`);
      return;
    }
    // Input
    if (input.left) player.x -= 4;
    if (input.right) player.x += 4;
    player.x = Math.max(20, Math.min(VW - 20, player.x));
    // Speed grows with time
    speed = 2.5 + (elapsed / DURATION_MS) * 3;
    scrollY += speed;
    // Move obstacles
    for (const o of obstacles) o.y += speed;
    // Spawn
    nextSpawn -= dt;
    if (nextSpawn <= 0) {
      spawn();
      nextSpawn = 350 - Math.min(150, elapsed / 100);
    }
    // Cleanup + collide
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i];
      if (o.y > VH + 30) { obstacles.splice(i, 1); continue; }
      // Collision (within 16 px)
      if (Math.abs(o.x - player.x) < 14 && Math.abs(o.y - player.y) < 14) {
        if (o.kind === "flag") { score++; obstacles.splice(i, 1); }
        else { lives--; obstacles.splice(i, 1); }
      }
    }
    draw();
    raf = requestAnimationFrame(tick);
  }

  raf = requestAnimationFrame(tick);
  return {
    destroy() {
      finished = true;
      cancelAnimationFrame(raf);
      destroyInput();
    },
  };
}

// =====================  HOCKEY (penalty shootout)  =====================
function runHockey(opts: MinigameOptions): MinigameInstance {
  const ctx = setupCanvas(opts.canvas);
  const { input, destroy: destroyInput } = bindInputs(opts.canvas);
  let raf = 0;
  let last = 0;
  let goals = 0;
  let attempts = 0;
  const TOTAL = 5;
  let phase: "aim" | "shooting" | "result" | "done" = "aim";
  let aim = 0; // -1..1
  let aimDir = 1;
  let result = "";
  let resultUntil = 0;
  let puck = { x: 0, y: 0, vx: 0, vy: 0 };
  let actionLatch = false;
  let finished = false;

  function startShoot(): void {
    phase = "shooting";
    puck = { x: VW / 2, y: VH - 60, vx: aim * 9, vy: -7 };
  }

  function draw(): void {
    // Ice rink
    const sky = ctx.createLinearGradient(0, 0, 0, VH);
    sky.addColorStop(0, "#bfdbfe");
    sky.addColorStop(1, "#dbeafe");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VW, VH);
    // Goal frame
    const gx = VW / 2 - 60, gy = 30, gw = 120, gh = 60;
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 4;
    ctx.strokeRect(gx, gy, gw, gh);
    // Net pattern
    ctx.strokeStyle = "rgba(220, 38, 38, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo(gx + (gw / 8) * i, gy);
      ctx.lineTo(gx + (gw / 8) * i, gy + gh);
      ctx.stroke();
    }
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(gx, gy + (gh / 4) * i);
      ctx.lineTo(gx + gw, gy + (gh / 4) * i);
      ctx.stroke();
    }
    // Goalie (dark blob)
    const goalieX = gx + gw / 2 + Math.sin(performance.now() / 250) * 35;
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.ellipse(goalieX, gy + gh - 20, 16, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(goalieX - 8, gy + gh - 32, 16, 4);
    // Player + stick
    const pxP = VW / 2;
    const pyP = VH - 50;
    ctx.fillStyle = "#0a0f1f";
    ctx.beginPath();
    ctx.ellipse(pxP, pyP, 12, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(pxP - 3, pyP - 6, 2.5, 0, Math.PI * 2);
    ctx.arc(pxP + 3, pyP - 6, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0a0f1f";
    ctx.beginPath();
    ctx.arc(pxP - 3, pyP - 6, 1.2, 0, Math.PI * 2);
    ctx.arc(pxP + 3, pyP - 6, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#78350f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pxP + 8, pyP);
    ctx.lineTo(pxP + 22, pyP + 12);
    ctx.stroke();
    // Aim arrow
    if (phase === "aim") {
      ctx.strokeStyle = "#1d4ed8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(pxP, pyP - 18);
      ctx.lineTo(pxP + aim * 50, pyP - 60);
      ctx.stroke();
      // Arrow head
      ctx.fillStyle = "#1d4ed8";
      ctx.beginPath();
      ctx.arc(pxP + aim * 50, pyP - 60, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    // Puck
    if (phase === "shooting" || phase === "result") {
      ctx.fillStyle = "#0a0f1f";
      ctx.beginPath();
      ctx.arc(puck.x, puck.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    // HUD
    ctx.fillStyle = "rgba(15,23,42,0.7)";
    ctx.fillRect(0, 0, VW, 24);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px system-ui, sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(`🥅 ${goals} / ${TOTAL}`, 8, 12);
    ctx.textAlign = "right";
    ctx.fillText(`Pokus ${attempts}/${TOTAL}`, VW - 8, 12);
    if (phase === "aim") {
      ctx.textAlign = "center";
      ctx.fillText("Mezera = vystřel ve směru šipky", VW / 2, 12);
    }
    // Result message
    if (phase === "result" && performance.now() < resultUntil) {
      ctx.fillStyle = result.includes("GÓL") ? "#22c55e" : "#ef4444";
      ctx.font = "bold 32px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(result, VW / 2, VH / 2);
    }
  }

  function tick(time: number): void {
    if (finished) return;
    const dt = last === 0 ? 16 : Math.min(40, time - last);
    last = time;
    if (phase === "aim") {
      aim += aimDir * 0.018 * (dt / 16);
      if (aim > 1) { aim = 1; aimDir = -1; }
      if (aim < -1) { aim = -1; aimDir = 1; }
      if (input.action && !actionLatch) {
        actionLatch = true;
        startShoot();
      }
    } else if (phase === "shooting") {
      puck.x += puck.vx;
      puck.y += puck.vy;
      const gx = VW / 2 - 60, gy = 30, gw = 120, gh = 60;
      const goalieX = gx + gw / 2 + Math.sin((time - 200) / 250) * 35;
      if (puck.y < gy + gh) {
        // Inside goal area
        if (puck.x > gx && puck.x < gx + gw) {
          if (Math.abs(puck.x - goalieX) < 16) {
            result = "ZÁSAH BRANKÁŘE!";
          } else {
            result = "GÓL!";
            goals++;
          }
        } else {
          result = "VEDLE!";
        }
        attempts++;
        phase = "result";
        resultUntil = performance.now() + 1200;
      } else if (puck.x < 0 || puck.x > VW || puck.y > VH) {
        result = "VEDLE!";
        attempts++;
        phase = "result";
        resultUntil = performance.now() + 1200;
      }
    } else if (phase === "result") {
      if (performance.now() >= resultUntil) {
        actionLatch = false;
        if (attempts >= TOTAL) {
          finished = true;
          phase = "done";
          opts.onFinish(goals, `🥅 ${goals} / ${TOTAL} gólů`);
          return;
        }
        phase = "aim";
        aim = 0;
        aimDir = 1;
      }
    }
    if (!input.action) actionLatch = false;
    draw();
    raf = requestAnimationFrame(tick);
  }

  raf = requestAnimationFrame(tick);
  return {
    destroy() {
      finished = true;
      cancelAnimationFrame(raf);
      destroyInput();
    },
  };
}

// =====================  JUMP (skok do dálky)  =====================
function runJump(opts: MinigameOptions): MinigameInstance {
  const ctx = setupCanvas(opts.canvas);
  const { input, destroy: destroyInput } = bindInputs(opts.canvas);
  let raf = 0;
  let last = 0;
  type Phase = "power" | "angle" | "fly" | "result" | "done";
  let phase: Phase = "power";
  let attempt = 0;
  const TOTAL = 3;
  let bestDist = 0;
  let totalDist = 0;
  let power = 0;
  let powerDir = 1;
  let angle = 0;
  let angleDir = 1;
  let pgo: { x: number; y: number; vx: number; vy: number } = { x: 60, y: VH - 80, vx: 0, vy: 0 };
  let landDist = 0;
  let actionLatch = false;
  let resultUntil = 0;
  let finished = false;

  function draw(): void {
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, VH);
    sky.addColorStop(0, "#fde68a");
    sky.addColorStop(1, "#bae6fd");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VW, VH);
    // Mountains
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.moveTo(0, VH - 60);
    ctx.lineTo(80, VH - 110);
    ctx.lineTo(180, VH - 80);
    ctx.lineTo(280, VH - 120);
    ctx.lineTo(VW, VH - 70);
    ctx.lineTo(VW, VH);
    ctx.lineTo(0, VH);
    ctx.closePath();
    ctx.fill();
    // Snow ground
    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(0, VH - 50, VW, 50);
    // Ramp (left)
    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.moveTo(0, VH - 80);
    ctx.lineTo(80, VH - 50);
    ctx.lineTo(0, VH - 50);
    ctx.closePath();
    ctx.fill();
    // Distance markers
    for (let m = 50; m <= 400; m += 50) {
      const x = 80 + m * 0.7;
      if (x > VW) break;
      ctx.strokeStyle = "rgba(15,23,42,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, VH - 50);
      ctx.lineTo(x, VH - 44);
      ctx.stroke();
      ctx.fillStyle = "rgba(15,23,42,0.6)";
      ctx.font = "9px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(`${m}m`, x, VH - 33);
    }
    // Player
    const cx = pgo.x;
    const cy = pgo.y;
    ctx.fillStyle = "#0a0f1f";
    ctx.beginPath();
    ctx.ellipse(cx, cy, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 1, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 6, 2.5, 0, Math.PI * 2);
    ctx.arc(cx + 3, cy - 6, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0a0f1f";
    ctx.beginPath();
    ctx.arc(cx - 2, cy - 6, 1.2, 0, Math.PI * 2);
    ctx.arc(cx + 4, cy - 6, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(cx - 14, cy + 8, 30, 2);
    // Power meter
    if (phase === "power") {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(20, VH - 130, 240, 20);
      ctx.fillStyle = "#22c55e";
      if (power > 0.6) ctx.fillStyle = "#fbbf24";
      if (power > 0.85) ctx.fillStyle = "#ef4444";
      ctx.fillRect(20, VH - 130, 240 * power, 20);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(20, VH - 130, 240, 20);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px system-ui";
      ctx.textAlign = "left";
      ctx.fillText("Síla: mezera = potvrď", 20, VH - 138);
    } else if (phase === "angle") {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(20, VH - 130, 240, 20);
      ctx.fillStyle = "#3b82f6";
      // Sweet spot 0.45..0.55
      ctx.fillStyle = "rgba(34,197,94,0.4)";
      ctx.fillRect(20 + 240 * 0.45, VH - 130, 240 * 0.1, 20);
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(20 + 240 * angle - 2, VH - 132, 4, 24);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(20, VH - 130, 240, 20);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px system-ui";
      ctx.textAlign = "left";
      ctx.fillText("Úhel: zastav v zelené zóně", 20, VH - 138);
    }
    // HUD
    ctx.fillStyle = "rgba(15,23,42,0.7)";
    ctx.fillRect(0, 0, VW, 24);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px system-ui";
    ctx.textAlign = "left";
    ctx.fillText(`Pokus ${attempt}/${TOTAL}`, 8, 12);
    ctx.textAlign = "right";
    ctx.fillText(`Nejlepší: ${bestDist} m`, VW - 8, 12);
    // Result text
    if (phase === "result" && performance.now() < resultUntil) {
      ctx.fillStyle = "#22c55e";
      ctx.font = "bold 28px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(`${landDist} m`, VW / 2, VH / 2 - 30);
    }
  }

  function startNewAttempt(): void {
    attempt++;
    phase = "power";
    power = 0;
    powerDir = 1;
    angle = 0.5;
    angleDir = 1;
    pgo = { x: 60, y: VH - 80, vx: 0, vy: 0 };
  }

  startNewAttempt();

  function tick(time: number): void {
    if (finished) return;
    const dt = last === 0 ? 16 : Math.min(40, time - last);
    last = time;
    const step = dt / 16;
    if (phase === "power") {
      power += powerDir * 0.025 * step;
      if (power >= 1) { power = 1; powerDir = -1; }
      if (power <= 0) { power = 0; powerDir = 1; }
      if (input.action && !actionLatch) {
        actionLatch = true;
        phase = "angle";
        angle = 0;
        angleDir = 1;
      }
    } else if (phase === "angle") {
      angle += angleDir * 0.025 * step;
      if (angle >= 1) { angle = 1; angleDir = -1; }
      if (angle <= 0) { angle = 0; angleDir = 1; }
      if (input.action && !actionLatch) {
        actionLatch = true;
        // Compute jump physics
        const sweetBonus = (angle >= 0.45 && angle <= 0.55) ? 1.4 : 1 - Math.abs(angle - 0.5) * 1.2;
        const angleRad = Math.PI / 4 * (1 + (angle - 0.5));
        const v = 14 * power * sweetBonus;
        pgo.vx = Math.cos(angleRad) * v;
        pgo.vy = -Math.sin(angleRad) * v;
        phase = "fly";
      }
    } else if (phase === "fly") {
      pgo.x += pgo.vx;
      pgo.y += pgo.vy;
      pgo.vy += 0.4;
      if (pgo.y >= VH - 80 && pgo.vy > 0) {
        pgo.y = VH - 80;
        landDist = Math.round((pgo.x - 60) / 0.7);
        if (landDist < 0) landDist = 0;
        if (landDist > bestDist) bestDist = landDist;
        totalDist += landDist;
        phase = "result";
        resultUntil = performance.now() + 1500;
      }
    } else if (phase === "result") {
      if (performance.now() >= resultUntil) {
        actionLatch = false;
        if (attempt >= TOTAL) {
          finished = true;
          phase = "done";
          opts.onFinish(bestDist, `🥇 Nejdelší skok: ${bestDist} m`);
          return;
        }
        startNewAttempt();
      }
    }
    if (!input.action) actionLatch = false;
    draw();
    raf = requestAnimationFrame(tick);
  }

  raf = requestAnimationFrame(tick);
  return {
    destroy() {
      finished = true;
      cancelAnimationFrame(raf);
      destroyInput();
    },
  };
}

// =====================  DIVE (potápění + lov ryb)  =====================
function runDive(opts: MinigameOptions): MinigameInstance {
  const ctx = setupCanvas(opts.canvas);
  const { input, destroy: destroyInput } = bindInputs(opts.canvas);
  let raf = 0;
  let last = 0;
  const startTime = performance.now();
  const DURATION_MS = 30_000;
  const player = { x: VW / 2, y: 60 };
  let depth = 0;
  let speed = 1.5;
  type Entity = { kind: "fish" | "jelly"; x: number; y: number; vx: number };
  const entities: Entity[] = [];
  let score = 0;
  let lives = 3;
  let nextSpawn = 0;
  let finished = false;

  function spawn(): void {
    const isFish = Math.random() < 0.7;
    const startSide = Math.random() < 0.5 ? -20 : VW + 20;
    const dir = startSide < 0 ? 1 : -1;
    entities.push({
      kind: isFish ? "fish" : "jelly",
      x: startSide,
      y: 100 + Math.random() * (VH - 130),
      vx: dir * (1.5 + Math.random() * 1.5),
    });
  }

  function draw(): void {
    // Underwater gradient
    const bg = ctx.createLinearGradient(0, 0, 0, VH);
    bg.addColorStop(0, "#0c4a6e");
    bg.addColorStop(0.5, "#075985");
    bg.addColorStop(1, "#082f49");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, VW, VH);
    // Light rays
    ctx.fillStyle = "rgba(186, 230, 253, 0.15)";
    for (let i = 0; i < 5; i++) {
      const x = ((i * 100 + depth * 0.4) % (VW + 100)) - 50;
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x + 20, VH); ctx.lineTo(x + 60, VH); ctx.lineTo(x + 40, 0);
      ctx.closePath();
      ctx.fill();
    }
    // Bubbles drifting up
    ctx.fillStyle = "rgba(186,230,253,0.4)";
    for (let i = 0; i < 14; i++) {
      const x = (i * 73 + 20) % VW;
      const y = (VH - ((depth * 0.6 + i * 50) % VH));
      ctx.beginPath();
      ctx.arc(x, y, 1 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
    // Entities
    for (const e of entities) {
      if (e.kind === "fish") {
        const facing = e.vx > 0 ? 1 : -1;
        // Body
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.ellipse(e.x, e.y, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Tail
        ctx.beginPath();
        ctx.moveTo(e.x - facing * 8, e.y);
        ctx.lineTo(e.x - facing * 14, e.y - 4);
        ctx.lineTo(e.x - facing * 14, e.y + 4);
        ctx.closePath();
        ctx.fill();
        // Eye
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(e.x + facing * 4, e.y - 1, 1.5, 1.5);
      } else {
        // Jelly
        ctx.fillStyle = "rgba(244, 114, 182, 0.7)";
        ctx.beginPath();
        ctx.arc(e.x, e.y, 10, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = "rgba(244, 114, 182, 0.5)";
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.moveTo(e.x + i * 3, e.y);
          ctx.quadraticCurveTo(e.x + i * 3 + Math.sin(performance.now() / 200 + i) * 2, e.y + 8, e.x + i * 3, e.y + 12);
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = "rgba(244, 114, 182, 0.5)";
          ctx.stroke();
        }
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(e.x - 2, e.y - 4, 1, 1);
        ctx.fillRect(e.x + 2, e.y - 4, 1, 1);
      }
    }
    // Player diving (vertical pose)
    const px = player.x;
    const py = player.y;
    ctx.fillStyle = "#0a0f1f";
    ctx.beginPath();
    ctx.ellipse(px, py + 4, 10, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(px, py + 6, 7, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eyes (looking down)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(px - 3, py - 2, 2, 0, Math.PI * 2);
    ctx.arc(px + 3, py - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0a0f1f";
    ctx.beginPath();
    ctx.arc(px - 3, py - 1, 1, 0, Math.PI * 2);
    ctx.arc(px + 3, py - 1, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fb923c";
    ctx.beginPath();
    ctx.moveTo(px - 1.5, py + 2); ctx.lineTo(px + 4, py + 4); ctx.lineTo(px - 1.5, py + 4);
    ctx.fill();
    // Bubbles trailing from player
    ctx.fillStyle = "rgba(186,230,253,0.7)";
    ctx.beginPath();
    ctx.arc(px - 8, py + 12 + Math.sin(performance.now() / 200) * 2, 1.5, 0, Math.PI * 2);
    ctx.arc(px + 8, py + 16 + Math.cos(performance.now() / 200) * 2, 1.2, 0, Math.PI * 2);
    ctx.fill();
    // HUD
    const t = Math.max(0, Math.ceil((DURATION_MS - (performance.now() - startTime)) / 1000));
    ctx.fillStyle = "rgba(15,23,42,0.7)";
    ctx.fillRect(0, 0, VW, 24);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px system-ui";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(`🐟 ${score}`, 8, 12);
    ctx.textAlign = "center";
    ctx.fillText(`⏱ ${t}s`, VW / 2, 12);
    ctx.textAlign = "right";
    ctx.fillText(`❤ ${lives}`, VW - 8, 12);
  }

  function tick(time: number): void {
    if (finished) return;
    const dt = last === 0 ? 16 : Math.min(40, time - last);
    last = time;
    const elapsed = performance.now() - startTime;
    if (elapsed > DURATION_MS || lives <= 0) {
      finished = true;
      opts.onFinish(score, `🐟 ${score} ryb za 30 s`);
      return;
    }
    if (input.left) player.x -= 3;
    if (input.right) player.x += 3;
    player.x = Math.max(20, Math.min(VW - 20, player.x));
    speed = 1.5 + (elapsed / DURATION_MS) * 1.5;
    depth += speed;
    for (const e of entities) {
      e.x += e.vx;
    }
    nextSpawn -= dt;
    if (nextSpawn <= 0) {
      spawn();
      nextSpawn = 500 - Math.min(250, elapsed / 60);
    }
    for (let i = entities.length - 1; i >= 0; i--) {
      const e = entities[i];
      if (e.x < -40 || e.x > VW + 40) { entities.splice(i, 1); continue; }
      if (Math.abs(e.x - player.x) < 14 && Math.abs(e.y - player.y) < 14) {
        if (e.kind === "fish") { score++; entities.splice(i, 1); }
        else { lives--; entities.splice(i, 1); }
      }
    }
    draw();
    raf = requestAnimationFrame(tick);
  }

  raf = requestAnimationFrame(tick);
  return {
    destroy() {
      finished = true;
      cancelAnimationFrame(raf);
      destroyInput();
    },
  };
}

export function startMinigame(opts: MinigameOptions): MinigameInstance {
  switch (opts.kind) {
    case "ski":    return runSki(opts);
    case "hockey": return runHockey(opts);
    case "jump":   return runJump(opts);
    case "dive":   return runDive(opts);
  }
}
