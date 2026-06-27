"use client";

import * as React from "react";
import {
  ACHIEVEMENTS,
  achievementById,
  unlockedIds,
} from "@/lib/achievements";

/**
 * useAchievements — reactive view of the unlocked achievements.
 *
 * Listens to the `moiz:achievement` + `moiz:achievement-reset` events so any
 * consumer stays in sync. Also exposes a `pending` queue of newly-unlocked
 * achievement objects that the toast component can drain.
 *
 * NOTE: `unlocked` starts as `[]` (deterministic — matches SSR) and hydrates
 * from localStorage in an effect. `points` is derived from the `unlocked`
 * STATE (not read directly from localStorage) so server and client first
 * render agree → no hydration mismatch.
 */
export function useAchievements() {
  const [unlocked, setUnlocked] = React.useState<string[]>([]);
  const [pending, setPending] = React.useState<string[]>([]);

  // Hydrate from storage on mount (client-only).
  React.useEffect(() => {
    setUnlocked(unlockedIds());
  }, []);

  React.useEffect(() => {
    const onUnlock = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setUnlocked(unlockedIds());
      if (id && achievementById(id)) {
        setPending((p) => [...p, id]);
      }
    };
    const onReset = () => {
      setUnlocked([]);
      setPending([]);
    };
    window.addEventListener("moiz:achievement", onUnlock);
    window.addEventListener("moiz:achievement-reset", onReset);
    return () => {
      window.removeEventListener("moiz:achievement", onUnlock);
      window.removeEventListener("moiz:achievement-reset", onReset);
    };
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setPending((p) => p.filter((x) => x !== id));
  }, []);

  const dismissAll = React.useCallback(() => setPending([]), []);

  const total = ACHIEVEMENTS.length;
  // Derive points from the `unlocked` state (deterministic on first render)
  // instead of reading localStorage directly — fixes hydration mismatch.
  const unlockedSet = React.useMemo(() => new Set(unlocked), [unlocked]);
  const points = React.useMemo(
    () =>
      ACHIEVEMENTS.filter((a) => unlockedSet.has(a.id)).reduce(
        (sum, a) => sum + a.pts,
        0,
      ),
    [unlockedSet],
  );

  return {
    unlocked,
    pending,
    dismiss,
    dismissAll,
    total,
    count: unlocked.length,
    points,
  };
}
