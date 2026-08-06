import gsap from "gsap";
import type SplitType from "split-type";
import { EASE, registerEasings } from "@/lib/easing";
import { EYEBROW_AT, HEADING_AT, HEADING_CHAR_STAGGER, HEADING_WORD_STAGGER } from "./constants";
import type { ExperienceElements } from "./types";

/**
 * loaderTimeline()
 *
 * The opening scene. Pure black → charcoal environment, the eyebrow
 * emerging from darkness, the editorial heading revealing word by word
 * (characters fading in progressively with a whisper of vertical drift
 * and blur). Everything only animates opacity, transform and filter —
 * never layout.
 *
 * Timeline (seconds):
 *   0.0  backdrop / vignette / glow fade in, noise breathes
 *   0.9  eyebrow: opacity + blur + translate
 *   1.5  heading: word N chars fade in (staggered), each word 0.45s apart
 */
export function buildLoaderTimeline(
  el: ExperienceElements,
  split: SplitType,
): gsap.core.Timeline {
  registerEasings();

  const tl = gsap.timeline({ defaults: { ease: EASE.out } });
  const words = split.words as HTMLElement[];

  // ---------------------------------------------------------------
  // Environment — the room itself fades into existence.
  // ---------------------------------------------------------------
  tl.fromTo(
    el.backdrop,
    { opacity: 0 },
    { opacity: 1, duration: 1.6, ease: EASE.inOut },
    0,
  );
  tl.fromTo(
    el.vignette,
    { opacity: 0 },
    { opacity: 1, duration: 1.9, ease: EASE.inOut },
    0.2,
  );
  tl.fromTo(
    el.glow,
    { opacity: 0 },
    { opacity: 1, duration: 2.4, ease: EASE.inOut },
    0.4,
  );
  // Grain breathing once so the screen never feels frozen.
  tl.to(el.noise, { opacity: 0.07, duration: 2.6, ease: EASE.inOut, yoyo: true, repeat: 1 }, 1.4);

  // ---------------------------------------------------------------
  // Eyebrow — small label naturally emerging from darkness.
  // ---------------------------------------------------------------
  tl.fromTo(
    el.eyebrow,
    { opacity: 0, y: 10, filter: "blur(6px)" },
    { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.3 },
    EYEBROW_AT,
  );

  // ---------------------------------------------------------------
  // Heading — words reveal independently; characters fade progressively.
  // No scaling or bounce — only opacity, blur and a slight vertical drift.
  // ---------------------------------------------------------------
  words.forEach((word, wi) => {
    const chars = Array.from(word.querySelectorAll<HTMLElement>(".char"));
    tl.fromTo(
      chars,
      { opacity: 0, y: 14, filter: "blur(8px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.1,
        ease: EASE.out,
        stagger: HEADING_CHAR_STAGGER,
      },
      HEADING_AT + wi * HEADING_WORD_STAGGER,
    );
  });

  return tl;
}
