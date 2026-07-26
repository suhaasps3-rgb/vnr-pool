"use client";

import { useEffect, useRef } from "react";
import HeroContent from "./HeroContent";
import gsap from "gsap";
import { JourneyProvider, useJourney } from "./core/JourneyEngine";
import RouteScene from "./RouteScene";
import ProductDemoHUD from "./ui/ProductDemoHUD";
import AmbientLife from "./effects/AmbientLife";

// This inner component auto-plays the journey animation without scroll
function HeroAutoController() {
  const { setScrollProgress } = useJourney();

  useEffect(() => {
    // Auto-play the journey over 12 seconds so each phase gets enough time
    const obj = { progress: 0 };
    const tween = gsap.to(obj, {
      progress: 1,
      duration: 12,
      ease: "power2.inOut",
      onUpdate: () => {
        setScrollProgress(obj.progress);
      }
    });

    return () => {
      tween.kill();
    };
  }, [setScrollProgress]);

  return null; // Logic only
}

export default function HeroSection({ onJoin }: { onJoin: () => void }) {
  return (
    <section className="relative w-full h-[100svh] min-h-[600px] bg-[var(--hero-bg)] text-slate-900 font-sans">
      <JourneyProvider>
        <HeroAutoController />
        
        <div className="w-full h-full overflow-hidden">
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
