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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-4 sm:mb-6 transition-colors">
          Every Empty Seat Is An <span className="text-[#4F7CFF] dark:text-[#638fff] drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(79,124,255,0.4)]">Opportunity.</span>
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
      >
        <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium mb-10 leading-relaxed max-w-md transition-colors">
          Turn daily commutes into shared journeys. Save money, reduce traffic, and meet people travelling your way.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
      >
        <button
          onClick={onJoin}
          className="group flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] w-full sm:w-auto"
        >
          Join the Ride
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        
        <button 
          onClick={() => setShowHowItWorks(true)}
          className="group flex items-center justify-center gap-2 bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all w-full sm:w-auto backdrop-blur-md"
        >
          <PlayCircle className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
          See How It Works
        </button>
      </motion.div>
      
      {/* Social Proof / Trust */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-16 flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors"
      >
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">S</div>
          <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">P</div>
          <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">A</div>
        </div>
        <p>Over <span className="text-slate-900 dark:text-white font-bold">1,200</span> students ride daily.</p>
      </motion.div>
      </div>
    </>
  );
}
