"use client";

import { motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { Tilt3D } from "./Tilt3D";
import { PROFILE } from "@/lib/portfolio-data";

const MARQUEE = [
  "UNREAL ENGINE",
  "C++",
  "MULTIPLAYER NETWORKING",
  "GAMEPLAY SYSTEMS",
  "PERFORMANCE OPTIMIZATION",
  "SYSTEM DESIGN",
  "VR / IMMERSIVE",
  "REST API",
];

export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-4 py-20 md:px-6">
      <SectionTitle index="01" title="ABOUT" accent="amber" />

      <div className="grid gap-6 md:grid-cols-5">
        {/* Bio panel — 3D tilt */}
        <div className="md:col-span-3">
          <Tilt3D max={8} className="h-full">
            <div className="neon-border-amber relative h-full overflow-hidden bg-card/70 p-6 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-2 font-pixel text-[11px] neon-amber">
                <Terminal size={12} /> {"// BIO.LOG"}
              </div>
              <div className="space-y-4 font-retro text-lg leading-relaxed text-foreground/90">
                {PROFILE.bio.map((p, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <span className="neon-green">{">"}</span> {p}
                  </motion.p>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Abu Dhabi", "Remote", "C++", "Unreal 5"].map((t) => (
                  <span
                    key={t}
                    className="border border-[color-mix(in_oklch,var(--neon-green)_40%,transparent)] px-2 py-0.5 font-retro text-xs neon-green"
                  >
                    [{t}]
                  </span>
                ))}
              </div>
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[color-mix(in_oklch,var(--neon-amber)_15%,transparent)] blur-2xl" />
            </div>
          </Tilt3D>
        </div>

        {/* Terminal card */}
        <div className="md:col-span-2">
          <Tilt3D max={12} className="h-full">
            <div className="neon-border-green h-full bg-[oklch(0.1_0.02_55)] p-5 font-retro">
              <div className="mb-3 flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--neon-magenta)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--neon-amber)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--neon-green)]" />
              </div>
              <pre className="whitespace-pre-wrap text-sm leading-snug text-foreground/90">
{`> whoami
${PROFILE.name}
> role
Unreal Engine Developer
> stack
C/C++ | Unreal | Python
> focus
multiplayer · perf · systems
> status
[ONLINE] open to remote`}
              </pre>
              <div className="mt-3 font-retro text-xs neon-green blink-cursor">
                ready for input
              </div>
            </div>
          </Tilt3D>
        </div>
      </div>

      {/* Marquee */}
      <div className="relative mt-10 overflow-hidden border-y border-[color-mix(in_oklch,var(--neon-amber)_25%,transparent)] py-3">
        <div className="marquee">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span
              key={i}
              className="mx-6 font-pixel text-xs neon-amber"
            >
              {m}
              <span className="ml-6 neon-magenta">◆</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionTitle({
  index,
  title,
  accent,
}: {
  index: string;
  title: string;
  accent: "amber" | "orange" | "magenta" | "green";
}) {
  const color =
    accent === "amber"
      ? "neon-amber"
      : accent === "orange"
        ? "neon-orange"
        : accent === "magenta"
          ? "neon-magenta"
          : "neon-green";
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <div className={`font-pixel text-[11px] opacity-70 ${color}`}>SECTION_{index}</div>
        <h2 className={`mt-2 font-pixel text-xl ${color} sm:text-2xl`}>
          <span className="mr-2 opacity-50">{">"}</span>
          {title}
        </h2>
      </div>
      <div className={`h-px flex-1 bg-[color-mix(in_oklch,var(--neon-${accent})_30%,transparent)]`} />
    </div>
  );
}
