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
  IconTailwind,
  IconFigma,
  IconReact,
  IconNode,
  IconExpress,
  IconMongo,
  IconAws,
  IconMysql,
  IconPython,
  IconDocker,
  IconGit,
} from "@/components/ui/tech-icons"

// --- Skill icons for the demo hero ---
const demoIcons: FloatingIconsHeroProps["icons"] = [
  { id: 1, icon: IconHtml, className: "top-[10%] left-[10%]" },
  { id: 2, icon: IconCss, className: "top-[20%] right-[8%]" },
  { id: 3, icon: IconJs, className: "top-[80%] left-[10%]" },
  { id: 4, icon: IconTypeScript, className: "bottom-[10%] right-[10%]" },
  { id: 5, icon: IconTailwind, className: "top-[5%] left-[30%]" },
  { id: 6, icon: IconFigma, className: "top-[5%] right-[30%]" },
  { id: 7, icon: IconReact, className: "bottom-[8%] left-[25%]" },
  { id: 8, icon: IconNode, className: "top-[40%] left-[15%]" },
  { id: 9, icon: IconExpress, className: "top-[75%] right-[25%]" },
  { id: 10, icon: IconMongo, className: "top-[90%] left-[70%]" },
  { id: 11, icon: IconAws, className: "top-[50%] right-[5%]" },
  { id: 12, icon: IconMysql, className: "top-[55%] left-[5%]" },
  { id: 13, icon: IconPython, className: "top-[5%] left-[55%]" },
  { id: 14, icon: IconDocker, className: "bottom-[5%] right-[45%]" },
  { id: 15, icon: IconGit, className: "top-[25%] right-[20%]" },
]

export default function SkillsDemo() {
  return (
    <FloatingIconsHero
      title="Floating Icons Hero"
      subtitle="A live demo of the floating icons hero — move your cursor over the icons to repel them, or watch them drift on their own."
      ctaText="Get Started"
      ctaHref="#"
      icons={demoIcons}
    />
  )
}
