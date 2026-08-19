import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CinematicLoader } from "./components/cinematic/cinematic-loader";
import DemoRadialScrollGalleryBento from "./components/ui/demo";
import { CinematicFooter } from "./components/ui/motion-footer";
import { SplineAboutSection } from "./components/ui/spline-about";
import TechStack from "./components/ui/tech";
import { useLenis } from "./hooks/use-lenis";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

function App() {
  const [ready, setReady] = useState(false);
  const lenisRef = useLenis();

  // Lock scrolling while the cinematic loader is playing.
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  // Hand the page over to the user once the loader has morphed into the hero.
  useEffect(() => {
    if (!ready) return;
    document.documentElement.style.overflow = "";
    lenisRef.current?.start();
    ScrollTrigger.refresh();
  }, [ready, lenisRef]);

  // Show the sticky nav once the hero has loaded.
  const [showNav, setShowNav] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ready) {
      setShowNav(true);
    }
  }, [ready]);

  // Show on scroll-up, hide on scroll-down. Always show at the very top.
  useEffect(() => {
    if (!ready) return;
    let lastY = window.scrollY;
    const handleScroll = () => {
      const y = window.scrollY;
      const atTop = y < 10;
      const scrollingDown = y > lastY;
      lastY = y;
      setShowNav(atTop || !scrollingDown);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [ready]);

  // Close mobile menu on outside click.
  useEffect(() => {
    if (!mobileOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [mobileOpen]);

  return (
    <div className="relative min-h-screen bg-black font-sans selection:bg-white/20">
      {/* ---------- Sticky nav (appears after hero loads) ---------- */}
      <div ref={mobileMenuRef}>
        <nav
          className={cn(
            "fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-500 md:px-12 md:py-5",
            showNav ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
          )}
        >
          <a href="#" className="text-sm font-semibold uppercase tracking-[0.35em] text-white md:text-base">
            Manoj
          </a>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 sm:flex">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-xs uppercase tracking-[0.25em] text-neutral-400 transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="relative z-50 flex items-center justify-center text-white sm:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile dropdown */}
        <div
          className={cn(
            "fixed inset-x-0 top-0 z-40 flex flex-col items-center justify-center gap-8 bg-black/95 pt-24 backdrop-blur-md transition-all duration-300 sm:hidden",
            mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="text-lg uppercase tracking-[0.3em] text-neutral-300 transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* Loader morphs into the hero; once finished it becomes a normal
          in-flow 100vh section, and the footer scrolls in below it. */}
      <CinematicLoader finished={ready} onComplete={() => setReady(true)} />

      {/* The cinematic footer only enters AFTER the loader has finished,
          so it never sits on top of the loader. */}
      {ready && (
        <>
          {/* About — Spline 3D section, directly below the loader/hero. */}
          <div id="about" className="relative z-40 scroll-mt-24">
            <SplineAboutSection />
          </div>

          <div className="relative z-40">
            <TechStack />
          </div>

          {/* Portfolio — radial scroll gallery, directly below the tech stack. */}
          <div id="work" className="relative z-40 scroll-mt-24">
            <DemoRadialScrollGalleryBento />
          </div>

          <div id="contact" className="animate-footer-enter relative z-40 scroll-mt-24">
            <CinematicFooter />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
