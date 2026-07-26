"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useJourney } from "../core/JourneyEngine";
import { Search, CheckCircle2, Route, Car } from "lucide-react";

export default function ProductDemoHUD() {
  const { phase, setPhase, passengers } = useJourney();

  useEffect(() => {
    // This is the core logic engine orchestrating the product demo start
    if (phase === "SEARCHING") {
      const timer = setTimeout(() => setPhase("MATCHED"), 2000);
      return () => clearTimeout(timer);
    }
    if (phase === "MATCHED") {
      const timer = setTimeout(() => setPhase("OPTIMISING"), 2500);
      return () => clearTimeout(timer);
    }
    if (phase === "OPTIMISING") {
      const timer = setTimeout(() => setPhase("JOURNEY_BEGINS"), 2000);
      return () => clearTimeout(timer);
    }
  }, [phase, setPhase]);

  // Once journey begins, we hide this HUD
  if (phase !== "SEARCHING" && phase !== "MATCHED" && phase !== "OPTIMISING") {
    return null;
  }

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none w-[320px]">
      <AnimatePresence mode="wait">
        
        {phase === "SEARCHING" && (
          <motion.div
            key="searching"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="bg-[var(--hero-glass-bg)] backdrop-blur-xl border border-[var(--hero-glass-border)] shadow-[var(--shadow-large)] p-6 rounded-3xl flex flex-col items-center gap-4 text-center"
          >
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-full border-t-2 border-r-2 border-[var(--hero-accent)] flex items-center justify-center"
            >
              <Search className="w-5 h-5 text-[var(--hero-accent)]" />
            </motion.div>
            <div>
              <h3 className="text-slate-900 font-bold text-lg">Looking for riders...</h3>
              <p className="text-slate-500 text-sm font-medium mt-1">Scanning local routes</p>
            </div>
          </motion.div>
        )}

        {phase === "MATCHED" && (
          <motion.div
            key="matched"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="bg-[var(--hero-glass-bg)] backdrop-blur-xl border border-[var(--hero-glass-border)] shadow-[var(--shadow-large)] p-6 rounded-3xl flex flex-col gap-4 w-full"
          >
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-6 h-6 text-[var(--hero-success)]" />
              <h3 className="text-slate-900 font-bold text-lg">{passengers.length} compatible riders found</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">Driver</span>
                <span className="text-[var(--hero-accent)] font-bold">100% Match</span>
              </div>
              
              {passengers.map((p, i) => (
                <motion.div 
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-semibold text-slate-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--hero-success)]"></span>
                    {p.name}
                  </span>
                  <span className="text-[var(--hero-success)] font-bold">{p.matchScore}% Match</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {phase === "OPTIMISING" && (
          <motion.div
            key="optimising"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="bg-[var(--hero-glass-bg)] backdrop-blur-xl border border-[var(--hero-glass-border)] shadow-[var(--shadow-large)] p-6 rounded-3xl flex flex-col items-center gap-4 text-center"
          >
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }} 
              transition={{ duration: 1, repeat: Infinity }}
              className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center"
            >
              <Route className="w-6 h-6 text-indigo-500" />
            </motion.div>
            <div>
              <h3 className="text-slate-900 font-bold text-lg">Optimising Route</h3>
              <p className="text-slate-500 text-sm font-medium mt-1">Calculating fastest path for {passengers.length + 1} people</p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
