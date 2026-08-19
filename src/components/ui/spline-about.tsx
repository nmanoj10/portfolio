"use client";

import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";

/**
 * AboutSection — Spline-powered about page, rendered directly below the
 * cinematic loader/hero. Two-column on desktop (copy left, 3D scene right),
 * stacked on mobile. The spotlight glow tracks the mouse over the card.
 */
export function SplineAboutSection() {
  return (
    <section className="relative w-full bg-background">
      <Card className="relative w-full overflow-hidden rounded-none border-x-0 border-t-0 bg-black/[0.96]">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" />

        <div className="flex min-h-screen flex-col md:flex-row">
          {/* Left content */}
          <div className="relative z-10 flex flex-1 flex-col justify-center p-8 pl-12 sm:p-12 sm:pl-20 md:p-16 md:pl-28">
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.4em] text-neutral-200 sm:text-sm">
              GET TO KNOW ME
            </p>

            <h1 className="max-w-xl bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-4xl font-bold leading-tight tracking-tight text-transparent sm:text-5xl">
              Full stack developer, creative execution.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-neutral-300 sm:text-lg">
              I&apos;m Manoj — a backend engineer who loves building AI-powered
              products and scalable systems. From APIs to event-driven
              pipelines, I care about code that&apos;s fast, reliable, and a
              pleasure to maintain.
            </p>

            <p className="mt-4 max-w-lg text-base leading-relaxed text-neutral-400 sm:text-lg">
              But engineering is only half the story. I&apos;m equally at home
              in the creative layer — turning complex problems into experiences
              that feel simple, human, and alive.
            </p>
          </div>

          {/* Right — interactive 3D scene */}
          <div className="relative h-[320px] flex-1 sm:h-[420px] md:h-auto">
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="h-full w-full"
            />
          </div>
        </div>
      </Card>
    </section>
  );
}
