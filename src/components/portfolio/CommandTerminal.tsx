"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, X, CornerDownLeft, Gamepad } from "lucide-react";
import { PROFILE, EXPERIENCES, PROJECTS, SKILLS } from "@/lib/portfolio-data";
import { withBasePath } from "@/lib/utils";
import {
  applyAccent,
  cycleAccent,
  ACCENT_COLORS,
  isAutoOn,
  startAuto,
  stopAuto,
  type AccentColor,
} from "@/lib/accent";
import { useSound } from "@/hooks/use-sound";
import {
  isPadOn,
  startPad,
  stopPad,
  isMuted,
  setMuted,
  setPadPreset,
  getPadPreset,
  type PadPreset,
} from "@/lib/sound";
import { openProjectModal } from "./ProjectModal";
import { openAchievementsPanel } from "./AchievementToast";
import { openSnake } from "./SnakeGame";
import { openCRTSettings } from "./CRTSettingsPanel";
import { openMatrix, isMatrixOn } from "./MatrixRain";
import { triggerBossKey } from "./BossKey";
import {
  unlock,
  unlockedIds,
  achievementPoints,
  resetAchievements,
  ACHIEVEMENTS,
} from "@/lib/achievements";

type Line = { kind: "in" | "out" | "err" | "sys"; text: string };

const HELP = [
  "AVAILABLE COMMANDS:",
  "  help            show this list",
  "  man <cmd>       show detailed help for a command (e.g. man theme)",
  "  about           jump to ABOUT section",
  "  experience      jump to EXPERIENCE",
  "  exp <n>         open experience #n detail",
  "  projects        jump to PROJECTS",
  "  project <id>    list project links (e.g. project maelstrom)",
  "  detail <id>     open project detail modal (e.g. detail strayshot)",
  "  skills          jump to SKILLS",
  "  contact         jump to CONTACT",
  "  email           open mail client",
  "  call            start a phone call",
  "  whoami          print operator identity",
  "  status          print system status",
  "  theme <color>   swap neon accent (amber|orange|magenta|green|cycle|auto)",
  "  random          pick a random neon accent",
  "  auto [on|off]   toggle auto-rotating accent",
  "  pad [on|off]    toggle ambient chiptune pad",
  "  pad <preset>    set pad preset (drone|arp|pad)",
  "  mute [on|off]   toggle retro sound effects",
  "  history         show this session's command history",
  "  resume          download resume PDF (RESUME.SYS)",
  "  print           export resume via print dialog (save as PDF)",
  "  achievements    open the achievements scoreboard",
  "  play            launch SNAKE.EXE (arrow keys / WASD)",
  "  settings        open CRT monitor calibration",
  "  matrix          toggle the digital rain overlay",
  "  boss            activate stealth mode (boss key)",
  "  clear           clear the terminal",
  "  top             scroll to top",
  "  glitch          ??? (or enter the Konami code)",
  "  exit            close terminal",
];

/** Per-command manual pages for the `man` command. Each entry has a synopsis,
 *  description, examples, and related commands. */
