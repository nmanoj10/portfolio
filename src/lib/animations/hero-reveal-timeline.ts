import gsap from "gsap";
import { EASE, registerEasings } from "@/lib/easing";
import type { ExperienceElements } from "./types";

/**
 * heroRevealTimeline()
 *
 * The final scene of the sequence. The camera settles: the heading
 * returns crisp and full-strength. This timeline runs after
 * introTimeline and hands the page over to the user.
 *
 * Timeline (seconds):
 *   0.0   heading settles back: scale 1, opacity 1, blur 0
 */
export function buildHeroRevealTimeline(el: ExperienceElements): gsap.core.Timeline {
  registerEasings();

  const tl = gsap.timeline({ defaults: { ease: EASE.out } });

  // The camera pulls back — the heading resolves to its final form.
  tl.to(el.headingWrap, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1.7 }, 0);

  return tl;
}
