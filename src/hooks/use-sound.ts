"use client";

import * as React from "react";
import {
  isMuted,
  setMuted,
  playSound,
  isPadOn,
  startPad,
  stopPad,
  getPadPreset,
  setPadPreset,
  type PadPreset,
} from "@/lib/sound";

/**
 * useSound — reactive mute + pad state plus a play() helper.
 *
 * Mute + pad state sync across all consumers via custom events.
 */
export function useSound() {
  const [muted, setMutedState] = React.useState(false);
  const [padOn, setPadOnState] = React.useState(false);
  const [preset, setPresetState] = React.useState<PadPreset>("drone");

  React.useEffect(() => {
    setMutedState(isMuted());
    setPadOnState(isPadOn());
    setPresetState(getPadPreset());
    const onMute = (e: Event) => {
      setMutedState((e as CustomEvent<boolean>).detail);
    };
    const onPad = (e: Event) => {
      setPadOnState((e as CustomEvent<boolean>).detail);
    };
    const onPreset = (e: Event) => {
      setPresetState((e as CustomEvent<PadPreset>).detail);
    };
    window.addEventListener("moiz:mute", onMute);
    window.addEventListener("moiz:pad", onPad);
    window.addEventListener("moiz:pad-preset", onPreset);
    return () => {
      window.removeEventListener("moiz:mute", onMute);
      window.removeEventListener("moiz:pad", onPad);
      window.removeEventListener("moiz:pad-preset", onPreset);
    };
  }, []);

  const toggle = React.useCallback(() => {
    const next = !isMuted();
    setMuted(next);
    setMutedState(next);
  }, []);

  const togglePad = React.useCallback(() => {
    if (isPadOn()) {
      stopPad();
    } else {
      startPad();
    }
  }, []);

  const setPreset = React.useCallback((p: PadPreset) => {
    setPadPreset(p);
    setPresetState(p);
  }, []);

  const play = React.useCallback((name: Parameters<typeof playSound>[0]) => {
    playSound(name);
  }, []);

  return { muted, toggle, play, padOn, togglePad, preset, setPreset };
}
