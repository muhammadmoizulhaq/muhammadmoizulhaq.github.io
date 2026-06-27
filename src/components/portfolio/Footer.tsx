"use client";

import { Trophy } from "lucide-react";
import { PROFILE } from "@/lib/portfolio-data";
import { Tilt3D } from "./Tilt3D";
import { useSound } from "@/hooks/use-sound";
import { useAccent } from "@/hooks/use-accent";
import { useAchievements } from "@/hooks/use-achievements";
import { openAchievementsPanel } from "./AchievementToast";

export function Footer() {
  const { play } = useSound();
  const { accent } = useAccent();
  const { count, total, points } = useAchievements();

  return (
    <footer className="mt-auto border-t border-[color-mix(in_oklch,var(--ring)_30%,transparent)] bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <button
            onClick={() => {
              play("nav");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onMouseEnter={() => play("hover")}
            className="group"
            aria-label="Back to top"
          >
            <Tilt3D max={14} glare={false} scale={1.05} className="h-9 w-9">
              <span className="grid h-full w-full place-items-center border border-[color-mix(in_oklch,var(--ring)_50%,transparent)] font-pixel text-[11px] text-primary">
                {PROFILE.monogram}
              </span>
            </Tilt3D>
          </button>

          <div className="flex flex-col items-center gap-1 text-center md:items-start md:text-left">
            <div className="font-pixel text-[11px] text-primary">
              MUHAMMAD MOIZ UL HAQ
            </div>
            <div className="font-retro text-xs text-muted-foreground">
              © {new Date().getFullYear()} · BUILT WITH UNREAL DEDICATION · REMOTE WORLDWIDE
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Live achievement counter — reinforces gamification */}
            <button
              onClick={() => {
                openAchievementsPanel();
                play("click");
              }}
              onMouseEnter={() => play("hover")}
              aria-label={`Achievements: ${count} of ${total} unlocked, ${points} points`}
              title="Open achievements scoreboard"
              className="flex items-center gap-1.5 border border-[color-mix(in_oklch,var(--neon-amber)_40%,transparent)] px-2 py-1 font-retro text-[10px] text-[var(--neon-amber)] transition-all hover:bg-[color-mix(in_oklch,var(--neon-amber)_12%,transparent)]"
            >
              <Trophy size={11} />
              <span className="font-pixel text-[11px]">{count}/{total}</span>
              <span className="opacity-70">·</span>
              <span>{points} PTS</span>
            </button>

            <div className="flex items-center gap-1.5 font-retro text-xs neon-green">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--neon-green)]" />
              STATUS: ONLINE
            </div>
            <div
              className="flex items-center gap-1.5 font-retro text-[10px] text-muted-foreground"
              title="Current accent"
            >
              <span
                className="inline-block h-2.5 w-2.5"
                style={{ background: "var(--ring)", boxShadow: "0 0 6px var(--ring)" }}
              />
              {accent.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
