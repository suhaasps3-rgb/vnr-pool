"use client";

import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";

interface HeroContentProps {
  onJoin: () => void;
}

export default function HeroContent({ onJoin }: HeroContentProps) {
  return (
    <div className="flex flex-col justify-center h-full max-w-xl z-20 relative px-6 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight mb-6">
          Every Empty Seat Is An <span className="text-[#4F7CFF]">Opportunity.</span>
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
      >
        <p className="text-lg md:text-xl text-slate-600 font-medium mb-10 leading-relaxed max-w-md">
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
          className="group flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
        >
          Join the Ride
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        
        <button className="group flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition-all w-full sm:w-auto">
          <PlayCircle className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          See How It Works
        </button>
      </motion.div>
      
      {/* Social Proof / Trust */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-16 flex items-center gap-4 text-sm font-medium text-slate-500"
      >
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">S</div>
          <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">P</div>
          <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">A</div>
        </div>
        <p>Over <span className="text-slate-900 font-bold">1,200</span> students ride daily.</p>
      </motion.div>
    </div>
  );
}
