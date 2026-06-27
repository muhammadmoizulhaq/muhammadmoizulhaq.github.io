"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  Youtube,
  Store,
  ShoppingBag,
  Globe,
  Gamepad2,
  Palette,
  Wrench,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PROJECTS, type Project } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";
import { useSound } from "@/hooks/use-sound";

const accentClass: Record<
  Project["accent"],
  { border: string; text: string; glow: string }
> = {
  amber: {
    border: "neon-border-amber",
    text: "neon-amber",
    glow: "var(--neon-amber)",
  },
  orange: {
    border: "neon-border-orange",
    text: "neon-orange",
    glow: "var(--neon-orange)",
  },
  magenta: {
    border: "neon-border-magenta",
    text: "neon-magenta",
    glow: "var(--neon-magenta)",
  },
  green: {
    border: "neon-border-green",
    text: "neon-green",
    glow: "var(--neon-green)",
  },
};

const kindMeta: Record<Project["kind"], { icon: React.ReactNode; label: string }> = {
  site: { icon: <Globe size={12} />, label: "WEBSITE" },
  store: { icon: <Store size={12} />, label: "STEAM" },
  marketplace: { icon: <ShoppingBag size={12} />, label: "MARKETPLACE" },
  video: { icon: <Youtube size={12} />, label: "YOUTUBE" },
};

const catIcon: Record<Project["category"], React.ReactNode> = {
  Game: <Gamepad2 size={14} />,
  Experience: <Palette size={14} />,
  Video: <Youtube size={14} />,
  Tool: <Wrench size={14} />,
};

/** Extract a YouTube video ID from common URL forms (youtu.be/ID, watch?v=ID). */
function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

type OpenState = { project: Project } | null;

// Module-level open state so any caller (card, terminal) can open the modal.
let openFn: ((p: Project) => void) | null = null;
export function openProjectModal(p: Project) {
  openFn?.(p);
}

