"use client";

import { useEffect, useRef } from "react";
import HeroContent from "./HeroContent";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import 'lenis/dist/lenis.css';
import { JourneyProvider } from "./core/JourneyEngine";
import RouteScene from "./RouteScene";
import ProductDemoHUD from "./ui/ProductDemoHUD";
import AmbientLife from "./effects/AmbientLife";

export default function HeroSection({ onJoin }: { onJoin: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative w-full h-[150vh] bg-[var(--hero-bg)] text-slate-900 overflow-hidden font-sans"
    >
      <JourneyProvider>
        {/* Sticky container bounds the layout to the viewport while scrolling the 150vh */}
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
      
      {/* Gradient transition into the next section */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-[#09090B] pointer-events-none z-50"></div>
    </section>
  );
}
