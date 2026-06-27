"use client";

import { motion } from "framer-motion";
import { SectionTitle } from "./About";
import { Tilt3D } from "./Tilt3D";
import { SKILLS, type Skill } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

const accent: Record<Skill["accent"], string> = {
  amber: "var(--neon-amber)",
  orange: "var(--neon-orange)",
  magenta: "var(--neon-magenta)",
  green: "var(--neon-green)",
};

export function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-6xl px-4 py-20 md:px-6">
      <SectionTitle index="04" title="SKILLS" accent="green" />

      <div className="grid gap-5 md:grid-cols-2">
        {SKILLS.map((s, i) => {
          const c = accent[s.accent];
          return (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Tilt3D max={7} className="h-full">
                <div className="relative h-full overflow-hidden border border-[color-mix(in_oklch,var(--neon-green)_30%,transparent)] bg-card/70 p-5 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-xs text-foreground">{s.name}</span>
                    <span
                      className="font-pixel text-sm"
                      style={{ color: c, textShadow: `0 0 6px color-mix(in oklch, ${c} 70%, transparent)` }}
                    >
                      {s.level}%
                    </span>
                  </div>

                  {/* segmented retro bar */}
                  <div className="mt-4 flex gap-1">
                    {Array.from({ length: 20 }).map((_, seg) => {
                      const filled = (seg / 20) * 100 < s.level;
                      return (
                        <div
                          key={seg}
                          className="h-3 flex-1 transition-colors"
                          style={{
                            background: filled
                              ? c
                              : "color-mix(in oklch, var(--foreground) 8%, transparent)",
                            boxShadow: filled
                              ? `0 0 6px color-mix(in oklch, ${c} 60%, transparent)`
                              : "none",
                            opacity: filled ? 0.9 : 1,
                          }}
                        />
                      );
                    })}
                  </div>

                  <div className="mt-3 font-retro text-xs text-muted-foreground">
                    <span className="neon-green">{">"}</span>{" "}
                    {s.level >= 90 ? "EXPERT" : s.level >= 80 ? "ADVANCED" : "PROFICIENT"}
                  </div>

                  <div
                    className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl"
                    style={{ background: `color-mix(in oklch, ${c} 20%, transparent)` }}
                  />
                </div>
              </Tilt3D>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export { accent as skillAccent };
