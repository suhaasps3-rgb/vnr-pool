"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getRandomRoute, RouteData } from "../assets/routes";

export type JourneyPhase = 
  | "INITIAL"
  | "SEARCHING"
  | "MATCHED"
  | "OPTIMISING"
  | "JOURNEY_BEGINS"
  | "PICKUP"
  | "DESTINATION"
  | "SUMMARY";

export interface PassengerData {
  id: string;
  name: string;
  matchScore: number;
  savings: number;
  tValue: number; // Position on the SVG path (0 to 1)
  status: "waiting" | "picked_up";
}

interface JourneyContextType {
  phase: JourneyPhase;
  route: RouteData | null;
  isMirrored: boolean;
  passengers: PassengerData[];
  seatsFilled: number;
  totalSavings: number;
  co2Reduced: number;
  
  // Actions
  setPhase: (phase: JourneyPhase) => void;
  pickupPassenger: (id: string) => void;
  initializeJourney: () => void;
}

const JourneyContext = createContext<JourneyContextType | null>(null);

export function JourneyProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<JourneyPhase>("INITIAL");
  const [route, setRoute] = useState<RouteData | null>(null);
  const [isMirrored, setIsMirrored] = useState(false);
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [seatsFilled, setSeatsFilled] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [co2Reduced, setCo2Reduced] = useState(0);

  const initializeJourney = useCallback(() => {
    const { route: selectedRoute, mirrored } = getRandomRoute();
    setRoute(selectedRoute);
    setIsMirrored(mirrored);

    // Generate mock passengers based on route pickups
    const mockNames = ["Priya", "Rahul", "Sneha", "Karthik", "Anjali"];
    const generatedPassengers = selectedRoute.pickups.map((t, index) => ({
      id: `p-${index}`,
      name: mockNames[index % mockNames.length],
      matchScore: Math.floor(Math.random() * 10 + 90), // 90-99%
      savings: Math.floor(Math.random() * 20 + 10), // 10-30 rupees per stop
      tValue: t,
      status: "waiting" as const,
    }));

    setPassengers(generatedPassengers);
    setSeatsFilled(0);
    setTotalSavings(0);
    setCo2Reduced(0);
    setPhase("SEARCHING");
  }, []);

  const pickupPassenger = useCallback((id: string) => {
    setPassengers(prev => prev.map(p => {
      if (p.id === id && p.status === "waiting") {
        setSeatsFilled(s => s + 1);
        setTotalSavings(s => s + p.savings);
        setCo2Reduced(c => c + 0.8); // 0.8kg per passenger mock
        return { ...p, status: "picked_up" };
      }
      return p;
    }));
  }, []);

  return (
    <JourneyContext.Provider value={{
      phase, setPhase,
      route, isMirrored,
      passengers,
      seatsFilled, totalSavings, co2Reduced,
      pickupPassenger, initializeJourney
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
