"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Tilt3DProps = {
  children: React.ReactNode;
  className?: string;
  /** Max rotation in degrees on each axis */
  max?: number;
  /** Optional glare highlight */
  glare?: boolean;
  /** Scale on hover */
  scale?: number;
  style?: React.CSSProperties;
};

/**
 * Tilt3D — a mouse-interactive 3D tilt wrapper.
 * Rotates around X/Y based on pointer position relative to element center.
 * Uses CSS perspective + preserve-3d. All 3D, fully interactable with mouse.
 */
export function Tilt3D({
  children,
  className,
  max = 14,
  glare = true,
  scale = 1.03,
  style,
}: Tilt3DProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [transform, setTransform] = React.useState<string>("");
  const [glarePos, setGlarePos] = React.useState({ x: 50, y: 50, o: 0 });

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height; // 0..1
    const rotY = (px - 0.5) * 2 * max;
    const rotX = -(py - 0.5) * 2 * max;
    setTransform(
      `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(${scale})`,
    );
    setGlarePos({ x: px * 100, y: py * 100, o: 0.25 });
  };

  const handleEnter = () => {
    setGlarePos((g) => ({ ...g, o: 0.25 }));
  };

  const handleLeave = () => {
    setTransform("rotateX(0deg) rotateY(0deg) scale(1)");
    setGlarePos({ x: 50, y: 50, o: 0 });
  };

  return (
    <div
      className={cn("scene-3d", className)}
      style={style}
      aria-hidden={false}
    >
      <div
        ref={ref}
        onPointerMove={handleMove}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
        className="preserve-3d relative h-full w-full will-change-transform transition-transform duration-200 ease-out"
        style={{ transform }}
      >
        {children}
        {glare && (
          <div
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] transition-opacity duration-200"
            style={{
              opacity: glarePos.o,
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,210,120,0.55), transparent 45%)`,
            }}
          />
        )}
      </div>
    </div>
  );
}
