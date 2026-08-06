import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * useLenis
 *
 * Wires Lenis (buttery smooth scrolling) into the GSAP ticker and
 * ScrollTrigger so all scrub animations stay perfectly in sync.
 *
 * The Lenis instance is created already "stopped" — the caller starts it
 * once the cinematic loader has handed off to the hero. Returns a ref so
 * the caller can call `.start()` / `.stop()` imperatively.
 */
export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });

    // Controlled by the loader hand-off.
    lenis.stop();
    lenisRef.current = lenis;

    // Keep ScrollTrigger in lock-step with Lenis's scroll.
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis from GSAP's ticker so everything shares one clock.
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}
