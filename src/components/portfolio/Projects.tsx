"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Youtube,
  ShoppingBag,
  Store,
  Globe,
  Gamepad2,
  Palette,
  Wrench,
  RotateCw,
  Info,
  Filter,
  X,
  Search,
} from "lucide-react";
import { SectionTitle } from "./About";
import { PROJECTS, type Project } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";
import { useSound } from "@/hooks/use-sound";
import { openProjectModal } from "./ProjectModal";
import { trackProjectFlip, unlock } from "@/lib/achievements";

const accentMap: Record<Project["accent"], { text: string; border: string; glow: string }> = {
  amber: {
    text: "neon-amber",
    border: "neon-border-amber",
    glow: "var(--neon-amber)",
  },
  orange: {
    text: "neon-orange",
    border: "neon-border-orange",
    glow: "var(--neon-orange)",
  },
  magenta: {
    text: "neon-magenta",
    border: "neon-border-magenta",
    glow: "var(--neon-magenta)",
  },
  green: {
    text: "neon-green",
    border: "neon-border-green",
    glow: "var(--neon-green)",
  },
};

const kindMeta: Record<Project["kind"], { icon: React.ReactNode; label: string }> = {
  site: { icon: <Globe size={12} />, label: "WEBSITE" },
  store: { icon: <Store size={12} />, label: "STEAM" },
  marketplace: { icon: <ShoppingBag size={12} />, label: "MARKET" },
  video: { icon: <Youtube size={12} />, label: "VIDEO" },
};

const catIcon: Record<Project["category"], React.ReactNode> = {
  Game: <Gamepad2 size={14} />,
  Experience: <Palette size={14} />,
  Video: <Youtube size={14} />,
  Tool: <Wrench size={14} />,
};

