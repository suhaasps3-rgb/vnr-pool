"use client";

import FindRideFeed from "./FindRideFeed";
import { motion } from "framer-motion";

export default function ActiveRideView({ userId, onVehicleSelect }: { userId: string, onVehicleSelect: (v: "car" | "auto" | "bike") => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="space-y-6"
    >
      <div className="bg-[var(--hero-accent)]/10 dark:bg-[var(--hero-accent)]/10 border border-[var(--hero-accent)]/25 dark:border-[var(--hero-accent)]/20 p-6 rounded-3xl text-center shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--hero-accent)] to-[var(--hero-accent)] animate-pulse"></div>
        <h2 className="text-2xl font-black text-[var(--hero-accent)] dark:text-[var(--hero-accent)] mb-2 flex items-center justify-center gap-3">
          <motion.span 
            animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }} 
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            🚗
          </motion.span> 
          Ride in Progress
        </h2>
        <p className="text-[var(--hero-accent)] dark:text-[var(--hero-accent)] font-medium">You are currently in an active ride. You cannot join or offer other rides until this trip is completed.</p>
      </div>
      
      <FindRideFeed userId={userId} onVehicleSelect={onVehicleSelect} mode="active_trip" />
    </motion.div>
  );
}
