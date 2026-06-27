"use client";

import * as React from "react";
import { startWarmthTimer } from "@/lib/warmth";

/** Global CRT scanline overlay. Fixed, non-interactive, above content.
 *  The curvature vignette opacity is driven by the --crt-curvature CSS
 *  variable (set by src/lib/crt-settings.ts), so the MONITOR.SYS panel's
 *  CURVATURE slider visibly strengthens/dims the screen-edge darkening.
 *  Also starts the day/night warmth timer (see src/lib/warmth.ts) which
 *  applies a subtle warm tint based on the visitor's local hour. */
export function CRTOverlay() {
  React.useEffect(() => startWarmthTimer(), []);

  return (
    <>
      <div className="crt-overlay" aria-hidden />
      {/* day/night warmth tint — invisible by day, amber at night */}
      <div className="crt-warmth" aria-hidden />
      {/* subtle screen curvature vignette — opacity follows --crt-curvature */}
      <div
        aria-hidden
        className="crt-curvature"
      />
    </>
  );
}
