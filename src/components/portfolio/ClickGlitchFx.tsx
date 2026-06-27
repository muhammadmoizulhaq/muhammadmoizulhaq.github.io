"use client";

import { useGlitchClick } from "@/hooks/use-glitch-click";

/**
 * ClickGlitchFx — mount-once client component that activates the global
 * button-click glitch effect. Renders nothing; just wires up the listener.
 */
export function ClickGlitchFx() {
  useGlitchClick();
  return null;
}
