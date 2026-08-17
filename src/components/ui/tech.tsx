"use client"

import {
  FloatingIconsHero,
  type FloatingIconsHeroProps,
} from "@/components/ui/floating-icons-hero-section"
import {
  IconHtml,
  IconCss,
  IconJs,
  IconTypeScript,
  IconReact,
  IconExpress,
  IconNode,
  IconFigma,
  IconVite,
  IconTailwind,
  IconAstro,
  IconMongo,
  IconMysql,
  IconAws,
  IconDocker,
  IconPython,
  IconGit,
} from "@/components/ui/tech-icons"

// --- Developer-stack icons with their unique positions for the hero ---
const techIcons: FloatingIconsHeroProps["icons"] = [
  // Total 17 unique icons — the top row (HTML, React, MySQL, Express) is
  // anchored at the right end corner instead of the left end corner.
  { id: 1, icon: IconHtml, className: "top-[10%] right-[10%]" },
  { id: 2, icon: IconCss, className: "top-[20%] right-[8%]" },
  { id: 3, icon: IconJs, className: "top-[80%] left-[10%]" },
  { id: 4, icon: IconTypeScript, className: "bottom-[10%] right-[10%]" },
  { id: 5, icon: IconReact, className: "top-[5%] right-[30%]" },
  { id: 6, icon: IconExpress, className: "top-[5%] right-[80%]" },
  { id: 7, icon: IconNode, className: "bottom-[8%] left-[25%]" },
  { id: 8, icon: IconFigma, className: "hidden lg:block top-[25%] left-[15%]" },
  { id: 9, icon: IconVite, className: "hidden lg:block top-[75%] right-[25%]" },
  { id: 10, icon: IconTailwind, className: "top-[90%] left-[70%]" },
  { id: 11, icon: IconAstro, className: "hidden lg:block top-[50%] right-[5%]" },
  { id: 12, icon: IconMongo, className: "hidden lg:block top-[55%] left-[5%]" },
  { id: 13, icon: IconMysql, className: "top-[5%] right-[55%]" },
  { id: 14, icon: IconAws, className: "bottom-[5%] right-[45%]" },
  { id: 15, icon: IconDocker, className: "hidden lg:block top-[25%] right-[20%]" },
  { id: 16, icon: IconPython, className: "hidden lg:block top-[60%] left-[30%]" },
  { id: 17, icon: IconGit, className: "hidden lg:block top-[65%] right-[8%]" },
]

export default function TechStack() {
  return (
    <FloatingIconsHero
      title="A World of Innovation"
      subtitle="Explore a universe of possibilities with our platform, connecting you to the tools and technologies that shape the future."
      ctaText="Join the Revolution"
      ctaHref="#"
      icons={techIcons}
    />
  )
}
