"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useJourney } from "../core/JourneyEngine";

export default function Destination() {
  const { route, phase } = useJourney();
  const [position, setPosition] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    if (!route || typeof window === "undefined") return;

    // Get the exact end coordinate of the path
    const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    tempPath.setAttribute("d", route.path);
    const pathLength = tempPath.getTotalLength();
    const point = tempPath.getPointAtLength(pathLength);
    
    setPosition({ x: point.x, y: point.y });
  }, [route]);

  if (phase === "INITIAL" || phase === "SEARCHING") return null;

  const isComplete = phase === "DESTINATION" || phase === "SUMMARY";

  return (
    <g transform={`translate(${position.x}, ${position.y})`} className="will-change-transform">
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Glow effect when complete */}
        <motion.circle
          cx="0"
          cy="0"
          r="40"
          fill={isComplete ? "var(--hero-destination)" : "var(--hero-road)"}
          filter="blur(15px)"
          initial={{ opacity: 0 }}
          animate={{ opacity: isComplete ? 0.4 : 0.1 }}
          transition={{ duration: 1 }}
        />

        {/* The Building Icon (Premium minimal SVG) */}
        <rect x="-16" y="-20" width="32" height="40" rx="4" fill={isComplete ? "var(--hero-destination)" : "var(--hero-road)"} className="transition-colors duration-500" />
        
        {/* Windows */}
        <rect x="-10" y="-12" width="6" height="6" rx="1" fill="white" />
        <rect x="4" y="-12" width="6" height="6" rx="1" fill="white" />
        <rect x="-10" y="-2" width="6" height="6" rx="1" fill="white" />
        <rect x="4" y="-2" width="6" height="6" rx="1" fill="white" />
        <rect x="-10" y="8" width="6" height="6" rx="1" fill="white" />
        <rect x="4" y="8" width="6" height="6" rx="1" fill="white" />
        
        {/* Ripples when complete */}
        {isComplete && (
          <>
            <motion.circle
              cx="0"
              cy="0"
              r="24"
              fill="transparent"
              stroke="var(--hero-destination)"
              strokeWidth="2"
              animate={{ scale: [1, 3], opacity: [1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.circle
              cx="0"
              cy="0"
              r="24"
              fill="transparent"
              stroke="var(--hero-destination)"
              strokeWidth="2"
              animate={{ scale: [1, 3], opacity: [1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
            />
          </>
        )}
      </motion.g>
    </g>
  );
}
