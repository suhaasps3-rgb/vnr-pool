"use client";

import { motion } from "framer-motion";
import { useJourney } from "../core/JourneyEngine";

export default function AmbientLife() {
  const { phase } = useJourney();

  // Only show ambient life when journey has started
  if (phase === "INITIAL" || phase === "SEARCHING" || phase === "MATCHED" || phase === "OPTIMISING") {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40 mix-blend-overlay">
      {/* Distant secondary road network */}
      <svg className="absolute w-[150%] h-[150%] -left-1/4 -top-1/4" viewBox="0 0 1000 1000">
        <path d="M -100 200 C 300 200 400 600 1100 600" fill="none" stroke="var(--hero-road)" strokeWidth="1" opacity="0.1" />
        <path d="M 400 -100 C 400 400 800 500 800 1100" fill="none" stroke="var(--hero-road)" strokeWidth="1" opacity="0.1" />
        
        {/* Distant cars (slow moving blips) */}
        <motion.circle 
          cx="0" cy="0" r="2" fill="var(--hero-accent)" 
          animate={{ x: [-100, 1100], y: [200, 600] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.circle 
          cx="0" cy="0" r="2" fill="var(--hero-destination)" 
          animate={{ x: [400, 800], y: [-100, 1100] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 5 }}
        />
      </svg>
      
      {/* Floating ambient particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-[var(--hero-glow)] blur-md"
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight,
            opacity: Math.random() * 0.3
          }}
          animate={{
            y: [null, Math.random() * -100 - 50],
            opacity: [null, 0]
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
}
