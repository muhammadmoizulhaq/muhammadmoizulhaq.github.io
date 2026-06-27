"use client";

import * as React from "react";
import { getAnalyser } from "@/lib/sound";

type Star = {
  x: number;
  y: number;
  z: number; // depth 0..1 (smaller = farther)
  vy: number;
  size: number;
  color: string;
  twinkle: number;
};

const COLORS = [
  "oklch(0.82 0.16 75)", // amber
  "oklch(0.72 0.2 55)", // orange
  "oklch(0.68 0.24 350)", // magenta
  "oklch(0.78 0.19 145)", // green
  "oklch(0.88 0.17 90)", // yellow
];

/**
 * Starfield — a lightweight canvas starfield rendered behind the hero.
 * Stars drift downward (retro "warp" feel), twinkle, and react subtly to the
 * mouse (parallax shift). Colors come from the neon palette (no indigo/blue).
 *
 * Pixel-art style: stars are drawn as tiny squares, not anti-aliased dots.
 */
export function Starfield({ className }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const mouse = React.useRef({ x: 0.5, y: 0.5 });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Respect reduced-motion: draw a single static frame, no animation loop.
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const parent = canvas.parentElement;
      w = parent?.clientWidth ?? window.innerWidth;
      h = parent?.clientHeight ?? window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // density scales with area, capped for perf
      const count = Math.min(90, Math.floor((w * h) / 12000));
      stars = Array.from({ length: count }, () => makeStar(w, h));
    };

    const makeStar = (W: number, H: number): Star => {
      const z = Math.random();
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        z,
        vy: 0.15 + z * 0.9,
        size: z < 0.3 ? 1 : z < 0.7 ? 2 : 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        twinkle: Math.random() * Math.PI * 2,
      };
    };

    // audio reactivity — read overall amplitude from the analyser.
    const wave = new Uint8Array(64);
    let audioLevel = 0;
    const readAudio = () => {
      const an = getAnalyser();
      if (!an) {
        audioLevel = 0;
        return;
      }
      an.getByteFrequencyData(wave);
      let sum = 0;
      for (let i = 0; i < wave.length; i++) sum += wave[i];
      const avg = sum / wave.length / 255; // 0..1
      // attack fast, decay slow
      audioLevel = Math.max(avg, audioLevel * 0.9);
    };

    const draw = () => {
      readAudio();
      ctx.clearRect(0, 0, w, h);
      const mx = (mouse.current.x - 0.5) * 14;
      const my = (mouse.current.y - 0.5) * 14;
      const boost = 1 + audioLevel * 3.2; // audio speeds stars up
      const glowBoost = 0.3 + audioLevel * 0.7;
      for (const s of stars) {
        s.y += s.vy * boost;
        s.twinkle += 0.04 + audioLevel * 0.08;
        if (s.y > h + 4) {
          s.y = -4;
          s.x = Math.random() * w;
        }
        const tw = 0.55 + Math.sin(s.twinkle) * 0.45;
        const px = s.x + mx * s.z;
        const py = s.y + my * s.z;
        ctx.globalAlpha = Math.min(1, tw * (0.4 + s.z * 0.6) + audioLevel * 0.3);
        ctx.fillStyle = s.color;
        // pixel squares
        ctx.fillRect(px, py, s.size, s.size);
        // brighter stars (or loud audio) get a soft glow
        if (s.size >= 3 || audioLevel > 0.25) {
          ctx.globalAlpha = tw * (0.25 + glowBoost * 0.3);
          ctx.fillRect(px - 1, py - 1, s.size + 2, s.size + 2);
        }
      }
      ctx.globalAlpha = 1;
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    const onMove = (e: MouseEvent) => {
      if (reduce) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const r = parent.getBoundingClientRect();
      mouse.current = {
        x: (e.clientX - r.left) / r.width,
        y: (e.clientY - r.top) / r.height,
      };
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    const parent = canvas.parentElement;
    parent?.addEventListener("mousemove", onMove);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      parent?.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
