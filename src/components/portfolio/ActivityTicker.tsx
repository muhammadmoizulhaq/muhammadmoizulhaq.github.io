"use client";

import * as React from "react";
import { useAccent } from "@/hooks/use-accent";
import { useSound } from "@/hooks/use-sound";
import { useAchievements } from "@/hooks/use-achievements";
import { ACCENT_LABELS } from "@/lib/accent";
import { PROFILE, PROJECTS, EXPERIENCES } from "@/lib/portfolio-data";
import { getVisit, VISIT_EVENT, type VisitState } from "@/lib/visitor";
import { getWarmthPhase, WARMTH_EVENT, type WarmthPhase } from "@/lib/warmth";

/**
 * ActivityTicker — a thin retro "status line" bar that sits above the footer.
 * Rotates through live system facts: current accent, uptime, audio state, a
 * random dev fact, project count, etc. Feels like a live terminal status line.
 *
 * Also has a left "live" indicator (blinking dot) for that always-on feel.
 */
const DEV_FACTS = [
  "Unreal C++ > Blueprints for performance-critical systems",
  "Shipped multiplayer netcode for MyWhoosh cycling sim",
  "Prefers GameplayAbilitySystem for ability-driven combat",
  "Subscribed to the church of cache-friendly data layouts",
  "Voxel Maelstrom ran on a custom procedural mesh pipeline",
  "Console dev veteran — knows the cost of every allocation",
  "Profiles first, optimizes second, never guesses",
  "Builds tools that make designers happy",
  "Rep's OZ → BIG IMMERSIVE → iBLOXX → Devsinc → MyWhoosh",
  "Remote worldwide from Abu Dhabi",
  "Type 'play' in the terminal for a hidden arcade surprise",
  "Konami code → glitch storm (try it!)",
  "Press / for the command terminal · ? for keybindings",
  "Press B for the boss key (stealth mode!)",
  "Type 'matrix' to enter the digital rain",
  "Type 'settings' to calibrate your CRT monitor",
];

function useUptime() {
  const [secs, setSecs] = React.useState(0);
  React.useEffect(() => {
    const start = Date.now();
    const t = setInterval(() => setSecs(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function ActivityTicker() {
  const { accent } = useAccent();
  const { muted, padOn } = useSound();
  const { count, total, points } = useAchievements();
  const uptime = useUptime();

  // All localStorage/time-derived state starts deterministic so server & client
  // first render agree → no hydration mismatch. Real values hydrate in effects.
  const [visit, setVisit] = React.useState<VisitState>(() => ({
    streak: 1, best: 1, totalDays: 1, today: "", welcomeBack: false,
  }));
  const [warmth, setWarmth] = React.useState<WarmthPhase>(() => ({
    hue: 0, alpha: 0, light: 1, label: "DAY",
  }));
  const [facts, setFacts] = React.useState<string[]>(() => DEV_FACTS.slice(0, 4));
  const [snakeHigh, setSnakeHigh] = React.useState("0");

  React.useEffect(() => {
    setVisit(getVisit());
    setWarmth(getWarmthPhase());
    setFacts([...DEV_FACTS].sort(() => Math.random() - 0.5).slice(0, 4));
    try {
      setSnakeHigh(localStorage.getItem("moiz_snake_high") || "0");
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    const onVisit = () => setVisit(getVisit());
    const onWarmth = () => setWarmth(getWarmthPhase());
    window.addEventListener(VISIT_EVENT, onVisit);
    window.addEventListener(WARMTH_EVENT, onWarmth);
    return () => {
      window.removeEventListener(VISIT_EVENT, onVisit);
      window.removeEventListener(WARMTH_EVENT, onWarmth);
    };
  }, []);

  const lines = React.useMemo(() => {
    return [
      `ACCENT: ${ACCENT_LABELS[accent]}`,
      `UPTIME: ${uptime}`,
      `AUDIO: ${muted ? "MUTED" : padOn ? "PAD+BLIPS" : "BLIPS"}`,
      `PROJECTS INDEXED: ${PROJECTS.length}`,
      `EXPERIENCES LOGGED: ${EXPERIENCES.length}`,
      `ACHIEVEMENTS: ${count}/${total} (${points} PTS)`,
      `SNAKE HI-SCORE: ${snakeHigh}`,
      `VISIT STREAK: ${visit.streak} DAY${visit.streak === 1 ? "" : "S"} (BEST ${visit.best})`,
      `CRT PHASE: ${warmth.label}`,
      `NODE: ${PROFILE.location.toUpperCase()}`,
      ...facts.map((f) => `// ${f}`),
    ];
  }, [accent, muted, padOn, uptime, PROFILE.location, count, total, points, visit.streak, visit.best, warmth.label, snakeHigh, facts]);

  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % lines.length), 3200);
    return () => clearInterval(t);
  }, [lines.length]);

  // duplicate the list for a seamless marquee sweep
  const marquee = [...lines, ...lines];

  return (
    <div
      className="relative z-20 border-y border-[color-mix(in_oklch,var(--ring)_28%,transparent)] bg-[oklch(0.1_0.03_55)]/80 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label={`Status: ${lines[idx]}`}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-1.5 md:px-6">
        {/* live indicator */}
        <span className="flex shrink-0 items-center gap-1.5 font-pixel text-[11px] text-primary">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
            style={{ boxShadow: "0 0 6px var(--primary)", animation: "blink-cursor 1.4s steps(2) infinite" }}
          />
          LIVE
        </span>

        {/* marquee sweep */}
        <div className="relative flex-1 overflow-hidden">
          <div
            className="flex whitespace-nowrap font-retro text-xs text-muted-foreground"
            style={{ animation: "ticker-sweep 38s linear infinite" }}
          >
            {marquee.map((l, i) => (
              <span key={i} className="mx-6 inline-flex items-center gap-2">
                <span className="text-primary/60">▸</span>
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* current status (changes every 3.2s) */}
        <span className="hidden shrink-0 font-pixel text-[11px] text-primary/90 sm:block">
          {lines[idx]}
        </span>
      </div>
    </div>
  );
}
