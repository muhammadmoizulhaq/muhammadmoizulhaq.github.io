"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MapPin, Mail, Phone } from "lucide-react";
import { Monogram3D } from "./Monogram3D";
import { Starfield } from "./Starfield";
import { CountUp } from "./CountUp";
import { AudioVisualizer } from "./AudioVisualizer";
import { HeroQuote } from "./HeroQuote";
import { PROFILE, STATS } from "@/lib/portfolio-data";

function useTypewriter(text: string, speed = 55, startDelay = 400) {
  const [out, setOut] = React.useState("");
  const [done, setDone] = React.useState(false);
  React.useEffect(() => {
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const start = setTimeout(() => {
      const tick = () => {
        setOut(text.slice(0, i));
        i += 1;
        if (i <= text.length) t = setTimeout(tick, speed);
        else setDone(true);
      };
      tick();
    }, startDelay);
    return () => {
      clearTimeout(start);
      clearTimeout(t);
    };
  }, [text, speed, startDelay]);
  return { out, done };
}

export function Hero() {
  const { out, done } = useTypewriter(PROFILE.title, 45);
  const [showTip, setShowTip] = React.useState(true);

  // Auto-dismiss the discoverability tip after 8s.
  React.useEffect(() => {
    const t = setTimeout(() => setShowTip(false), 8000);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      id="top"
      className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col items-center justify-center px-4 py-16 md:px-6"
    >
      {/* Starfield background — retro drifting pixels, mouse-reactive */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden data-print-hide>
        <Starfield className="opacity-70" />
        {/* radial vignette so center text stays readable */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(7,5,3,0.55) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* floating decorative cubes */}
      <div data-print-hide>
        <FloatingCube className="left-[6%] top-[16%] hidden md:block" color="var(--neon-magenta)" size={42} delay={0} />
        <FloatingCube className="right-[8%] top-[22%] hidden md:block" color="var(--neon-green)" size={34} delay={1.2} />
        <FloatingCube className="bottom-[14%] left-[14%] hidden lg:block" color="var(--neon-orange)" size={28} delay={0.6} />
        <FloatingCube className="bottom-[20%] right-[16%] hidden lg:block" color="var(--neon-yellow)" size={36} delay={1.8} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center"
      >
        <div className="mb-6 font-pixel text-[11px] neon-green opacity-80">
          {">"} SYSTEM ONLINE // PORTFOLIO.EXE LOADED
        </div>

        <div className="mb-8 flex justify-center">
          <Monogram3D letters={PROFILE.monogram} size={190} />
        </div>

        <h1 className="font-pixel text-2xl leading-tight neon-amber sm:text-3xl md:text-4xl">
          <span className="glitch" data-text="MUHAMMAD MOIZ">
            MUHAMMAD MOIZ
          </span>
          <br />
          <span className="neon-orange text-xl sm:text-2xl md:text-3xl">UL HAQ</span>
        </h1>

        <div className="mx-auto mt-5 max-w-2xl font-retro text-lg neon-green sm:text-xl">
          <span className="blink-cursor">{out}</span>
        </div>

        <p className="mx-auto mt-6 max-w-xl font-retro text-base text-foreground/80 sm:text-lg">
          {PROFILE.tagline}
        </p>

        {/* rotating dev quote — cycles every 10s */}
        <HeroQuote />

        {/* discoverability tip — auto-dismisses after 8s */}
        <AnimatePresence>
          {showTip && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ delay: 1.2, duration: 0.4 }}
              className="mx-auto mt-5 inline-flex items-center gap-2 border border-[color-mix(in_oklch,var(--neon-amber)_35%,transparent)] bg-[color-mix(in_oklch,var(--neon-amber)_8%,transparent)] px-3 py-1.5 font-retro text-[11px] text-primary/80"
              data-print-hide
            >
              <span className="neon-amber">TIP:</span>
              press{" "}
              <kbd className="border border-[color-mix(in_oklch,var(--neon-amber)_50%,transparent)] bg-background/60 px-1.5 py-0.5 font-pixel text-[11px] neon-amber">
                /
              </kbd>{" "}
              for the command terminal ·{" "}
              <kbd className="border border-[color-mix(in_oklch,var(--neon-amber)_50%,transparent)] bg-background/60 px-1.5 py-0.5 font-pixel text-[11px] neon-amber">
                ?
              </kbd>{" "}
              for shortcuts
            </motion.div>
          )}
        </AnimatePresence>

        {/* quick contact chips */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Chip icon={<MapPin size={14} />} text={PROFILE.location} />
          <a href={`mailto:${PROFILE.email}`}>
            <Chip icon={<Mail size={14} />} text={PROFILE.email} hover />
          </a>
          <a href={`tel:${PROFILE.phone.replace(/\s/g, "")}`}>
            <Chip icon={<Phone size={14} />} text={PROFILE.phone} hover />
          </a>
        </div>

        {/* stats strip — count-up on scroll into view */}
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="pixel-corners group relative border border-[color-mix(in_oklch,var(--neon-amber)_30%,transparent)] bg-card/60 px-3 py-3 backdrop-blur-sm transition-all hover:border-[color-mix(in_oklch,var(--neon-amber)_60%,transparent)] hover:bg-card/80"
            >
              <div className="count-glow font-pixel text-base neon-amber sm:text-lg">
                <CountUp value={s.value} />
              </div>
              <div className="mt-1 font-retro text-[10px] uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
              <span className="absolute right-1 top-1 font-retro text-[11px] text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100">
                ▮
              </span>
            </div>
          ))}
        </div>

        <a
          href="#about"
          className="mt-12 inline-flex flex-col items-center gap-1 font-retro text-xs neon-amber opacity-80 transition-opacity hover:opacity-100"
        >
          SCROLL_TO_EXPLORE
          <ChevronDown size={18} className="animate-bounce" />
        </a>
      </motion.div>

      {/* Audio visualizer strip — EQ bars driven by the Web Audio analyser.
          Reacts to blip sounds + the ambient pad. Use /pad or the header
          toggle to enable the drone. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4">
        <div className="mx-auto flex max-w-5xl items-end gap-3 pb-2">
          <span className="mb-0.5 shrink-0 font-pixel text-[11px] text-muted-foreground/70">
            AUDIO.SYS
          </span>
          <div className="h-8 flex-1 opacity-70">
            <AudioVisualizer bars={56} />
          </div>
          <span className="mb-0.5 shrink-0 font-pixel text-[11px] text-muted-foreground/70">
            EQ
          </span>
        </div>
      </div>
    </section>
  );
}

function Chip({
  icon,
  text,
  hover,
}: {
  icon: React.ReactNode;
  text: string;
  hover?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 border border-[color-mix(in_oklch,var(--neon-amber)_35%,transparent)] bg-card/60 px-3 py-1.5 font-retro text-sm text-foreground/90 backdrop-blur-sm transition-all ${
        hover ? "hover:border-[color-mix(in_oklch,var(--neon-amber)_70%,transparent)] hover:text-neon-amber" : ""
      }`}
    >
      <span className="neon-amber">{icon}</span>
      {text}
    </span>
  );
}

function FloatingCube({
  className,
  color,
  size,
  delay,
}: {
  className?: string;
  color: string;
  size: number;
  delay: number;
}) {
  return (
    <div
      className={`scene-3d absolute ${className ?? ""}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <motion.div
        className="preserve-3d h-full w-full"
        animate={{ rotateX: 360, rotateY: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear", delay }}
      >
        <CubeFace transform={`translateZ(${size / 2}px)`} color={color} size={size} />
        <CubeFace transform={`rotateY(180deg) translateZ(${size / 2}px)`} color={color} size={size} />
        <CubeFace transform={`rotateY(90deg) translateZ(${size / 2}px)`} color={color} size={size} />
        <CubeFace transform={`rotateY(-90deg) translateZ(${size / 2}px)`} color={color} size={size} />
        <CubeFace transform={`rotateX(90deg) translateZ(${size / 2}px)`} color={color} size={size} />
        <CubeFace transform={`rotateX(-90deg) translateZ(${size / 2}px)`} color={color} size={size} />
      </motion.div>
    </div>
  );
}

function CubeFace({
  transform,
  color,
  size,
}: {
  transform: string;
  color: string;
  size: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        transform,
        border: `1px solid color-mix(in oklch, ${color} 70%, transparent)`,
        background: `color-mix(in oklch, ${color} 12%, transparent)`,
        boxShadow: `inset 0 0 12px -4px ${color}`,
        backfaceVisibility: "hidden",
      }}
    />
  );
}
