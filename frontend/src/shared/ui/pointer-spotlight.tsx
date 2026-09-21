"use client";

import {
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useState,
} from "react";

type PointerSpotlightProps = {
  children: ReactNode;
  className?: string;
};

const DEFAULT_X = "50%";
const DEFAULT_Y = "32%";

/** White-canvas backdrop with a soft spotlight that follows the pointer. */
export function PointerSpotlight({ children, className }: PointerSpotlightProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: DEFAULT_X, y: DEFAULT_Y });

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType === "touch") return;

    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setSpotlight({
      x: `${x.toFixed(2)}%`,
      y: `${y.toFixed(2)}%`,
    });
  }

  const style = {
    "--spotlight-x": reduceMotion ? DEFAULT_X : spotlight.x,
    "--spotlight-y": reduceMotion ? DEFAULT_Y : spotlight.y,
  } as CSSProperties;

  return (
    <div
      data-testid="pointer-spotlight"
      className={["pointer-spotlight", className].filter(Boolean).join(" ")}
      style={style}
      onPointerMove={handlePointerMove}
    >
      {children}
    </div>
  );
}
