/**
 * Achievements system — arcade-style unlock tracking for the portfolio.
 *
 * Achievements are retro "scoreboard" entries the visitor earns by interacting
 * with the site (opening the terminal, flipping cards, triggering the Konami
 * code, etc.). State persists to localStorage and a toast is raised whenever a
 * new achievement unlocks (consumed by `useAchievements` + AchievementToast).
 *
 * On-theme gamification for an arcade portfolio.
 */

export type AchievementRarity = "common" | "uncommon" | "rare" | "legendary";

export type Achievement = {
  id: string;
  title: string;
  desc: string;
  rarity: AchievementRarity;
  /** Optional arcade-style points value. */
  pts: number;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "power_on",
    title: "POWER ON",
    desc: "Witnessed the CRT boot sequence.",
    rarity: "common",
    pts: 10,
  },
  {
    id: "terminal_explorer",
    title: "COMMAND LINE",
    desc: "Opened the MOIZ-OS terminal.",
    rarity: "common",
    pts: 15,
  },
  {
    id: "rtfm",
    title: "RTFM",
    desc: "Ran the `help` command.",
    rarity: "common",
    pts: 10,
  },
  {
    id: "whoami",
    title: "IDENTITY",
    desc: "Asked the terminal who you are.",
    rarity: "common",
    pts: 10,
  },
  {
    id: "card_shark",
    title: "CARD SHARK",
    desc: "Flipped 3 project cards.",
    rarity: "uncommon",
    pts: 25,
  },
  {
    id: "deck_master",
    title: "DECK MASTER",
    desc: "Flipped all 10 project cards.",
    rarity: "rare",
    pts: 60,
  },
  {
    id: "deep_dive",
    title: "DEEP DIVE",
    desc: "Opened a project detail modal.",
    rarity: "common",
    pts: 15,
  },
  {
    id: "cinephile",
    title: "CINEPHILE",
    desc: "Opened a video showreel detail.",
    rarity: "uncommon",
    pts: 25,
  },
  {
    id: "chroma",
    title: "CHROMA",
    desc: "Cycled the neon accent.",
    rarity: "common",
    pts: 15,
  },
  {
    id: "spectrum",
    title: "SPECTRUM",
    desc: "Tried all 4 accent colors.",
    rarity: "rare",
    pts: 50,
  },
  {
    id: "glitched",
    title: "GLITCH IN THE MATRIX",
    desc: "Triggered the Konami glitch storm.",
    rarity: "rare",
    pts: 50,
  },
  {
    id: "ambient",
    title: "AMBIENT",
    desc: "Started the chiptune drone pad.",
    rarity: "uncommon",
    pts: 25,
  },
  {
    id: "keyboard_wizard",
    title: "KEYBOARD WIZARD",
    desc: "Opened the keybindings card.",
    rarity: "uncommon",
    pts: 20,
  },
  {
    id: "archivist",
    title: "ARCHIVIST",
    desc: "Exported the resume (print).",
    rarity: "uncommon",
    pts: 25,
  },
  {
    id: "completionist",
    title: "COMPLETIONIST",
    desc: "Unlocked every other achievement.",
    rarity: "legendary",
    pts: 100,
  },
  {
    id: "snake_player",
    title: "SNAKE PLAYER",
    desc: "Played a round of SNAKE.EXE in the terminal.",
    rarity: "uncommon",
    pts: 25,
  },
  {
    id: "snake_master",
    title: "SNAKE MASTER",
    desc: "Scored 30+ in SNAKE.EXE — arcade credibility earned.",
    rarity: "rare",
    pts: 50,
  },
  {
    id: "unplugged",
    title: "UNPLUGGED",
    desc: "Entered the Matrix — digital rain engaged.",
    rarity: "rare",
    pts: 45,
  },
  {
    id: "stealth",
    title: "STEALTH MODE",
    desc: "Hit the boss key — nobody saw you slacking.",
    rarity: "uncommon",
    pts: 30,
  },
  {
    id: "calibrator",
    title: "CALIBRATOR",
    desc: "Tuned the CRT settings like a true technician.",
    rarity: "uncommon",
    pts: 25,
  },
  {
    id: "regular",
    title: "REGULAR",
    desc: "Visited 3 days in a row — habit forming.",
    rarity: "uncommon",
    pts: 30,
  },
  {
    id: "loyalist",
    title: "LOYALIST",
    desc: "7-day visit streak — you're a true local.",
    rarity: "rare",
    pts: 60,
  },
];

const STORAGE_KEY = "moiz_achievements";
const STORAGE_SEEN_KEY = "moiz_achievements_seen_accents";
const STORAGE_FLIP_KEY = "moiz_achievements_flipped";
/** Separate log of {id, ts} for unlock history (newest first). */
const STORAGE_LOG_KEY = "moiz_achievements_log";

