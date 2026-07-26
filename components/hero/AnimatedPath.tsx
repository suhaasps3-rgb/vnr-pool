"use client";

import { motion } from "framer-motion";
import { useJourney } from "./core/JourneyEngine";

export default function AnimatedPath({ pathData, discardedPathData }: { pathData: string, discardedPathData: string }) {
  const { phase } = useJourney();

  // Branching/Optimising States
  const showMainPath = ["BRANCHING", "OPTIMISING_CHOICE", "OPTIMISED", "PAUSE_2", "JOURNEY_BEGINS", "PICKUP", "DESTINATION", "NETWORK_REVEAL"].includes(phase);
  const showDiscardedPath = ["BRANCHING", "OPTIMISING_CHOICE"].includes(phase);
  const glowMainPath = ["OPTIMISED", "PAUSE_2", "JOURNEY_BEGINS", "PICKUP", "DESTINATION", "NETWORK_REVEAL"].includes(phase);

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
      
      {/* The Discarded Path (appears during evaluation, dissolves on optimization) */}
      <motion.path
        d={discardedPathData}
        fill="none"
        stroke="var(--hero-road)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: showDiscardedPath ? 1 : (phase === "OPTIMISED" ? 1 : 0), 
          opacity: showDiscardedPath ? 0.6 : 0 
        }}
        transition={{ 
          duration: showDiscardedPath ? 1.5 : 0.8, // Slow draw, smooth quick dissolve
          ease: "easeInOut" 
        }}
      />

      {/* The Main Glowing Path */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="var(--hero-accent)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: showMainPath ? 1 : 0, 
          opacity: showMainPath ? 1 : 0,
          filter: glowMainPath ? "drop-shadow(0px 0px 12px var(--hero-accent))" : "drop-shadow(0px 0px 4px var(--hero-accent))"
        }}
        transition={{ 
          duration: 1.5, 
          ease: "easeInOut" 
        }}
      />
    </>
  );
}
