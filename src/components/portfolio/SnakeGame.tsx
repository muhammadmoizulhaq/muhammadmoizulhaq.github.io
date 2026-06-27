"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad, X, Trophy } from "lucide-react";
import { useSound } from "@/hooks/use-sound";
import { unlock } from "@/lib/achievements";

/**
 * SnakeGame — a tiny playable SNAKE.EXE embedded in a retro terminal modal.
 *
 * Opened via the terminal `play` (or `snake`) command, or via a small floating
 * button when the modal is open. Pure canvas rendering on a grid; arrow keys
 * + WASD steer; SPACE pauses; ENTER restarts on game over. High score persists
 * to localStorage. Scoring 30+ unlocks the `snake_master` achievement; playing
 * at all unlocks `snake_player`.
 *
 * Respects prefers-reduced-motion by running a slower tick (still playable).
 */

const GRID_W = 20;
const GRID_H = 14;
const CELL = 18; // px per cell — canvas is GRID_W*CELL × GRID_H*CELL
const HIGH_KEY = "moiz_snake_high";

type Pt = { x: number; y: number };
type Dir = "up" | "down" | "left" | "right";

const DIRS: Record<Dir, Pt> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const OPPOSITE: Record<Dir, Dir> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

let openSnakeFn: (() => void) | null = null;
export function openSnake() {
  openSnakeFn?.();
}

