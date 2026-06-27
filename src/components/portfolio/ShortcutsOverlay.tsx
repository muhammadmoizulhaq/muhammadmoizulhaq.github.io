"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X } from "lucide-react";
import { useSound } from "@/hooks/use-sound";
import { unlock } from "@/lib/achievements";

type Shortcut = {
  keys: string[];
  desc: string;
};

const SHORTCUTS: { group: string; items: Shortcut[] }[] = [
  {
    group: "NAVIGATION",
    items: [
      { keys: ["/"], desc: "Open command terminal" },
      { keys: ["?"], desc: "Toggle this shortcuts card" },
      { keys: ["ESC"], desc: "Close terminal / modal / overlay" },
      { keys: ["B"], desc: "Boss key — instant stealth mode" },
      { keys: ["↑", "↓"], desc: "Cycle terminal command history" },
      { keys: ["←", "→"], desc: "Prev / next project (in detail modal)" },
      { keys: ["Enter"], desc: "Run terminal command" },
    ],
  },
  {
    group: "SECRETS",
    items: [
      {
        keys: ["↑", "↑", "↓", "↓", "←", "→", "←", "→", "B", "A"],
        desc: "Konami code → glitch storm easter egg",
      },
    ],
  },
  {
    group: "TERMINAL COMMANDS",
    items: [
      { keys: ["help"], desc: "List all commands" },
      { keys: ["man", "<cmd>"], desc: "Detailed help for a command (e.g. man theme)" },
      { keys: ["theme", "<color>"], desc: "amber | orange | magenta | green | cycle | auto" },
      { keys: ["auto", "[on|off]"], desc: "Toggle auto-rotating accent" },
      { keys: ["random"], desc: "Pick a random neon accent" },
      { keys: ["pad", "[on|off]"], desc: "Toggle ambient chiptune pad" },
      { keys: ["pad", "<preset>"], desc: "Set pad preset: drone | arp | pad" },
      { keys: ["mute", "[on|off]"], desc: "Toggle retro sound effects" },
      { keys: ["history"], desc: "Show this session's command history" },
      { keys: ["detail", "<id>"], desc: "Open project detail modal" },
      { keys: ["resume"], desc: "Download resume PDF" },
      { keys: ["print"], desc: "Export resume (print / save as PDF)" },
      { keys: ["clear"], desc: "Clear the terminal output" },
      { keys: ["achievements"], desc: "Open the achievements scoreboard" },
      { keys: ["play"], desc: "Launch SNAKE.EXE mini-game" },
      { keys: ["settings"], desc: "Open CRT monitor calibration" },
      { keys: ["matrix"], desc: "Toggle the digital rain overlay" },
      { keys: ["boss"], desc: "Activate stealth mode (boss key)" },
      { keys: ["glitch"], desc: "Trigger the glitch storm" },
      { keys: ["whoami"], desc: "Print operator identity" },
    ],
  },
];

export function ShortcutsOverlay() {
  const [open, setOpen] = React.useState(false);
  const { play } = useSound();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (e.key === "?" && !typing) {
        e.preventDefault();
        setOpen((v) => {
          play(v ? "close" : "open");
          if (!v) unlock("keyboard_wizard");
          return !v;
        });
      } else if (e.key === "Escape" && open) {
        setOpen(false);
        play("close");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, play]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
              play("close");
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="term-in neon-border-amber relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden bg-[oklch(0.1_0.025_55)]"
          >
            {/* title bar */}
            <div className="flex items-center justify-between border-b border-[color-mix(in_oklch,var(--neon-amber)_30%,transparent)] bg-[oklch(0.13_0.03_55)] px-4 py-2.5">
              <div className="flex items-center gap-2 font-pixel text-[11px] neon-amber">
                <Keyboard size={12} /> KEYBINDINGS.DAT
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  play("close");
                }}
                onMouseEnter={() => play("hover")}
                aria-label="Close shortcuts"
                className="grid h-6 w-6 place-items-center border border-[color-mix(in_oklch,var(--neon-amber)_40%,transparent)] text-[var(--neon-amber)] transition-colors hover:bg-[color-mix(in_oklch,var(--neon-amber)_18%,transparent)]"
              >
                <X size={12} />
              </button>
            </div>

            {/* body */}
            <div className="flex-1 overflow-y-auto p-5">
              {SHORTCUTS.map((grp) => (
                <div key={grp.group} className="mb-5 last:mb-0">
                  <div className="mb-2 font-pixel text-[11px] neon-green opacity-80">
                    {"//"} {grp.group}
                  </div>
                  <div className="space-y-2">
                    {grp.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex flex-wrap items-center gap-1">
                          {item.keys.map((k, ki) => (
                            <span key={ki} className="flex items-center gap-1">
                              {ki > 0 && (
                                <span className="font-retro text-[10px] text-muted-foreground">
                                  +
                                </span>
                              )}
                              <kbd className="min-w-[24px] border border-[color-mix(in_oklch,var(--neon-amber)_45%,transparent)] bg-[color-mix(in_oklch,var(--neon-amber)_10%,transparent)] px-1.5 py-0.5 text-center font-pixel text-[11px] neon-amber">
                                {k}
                              </kbd>
                            </span>
                          ))}
                        </div>
                        <span className="text-right font-retro text-sm text-foreground/80">
                          {item.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[color-mix(in_oklch,var(--neon-amber)_25%,transparent)] bg-[oklch(0.12_0.025_55)] px-4 py-2 text-center font-retro text-[10px] text-muted-foreground">
              Press <span className="neon-amber">?</span> or <span className="neon-amber">ESC</span> to dismiss
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