export function ProjectModal() {
  const [state, setState] = React.useState<OpenState>(null);
  const { play } = useSound();

  const open = React.useCallback(
    (p: Project) => {
      setState({ project: p });
      play("open");
    },
    [play],
  );
  const close = React.useCallback(() => {
    setState(null);
    play("close");
  }, [play]);

  // Register the open handler for external callers (terminal, card buttons).
  React.useEffect(() => {
    openFn = open;
    return () => {
      openFn = null;
    };
  }, [open]);

  // ESC to close + lock body scroll while open. Arrow keys navigate prev/next.
  const goRelative = React.useCallback(
    (delta: number) => {
      setState((cur) => {
        if (!cur) return cur;
        const idx = PROJECTS.findIndex((p) => p.id === cur.project.id);
        if (idx < 0) return cur;
        const next = PROJECTS[(idx + delta + PROJECTS.length) % PROJECTS.length];
        play("nav");
        return { project: next };
      });
    },
    [play],
  );

  React.useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") {
        e.preventDefault();
        goRelative(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goRelative(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [state, close, goRelative]);

  const project = state?.project;
  const a = project ? accentClass[project.accent] : null;
  const ytId = project ? youtubeId(project.url) : null;
  const currentIndex = project
    ? PROJECTS.findIndex((p) => p.id === project.id)
    : -1;

  return (
    <AnimatePresence>
      {project && a && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className={cn(
              "term-in relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden bg-[oklch(0.1_0.025_55)]",
              a.border,
            )}
          >
            {/* Title bar */}
            <div className="flex items-center justify-between border-b border-[color-mix(in_oklch,var(--ring)_30%,transparent)] bg-[oklch(0.13_0.03_55)] px-4 py-2.5">
              <div className="flex items-center gap-2 font-pixel text-[11px] text-primary">
                {catIcon[project.category]}
                <span className="opacity-60">{"//"} DETAIL</span>
                <span className="truncate max-w-[40vw]">{project.title.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => goRelative(-1)}
                  onMouseEnter={() => play("hover")}
                  aria-label="Previous project"
                  title="Previous (←)"
                  className="grid h-6 w-6 place-items-center border border-[color-mix(in_oklch,var(--ring)_40%,transparent)] text-primary transition-colors hover:bg-[color-mix(in_oklch,var(--ring)_18%,transparent)]"
                >
                  <ChevronLeft size={13} />
                </button>
                <span className="font-retro text-[10px] text-muted-foreground">
                  {currentIndex + 1}/{PROJECTS.length}
                </span>
                <button
                  onClick={() => goRelative(1)}
                  onMouseEnter={() => play("hover")}
                  aria-label="Next project"
                  title="Next (→)"
                  className="grid h-6 w-6 place-items-center border border-[color-mix(in_oklch,var(--ring)_40%,transparent)] text-primary transition-colors hover:bg-[color-mix(in_oklch,var(--ring)_18%,transparent)]"
                >
                  <ChevronRight size={13} />
                </button>
                <button
                  onClick={close}
                  onMouseEnter={() => play("hover")}
                  aria-label="Close detail"
                  className="ml-1 grid h-6 w-6 place-items-center border border-[color-mix(in_oklch,var(--ring)_40%,transparent)] text-primary transition-colors hover:bg-[color-mix(in_oklch,var(--ring)_18%,transparent)]"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Media: YouTube embed for video projects, monogram banner otherwise */}
              {ytId ? (
                <div className="relative aspect-video w-full overflow-hidden border border-[color-mix(in_oklch,var(--ring)_40%,transparent)] bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0`}
                    title={`${project.title} — YouTube embed`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div
                  className="relative flex aspect-video w-full items-center justify-center overflow-hidden border"
                  style={{
                    borderColor: `color-mix(in oklch, ${a.glow} 45%, transparent)`,
                    background: `radial-gradient(ellipse at center, color-mix(in oklch, ${a.glow} 16%, transparent), transparent 70%)`,
                  }}
                >
                  {/* big monogram */}
                  <div
                    className="scene-3d"
                    aria-hidden
                  >
                    <div className="preserve-3d">
                      <span
                        className="font-pixel text-6xl"
                        style={{
                          color: a.glow,
                          textShadow: `0 0 12px color-mix(in oklch, ${a.glow} 70%, transparent), 0 0 32px color-mix(in oklch, ${a.glow} 45%, transparent)`,
                          transform: "translateZ(20px)",
                        }}
                      >
                        {project.initials}
                      </span>
                    </div>
                  </div>
                  {/* faux scanlines on the banner */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-30"
                    style={{
                      background:
                        "repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.3) 3px, rgba(0,0,0,0.3) 4px)",
                    }}
                  />
                  <div
                    className="absolute bottom-2 left-2 flex items-center gap-1 font-retro text-[10px]"
                    style={{ color: a.glow }}
                  >
                    {kindMeta[project.kind].icon}
                    {kindMeta[project.kind].label}
                  </div>
                </div>
              )}

              {/* Heading + meta */}
              <div className="mt-4 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-pixel text-sm text-foreground">
                    {project.title}
                  </h3>
                  <div
                    className={cn(
                      "mt-1 flex items-center gap-2 font-retro text-xs",
                      a.text,
                    )}
                  >
                    {catIcon[project.category]}
                    {project.category.toUpperCase()}
                    <span className="text-muted-foreground">{"//"}</span>
                    {kindMeta[project.kind].icon}
                    {kindMeta[project.kind].label}
                  </div>
                </div>
                <span
                  className="border px-2 py-0.5 font-retro text-[10px] text-muted-foreground"
                  style={{
                    borderColor: `color-mix(in oklch, ${a.glow} 35%, transparent)`,
                  }}
                >
                  ID: {project.id}
                </span>
              </div>

              {/* Description */}
              <p className="mt-3 font-retro text-base leading-relaxed text-foreground/90">
                {project.description}
              </p>

              {/* Details list (if any) */}
              {project.details && project.details.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {project.details.map((d, i) => (
                    <li
                      key={i}
                      className="flex gap-2 font-retro text-base text-foreground/85"
                    >
                      <Check
                        size={14}
                        className={cn("mt-1 shrink-0", a.text)}
                      />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.tags.map((t) => (
                  <span
                    key={t}
                    className="border px-1.5 py-0.5 font-retro text-[10px] text-muted-foreground"
                    style={{
                      borderColor: `color-mix(in oklch, ${a.glow} 30%, transparent)`,
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {/* URL + open button */}
              <div className="mt-5 border-t border-[color-mix(in_oklch,var(--ring)_25%,transparent)] pt-4">
                <div className="mb-2 font-retro text-[10px] uppercase tracking-wider text-muted-foreground">
                  LINK
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate border border-[color-mix(in_oklch,var(--ring)_25%,transparent)] bg-background/60 px-2 py-1.5 font-retro text-xs text-foreground/80">
                    {project.url}
                  </code>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => play("hover")}
                    className={cn(
                      "group flex items-center gap-2 border px-3 py-1.5 font-pixel text-[11px] transition-all hover:translate-x-0.5",
                      a.border,
                      a.text,
                    )}
                  >
                    OPEN
                    <ExternalLink
                      size={12}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
                </div>
              </div>
            </div>

            {/* footer hint */}
            <div className="border-t border-[color-mix(in_oklch,var(--ring)_25%,transparent)] bg-[oklch(0.12_0.025_55)] px-4 py-2 text-center font-retro text-[10px] text-muted-foreground">
              <kbd className="text-primary/70">←</kbd> / <kbd className="text-primary/70">→</kbd> navigate · <kbd className="text-primary/70">ESC</kbd> close · click outside to dismiss
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
