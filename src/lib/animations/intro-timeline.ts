import gsap from "gsap";
import { EASE, registerEasings } from "@/lib/easing";
import type { ExperienceElements } from "./types";

/**
 * introTimeline()
 *
 * The hand-off. The loader never disappears — it transforms into the
 * hero. The completed progress line expands horizontally across the
 * screen and becomes the hero's visual divider, the transient loader UI
 * (counter, status, eyebrow) dissolves, and the camera pushes forward
 * into the interface: the heading recedes with a soft blur while the
 * navigation and scroll cue arrive and the lighting gently increases.
 *
 * Timeline (seconds):
 *   0.0   progress line expands to full width
 *   0.15  percentage counter dissolves
 *   0.3   status dissolves, eyebrow dissolves
 *   0.3   heading camera push: scale 1 → 1.035, blur, opacity → 0.55
 *   0.6   glow intensifies, backdrop brightens
 *   1.0   nav fades in
 *   1.3   scroll cue fades in
 */
export function buildIntroTimeline(el: ExperienceElements): gsap.core.Timeline {
  registerEasings();

  const tl = gsap.timeline({ defaults: { ease: EASE.inOut } });

  // ---------------------------------------------------------------
  // Progress line → hero divider.
  // The track is centered at a fixed width; scaling it to cover the
  // viewport turns it into the full-bleed line used by the hero. The
  // fill rides along inside the track, so it stays filled.
  // ---------------------------------------------------------------
  const trackWidth = el.progressTrack.offsetWidth || 320;
  const targetScale = window.innerWidth / trackWidth;
  tl.to(
    el.progressTrack,
    { scaleX: targetScale, transformOrigin: "center center", duration: 1.7 },
    0,
  );

  // ---------------------------------------------------------------
  // Transient loader UI dissolves away.
  // ---------------------------------------------------------------
  tl.to(el.counter, { opacity: 0, y: 6, filter: "blur(4px)", duration: 0.5, ease: EASE.in }, 0.15);
  tl.to(el.status, { opacity: 0, y: 10, filter: "blur(5px)", duration: 0.55, ease: EASE.in }, 0.3);
  el.messages.forEach((m) => tl.to(m, { opacity: 0, duration: 0.3 }, 0.35));
  tl.to(el.eyebrow, { opacity: 0, y: -10, filter: "blur(5px)", duration: 0.5, ease: EASE.in }, 0.4);

  // ---------------------------------------------------------------
  // Camera push — the typography softly recedes while the interface
  // arrives in front of it. Restored to crisp in heroRevealTimeline.
  // ---------------------------------------------------------------
  tl.to(
    el.headingWrap,
    { scale: 1.035, opacity: 0.55, filter: "blur(2px)", duration: 1.9, ease: EASE.out },
    0.3,
  );

  // ---------------------------------------------------------------
  // Lighting increases — the room opens up, revealing the homepage.
  // ---------------------------------------------------------------
  tl.to(el.glow, { opacity: 1.25, duration: 1.8 }, 0.6);
  tl.to(el.backdrop, { filter: "brightness(1.12)", duration: 2.2 }, 0.7);

  // ---------------------------------------------------------------
  // Interface elements arrive.
  // ---------------------------------------------------------------
  tl.fromTo(
    el.nav,
    { opacity: 0, y: -12, filter: "blur(6px)" },
    { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: EASE.out },
    1.0,
  );
  tl.fromTo(
    el.scrollCue,
    { opacity: 0, y: 12, filter: "blur(5px)" },
    { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: EASE.out },
    1.3,
  );

  return tl;
}
