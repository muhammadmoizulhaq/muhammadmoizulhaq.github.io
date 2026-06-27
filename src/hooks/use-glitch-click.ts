"use client";

import * as React from "react";

/**
 * useGlitchClick — attaches a single global `click` listener (capture phase)
 * that finds the nearest interactive ancestor (`button`, `[role="button"]`,
 * `a[href]`) of the clicked element and briefly applies the `.glitch-clicked`
 * class to trigger the `btn-click-glitch` CSS keyframe (~280ms of CRT-style
 * chromatic-aberration jitter).
 *
 * The animation is `filter`-only (drop-shadow + brightness), so it never
 * conflicts with framer-motion `transform` animations (tilt, flip, layout).
 *
 * A per-element timer map prevents stacking when the same button is clicked
 * rapidly: the class is removed before being re-added.
 */
export function useGlitchClick() {
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const timers = new WeakMap<Element, ReturnType<typeof setTimeout>>();
    const DURATION = 300; // slightly longer than the 280ms keyframe for safety

    const findInteractive = (target: EventTarget | null): Element | null => {
      if (!(target instanceof Element)) return null;
      // Fast path: the clicked element itself is interactive.
      const sel = "button, a[href], [role='button'], [role='link']";
      if (target.closest) {
        return target.closest(sel);
      }
      return null;
    };

    const onClick = (e: MouseEvent) => {
      const el = findInteractive(e.target);
      if (!el) return;
      // Skip elements that explicitly opt out via [data-no-glitch].
      if (el.hasAttribute("data-no-glitch")) return;

      // Clear any in-flight timer for this element so we restart cleanly.
      const prev = timers.get(el);
      if (prev) clearTimeout(prev);

      el.classList.remove("glitch-clicked");
      // Force reflow so the animation restarts even when re-added in the
      // same frame as the removal.
      void (el as HTMLElement).offsetWidth;
      el.classList.add("glitch-clicked");

      const t = setTimeout(() => {
        el.classList.remove("glitch-clicked");
        timers.delete(el);
      }, DURATION);
      timers.set(el, t);
    };

    // Capture phase so we run before any stopPropagation in app handlers.
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
    };
  }, []);
}
