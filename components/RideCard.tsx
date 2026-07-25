"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, ShieldCheck, ChevronRight, Map } from "lucide-react";
import { format } from "date-fns";
import DynamicMap from "./DynamicMap";
import { ROUTES, findLocIndex } from "@/lib/matchmaking";

export default function RideCard({ 
  ride, 
  price,
  priceNote,
  isApproved,
  hasRequested,
  isDriver,
  mode,
  onBookClick,
  onCancelClick,
  onCompleteClick,
  onChatClick,
  isProcessing
}: { 
  ride: any;
  price: number;
  priceNote?: string;
  isApproved: boolean;
  hasRequested: boolean;
  isDriver: boolean;
  mode: string;
  onBookClick: () => void;
  onCancelClick: () => void;
  onCompleteClick?: () => void;
  onChatClick?: () => void;
  isProcessing: boolean;
}) {
  
  const [showMap, setShowMap] = useState(false);

  // Determine glow color based on vehicle type
  const glowColor = ride.vehicle_type === 'car' ? 'rgba(59, 130, 246, 0.4)' // Blue
                  : ride.vehicle_type === 'auto' ? 'rgba(16, 185, 129, 0.4)' // Emerald
                  : 'rgba(139, 92, 246, 0.4)'; // Purple

  const borderClass = ride.vehicle_type === 'car' ? 'hover:border-blue-500/50'
                    : ride.vehicle_type === 'auto' ? 'hover:border-emerald-500/50'
                    : 'hover:border-purple-500/50';

  return (
    <motion.div 
      variants={{ 
        hidden: { opacity: 0, y: 30, scale: 0.95 }, 
        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } } 
      }}
      whileHover={{ 
        scale: 1.02, 
        boxShadow: `0 15px 30px -5px ${glowColor}`,
        y: -5
      }}
      className={`bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 ${borderClass} p-6 rounded-3xl relative overflow-hidden transition-all duration-300 ${ride.status === 'cancelled' ? 'grayscale opacity-75' : ''} ${ride.status === 'completed' ? 'border-emerald-200 dark:border-emerald-500/30' : ''}`}
    >
      {ride.status === 'cancelled' && (
        <div className="absolute top-4 right-4 bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-200 dark:border-red-500/30 z-10">
          CANCELLED
        </div>
      )}
      {ride.status === 'in_progress' && (
        <div className="absolute top-4 right-4 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-500/30 z-10">
          IN PROGRESS
        </div>
      )}
      {ride.status === 'completed' && (
        <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-500/30 z-10">
          COMPLETED
        </div>
      )}

      {/* Header: Driver Info & Price */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center text-lg font-black text-slate-700 dark:text-white border-2 border-white dark:border-slate-600 shadow-sm overflow-hidden">
              {ride.driver?.avatar_url ? (
                <img src={ride.driver.avatar_url} alt={ride.driver.full_name || "Driver"} className="w-full h-full object-cover" />
              ) : (
                ride.driver?.full_name?.charAt(0).toUpperCase()
              )}
            </div>
            {ride.driver?.rating_count > 0 && (
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white dark:border-[#0F172A]">
                ★ {(ride.driver.rating_sum / ride.driver.rating_count).toFixed(1)}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              {ride.driver?.full_name}
            </h4>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Verified VNRian
              </span>
              {ride.is_women_only && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-500/10 px-2 py-0.5 rounded-full">
                  Women Only
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {price === 0 ? "Free" : `₹${price}`}
          </p>
          {priceNote && <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{priceNote}</p>}
        </div>
      </div>

      {/* Route Timeline */}
      <div className="relative pl-4 mb-6">
        <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        
        <div className="relative flex items-center gap-4 mb-4">
          <div className="w-3 h-3 rounded-full bg-slate-400 dark:bg-slate-500 ring-4 ring-white dark:ring-[#0F172A] z-10"></div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pickup</p>
            <p className="font-semibold text-slate-900 dark:text-white">{ride.origin}</p>
          </div>
        </div>
        
        <div className="relative flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white dark:ring-[#0F172A] z-10 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
          <div>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Dropoff</p>
            <p className="font-semibold text-slate-900 dark:text-white">{ride.destination}</p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 mb-4">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-semibold">
            {ride.departure_time ? format(new Date(ride.departure_time), "h:mm a, MMM d") : "Flexible"}
          </span>
        </div>
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Users className="w-4 h-4" />
          <div className="flex gap-1 items-center">
            <span className="text-sm font-black">{ride.available_seats}</span>
            <span className="text-xs font-medium">seats left</span>
          </div>
        </div>
      </div>

      {/* Route Map Toggle */}
      <div className="mb-6">
        <button 
          onClick={(e) => { e.stopPropagation(); setShowMap(!showMap); }}
          className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2"
        >
          <MapPin className="w-4 h-4" />
          {showMap ? "Hide Route Map" : "View Route Map"}
        </button>
        
        {showMap && (
          <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300" onClick={(e) => e.stopPropagation()}>
            {(() => {
              let waypoints = undefined;
              if (ride.chosen_route_index !== null && ride.chosen_route_index !== undefined && ROUTES[ride.chosen_route_index]) {
                  const fullRoute = ROUTES[ride.chosen_route_index];
                  const oIdx = findLocIndex(fullRoute, ride.origin);
                  const dIdx = findLocIndex(fullRoute, ride.destination);
                  if (oIdx !== -1 && dIdx !== -1 && oIdx <= dIdx) {
                      waypoints = fullRoute.slice(oIdx, dIdx + 1);
                  }
              }
              return <DynamicMap origin={ride.origin} destination={ride.destination} waypoints={waypoints} />;
            })()}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {mode === "feed" && !isDriver && !hasRequested && ride.available_seats > 0 && ride.status === 'active' && (
          <button 
            onClick={onBookClick}
            disabled={isProcessing}
            className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              isProcessing 
                ? 'bg-blue-400 dark:bg-blue-600/50 cursor-not-allowed text-white' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]'
            }`}
          >
            Request Seat <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {(isApproved || isDriver) && ride.status !== 'cancelled' && (
          <>
            <button 
              onClick={onChatClick}
              className="p-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#0F172A] dark:hover:bg-slate-800 text-[#2563EB] dark:text-[#3B82F6] rounded-xl transition-colors shadow-sm"
              disabled={isProcessing}
            >
              <Users className="w-5 h-5" />
            </button>
            <button 
              onClick={onCancelClick}
              disabled={isProcessing}
              className={`flex-1 py-3.5 rounded-xl font-bold transition-all whitespace-nowrap ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''} bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20`}
            >
              Cancel {isApproved ? 'Seat' : 'Ride'}
            </button>
          </>
        )}
      </div>

      {isDriver && ride.status === 'in_progress' && (
        <button 
          onClick={onCompleteClick}
          className="w-full mt-2 py-3.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 rounded-xl font-bold transition-colors border border-emerald-200 dark:border-emerald-500/20"
        >
          Complete Ride
        </button>
      )}

      {hasRequested && !isApproved && !isDriver && (
        <div className="w-full py-3.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-center rounded-xl border border-amber-200 dark:border-amber-500/20 shadow-sm flex items-center justify-center gap-2">
          Request Pending...
        </div>
      )}
    </motion.div>
  );
}
