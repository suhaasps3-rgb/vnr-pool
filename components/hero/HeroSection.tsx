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
      className="relative w-full h-[250vh] bg-[var(--hero-bg)] text-slate-900 font-sans"
    >
      <JourneyProvider>
        <HeroScrollController containerRef={containerRef} />
        
        {/* Sticky container bounds the layout to the viewport while scrolling the 250vh */}
        <div className="sticky top-0 w-full h-screen overflow-hidden">
          <div className="w-full h-full max-w-7xl mx-auto grid grid-cols-1 grid-rows-[auto_1fr] md:grid-cols-2 md:grid-rows-1 px-4 sm:px-6 relative">
            {/* Left Column - Content (Top on mobile, Left on desktop) */}
            <div className="w-full h-auto md:h-full flex flex-col justify-end md:justify-center relative z-30 pointer-events-auto pt-24 pb-8 md:pt-0 md:pb-0">
              <HeroContent onJoin={onJoin} />
            </div>

            {/* Right Column - Cinematic Route Animation (Bottom on mobile, Right on desktop) */}
            <div className="w-full h-full min-h-[300px] relative z-20 flex items-start md:items-center justify-center lg:-ml-12 xl:-ml-24 pointer-events-none overflow-hidden">
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
