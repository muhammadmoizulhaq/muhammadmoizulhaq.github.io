"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROFILE } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";
import { unlock } from "@/lib/achievements";

/**
 * BootSequence — a one-time CRT power-on intro.
 *
 * Plays on first visit in the session (guarded by sessionStorage so it doesn't
 * replay on every HMR / navigation). Shows:
 *   1. A bright CRT power-on flash + vertical line expanding into full screen.
 *   2. A boot log typed out line-by-line (BIOS-style).
 *   3. A progress bar that fills, then "LOADING PORTFOLIO.EXE".
 *   4. Fades out to reveal the site.
 *
 * Skippable — pressing ESC / ENTER / clicking "SKIP >>" ends it instantly.
 */
const BOOT_LINES = [
  "MOIZ-BIOS v4.20 (C) 2026 UNREAL SYSTEMS",
  "CPU: UNREAL CORE @ 5.8 GHz ........ [ OK ]",
  "MEMORY: 65536 MB DDR5 ............ [ OK ]",
  "DETECTING UNREAL ENGINE .......... [ OK ]",
  "MOUNTING /dev/cpp ................ [ OK ]",
  "LOADING NETWORKING MODULES ....... [ OK ]",
  "INIT MULTIPLAYER STACK ........... [ OK ]",
  "CALIBRATING 3D RENDERER .......... [ OK ]",
  "STARTING PORTFOLIO.EXE ...........",
];

export function BootSequence() {
  const [stage, setStage] = React.useState<
    "power" | "log" | "progress" | "done"
  >("power");
  const [visible, setVisible] = React.useState(true);
  const [visibleLines, setVisibleLines] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [fading, setFading] = React.useState(false);

  // End the boot sequence (mark session, fade out, hide). Stable via useCallback.
  const finish = React.useCallback(() => {
    setFading(true);
    playSound("success");
    // Only award the "power_on" achievement if the boot actually played
    // (i.e. not when skipped via sessionStorage).
    try {
      if (sessionStorage.getItem("moiz_boot_done") !== "1") {
        unlock("power_on");
      }
    } catch {
      /* ignore */
    }
    try {
      sessionStorage.setItem("moiz_boot_done", "1");
    } catch {
      /* ignore */
    }
    setTimeout(() => {
      setVisible(false);
      setStage("done");
    }, 600);
  }, []);

  // Skip on ESC / ENTER
  React.useEffect(() => {
    const skip = () => finish();
    window.addEventListener("keydown", skip);
    return () => window.removeEventListener("keydown", skip);
  }, [finish]);

  // Already booted this session? skip entirely.
  // Also skip if the user has enabled "SKIP BOOT" in the CRT settings panel.
  React.useEffect(() => {
    try {
      const sessionDone = sessionStorage.getItem("moiz_boot_done") === "1";
      let bootSkip = false;
      try {
        const raw = localStorage.getItem("moiz_crt_settings");
        if (raw) bootSkip = (JSON.parse(raw) as { bootSkip?: boolean }).bootSkip === true;
      } catch {
        /* ignore */
      }
      if (sessionDone || bootSkip) {
        sessionStorage.setItem("moiz_boot_done", "1");
        setVisible(false);
        setStage("done");
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Stage machine: power -> log -> progress -> done
  React.useEffect(() => {
    if (!visible || stage === "done") return;

    if (stage === "power") {
      const t = setTimeout(() => setStage("log"), 900);
      return () => clearTimeout(t);
    }

    if (stage === "log") {
      if (visibleLines >= BOOT_LINES.length) {
        const t = setTimeout(() => setStage("progress"), 350);
        return () => clearTimeout(t);
      }
      const delay = visibleLines === 0 ? 200 : 220 + Math.random() * 160;
      const t = setTimeout(() => setVisibleLines((n) => n + 1), delay);
      return () => clearTimeout(t);
    }

    if (stage === "progress") {
      if (progress >= 100) {
        const t = setTimeout(() => finish(), 550);
        return () => clearTimeout(t);
      }
      const step = 4 + Math.random() * 9;
      const t = setTimeout(() => setProgress((p) => Math.min(100, p + step)), 70);
      return () => clearTimeout(t);
    }
  }, [visible, stage, visibleLines, progress, finish]);

  if (stage === "done" && !visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-[oklch(0.07_0.02_55)] ${fading ? "boot-fade-out" : ""}`}
          exit={{ opacity: 0 }}
        >
          {/* CRT power-on: a clipped wrapper that scales Y from ~0 to 1 */}
          <div className="crt-power-on absolute inset-0 overflow-hidden">
            {/* white flash */}
            <div className="boot-flash absolute inset-0 bg-[oklch(0.95_0.04_80)]" />
            {/* sweep line */}
            <div className="boot-sweep absolute left-0 top-0 h-[3px] w-full bg-[var(--neon-amber)] shadow-[0_0_18px_4px_var(--neon-amber)]" />

            {/* scanlines */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  "repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.25) 3px, rgba(0,0,0,0.25) 4px)",
              }}
            />
          </div>

          {/* Boot terminal content */}
          <div className="relative z-10 w-full max-w-2xl px-6">
            <div className="mb-4 flex items-center justify-between font-pixel text-[11px] neon-amber">
              <span>{"// MOIZ-BIOS BOOT"}</span>
              <button
                onClick={finish}
                className="border border-[color-mix(in_oklch,var(--neon-amber)_50%,transparent)] px-2 py-1 transition-colors hover:bg-[color-mix(in_oklch,var(--neon-amber)_18%,transparent)]"
              >
                SKIP {">>"}
              </button>
            </div>

            {/* log window */}
            <div className="h-[260px] overflow-hidden border border-[color-mix(in_oklch,var(--neon-amber)_35%,transparent)] bg-[oklch(0.09_0.02_55)] p-4 font-retro text-sm leading-relaxed">
              {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={
                    i === BOOT_LINES.length - 1
                      ? "neon-green"
                      : line.includes("[ OK ]")
                        ? "text-foreground/90"
                        : "neon-amber"
                  }
                >
                  {line.includes("[ OK ]") ? (
                    <>
                      {line.replace("[ OK ]", "")}
                      <span className="neon-green">[ OK ]</span>
                    </>
                  ) : (
                    line
                  )}
                </motion.div>
              ))}
              {stage !== "log" && visibleLines >= BOOT_LINES.length && (
                <div className="mt-2 neon-green blink-cursor">_</div>
              )}
            </div>

            {/* progress bar */}
            {stage === "progress" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5"
              >
                <div className="mb-2 flex items-center justify-between font-pixel text-[11px] neon-amber">
                  <span>LOADING PORTFOLIO.EXE</span>
                  <span>{Math.floor(progress)}%</span>
                </div>
                <div className="flex h-4 gap-1 border border-[color-mix(in_oklch,var(--neon-amber)_40%,transparent)] bg-[oklch(0.09_0.02_55)] p-1">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const filled = (i / 30) * 100 < progress;
                    return (
                      <div
                        key={i}
                        className="h-full flex-1 transition-colors"
                        style={{
                          background: filled ? "var(--neon-amber)" : "transparent",
                          boxShadow: filled
                            ? "0 0 6px var(--neon-amber)"
                            : "none",
                        }}
                      />
                    );
                  })}
                </div>
                <div className="mt-3 text-center font-retro text-xs text-muted-foreground">
                  Welcome, {PROFILE.name.split(" ")[0]}. Press{" "}
                  <span className="neon-amber">ESC</span> to skip.
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
