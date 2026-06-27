"use client";

/**
 * Retro sound engine — generates chiptune-style blips with the Web Audio API.
 *
 * No external audio files. A single shared AudioContext is lazily created on
 * first user gesture (browsers block autoplay). Each sound is a short
 * oscillator envelope (square/triangle waves for that 8-bit feel).
 *
 * Also hosts an **ambient pad** (a slow evolving chord via detuned oscillators
 * + a lowpass filter modulated by an LFO) and an **AnalyserNode** so the UI can
 * render an audio-reactive visualizer. Mute + pad state persist to localStorage.
 */

type SoundName =
  | "hover"
  | "click"
  | "flip"
  | "open"
  | "close"
  | "type"
  | "error"
  | "success"
  | "nav"
  | "boot";

const MUTE_KEY = "moiz_muted";
const PAD_KEY = "moiz_pad";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let analyser: AnalyserNode | null = null;

// Ambient pad nodes
let padGain: GainNode | null = null; // overall pad volume (pre-master)
let padVoices: { osc: OscillatorNode; gain: GainNode }[] = [];
let padFilter: BiquadFilterNode | null = null;
let padLfo: OscillatorNode | null = null;
let padLfoGain: GainNode | null = null;
let padRunning = false;

// Track whether we've seen a real user gesture (click/keydown/touch). Hover
// events (mouseenter) are NOT sufficient to satisfy the browser autoplay
// policy — creating an AudioContext on hover leaves it stuck in "suspended"
// state, and subsequent resume() calls from real gestures may fail. So we
// defer AudioContext creation until a genuine gesture arrives.
let gestureSeen = false;
if (typeof window !== "undefined") {
  const markGesture = () => {
    gestureSeen = true;
    // Remove listeners once we've seen a gesture.
    window.removeEventListener("pointerdown", markGesture);
    window.removeEventListener("keydown", markGesture);
    window.removeEventListener("touchstart", markGesture);
  };
  window.addEventListener("pointerdown", markGesture, { passive: true });
  window.addEventListener("keydown", markGesture, { passive: true });
  window.addEventListener("touchstart", markGesture, { passive: true });
}

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  // Don't create the AudioContext until we've seen a real user gesture.
  // Without this guard, a mouseenter (hover) event would create the context
  // in a "suspended" state that later resume() calls can't reliably revive.
  if (!ctx && !gestureSeen) return null;
  if (!ctx) {
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.14;
      analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.78;
      // route: sources -> master -> analyser -> destination
      master.connect(analyser);
      analyser.connect(ctx.destination);
    } catch {
      return null;
    }
  }
  // Resume if suspended (autoplay policy). Safe to fire-and-forget here
  // because ensureCtx is only called from real gesture handlers now.
  if (ctx.state === "suspended") {
    void ctx.resume().catch(() => {
      /* ignore — will retry on next gesture */
    });
  }
  return ctx;
}

/** Each sound = waveform + freq sequence + duration. Tuned to feel "retro". */
const SOUND_DEFS: Record<
  SoundName,
  { wave: OscillatorType; notes: { f: number; t: number; d: number }[] }
