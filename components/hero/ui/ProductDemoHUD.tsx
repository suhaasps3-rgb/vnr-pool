"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useJourney } from "../core/JourneyEngine";
import { Search, CheckCircle2, Route, ArrowRightCircle } from "lucide-react";

export default function ProductDemoHUD() {
  const { phase, passengers } = useJourney();

  // Hide the HUD completely once the journey actually begins or when revealing the network
  if (phase === "JOURNEY_BEGINS" || phase === "PICKUP" || phase === "DESTINATION" || phase === "NETWORK_REVEAL") {
    return null;
  }

  // Define spring transitions for glass UI to feel incredibly snappy but smooth
  const springTransition = { type: "spring", stiffness: 350, damping: 25 } as const;

  return (
    <div className="absolute top-4 md:top-1/2 left-1/2 transform -translate-x-1/2 md:-translate-y-1/2 z-50 pointer-events-none w-[320px]">
      <AnimatePresence mode="wait">
        
        {phase === "SEARCHING" && (
          <motion.div
            key="searching"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={springTransition}
            className="bg-[var(--hero-glass-bg)] backdrop-blur-2xl border border-[var(--hero-glass-border)] shadow-[var(--shadow-large)] p-6 rounded-3xl flex flex-col items-center gap-4 text-center"
          >
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-full border-t-2 border-r-2 border-[var(--hero-accent)] flex items-center justify-center shadow-[0_0_15px_rgba(79,124,255,0.3)]"
            >
              <Search className="w-5 h-5 text-[var(--hero-accent)]" />
            </motion.div>
            <div>
              <h3 className="text-slate-900 dark:text-white font-bold text-lg">Looking for riders</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Scanning local routes</p>
            </div>
          </motion.div>
        )}

        {/* PAUSE_1 is intentionally empty to create a cinematic beat */}
        {phase === "PAUSE_1" && <div key="pause1"></div>}

        {phase === "MATCHED" && (
          <motion.div
            key="matched"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={springTransition}
            className="bg-[var(--hero-glass-bg)] backdrop-blur-2xl border border-[var(--hero-glass-border)] shadow-[var(--shadow-large)] p-6 rounded-3xl flex flex-col gap-4 w-full"
          >
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-6 h-6 text-[var(--hero-success)] drop-shadow-[0_0_8px_rgba(52,199,89,0.4)]" />
              <h3 className="text-slate-900 dark:text-white font-bold text-lg">{passengers.length} compatible riders</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Driver</span>
                <span className="text-[var(--hero-accent)] font-bold">100% Match</span>
              </div>
              
              {passengers.map((p, i) => (
                <motion.div 
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, ...springTransition }}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--hero-success)] shadow-[0_0_5px_rgba(52,199,89,0.5)]"></span>
                    {p.name}
                  </span>
                  <span className="text-[var(--hero-success)] font-bold">{p.matchScore}% Match</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {(phase === "BRANCHING" || phase === "OPTIMISING_CHOICE") && (
          <motion.div
            key="optimising"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={springTransition}
            className="bg-[var(--hero-glass-bg)] backdrop-blur-2xl border border-[var(--hero-glass-border)] shadow-[var(--shadow-large)] p-6 rounded-3xl flex flex-col items-center gap-4 text-center"
          >
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }} 
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center"
            >
              <Route className="w-6 h-6 text-indigo-500" />
            </motion.div>
            <div>
              <h3 className="text-slate-900 dark:text-white font-bold text-lg">Evaluating alternatives</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Comparing 2 route options</p>
            </div>
          </motion.div>
        )}

        {phase === "OPTIMISED" && (
          <motion.div
            key="optimised"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={springTransition}
            className="bg-[var(--hero-glass-bg)] backdrop-blur-2xl border border-[var(--hero-glass-border)] shadow-[var(--shadow-large)] p-6 rounded-3xl flex flex-col items-center gap-4 text-center"
          >
            <div className="w-12 h-12 bg-[var(--hero-success)]/10 border border-[var(--hero-success)]/30 rounded-full flex items-center justify-center">
              <ArrowRightCircle className="w-6 h-6 text-[var(--hero-success)]" />
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-white font-bold text-lg">Optimal Route Selected</h3>
              <p className="text-[var(--hero-success)] text-sm font-bold mt-1">12 minutes saved</p>
            </div>
          </motion.div>
        )}

        {/* PAUSE_2 is intentionally empty for cinematic beat before journey begins */}
        {phase === "PAUSE_2" && <div key="pause2"></div>}

      </AnimatePresence>
    </div>
  );
}
