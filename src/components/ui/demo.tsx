"use client";

import { RadialScrollGallery } from "@/components/ui/portfolio-and-image-gallery";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * "Projects" wheel title — mirrors the footer heading's font (Plus Jakarta
 * Sans) and metallic gradient glow (see motion-footer.tsx `.footer-text-glow`).
 */
const PROJECTS_TITLE_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.projects-wheel-title {
  font-family: 'Plus Jakarta Sans', 'Geist Variable', sans-serif;
  background: linear-gradient(180deg, var(--foreground) 0%, color-mix(in oklch, var(--foreground) 40%, transparent) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  filter: drop-shadow(0px 0px 20px color-mix(in oklch, var(--foreground) 15%, transparent));
}
`;

const projects = [
  {
    id: 1,
    title: "Nebula",
    cat: "Art",
    img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    title: "Decay",
    cat: "Photo",
    img: "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    title: "Oceanic",
    cat: "Nature",
    img: "https://images.unsplash.com/photo-1468581264429-2548ef9eb732?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    title: "Neon",
    cat: "Tech",
    img: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 5,
    title: "Desert",
    cat: "Travel",
    img: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=400&q=80",
  },
];

export default function DemoRadialScrollGalleryBento() {
  return (
    <div className="bg-background min-h-[70svh] text-foreground overflow-hidden rounded-lg border w-full sm:min-h-[600px]">
      <style>{PROJECTS_TITLE_STYLE}</style>

      <div className="relative">
      <RadialScrollGallery
        className="min-h-[70svh]! sm:min-h-[600px]!"
        baseRadius={600}
        mobileRadius={300}
        visiblePercentage={50}
        scrollDuration={2000}
      >
        {(hoveredIndex) =>
          projects.map((project, index) => {
            const isActive = hoveredIndex === index;
            return (
              <div
                key={project.id}
                className="group relative w-[min(52vw,240px)] aspect-[5/7] overflow-hidden rounded-xl bg-card border border-border shadow-lg sm:w-[280px] sm:aspect-[3/4]"
              >
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={project.img}
                    alt={project.title}
                    loading="lazy"
                    decoding="async"
                    className={`h-full w-full object-cover transition-transform duration-700 ease-out ${
                      isActive
                        ? "scale-110 blur-0"
                        : "scale-100 blur-[1px] grayscale-[30%]"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent opacity-60" />
                </div>

                <div className="absolute inset-0 flex flex-col justify-between p-4">
                  <div className="flex justify-between items-start">
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-2 py-0 bg-background/80 backdrop-blur"
                    >
                      {project.cat}
                    </Badge>
                    <div
                      className={`w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-all duration-500 ${
                        isActive ? "opacity-100 rotate-0" : "opacity-0 -rotate-45"
                      }`}
                    >
                      <ArrowUpRight size={12} />
                    </div>
                  </div>

                  <div
                    className={`transition-transform duration-500 ${
                      isActive ? "translate-y-0" : "translate-y-2"
                    }`}
                  >
                    <h3 className="text-lg font-bold leading-tight text-foreground sm:text-xl">
                      {project.title}
                    </h3>
                    <div
                      className={`h-0.5 bg-primary mt-2 transition-all duration-500 ${
                        isActive ? "w-full opacity-100" : "w-0 opacity-0"
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })
        }
      </RadialScrollGallery>

        {/* "Projects" centered in the wheel, styled like the footer heading. */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-1/2 flex justify-center px-4">
          <h2 className="projects-wheel-title text-center text-5xl font-black tracking-tighter sm:text-7xl md:text-8xl">
            Projects
          </h2>
        </div>
      </div>
    </div>
  );
}
