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
          <div className="w-full h-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 px-4 sm:px-6 relative">
            
            {/* Left Column (50%) - Content */}
            <div className="w-full h-full flex flex-col justify-center relative z-30 pointer-events-auto">
              <HeroContent onJoin={onJoin} />
            </div>

            {/* Right Column (50%) - Cinematic Route Animation */}
            {/* We offset this column slightly to the left on large screens to tighten the composition */}
            <div className="w-full h-full relative z-20 flex items-center justify-center lg:-ml-12 xl:-ml-24 pointer-events-none">
              <AmbientLife />
              <ProductDemoHUD />
              <RouteScene />
            </div>
            
          </div>
        </div>
      </JourneyProvider>
    </section>
  );
}
