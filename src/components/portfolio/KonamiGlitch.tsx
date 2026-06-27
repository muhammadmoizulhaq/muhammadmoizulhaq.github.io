"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { unlock } from "@/lib/achievements";

/**
 * KonamiGlitch — listens for the classic Konami code
 * (↑ ↑ ↓ ↓ ← → ← → B A) and triggers a short CRT "glitch storm" overlay
 * with an ASCII secret message. Pure easter-egg fun.
 *
 * Also exposes a window method `window.__triggerGlitch()` so other components
 * (e.g. the command terminal) can fire it programmatically.
 */
const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/** Module-level tracker so other key handlers (e.g. BossKey's "B") can avoid
 *  firing while a Konami sequence is in progress. */
let konamiPos = 0;
/** True when the user is part-way through the Konami sequence. */
export function isKonamiInProgress(): boolean {
  return konamiPos > 0;
}

const SECRET = `
███╗   ███╗ ██████╗ ██╗   ██╗██╗███████╗██╗  ██╗
████╗ ████║██╔═══██╗██║   ██║██║██╔════╝██║  ██║
██╔████╔██║██║   ██║██║   ██║██║███████╗███████║
██║╚██╔╝██║██║   ██║╚██╗ ██╔╝██║╚════██║██╔══██║
██║ ╚═╝ ██║╚██████╔╝ ╚████╔╝ ██║███████║██║  ██║
╚═╝     ╚═╝ ╚═════╝   ╚═══╝  ╚═╝╚══════╝╚═╝  ╚═╝

>> CHEAT CODE ACCEPTED // GG WP <<
>> You found the secret. Moiz salutes you. <<
`;

export function KonamiGlitch() {
  const [active, setActive] = React.useState(false);
  const pos = React.useRef(0);

  const fire = React.useCallback(() => {
    setActive(true);
    unlock("glitched");
    // auto-dismiss after 4.5s
    window.setTimeout(() => setActive(false), 4500);
  }, []);

  React.useEffect(() => {
    // Programmatic trigger (e.g. from terminal).
    (window as unknown as { __triggerGlitch?: () => void }).__triggerGlitch = fire;

    const onKey = (e: KeyboardEvent) => {
      const expected = SEQUENCE[pos.current];
      const got = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (got === expected) {
        pos.current += 1;
        konamiPos = pos.current;
        if (pos.current === SEQUENCE.length) {
          pos.current = 0;
          konamiPos = 0;
          fire();
        }
      } else {
        // reset on mismatch (but allow restart from this key if it matches first)
        pos.current = got === SEQUENCE[0] ? 1 : 0;
        konamiPos = pos.current;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      delete (window as unknown as { __triggerGlitch?: () => void }).__triggerGlitch;
    };
  }, [fire]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center overflow-hidden bg-[oklch(0.06_0.02_55)]"
          onClick={() => setActive(false)}
        >
          {/* RGB-split shifting bars */}
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-0 h-[6vh] w-full"
              style={{
                top: `${(i * 7 + 2) % 100}%`,
                background:
                  i % 3 === 0
                    ? "var(--neon-magenta)"
                    : i % 3 === 1
                      ? "var(--neon-green)"
                      : "var(--neon-amber)",
                mixBlendMode: "screen",
              }}
              animate={{
                x: ["-8%", "8%", "-6%", "10%", "-8%"],
                opacity: [0.15, 0.5, 0.2, 0.45, 0.15],
              }}
              transition={{
                duration: 0.18 + (i % 4) * 0.04,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}

          {/* horizontal jitter slices */}
          <motion.div
            className="absolute inset-0"
            animate={{ y: [0, -3, 2, -1, 0], skewX: [0, 1, -1, 0.5, 0] }}
            transition={{ duration: 0.12, repeat: Infinity, ease: "linear" }}
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 3px, rgba(0,0,0,0.5) 4px, rgba(0,0,0,0.5) 5px)",
            }}
          />

          {/* ASCII secret */}
          <motion.pre
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className="relative z-10 px-4 text-center font-retro text-[10px] leading-tight neon-amber sm:text-xs"
            style={{ textShadow: "0 0 8px var(--neon-amber), 0 0 20px var(--neon-orange)" }}
          >
            {SECRET}
          </motion.pre>

          <div className="absolute bottom-6 font-pixel text-[11px] neon-green blink-cursor">
            {"// click to dismiss"}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
