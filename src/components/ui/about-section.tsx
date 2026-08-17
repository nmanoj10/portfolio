"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GridBeam } from "@/components/ui/background-grid-beam";
import { About3D } from "@/components/ui/about-3d";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

// Register ScrollTrigger safely for React.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * AboutSection
 *
 * Sits directly below the cinematic loader/hero. Uses the GridBeam
 * background (faint theme-adaptive grid + animated gradient beam in the
 * top-left corner) with the intro copy layered on top.
 *
 * The copy fades/rises in staggered when the section scrolls into view.
 * Respects prefers-reduced-motion (content stays visible, no animation).
 */
export function AboutSection() {
  const prefersReduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current || prefersReduced) return;

    const ctx = gsap.context(() => {
      const targets = revealRefs.current.filter(
        (el): el is HTMLElement => el !== null
      );
      gsap.fromTo(
        targets,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReduced]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-background"
    >
      <GridBeam className="flex w-full max-w-5xl flex-col items-start justify-center px-6 pt-24 pb-20 sm:px-12 sm:pt-28 sm:pb-24 md:ml-20 md:px-6">
        {/* Eyebrow label */}
        <p
          ref={(el) => {
            revealRefs.current[0] = el;
          }}
          className="mb-6 text-xs font-medium uppercase tracking-[0.4em] text-neutral-200 sm:text-sm"
        >
          About Me
        </p>

        {/* Editorial heading */}
        <h2
          ref={(el) => {
            revealRefs.current[1] = el;
          }}
          className="max-w-2xl text-4xl font-extralight leading-tight tracking-tight text-white sm:text-5xl 2xl:text-6xl"
        >
          Backend engineering,
          <br />
          creative execution.
        </h2>

        {/* Intro copy */}
        <p
          ref={(el) => {
            revealRefs.current[2] = el;
          }}
          className="mt-8 max-w-xl text-base leading-relaxed text-neutral-400 sm:text-lg"
        >
          I&apos;m Manoj — a backend engineer who loves building AI-powered
          products and scalable systems. From APIs to event-driven pipelines, I
          care about code that&apos;s fast, reliable, and a pleasure to maintain.
        </p>

        <p
          ref={(el) => {
            revealRefs.current[3] = el;
          }}
          className="mt-4 max-w-xl text-base leading-relaxed text-neutral-400 sm:text-lg"
        >
          But engineering is only half the story. I&apos;m equally at home in the
          creative layer — turning complex problems into experiences that feel
          simple, human, and alive.
        </p>
      </GridBeam>

      {/* 3D element — centered in the space beside the text (visible xl+),
          vertically centered in the section. */}
      <div className="absolute left-[72%] top-1/2 hidden -translate-x-1/2 -translate-y-1/2 xl:block">
        <div
          ref={(el) => {
            revealRefs.current[4] = el;
          }}
          className="aspect-square w-[min(24rem,28vw)]"
        >
          <About3D />
        </div>
      </div>
    </section>
  );
}