> = {
  // high short tick
  hover: {
    wave: "square",
    notes: [{ f: 880, t: 0, d: 0.04 }],
  },
  // mid blip
  click: {
    wave: "square",
    notes: [{ f: 520, t: 0, d: 0.06 }],
  },
  // two-tone flip
  flip: {
    wave: "triangle",
    notes: [
      { f: 440, t: 0, d: 0.05 },
      { f: 660, t: 0.05, d: 0.07 },
    ],
  },
  // rising open
  open: {
    wave: "square",
    notes: [
      { f: 330, t: 0, d: 0.05 },
      { f: 495, t: 0.05, d: 0.05 },
      { f: 660, t: 0.1, d: 0.08 },
    ],
  },
  // falling close
  close: {
    wave: "square",
    notes: [
      { f: 660, t: 0, d: 0.05 },
      { f: 440, t: 0.05, d: 0.05 },
      { f: 330, t: 0.1, d: 0.07 },
    ],
  },
  // soft type tick
  type: {
    wave: "square",
    notes: [{ f: 1200, t: 0, d: 0.02 }],
  },
  // buzzy error
  error: {
    wave: "sawtooth",
    notes: [
      { f: 180, t: 0, d: 0.1 },
      { f: 140, t: 0.1, d: 0.12 },
    ],
  },
  // arpeggio success
  success: {
    wave: "square",
    notes: [
      { f: 523, t: 0, d: 0.06 },
      { f: 659, t: 0.06, d: 0.06 },
      { f: 784, t: 0.12, d: 0.06 },
      { f: 1047, t: 0.18, d: 0.1 },
    ],
  },
  // nav whoosh (downward)
  nav: {
    wave: "triangle",
    notes: [
      { f: 700, t: 0, d: 0.04 },
      { f: 500, t: 0.04, d: 0.05 },
    ],
  },
  // boot fanfare
  boot: {
    wave: "square",
    notes: [
      { f: 392, t: 0, d: 0.08 },
      { f: 523, t: 0.08, d: 0.08 },
      { f: 659, t: 0.16, d: 0.08 },
      { f: 784, t: 0.24, d: 0.16 },
    ],
  },
};

export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    /* ignore */
  }
  // mute also silences the pad
  if (padGain && ctx) {
    padGain.gain.setTargetAtTime(muted ? 0 : 0.5, ctx.currentTime, 0.05);
  }
  window.dispatchEvent(new CustomEvent("moiz:mute", { detail: muted }));
}

/** Play a named retro sound. No-ops if muted or audio unavailable. */
export function playSound(name: SoundName) {
  if (isMuted()) return;
  const c = ensureCtx();
  if (!c || !master) return;
  const def = SOUND_DEFS[name];
  const now = c.currentTime;
  for (const note of def.notes) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = def.wave;
    osc.frequency.setValueAtTime(note.f, now + note.t);
    // quick attack + exponential decay = blip
    gain.gain.setValueAtTime(0.0001, now + note.t);
    gain.gain.exponentialRampToValueAtTime(0.5, now + note.t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.t + note.d);
    osc.connect(gain);
    gain.connect(master);
    osc.start(now + note.t);
    osc.stop(now + note.t + note.d + 0.02);
  }
}

/* ------------------------------------------------------------------ */
/* Ambient pad                                                          */
/* ------------------------------------------------------------------ */

/** Pad preset definitions — each is a distinct chord voicing + character. */
export type PadPreset = "drone" | "arp" | "pad";

export const PAD_PRESETS: {
  id: PadPreset;
  label: string;
  desc: string;
  notes: number[];
  wave: OscillatorType;
  filterFreq: number;
  lfoFreq: number;
}[] = [
  {
    id: "drone",
    label: "DRONE",
    desc: "Dark sustained minor chord",
    notes: [110, 164.81, 220, 261.63], // A2 E3 A3 C4 — A minor
    wave: "sawtooth",
    filterFreq: 620,
    lfoFreq: 0.07,
  },
  {
    id: "arp",
    label: "ARP",
    desc: "Brighter major arpeggio feel",
    notes: [130.81, 196, 261.63, 329.63], // C3 G3 C4 E4 — C major
    wave: "triangle",
    filterFreq: 1200,
    lfoFreq: 0.18,
  },
  {
    id: "pad",
    label: "PAD",
    desc: "Warm lush ambient wash",
    notes: [98, 146.83, 196, 246.94], // G2 D3 G3 B3 — G major
    wave: "sine",
    filterFreq: 820,
    lfoFreq: 0.11,
  },
];

const PAD_PRESET_KEY = "moiz_pad_preset";

export function getPadPreset(): PadPreset {
  try {
    const v = localStorage.getItem(PAD_PRESET_KEY) as PadPreset | null;
    if (v && PAD_PRESETS.some((p) => p.id === v)) return v;
  } catch {
    /* ignore */
  }
  return "drone";
}

