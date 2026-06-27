"use client";

import * as React from "react";
import {
  getCRT,
  setCRT,
  resetCRT,
  applyCRT,
  CRT_EVENT,
  type CRTSettings,
} from "@/lib/crt-settings";

/**
 * Reactive hook over the CRT settings store. Re-renders subscribers when the
 * settings change (via the `moiz:crt` custom event) and exposes setters.
 * Also applies persisted settings to <html> on first mount so the CRT overlay
 * reflects the user's tuning from the very first paint after hydration.
 */
export function useCRT() {
  const [settings, setSettings] = React.useState<CRTSettings>(() => getCRT());

  React.useEffect(() => {
    // Apply persisted (or default) settings to the DOM now.
    applyCRT(getCRT());
    setSettings(getCRT());
    const on = (e: Event) => {
      const ce = e as CustomEvent<CRTSettings>;
      setSettings(ce.detail ?? getCRT());
    };
    window.addEventListener(CRT_EVENT, on);
    return () => window.removeEventListener(CRT_EVENT, on);
  }, []);

  const update = React.useCallback((next: Partial<CRTSettings>) => {
    setSettings(setCRT(next));
  }, []);

  const reset = React.useCallback(() => {
    setSettings(resetCRT());
  }, []);

  return { settings, update, reset };
}
