"use client";

import * as React from "react";
import {
  ACCENT_COLORS,
  ACCENT_LABELS,
  applyAccent,
  cycleAccent,
  currentAccent,
  getStoredAccent,
  isAutoOn,
  startAuto,
  stopAuto,
  syncAutoFromStorage,
  type AccentColor,
} from "@/lib/accent";

/**
 * useAccent — reactive hook for the site's accent color + auto-rotation mode.
 *
 * Returns the current accent + setters. Listens to the `moiz:accent` custom
 * event (dispatched by applyAccent / the terminal command / other instances)
 * so all mounted consumers stay in sync. Also restores the stored accent on
 * mount and resumes auto-rotation if it was previously enabled.
 */
export function useAccent() {
  const [accent, setAccent] = React.useState<AccentColor>("amber");
  const [auto, setAuto] = React.useState(false);

  // Restore persisted accent on mount (client only).
  React.useEffect(() => {
    const stored = getStoredAccent();
    const initial = stored ?? currentAccent();
    setAccent(initial);
    // Ensure the <html> attribute reflects stored value (e.g. after refresh).
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-neon-accent", initial);
    }
    // Default to auto-rotation ON for new visitors (no stored preference).
    // Returning visitors keep their previous choice (on or off).
    const autoStored = typeof localStorage !== "undefined" && localStorage.getItem("moiz_accent_auto");
    if (!autoStored) {
      // New visitor — enable auto-rotation by default.
      startAuto();
      setAuto(true);
    } else {
      setAuto(isAutoOn());
      syncAutoFromStorage();
    }
  }, []);

  // Keep in sync with other callers (terminal, other swatches).
  React.useEffect(() => {
    const onAccent = (e: Event) => {
      const detail = (e as CustomEvent<AccentColor>).detail;
      if (detail && (ACCENT_COLORS as string[]).includes(detail)) {
        setAccent(detail as AccentColor);
      }
    };
    const onAuto = (e: Event) => {
      setAuto((e as CustomEvent<boolean>).detail);
    };
    window.addEventListener("moiz:accent", onAccent);
    window.addEventListener("moiz:accent-auto", onAuto);
    return () => {
      window.removeEventListener("moiz:accent", onAccent);
      window.removeEventListener("moiz:accent-auto", onAuto);
    };
  }, []);

  const set = React.useCallback((a: AccentColor) => {
    // Picking a specific accent stops auto-rotation.
    if (isAutoOn()) stopAuto();
    applyAccent(a);
    setAccent(a);
  }, []);

  const cycle = React.useCallback(() => {
    const next = cycleAccent();
    setAccent(next);
    return next;
  }, []);

  const toggleAuto = React.useCallback(() => {
    if (isAutoOn()) {
      stopAuto();
      setAuto(false);
    } else {
      startAuto();
      setAuto(true);
    }
  }, []);

  return {
    accent,
    auto,
    set,
    cycle,
    toggleAuto,
    colors: ACCENT_COLORS,
    labels: ACCENT_LABELS,
  };
}
