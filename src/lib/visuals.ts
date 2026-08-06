/**
 * Background visual primitives.
 *
 * The loading environment is "pure dark" but never flat: it is built from
 * three nearly-invisible layers that add depth without ever drawing
 * attention — a charcoal base, an ultra-soft radial vignette, and a
 * moving wash of light. A fine film-grain noise sits on top.
 *
 * All values are deliberately subtle. Everything here is decorative and
 * should be marked aria-hidden in markup.
 */

/** SVG fractal-noise tile, base64/data-URI encoded so it needs no asset file. */
export const NOISE_IMAGE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='240' height='240' filter='url(%23n)' opacity='0.55'/></svg>")`;

/**
 * Extremely soft radial vignette. Slightly stronger in the corners so the
 * center "glows" without a visible gradient edge.
 */
export const VIGNETTE_IMAGE = `radial-gradient(ellipse 120% 90% at 50% 42%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.42) 100%)`;

/**
 * A faint wash of light that sits above the top-center of the viewport.
 * It is barely perceptible and slowly drifts during the sequence so the
 * environment never feels frozen.
 */
export const GLOW_IMAGE = `radial-gradient(ellipse 55% 42% at 50% 0%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.012) 45%, rgba(255,255,255,0) 70%)`;
