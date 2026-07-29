"use client";

import { motion } from "framer-motion";
import { X, Phone, Star, ShieldCheck, Car } from "lucide-react";

interface DriverProfileModalProps {
  driver: any;
  vehicleNumber: string;
  onClose: () => void;
}

export default function DriverProfileModal({ driver, vehicleNumber, onClose }: DriverProfileModalProps) {
  const rating = driver?.rating_count > 0 
    ? (driver.rating_sum / driver.rating_count).toFixed(1) 
    : "New";
    
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0B1F1C]/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden z-10"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/70 hover:text-white transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Cover */}
        <div className="h-32 bg-[var(--accent-primary)] relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-8 pt-0 relative -mt-12 flex flex-col items-center">
          
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full border-4 border-[var(--bg-surface)] bg-[var(--bg-primary)] flex items-center justify-center text-3xl font-black text-slate-400 overflow-hidden shadow-md mb-4 relative">
            {driver?.avatar_url ? (
              <img src={driver.avatar_url} alt={driver.full_name || "Driver"} className="w-full h-full object-cover" />
            ) : (
              driver?.full_name?.charAt(0).toUpperCase()
            )}
            
            {/* Verified Badge positioned on the avatar */}
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-[var(--accent-primary)] rounded-full border-2 border-[var(--bg-surface)] flex items-center justify-center shadow-md">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* Name & Basic Info */}
          <h3 className="text-xl font-bold text-[var(--text-primary)] text-center mb-1">{driver?.full_name}</h3>
          <p className="text-sm text-slate-500 text-center mb-6">{driver?.branch} • {driver?.roll_no}</p>

          {/* Stats Grid */}
          <div className="w-full grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex flex-col items-center justify-center border border-[var(--border-subtle)]">
              <Star className="w-6 h-6 text-yellow-500 mb-2" fill="currentColor" />
              <div className="text-xl font-bold text-[var(--text-primary)]">{rating}</div>
              <div className="text-xs text-slate-500">{(driver?.rating_count || 0)} Ratings</div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex flex-col items-center justify-center border border-[var(--border-subtle)]">
              <Car className="w-6 h-6 text-[var(--accent-primary)] mb-2" />
              <div className="text-lg font-bold text-[var(--text-primary)] mt-0.5">{vehicleNumber || "N/A"}</div>
              <div className="text-xs text-slate-500 mt-0.5">Vehicle</div>
            </div>
          </div>

          {/* Mobile Number Button */}
          <a 
            href={`tel:${driver?.mobile_number}`}
            className="w-full flex items-center justify-center gap-2 bg-[var(--accent-primary)] hover:bg-[#178361] text-white py-3.5 rounded-xl font-bold transition-colors shadow-sm"
          >
            <Phone className="w-5 h-5" />
            Call {driver?.mobile_number}
          </a>
        </div>
      </motion.div>
    </div>
  );
}
