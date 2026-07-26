"use client";

import { useEffect, useRef } from "react";
import { useJourney } from "./core/JourneyEngine";
import AnimatedPath from "./AnimatedPath";
import Vehicle from "./actors/Vehicle";
import Passenger from "./actors/Passenger";
import Destination from "./actors/Destination";

export default function RouteScene() {
  const { route, isMirrored, initializeJourney, phase } = useJourney();
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Start the journey simulation on mount
    initializeJourney();
  }, [initializeJourney]);

  if (!route) return null;

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
      {/* 
        The Scene Graph Layer
        Render Order:
        1. Background (In HeroSection)
        2. Animated Path
        3. Particles/Effects
        4. Actors (Vehicle, Passengers)
      */}
      <svg
        ref={svgRef}
        viewBox="0 0 800 800"
        className="w-[120%] h-[120%] md:w-[90%] md:h-[90%] opacity-90 transition-transform duration-[2000ms] ease-out"
        style={{
          transform: `scale(${phase === 'SEARCHING' ? 0.9 : 1}) ${isMirrored ? 'scaleX(-1)' : ''}`,
          filter: 'drop-shadow(0px 0px 30px var(--hero-glow))'
        }}
        preserveAspectRatio="xMidYMid meet"
      >
        <AnimatedPath pathData={route.path} />
        
        {/* Render all waiting passengers */}
        {passengers.map((p) => (
          <Passenger key={p.id} data={p} />
        ))}
        
        <Vehicle />
        <Destination />
      </svg>
    </div>
  );
}