export function setPadPreset(p: PadPreset) {
  try {
    localStorage.setItem(PAD_PRESET_KEY, p);
  } catch {
    /* ignore */
  }
  // If the pad is currently running, restart it with the new preset so the
  // change is audible immediately.
  if (padRunning) {
    stopPad();
    // Tiny delay so the fade-out completes before the new voices start.
    setTimeout(() => startPad(), 80);
  }
  window.dispatchEvent(new CustomEvent("moiz:pad-preset", { detail: p }));
}

/** A minor-ish drone chord (A2 root + E3 fifth + A3 octave + C4 minor third). */
const PAD_NOTES = [110, 164.81, 220, 261.63];

export function isPadOn(): boolean {
  try {
    return localStorage.getItem(PAD_KEY) === "1";
  } catch {
    return false;
  }
}

function setPadStored(on: boolean) {
  try {
    localStorage.setItem(PAD_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
}

/** Start the ambient pad. Lazily builds the node graph on first call.
 *  Uses the currently-selected pad preset (drone/arp/pad). */
export function startPad() {
  const c = ensureCtx();
  if (!c || !master || padRunning) return;
  setPadStored(true);

  const preset = PAD_PRESETS.find((p) => p.id === getPadPreset()) ?? PAD_PRESETS[0];

  // Build the pad graph once.
  if (!padFilter) {
    padFilter = c.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = preset.filterFreq;
    padFilter.Q.value = 6;

    padGain = c.createGain();
    padGain.gain.value = isMuted() ? 0 : 0.5;

    // LFO slowly opens/closes the filter for movement.
    padLfo = c.createOscillator();
    padLfo.type = "sine";
    padLfo.frequency.value = preset.lfoFreq;
    padLfoGain = c.createGain();
    padLfoGain.gain.value = 280;
    padLfo.connect(padLfoGain);
    padLfoGain.connect(padFilter.frequency);

    padFilter.connect(padGain);
    padGain.connect(master);

    padLfo.start();
  } else {
    // Update the filter + LFO to the preset's character on subsequent starts.
    padFilter.frequency.setTargetAtTime(preset.filterFreq, c.currentTime, 0.3);
    if (padLfo) padLfo.frequency.setTargetAtTime(preset.lfoFreq, c.currentTime, 0.3);
  }

  // (Re)create the detuned voice oscillators each start so they're fresh.
  padVoices = preset.notes.map((freq, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = i % 2 === 0 ? preset.wave : "triangle";
    osc.frequency.value = freq;
    // slight detune for a thicker, vintage feel
    osc.detune.value = (i - 1.5) * 6;
    // gentle fade-in
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.16, c.currentTime + 1.6);
    osc.connect(g);
    g.connect(padFilter!);
    osc.start();
    return { osc, gain: g };
  });

  padRunning = true;
  window.dispatchEvent(new CustomEvent("moiz:pad", { detail: true }));
}

/** Stop the ambient pad with a short fade. */
export function stopPad() {
  const c = ctx;
  if (!c || !padRunning) {
    setPadStored(false);
    return;
  }
  setPadStored(false);
  const now = c.currentTime;
  for (const v of padVoices) {
    try {
      v.gain.gain.cancelScheduledValues(now);
      v.gain.gain.setValueAtTime(v.gain.gain.value, now);
      v.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      v.osc.stop(now + 0.45);
    } catch {
      /* ignore */
    }
  }
  padVoices = [];
  padRunning = false;
  window.dispatchEvent(new CustomEvent("moiz:pad", { detail: false }));
}

/** Resume the pad if the user had it enabled (e.g. after a reload / gesture). */
export function syncPadFromStorage() {
  if (isPadOn() && !padRunning) startPad();
  else if (!isPadOn() && padRunning) stopPad();
}

/** Expose the analyser for visualizers (EQ bars, reactive starfield). */
export function getAnalyser(): AnalyserNode | null {
  return analyser;
}

/** True when the audio graph is live (context exists + has signal potential). */
export function audioReady(): boolean {
  return ctx !== null && master !== null;
}
