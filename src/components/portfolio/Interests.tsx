"use client";

import { motion } from "framer-motion";
import { Gamepad2, Leaf, Scroll, Globe, Newspaper } from "lucide-react";
import { SectionTitle } from "./About";
import { Tilt3D } from "./Tilt3D";
import { INTERESTS } from "@/lib/portfolio-data";

const iconMap: Record<string, React.ReactNode> = {
  gamepad: <Gamepad2 size={20} />,
  leaf: <Leaf size={20} />,
  scroll: <Scroll size={20} />,
  globe: <Globe size={20} />,
  newspaper: <Newspaper size={20} />,
};

const accents = ["amber", "magenta", "green", "orange", "amber"] as const;

export function Interests() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <SectionTitle index="05" title="INTERESTS" accent="amber" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {INTERESTS.map((it, i) => {
          const c = `var(--neon-${accents[i % accents.length]})`;
          return (
            <motion.div
              key={it.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <Tilt3D max={18} className="h-full">
                <div
                  className="flex h-full flex-col items-center gap-3 border bg-card/70 p-5 text-center backdrop-blur-sm"
                  style={{
                    borderColor: `color-mix(in oklch, ${c} 45%, transparent)`,
                    boxShadow: `inset 0 0 22px -12px ${c}`,
                  }}
                >
                  <div
                    className="grid h-12 w-12 place-items-center border"
                    style={{
                      borderColor: `color-mix(in oklch, ${c} 60%, transparent)`,
                      color: c,
                      textShadow: `0 0 6px color-mix(in oklch, ${c} 70%, transparent)`,
                      transform: "translateZ(30px)",
                    }}
                  >
                    {iconMap[it.icon]}
                  </div>
                  <div
                    className="font-pixel text-[10px]"
                    style={{ color: c }}
                  >
                    {it.name.toUpperCase()}
                  </div>
                </div>
              </Tilt3D>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
