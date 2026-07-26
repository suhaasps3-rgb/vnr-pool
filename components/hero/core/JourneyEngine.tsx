"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getRandomRoute, RouteData } from "../assets/routes";

export type JourneyPhase = 
  | "INITIAL"
  | "SEARCHING"
  | "PAUSE_1"
  | "MATCHED"
  | "BRANCHING"
  | "OPTIMISING_CHOICE"
  | "OPTIMISED"
  | "PAUSE_2"
  | "JOURNEY_BEGINS"
  | "PICKUP"
  | "DESTINATION"
  | "NETWORK_REVEAL";

export interface PassengerData {
  id: string;
  name: string;
  role: "student" | "office" | "designer";
  matchScore: number;
  savings: number;
  tValue: number; // Position on the SVG path (0 to 1)
  status: "waiting" | "picked_up";
}

interface JourneyContextType {
  phase: JourneyPhase;
  scrollProgress: number; // 0 to 1 representing the user's scroll down the 150vh container
  route: RouteData | null;
  isMirrored: boolean;
  passengers: PassengerData[];
  seatsFilled: number;
  totalSavings: number;
  co2Reduced: number;
  
  // Actions
  setScrollProgress: (progress: number) => void;
  pickupPassenger: (id: string) => void;
  initializeJourney: () => void;
}

const JourneyContext = createContext<JourneyContextType | null>(null);

export function JourneyProvider({ children }: { children: React.ReactNode }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [phase, setPhase] = useState<JourneyPhase>("INITIAL");
  const [route, setRoute] = useState<RouteData | null>(null);
  const [isMirrored, setIsMirrored] = useState(false);
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [seatsFilled, setSeatsFilled] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [co2Reduced, setCo2Reduced] = useState(0);

  // Derive Phase from Scroll Progress
  // The user controls the pacing entirely with their scroll wheel.
  useEffect(() => {
    if (!route) return;

    if (scrollProgress < 0.05) setPhase("SEARCHING"); // 0 - 5%
    else if (scrollProgress < 0.1) setPhase("PAUSE_1"); // 5 - 10%
    else if (scrollProgress < 0.2) setPhase("MATCHED"); // 10 - 20%
    else if (scrollProgress < 0.3) setPhase("BRANCHING"); // 20 - 30%
    else if (scrollProgress < 0.4) setPhase("OPTIMISING_CHOICE"); // 30 - 40%
    else if (scrollProgress < 0.5) setPhase("OPTIMISED"); // 40 - 50%
    else if (scrollProgress < 0.55) setPhase("PAUSE_2"); // 50 - 55%
    else if (scrollProgress < 0.9) setPhase("JOURNEY_BEGINS"); // 55 - 90% (Vehicle animation takes over)
    else if (scrollProgress < 0.95) setPhase("DESTINATION"); // 90 - 95%
    else setPhase("NETWORK_REVEAL"); // 95 - 100%

  }, [scrollProgress, route]);

  const initializeJourney = useCallback(() => {
    const { route: selectedRoute, mirrored } = getRandomRoute();
    setRoute(selectedRoute);
    setIsMirrored(mirrored);

    // Generate mock passengers with archetypes
    const archetypes: Array<{ name: string, role: "student" | "office" | "designer" }> = [
      { name: "Priya", role: "student" },
      { name: "Rahul", role: "office" },
      { name: "Sneha", role: "designer" },
      { name: "Karthik", role: "student" },
      { name: "Anjali", role: "office" }
    ];

    const generatedPassengers = selectedRoute.pickups.map((t, index) => {
      const arch = archetypes[index % archetypes.length];
      return {
        id: `p-${index}`,
        name: arch.name,
        role: arch.role,
        matchScore: Math.floor(Math.random() * 5 + 95), // 95-99%
        savings: Math.floor(Math.random() * 20 + 10), 
        tValue: t,
        status: "waiting" as const,
      };
    });

    setPassengers(generatedPassengers);
    setSeatsFilled(0);
    setTotalSavings(0);
    setCo2Reduced(0);
  }, []);

  const pickupPassenger = useCallback((id: string) => {
    setPassengers(prev => prev.map(p => {
      if (p.id === id && p.status === "waiting") {
        setSeatsFilled(s => s + 1);
        setTotalSavings(s => s + p.savings);
        setCo2Reduced(c => c + 0.8);
        return { ...p, status: "picked_up" };
      }
      return p;
    }));
  }, []);

  return (
    <JourneyContext.Provider value={{
      phase, scrollProgress, route, isMirrored,
      passengers, seatsFilled, totalSavings, co2Reduced,
      setScrollProgress, pickupPassenger, initializeJourney
    }}>
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney() {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error("useJourney must be used within JourneyProvider");
  return ctx;
}
