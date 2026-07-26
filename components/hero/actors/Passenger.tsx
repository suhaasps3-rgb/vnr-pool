"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import MotionPathPlugin from "gsap/MotionPathPlugin";
import { useJourney, PassengerData } from "../core/JourneyEngine";

if (typeof window !== "undefined") {
  gsap.registerPlugin(MotionPathPlugin);
}

export default function Passenger({ data }: { data: PassengerData }) {
  const { route, phase } = useJourney();
  const [position, setPosition] = useState({ x: -1000, y: -1000 }); // Render offscreen initially
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!route || typeof window === "undefined") return;

    // We need to create a temporary path element to measure the point
    const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    tempPath.setAttribute("d", route.path);
    
    // Get exact coordinate along the bezier curve
    const pathLength = tempPath.getTotalLength();
    const point = tempPath.getPointAtLength(pathLength * data.tValue);
    
    setPosition({ x: point.x, y: point.y });
  }, [route, data.tValue]);

  // Determine visibility based on phase
  const isVisible = (phase === "MATCHED" || phase === "OPTIMISING" || phase === "JOURNEY_BEGINS" || phase === "PICKUP");
  const isPickedUp = data.status === "picked_up";

  if (!isVisible || isPickedUp) return null;

  return (
    <g 
      ref={groupRef} 
      transform={`translate(${position.x}, ${position.y})`}
      className="transition-all duration-500 ease-out will-change-transform"
    >
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Pin Body */}
        <circle cx="0" cy="0" r="16" fill="white" stroke="var(--hero-accent)" strokeWidth="3" />
        
        {/* Simple Avatar Representation (Monochrome with accent ring) */}
        <path d="M -8 6 C -8 2 8 2 8 6" fill="var(--hero-road)" opacity="0.6" />
        <circle cx="0" cy="-3" r="4" fill="var(--hero-road)" opacity="0.6" />

        {/* Pulse effect */}
        <motion.circle
          cx="0"
          cy="0"
          r="24"
          fill="transparent"
          stroke="var(--hero-accent)"
          strokeWidth="1"
          animate={{
            scale: [1, 1.5],
            opacity: [0.5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
        
        {/* Hover Card (Glassmorphism) */}
        <motion.g
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="cursor-pointer"
        >
          {/* Invisible hover target area */}
          <circle cx="0" cy="0" r="30" fill="transparent" />
          
          <g transform="translate(0, -45)">
            <rect x="-60" y="-30" width="120" height="40" rx="8" fill="var(--hero-glass-bg)" stroke="var(--hero-glass-border)" />
            <text x="0" y="-14" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0f172a">{data.name}</text>
            <text x="0" y="2" textAnchor="middle" fontSize="10" fill="#34C759">₹{data.savings} Saved</text>
          </g>
        </motion.g>
      </motion.g>
    </g>
  );
}
