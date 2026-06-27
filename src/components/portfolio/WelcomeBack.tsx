"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck } from "lucide-react";
import { recordVisit, getVisit } from "@/lib/visitor";
import { unlock } from "@/lib/achievements";
import { useSound } from "@/hooks/use-sound";

/**
 * WelcomeBack — a one-shot retro toast greeting returning visitors.
 *
 * On mount it records today's visit. If the visitor is returning on a new day
 * (streak >= 2) it shows a "WELCOME BACK" toast for a few seconds with the
 * current streak count. Also unlocks the `regular` (3-day) and `loyalist`
 * (7-day) achievements when thresholds are crossed.
 */
export function WelcomeBack() {
  const [show, setShow] = React.useState(false);
  const [streak, setStreak] = React.useState(1);
  const { play } = useSound();

  React.useEffect(() => {
    // Only record once per page load.
    if (sessionStorage.getItem("moiz_visit_recorded") === "1") {
      const v = getVisit();
      setStreak(v.streak);
      return;
    }
    try {
      sessionStorage.setItem("moiz_visit_recorded", "1");
    } catch {
      /* ignore */
    }
    const v = recordVisit();
    setStreak(v.streak);
    // Achievement thresholds.
    if (v.streak >= 3) unlock("regular");
    if (v.streak >= 7) unlock("loyalist");
    // Only toast for genuine returning visits (not the very first day).
    if (v.welcomeBack) {
      setShow(true);
      play("success");
      const t = setTimeout(() => setShow(false), 6000);
      return () => clearTimeout(t);
    }
  }, [play]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed left-1/2 top-20 z-[75] -translate-x-1/2"
          initial={{ y: -40, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -40, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 border border-[color-mix(in_oklch,var(--neon-green)_55%,transparent)] bg-background/95 px-4 py-2.5 shadow-[0_0_24px_color-mix(in_oklch,var(--neon-green)_30%,transparent)] backdrop-blur-sm">
            <UserCheck size={16} className="text-[var(--neon-green)]" />
            <div className="font-retro text-[11px] leading-tight">
              <div className="text-[var(--neon-green)]">
                {">"} WELCOME BACK, OPERATOR
              </div>
              <div className="text-muted-foreground">
                STREAK: <span className="text-primary">{streak}</span> DAY
                {streak === 1 ? "" : "S"} · KEEP IT RUNNING
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
