import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CinematicLoader } from "./components/cinematic/cinematic-loader";
import DemoRadialScrollGalleryBento from "./components/ui/demo";
import { CinematicFooter } from "./components/ui/motion-footer";
import { SplineAboutSection } from "./components/ui/spline-about";
import TechStack from "./components/ui/tech";
import { useLenis } from "./hooks/use-lenis";

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

  return (
    <div className="relative min-h-screen bg-black font-sans selection:bg-white/20">
      {/* Loader morphs into the hero; once finished it becomes a normal
          in-flow 100vh section, and the footer scrolls in below it. */}
      <CinematicLoader finished={ready} onComplete={() => setReady(true)} />

      {/* The cinematic footer only enters AFTER the loader has finished,
          so it never sits on top of the loader. */}
      {ready && (
        <>
          {/* About — Spline 3D section, directly below the loader/hero. */}
          <div className="relative z-40">
            <SplineAboutSection />
          </div>

          <div className="relative z-40">
            <TechStack />
          </div>

          {/* Portfolio — radial scroll gallery, directly below the tech stack. */}
          <div className="relative z-40">
            <DemoRadialScrollGalleryBento />
          </div>

          <div className="animate-footer-enter relative z-40">
            <CinematicFooter />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
