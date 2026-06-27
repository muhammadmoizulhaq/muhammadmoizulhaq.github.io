"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * HeroQuote — a small rotating set of dev/game-dev quotes displayed under the
 * hero tagline. Cycles every ~10s with a typewriter-out / typewriter-in
 * transition. On-theme (retro terminal) and respects reduced-motion (the
 * global CSS guard neutralizes the animation; the quote still swaps).
 *
 * The quotes lean into the Unreal Engine / C++ / game-dev identity of the
 * portfolio owner — picked to feel like BIOS fortune-cookie lines.
 */
const QUOTES: { text: string; by: string }[] = [
  { text: "Premature optimization is the root of all evil.", by: "Knuth" },
  { text: "The best code is no code at all.", by: "Jeff Atwood" },
  { text: "First, solve the problem. Then write the code.", by: "Hopper" },
  { text: "50% of gameplay is audio.", by: "GDC wisdom" },
  { text: "Make it work, make it right, make it fast.", by: "Beck" },
  { text: "There are only two hard things: cache invalidation and naming.", by: "Two Hard Things" },
  { text: "A ship in harbor is safe, but that is not what ships are for.", by: "Shedd" },
  { text: "Frame rate is the only true currency.", by: "Engine room" },
  { text: "Talk is cheap. Show me the code.", by: "Torvalds" },
  { text: "The player is never wrong — the game is.", by: "Schell" },
  { text: "C makes it easy to shoot yourself in the foot.", by: "Steele" },
  { text: "Programs must be written for people to read.", by: "Abelson" },
];

export function HeroQuote() {
  // Start deterministic (idx 0) so server & client render identically → no
  // hydration mismatch. Pick a random quote client-side after mount.
  const [idx, setIdx] = React.useState(0);
  const [shown, setShown] = React.useState(true);

  // On mount (client only), jump to a random quote so refreshes vary.
  React.useEffect(() => {
    setIdx(Math.floor(Math.random() * QUOTES.length));
  }, []);

  // Rotate every 10s: fade out, advance, fade in.
  React.useEffect(() => {
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const interval = setInterval(() => {
      if (reduce) {
        setIdx((i) => (i + 1) % QUOTES.length);
        return;
      }
      setShown(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % QUOTES.length);
        setShown(true);
      }, 420);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const q = QUOTES[idx];

  return (
    <div
      className="mx-auto mt-5 flex max-w-xl items-start gap-2 px-2"
      data-print-hide
      aria-live="polite"
    >
      <span
        className="mt-0.5 shrink-0 font-pixel text-[10px] neon-green opacity-70"
        aria-hidden
      >
        {"//"}
      </span>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : -4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="min-w-0 flex-1"
        >
          <p className="font-retro text-sm italic text-foreground/70">
            “{q.text}”
          </p>
          <p className="mt-0.5 font-pixel text-[11px] uppercase tracking-wider text-muted-foreground/70">
            — {q.by}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
