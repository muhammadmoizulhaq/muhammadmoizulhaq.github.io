"use client";

import { motion } from "framer-motion";
import { Briefcase, MapPin, Calendar, Check } from "lucide-react";
import { Tilt3D } from "./Tilt3D";
import { SectionTitle } from "./About";
import { EXPERIENCES, type Experience } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

const accentClass: Record<Experience["accent"], { border: string; text: string; dot: string }> = {
  amber: { border: "neon-border-amber", text: "neon-amber", dot: "bg-[var(--neon-amber)]" },
  orange: { border: "neon-border-orange", text: "neon-orange", dot: "bg-[var(--neon-orange)]" },
  magenta: { border: "neon-border-magenta", text: "neon-magenta", dot: "bg-[var(--neon-magenta)]" },
  green: { border: "neon-border-green", text: "neon-green", dot: "bg-[var(--neon-green)]" },
};

export function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-6xl px-4 py-20 md:px-6">
      <SectionTitle index="02" title="EXPERIENCE" accent="orange" />

      <div className="relative">
        {/* vertical timeline line */}
        <div
          className="absolute left-4 top-2 h-full w-px bg-[color-mix(in_oklch,var(--neon-orange)_35%,transparent)] md:left-1/2 md:-translate-x-1/2"
          aria-hidden
        />

        <div className="space-y-10">
          {EXPERIENCES.map((exp, i) => {
            const a = accentClass[exp.accent];
            const left = i % 2 === 0;
            return (
              <div
                key={exp.id}
                className={cn(
                  "relative pl-12 md:grid md:grid-cols-2 md:gap-8 md:pl-0",
                )}
              >
                {/* node — always centered on the timeline line (never assigned
                    to a grid column, so its absolute containing block is the
                    full row and left-1/2 resolves to the true center). */}
                <div
                  className="absolute left-4 top-4 z-10 -translate-x-1/2 md:left-1/2"
                  aria-hidden
                >
                  <span
                    className={cn(
                      "block h-3.5 w-3.5 rotate-45 border border-background",
                      a.dot,
                    )}
                  />
                  {exp.current && (
                    <span className="absolute inset-0 -m-1 flex items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--neon-green)] opacity-60" />
                    </span>
                  )}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5 }}
                  className={cn(left ? "md:col-start-1" : "md:col-start-2")}
                >
                  <Tilt3D max={9} className="h-full">
                    <div className={cn("relative h-full p-5 backdrop-blur-sm", a.border, "bg-card/70")}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className={cn("flex items-center gap-2 font-pixel text-[11px]", a.text)}>
                            <Briefcase size={14} /> {exp.company}
                            {exp.current && (
                              <span className="ml-1 border border-[color-mix(in_oklch,var(--neon-green)_60%,transparent)] px-1.5 py-0.5 text-[10px] neon-green">
                                CURRENT
                              </span>
                            )}
                          </div>
                          <h3 className="mt-2 font-pixel text-base text-foreground">
                            {exp.role}
                          </h3>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-retro text-base text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={14} /> {exp.period}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={14} /> {exp.location}
                        </span>
                      </div>

                      <ul className="mt-4 space-y-2">
                        {exp.highlights.map((h, hi) => (
                          <li key={hi} className="flex gap-2 font-retro text-lg leading-snug text-foreground/85">
                            <Check size={16} className={cn("mt-1 shrink-0", a.text)} />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Tilt3D>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
