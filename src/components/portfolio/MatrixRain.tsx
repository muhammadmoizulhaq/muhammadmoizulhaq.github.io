"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * MatrixRain — a toggleable full-screen "digital rain" overlay.
 *
 * Classic Matrix-style cascading katakana + digits rendered on a canvas, tinted
 * with the current neon accent. Opened via the terminal `matrix` command.
 * First activation unlocks the `unplugged` achievement. Respects
 * prefers-reduced-motion (renders a single static frame).
 */

let openMatrixFn: (() => void) | null = null;

/** Module-level state so callers can read it synchronously. */
let matrixOn = false;

/** Toggle the rain on/off from anywhere (e.g. the terminal). Returns the new state. */
export function openMatrix(): boolean {
  matrixOn = !matrixOn;
  openMatrixFn?.();
  return matrixOn;
}
export function isMatrixOn(): boolean {
  return matrixOn;
}

const GLYPHS =
  "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ0123456789ABCDEF<>/\\|+=*";

export function MatrixRain() {
  const [on, setOn] = React.useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    openMatrixFn = () => {
      // Sync component state from the module-level source of truth.
      setOn(matrixOn);
    };
    return () => {
      openMatrixFn = null;
    };
  }, []);

  // Keep module state in sync if the component closes itself (ESC).
  const closeRain = React.useCallback(() => {
    matrixOn = false;
    setOn(false);
  }, []);

  React.useEffect(() => {
    if (!on) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const FONT = 16;
    let cols = Math.floor(window.innerWidth / FONT);
    let drops: number[] = new Array(cols).fill(0).map(() => Math.random() * -50);

    const accentVar = getComputedStyle(document.documentElement)
      .getPropertyValue("--primary")
      .trim() || "#ffb43c";

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.floor(canvas.width / FONT);
      drops = new Array(cols).fill(0).map(() => Math.random() * -50);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      // Fade trail.
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${FONT}px monospace`;
      for (let i = 0; i < cols; i++) {
        const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        const x = i * FONT;
        const y = drops[i] * FONT;
        // Lead glyph is bright white; trail is accent-tinted.
        ctx.fillStyle = accentVar;
        ctx.fillText(ch, x, y);
        if (Math.random() > 0.975) {
          ctx.fillStyle = "#ffffff";
          ctx.fillText(ch, x, y);
        }
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 1;
      }
      if (!reduce) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [on]);

  // ESC turns it off.
  React.useEffect(() => {
    if (!on) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeRain();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [on, closeRain]);

  return (
    <AnimatePresence>
      {on && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[65]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          aria-hidden
        >
          <canvas ref={canvasRef} className="h-full w-full" />
          {/* Hint pill */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute left-1/2 top-4 -translate-x-1/2 border border-[color-mix(in_oklch,var(--ring)_50%,transparent)] bg-background/85 px-3 py-1.5 font-pixel text-[11px] text-primary backdrop-blur-sm"
          >
            WAKE UP, NEO… <span className="text-muted-foreground">[ESC to exit]</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
