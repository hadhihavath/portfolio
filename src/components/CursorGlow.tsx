/* mr.havath */
import { useEffect, useState } from "react";

export function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 mix-blend-screen"
      style={{
        background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, color-mix(in oklab, var(--neon) 18%, transparent), transparent 60%)`,
        transition: "background 80ms linear",
      }}
    />
  );
}
