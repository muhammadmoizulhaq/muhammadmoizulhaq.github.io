/**
 * CRT settings — user-tunable CRT aesthetic controls.
 *
 * Gives the visitor real knobs for the retro CRT look: scanline intensity,
 * glow strength, flicker toggle, screen curvature, and a boot-skip toggle.
 * State persists to localStorage and is mirrored onto <html> as CSS custom
 * properties + data attributes so the overlay + global styles respond.
 *
 * On-theme: a "MONITOR.SYS" calibration panel for an arcade portfolio.
 */

export type CRTSettings = {
  /** 0..100 — opacity of the global scanline overlay. */
  scanlines: number;
  /** 0..100 — multiplier on neon text-shadow glow strength. */
  glow: number;
  /** Toggle the subtle CRT flicker animation. */
  flicker: boolean;
  /** 0..100 — screen curvature vignette strength. */
  curvature: number;
  /** Skip the boot sequence on future visits (one-tap into the site). */
  bootSkip: boolean;
};

export const DEFAULT_CRT: CRTSettings = {
  scanlines: 100,
  glow: 100,
  flicker: true,
  curvature: 100,
  bootSkip: false,
};

const STORAGE_KEY = "moiz_crt_settings";
export const CRT_EVENT = "moiz:crt";

function read(): CRTSettings {
  if (typeof window === "undefined") return DEFAULT_CRT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CRT;
    const parsed = JSON.parse(raw) as Partial<CRTSettings>;
    return { ...DEFAULT_CRT, ...parsed };
  } catch {
    return DEFAULT_CRT;
  }
}

function write(s: CRTSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

/**
 * Apply the settings to <html> as CSS custom properties + data attributes.
 * Called on mount and whenever settings change. Safe to call server-side
 * (no-op when window is undefined).
 */
export function applyCRT(s: CRTSettings) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  // Scanline opacity — 0..1 from 0..100.
  root.style.setProperty("--crt-scanline-opacity", String(s.scanlines / 100));
  // Glow multiplier — 0..1. Used by CSS calc() on text-shadow vars.
  root.style.setProperty("--crt-glow", String(s.glow / 100));
  // Curvature vignette strength — 0..1.
  root.style.setProperty("--crt-curvature", String(s.curvature / 100));
  // Flicker toggle as a data attr the CSS can target.
  root.dataset.crtFlicker = s.flicker ? "1" : "0";
}

export function getCRT(): CRTSettings {
  return read();
}

export function setCRT(next: Partial<CRTSettings>): CRTSettings {
  const merged = { ...read(), ...next };
  write(merged);
  applyCRT(merged);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CRT_EVENT, { detail: merged }));
  }
  return merged;
}

export function resetCRT(): CRTSettings {
  write(DEFAULT_CRT);
  applyCRT(DEFAULT_CRT);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CRT_EVENT, { detail: DEFAULT_CRT }));
  }
  return DEFAULT_CRT;
}

/** Restore persisted settings to <html> on first paint (call from a client effect). */
export function syncCRTFromStorage() {
  applyCRT(read());
}
