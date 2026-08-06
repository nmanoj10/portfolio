import gsap from "gsap";
import { EASE, registerEasings } from "@/lib/easing";
import type { ExperienceElements } from "./types";

/**
 * introTimeline()
 *
 * The hand-off. The loader never disappears — it transforms into the
 * hero. The heading recedes with a soft blur (the "camera push") while
 * the navigation and scroll cue arrive and the lighting gently increases.
 *
 * Timeline (seconds):
 *   0.0   heading camera push: scale 1 → 1.035, blur, opacity → 0.55
 *   0.3   glow intensifies, backdrop brightens
 *   0.7   nav fades in
 *   1.0   scroll cue fades in
 */
export function buildIntroTimeline(el: ExperienceElements): gsap.core.Timeline {
  registerEasings();

  const tl = gsap.timeline({ defaults: { ease: EASE.inOut } });

  // ---------------------------------------------------------------
  // Camera push — the typography softly recedes while the interface
  // arrives in front of it. Restored to crisp in heroRevealTimeline.
  // ---------------------------------------------------------------
  tl.to(
    el.headingWrap,
    { scale: 1.035, opacity: 0.55, filter: "blur(2px)", duration: 1.9, ease: EASE.out },
    0,
  );

  // ---------------------------------------------------------------
  // Lighting increases — the room opens up, revealing the homepage.
  // ---------------------------------------------------------------
  tl.to(el.glow, { opacity: 1.25, duration: 1.8 }, 0.3);
  tl.to(el.backdrop, { filter: "brightness(1.12)", duration: 2.2 }, 0.4);

  // ---------------------------------------------------------------
  // Interface elements arrive.
  // ---------------------------------------------------------------
  tl.fromTo(
    el.nav,
    { opacity: 0, y: -12, filter: "blur(6px)" },
    { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: EASE.out },
    0.7,
  );
  tl.fromTo(
    el.scrollCue,
    { opacity: 0, y: 12, filter: "blur(5px)" },
    { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: EASE.out },
    1.0,
  );

  return tl;
}
