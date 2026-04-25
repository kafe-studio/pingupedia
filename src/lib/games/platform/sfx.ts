// Krátké procedurální 8-bit zvukové efekty pro Ledovou výpravu.
// Web Audio API, oscilátory + envelope. Žádné externí soubory.

import type { SfxKind } from "./types";

export class SfxPlayer {
  private ctx: AudioContext | null = null;
  private failed = false;

  /** Lazy init — must be triggered by a user gesture (keypress / click) the first time. */
  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    if (this.failed) return null;
    try {
      const W = window as unknown as {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      };
      const Ctor = W.AudioContext ?? W.webkitAudioContext;
      if (!Ctor) {
        this.failed = true;
        return null;
      }
      this.ctx = new Ctor();
      return this.ctx;
    } catch {
      this.failed = true;
      return null;
    }
  }

  play(kind: SfxKind): void {
    const ctx = this.ensure();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => undefined);
    const t = ctx.currentTime;
    switch (kind) {
      case "mlask":
        // Krátké chrupnutí — "mlask" při sběru ryby.
        this.blip(ctx, t, 800, 400, 0.05, "square", 0.20);
        this.blip(ctx, t + 0.04, 600, 200, 0.04, "square", 0.15);
        break;
      case "pop":
        // Pop při sběru vejce.
        this.blip(ctx, t, 1200, 600, 0.06, "square", 0.16);
        break;
      case "ding":
        // Cinkání při sběru medaile/vlajky/krystalu.
        this.blip(ctx, t, 1200, 1200, 0.08, "triangle", 0.18);
        this.blip(ctx, t + 0.04, 1800, 1800, 0.10, "triangle", 0.14);
        break;
      case "gulp":
        // Při sběru srdíčka — stoupavé "ham".
        this.blip(ctx, t, 200, 600, 0.12, "sine", 0.22);
        this.blip(ctx, t + 0.10, 600, 800, 0.08, "sine", 0.18);
        break;
      case "zbunk":
        // Žbunk při přechodu mezi místnostmi.
        this.blip(ctx, t, 600, 80, 0.18, "sine", 0.20);
        break;
      case "boing":
        // Skok — krátké stoupání.
        this.blip(ctx, t, 200, 700, 0.10, "square", 0.14);
        break;
      case "ouch":
        // Ztráta života.
        this.blip(ctx, t, 400, 100, 0.20, "sawtooth", 0.18);
        break;
      case "bzzt":
        // Game over.
        this.blip(ctx, t, 100, 60, 0.30, "sawtooth", 0.20);
        this.blip(ctx, t + 0.30, 80, 40, 0.40, "sawtooth", 0.22);
        break;
      case "tada":
        // Vítězný akord — C dur arpeggio + finale.
        this.blip(ctx, t,        523, 523, 0.12, "square", 0.16); // C5
        this.blip(ctx, t + 0.12, 659, 659, 0.12, "square", 0.16); // E5
        this.blip(ctx, t + 0.24, 784, 784, 0.12, "square", 0.16); // G5
        this.blip(ctx, t + 0.36, 1047, 1047, 0.30, "square", 0.20); // C6
        break;
    }
  }

  private blip(
    ctx: AudioContext,
    when: number,
    freqStart: number,
    freqEnd: number,
    dur: number,
    type: OscillatorType,
    vol: number,
  ): void {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, when);
    if (freqEnd !== freqStart) {
      osc.frequency.linearRampToValueAtTime(freqEnd, when + dur);
    }
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vol, when + 0.005);
    g.gain.linearRampToValueAtTime(vol * 0.7, when + Math.max(0.01, dur - 0.02));
    g.gain.linearRampToValueAtTime(0, when + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(when);
    osc.stop(when + dur + 0.02);
  }
}
