"use client";

import { forwardRef } from "react";
import { GLOW_IMAGE, NOISE_IMAGE, VIGNETTE_IMAGE } from "@/lib/visuals";

/**
 * LoaderBackdrop
 *
 * The environment of the experience: a charcoal base that fades in from
 * pure black, a soft radial vignette for depth, a barely-visible wash of
 * light near the top, and a fine film-grain noise. Every layer is
 * decorative and aria-hidden. All layers start hidden (or near-invisible)
 * and are revealed by the loader timeline.
 *
 * Refs are forwarded so the timeline builders can animate each layer.
 */
export const LoaderBackdrop = forwardRef<HTMLDivElement>((_, ref) => (
  <div
    ref={ref}
    className="absolute inset-0 bg-[#0b0b0d] opacity-0 will-change-[opacity,filter]"
    aria-hidden
  >
    {/* Moving wash of light — barely perceptible, drifts slowly. */}
    <div
      data-layer="glow"
      className="glow-layer absolute inset-x-0 top-0 h-[60vh] opacity-0 will-change-[opacity,transform]"
      style={{ background: GLOW_IMAGE }}
    />
    {/* Film grain — pure dark, never flat. */}
    <div
      data-layer="noise"
      className="absolute inset-0 opacity-[0.05] will-change-[opacity]"
      style={{ backgroundImage: NOISE_IMAGE, backgroundSize: "240px 240px" }}
    />
    {/* Soft radial vignette for depth. */}
    <div
      data-layer="vignette"
      className="absolute inset-0 opacity-0 will-change-[opacity]"
      style={{ background: VIGNETTE_IMAGE }}
    />
  </div>
));

LoaderBackdrop.displayName = "LoaderBackdrop";
