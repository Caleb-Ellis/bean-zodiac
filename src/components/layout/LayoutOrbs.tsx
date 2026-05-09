import { useEffect, useRef } from "react";

export function LayoutOrbs() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !ref.current) return;
    const orbs = ref.current.querySelectorAll<HTMLElement>(".orb");
    const onVisibility = () => {
      const state = document.hidden ? "paused" : "running";
      orbs.forEach((o) => (o.style.animationPlayState = state));
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <div ref={ref} className="orbs" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div className="orb orb-5" />
    </div>
  );
}
