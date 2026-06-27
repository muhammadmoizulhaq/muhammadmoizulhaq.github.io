"use client";

import * as React from "react";
import {
  Menu,
  X,
  Volume2,
  VolumeX,
  Music,
  Music2,
  Printer,
  Trophy,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { cn, withBasePath } from "@/lib/utils";
import { PROFILE } from "@/lib/portfolio-data";
import { Tilt3D } from "./Tilt3D";
import { useAccent } from "@/hooks/use-accent";
import { useSound } from "@/hooks/use-sound";
import { useAchievements } from "@/hooks/use-achievements";
import { ACCENT_VARS, type AccentColor } from "@/lib/accent";
import { AudioVisualizer } from "./AudioVisualizer";
import { openAchievementsPanel } from "./AchievementToast";
import { openCRTSettings } from "./CRTSettingsPanel";
import type { PadPreset } from "@/lib/sound";

const NAV = [
  { id: "about", label: "ABOUT" },
  { id: "experience", label: "EXPERIENCE" },
  { id: "projects", label: "PROJECTS" },
  { id: "skills", label: "SKILLS" },
  { id: "contact", label: "CONTACT" },
];

export function Header() {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<string>("about");
  const [scrolled, setScrolled] = React.useState(false);
  const { accent, set, auto, toggleAuto } = useAccent();
  const { muted, toggle, play, padOn, togglePad, preset, setPreset } = useSound();
  const { count, total } = useAchievements();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    const ids = NAV.map((n) => n.id);
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const go = (id: string) => {
    setOpen(false);
    play("nav");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onPrint = () => {
    play("click");
    // Open the resume PDF in a new tab — the browser print dialog lets the user
    // print to a physical printer, or "Save as PDF" when no printer is found.
    void import("@/lib/achievements").then((m) => m.unlock("archivist"));
    window.open(withBasePath("/resume/Muhammad-Moiz-Resume.pdf"), "_blank", "noopener,noreferrer");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        scrolled
          ? "border-[color-mix(in_oklch,var(--ring)_40%,transparent)] bg-background/85 backdrop-blur-sm"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 md:px-6">
        <button
          onClick={() => go("top")}
          className="group flex items-center gap-3"
          aria-label="Go to top"
        >
          <Tilt3D max={20} glare={false} scale={1.08} className="h-9 w-9">
            <span className="grid h-full w-full place-items-center border border-[color-mix(in_oklch,var(--ring)_60%,transparent)] bg-card font-pixel text-xs text-primary transition-colors">
              {PROFILE.monogram}
            </span>
          </Tilt3D>
          <span className="hidden font-pixel text-[10px] leading-tight text-primary sm:block">
            MOIZ.dev
            <span className="block text-[11px] neon-green opacity-80">v1.0</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              onMouseEnter={() => play("hover")}
              className={cn(
                "px-3 py-2 font-pixel text-[11px] transition-all duration-200",
                active === n.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary hover:-translate-y-px",
              )}
            >
              <span className="mr-1 opacity-60">{">"}</span>
              {n.label}
            </button>
          ))}
        </nav>

        {/* Right cluster: accent swatches + sound + pad + print + achievements + menu */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Accent swatches (incl. AUTO 5th "swatch") */}
          <div
            className="hidden items-center gap-1.5 sm:flex"
            role="group"
            aria-label="Accent color switcher"
          >
            {(["amber", "orange", "magenta", "green"] as AccentColor[]).map((c) => {
              const isActive = accent === c && !auto;
              return (
                <button
                  key={c}
                  onClick={() => {
                    set(c);
                    play("click");
                  }}
                  onMouseEnter={() => play("hover")}
                  aria-label={`Set accent to ${c}`}
                  aria-pressed={isActive}
                  className={cn(
                    "h-4 w-4 border transition-all",
                    isActive
                      ? "scale-125 border-foreground"
                      : "border-transparent opacity-60 hover:opacity-100 hover:scale-110",
                  )}
                  style={{
                    background: ACCENT_VARS[c].swatch,
                    boxShadow: isActive
                      ? `0 0 8px ${ACCENT_VARS[c].swatch}`
                      : "none",
                  }}
                />
              );
            })}
            {/* AUTO 5th swatch — cycles through all 4 on a timer */}
            <button
              onClick={() => {
                toggleAuto();
                play("click");
              }}
              onMouseEnter={() => play("hover")}
              aria-label={auto ? "Stop auto-rotating accent" : "Auto-rotate accent"}
              aria-pressed={auto}
              title="Auto-rotate accent every 12s"
              className={cn(
                "grid h-4 w-4 place-items-center border transition-all",
                auto
                  ? "scale-125 border-foreground text-foreground"
                  : "border-transparent text-muted-foreground opacity-60 hover:opacity-100 hover:scale-110",
              )}
              style={{
                background: auto
                  ? "conic-gradient(from 0deg, var(--neon-amber), var(--neon-orange), var(--neon-magenta), var(--neon-green), var(--neon-amber))"
                  : "transparent",
                boxShadow: auto ? "0 0 8px var(--ring)" : "none",
              }}
            >
              <RefreshCw size={8} className={auto ? "animate-spin [animation-duration:3s]" : ""} />
            </button>
          </div>

          {/* Pad preset switcher — only visible when pad is on. Click cycles drone→arp→pad. */}
          {padOn && (
            <button
              onClick={() => {
                const order: PadPreset[] = ["drone", "arp", "pad"];
                const next = order[(order.indexOf(preset) + 1) % order.length];
                setPreset(next);
                play("click");
              }}
              onMouseEnter={() => play("hover")}
              aria-label={`Pad preset: ${preset}. Click to switch.`}
              title={`Pad preset: ${preset.toUpperCase()} — click to switch`}
              className="hidden items-center gap-1.5 border border-[color-mix(in_oklch,var(--ring)_55%,transparent)] bg-[color-mix(in_oklch,var(--ring)_10%,transparent)] px-2 py-1 font-retro text-[11px] text-primary transition-all hover:bg-[color-mix(in_oklch,var(--ring)_20%,transparent)] lg:inline-flex"
            >
              <Music2 size={10} className="animate-pulse" />
              <span className="hidden xl:inline">♫ {preset.toUpperCase()}</span>
              <span className="xl:hidden">♫</span>
            </button>
          )}

          {/* Sound mute toggle */}
          <button
            onClick={() => {
              toggle();
              play("click");
            }}
            onMouseEnter={() => play("hover")}
            aria-label={muted ? "Unmute retro sounds" : "Mute retro sounds"}
            aria-pressed={muted}
            className={cn(
              "grid h-9 w-9 place-items-center border transition-colors",
              muted
                ? "border-[color-mix(in_oklch,var(--destructive)_50%,transparent)] text-[var(--destructive)]"
                : "border-[color-mix(in_oklch,var(--ring)_50%,transparent)] text-primary",
            )}
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Ambient pad toggle */}
          <button
            onClick={() => {
              togglePad();
              play("click");
              if (!padOn) {
                void import("@/lib/achievements").then((m) => m.unlock("ambient"));
              }
            }}
            onMouseEnter={() => play("hover")}
            aria-label={padOn ? "Stop ambient pad" : "Start ambient pad"}
            aria-pressed={padOn}
            title="Toggle ambient chiptune pad"
            className={cn(
              "grid h-9 w-9 place-items-center border transition-colors",
              padOn
                ? "border-[color-mix(in_oklch,var(--ring)_70%,transparent)] text-primary"
                : "border-[color-mix(in_oklch,var(--ring)_40%,transparent)] text-muted-foreground hover:text-primary",
            )}
            style={
              padOn
                ? { boxShadow: "0 0 10px color-mix(in oklch, var(--ring) 45%, transparent)" }
                : undefined
            }
          >
            {padOn ? <Music2 size={15} /> : <Music size={15} />}
          </button>

          {/* Print / export resume */}
          <button
            onClick={onPrint}
            onMouseEnter={() => play("hover")}
            aria-label="Open resume — print or save as PDF"
            title="Open resume to print / save as PDF"
            className="hidden h-9 w-9 place-items-center border border-[color-mix(in_oklch,var(--ring)_40%,transparent)] text-primary transition-colors hover:bg-[color-mix(in_oklch,var(--ring)_14%,transparent)] sm:grid"
          >
            <Printer size={15} />
          </button>

          {/* Achievements scoreboard */}
          <button
            onClick={() => {
              openAchievementsPanel();
              play("click");
            }}
            onMouseEnter={() => play("hover")}
            aria-label={`Open achievements scoreboard (${count} of ${total} unlocked)`}
            title="Achievements scoreboard"
            className="relative hidden h-9 w-9 place-items-center border border-[color-mix(in_oklch,var(--neon-amber)_40%,transparent)] text-[var(--neon-amber)] transition-colors hover:bg-[color-mix(in_oklch,var(--neon-amber)_14%,transparent)] sm:grid"
          >
            <Trophy size={15} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center border border-[color-mix(in_oklch,var(--neon-amber)_60%,transparent)] bg-background px-0.5 font-pixel text-[7px] text-[var(--neon-amber)]">
                {count}
              </span>
            )}
          </button>

          {/* CRT settings */}
          <button
            onClick={() => {
              openCRTSettings();
              play("click");
            }}
            onMouseEnter={() => play("hover")}
            aria-label="Open CRT monitor settings"
            title="CRT settings"
            className="hidden h-9 w-9 place-items-center border border-[color-mix(in_oklch,var(--neon-green)_40%,transparent)] text-[var(--neon-green)] transition-colors hover:bg-[color-mix(in_oklch,var(--neon-green)_14%,transparent)] sm:grid"
          >
            <SlidersHorizontal size={15} />
          </button>

          <button
            className="grid h-9 w-9 place-items-center border border-[color-mix(in_oklch,var(--ring)_40%,transparent)] text-primary md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Global mini EQ strip — ALWAYS visible (dim when idle, bright on audio).
          Promoted from pad-gated so the site always feels alive. */}
      <div
        data-print-hide
        className="relative h-2.5 w-full overflow-hidden border-t border-[color-mix(in_oklch,var(--ring)_22%,transparent)] bg-[oklch(0.1_0.02_55)]/80"
        aria-hidden
        style={{ opacity: padOn ? 1 : 0.55 }}
      >
        <AudioVisualizer bars={64} />
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-[color-mix(in_oklch,var(--ring)_30%,transparent)] bg-background/95 px-4 py-3 md:hidden">
          <div className="grid grid-cols-1 gap-1">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className={cn(
                  "px-3 py-2 text-left font-pixel text-[10px]",
                  active === n.id ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span className="mr-2 opacity-60">{">"}</span>
                {n.label}
              </button>
            ))}
            {/* mobile action row: print + achievements + settings */}
            <div className="mt-2 flex items-center gap-2 px-3">
              <button
                onClick={onPrint}
                className="flex items-center gap-1.5 border border-[color-mix(in_oklch,var(--ring)_40%,transparent)] px-2 py-1.5 font-retro text-[10px] text-primary"
              >
                <Printer size={12} /> PRINT
              </button>
              <button
                onClick={() => {
                  openAchievementsPanel();
                  play("click");
                }}
                className="flex items-center gap-1.5 border border-[color-mix(in_oklch,var(--neon-amber)_40%,transparent)] px-2 py-1.5 font-retro text-[10px] text-[var(--neon-amber)]"
              >
                <Trophy size={12} /> {count}/{total}
              </button>
              <button
                onClick={() => {
                  openCRTSettings();
                  play("click");
                }}
                className="flex items-center gap-1.5 border border-[color-mix(in_oklch,var(--neon-green)_40%,transparent)] px-2 py-1.5 font-retro text-[10px] text-[var(--neon-green)]"
              >
                <SlidersHorizontal size={12} /> CRT
              </button>
            </div>
            {/* mobile accent row */}
            <div className="mt-2 flex items-center gap-2 px-3">
              <span className="font-retro text-[10px] text-muted-foreground">ACCENT:</span>
              {(["amber", "orange", "magenta", "green"] as AccentColor[]).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    set(c);
                    play("click");
                  }}
                  aria-label={`Set accent to ${c}`}
                  className={cn(
                    "h-4 w-4 border transition-all",
                    accent === c && !auto ? "scale-125 border-foreground" : "opacity-60",
                  )}
                  style={{
                    background: ACCENT_VARS[c].swatch,
                    border: accent === c && !auto ? undefined : "1px solid transparent",
                  }}
                />
              ))}
              <button
                onClick={() => {
                  toggleAuto();
                  play("click");
                }}
                aria-label="Auto-rotate accent"
                aria-pressed={auto}
                className={cn(
                  "ml-1 grid h-4 w-4 place-items-center border transition-all",
                  auto ? "border-foreground text-foreground" : "border-transparent opacity-60",
                )}
                style={{
                  background: auto
                    ? "conic-gradient(from 0deg, var(--neon-amber), var(--neon-orange), var(--neon-magenta), var(--neon-green), var(--neon-amber))"
                    : "transparent",
                }}
              >
                <RefreshCw size={8} />
              </button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
