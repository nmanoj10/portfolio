import gsap from "gsap";
import type SplitType from "split-type";
import { EASE, registerEasings } from "@/lib/easing";
import {
  EYEBROW_AT,
  HEADING_AT,
  HEADING_CHAR_STAGGER,
  HEADING_WORD_STAGGER,
  PROGRESS_DURATION,
  PROGRESS_FILL_AT,
  PROGRESS_UI_AT,
} from "./constants";
import type { ExperienceElements } from "./types";

/**
 * loaderTimeline()
 *
 * The opening scene. Pure black → charcoal environment, the eyebrow
 * emerging from darkness, the editorial heading revealing word by word
 * (characters fading in progressively with a whisper of vertical drift
 * and blur), then the progress UI. Everything only animates opacity,
 * transform and filter — never layout.
 *
 * Timeline (seconds):
 *   0.0  backdrop / vignette / glow fade in, noise breathes
 *   0.9  eyebrow: opacity + blur + translate
 *   1.5  heading: word N chars fade in (staggered), each word 0.45s apart
 *   2.2  progress row + status container emerge
 *   2.5  fill scales 0 → 1 (3.1s) + percentage counter counts to 100
 *   2.5  status messages crossfade, one per step
 */
export function buildLoaderTimeline(
  el: ExperienceElements,
  split: SplitType,
): gsap.core.Timeline {
  registerEasings();

  const tl = gsap.timeline({ defaults: { ease: EASE.out } });
  const words = split.words as HTMLElement[];

  const statusStep = PROGRESS_DURATION / Math.max(el.messages.length, 1);

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

  // ---------------------------------------------------------------
  // Progress UI — the thin line and its counter appear.
  // ---------------------------------------------------------------
  tl.fromTo(
    el.progressRow,
    { opacity: 0, y: 10, filter: "blur(5px)" },
    { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9 },
    PROGRESS_UI_AT,
  );
  tl.fromTo(
    el.status,
    { opacity: 0 },
    { opacity: 1, duration: 0.6 },
    PROGRESS_UI_AT + 0.15,
  );

  // ---------------------------------------------------------------
  // Progress fill — continuous, perfectly smooth, no jumps.
  // A proxy object drives the counter so we never mutate React state.
  // (fromTo + immediateRender applies scaleX 0 before first paint, so the
  //  track stays empty until the fill begins — no Tailwind scale utility,
  //  which would conflict with GSAP's transform.)
  // ---------------------------------------------------------------
  const counter = { value: 0 };
  tl.fromTo(
    el.progressFill,
    { scaleX: 0, transformOrigin: "left center" },
    { scaleX: 1, duration: PROGRESS_DURATION, ease: EASE.inOut },
    PROGRESS_FILL_AT,
  );
  tl.to(
    counter,
    {
      value: 100,
      duration: PROGRESS_DURATION,
      ease: EASE.inOut,
      onUpdate: () => {
        const v = Math.round(counter.value);
        el.counter.textContent = `${v}%`;
        el.counter.setAttribute("aria-valuenow", String(v));
      },
    },
    PROGRESS_FILL_AT,
  );

  // ---------------------------------------------------------------
  // Status messages — only one visible at a time, with a soft
  // crossfade overlap so the sequence feels continuous.
  // The final message stays up for the hand-off into the hero.
  // ---------------------------------------------------------------
  el.messages.forEach((msg, i) => {
    const at = PROGRESS_FILL_AT + i * statusStep;
    tl.fromTo(
      msg,
      { opacity: 0, y: 8, filter: "blur(4px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5 },
      at,
    );
    if (i < el.messages.length - 1) {
      tl.to(
        msg,
        { opacity: 0, y: -8, filter: "blur(4px)", duration: 0.5, ease: EASE.in },
        at + statusStep,
      );
    }
  });

  return tl;
}