export function Projects() {
  const [activeTag, setActiveTag] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const { play } = useSound();

  // Collect all unique tags across projects, sorted by frequency (most common first).
  const allTags = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of PROJECTS) {
      for (const t of p.tags) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t);
  }, []);

  const visible = React.useMemo(() => {
    let list = PROJECTS;
    if (activeTag) list = list.filter((p) => p.tags.includes(activeTag));
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [activeTag, query]);

  const setTag = (t: string | null) => {
    play(t === activeTag || t === null ? "click" : "nav");
    setActiveTag(t);
  };

  const hasFilter = activeTag !== null || query.trim().length > 0;
  const clearAll = () => {
    play("click");
    setActiveTag(null);
    setQuery("");
  };

  return (
    <section id="projects" className="mx-auto max-w-6xl px-4 py-20 md:px-6">
      <SectionTitle index="03" title="PROJECTS" accent="magenta" />
      <p className="mb-6 font-retro text-base text-muted-foreground">
        <span className="neon-magenta">{">"}</span> Hover to tilt · click to flip ·{" "}
        <span className="neon-green">VIEW DETAIL</span> opens a full preview · open link on the back.
      </p>

      {/* Search box — full-text search across title/description/tags/category */}
      <div className="mb-3 flex items-center gap-2 border border-[color-mix(in_oklch,var(--neon-amber)_30%,transparent)] bg-[color-mix(in_oklch,var(--neon-amber)_5%,transparent)] px-3 py-2">
        <Search size={13} className="shrink-0 text-[var(--neon-amber)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search projects by name, tag, or keyword…"
          aria-label="Search projects"
          className="min-w-0 flex-1 bg-transparent font-retro text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); play("click"); }}
            aria-label="Clear search"
            className="grid h-5 w-5 shrink-0 place-items-center text-muted-foreground transition-colors hover:text-[var(--neon-amber)]"
          >
            <X size={12} />
          </button>
        )}
        <kbd className="hidden shrink-0 border border-[color-mix(in_oklch,var(--ring)_25%,transparent)] px-1.5 py-0.5 font-retro text-[11px] text-muted-foreground sm:inline-block">
          {visible.length}/{PROJECTS.length}
        </kbd>
      </div>

      {/* Tag filter bar */}
      <div className="mb-8 flex flex-wrap items-center gap-1.5 border border-[color-mix(in_oklch,var(--neon-magenta)_22%,transparent)] bg-[color-mix(in_oklch,var(--neon-magenta)_5%,transparent)] p-2.5">
        <span className="mr-1 flex items-center gap-1.5 font-pixel text-[11px] text-muted-foreground">
          <Filter size={10} className="text-[var(--neon-magenta)]" />
          FILTER:
        </span>
        <button
          onClick={() => setTag(null)}
          onMouseEnter={() => play("hover")}
          className={cn(
            "border px-2 py-1 font-retro text-[10px] transition-all",
            activeTag === null
              ? "border-[var(--neon-magenta)] bg-[color-mix(in_oklch,var(--neon-magenta)_18%,transparent)] neon-magenta"
              : "border-[color-mix(in_oklch,var(--ring)_25%,transparent)] text-muted-foreground hover:text-foreground hover:border-[color-mix(in_oklch,var(--ring)_45%,transparent)]",
          )}
        >
          ALL ({PROJECTS.length})
        </button>
        {allTags.map((t) => {
          const isActive = activeTag === t;
          const count = PROJECTS.filter((p) => p.tags.includes(t)).length;
          return (
            <button
              key={t}
              onClick={() => setTag(isActive ? null : t)}
              onMouseEnter={() => play("hover")}
              className={cn(
                "border px-2 py-1 font-retro text-[10px] transition-all",
                isActive
                  ? "border-[var(--neon-green)] bg-[color-mix(in_oklch,var(--neon-green)_16%,transparent)] neon-green"
                  : "border-[color-mix(in_oklch,var(--ring)_25%,transparent)] text-muted-foreground hover:text-foreground hover:border-[color-mix(in_oklch,var(--ring)_45%,transparent)]",
              )}
              aria-pressed={isActive}
            >
              #{t} <span className="opacity-50">({count})</span>
            </button>
          );
        })}
        {hasFilter && (
          <button
            onClick={clearAll}
            onMouseEnter={() => play("hover")}
            className="ml-auto flex items-center gap-1 border border-[color-mix(in_oklch,var(--neon-amber)_40%,transparent)] px-2 py-1 font-retro text-[10px] text-[var(--neon-amber)] transition-all hover:bg-[color-mix(in_oklch,var(--neon-amber)_14%,transparent)]"
            aria-label="Clear all filters"
          >
            <X size={11} /> CLEAR
          </button>
        )}
      </div>

      {/* Result count when filtered */}
      <AnimatePresence>
        {hasFilter && visible.length !== PROJECTS.length && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <p className="font-retro text-xs text-muted-foreground">
              <span className="neon-green">{">"}</span> Showing{" "}
              <span className="neon-green">{visible.length}</span> of {PROJECTS.length} projects
              {activeTag && <> tagged <span className="neon-magenta">#{activeTag}</span></>}
              {query.trim() && <> matching <span className="neon-amber">"{query.trim()}"</span></>}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {visible.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>

      {visible.length === 0 && (
        <div className="py-16 text-center font-retro text-sm text-muted-foreground">
          {">"} no projects match{" "}
          {query.trim() ? <span className="neon-amber">"{query.trim()}"</span> : "this filter"}
          {" — "}
          <button onClick={clearAll} className="neon-green underline-offset-2 hover:underline">
            clear filters
          </button>
        </div>
      )}
    </section>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [flipped, setFlipped] = React.useState(false);
  // sceneRef = stationary wrapper (pointer handlers live here for stable
  //   hit-testing — handlers on the tilting element cause a feedback loop
  //   because the 3D rotation shifts which child is under the pointer).
  // cardRef = the TILT layer (rAF writes rotateX/rotateY here).
  const sceneRef = React.useRef<HTMLDivElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const glareRef = React.useRef<HTMLDivElement>(null);
  const a = accentMap[project.accent];
  const { play } = useSound();

  // --- Performant tilt: ref-based direct DOM writes + rAF lerp loop ---
  // Avoids React re-renders on every pointermove (the previous cause of lag).
  const target = React.useRef({ rx: 0, ry: 0, gx: 50, gy: 50, glare: 0 });
  const current = React.useRef({ rx: 0, ry: 0, gx: 50, gy: 50, glare: 0 });
  const hovering = React.useRef(false);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const tick = () => {
      const t = target.current;
      const c = current.current;
      // Snappier lerp while hovering; gentler ease-back on leave.
      const k = hovering.current ? 0.32 : 0.14;
      c.rx += (t.rx - c.rx) * k;
      c.ry += (t.ry - c.ry) * k;
      c.gx += (t.gx - c.gx) * k;
      c.gy += (t.gy - c.gy) * k;
      c.glare += (t.glare - c.glare) * k;

      const el = cardRef.current;
      if (el) {
        el.style.transform = `rotateX(${c.rx.toFixed(2)}deg) rotateY(${c.ry.toFixed(2)}deg)`;
      }
      const gl = glareRef.current;
      if (gl) {
        gl.style.opacity = c.glare.toFixed(3);
        gl.style.background = `radial-gradient(circle at ${c.gx.toFixed(1)}% ${c.gy.toFixed(1)}%, rgba(255,210,120,0.4), transparent 50%)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const flip = React.useCallback(() => {
    play("flip");
    setFlipped((v) => {
      // Only count a "flip" when going front→back (i.e. revealing the back).
      if (!v) trackProjectFlip(project.id);
      return !v;
    });
  }, [play, project.id]);

  // Pointer handlers are bound to the STATIONARY scene wrapper so the 3D
  // tilt rotation never causes spurious pointerleave/enter cycles.
  const onMove = (e: React.PointerEvent) => {
    const el = sceneRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    target.current = {
      rx: -(py - 0.5) * 16,
      ry: (px - 0.5) * 16,
      gx: px * 100,
      gy: py * 100,
      glare: 0.3,
    };
  };
  const onEnter = () => {
    hovering.current = true;
    play("hover");
  };
  const onLeave = () => {
    hovering.current = false;
    target.current = { rx: 0, ry: 0, gx: 50, gy: 50, glare: 0 };
  };

  return (
    <motion.div
      ref={sceneRef}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.08 }}
      className="scene-3d h-[320px] cursor-pointer"
      onPointerMove={onMove}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onClick={flip}
      role="button"
      tabIndex={0}
      aria-label={`${project.title} — click to flip`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          flip();
        }
      }}
    >
      {/* FLIP layer — smooth 180° rotation when the card is flipped */}
      <div
        className="preserve-3d relative h-full w-full"
        style={{
          transform: `rotateY(${flipped ? 180 : 0}deg)`,
          transition: "transform 0.6s cubic-bezier(0.45, 0.05, 0.2, 1)",
        }}
      >
        {/* TILT layer — rAF writes rotateX/rotateY here each frame */}
        <div
          ref={cardRef}
          className="preserve-3d relative h-full w-full will-change-transform"
        >
        {/* glare — position/opacity driven directly by the rAF loop */}
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 z-30 rounded-[inherit]"
          style={{ opacity: 0 }}
          aria-hidden
        />

        {/* FRONT */}
        <div
          className={cn(
            "backface-hidden absolute inset-0 flex flex-col p-4",
            a.border,
            "bg-card/80 backdrop-blur-sm",
          )}
          style={{ transform: "translateZ(1px)" }}
        >
          {/* top bar like a chat header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="grid h-11 w-11 place-items-center border font-pixel text-xs"
                style={{
                  borderColor: `color-mix(in oklch, ${a.glow} 60%, transparent)`,
                  background: `color-mix(in oklch, ${a.glow} 14%, transparent)`,
                  color: a.glow,
                  textShadow: `0 0 6px color-mix(in oklch, ${a.glow} 70%, transparent)`,
                  transform: "translateZ(40px)",
                }}
              >
                {project.initials}
              </div>
              <div>
                <div className="font-pixel text-[11px] leading-tight text-foreground">
                  {project.title}
                </div>
                <div className={cn("mt-0.5 flex items-center gap-1 font-retro text-[11px]", a.text)}>
                  {kindMeta[project.kind].icon}
                  {kindMeta[project.kind].label}
                </div>
              </div>
            </div>
            <span
              className="border border-[color-mix(in_oklch,var(--neon-amber)_30%,transparent)] px-1.5 py-0.5 font-retro text-[10px] text-muted-foreground"
            >
              {project.category}
            </span>
          </div>

          {/* preview body — faux chat bubbles */}
          <div className="mt-4 flex-1 space-y-2 overflow-hidden">
            <div className="ml-auto w-[80%] rounded-sm border border-[color-mix(in_oklch,var(--neon-amber)_25%,transparent)] bg-[color-mix(in_oklch,var(--neon-amber)_8%,transparent)] px-2.5 py-1.5 font-retro text-xs text-foreground/80">
              {project.tags[0]}
            </div>
            <div className="w-[88%] rounded-sm border border-[color-mix(in_oklch,var(--neon-magenta)_25%,transparent)] bg-[color-mix(in_oklch,var(--neon-magenta)_8%,transparent)] px-2.5 py-1.5 font-retro text-xs text-foreground/80">
              {project.tags[1] ?? project.category}
            </div>
            <div className="ml-auto w-[70%] rounded-sm border border-[color-mix(in_oklch,var(--neon-green)_25%,transparent)] bg-[color-mix(in_oklch,var(--neon-green)_8%,transparent)] px-2.5 py-1.5 font-retro text-xs text-foreground/80">
              view project ↗
            </div>
          </div>

          {/* footer */}
          <div className="mt-3 flex items-center justify-between border-t border-[color-mix(in_oklch,var(--neon-amber)_20%,transparent)] pt-2">
            <span className="font-retro text-[11px] text-muted-foreground">
              {project.description.length > 42
                ? project.description.slice(0, 42) + "…"
                : project.description}
            </span>
            <span className={cn("flex items-center gap-1 font-retro text-[11px]", a.text)}>
              <RotateCw size={11} /> FLIP
            </span>
          </div>
        </div>

        {/* BACK */}
        <div
          className={cn(
            "backface-hidden absolute inset-0 flex flex-col p-5",
            a.border,
            "bg-[oklch(0.12_0.03_55)]",
          )}
          style={{ transform: "rotateY(180deg) translateZ(1px)" }}
        >
          <div className={cn("flex items-center gap-2 font-pixel text-[10px]", a.text)}>
            {catIcon[project.category]} {project.title}
          </div>
          <div className="mt-1 font-retro text-[11px] text-muted-foreground">
            {project.category.toUpperCase()} {"//"} {kindMeta[project.kind].label}
          </div>

          <p className="mt-4 flex-1 font-retro text-base leading-snug text-foreground/85">
            {project.description}
          </p>

          <div className="mb-3 flex flex-wrap gap-1.5">
            {project.tags.map((t) => (
              <span
                key={t}
                className="cursor-pointer border border-[color-mix(in_oklch,var(--neon-amber)_30%,transparent)] px-1.5 py-0.5 font-retro text-[10px] text-muted-foreground transition-colors hover:border-[color-mix(in_oklch,var(--neon-amber)_60%,transparent)] hover:text-[var(--neon-amber)]"
                title={`Filter by #${t}`}
              >
                #{t}
              </span>
            ))}
          </div>

          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "group flex items-center justify-between border px-3 py-2.5 font-pixel text-[10px] transition-all",
              a.border,
              a.text,
              "hover:translate-x-0.5",
            )}
            style={{ transform: "translateZ(40px)" }}
          >
            OPEN LINK
            <ExternalLink size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>

          <div className="mt-2 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openProjectModal(project);
                unlock("deep_dive");
                if (project.kind === "video") unlock("cinephile");
              }}
              onMouseEnter={() => play("hover")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 border border-[color-mix(in_oklch,var(--neon-green)_40%,transparent)] px-2 py-1.5 font-retro text-[11px] neon-green transition-all hover:bg-[color-mix(in_oklch,var(--neon-green)_12%,transparent)]",
              )}
            >
              <Info size={12} /> VIEW DETAIL
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                flip();
              }}
              onMouseEnter={() => play("hover")}
              className="flex items-center justify-center gap-1 border border-[color-mix(in_oklch,var(--neon-amber)_30%,transparent)] px-2 py-1.5 font-retro text-[11px] text-muted-foreground transition-all hover:text-foreground"
            >
              <RotateCw size={11} /> flip
            </button>
          </div>
        </div>
        </div>
      </div>
    </motion.div>
  );
}
