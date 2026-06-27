"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X, History } from "lucide-react";
import { useAchievements } from "@/hooks/use-achievements";
import {
  ACHIEVEMENTS,
  RARITY_META,
  achievementById,
  achievementPoints,
  unlockedIds,
  unlockLog,
  formatUnlockTime,
  achievementProgress,
} from "@/lib/achievements";
import { useSound } from "@/hooks/use-sound";
import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

/** Auto-dismiss delay (ms) for each achievement toast. */
const TOAST_AUTO_DISMISS_MS = 10_000;

/**
 * AchievementToast — slides a retro "ACHIEVEMENT UNLOCKED" toast in from the
 * top-right whenever a new achievement is unlocked. Stacks up to 3 at a time.
 * Plays the `success` chiptune on each new unlock. Each visible toast
 * auto-dismisses after {@link TOAST_AUTO_DISMISS_MS} (10s) unless hovered.
 */
export function AchievementToast() {
  const { pending, dismiss } = useAchievements();
  const { muted } = useSound();

  // Play the success fanfare when a new pending toast appears.
  const prevCount = React.useRef(0);
  React.useEffect(() => {
    if (pending.length > prevCount.current && !muted) {
      playSound("success");
    }
    prevCount.current = pending.length;
  }, [pending.length, muted]);

  // Cap to 3 visible; older pending items stay in queue (will appear as
  // earlier ones are dismissed).
  const visible = pending.slice(-3);

  return (
    <div
      className="pointer-events-none fixed right-4 top-20 z-[120] flex w-[min(92vw,340px)] flex-col gap-2"
      aria-live="assertive"
    >
      <AnimatePresence>
        {visible.map((id) => (
          <AchievementToastItem key={id} id={id} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AchievementToastItem — single toast with 10s auto-dismiss timer    */
/* + glitch enter/exit animations.                                     */
/* ------------------------------------------------------------------ */

type ToastItemProps = {
  id: string;
  onDismiss: (id: string) => void;
};

function AchievementToastItem({ id, onDismiss }: ToastItemProps) {
  // Hover state — pause the auto-dismiss countdown while the user is
  // interacting with the toast (e.g. reading the description).
  const [hovered, setHovered] = React.useState(false);
  const remaining = React.useRef(TOAST_AUTO_DISMISS_MS);
  const startedAt = React.useRef<number>(0);
  const rafRef = React.useRef<number | null>(null);

  // Countdown loop: tick `remaining` down using rAF + timestamps. Pauses
  // cleanly while `hovered` is true and resumes from where it left off.
  React.useEffect(() => {
    startedAt.current = performance.now();
    const tick = (now: number) => {
      if (!hovered) {
        const delta = now - startedAt.current;
        startedAt.current = now;
        remaining.current -= delta;
        if (remaining.current <= 0) {
          onDismiss(id);
          return;
        }
      } else {
        // While paused, keep `startedAt` fresh so the delta doesn't
        // accumulate across the pause.
        startedAt.current = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [id, onDismiss, hovered]);

  const a = achievementById(id);
  if (!a) return null;
  const r = RARITY_META[a.rarity];

  return (
    <motion.div
      layout
      // Glitch ENTER — chromatic aberration burst + x-jitter + scaleY snap.
      initial={{
        opacity: 0,
        x: 90,
        scaleY: 0.35,
        filter:
          "drop-shadow(6px 0 0 var(--neon-magenta)) drop-shadow(-6px 0 0 var(--neon-green)) brightness(1.4)",
      }}
      animate={{
        opacity: [0, 0.5, 0.8, 1, 0.92, 1],
        x: [90, -18, 12, -5, 2, 0],
        scaleY: [0.35, 1.08, 0.94, 1.02, 1, 1],
        filter: [
          "drop-shadow(6px 0 0 var(--neon-magenta)) drop-shadow(-6px 0 0 var(--neon-green)) brightness(1.4)",
          "drop-shadow(-4px 0 0 var(--neon-magenta)) drop-shadow(4px 0 0 var(--neon-green)) brightness(1.2)",
          "drop-shadow(2px 0 0 var(--neon-magenta)) drop-shadow(-2px 0 0 var(--neon-green)) brightness(1.1)",
          "drop-shadow(1px 0 0 var(--neon-magenta)) drop-shadow(-1px 0 0 var(--neon-green)) brightness(1.05)",
          "drop-shadow(0 0 0 transparent) brightness(1)",
          "drop-shadow(0 0 0 transparent) brightness(1)",
        ],
        transition: {
          duration: 0.55,
          ease: "easeOut",
          times: [0, 0.18, 0.36, 0.55, 0.78, 1],
        },
      }}
      // Glitch EXIT — reverse burst, slides out to the right and dissolves.
      exit={{
        opacity: [1, 0.85, 0.5, 0],
        x: [0, -8, 30, 110],
        scaleY: [1, 0.96, 0.7, 0.4],
        filter: [
          "drop-shadow(0 0 0 transparent) brightness(1)",
          "drop-shadow(3px 0 0 var(--neon-magenta)) drop-shadow(-3px 0 0 var(--neon-green)) brightness(1.2)",
          "drop-shadow(6px 0 0 var(--neon-magenta)) drop-shadow(-6px 0 0 var(--neon-green)) brightness(1.4)",
          "drop-shadow(10px 0 0 var(--neon-magenta)) drop-shadow(-10px 0 0 var(--neon-green)) brightness(1.6)",
        ],
        transition: {
          duration: 0.38,
          ease: "easeIn",
          times: [0, 0.33, 0.66, 1],
        },
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="glitch-toast pointer-events-auto relative overflow-hidden border bg-[oklch(0.1_0.03_55)]/95 p-3 backdrop-blur-sm"
      style={{
        borderColor: r.color,
        boxShadow: `0 0 18px -4px ${r.glow}, inset 0 0 22px -12px ${r.glow}`,
      }}
    >
      {/* scanlines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          background:
            "repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.25) 3px, rgba(0,0,0,0.25) 4px)",
        }}
      />
      {/* Auto-dismiss progress bar — drains over 10s, pauses on hover. */}
      <AutoDismissProgress
        paused={hovered}
        duration={TOAST_AUTO_DISMISS_MS}
        color={r.color}
        glow={r.glow}
      />
      <button
        onClick={() => onDismiss(id)}
        aria-label="Dismiss achievement"
        className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center text-muted-foreground transition-colors hover:text-foreground"
      >
        <X size={12} />
      </button>

      <div className="relative flex items-start gap-3">
        <div
          className="grid h-9 w-9 shrink-0 place-items-center border"
          style={{ borderColor: r.color, color: r.color }}
        >
          <Trophy size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="font-pixel text-[11px] tracking-wider opacity-80"
            style={{ color: r.color }}
          >
            ACHIEVEMENT UNLOCKED
          </div>
          <div className="mt-0.5 font-pixel text-[11px] text-foreground">
            {a.title}
          </div>
          <div className="mt-1 font-retro text-[11px] leading-tight text-muted-foreground">
            {a.desc}
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className="border px-1 py-0.5 font-pixel text-[7px]"
              style={{ borderColor: r.color, color: r.color }}
            >
              {r.label}
            </span>
            <span className="font-retro text-[10px] text-muted-foreground">
              +{a.pts} PTS
            </span>
            {hovered && (
              <span className="ml-auto font-pixel text-[7px] text-muted-foreground/70">
                PAUSED
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* AutoDismissProgress — a thin draining bar at the bottom of the      */
/* toast that visualizes the remaining time before auto-dismiss.       */
/* ------------------------------------------------------------------ */

function AutoDismissProgress({
  paused,
  duration,
  color,
  glow,
}: {
  paused: boolean;
  duration: number;
  color: string;
  glow: string;
}) {
  // Restart the animation from full whenever `paused` toggles so the bar
  // reflects the actual remaining time (the parent rAF loop pauses too).
  const [runKey, setRunKey] = React.useState(0);
  React.useEffect(() => {
    setRunKey((k) => k + 1);
  }, [paused]);

  return (
    <div className="absolute inset-x-0 bottom-0 h-[3px] overflow-hidden bg-black/40">
      <motion.div
        key={runKey}
        initial={{ width: "100%" }}
        animate={{ width: paused ? "100%" : "0%" }}
        transition={{
          duration: paused ? 0 : duration / 1000,
          ease: "linear",
        }}
        style={{
          background: color,
          boxShadow: `0 0 6px ${glow}`,
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AchievementsPanel — full scoreboard modal (opened by terminal/cmd). */
/* ------------------------------------------------------------------ */

let openPanelFn: (() => void) | null = null;
export function openAchievementsPanel() {
  openPanelFn?.();
}

export function AchievementsPanel() {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<"grid" | "log">("grid");
  const { play } = useSound();
  const [unlocked, setUnlocked] = React.useState<string[]>([]);
  const [points, setPoints] = React.useState(0);
  const [log, setLog] = React.useState<{ id: string; ts: number; title: string }[]>([]);

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
    if (open) {
      setUnlocked(unlockedIds());
      setPoints(achievementPoints());
      setLog(unlockLog());
    }
  }, [open]);

  // ESC closes
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

  const total = ACHIEVEMENTS.length;
  const count = unlocked.length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
              play("close");
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="term-in neon-border-amber relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden bg-[oklch(0.1_0.025_55)]"
          >
            {/* title bar */}
            <div className="flex items-center justify-between border-b border-[color-mix(in_oklch,var(--neon-amber)_30%,transparent)] bg-[oklch(0.13_0.03_55)] px-4 py-2.5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 font-pixel text-[11px] neon-amber">
                  <Trophy size={12} /> SCOREBOARD.DAT
                </div>
                {/* Tab switcher */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setTab("grid"); play("click"); }}
                    className={cn(
                      "flex items-center gap-1 border px-2 py-0.5 font-pixel text-[7px] transition-colors",
                      tab === "grid"
                        ? "border-[var(--neon-amber)] bg-[color-mix(in_oklch,var(--neon-amber)_16%,transparent)] text-[var(--neon-amber)]"
                        : "border-[color-mix(in_oklch,var(--ring)_25%,transparent)] text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Trophy size={9} /> GRID
                  </button>
                  <button
                    onClick={() => { setTab("log"); play("click"); }}
                    className={cn(
                      "flex items-center gap-1 border px-2 py-0.5 font-pixel text-[7px] transition-colors",
                      tab === "log"
                        ? "border-[var(--neon-green)] bg-[color-mix(in_oklch,var(--neon-green)_16%,transparent)] text-[var(--neon-green)]"
                        : "border-[color-mix(in_oklch,var(--ring)_25%,transparent)] text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <History size={9} /> LOG
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-pixel text-[11px] neon-green">
                  {count}/{total}
                </span>
                <span className="font-pixel text-[11px] text-primary">
                  {points} PTS
                </span>
                <button
                  onClick={() => {
                    setOpen(false);
                    play("close");
                  }}
                  onMouseEnter={() => play("hover")}
                  aria-label="Close scoreboard"
                  className="grid h-6 w-6 place-items-center border border-[color-mix(in_oklch,var(--neon-amber)_40%,transparent)] text-[var(--neon-amber)] transition-colors hover:bg-[color-mix(in_oklch,var(--neon-amber)_18%,transparent)]"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* progress bar */}
            <div className="border-b border-[color-mix(in_oklch,var(--neon-amber)_20%,transparent)] px-4 py-2">
              <div className="mb-1 flex items-center justify-between font-retro text-[10px] text-muted-foreground">
                <span>COMPLETION</span>
                <span className="text-primary">
                  {Math.round((count / total) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden border border-[color-mix(in_oklch,var(--ring)_30%,transparent)] bg-background/60">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / total) * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--neon-green), var(--neon-amber))",
                    boxShadow: "0 0 10px var(--neon-amber)",
                  }}
                />
              </div>
            </div>

            {/* body: grid (default) or unlock log (LOG tab) */}
            <div className="flex-1 overflow-y-auto p-4 max-h-[60vh]">
              {tab === "grid" ? (
                <>
                  {/* recent unlocks strip — last 5 unlocked (newest first) */}
                  {unlocked.length > 0 && (
                    <div className="mb-3 border border-[color-mix(in_oklch,var(--neon-amber)_15%,transparent)] bg-[oklch(0.11_0.025_55)] px-3 py-2">
                      <div className="mb-1.5 font-pixel text-[11px] neon-green opacity-80">
                        {"//"} RECENT UNLOCKS
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[...unlocked]
                          .reverse()
                          .slice(0, 5)
                          .map((id, i) => {
                            const a = achievementById(id);
                            if (!a) return null;
                            const r = RARITY_META[a.rarity];
                            const isNewest = i === 0;
                            return (
                              <span
                                key={id}
                                title={`${a.title} — ${a.desc}`}
                                className="inline-flex items-center gap-1 border px-1.5 py-0.5 font-retro text-[10px]"
                                style={{
                                  borderColor: r.color,
                                  color: r.color,
                                  background: `color-mix(in oklch, ${r.color} 10%, transparent)`,
                                  boxShadow: isNewest
                                    ? `0 0 8px -2px ${r.glow}`
                                    : "none",
                                }}
                              >
                                <Trophy size={9} />
                                {a.title}
                                {isNewest && (
                                  <span className="ml-0.5 animate-pulse font-pixel text-[7px] opacity-80">
                                    NEW
                                  </span>
                                )}
                              </span>
                            );
                          })}
                        {unlocked.length > 5 && (
                          <button
                            onClick={() => { setTab("log"); play("click"); }}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 font-retro text-[10px] text-muted-foreground transition-colors hover:text-[var(--neon-green)]"
                          >
                            +{unlocked.length - 5} more →
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {ACHIEVEMENTS.map((a) => {
                      const got = unlocked.includes(a.id);
                      const r = RARITY_META[a.rarity];
                      return (
                        <div
                          key={a.id}
                          className="relative flex items-start gap-3 border p-3 transition-colors"
                          style={{
                            borderColor: got
                              ? r.color
                              : "color-mix(in oklch, var(--ring) 18%, transparent)",
                            background: got
                              ? `color-mix(in oklch, ${r.color} 8%, transparent)`
                              : "transparent",
                            opacity: got ? 1 : 0.55,
                          }}
                        >
                          <div
                            className="grid h-8 w-8 shrink-0 place-items-center border"
                            style={{
                              borderColor: got
                                ? r.color
                                : "color-mix(in oklch, var(--ring) 30%, transparent)",
                              color: got ? r.color : "var(--muted-foreground)",
                              boxShadow: got ? `0 0 8px -2px ${r.glow}` : "none",
                            }}
                          >
                            {got ? <Trophy size={14} /> : "?"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className="font-pixel text-[10px]"
                                style={{
                                  color: got ? r.color : "var(--muted-foreground)",
                                }}
                              >
                                {got ? a.title : "???"}
                              </span>
                              <span
                                className="border px-1 font-pixel text-[6px]"
                                style={{
                                  borderColor: r.color,
                                  color: r.color,
                                }}
                              >
                                {r.label}
                              </span>
                            </div>
                            <div className="mt-1 font-retro text-[11px] leading-tight text-muted-foreground">
                              {got ? a.desc : "— locked —"}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="font-retro text-[10px] text-muted-foreground/70">
                                +{a.pts} PTS
                              </span>
                              {!got && (() => {
                                const prog = achievementProgress(a.id);
                                if (!prog) return null;
                                const pct = Math.round((prog.current / prog.target) * 100);
                                return (
                                  <span className="flex items-center gap-1.5" title={`Progress: ${prog.current}/${prog.target} ${prog.label}`}>
                                    <span className="font-retro text-[11px] text-muted-foreground/80 tabular-nums">
                                      {prog.current}/{prog.target} {prog.label}
                                    </span>
                                    <span className="relative h-1 w-12 overflow-hidden border border-[color-mix(in_oklch,var(--ring)_30%,transparent)] bg-background/60">
                                      <span
                                        className="absolute inset-y-0 left-0"
                                        style={{
                                          width: `${pct}%`,
                                          background: r.color,
                                          boxShadow: `0 0 4px ${r.glow}`,
                                        }}
                                      />
                                    </span>
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* LOG tab — full timestamped unlock history */
                <div>
                  <div className="mb-3 flex items-center gap-2 font-pixel text-[11px] neon-green opacity-80">
                    <History size={11} /> {"//"} UNLOCK LOG
                    <span className="font-retro text-[10px] text-muted-foreground">
                      ({log.length} {log.length === 1 ? "entry" : "entries"})
                    </span>
                  </div>
                  {log.length === 0 ? (
                    <div className="py-10 text-center font-retro text-sm text-muted-foreground">
                      {">"} no unlocks logged yet — start interacting!
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {log.map((e, i) => {
                        const a = achievementById(e.id);
                        if (!a) return null;
                        const r = RARITY_META[a.rarity];
                        return (
                          <motion.div
                            key={`${e.id}-${e.ts}`}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="flex items-center gap-3 border-l-2 px-3 py-2"
                            style={{
                              borderColor: r.color,
                              background: `color-mix(in oklch, ${r.color} 6%, transparent)`,
                            }}
                          >
                            <span className="font-pixel text-[11px] text-muted-foreground tabular-nums">
                              {String(log.length - i).padStart(2, "0")}
                            </span>
                            <Trophy size={11} style={{ color: r.color }} />
                            <div className="min-w-0 flex-1">
                              <span
                                className="font-pixel text-[11px]"
                                style={{ color: r.color }}
                              >
                                {a.title}
                              </span>
                              <span className="ml-2 font-retro text-[10px] text-muted-foreground">
                                {a.desc}
                              </span>
                            </div>
                            <span className="shrink-0 font-retro text-[10px] text-muted-foreground tabular-nums">
                              {formatUnlockTime(e.ts)}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-[color-mix(in_oklch,var(--neon-amber)_25%,transparent)] bg-[oklch(0.12_0.025_55)] px-4 py-2 text-center font-retro text-[10px] text-muted-foreground">
              Interact with the site to unlock more ·{" "}
              <kbd className="text-primary/70">ESC</kbd> to close
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
