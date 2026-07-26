"use client";

import { motion } from "framer-motion";
import { useJourney } from "./core/JourneyEngine";

export default function AnimatedPath({ pathData }: { pathData: string }) {
  const { phase } = useJourney();

  // Determine path drawing state based on journey phase
  let pathLength = 0;
  if (phase === "SEARCHING" || phase === "MATCHED" || phase === "OPTIMISING") {
    pathLength = 0; // Don't draw the road yet, wait for optimization
  } else {
    pathLength = 1; // Draw the road fully once journey begins
  }

  return (
    <>
      {/* Subtle faint background path for context */}
      <path
        d={pathData}
        fill="none"
        stroke="var(--hero-road)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.1"
      />
      
      {/* The glowing active path that draws itself */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="var(--hero-accent)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: pathLength, 
          opacity: pathLength > 0 ? 1 : 0 
        }}
        transition={{ 
          duration: 2.5, 
          ease: "easeInOut" 
        }}
        style={{
          filter: "drop-shadow(0px 0px 8px var(--hero-accent))"
        }}
      />
    </>
  );
}
