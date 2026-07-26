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
        <div className="sticky top-0 w-full h-screen flex flex-col md:flex-row">
          
          {/* Left Column (40%) - Content */}
          <div className="w-full md:w-[40%] h-full flex items-center bg-[var(--hero-bg)] relative z-30">
            <HeroContent onJoin={onJoin} />
          </div>

          <div className="w-full md:w-[60%] h-full relative z-20">
            <AmbientLife />
            <ProductDemoHUD />
            <RouteScene />
          </div>
        </div>
      </JourneyProvider>
    </section>
  );
}
