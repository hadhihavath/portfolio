/* mr.havath */
import { useEffect, useRef } from "react";

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const div = ref.current;
    if (!div) return;

    let rafId: number;
    let pendingX = -200;
    let pendingY = -200;

    const updatePosition = () => {
      div.style.background = `radial-gradient(400px circle at ${pendingX}px ${pendingY}px, color-mix(in oklab, var(--neon) 18%, transparent), transparent 60%)`;
    };

    const onMove = (e: MouseEvent) => {
      pendingX = e.clientX;
      pendingY = e.clientY;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 mix-blend-screen"
      style={{
        background:
          "radial-gradient(400px circle at -200px -200px, color-mix(in oklab, var(--neon) 18%, transparent), transparent 60%)",
        transition: "background 80ms linear",
      }}
    />
  );
}
