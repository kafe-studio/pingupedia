// Relaxační ambient hudba pro Pexeso + Puzzle.
// Web Audio API: jemné sinusové padlo + arpeggio, slow tempo, low-pass filter.
// Volné akordy v C-mixolydian (nebo Aeolian) pro klidovou atmosféru.
// AudioContext startuje až po user gesture (browser policy).

type Note = number; // MIDI

// Akordová progrese — 4 takty, každý ~6 sekund (slow tempo 40 BPM).
// Ambient: D minor 9 → A minor 7 → F major 9 → G major 7
// Volně oktávované, žádné rytmické beaty.
interface ChordStep {
  root: Note;
  pad: Note[];        // držené noty (3-4 voices)
  arp: Note[];        // arpeggio noty (rotuje)
  durSec: number;
}

const CHORDS: ChordStep[] = [
  {
    root: 50,                            // D2
    pad: [62, 65, 69, 72],               // D4, F4, A4, C5  (Dm9)
    arp: [74, 77, 81, 84, 81, 77],
    durSec: 6,
  },
  {
    root: 45,                            // A2
    pad: [60, 64, 67, 71],               // C4, E4, G4, B4 (Am7)
    arp: [72, 76, 79, 84, 79, 76],
    durSec: 6,
  },
  {
    root: 41,                            // F2
    pad: [60, 65, 69, 72],               // C4, F4, A4, C5 (Fmaj9)
    arp: [69, 72, 77, 81, 77, 72],
    durSec: 6,
  },
  {
    root: 43,                            // G2
    pad: [62, 67, 71, 74],               // D4, G4, B4, D5 (G7)
    arp: [71, 74, 79, 83, 79, 74],
    durSec: 6,
  },
];

function midiToFreq(n: Note): number {
  return 440 * Math.pow(2, (n - 69) / 12);
}

export class RelaxingMusic {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private timer: number | null = null;
  private playing = false;
  private chordIndex = 0;
  private arpStep = 0;

  isPlaying(): boolean {
    return this.playing;
  }

  start(): boolean {
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return false;
      if (!this.ctx) this.ctx = new Ctor();
      if (this.ctx.state === "suspended") void this.ctx.resume();

      this.master = this.ctx.createGain();
      this.master.gain.setValueAtTime(0, this.ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 1.5);
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.frequency.value = 1800;
      this.filter.Q.value = 0.7;
      this.master.connect(this.filter);
      this.filter.connect(this.ctx.destination);

      this.playing = true;
      this.chordIndex = 0;
      this.arpStep = 0;
      this.scheduleChord();
      return true;
    } catch {
      return false;
    }
  }

  stop(): void {
    this.playing = false;
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.master && this.ctx) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(0, now + 1.0);
    }
  }

  destroy(): void {
    this.stop();
    if (this.ctx) {
      const ctx = this.ctx;
      window.setTimeout(() => { void ctx.close(); }, 1500);
      this.ctx = null;
      this.master = null;
      this.filter = null;
    }
  }

  private scheduleChord(): void {
    if (!this.playing || !this.ctx || !this.master) return;
    const chord = CHORDS[this.chordIndex];
    const startAt = this.ctx.currentTime;
    const dur = chord.durSec;

    // Pad — 4 sustain hlasy, sinus, slow attack/release.
    for (const n of chord.pad) {
      this.playPad(midiToFreq(n), startAt, dur);
    }
    // Bass — sub root o oktávu níž.
    this.playPad(midiToFreq(chord.root), startAt, dur, 0.55, "triangle");

    // Arpeggio — krátké jemné triangle noty každých ~750 ms.
    const arpEvery = 0.75;
    const arpCount = Math.floor(dur / arpEvery);
    for (let i = 0; i < arpCount; i++) {
      const note = chord.arp[(this.arpStep + i) % chord.arp.length];
      this.playArp(midiToFreq(note), startAt + i * arpEvery, 0.6);
    }
    this.arpStep = (this.arpStep + arpCount) % chord.arp.length;

    this.chordIndex = (this.chordIndex + 1) % CHORDS.length;
    this.timer = window.setTimeout(() => this.scheduleChord(), dur * 1000);
  }

  private playPad(freq: number, t0: number, dur: number, vol = 0.35, type: OscillatorType = "sine"): void {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const g = this.ctx.createGain();
    const peak = vol;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + 1.5);
    g.gain.linearRampToValueAtTime(peak * 0.85, t0 + dur - 1.5);
    g.gain.linearRampToValueAtTime(0, t0 + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.1);
  }

  private playArp(freq: number, t0: number, dur: number): void {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.18, t0 + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }
}
