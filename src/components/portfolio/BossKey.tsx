"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isKonamiInProgress } from "./KonamiGlitch";

/**
 * BossKey — the classic arcade/office "boss key".
 *
 * Press B (or run `boss` in the terminal) and the portfolio instantly disguises
 * itself as a boring code-editor / spreadsheet view so no one knows you're
 * browsing a retro portfolio. Press B or ESC again (or click anywhere) to drop
 * the disguise. First activation unlocks the `stealth` achievement.
 *
 * Purely a presentational overlay — the real portfolio stays mounted underneath.
 */

let triggerFn: (() => void) | null = null;
export function triggerBossKey() {
  triggerFn?.();
}

const CODE_LINES = [
  "import { Component } from 'react';",
  "",
  "export class QuarterlyReport extends Component {",
  "  state = { revenue: 0, expenses: 0, margin: 0 };",
  "",
  "  componentDidMount() {",
  "    this.fetchMetrics();",
  "    this.interval = setInterval(this.fetchMetrics, 60000);",
  "  }",
  "",
  "  fetchMetrics = async () => {",
  "    const res = await fetch('/api/metrics');",
  "    const data = await res.json();",
  "    this.setState({",
  "      revenue: data.revenue,",
  "      expenses: data.expenses,",
  "      margin: ((data.revenue - data.expenses) / data.revenue) * 100,",
  "    });",
  "  };",
  "",
  "  render() {",
  "    const { revenue, expenses, margin } = this.state;",
  "    return (",
  "      <div className='report-container'>",
  "        <h1>Q4 2025 Financial Summary</h1>",
  "        <table>",
  "          <tr><td>Revenue</td><td>${revenue.toLocaleString()}</td></tr>",
  "          <tr><td>Expenses</td><td>${expenses.toLocaleString()}</td></tr>",
  "          <tr><td>Margin</td><td>{margin.toFixed(2)}%</td></tr>",
  "        </table>",
  "      </div>",
  "    );",
  "  }",
  "}",
];

export function BossKey() {
  const [on, setOn] = React.useState(false);

  React.useEffect(() => {
    triggerFn = () => setOn((v) => !v);
    return () => {
      triggerFn = null;
    };
  }, []);

  // B key toggles (only when not typing in an input).
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;
      if (typing) return;
      if (e.key === "b" || e.key === "B") {
        // Don't hijack the Konami code's "B" — skip if a sequence is underway.
        if (isKonamiInProgress()) return;
        e.preventDefault();
        setOn((v) => !v);
        // Unlock the stealth achievement the first time it's used.
        if (!on) {
          void import("@/lib/achievements").then((m) => m.unlock("stealth"));
        }
      } else if (e.key === "Escape" && on) {
        setOn(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [on]);

  return (
    <AnimatePresence>
      {on && (
        <motion.div
          className="fixed inset-0 z-[80] cursor-pointer overflow-hidden bg-[oklch(0.22_0.005_250)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => setOn(false)}
          role="dialog"
          aria-label="Stealth mode active — click to exit"
        >
          {/* Fake IDE title bar */}
          <div className="flex items-center gap-2 border-b border-white/10 bg-[oklch(0.18_0.005_250)] px-3 py-1.5 text-[11px] text-white/70">
            <span className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.65_0.2_25)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.72_0.18_85)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.7_0.18_145)]" />
            </span>
            <span className="ml-2 font-mono">
              QuarterlyReport.tsx — acme-corp-dashboard
            </span>
            <span className="ml-auto font-mono text-white/40">
              press B to exit stealth
            </span>
          </div>

          {/* Fake IDE body: sidebar + code + status bar */}
          <div className="flex h-[calc(100%-28px)]">
            {/* file tree */}
            <div className="hidden w-48 shrink-0 border-r border-white/10 bg-[oklch(0.19_0.005_250)] p-2 font-mono text-[10px] text-white/50 sm:block">
              <div className="mb-1 text-white/30">EXPLORER</div>
              <div className="space-y-0.5">
                <div>📁 src</div>
                <div className="pl-3">📁 components</div>
                <div className="pl-6 text-white/80">📄 QuarterlyReport.tsx</div>
                <div className="pl-6">📄 Dashboard.tsx</div>
                <div className="pl-6">📄 Sidebar.tsx</div>
                <div className="pl-3">📁 utils</div>
                <div className="pl-3">📄 index.ts</div>
                <div>📁 public</div>
                <div>📄 package.json</div>
                <div>📄 tsconfig.json</div>
              </div>
            </div>

            {/* code area */}
            <div className="flex-1 overflow-hidden bg-[oklch(0.22_0.005_250)] p-3">
              <pre className="font-mono text-[12px] leading-relaxed text-white/80">
                {CODE_LINES.map((line, i) => (
                  <div key={i} className="flex">
                    <span className="mr-3 inline-block w-6 select-none text-right text-white/25">
                      {i + 1}
                    </span>
                    <span
                      className={
                        line.startsWith("import")
                          ? "text-[oklch(0.75_0.18_200)]"
                          : line.includes("render")
                            ? "text-[oklch(0.78_0.15_145)]"
                            : line.includes("class")
                              ? "text-[oklch(0.78_0.16_55)]"
                              : "text-white/75"
                      }
                    >
                      {line || " "}
                    </span>
                  </div>
                ))}
                {/* blinking cursor */}
                <div className="flex">
                  <span className="mr-3 inline-block w-6 select-none text-right text-white/25">
                    {CODE_LINES.length + 1}
                  </span>
                  <span className="inline-block h-4 w-2 animate-pulse bg-white/70" />
                </div>
              </pre>
            </div>
          </div>

          {/* status bar */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-white/10 bg-[oklch(0.4_0.13_250)] px-3 py-1 font-mono text-[10px] text-white/90">
            <span>⎇ main</span>
            <span className="hidden sm:inline">TypeScript · UTF-8 · LF</span>
            <span>Ln 32, Col 3</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
