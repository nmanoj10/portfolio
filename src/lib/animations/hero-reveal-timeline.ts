import gsap from "gsap";
import { EASE, registerEasings } from "@/lib/easing";
import type { ExperienceElements } from "./types";

/**
 * heroRevealTimeline()
 *
 * The final scene of the sequence. The camera settles: the heading
 * returns crisp and full-strength, then the hero's supporting content —
 * subtitle and call-to-actions — fades in beneath it. This timeline
 * runs after introTimeline and hands the page over to the user.
 *
 * Timeline (seconds):
 *   0.0   heading settles back: scale 1, opacity 1, blur 0
 *   0.25  subtitle fades in
 *   0.5   CTAs fade in, staggered
 */
export function buildHeroRevealTimeline(el: ExperienceElements): gsap.core.Timeline {
  registerEasings();

  const tl = gsap.timeline({ defaults: { ease: EASE.out } });

  // ---------------------------------------------------------------
  // The camera pulls back — the heading resolves to its final form.
  // ---------------------------------------------------------------
  tl.to(el.headingWrap, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1.7 }, 0);

  // ---------------------------------------------------------------
  // Supporting content reveals beneath the heading.
  // ---------------------------------------------------------------
  tl.fromTo(
    el.subtitle,
    { opacity: 0, y: 14, filter: "blur(6px)" },
    { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.1 },
    0.25,
  );
  tl.fromTo(
    el.cta,
    { opacity: 0, y: 12, filter: "blur(5px)" },
    { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.0, stagger: 0.14 },
    0.5,
  );

  return tl;
}
