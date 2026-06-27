/**
 * Day/night CRT warmth — shifts the background color temperature based on the
 * visitor's local hour for ambient atmosphere.
 *
 * Late night (22:00–05:00) → warmer/darker (amber tint, lower lightness).
 * Midday (11:00–15:00) → cooler/neutral (default).
 * Evening (18:00–21:00) → warm orange tint.
 *
 * Applied as a `--crt-warmth` CSS variable (a hue rotation in degrees) + a
 * `--crt-warmth-alpha` overlay tint on <html>. Recomputed every 5 minutes.
 */

export type WarmthPhase = {
  /** Hue rotation in degrees applied to the background (0 = none). */
  hue: number;
  /** Alpha 0..1 for a warm overlay tint (0 = none). */
  alpha: number;
  /** Background lightness multiplier 0.85..1 (1 = default). */
  light: number;
  /** Human-readable phase name for the activity ticker. */
  label: string;
};

/** Compute the current warmth phase from a Date (defaults to now). */
export function warmthPhase(now: Date = new Date()): WarmthPhase {
  const h = now.getHours() + now.getMinutes() / 60;
  // Late night: deep warm amber.
  if (h >= 22 || h < 5) {
    return { hue: 18, alpha: 0.08, light: 0.88, label: "NIGHT" };
  }
  // Early morning: warm sunrise.
  if (h >= 5 && h < 8) {
    return { hue: 25, alpha: 0.06, light: 0.94, label: "DAWN" };
  }
  // Morning to midday: neutral.
  if (h >= 8 && h < 16) {
    return { hue: 0, alpha: 0, light: 1, label: "DAY" };
  }
  // Late afternoon: warm golden.
  if (h >= 16 && h < 19) {
    return { hue: 22, alpha: 0.05, light: 0.96, label: "DUSK" };
  }
  // Evening: warm.
  return { hue: 20, alpha: 0.07, light: 0.92, label: "EVENING" };
}

const WARMTH_EVENT = "moiz:warmth";

let active: WarmthPhase | null = null;

/** Apply the current warmth phase to <html> as CSS vars + a data attr. */
export function applyWarmth(phase: WarmthPhase = warmthPhase()) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--crt-warmth-hue", String(phase.hue));
  root.style.setProperty("--crt-warmth-alpha", String(phase.alpha));
  root.style.setProperty("--crt-warmth-light", String(phase.light));
  root.dataset.warmthPhase = phase.label;
  active = phase;
  window.dispatchEvent(new CustomEvent(WARMTH_EVENT, { detail: phase }));
}

/** Start a timer that recomputes + applies warmth every 5 minutes. */
export function startWarmthTimer(): () => void {
  applyWarmth();
  const t = setInterval(() => applyWarmth(), 5 * 60 * 1000);
  return () => clearInterval(t);
}

export function getWarmthPhase(): WarmthPhase {
  return active ?? warmthPhase();
}

export { WARMTH_EVENT };
