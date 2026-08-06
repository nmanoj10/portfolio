/**
 * Shared element contract for the cinematic experience.
 *
 * The loader and hero share the same DOM so the final frame of the loader
 * can become the first frame of the hero without any hard cut. Timeline
 * builders only receive these resolved elements — they never touch React.
 */
export interface ExperienceElements {
  /** Fixed full-screen stage that contains both the loader and the hero. */
  stage: HTMLElement;
  /** Charcoal base that fades in from pure black. */
  backdrop: HTMLElement;
  /** Soft radial vignette. */
  vignette: HTMLElement;
  /** Drifting wash of light near the top of the screen. */
  glow: HTMLElement;
  /** Film-grain noise overlay. */
  noise: HTMLElement;

  /** Small top-center label (becomes the nav brand context). */
  eyebrow: HTMLElement;
  /** Wrapper around the heading — animated for the "camera push". */
  headingWrap: HTMLElement;
  /** The big editorial heading (split into words + characters). */
  heading: HTMLElement;

  /** Row containing the progress line + percentage counter. */
  progressRow: HTMLElement;
  /** The thin horizontal line track. */
  progressTrack: HTMLElement;
  /** The fill that grows left → right inside the track. */
  progressFill: HTMLElement;
  /** The percentage indicator that counts up with the fill. */
  counter: HTMLElement;

  /** Container holding the rotating status messages. */
  status: HTMLElement;
  /** Each individual status message (crossfaded in sequence). */
  messages: HTMLElement[];

  /** Hero navigation bar (revealed as the loader hands off). */
  nav: HTMLElement;
  /** Wrapper around the hero supporting content (subtitle + CTAs). */
  subWrapper: HTMLElement;
  /** One-line hero subtitle. */
  subtitle: HTMLElement;
  /** Hero call-to-action buttons. */
  cta: HTMLElement[];
  /** Bottom "scroll" cue. */
  scrollCue: HTMLElement;
}
