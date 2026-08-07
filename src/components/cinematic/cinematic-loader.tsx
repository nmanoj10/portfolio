"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SplitType from "split-type";
import { cn } from "@/lib/utils";
import KineticGrid from "@/components/ui/kinetic-grid";
import { LoaderBackdrop } from "./loader-backdrop";
import { buildLoaderTimeline } from "@/lib/animations/loader-timeline";
import { buildIntroTimeline } from "@/lib/animations/intro-timeline";
import { buildHeroRevealTimeline } from "@/lib/animations/hero-reveal-timeline";
import type { ExperienceElements } from "@/lib/animations/types";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import "./cinematic.css";

gsap.registerPlugin(useGSAP);

interface CinematicLoaderProps {
  /** Called once the loader has handed off to the hero and the page is interactive. */
  onComplete: () => void;
  /**
   * When true, the stage stops being a fixed full-screen overlay and
   * becomes a normal in-flow hero section (100vh at the top of the page),
   * so the rest of the page can scroll beneath it.
   */
  finished?: boolean;
}

/**
 * CinematicLoader
 *
 * A single fixed stage contains BOTH the loader and the hero. The DOM is
 * shared on purpose: the final frame of the loader becomes the first
 * frame of the hero, so the hand-off is a morph, never a hard cut.
 *
 * Sequence: loaderTimeline() → introTimeline() (the morph) →
 * heroRevealTimeline() → onComplete().
 *
 * Respects prefers-reduced-motion: skips the sequence entirely and
 * renders the hero in its final state.
 */
export function CinematicLoader({ onComplete, finished = false }: CinematicLoaderProps) {
  const prefersReduced = usePrefersReducedMotion();
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const splitRef = useRef<SplitType | null>(null);

  // Core stage + environment
  const stageRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Copy
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headingWrapRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Hero interface
  const navRef = useRef<HTMLElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);

  /** Resolve all refs into the element contract the timelines expect. */
  const resolveElements = (): ExperienceElements => ({
    stage: stageRef.current!,
    backdrop: backdropRef.current!,
    vignette: backdropRef.current!.querySelector("[data-layer='vignette']") as HTMLElement,
    glow: backdropRef.current!.querySelector("[data-layer='glow']") as HTMLElement,
    noise: backdropRef.current!.querySelector("[data-layer='noise']") as HTMLElement,
    eyebrow: eyebrowRef.current!,
    headingWrap: headingWrapRef.current!,
    heading: headingRef.current!,
    nav: navRef.current!,
    scrollCue: scrollCueRef.current!,
  });

  /** Reveal the final state instantly (prefers-reduced-motion). */
  const showFinalState = (el: ExperienceElements) => {
    gsap.set(el.backdrop, { opacity: 1 });
    gsap.set(el.vignette, { opacity: 1 });
    gsap.set(el.glow, { opacity: 0.5 });
    gsap.set([el.eyebrow, el.nav, el.scrollCue], { opacity: 1 });
  };

  useGSAP(
    () => {
      const el = resolveElements();
      el.stage.classList.remove("animation-complete");

      // Split the heading into words + characters. Each word is a `.loader-word`
      // block (see cinematic.css), so *Crafting / Digital / Experiences* always
      // stack as three centered lines — even before/without any animation
      // (e.g. prefers-reduced-motion).
      const split = new SplitType(el.heading, {
        types: "words,chars",
        wordClass: "loader-word",
        charClass: "char loader-char",
      });
      splitRef.current = split;

      // ---- Accessibility: skip the whole sequence, show the hero. ----
      if (prefersReduced) {
        showFinalState(el);
        onCompleteRef.current();
        return;
      }

      // Reusable, modular timelines (see lib/animations/*).
      const loaderTl = buildLoaderTimeline(el, split);
      const introTl = buildIntroTimeline(el);
      const heroTl = buildHeroRevealTimeline(el);

      // Ambient life — infinite tweens on the GSAP ticker (GPU-composited).
      const drift = gsap.to(el.glow, {
        x: 48,
        y: 16,
        duration: 7,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      const noiseBreath = gsap.to(el.noise, {
        opacity: 0.07,
        duration: 3.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // ---- Choreography: loader → intro (the morph) → hero reveal. ----
      loaderTl.eventCallback("onComplete", () => introTl.play());
      introTl.eventCallback("onComplete", () => {
        heroTl.play();
        onCompleteRef.current();
      });
      loaderTl.play(0);

      // Cleanup (also covers React StrictMode double-mount).
      return () => {
        drift.kill();
        noiseBreath.kill();
        splitRef.current?.revert();
        splitRef.current = null;
      };
    },
    { scope: stageRef },
  );

  return (
    <div
      ref={stageRef}
      className={cn(
        "flex flex-col items-center justify-center overflow-hidden bg-black",
        finished ? "relative hero-viewport" : "fixed inset-0 z-30",
      )}
    >
      <LoaderBackdrop ref={backdropRef} />

      {/* Interactive kinetic-grid background — warps toward the pointer,
          ripples on click, blooms tech words under the cursor. Fades in
          with the loader sequence. */}
      <KineticGrid
        globalColor="monochrome"
        className="kinetic-bg absolute inset-0 z-0 min-h-0"
        hoverWords={[
          "HTML",
          "CSS",
          "JavaScript",
          "TypeScript",
          "React",
          "Node.js",
          "Express",
          "MongoDB",
          "SQL",
          "Tailwind",
          "Astro",
          "Vite",
          "Docker",
          "AWS",
          "Python",
          "Git",
          "Figma",
        ]}
      />

      {/* ---------- Hero navigation ---------- */}
      <nav
        ref={navRef}
        className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-6 opacity-0 md:px-12 md:py-8"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white md:text-sm">
          Manoj
        </span>
        <div className="hidden items-center gap-8 sm:flex">
          {["Work", "About", "Contact"].map((label) => (
            <a
              key={label}
              href="#"
              className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 transition-colors hover:text-white"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* ---------- Center content: loader UI + hero copy ---------- */}
      <div className="no-scrollbar relative z-10 flex max-h-full w-full max-w-5xl flex-col items-center justify-center overflow-y-auto px-6 py-16 lg:py-24">
        {/* Eyebrow label */}
        <p
          ref={eyebrowRef}
          className="mb-8 text-[10px] font-medium uppercase tracking-[0.4em] text-neutral-500 opacity-0 md:mb-12"
        >
          Manoj — Digital Portfolio
        </p>

        {/* Editorial heading (split by SplitType inside the timeline) */}
        <div ref={headingWrapRef} className="will-change-transform">
          <h1
            ref={headingRef}
            className="loader-heading text-center font-extralight uppercase text-white"
          >
            Crafting <br />Digital Experiences
          </h1>
        </div>
      </div>

      {/* ---------- Scroll cue ---------- */}
      <div
        ref={scrollCueRef}
        className="loader-scroll-cue absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 opacity-0 sm:bottom-8"
      >
        <span className="hidden text-[9px] uppercase tracking-[0.4em] text-neutral-500 min-[360px]:block">
          Scroll
        </span>
        <span className="h-10 w-px bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </div>
  );
}
