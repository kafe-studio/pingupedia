// 8-bit chiptune music engine pro Ledovou výpravu.
// Web Audio API + square waves + envelope, ve stylu NES/Game Boy.
// Hraje "Korobeiniki" (ruská lidová z 19. století, public domain) - melodie
// známá z Tetrise. AutoContext startuje až po user gesture (browser policy).

type Note = number;        // MIDI-like number (60 = C4). 0 = rest.
type NoteLen = number;     // beats (1 = quarter)

interface PatternStep {
  lead: Note;
  bass: Note;
  len: NoteLen;
}

// Korobeiniki, A minor, kompaktní 1-loop verze (~32 beats).
// Melodie v lead, basová linka v bass (oktávy o 12 níž).
const A4 = 69, B4 = 71, C5 = 72, D5 = 74, E5 = 76, F5 = 77, G5 = 79;
const A3 = 57, C4 = 60, D4 = 62, E4 = 64;
const A5 = 81;
const _ = 0; // rest

const PATTERN: PatternStep[] = [
  // Phrase 1
  { lead: E5, bass: A3, len: 1 },
  { lead: B4, bass: A3, len: 0.5 },
  { lead: C5, bass: A3, len: 0.5 },
  { lead: D5, bass: A3, len: 1 },
  { lead: C5, bass: A3, len: 0.5 },
  { lead: B4, bass: A3, len: 0.5 },
  { lead: A4, bass: A3, len: 1 },
  { lead: A4, bass: A3, len: 0.5 },
  { lead: C5, bass: A3, len: 0.5 },
  { lead: E5, bass: A3, len: 1 },
  { lead: D5, bass: A3, len: 0.5 },
  { lead: C5, bass: A3, len: 0.5 },
  { lead: B4, bass: E4, len: 1.5 },
  { lead: C5, bass: E4, len: 0.5 },
  { lead: D5, bass: E4, len: 1 },
  { lead: E5, bass: E4, len: 1 },
  { lead: C5, bass: A3, len: 1 },
  { lead: A4, bass: A3, len: 1 },
  { lead: A4, bass: A3, len: 1 },
  { lead: _,  bass: _,  len: 1 },
  // Phrase 2
  { lead: D5, bass: D4, len: 1.5 },
  { lead: F5, bass: D4, len: 0.5 },
  { lead: A5, bass: D4, len: 1 },
  { lead: G5, bass: D4, len: 0.5 },
  { lead: F5, bass: D4, len: 0.5 },
  { lead: E5, bass: C4, len: 1.5 },
  { lead: C5, bass: C4, len: 0.5 },
  { lead: E5, bass: C4, len: 1 },
  { lead: D5, bass: C4, len: 0.5 },
  { lead: C5, bass: C4, len: 0.5 },
  { lead: B4, bass: A3, len: 1 },
  { lead: B4, bass: A3, len: 0.5 },
  { lead: C5, bass: A3, len: 0.5 },
  { lead: D5, bass: A3, len: 1 },
  { lead: E5, bass: A3, len: 1 },
  { lead: C5, bass: A3, len: 1 },
  { lead: A4, bass: A3, len: 1 },
  { lead: A4, bass: A3, len: 1 },
  { lead: _,  bass: _,  len: 1 },
];

const BPM = 144;
const BEAT_SEC = 60 / BPM;

function midiToHz(m: number): number {
  return 440 * Math.pow(2, (m - 69) / 12);
}

export class ChiptuneMusic {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private playing = false;
  private patternIdx = 0;
  private nextStartTime = 0;
  private timer: number | null = null;
  private volumeOn = 0.18;

  /** Must be called after a user gesture. Returns true if started. */
  start(): boolean {
    if (this.playing) return true;
    try {
      const W = window as unknown as {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      };
      const Ctor = W.AudioContext ?? W.webkitAudioContext;
      if (!Ctor) return false;
      this.ctx = new Ctor();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volumeOn;
      this.masterGain.connect(this.ctx.destination);
      this.playing = true;
      this.patternIdx = 0;
      this.nextStartTime = this.ctx.currentTime + 0.05;
      this.scheduleAhead();
      this.timer = window.setInterval(() => this.scheduleAhead(), 200);
      return true;
    } catch {
      this.ctx = null;
      this.masterGain = null;
      this.playing = false;
      return false;
    }
  }

  stop(): void {
    this.playing = false;
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    if (this.ctx) {
      this.ctx.close().catch(() => undefined);
      this.ctx = null;
      this.masterGain = null;
    }
  }

  isPlaying(): boolean {
    return this.playing;
  }

  setVolume(v: number): void {
    this.volumeOn = Math.max(0, Math.min(0.5, v));
    if (this.masterGain) this.masterGain.gain.value = this.volumeOn;
  }

  /** Schedule any pattern steps that fall within the next 0.5s lookahead. */
  private scheduleAhead(): void {
    if (!this.ctx || !this.playing || !this.masterGain) return;
    const lookahead = this.ctx.currentTime + 0.5;
    while (this.nextStartTime < lookahead) {
      const step = PATTERN[this.patternIdx];
      const dur = step.len * BEAT_SEC;
      this.scheduleNote(step.lead, this.nextStartTime, dur, "square", 0.16);
      this.scheduleNote(step.bass, this.nextStartTime, dur, "triangle", 0.10);
      this.nextStartTime += dur;
      this.patternIdx = (this.patternIdx + 1) % PATTERN.length;
    }
  }

  private scheduleNote(midi: Note, when: number, dur: number, type: OscillatorType, vol: number): void {
    if (!this.ctx || !this.masterGain || midi === 0) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = midiToHz(midi);
    // ADSR-ish envelope: short attack, long sustain, short release.
    const attack = 0.005;
    const release = 0.04;
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vol, when + attack);
    g.gain.linearRampToValueAtTime(vol * 0.7, when + dur - release);
    g.gain.linearRampToValueAtTime(0, when + dur);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(when);
    osc.stop(when + dur + 0.05);
  }
}
