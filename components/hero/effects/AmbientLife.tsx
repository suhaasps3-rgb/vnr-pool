"use client";

import { motion, useTransform, useSpring } from "framer-motion";
import { useJourney } from "../core/JourneyEngine";

export default function AmbientLife() {
  const { phase, scrollProgress } = useJourney();

  // Smooth the scroll progress so opacities don't jump abruptly
  const smoothedProgress = useSpring(scrollProgress, { stiffness: 60, damping: 20 });

  // Progressive Network Reveal Logic
  // As scroll reaches > 0.95 (NETWORK_REVEAL), we stagger the opacity of distant roads
  
  // Group 1: Immediate surrounding roads
  const opacityGroup1 = useTransform(smoothedProgress, [0.95, 0.96], [0, 0.1]);
  // Group 2: Mid-distance roads
  const opacityGroup2 = useTransform(smoothedProgress, [0.96, 0.98], [0, 0.08]);
  // Group 3: Far network
  const opacityGroup3 = useTransform(smoothedProgress, [0.98, 1], [0, 0.05]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 mix-blend-overlay">
      
      {/* 
        Only render if we are late in the journey to save DOM nodes/performance.
        We know NETWORK_REVEAL triggers at scrollProgress >= 0.95
      */}
      {scrollProgress > 0.9 && (
        <svg className="absolute w-[200%] h-[200%] -left-1/2 -top-1/2" viewBox="0 0 2000 2000">
          
          {/* GROUP 1: Core adjacent network */}
          <motion.g style={{ opacity: opacityGroup1 }}>
            <path d="M 100,500 C 500,500 800,900 1500,1000" fill="none" stroke="var(--hero-road)" strokeWidth="2" />
            <path d="M 800,200 C 800,600 1200,800 1200,1500" fill="none" stroke="var(--hero-road)" strokeWidth="2" />
            
            {/* Energy flows */}
            <motion.path 
              d="M 100,500 C 500,500 800,900 1500,1000" 
              fill="none" stroke="var(--hero-accent)" strokeWidth="2" 
              strokeDasharray="50 1500"
              animate={{ strokeDashoffset: [1550, -50] }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              opacity="0.5"
            />
          </motion.g>

          {/* GROUP 2: Wider city grid */}
          <motion.g style={{ opacity: opacityGroup2 }}>
            <path d="M -200,800 C 400,800 600,1200 1800,1200" fill="none" stroke="var(--hero-road)" strokeWidth="1" />
            <path d="M 1400,-200 C 1200,400 1400,1200 1000,1800" fill="none" stroke="var(--hero-road)" strokeWidth="1" />
            <path d="M 400,1800 C 600,1200 300,600 800,-200" fill="none" stroke="var(--hero-road)" strokeWidth="1" />
          </motion.g>

          {/* GROUP 3: Far regional connections */}
          <motion.g style={{ opacity: opacityGroup3 }}>
            {[...Array(8)].map((_, i) => (
              <path 
                key={i}
                d={`M ${Math.random() * 2000},${Math.random() * 2000} C ${Math.random() * 2000},${Math.random() * 2000} ${Math.random() * 2000},${Math.random() * 2000} ${Math.random() * 2000},${Math.random() * 2000}`} 
                fill="none" 
                stroke="var(--hero-road)" 
                strokeWidth="0.5" 
              />
            ))}
          </motion.g>

        </svg>
      )}
      
      {/* Ambient background particles only appear during the reveal for emotional impact */}
      {scrollProgress > 0.95 && [...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-[var(--hero-glow)] blur-lg"
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight,
            opacity: 0,
            scale: 0.5
          }}
          animate={{
            y: [null, Math.random() * -100 - 50],
            opacity: [0, Math.random() * 0.4, 0],
            scale: [0.5, 1.5, 0.5]
          }}
          transition={{
            duration: Math.random() * 5 + 8, // Very slow, calm
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}
