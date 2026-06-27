"use client";

import * as React from "react";
import { getAnalyser } from "@/lib/sound";

/**
 * AudioVisualizer — a thin canvas EQ-bar overlay driven by the Web Audio
 * AnalyserNode from the shared sound engine. Reacts to both the short blip
 * sounds (hover/click/flip) and the ambient pad, so there's always motion
 * when the pad is on, and spikes on interaction.
 *
 * Reads `--primary` (the active accent) so it always matches the theme.
 */
export function AudioVisualizer({
  bars = 48,
  className,
}: {
  bars?: number;
  className?: string;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // smoothed levels per bar (decay)
    const levels = new Array(bars).fill(0);
    const freq = new Uint8Array(bars);

    const resize = () => {
      const parent = canvas.parentElement;
      w = parent?.clientWidth ?? canvas.clientWidth ?? 300;
      h = parent?.clientHeight ?? canvas.clientHeight ?? 48;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const readAccent = () => {
      const v = getComputedStyle(canvas)
        .getPropertyValue("--primary")
        .trim();
      return v || "oklch(0.78 0.17 65)";
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const analyser = getAnalyser();
      const accent = readAccent();
      const gap = 2;
      const bw = (w - gap * (bars - 1)) / bars;

      if (analyser) {
        analyser.getByteFrequencyData(freq);
      } else {
        freq.fill(0);
      }

      for (let i = 0; i < bars; i++) {
        // map frequency bin to bar (mirror low→high→low for symmetry)
        const bin =
          i < bars / 2
            ? Math.floor((i / (bars / 2)) * (freq.length / 2))
            : Math.floor(((bars - i) / (bars / 2)) * (freq.length / 2));
        const raw = (freq[Math.min(bin, freq.length - 1)] || 0) / 255;
        // attack fast, decay slow
        levels[i] = Math.max(raw, levels[i] * 0.86);
        const v = levels[i];
        const bh = Math.max(2, v * h);
        const x = i * (bw + gap);
        const y = h - bh;
        // base dim bar (floor) + bright top
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = accent;
        ctx.fillRect(x, h - Math.max(2, 0.12 * h), bw, Math.max(2, 0.12 * h));
        ctx.globalAlpha = 0.4 + v * 0.6;
        ctx.fillRect(x, y, bw, bh);
        // cap pixel
        if (v > 0.05) {
          ctx.globalAlpha = 0.9;
          ctx.fillRect(x, y, bw, 2);
        }
      }
      ctx.globalAlpha = 1;
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    // re-read accent when it changes
    const onAccent = () => {
      /* next frame picks up the new --primary */
    };
    window.addEventListener("moiz:accent", onAccent);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("moiz:accent", onAccent);
    };
  }, [bars]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
