"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import MotionPathPlugin from "gsap/MotionPathPlugin";
import { useJourney } from "../core/JourneyEngine";

// Register plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(MotionPathPlugin);
}

export default function Vehicle() {
  const { route, phase } = useJourney();
  const vehicleRef = useRef<SVGGElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!route || !vehicleRef.current) return;

    if (phase === "INITIAL" || phase === "SEARCHING") {
      if (tlRef.current) tlRef.current.kill();
      gsap.set(vehicleRef.current, {
        x: route.startPos.x,
        y: route.startPos.y,
        opacity: 0,
        scale: 0.5,
      });
      return;
    }

    if (phase === "JOURNEY_BEGINS" && !tlRef.current?.isActive()) {
      // Vehicle forms and starts driving
      const tl = gsap.timeline();
      tlRef.current = tl;

      // 1. Orb -> Outline -> Fill (Spawn animation)
      tl.to(vehicleRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: "back.out(1.5)",
      });

      // 2. Drive along the path with realistic weight and momentum
      tl.to(vehicleRef.current, {
        motionPath: {
          path: route.path,
          align: route.path,
          alignOrigin: [0.5, 0.5],
          autoRotate: true,
        },
        duration: 4.2, // Faster to finish before the phase reaches DESTINATION (which is 4.8s)
        ease: "power2.inOut"
      });

      // 3. Sink smoothly into the destination building
      tl.to(vehicleRef.current, {
        scale: 0,
        opacity: 0,
        transformOrigin: "50% 50%",
        duration: 0.4,
        ease: "power2.in"
      }, "+=0.1");
    }
  }, [route, phase]);

  return (
    <g ref={vehicleRef} className="will-change-transform" style={{ opacity: 0 }}>
      {/* Soft Glow */}
      <circle cx="0" cy="0" r="30" fill="var(--hero-glow)" filter="blur(8px)" opacity="0.6" />
      
      {/* Vehicle Body (Premium minimal top-down SVG) */}
      <rect x="-15" y="-25" width="30" height="50" rx="8" fill="white" stroke="var(--hero-accent)" strokeWidth="2" />
      
      {/* Windshield */}
      <path d="M -12 -10 L 12 -10 L 10 -20 L -10 -20 Z" fill="#E2E8F0" />
      
      {/* Headlights */}
      <circle cx="-10" cy="-25" r="2" fill="var(--hero-destination)" />
      <circle cx="10" cy="-25" r="2" fill="var(--hero-destination)" />
      
      {/* Headlight beams */}
      <path d="M -10 -25 L -20 -60 L 0 -60 Z" fill="url(#beam-gradient)" opacity="0.3" />
      <path d="M 10 -25 L 0 -60 L 20 -60 Z" fill="url(#beam-gradient)" opacity="0.3" />
      
      <defs>
        <linearGradient id="beam-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="var(--hero-destination)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--hero-destination)" stopOpacity="0" />
        </linearGradient>
      </defs>
    </g>
  );
}
