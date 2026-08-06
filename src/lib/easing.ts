import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

/**
 * Premium easing registry.
 *
 * Every animation in the experience uses one of these hand-tuned
 * cubic-bezier curves. No default GSAP eases, no bounce, no elastic.
 * The curves are chosen to feel "expensive": slow starts or slow
 * settles, never mechanical.
 *
 * Curves (CSS cubic-bezier):
 *  - out:    (0.16, 1, 0.3, 1)   easeOutExpo — fast start, long luxurious settle
 *  - in:     (0.7, 0, 0.84, 0)   easeInExpo  — slow drift, then exit
 *  - inOut:  (0.65, 0, 0.35, 1)  easeInOutCubic — symmetric, calm, used for
 *                                 the progress fill and camera moves
 *  - glide:  (0.33, 1, 0.68, 1)  easeOutCubic — steady long glide
 */
export const EASE = {
  out: "luxe-out",
  in: "luxe-in",
  inOut: "luxe-in-out",
  glide: "luxe-glide",
} as const;

export type EaseName = (typeof EASE)[keyof typeof EASE];

let registered = false;

/**
 * Registers the custom eases with GSAP.
 * Idempotent — safe to call from every timeline builder and component.
 */
export function registerEasings(): void {
  if (registered || typeof window === "undefined") return;
  registered = true;

  gsap.registerPlugin(CustomEase);
  CustomEase.create(EASE.out, "0.16, 1, 0.3, 1");
  CustomEase.create(EASE.in, "0.7, 0, 0.84, 0");
  CustomEase.create(EASE.inOut, "0.65, 0, 0.35, 1");
  CustomEase.create(EASE.glide, "0.33, 1, 0.68, 1");
}
