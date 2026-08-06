/**
 * Timing constants for the cinematic loader.
 *
 * The whole sequence is intentionally slow and confident. Nothing is
 * rushed; every beat gets room to breathe.
 *
 * Loader  (0s – 7.5s):
 *   0.0   charcoal background fades in from black
 *   0.9   eyebrow label emerges
 *   1.5   heading words begin revealing (word by word, char by char)
 *   2.2   progress line + counter emerge
 *   2.5   progress fill begins (5s, left → right) + status messages crossfade
 *   7.5   loader complete → intro (hand-off) begins
 */
export const EYEBROW_AT = 0.9;
export const HEADING_AT = 1.5;
export const HEADING_WORD_STAGGER = 0.45;
export const HEADING_CHAR_STAGGER = 0.04;

/** When the progress line / counter / status UI appears. */
export const PROGRESS_UI_AT = 2.2;
/** When the fill + counter actually start moving. */
export const PROGRESS_FILL_AT = 2.5;
/** Fill duration — slow, continuous, no jumps. */
export const PROGRESS_DURATION = 5;

/** The rotating status messages, one visible at a time. */
export const LOADER_MESSAGES = [
  "Initializing Experience",
  "Loading Assets",
  "Preparing Components",
  "Rendering Motion",
  "Optimizing Performance",
  "Building Interface",
  "Finalizing Experience",
] as const;
