import { useEffect, useState } from "react";

/**
 * usePrefersReducedMotion
 *
 * Returns true when the user has requested reduced motion. When true, the
 * cinematic sequence is skipped entirely and the hero renders in its
 * final state (accessibility requirement — never force a 6s animation on
 * users who opted out).
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);

    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
