"use client";

import * as React from "react";

/**
 * CountUp — animates a numeric value from 0 (or `from`) to the parsed numeric
 * portion of `value` once it scrolls into view. Non-numeric prefix/suffix
 * (e.g. "20%", "5+", "10+") are preserved around the animated digits.
 *
 * Uses IntersectionObserver + requestAnimationFrame for smooth, performant
 * counting that only triggers when visible.
 */
export function CountUp({
  value,
  duration = 1400,
  className,
  glow = false,
}: {
  value: string;
  duration?: number;
  className?: string;
  glow?: boolean;
}) {
  // Parse the leading numeric portion and the surrounding affixes.
  const match = value.match(/^(\D*)(\d+(?:\.\d+)?)(\D*)$/);
  const prefix = match?.[1] ?? "";
  const target = match ? parseFloat(match[2]) : 0;
  const suffix = match?.[3] ?? "";
  const isDecimal = match?.[2]?.includes(".") ?? false;

  const ref = React.useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = React.useState(0);
  const started = React.useRef(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              // easeOutCubic
              const eased = 1 - Math.pow(1 - t, 3);
              setDisplay(target * eased);
              if (t < 1) requestAnimationFrame(tick);
              else setDisplay(target);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  const shown = isDecimal ? display.toFixed(1) : Math.round(display).toString();

  return (
    <span
      ref={ref}
      className={className}
      style={glow ? undefined : undefined}
    >
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}