export function SnakeGame() {
  const [open, setOpen] = React.useState(false);
  const { play, muted } = useSound();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Game state lives in refs so the rAF/tick loop reads fresh values without
  // re-subscribing listeners on every state change.
  const snakeRef = React.useRef<Pt[]>([{ x: 10, y: 7 }]);
  const dirRef = React.useRef<Dir>("right");
  const nextDirRef = React.useRef<Dir>("right");
  const foodRef = React.useRef<Pt>({ x: 5, y: 5 });
  const runningRef = React.useRef<boolean>(false);
  const pausedRef = React.useRef<boolean>(false);
  const overRef = React.useRef<boolean>(false);
  const scoreRef = React.useRef<number>(0);

  const [score, setScore] = React.useState(0);
  const [high, setHigh] = React.useState(0);
  const [status, setStatus] = React.useState<"idle" | "running" | "paused" | "over">("idle");

  React.useEffect(() => {
    openSnakeFn = () => {
      setOpen(true);
      play("open");
    };
    return () => {
      openSnakeFn = null;
    };
  }, [play]);

  // Load high score on mount.
  React.useEffect(() => {
    try {
      const v = localStorage.getItem(HIGH_KEY);
      if (v) setHigh(parseInt(v, 10) || 0);
    } catch {
      /* ignore */
    }
  }, []);

  const persistHigh = (v: number) => {
    try {
      localStorage.setItem(HIGH_KEY, String(v));
    } catch {
      /* ignore */
    }
  };

  const placeFood = () => {
    // Place food on a random cell not occupied by the snake.
    let p: Pt;
    let tries = 0;
    do {
      p = {
        x: Math.floor(Math.random() * GRID_W),
        y: Math.floor(Math.random() * GRID_H),
      };
      tries++;
    } while (
      tries < 50 &&
      snakeRef.current.some((s) => s.x === p.x && s.y === p.y)
    );
    foodRef.current = p;
  };

  const resetGame = React.useCallback(() => {
    snakeRef.current = [{ x: 10, y: 7 }];
    dirRef.current = "right";
    nextDirRef.current = "right";
    scoreRef.current = 0;
    setScore(0);
    overRef.current = false;
    pausedRef.current = false;
    runningRef.current = true;
    setStatus("running");
    placeFood();
  }, []);

  const endGame = React.useCallback(() => {
    runningRef.current = false;
    overRef.current = true;
    setStatus("over");
    play("error");
    // Update high score.
    setHigh((prev) => {
      const next = Math.max(prev, scoreRef.current);
      if (next !== prev) persistHigh(next);
      return next;
    });
  }, [play]);

  // Tick loop — move snake every `interval` ms; redraw every frame.
  React.useEffect(() => {
    if (!open) return;
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const interval = reduce ? 220 : 130; // ms per move
    let lastTick = performance.now();
    let raf = 0;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const accentOf = () => {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim();
      return v || "oklch(0.78 0.17 65)";
    };
    const amber = () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--neon-amber")
        .trim() || "oklch(0.82 0.16 75)";
    const magenta = () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--neon-magenta")
        .trim() || "oklch(0.68 0.24 350)";
    const green = () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--neon-green")
        .trim() || "oklch(0.78 0.19 145)";

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (document.hidden) return;
      const now = performance.now();

      // Advance game logic on tick.
      if (
        runningRef.current &&
        !pausedRef.current &&
        !overRef.current &&
        now - lastTick > interval
      ) {
        lastTick = now;
        // Apply queued direction (prevents 180° reversal within one tick).
        const nd = nextDirRef.current;
        if (nd !== OPPOSITE[dirRef.current]) dirRef.current = nd;
        const d = DIRS[dirRef.current];
        const head = snakeRef.current[0];
        const nx = head.x + d.x;
        const ny = head.y + d.y;

        // Wall collision → game over.
        if (nx < 0 || ny < 0 || nx >= GRID_W || ny >= GRID_H) {
          endGame();
          return;
        }
        // Self collision → game over (ignore the tail cell since it moves).
        const ate = nx === foodRef.current.x && ny === foodRef.current.y;
        const bodyToCheck = ate
          ? snakeRef.current
          : snakeRef.current.slice(0, -1);
        if (bodyToCheck.some((s) => s.x === nx && s.y === ny)) {
          endGame();
          return;
        }

        const newHead = { x: nx, y: ny };
        snakeRef.current = [newHead, ...snakeRef.current];
        if (ate) {
          scoreRef.current += 1;
          setScore(scoreRef.current);
          if (!muted) play("flip");
          // First bite = snake_player; 30+ = snake_master.
          if (scoreRef.current === 1) unlock("snake_player");
          if (scoreRef.current >= 30) unlock("snake_master");
          placeFood();
        } else {
          snakeRef.current.pop();
        }
      }

      // ---- Render ----
      const W = GRID_W * CELL;
      const H = GRID_H * CELL;
      // Background.
      ctx.fillStyle = "oklch(0.09 0.02 55)";
      ctx.fillRect(0, 0, W, H);
      // Grid lines.
      ctx.strokeStyle = "color-mix(in oklch, var(--ring) 12%, transparent)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= GRID_W; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CELL + 0.5, 0);
        ctx.lineTo(x * CELL + 0.5, H);
        ctx.stroke();
      }
      for (let y = 0; y <= GRID_H; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL + 0.5);
        ctx.lineTo(W, y * CELL + 0.5);
        ctx.stroke();
      }
      // Border glow.
      ctx.strokeStyle = accentOf();
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, W - 2, H - 2);

      // Food (magenta pixel with glow).
      const f = foodRef.current;
      ctx.fillStyle = magenta();
      ctx.shadowColor = magenta();
      ctx.shadowBlur = 10;
      ctx.fillRect(f.x * CELL + 4, f.y * CELL + 4, CELL - 8, CELL - 8);
      ctx.shadowBlur = 0;

      // Snake (amber→green gradient by body index, hot head).
      const snake = snakeRef.current;
      for (let i = snake.length - 1; i >= 0; i--) {
        const s = snake[i];
        const t = i / Math.max(1, snake.length - 1); // 0 at head, 1 at tail
        // interpolate amber → green
        ctx.fillStyle = i === 0 ? amber() : green();
        if (i === 0) {
          ctx.shadowColor = amber();
          ctx.shadowBlur = 12;
        } else {
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 0.5 + (1 - t) * 0.4;
        }
        ctx.fillRect(s.x * CELL + 2, s.y * CELL + 2, CELL - 4, CELL - 4);
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }

      // Overlays for paused / over states.
      if (pausedRef.current && !overRef.current) {
        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = accentOf();
        ctx.font = "bold 22px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("|| PAUSED", W / 2, H / 2);
      }
      if (overRef.current) {
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = magenta();
        ctx.font = "bold 22px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("GAME OVER", W / 2, H / 2 - 14);
        ctx.fillStyle = accentOf();
        ctx.font = "12px monospace";
        ctx.fillText(`SCORE ${scoreRef.current} · ENTER TO RESTART`, W / 2, H / 2 + 14);
      }
    };
    draw();

    return () => cancelAnimationFrame(raf);
  }, [open, endGame, play, muted]);

  // Keyboard controls — only active while modal is open.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const map: Record<string, Dir> = {
        arrowup: "up",
        w: "up",
        arrowdown: "down",
        s: "down",
        arrowleft: "left",
        a: "left",
        arrowright: "right",
        d: "right",
      };
      if (map[k]) {
        e.preventDefault();
        const nd = map[k];
        // Prevent 180° reversal.
        if (nd !== OPPOSITE[dirRef.current]) nextDirRef.current = nd;
        return;
      }
      if (k === " " || k === "spacebar") {
        e.preventDefault();
        if (runningRef.current && !overRef.current) {
          pausedRef.current = !pausedRef.current;
          setStatus(pausedRef.current ? "paused" : "running");
          play("click");
        }
        return;
      }
      if (k === "enter") {
        e.preventDefault();
        if (overRef.current || status === "idle") {
          resetGame();
          play("open");
        }
        return;
      }
      if (k === "escape") {
        setOpen(false);
        play("close");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, status, play, resetGame]);

  // Close on backdrop click.
  const close = () => {
    setOpen(false);
    runningRef.current = false;
    play("close");
  };

  // Start a new game when opened if idle.
  React.useEffect(() => {
    if (open && status === "idle") {
      // Don't auto-start; let the user read the controls then press ENTER.
    }
  }, [open, status]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="term-in neon-border-green relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden bg-[oklch(0.1_0.025_55)]"
          >
            {/* title bar */}
            <div className="flex items-center justify-between border-b border-[color-mix(in_oklch,var(--neon-green)_30%,transparent)] bg-[oklch(0.13_0.03_55)] px-4 py-2.5">
              <div className="flex items-center gap-2 font-pixel text-[11px] neon-green">
                <Gamepad size={12} /> SNAKE.EXE
              </div>
              <div className="flex items-center gap-3">
                <span className="font-pixel text-[11px] text-primary">
                  SCORE {score}
                </span>
                <span className="hidden items-center gap-1 font-pixel text-[11px] neon-amber sm:flex">
                  <Trophy size={9} /> HI {high}
                </span>
                <button
                  onClick={close}
                  onMouseEnter={() => play("hover")}
                  aria-label="Close snake"
                  className="grid h-6 w-6 place-items-center border border-[color-mix(in_oklch,var(--neon-amber)_40%,transparent)] text-[var(--neon-amber)] transition-colors hover:bg-[color-mix(in_oklch,var(--neon-amber)_18%,transparent)]"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* canvas */}
            <div className="flex justify-center bg-[oklch(0.08_0.02_55)] p-3">
              <canvas
                ref={canvasRef}
                width={GRID_W * CELL}
                height={GRID_H * CELL}
                className="h-auto w-full max-w-[360px] border border-[color-mix(in_oklch,var(--ring)_40%,transparent)]"
                style={{ imageRendering: "pixelated", aspectRatio: `${GRID_W} / ${GRID_H}` }}
              />
            </div>

            {/* controls / status */}
            <div className="border-t border-[color-mix(in_oklch,var(--neon-green)_25%,transparent)] bg-[oklch(0.12_0.025_55)] px-4 py-2.5">
              {status === "idle" && (
                <div className="text-center">
                  <p className="font-retro text-xs text-foreground/80">
                    Steer with <kbd className="font-pixel text-[11px] neon-amber">←↑↓→</kbd> or <kbd className="font-pixel text-[11px] neon-amber">WASD</kbd>
                  </p>
                  <button
                    onClick={() => {
                      resetGame();
                      play("open");
                    }}
                    onMouseEnter={() => play("hover")}
                    className="mt-2 border border-[color-mix(in_oklch,var(--neon-green)_55%,transparent)] bg-[color-mix(in_oklch,var(--neon-green)_10%,transparent)] px-3 py-1.5 font-pixel text-[11px] neon-green transition-colors hover:bg-[color-mix(in_oklch,var(--neon-green)_20%,transparent)]"
                  >
                    ▶ START GAME
                  </button>
                </div>
              )}
              {(status === "running" || status === "paused") && (
                <div className="flex items-center justify-between gap-2 font-retro text-[10px] text-muted-foreground">
                  <span>
                    <kbd className="font-pixel text-[11px] neon-amber">SPACE</kbd> {status === "paused" ? "resume" : "pause"}
                  </span>
                  <span className="font-pixel text-[11px] neon-green">
                    {status === "paused" ? "|| PAUSED" : "▶ LIVE"}
                  </span>
                  <span>
                    <kbd className="font-pixel text-[11px] neon-amber">ESC</kbd> quit
                  </span>
                </div>
              )}
              {status === "over" && (
                <div className="text-center">
                  <p className="font-pixel text-[10px] neon-magenta">
                    GAME OVER · SCORE {score}
                  </p>
                  <button
                    onClick={() => {
                      resetGame();
                      play("open");
                    }}
                    onMouseEnter={() => play("hover")}
                    className="mt-2 border border-[color-mix(in_oklch,var(--neon-green)_55%,transparent)] bg-[color-mix(in_oklch,var(--neon-green)_10%,transparent)] px-3 py-1.5 font-pixel text-[11px] neon-green transition-colors hover:bg-[color-mix(in_oklch,var(--neon-green)_20%,transparent)]"
                  >
                    ↻ PLAY AGAIN
                  </button>
                </div>
              )}
            </div>

            {/* achievement hint footer */}
            <div className="border-t border-[color-mix(in_oklch,var(--neon-green)_18%,transparent)] bg-[oklch(0.1_0.025_55)] px-4 py-1.5 text-center font-retro text-[11px] text-muted-foreground/70">
              Score 30+ to unlock <span className="neon-magenta">SNAKE MASTER</span> · high score saved locally
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