/** Internal: read the unlock-timestamp log (newest first). */
type LogEntry = { id: string; ts: number };
function readLog(): LogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_LOG_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as LogEntry[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeLog(log: LogEntry[]) {
  try {
    localStorage.setItem(STORAGE_LOG_KEY, JSON.stringify(log.slice(0, 50)));
  } catch {
    /* ignore */
  }
}

/** Public: the full unlock history (newest first), each with a timestamp. */
export function unlockLog(): { id: string; ts: number; title: string }[] {
  const log = readLog();
  return log.map((e) => ({
    ...e,
    title: achievementById(e.id)?.title ?? e.id,
  }));
}

/** Format a timestamp as a short relative time string (e.g. "2m ago", "just now"). */
export function formatUnlockTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** Internal: read the full unlocked set. */
function readUnlocked(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function writeUnlocked(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

export function unlockedIds(): string[] {
  return [...readUnlocked()];
}

export function isUnlocked(id: string): boolean {
  return readUnlocked().has(id);
}

export function achievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/** Total points earned. */
export function achievementPoints(): number {
  const set = readUnlocked();
  return ACHIEVEMENTS.filter((a) => set.has(a.id)).reduce(
    (sum, a) => sum + a.pts,
    0,
  );
}

/**
 * Unlock an achievement by id. Returns true if this is a NEW unlock (so the
 * caller can fire a toast / sound). Auto-unlocks `completionist` when all
 * other achievements are earned. Also appends to the timestamped unlock log.
 */
export function unlock(id: string): boolean {
  const set = readUnlocked();
  if (set.has(id)) return false;
  set.add(id);
  const now = Date.now();
  // Auto-unlock completionist if every OTHER achievement is now unlocked.
  const others = ACHIEVEMENTS.filter((a) => a.id !== "completionist");
  let bonusUnlock = false;
  if (id !== "completionist" && others.every((a) => set.has(a.id))) {
    set.add("completionist");
    bonusUnlock = true;
  }
  writeUnlocked(set);
  // Append to the timestamped unlock log (newest first).
  const log = readLog();
  log.unshift({ id, ts: now });
  if (bonusUnlock) log.unshift({ id: "completionist", ts: now + 1 });
  writeLog(log);
  // Dispatch a global event so toasts + UI can react.
  window.dispatchEvent(
    new CustomEvent("moiz:achievement", { detail: id }),
  );
  return true;
}

/* ------------------------------------------------------------------ */
/* Domain-specific unlock helpers (track counters in localStorage).    */
/* ------------------------------------------------------------------ */

/** Read the count of distinct flipped project cards. */
export function flippedCount(): number {
  try {
    const raw = localStorage.getItem(STORAGE_FLIP_KEY);
    if (!raw) return 0;
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

/** Read the count of distinct accents the user has explicitly chosen. */
export function accentsTriedCount(): number {
  try {
    const raw = localStorage.getItem(STORAGE_SEEN_KEY);
    if (!raw) return 0;
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) ? new Set(arr).size : 0;
  } catch {
    return 0;
  }
}

/**
 * For counter-based achievements, return a progress hint {current, target}.
 * Returns null for non-counter achievements (no meaningful progress to show).
 * Used by the scoreboard GRID tab to nudge users toward the next unlock.
 */
export function achievementProgress(id: string): { current: number; target: number; label: string } | null {
  switch (id) {
    case "card_shark":
      return { current: Math.min(flippedCount(), 3), target: 3, label: "flips" };
    case "deck_master":
      return { current: Math.min(flippedCount(), 10), target: 10, label: "flips" };
    case "spectrum":
      return { current: Math.min(accentsTriedCount(), 4), target: 4, label: "accents" };
    default:
      return null;
  }
}

/** Track which project cards have been flipped; unlock tiers as they grow. */
export function trackProjectFlip(projectId: string) {
  let flipped: string[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_FLIP_KEY);
    if (raw) flipped = JSON.parse(raw) as string[];
  } catch {
    /* ignore */
  }
  if (!flipped.includes(projectId)) {
    flipped.push(projectId);
    try {
      localStorage.setItem(STORAGE_FLIP_KEY, JSON.stringify(flipped));
    } catch {
      /* ignore */
    }
  }
  if (flipped.length >= 3) unlock("card_shark");
  // 10 distinct project cards = deck_master (PROJECTS.length is 10)
  if (flipped.length >= 10) unlock("deck_master");
}

/** Track which accents the user has explicitly chosen; unlock spectrum at 4. */
export function trackAccentTried(accent: string) {
  let seen: string[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_SEEN_KEY);
    if (raw) seen = JSON.parse(raw) as string[];
  } catch {
    /* ignore */
  }
  if (!seen.includes(accent)) {
    seen.push(accent);
    try {
      localStorage.setItem(STORAGE_SEEN_KEY, JSON.stringify(seen));
    } catch {
      /* ignore */
    }
  }
  const distinct = new Set(seen).size;
  if (distinct >= 4) unlock("spectrum");
}

/** Reset all achievements (used by the terminal `reset-achievements` command). */
export function resetAchievements() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_SEEN_KEY);
    localStorage.removeItem(STORAGE_FLIP_KEY);
    localStorage.removeItem(STORAGE_LOG_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent("moiz:achievement-reset"));
}

export const RARITY_META: Record<
  AchievementRarity,
  { label: string; color: string; glow: string }
> = {
  common: {
    label: "COMMON",
    color: "var(--neon-green)",
    glow: "color-mix(in oklch, var(--neon-green) 55%, transparent)",
  },
  uncommon: {
    label: "UNCOMMON",
    color: "var(--neon-amber)",
    glow: "color-mix(in oklch, var(--neon-amber) 55%, transparent)",
  },
  rare: {
    label: "RARE",
    color: "var(--neon-magenta)",
    glow: "color-mix(in oklch, var(--neon-magenta) 55%, transparent)",
  },
  legendary: {
    label: "LEGENDARY",
    color: "var(--neon-yellow)",
    glow: "color-mix(in oklch, var(--neon-yellow) 60%, transparent)",
  },
};