const MAN_PAGES: Record<string, { name: string; synopsis: string; desc: string; examples: string[]; see: string[] }> = {
  help: {
    name: "help",
    synopsis: "help",
    desc: "Prints the full list of available terminal commands. Unlocks the RTFM achievement on first use.",
    examples: ["help"],
    see: ["man"],
  },
  man: {
    name: "man",
    synopsis: "man <command>",
    desc: "Shows detailed help for a specific command: synopsis, description, usage examples, and related commands. If no command is given, lists all commands with man pages.",
    examples: ["man theme", "man pad", "man detail"],
    see: ["help"],
  },
  theme: {
    name: "theme",
    synopsis: "theme <amber|orange|magenta|green|cycle|auto>",
    desc: "Swaps the neon accent color used across the site. 'cycle' rotates to the next color; 'auto' enables continuous 12s rotation. Choice persists across sessions. Unlocks the CHROMA achievement.",
    examples: ["theme amber", "theme magenta", "theme cycle", "theme auto"],
    see: ["random", "auto"],
  },
  random: {
    name: "random",
    synopsis: "random",
    desc: "Picks a random neon accent from the palette and applies it. Unlocks the CHROMA achievement.",
    examples: ["random"],
    see: ["theme", "auto"],
  },
  auto: {
    name: "auto",
    synopsis: "auto [on|off]",
    desc: "Toggles continuous accent auto-rotation (every 12s). With no arg, toggles. Persists across sessions.",
    examples: ["auto", "auto on", "auto off"],
    see: ["theme", "random"],
  },
  pad: {
    name: "pad",
    synopsis: "pad [on|off|drone|arp|pad]",
    desc: "Controls the ambient chiptune pad. 'on'/'off' toggle it; 'drone'/'arp'/'pad' switch presets (A-minor drone, C-major arp, G-major wash). With no arg, toggles. Unlocks the AMBIENT achievement on first enable.",
    examples: ["pad", "pad on", "pad off", "pad arp"],
    see: ["mute"],
  },
  mute: {
    name: "mute",
    synopsis: "mute [on|off]",
    desc: "Toggles all retro sound effects (blips + pad). With no arg, toggles. Persists across sessions.",
    examples: ["mute", "mute on", "mute off"],
    see: ["pad"],
  },
  detail: {
    name: "detail",
    synopsis: "detail <project-id>",
    desc: "Opens the project detail modal for the given project id (e.g. 'mywhoosh', 'strayshot', 'vid-1'). Use 'projects' to list ids. Unlocks DEEP DIVE (and CINEPHILE for videos).",
    examples: ["detail mywhoosh", "detail vid-1", "detail strayshot"],
    see: ["projects", "project"],
  },
  project: {
    name: "project",
    synopsis: "project <id>",
    desc: "Lists the external links for a project without opening the modal. Use 'projects' to see all ids.",
    examples: ["project maelstrom", "project mywhoosh"],
    see: ["detail", "projects"],
  },
  play: {
    name: "play",
    synopsis: "play",
    desc: "Launches SNAKE.EXE — a playable Snake mini-game in a retro terminal modal. Steer with arrows/WASD, SPACE pauses, ENTER restarts on game over. Unlocks SNAKE PLAYER; scoring 30+ unlocks SNAKE MASTER.",
    examples: ["play"],
    see: ["achievements"],
  },
  settings: {
    name: "settings",
    synopsis: "settings",
    desc: "Opens MONITOR.SYS — the CRT calibration panel with sliders for scanlines, neon glow, and curvature, plus flicker + boot-skip toggles. All settings persist. Unlocks CALIBRATOR on first adjustment.",
    examples: ["settings"],
    see: ["matrix"],
  },
  matrix: {
    name: "matrix",
    synopsis: "matrix",
    desc: "Toggles a full-screen Matrix digital rain overlay (cascading katakana + digits tinted with the active accent). ESC exits. Unlocks UNPLUGGED on first activation.",
    examples: ["matrix"],
    see: ["settings", "boss"],
  },
  boss: {
    name: "boss",
    synopsis: "boss",
    desc: "Activates stealth mode — instantly disguises the portfolio as a boring code editor so no one knows you're browsing. Click anywhere or press B/ESC to exit. Unlocks STEALTH. (Tip: just press the B key anywhere.)",
    examples: ["boss"],
    see: ["matrix"],
  },
  achievements: {
    name: "achievements",
    synopsis: "achievements",
    desc: "Opens the SCOREBOARD.DAT modal showing all 22 achievements (locked/unlocked, rarity, points). Has GRID and LOG tabs; LOG shows a timestamped unlock history.",
    examples: ["achievements"],
    see: ["play", "detail"],
  },
  print: {
    name: "print",
    synopsis: "print",
    desc: "Opens the browser print dialog with a print-optimized resume layout (clean white background, no animations/scanlines). Save as PDF to export. Unlocks ARCHIVIST.",
    examples: ["print"],
    see: ["resume", "achievements"],
  },
  resume: {
    name: "resume",
    synopsis: "resume",
    desc: "Downloads the ATS-safe resume PDF (Muhammad-Moiz-Resume.pdf) directly to your downloads folder. The file is a real PDF with extractable text — safe for applicant tracking systems. Unlocks ARCHIVIST. Use 'print' instead if you want the browser print dialog / save-as-PDF flow.",
    examples: ["resume"],
    see: ["print", "contact"],
  },
  history: {
    name: "history",
    synopsis: "history",
    desc: "Prints this session's command history (newest first, up to 15 entries). Use ↑/↓ arrows in the input to recall commands.",
    examples: ["history"],
    see: ["help"],
  },
  whoami: {
    name: "whoami",
    synopsis: "whoami",
    desc: "Prints the operator identity — name, role, and location. Unlocks IDENTITY.",
    examples: ["whoami"],
    see: ["status"],
  },
  status: {
    name: "status",
    synopsis: "status",
    desc: "Prints a system status report: accent, audio state, uptime, achievements, visit streak, and project/experience counts.",
    examples: ["status"],
    see: ["whoami"],
  },
  glitch: {
    name: "glitch",
    synopsis: "glitch",
    desc: "Triggers a CRT glitch storm easter egg with an ASCII secret message. Also triggered by the Konami code (↑↑↓↓←→←→ B A). Unlocks GLITCHED.",
    examples: ["glitch"],
    see: ["play"],
  },
  clear: {
    name: "clear",
    synopsis: "clear",
    desc: "Clears all terminal output lines.",
    examples: ["clear"],
    see: ["top", "exit"],
  },
  top: {
    name: "top",
    synopsis: "top",
    desc: "Smoothly scrolls the page back to the top.",
    examples: ["top"],
    see: ["clear"],
  },
  exit: {
    name: "exit",
    synopsis: "exit",
    desc: "Closes the terminal. (You can also press ESC or /.)",
    examples: ["exit"],
    see: ["clear"],
  },
};

