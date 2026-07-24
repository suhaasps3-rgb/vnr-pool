'use client';

import React from "react";
import IsoLevelWarp from "@/components/ui/isometric-wave-grid-background";
import { Car, ShieldCheck, MapPin, Search, ArrowRight } from "lucide-react";

export function VNRCarPoolWaveHero({ onAction }: { onAction?: () => void }) {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-slate-950 font-sans flex flex-col justify-center">
      
      {/* Interactive Warp Canvas Background */}
      <IsoLevelWarp 
        color="20, 184, 166" // Teal-500 palette matching VNR Carpool branding
        density={45} 
        speed={1.2}
      />

      {/* Hero Content Overlay */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 text-center flex flex-col items-center">
        
        {/* Verification Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-medium mb-6 backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-teal-400" /> Exclusive to VNR VJIET Students & Faculty
        </div>

        {/* Dynamic Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight drop-shadow-xl">
          Smart Carpooling for <br />
          <span className="text-white">
            VNR VJIET Campus.
          </span>
        </h1>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mb-8 leading-relaxed">
          Connect with fellow students commuting from Kukatpally, Bachupally, Miyapur, and Pragathi Nagar. Split fuel costs, reduce campus parking stress, and travel safely.
        </p>

        {/* Quick Route Selector Bar */}
        <div className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-lg border border-slate-800 p-2.5 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 mb-8">
          <div className="flex-1 flex items-center gap-2 px-3 w-full border-b sm:border-b-0 sm:border-r border-slate-800 py-2 sm:py-0">
            <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Pickup Location (e.g. Kukatpally)" 
              className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-full"
            />
          </div>
          <div className="flex-1 flex items-center gap-2 px-3 w-full py-2 sm:py-0">
            <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-sm text-slate-300 font-medium">Destination: VNR VJIET</span>
          </div>
          <button onClick={onAction} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shrink-0">
            <Search className="w-4 h-4" /> Find Rides
          </button>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-4">
          <button onClick={onAction} className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30">
            <Car className="w-4 h-4" /> Offer a Ride
          </button>
          <button onClick={onAction} className="px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-sm font-medium border border-slate-800 flex items-center gap-2 transition-all backdrop-blur-md">
            How It Works <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
