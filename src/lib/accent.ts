/**
 * Accent system — a single source of truth for the site's "neon accent" color.
 *
 * The accent can be swapped at runtime (via the command terminal's `theme`
 * command, or the header swatch buttons). It works by setting a
 * `data-neon-accent` attribute on <html>, which CSS variable blocks in
 * globals.css respond to (overriding --primary, --ring, --neon-* etc.).
 *
 * `cycle` rotates through the palette. State is persisted to localStorage.
 */

export type AccentColor = "amber" | "orange" | "magenta" | "green";

export const ACCENT_COLORS: AccentColor[] = [
  "amber",
  "orange",
  "magenta",
  "green",
];

export const ACCENT_LABELS: Record<AccentColor, string> = {
  amber: "AMBER",
  orange: "ORANGE",
  magenta: "MAGENTA",
  green: "GREEN",
};

/** oklch values for each accent — drive CSS var overrides + JS usage (audio viz, etc.) */
export const ACCENT_VARS: Record<AccentColor, {
  primary: string;
  ring: string;
  neon: string;
  swatch: string;
}> = {
  amber: {
    primary: "oklch(0.78 0.17 65)",
    ring: "oklch(0.78 0.17 65)",
    neon: "oklch(0.82 0.16 75)",
    swatch: "oklch(0.82 0.16 75)",
  },
  orange: {
    primary: "oklch(0.72 0.2 55)",
    ring: "oklch(0.72 0.2 55)",
    neon: "oklch(0.72 0.2 55)",
    swatch: "oklch(0.72 0.2 55)",
  },
  magenta: {
    primary: "oklch(0.68 0.24 350)",
    ring: "oklch(0.68 0.24 350)",
    neon: "oklch(0.68 0.24 350)",
    swatch: "oklch(0.68 0.24 350)",
  },
  green: {
    primary: "oklch(0.78 0.19 145)",
    ring: "oklch(0.78 0.19 145)",
    neon: "oklch(0.78 0.19 145)",
    swatch: "oklch(0.78 0.19 145)",
  },
};

const STORAGE_KEY = "moiz_accent";
const AUTO_KEY = "moiz_accent_auto";
const ATTR = "data-neon-accent";
const AUTO_ATTR = "data-neon-accent-auto";

/** Auto-mode rotation interval (ms). */
const AUTO_INTERVAL = 12000;

/** Normalize arbitrary input → a valid AccentColor, "cycle", or "auto". */
export function parseAccent(
  input: string,
): AccentColor | "cycle" | "auto" | null {
  const v = input.trim().toLowerCase();
  if (v === "cycle") return "cycle";
  if (v === "auto") return "auto";
  return (ACCENT_COLORS as string[]).includes(v) ? (v as AccentColor) : null;
}

export function getStoredAccent(): AccentColor | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v && (ACCENT_COLORS as string[]).includes(v) ? (v as AccentColor) : null;
  } catch {
    return null;
  }
}

/** Apply an accent to <html> + persist. Safe to call on the server (no-op).
 *  Also tracks which accents have been tried (for the `spectrum` achievement). */
export function applyAccent(accent: AccentColor) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute(ATTR, accent);
  try {
    localStorage.setItem(STORAGE_KEY, accent);
  } catch {
    /* ignore */
  }
  // Track for the "tried all 4 accents" achievement.
  try {
    const raw = localStorage.getItem("moiz_achievements_seen_accents");
    const seen: string[] = raw ? JSON.parse(raw) : [];
    if (!seen.includes(accent)) {
      seen.push(accent);
      localStorage.setItem(
        "moiz_achievements_seen_accents",
        JSON.stringify(seen),
      );
    }
    if (new Set(seen).size >= 4) {
      // Lazy import to avoid a circular dep at module load.
      void import("./achievements").then((m) => m.unlock("spectrum"));
    }
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent("moiz:accent", { detail: accent }));
}

/* ------------------------------------------------------------------ */
/* Auto / cycle mode — rotates the accent on a timer.                  */
/* ------------------------------------------------------------------ */

let autoTimer: ReturnType<typeof setInterval> | null = null;

export function isAutoOn(): boolean {
  try {
    return localStorage.getItem(AUTO_KEY) === "1";
  } catch {
    return false;
  }
}

/** Start auto-rotating the accent every AUTO_INTERVAL ms. */
export function startAuto() {
  if (typeof document === "undefined") return;
  try {
    localStorage.setItem(AUTO_KEY, "1");
  } catch {
    /* ignore */
  }
  document.documentElement.setAttribute(AUTO_ATTR, "1");
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = setInterval(() => {
    cycleAccent();
  }, AUTO_INTERVAL);
  // Immediately rotate once so the user sees feedback.
  cycleAccent();
  window.dispatchEvent(new CustomEvent("moiz:accent-auto", { detail: true }));
}

/** Stop auto-rotation. */
export function stopAuto() {
  if (typeof document === "undefined") return;
  try {
    localStorage.setItem(AUTO_KEY, "0");
  } catch {
    /* ignore */
  }
  document.documentElement.removeAttribute(AUTO_ATTR);
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
  window.dispatchEvent(new CustomEvent("moiz:accent-auto", { detail: false }));
}

export function toggleAuto() {
  if (isAutoOn()) stopAuto();
  else startAuto();
}

/** Resume auto-mode on mount if it was enabled (e.g. after reload). */
export function syncAutoFromStorage() {
  if (isAutoOn()) startAuto();
}

/** Read the current applied accent from <html>, falling back to stored or "amber". */
export function currentAccent(): AccentColor {
  if (typeof document !== "undefined") {
    const a = document.documentElement.getAttribute(ATTR);
    if (a && (ACCENT_COLORS as string[]).includes(a)) return a as AccentColor;
  }
  return getStoredAccent() ?? "amber";
}

/** Rotate to the next accent in the palette. */
export function cycleAccent(): AccentColor {
  const cur = currentAccent();
  const idx = ACCENT_COLORS.indexOf(cur);
  const next = ACCENT_COLORS[(idx + 1) % ACCENT_COLORS.length];
  applyAccent(next);
  return next;
}