/** normalize an arg: "Maelstrom" / "MAELSTROM" -> "maelstrom" */
const norm = (s: string) => s.trim().toLowerCase();

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function CommandTerminal() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [lines, setLines] = React.useState<Line[]>([
    { kind: "sys", text: "MOIZ-OS TERMINAL v1.0 — type 'help' for commands." },
  ]);
  const [history, setHistory] = React.useState<string[]>([]);
  const [hIdx, setHIdx] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const { play } = useSound();

  const openTerminal = React.useCallback(() => {
    setOpen(true);
    play("open");
    unlock("terminal_explorer");
  }, [play]);
  const closeTerminal = React.useCallback(() => {
    setOpen(false);
    play("close");
  }, [play]);

  // Global hotkey: "/" opens (when not already focused in an input), ESC closes.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (e.key === "/" && !open && !typing) {
        e.preventDefault();
        openTerminal();
      } else if (e.key === "Escape" && open) {
        closeTerminal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, openTerminal, closeTerminal]);

  // Focus input when opened; return focus to button when closed.
  React.useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    } else {
      btnRef.current?.focus();
    }
  }, [open]);

  // Auto-scroll terminal to bottom on new lines.
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, open]);

  function push(...l: Line[]) {
    setLines((prev) => [...prev, ...l]);
  }

  function run(raw: string) {
    const cmd = raw.trim();
    if (!cmd) return;
    push({ kind: "in", text: `> ${cmd}` });
    setHistory((h) => [cmd, ...h].slice(0, 30));
    setHIdx(-1);

    const [name, ...args] = cmd.split(/\s+/);
    const arg = args.join(" ");

    switch (norm(name)) {
      case "help":
        push(...HELP.map((t) => ({ kind: "out" as const, text: t })));
        unlock("rtfm");
        break;
      case "man": {
        const cmd = norm(arg);
        if (!cmd) {
          push({ kind: "sys", text: ">> MANUAL INDEX — commands with man pages:" });
          push({ kind: "out", text: "  " + Object.keys(MAN_PAGES).sort().join("  ") });
          push({ kind: "sys", text: ">> usage: man <command>   (e.g. man theme)" });
          break;
        }
        const page = MAN_PAGES[cmd];
        if (!page) {
          push({ kind: "err", text: `no man page for '${cmd}' — try: ${Object.keys(MAN_PAGES).sort().join(", ")}` });
          play("error");
          break;
        }
        push({ kind: "sys", text: "═══════════════════════════════════════════" });
        push({ kind: "out", text: `NAME` });
        push({ kind: "out", text: `  ${page.name} — ${page.synopsis}` });
        push({ kind: "out", text: `` });
        push({ kind: "out", text: `DESCRIPTION` });
        push({ kind: "out", text: `  ${page.desc}` });
        if (page.examples.length) {
          push({ kind: "out", text: `` });
          push({ kind: "out", text: `EXAMPLES` });
          page.examples.forEach((ex) => push({ kind: "out", text: `  $ ${ex}` }));
        }
        if (page.see.length) {
          push({ kind: "out", text: `` });
          push({ kind: "out", text: `SEE ALSO` });
          push({ kind: "out", text: `  ${page.see.join(", ")}` });
        }
        push({ kind: "sys", text: "═══════════════════════════════════════════" });
        break;
      }
      case "about":
        scrollToId("about");
        push({ kind: "out", text: "→ navigating to ABOUT" });
        break;
      case "experience":
      case "exp":
        if (args[0] && /^\d+$/.test(args[0])) {
          const n = parseInt(args[0], 10);
          const exp = EXPERIENCES[n - 1];
          if (exp) {
            push(
              { kind: "out", text: `EXPERIENCE #${n}: ${exp.company}` },
              { kind: "out", text: `  ${exp.role} · ${exp.period}` },
              { kind: "out", text: `  ${exp.location}` },
              ...exp.highlights.map((h) => ({ kind: "out" as const, text: `  - ${h}` })),
            );
          } else {
            push({ kind: "err", text: `no experience #${n} (1..${EXPERIENCES.length})` });
          }
        } else {
          scrollToId("experience");
          push({ kind: "out", text: "→ navigating to EXPERIENCE" });
        }
        break;
      case "projects":
        scrollToId("projects");
        push({ kind: "out", text: "→ navigating to PROJECTS" });
        break;
      case "project": {
        const q = norm(arg);
        const matches = PROJECTS.filter(
          (p) =>
            norm(p.title).includes(q) ||
            norm(p.id).includes(q) ||
            p.tags.some((t) => norm(t).includes(q)),
        );
        if (matches.length === 0) {
          push({ kind: "err", text: `no project matching "${arg}"` });
        } else {
          push({ kind: "out", text: `FOUND ${matches.length} PROJECT(S):` });
          matches.forEach((p) =>
            push({ kind: "out", text: `  • ${p.title} — ${p.url}` }),
          );
        }
        break;
      }
      case "detail": {
        const q = norm(arg);
        const match = PROJECTS.find(
          (p) =>
            norm(p.id) === q ||
            norm(p.title) === q ||
            norm(p.title).includes(q) ||
            norm(p.id).includes(q),
        );
        if (!match) {
          push({ kind: "err", text: `no project matching "${arg}" — try 'project <id>'` });
        } else {
          openProjectModal(match);
          push({ kind: "out", text: `→ opening detail: ${match.title}` });
          unlock("deep_dive");
          if (match.kind === "video") unlock("cinephile");
        }
        break;
      }
      case "shortcuts":
      case "keys":
      case "help-keys":
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "?" }));
        push({ kind: "out", text: "→ opening keybindings card" });
        unlock("keyboard_wizard");
        break;
      case "skills":
        scrollToId("skills");
        push({ kind: "out", text: "→ navigating to SKILLS" });
        break;
      case "contact":
        scrollToId("contact");
        push({ kind: "out", text: "→ navigating to CONTACT" });
        break;
      case "email":
        push({ kind: "out", text: `opening mail → ${PROFILE.email}` });
        window.location.href = `mailto:${PROFILE.email}`;
        break;
      case "call":
        push({ kind: "out", text: `dialing → ${PROFILE.phone}` });
        window.location.href = `tel:${PROFILE.phone.replace(/\s/g, "")}`;
        break;
      case "whoami":
        push(
          { kind: "out", text: PROFILE.name },
          { kind: "out", text: `  ${PROFILE.title}` },
          { kind: "out", text: `  ${PROFILE.location}` },
        );
        unlock("whoami");
        break;
      case "status":
        push(
          { kind: "out", text: `UPTIME: ${(performance.now() / 1000).toFixed(1)}s` },
          { kind: "out", text: `EXPERIENCE_ENTRIES: ${EXPERIENCES.length}` },
          { kind: "out", text: `PROJECTS: ${PROJECTS.length}` },
          { kind: "out", text: `SKILLS: ${SKILLS.length}` },
          { kind: "out", text: "STATE: [ONLINE] open to remote" },
        );
        break;
      case "theme": {
        const valid = ["amber", "orange", "magenta", "green", "cycle", "auto"];
        if (!valid.includes(norm(arg))) {
          push({ kind: "err", text: `usage: theme <${valid.join("|")}>` });
          break;
        }
        if (norm(arg) === "cycle") {
          const next = cycleAccent();
          push({ kind: "out", text: `neon accent → ${next.toUpperCase()} (cycled)` });
          unlock("chroma");
        } else if (norm(arg) === "auto") {
          startAuto();
          push({ kind: "out", text: "auto-rotate: ON // cycling every 12s" });
        } else {
          applyAccent(norm(arg) as AccentColor);
          push({ kind: "out", text: `neon accent → ${norm(arg).toUpperCase()}` });
        }
        break;
      }
      case "auto": {
        const want = norm(arg);
        if (want === "on") {
          startAuto();
          push({ kind: "out", text: "auto-rotate: ON // cycling every 12s" });
        } else if (want === "off") {
          stopAuto();
          push({ kind: "out", text: "auto-rotate: OFF" });
        } else {
          if (isAutoOn()) {
            stopAuto();
            push({ kind: "out", text: "auto-rotate: OFF" });
          } else {
            startAuto();
            push({ kind: "out", text: "auto-rotate: ON // cycling every 12s" });
          }
        }
        break;
      }
      case "random": {
        const pick =
          ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];
        applyAccent(pick);
        push({ kind: "out", text: `neon accent → ${pick.toUpperCase()} (random)` });
        unlock("chroma");
        break;
      }
      case "pad": {
        const want = norm(arg);
        if (want === "on") {
          startPad();
          push({ kind: "out", text: "ambient pad: ON" });
          unlock("ambient");
        } else if (want === "off") {
          stopPad();
          push({ kind: "out", text: "ambient pad: OFF" });
        } else if (want === "drone" || want === "arp" || want === "pad") {
          setPadPreset(want as PadPreset);
          push({ kind: "out", text: `pad preset: ${want.toUpperCase()}` });
        } else {
          if (isPadOn()) {
            stopPad();
            push({ kind: "out", text: "ambient pad: OFF" });
          } else {
            startPad();
            push({ kind: "out", text: `ambient pad: ON // ${getPadPreset().toUpperCase()} initialized` });
            unlock("ambient");
          }
        }
        break;
      }
      case "history": {
        if (history.length === 0) {
          push({ kind: "out", text: "(no commands in history yet)" });
        } else {
          push({ kind: "sys", text: `>> ${history.length} command(s) this session (newest first):` });
          history.slice(0, 15).forEach((h, i) => {
            push({ kind: "out", text: `  ${String(history.length - i).padStart(2, "0")}  ${h}` });
          });
          push({ kind: "sys", text: ">> tip: click a line above (in the terminal) or press ↑/↓ to recall" });
        }
        break;
      }
      case "mute": {
        const want = norm(arg);
        if (want === "on") {
          setMuted(true);
          push({ kind: "out", text: "sound: MUTED" });
        } else if (want === "off") {
          setMuted(false);
          push({ kind: "out", text: "sound: UNMUTED" });
        } else {
          const next = !isMuted();
          setMuted(next);
          push({ kind: "out", text: `sound: ${next ? "MUTED" : "UNMUTED"}` });
        }
        break;
      }
      case "resume":
      case "cv": {
        push(
          { kind: "out", text: "→ downloading RESUME.SYS…" },
          { kind: "sys", text: ">> Muhammad-Moiz-Resume.pdf (53 KB, ATS-safe)" },
        );
        unlock("archivist");
        // Trigger a real file download (not window.print).
        const link = document.createElement("a");
        link.href = withBasePath("/resume/Muhammad-Moiz-Resume.pdf");
        link.download = "Muhammad-Moiz-Resume.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        break;
      }
      case "print":
      case "export":
        push({ kind: "out", text: "→ opening print dialog… (save as PDF to export)" });
        unlock("archivist");
        setTimeout(() => window.print(), 200);
        break;
      case "achievements":
      case "achievement":
      case "scoreboard":
      case "trophies": {
        const ids = unlockedIds();
        const pts = achievementPoints();
        push(
          { kind: "out", text: `ACHIEVEMENTS: ${ids.length}/${ACHIEVEMENTS.length}` },
          { kind: "out", text: `POINTS: ${pts}` },
          { kind: "out", text: "→ opening scoreboard…" },
        );
        openAchievementsPanel();
        break;
      }
      case "reset-achievements":
      case "reset-achievs":
        resetAchievements();
        push({ kind: "sys", text: ">> scoreboard reset" });
        break;
      case "play":
      case "snake":
        openSnake();
        push(
          { kind: "out", text: "→ launching SNAKE.EXE" },
          { kind: "sys", text: ">> steer with arrows / WASD · SPACE pause · ENTER restart" },
        );
        break;
      case "settings":
      case "crt":
      case "monitor":
        openCRTSettings();
        push({ kind: "out", text: "→ opening MONITOR.SYS calibration" });
        break;
      case "matrix":
        openMatrix();
        push(
          { kind: "sys", text: isMatrixOn() ? ">> digital rain: ON" : ">> digital rain: OFF" },
        );
        if (isMatrixOn()) unlock("unplugged");
        break;
      case "boss":
        push({ kind: "sys", text: ">> engaging stealth mode…" });
        triggerBossKey();
        unlock("stealth");
        break;
      case "clear":
        setLines([]);
        break;
      case "top":
        window.scrollTo({ top: 0, behavior: "smooth" });
        push({ kind: "out", text: "→ scroll to top" });
        break;
      case "glitch":
      case "konami": {
        const fn = (window as unknown as { __triggerGlitch?: () => void }).__triggerGlitch;
        if (fn) {
          fn();
          push({ kind: "sys", text: ">> INITIATING GLITCH STORM…" });
          play("boot");
          unlock("glitched");
        } else {
          push({ kind: "err", text: "glitch subsystem unavailable" });
        }
        break;
      }
      case "exit":
      case "quit":
        push({ kind: "sys", text: "closing terminal…" });
        play("close");
        setTimeout(() => setOpen(false), 150);
        break;
      default:
        push({ kind: "err", text: `command not found: ${name} — try 'help'` });
        play("error");
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    run(input);
    setInput("");
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(hIdx + 1, history.length - 1);
      if (next >= 0) {
        setHIdx(next);
        setInput(history[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = hIdx - 1;
      if (next < 0) {
        setHIdx(-1);
        setInput("");
      } else {
        setHIdx(next);
        setInput(history[next]);
      }
    }
  };

  const lineColor: Record<Line["kind"], string> = {
    in: "neon-amber",
    out: "text-foreground/90",
    err: "text-[oklch(0.72_0.22_25)]",
    sys: "neon-green",
  };

  return (
    <>
      {/* Floating buttons (bottom-right): arcade + help + terminal */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
        {/* ARCADE button — launches SNAKE.EXE */}
        <button
          onClick={() => {
            openSnake();
            play("open");
          }}
          onMouseEnter={() => play("hover")}
          aria-label="Play SNAKE.EXE arcade mini-game"
          title="Play SNAKE.EXE"
          className="group flex h-10 w-10 items-center justify-center border border-[color-mix(in_oklch,var(--neon-magenta)_55%,transparent)] bg-card/85 text-[var(--neon-magenta)] backdrop-blur-sm transition-all hover:border-[color-mix(in_oklch,var(--neon-magenta)_85%,transparent)] hover:scale-105"
        >
          <Gamepad size={16} />
          <span className="pointer-events-none absolute -top-6 right-0 whitespace-nowrap font-pixel text-[7px] neon-magenta opacity-0 transition-opacity group-hover:opacity-100">
            ARCADE
          </span>
        </button>
        <button
          onClick={() => {
            // Synthesize a "?" keydown so ShortcutsOverlay toggles.
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "?" }));
            play("click");
          }}
          onMouseEnter={() => play("hover")}
          aria-label="Show keyboard shortcuts (press ?)"
          className="group flex h-10 w-10 items-center justify-center border border-[color-mix(in_oklch,var(--neon-amber)_55%,transparent)] bg-card/85 text-[var(--neon-amber)] backdrop-blur-sm transition-all hover:border-[color-mix(in_oklch,var(--neon-amber)_85%,transparent)] hover:scale-105"
        >
          <span className="font-pixel text-xs">?</span>
          <span className="pointer-events-none absolute -top-6 right-0 whitespace-nowrap font-pixel text-[7px] neon-amber opacity-0 transition-opacity group-hover:opacity-100">
            PRESS ?
          </span>
        </button>
        <button
          ref={btnRef}
          onClick={openTerminal}
          onMouseEnter={() => play("hover")}
          aria-label="Open command terminal (press /)"
          className="group relative flex h-12 w-12 items-center justify-center border border-[color-mix(in_oklch,var(--neon-green)_55%,transparent)] bg-card/85 text-[var(--neon-green)] backdrop-blur-sm transition-all hover:border-[color-mix(in_oklch,var(--neon-green)_85%,transparent)] hover:scale-105"
        >
          <Terminal size={20} className="transition-transform group-hover:scale-110" />
          <span className="absolute -right-1 -top-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--neon-green)] opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--neon-green)]" />
          </span>
          <span className="pointer-events-none absolute -top-7 right-0 whitespace-nowrap font-pixel text-[7px] neon-green opacity-0 transition-opacity group-hover:opacity-100">
            PRESS / OR CLICK
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center sm:p-8"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeTerminal();
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="term-in neon-border-green flex w-full max-w-2xl flex-col overflow-hidden bg-[oklch(0.1_0.025_55)]"
            >
              {/* title bar */}
              <div className="flex items-center justify-between border-b border-[color-mix(in_oklch,var(--neon-green)_30%,transparent)] bg-[oklch(0.13_0.03_55)] px-4 py-2">
                <div className="flex items-center gap-2 font-pixel text-[11px] neon-green">
                  <Terminal size={12} /> MOIZ-OS :: CMD
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden font-retro text-[10px] text-muted-foreground sm:inline">
                    {">"} / to focus · ↑↓ history · ESC to close
                  </span>
                  <button
                    onClick={closeTerminal}
                    onMouseEnter={() => play("hover")}
                    aria-label="Close terminal"
                    className="grid h-6 w-6 place-items-center border border-[color-mix(in_oklch,var(--neon-amber)_40%,transparent)] text-[var(--neon-amber)] transition-colors hover:bg-[color-mix(in_oklch,var(--neon-amber)_18%,transparent)]"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              {/* output */}
              <div
                ref={scrollRef}
                className="h-72 overflow-y-auto px-4 py-3 font-retro text-sm leading-relaxed"
              >
                {lines.map((l, i) => (
                  <div key={i} className={lineColor[l.kind]}>
                    {l.text}
                  </div>
                ))}
                {/* input line */}
                <form onSubmit={onSubmit} className="mt-1 flex items-center gap-2">
                  <span className="neon-amber">{"~$"}</span>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      play("type");
                    }}
                    onKeyDown={onKey}
                    spellCheck={false}
                    autoComplete="off"
                    placeholder="type a command… (try 'help')"
                    className="flex-1 bg-transparent font-retro text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                  />
                  <CornerDownLeft
                    size={12}
                    className="text-muted-foreground/60"
                    aria-hidden
                  />
                </form>
              </div>

              {/* hint bar */}
              <div className="flex flex-wrap items-center gap-1.5 border-t border-[color-mix(in_oklch,var(--neon-green)_25%,transparent)] bg-[oklch(0.12_0.025_55)] px-4 py-2">
                {["help", "man", "about", "projects", "skills", "contact", "whoami", "status", "pad", "random", "play", "achievements", "settings", "matrix", "history", "print"].map(
                  (c) => (
                    <button
                      key={c}
                      onClick={() => {
                        run(c);
                        inputRef.current?.focus();
                      }}
                      onMouseEnter={() => play("hover")}
                      className="border border-[color-mix(in_oklch,var(--neon-green)_35%,transparent)] px-2 py-0.5 font-retro text-[11px] neon-green transition-colors hover:bg-[color-mix(in_oklch,var(--neon-green)_14%,transparent)]"
                    >
                      {c}
                    </button>
                  ),
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
