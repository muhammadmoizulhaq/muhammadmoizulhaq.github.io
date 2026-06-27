/**
 * Visitor streak — track consecutive-day visits.
 *
 * Records each visit day to localStorage. If the last visit was yesterday the
 * streak increments; if it was today it's unchanged; otherwise the streak
 * resets to 1. Surfaces the current streak + a "welcome back" flag (true when
 * the visitor has come back on a new day, i.e. streak >= 2 and not the first
 * session). Unlocks `regular` (3-day) and `loyalist` (7-day) achievements.
 */

const KEY = "moiz_visit";
const VISIT_EVENT = "moiz:visit";

export type VisitState = {
  /** Current consecutive-day streak (>= 1). */
  streak: number;
  /** Best streak ever recorded. */
  best: number;
  /** Total distinct days visited. */
  totalDays: number;
  /** Today's date as YYYY-MM-DD. */
  today: string;
  /** True when this session is a returning visit (streak >= 2). */
  welcomeBack: boolean;
};

function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayDiff(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

function read(): {
  last: string;
  streak: number;
  best: number;
  days: string[];
} | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function write(data: { last: string; streak: number; best: number; days: string[] }) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

/**
 * Record a visit for today and return the updated state. Idempotent within a
 * single day (calling it repeatedly on the same day won't inflate the streak).
 */
export function recordVisit(): VisitState {
  const today = todayStr();
  const prev = read();
  let streak = 1;
  let best = 1;
  let days: string[] = [today];
  let welcomeBack = false;

  if (prev) {
    days = prev.days && Array.isArray(prev.days) ? [...prev.days] : [prev.last];
    if (!days.includes(today)) days.push(today);
    const diff = dayDiff(prev.last, today);
    if (diff === 0) {
      // Same day — keep streak, this isn't a "returning" visit.
      streak = prev.streak;
      welcomeBack = false;
    } else if (diff === 1) {
      // Consecutive day — increment.
      streak = prev.streak + 1;
      welcomeBack = true;
    } else {
      // Gap — reset.
      streak = 1;
      welcomeBack = false;
    }
    best = Math.max(prev.best || 1, streak);
  }

  write({ last: today, streak, best, days });

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(VISIT_EVENT, {
        detail: { streak, best, totalDays: days.length, today, welcomeBack },
      }),
    );
  }

  return { streak, best, totalDays: days.length, today, welcomeBack };
}

export function getVisit(): VisitState {
  const today = todayStr();
  const prev = read();
  if (!prev) {
    return { streak: 1, best: 1, totalDays: 1, today, welcomeBack: false };
  }
  const diff = dayDiff(prev.last, today);
  const streak = diff === 0 ? prev.streak : diff === 1 ? prev.streak + 1 : 1;
  const days = prev.days && Array.isArray(prev.days) ? prev.days : [prev.last];
  return {
    streak,
    best: Math.max(prev.best || 1, streak),
    totalDays: days.includes(today) ? days.length : days.length + 1,
    today,
    welcomeBack: diff >= 1 && streak >= 2,
  };
}

export { VISIT_EVENT };
