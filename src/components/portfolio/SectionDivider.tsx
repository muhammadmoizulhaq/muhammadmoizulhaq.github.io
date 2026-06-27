"use client";

import * as React from "react";
import { motion } from "framer-motion";

type Accent = "amber" | "orange" | "magenta" | "green";

const colorVar: Record<Accent, string> = {
  amber: "var(--neon-amber)",
  orange: "var(--neon-orange)",
  magenta: "var(--neon-magenta)",
  green: "var(--neon-green)",
};

/**
 * SectionDivider — a thin retro divider with an animated marching-ants line,
 * a glowing center symbol, and tick marks. Adds rhythm between sections and
 * reinforces the arcade/CRT aesthetic.
 */
export function SectionDivider({
  symbol = "◆",
  accent = "amber",
}: {
  symbol?: string;
  accent?: Accent;
}) {
  const c = colorVar[accent];
  return (
    <div
      className="relative mx-auto flex max-w-6xl items-center justify-center gap-3 px-4 py-2 md:px-6"
      aria-hidden
    >
      {/* left marching line */}
      <motion.div
        className="h-px flex-1"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, ${c} 0 6px, transparent 6px 12px)`,
        }}
        animate={{ backgroundPositionX: ["0px", "12px"] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
      />
      {/* center symbol */}
      <motion.span
        className="font-pixel text-xs"
        style={{
          color: c,
          textShadow: `0 0 6px color-mix(in oklch, ${c} 70%, transparent), 0 0 16px color-mix(in oklch, ${c} 45%, transparent)`,
        }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        {symbol}
      </motion.span>
      {/* right marching line (reverse direction) */}
      <motion.div
        className="h-px flex-1"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, ${c} 0 6px, transparent 6px 12px)`,
        }}
        animate={{ backgroundPositionX: ["12px", "0px"] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
