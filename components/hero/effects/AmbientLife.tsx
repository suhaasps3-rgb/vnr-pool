"use client";

import { useMemo } from "react";
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

  // Memoize random values so they don't re-calculate 60fps on scroll
  const randomPaths = useMemo(() => {
    return [...Array(8)].map((_, i) => {
      const p = () => Math.random() * 2000;
      return `M ${p()},${p()} C ${p()},${p()} ${p()},${p()} ${p()},${p()}`;
    });
  }, []);

  const randomParticles = useMemo(() => {
    if (typeof window === "undefined") return [];
    return [...Array(10)].map((_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      targetY: Math.random() * -100 - 50,
      opacityTarget: Math.random() * 0.4,
      duration: Math.random() * 5 + 8
    }));
  }, []);

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
            {randomPaths.map((d, i) => (
              <path 
                key={i}
                d={d} 
                fill="none" 
                stroke="var(--hero-road)" 
                strokeWidth="0.5" 
              />
            ))}
          </motion.g>

        </svg>
      )}
      
      {/* Ambient background particles only appear during the reveal for emotional impact */}
      {scrollProgress > 0.95 && randomParticles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-2 h-2 rounded-full bg-[var(--hero-glow)] blur-lg"
          initial={{ 
            x: p.x, 
            y: p.y,
            opacity: 0,
            scale: 0.5
          }}
          animate={{
            y: [null, p.targetY],
            opacity: [0, p.opacityTarget, 0],
            scale: [0.5, 1.5, 0.5]
          }}
          transition={{
            duration: p.duration, // Very slow, calm
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}
