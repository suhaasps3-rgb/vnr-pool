"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import HowItWorksModal from "./HowItWorksModal";

interface HeroContentProps {
  onJoin: () => void;
}

export default function HeroContent({ onJoin }: HeroContentProps) {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <>
      <HowItWorksModal isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
      <div className="flex flex-col justify-center h-full max-w-xl z-20 relative px-6 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
      >
        <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5 text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-600 dark:text-stone-300 bg-stone-900/5 dark:bg-white/5 ring-1 ring-stone-900/10 dark:ring-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--hero-accent)]" />
          VNR VJIET carpooling
        </span>
        <h1 style={{ fontFamily: "var(--font-display), sans-serif" }} className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-stone-900 dark:text-stone-50 leading-[1.05] tracking-[-0.03em] mb-4 sm:mb-6 transition-colors">
          Every empty seat is an <span className="text-[var(--hero-accent)]">opportunity.</span>
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
      >
        <p className="text-base sm:text-lg md:text-xl text-stone-600 dark:text-stone-300 font-medium mb-10 leading-relaxed max-w-md transition-colors">
          Turn daily commutes into shared journeys. Save money, reduce traffic, and meet people travelling your way.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
      >
        <button
          onClick={onJoin}
          className="group flex items-center justify-between gap-4 bg-[var(--hero-accent)] text-white pl-7 pr-2 py-2 rounded-full font-bold text-lg shadow-[0_12px_30px_-10px_var(--hero-glow)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:brightness-105 active:scale-[0.98] w-full sm:w-auto"
        >
          Join the Ride
          <span className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
            <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
          </span>
        </button>

        <button
          onClick={() => setShowHowItWorks(true)}
          className="group flex items-center justify-center gap-2 bg-transparent text-stone-700 dark:text-stone-200 ring-1 ring-stone-900/10 dark:ring-white/15 px-7 py-[18px] rounded-full font-semibold text-lg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-stone-900/5 dark:hover:bg-white/10 active:scale-[0.98] w-full sm:w-auto"
        >
          <PlayCircle className="w-5 h-5 text-stone-400 group-hover:text-[var(--hero-accent)] transition-colors" strokeWidth={1.5} />
          See How It Works
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="hidden md:block mt-16 text-sm font-medium text-stone-500 dark:text-stone-400 transition-colors"
      >
        Built by VNR VJIET students, for VNR VJIET students.
      </motion.p>
      </div>
    </>
  );
}
