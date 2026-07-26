"use client";

import { useEffect, useRef } from "react";
import HeroContent from "./HeroContent";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import { JourneyProvider, useJourney } from "./core/JourneyEngine";
import RouteScene from "./RouteScene";
import ProductDemoHUD from "./ui/ProductDemoHUD";
import AmbientLife from "./effects/AmbientLife";

// This inner component sets up GSAP and syncs the scroll progress to our Journey Engine
function HeroScrollController({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const { setScrollProgress } = useJourney();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        setScrollProgress(self.progress);
      }
    });

    return () => {
      st.kill();
      lenis.destroy();
      gsap.ticker.remove(raf);
    };
  }, [containerRef, setScrollProgress]);

  return null; // Logic only
}

export default function HeroSection({ onJoin }: { onJoin: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section 
      ref={containerRef}
      className="relative w-full h-[250vh] bg-[var(--hero-bg)] text-slate-900 overflow-hidden font-sans"
    >
      <JourneyProvider>
        <HeroScrollController containerRef={containerRef} />
        
        {/* Sticky container bounds the layout to the viewport while scrolling the 250vh */}
        <div className="sticky top-0 w-full h-screen">
          
          {/* Cinematic Route Animation - Centered on the entire screen */}
          <div className="absolute inset-0 w-full h-full z-10 flex items-center justify-center overflow-hidden">
            <AmbientLife />
            <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
              <ProductDemoHUD />
              <RouteScene />
            </div>
          </div>

          {/* Foreground Content - Positioned on the left */}
          <div className="absolute inset-0 w-full h-full z-30 pointer-events-none flex items-center">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pointer-events-auto">
              <div className="w-full md:w-[50%] lg:w-[45%]">
                <HeroContent onJoin={onJoin} />
              </div>
            </div>
          </div>
          
        </div>
      </JourneyProvider>
    </section>
  );
}
