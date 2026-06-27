"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useSound } from "@/hooks/use-sound";

type Monogram3DProps = {
  letters: string;
  className?: string;
  size?: number;
};

type Rot = { x: number; y: number };

/**
 * Monogram3D — a real CSS 3D cube whose six faces show the monogram letters.
 * Auto-rotates when idle, and the user can grab & drag with the mouse to spin it
 * freely on X and Y. Fully mouse-interactive 3D.
 */
export function Monogram3D({
  letters,
  className,
  size = 200,
}: Monogram3DProps) {
  const [rot, setRot] = React.useState<Rot>({ x: -18, y: 24 });
  const [dragging, setDragging] = React.useState(false);
  const [spin, setSpin] = React.useState(true);
  const last = React.useRef<{ x: number; y: number } | null>(null);
  const velocity = React.useRef<Rot>({ x: 0, y: 0 });
  const { play } = useSound();

  // Idle auto-spin
  React.useEffect(() => {
    if (!spin || dragging) return;
    let raf = 0;
    const loop = () => {
      setRot((r) => ({ x: r.x, y: r.y + 0.25 }));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [spin, dragging]);

  // Inertia after release
  React.useEffect(() => {
    if (dragging) return;
    if (Math.abs(velocity.current.x) < 0.05 && Math.abs(velocity.current.y) < 0.05)
      return;
    let raf = 0;
    const loop = () => {
      setRot((r) => ({
        x: r.x + velocity.current.x,
        y: r.y + velocity.current.y,
      }));
      velocity.current.x *= 0.94;
      velocity.current.y *= 0.94;
      if (Math.abs(velocity.current.x) > 0.05 || Math.abs(velocity.current.y) > 0.05) {
        raf = requestAnimationFrame(loop);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [dragging]);

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    setSpin(false);
    play("click");
    last.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !last.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    // Trackball-style drag: swipe up → cube tilts up (top goes back), swipe right →
    // front face follows the cursor. X is inverted so the motion feels natural.
    velocity.current = { x: -dy * 0.4, y: dx * 0.4 };
    setRot((r) => ({ x: r.x - dy * 0.4, y: r.y + dx * 0.4 }));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    last.current = null;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const half = size / 2;
  const faceBase: React.CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-pixel), monospace",
    fontSize: size * 0.42,
    backfaceVisibility: "hidden",
  };

  const faces: { key: string; transform: string; color: string; label: string }[] = [
    {
      key: "front",
      transform: `translateZ(${half}px)`,
      color: "var(--neon-amber)",
      label: letters,
    },
    {
      key: "back",
      transform: `rotateY(180deg) translateZ(${half}px)`,
      color: "var(--neon-orange)",
      label: letters,
    },
    {
      key: "right",
      transform: `rotateY(90deg) translateZ(${half}px)`,
      color: "var(--neon-magenta)",
      label: letters,
    },
    {
      key: "left",
      transform: `rotateY(-90deg) translateZ(${half}px)`,
      color: "var(--neon-green)",
      label: letters,
    },
    {
      key: "top",
      transform: `rotateX(90deg) translateZ(${half}px)`,
      color: "var(--neon-yellow)",
      label: letters,
    },
    {
      key: "bottom",
      transform: `rotateX(-90deg) translateZ(${half}px)`,
      color: "var(--neon-amber)",
      label: letters,
    },
  ];

  return (
    <div
      className={cn("scene-3d select-none", className)}
      style={{ width: size, height: size, cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
      role="img"
      aria-label={`3D monogram ${letters} — drag to rotate`}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="preserve-3d relative h-full w-full"
        style={{
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
          transition: dragging ? "none" : "transform 0.05s linear",
        }}
      >
        {faces.map((f) => (
          <div
            key={f.key}
            style={{
              ...faceBase,
              transform: f.transform,
              color: f.color,
              background:
                "linear-gradient(135deg, oklch(0.2 0.04 55 / 0.92), oklch(0.12 0.03 55 / 0.92))",
              border: `1px solid color-mix(in oklch, ${f.color} 60%, transparent)`,
              boxShadow: `inset 0 0 24px -6px color-mix(in oklch, ${f.color} 70%, transparent)`,
              textShadow: `0 0 6px color-mix(in oklch, ${f.color} 80%, transparent), 0 0 18px color-mix(in oklch, ${f.color} 50%, transparent)`,
            }}
          >
            {f.label}
          </div>
        ))}
        {/* Inner wireframe accents */}
        <div
          className="absolute inset-0 preserve-3d"
          style={{ transform: "translateZ(0px)" }}
          aria-hidden
        />
      </div>
      <div className="mt-3 text-center text-xs neon-amber font-retro opacity-80">
        {dragging ? "// dragging…" : spin ? "// auto-spin — grab to control" : "// grab to spin"}
      </div>
    </div>
  );
}
