"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SplitType from "split-type";
import { cn } from "@/lib/utils";
import { LoaderBackdrop } from "./loader-backdrop";
import { buildLoaderTimeline } from "@/lib/animations/loader-timeline";
import { buildIntroTimeline } from "@/lib/animations/intro-timeline";
import { buildHeroRevealTimeline } from "@/lib/animations/hero-reveal-timeline";
import { LOADER_MESSAGES } from "@/lib/animations/constants";
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

  // Progress
  const progressRowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Array<HTMLSpanElement | null>>([]);

  // Hero interface
  const navRef = useRef<HTMLElement>(null);
  const subWrapperRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<Array<HTMLAnchorElement | null>>([]);
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
    progressRow: progressRowRef.current!,
    progressTrack: trackRef.current!,
    progressFill: fillRef.current!,
    counter: counterRef.current!,
    status: statusRef.current!,
    messages: messagesRef.current.filter(Boolean) as HTMLElement[],
    nav: navRef.current!,
    subWrapper: subWrapperRef.current!,
    subtitle: subtitleRef.current!,
    cta: ctaRef.current.filter(Boolean) as HTMLElement[],
    scrollCue: scrollCueRef.current!,
  });

  /** Reveal the final state instantly (prefers-reduced-motion). */
  const showFinalState = (el: ExperienceElements) => {
    gsap.set(el.backdrop, { opacity: 1 });
    gsap.set(el.vignette, { opacity: 1 });
    gsap.set(el.glow, { opacity: 0.5 });
    gsap.set(el.progressFill, { scaleX: 1 });
    gsap.set(
      [el.eyebrow, el.progressRow, el.nav, el.subWrapper, el.scrollCue],
      { opacity: 1 },
    );
    el.counter.textContent = "100%";
    el.counter.setAttribute("aria-valuenow", "100");
  };

  useGSAP(
    () => {
      const el = resolveElements();

      // ---- Accessibility: skip the whole sequence, show the hero. ----
      if (prefersReduced) {
        showFinalState(el);
        onCompleteRef.current();
        return;
      }

      // Split the heading into words + characters for the editorial reveal.
      const split = new SplitType(el.heading, {
        types: "words,chars",
        wordClass: "loader-word",
        charClass: "char loader-char",
      });
      splitRef.current = split;

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
        finished ? "relative h-screen" : "fixed inset-0 z-30",
      )}
    >
      <LoaderBackdrop ref={backdropRef} />

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
      <div className="no-scrollbar relative z-10 flex max-h-full w-full max-w-5xl flex-col items-center overflow-y-auto px-6 py-24">
        {/* Eyebrow label */}
        <p
          ref={eyebrowRef}
          className="mb-10 text-[10px] font-medium uppercase tracking-[0.4em] text-neutral-500 opacity-0 md:mb-12"
        >
          Manoj — Digital Portfolio
        </p>

        {/* Editorial heading (split by SplitType inside the timeline) */}
        <div ref={headingWrapRef} className="will-change-transform">
          <h1
            ref={headingRef}
            className="loader-heading text-center font-extralight uppercase text-white"
          >
            Crafting Digital Experiences
          </h1>
        </div>

        {/* Progress line + percentage */}
        <div ref={progressRowRef} className="mt-10 flex items-center gap-4 opacity-0 md:mt-14">
          <div
            ref={trackRef}
            className="h-px w-[70vw] max-w-[360px] overflow-hidden bg-white/10 will-change-transform"
          >
            <div
              ref={fillRef}
              className="h-full w-full bg-white will-change-transform"
            />
          </div>
          <span
            ref={counterRef}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
            className="w-12 text-left text-sm tabular-nums text-neutral-400"
          >
            0%
          </span>
        </div>

        {/* Rotating status messages (one visible at a time) */}
        <div
          ref={statusRef}
          role="status"
          aria-live="polite"
          className="relative mt-8 h-4 w-full text-center opacity-0"
        >
          {LOADER_MESSAGES.map((message, i) => (
            <span
              key={message}
              ref={(node) => {
                messagesRef.current[i] = node;
              }}
              className="absolute inset-0 text-[10px] uppercase tracking-[0.3em] text-neutral-500 opacity-0"
            >
              {message}
            </span>
          ))}
        </div>

        {/* Hero supporting content (revealed at the end) */}
        <div ref={subWrapperRef} className="mt-12 flex flex-col items-center gap-8 opacity-0">
          <p
            ref={subtitleRef}
            className="max-w-md text-center text-sm leading-relaxed text-neutral-400 md:text-base"
          >
            A creative developer crafting calm, precise, handcrafted digital experiences.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#"
              ref={(node) => {
                ctaRef.current[0] = node;
              }}
              className="rounded-full bg-white px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-neutral-200"
            >
              View Work
            </a>
            <a
              href="#"
              ref={(node) => {
                ctaRef.current[1] = node;
              }}
              className="rounded-full border border-white/20 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:border-white/50"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </div>

      {/* ---------- Scroll cue ---------- */}
      <div
        ref={scrollCueRef}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 opacity-0"
      >
        <span className="text-[9px] uppercase tracking-[0.4em] text-neutral-500">Scroll</span>
        <span className="h-10 w-px bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </div>
  );
}
