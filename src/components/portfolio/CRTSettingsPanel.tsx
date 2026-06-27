"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, RotateCcw, Power } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCRT } from "@/hooks/use-crt-settings";
import { useSound } from "@/hooks/use-sound";
import { unlock } from "@/lib/achievements";

/**
 * CRTSettingsPanel — MONITOR.SYS calibration modal.
 *
 * Sliders + toggles for scanline intensity, glow strength, screen curvature,
 * flicker, and a boot-skip switch. All live-applied via CSS variables on <html>
 * (see src/lib/crt-settings.ts). Opened via the header gear button or the
 * terminal `settings` command.
 */

let openPanelFn: (() => void) | null = null;
export function openCRTSettings() {
  openPanelFn?.();
}

function Slider({
  label,
  value,
  onChange,
  accent,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  accent: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between font-retro text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-primary tabular-nums">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="crt-range w-full"
        style={{ accentColor: accent }}
      />
    </div>
  );
}

function Toggle({
  label,
  desc,
  on,
  onChange,
}: {
  label: string;
  desc: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between gap-3 border border-[color-mix(in_oklch,var(--ring)_30%,transparent)] bg-card/40 px-3 py-2.5 text-left transition-colors hover:border-[color-mix(in_oklch,var(--ring)_55%,transparent)]"
      role="switch"
      aria-checked={on}
      aria-label={label}
    >
      <span>
        <span className="block font-retro text-[11px] text-primary">{label}</span>
        <span className="block font-retro text-[11px] text-muted-foreground">{desc}</span>
      </span>
      <span
        className={cn(
          "relative h-5 w-9 shrink-0 border transition-colors",
          on
            ? "border-[color-mix(in_oklch,var(--ring)_70%,transparent)] bg-[color-mix(in_oklch,var(--ring)_30%,transparent)]"
            : "border-[color-mix(in_oklch,var(--ring)_30%,transparent)] bg-transparent",
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(
            "absolute top-0.5 h-3.5 w-3.5",
            on ? "right-0.5 bg-primary" : "left-0.5 bg-muted-foreground",
          )}
          style={on ? { boxShadow: "0 0 8px var(--ring)" } : undefined}
        />
      </span>
    </button>
  );
}

export function CRTSettingsPanel() {
  const [open, setOpen] = React.useState(false);
  const { settings, update, reset } = useCRT();
  const { play } = useSound();

  React.useEffect(() => {
    openPanelFn = () => {
      setOpen(true);
      play("open");
    };
    return () => {
      openPanelFn = null;
    };
  }, [play]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        play("close");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, play]);

  const handleChange = (next: Partial<typeof settings>) => {
    update(next);
    play("click");
    // Unlock the calibrator achievement on any adjustment.
    void unlock("calibrator");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="CRT monitor settings"
          onClick={() => {
            setOpen(false);
            play("close");
          }}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.92, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md border-2 border-[color-mix(in_oklch,var(--ring)_55%,transparent)] bg-background shadow-[0_0_40px_color-mix(in_oklch,var(--ring)_30%,transparent)]"
          >
            {/* scanlines on the panel itself */}
            <div className="crt-scanlines">
              {/* title bar */}
              <div className="flex items-center justify-between border-b border-[color-mix(in_oklch,var(--ring)_40%,transparent)] bg-[color-mix(in_oklch,var(--ring)_12%,transparent)] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={13} className="text-primary" />
                  <span className="font-pixel text-[10px] text-primary">
                    MONITOR.SYS
                  </span>
                  <span className="font-retro text-[10px] text-muted-foreground">
                    {"// CRT calibration"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setOpen(false);
                    play("close");
                  }}
                  aria-label="Close settings"
                  className="grid h-6 w-6 place-items-center text-muted-foreground transition-colors hover:text-primary"
                >
                  <X size={14} />
                </button>
              </div>

              {/* body */}
              <div className="space-y-5 p-5">
                <p className="font-retro text-[10px] leading-relaxed text-muted-foreground">
                  {">"} Tune the CRT aesthetic in real time. Settings persist across
                  sessions.
                </p>

                {/* Sliders */}
                <div className="space-y-4">
                  <Slider
                    label="SCANLINES"
                    value={settings.scanlines}
                    onChange={(v) => handleChange({ scanlines: v })}
                    accent="var(--neon-amber)"
                  />
                  <Slider
                    label="NEON GLOW"
                    value={settings.glow}
                    onChange={(v) => handleChange({ glow: v })}
                    accent="var(--neon-magenta)"
                  />
                  <Slider
                    label="CURVATURE"
                    value={settings.curvature}
                    onChange={(v) => handleChange({ curvature: v })}
                    accent="var(--neon-green)"
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-2">
                  <Toggle
                    label="FLICKER"
                    desc="Subtle CRT brightness flicker"
                    on={settings.flicker}
                    onChange={(v) => handleChange({ flicker: v })}
                  />
                  <Toggle
                    label="SKIP BOOT"
                    desc="Bypass the boot sequence on future visits"
                    on={settings.bootSkip}
                    onChange={(v) => handleChange({ bootSkip: v })}
                  />
                </div>

                {/* Footer: reset + a live "signal" indicator */}
                <div className="flex items-center justify-between border-t border-[color-mix(in_oklch,var(--ring)_25%,transparent)] pt-3">
                  <button
                    onClick={() => {
                      reset();
                      play("nav");
                      void unlock("calibrator");
                    }}
                    className="flex items-center gap-1.5 border border-[color-mix(in_oklch,var(--ring)_40%,transparent)] px-2.5 py-1.5 font-retro text-[10px] text-muted-foreground transition-colors hover:text-primary"
                  >
                    <RotateCcw size={11} /> RESET DEFAULTS
                  </button>
                  <span className="flex items-center gap-1.5 font-retro text-[10px] text-[var(--neon-green)]">
                    <Power size={11} className="animate-pulse" /> SIGNAL: OK
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
