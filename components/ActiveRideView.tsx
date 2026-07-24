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
      <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-6 rounded-3xl text-center shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 animate-pulse"></div>
        <h2 className="text-2xl font-black text-blue-900 dark:text-blue-100 mb-2 flex items-center justify-center gap-3">
          <motion.span 
            animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }} 
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            🚗
          </motion.span> 
          Ride in Progress
        </h2>
        <p className="text-blue-700 dark:text-blue-300 font-medium">You are currently in an active ride. You cannot join or offer other rides until this trip is completed.</p>
      </div>
      
      <FindRideFeed userId={userId} onVehicleSelect={onVehicleSelect} mode="active_trip" />
    </motion.div>
  );
}
