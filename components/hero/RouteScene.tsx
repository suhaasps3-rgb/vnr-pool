"use client";

import { useEffect, useRef } from "react";
import { motion, useTransform, useSpring } from "framer-motion";
import { useJourney } from "./core/JourneyEngine";
import AnimatedPath from "./AnimatedPath";
import Vehicle from "./actors/Vehicle";
import Passenger from "./actors/Passenger";
import Destination from "./actors/Destination";

export default function RouteScene() {
  const { route, isMirrored, initializeJourney, phase, passengers, scrollProgress } = useJourney();
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    initializeJourney();
  }, [initializeJourney]);

  // Advanced Virtual Camera (Cinematography)
  // Instead of static sizes, the camera slowly breathes and shifts focus.
  
  // Smooth the raw scroll progress so the camera doesn't jump on fast scrolls
  const smoothedProgress = useSpring(scrollProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Dolly push/pull based on the progress of the scroll container
  // Start slightly pushed in, push in further during optimization, settle for the ride, zoom out at the end
  const scale = useTransform(
    smoothedProgress,
    [0, 0.4, 0.6, 0.9, 1],
    [1.1, 1.15, 1.05, 1.05, 0.7]
  );
  
  // Slight camera pan (dolly left/right) to keep the frame alive
  const xOffset = useTransform(
    smoothedProgress,
    [0, 1],
    [0, isMirrored ? -50 : 50]
  );

  // Depth of field blur shift during the "Network Reveal" to blur the main route slightly
  const blur = useTransform(
    smoothedProgress,
    [0.9, 0.95, 1],
    ["blur(0px)", "blur(0px)", "blur(2px)"]
  );

  if (!route) return null;

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
      <motion.svg
        ref={svgRef}
        viewBox="0 0 800 800"
        className="w-[110%] h-[110%] md:w-[100%] md:h-[100%] opacity-90 will-change-transform"
        style={{
          scale,
          x: xOffset,
          filter: blur
        }}
        preserveAspectRatio="xMidYMid meet"
      >
        <g style={{ transform: isMirrored ? 'scaleX(-1)' : 'none', transformOrigin: 'center' }}>
          <AnimatedPath pathData={route.path} discardedPathData={route.discardedPath} />
          
          {/* Render all waiting passengers */}
          {passengers.map((p) => (
            <Passenger key={p.id} data={p} />
          ))}
          
          <Vehicle />
          <Destination />
        </g>
      </motion.svg>
    </div>
  );
}
