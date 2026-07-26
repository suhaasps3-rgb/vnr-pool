"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ShieldCheck, MapPin, Zap, Users, Search, ArrowRight, Shield, Clock, X } from "lucide-react";
import AuthScreen from "./AuthScreen";
import HeroSection from "./hero/HeroSection";

export default function LandingPage({ onLogin }: { onLogin: () => void }) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Mock rides for the live feed
  const mockRides = [
    { id: 1, origin: "Kukatpally", dest: "VNR VJIET", time: "08:15 AM", seats: 2, price: 40, driver: "S", type: "car" },
    { id: 2, origin: "Miyapur", dest: "VNR VJIET", time: "08:30 AM", seats: 1, price: 30, driver: "P", type: "bike" },
    { id: 3, origin: "Secunderabad", dest: "VNR VJIET", time: "07:45 AM", seats: 3, price: 60, driver: "A", type: "car" },
  ];

  return (
    <div className="min-h-screen bg-[var(--hero-bg)] text-slate-900 relative overflow-hidden font-sans selection:bg-[var(--hero-accent)]/30">
      


      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto left-1/2 -translate-x-1/2">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 bg-[var(--hero-accent)] rounded-xl flex items-center justify-center font-black text-xl text-white shadow-[0_0_20px_rgba(79,124,255,0.3)]">
            V
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">VNR Pool</span>
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setShowAuthModal(true)}
          className="px-6 py-2.5 rounded-full font-semibold text-sm bg-white/50 border border-slate-200 hover:bg-white transition-colors backdrop-blur-md shadow-sm text-slate-800"
        >
          Student Login
        </motion.button>
      </nav>

      <div className="w-full relative z-10">
        <HeroSection onJoin={() => setShowAuthModal(true)} />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-32">

        {/* The SVG Route Continuation Backbone */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-[var(--hero-accent)]/20 via-[var(--hero-accent)]/10 to-transparent -z-10"></div>

        {/* INTERACTIVE SEARCH BAR */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto mb-32 -mt-10 relative z-20"
        >
          <div className="bg-white/70 backdrop-blur-2xl border border-slate-200/60 p-4 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 flex items-center gap-3 w-full bg-slate-50/80 px-6 py-4 rounded-2xl border border-slate-100">
              <MapPin className="w-5 h-5 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">From</span>
                <span className="text-slate-700 font-bold">Kukatpally (JNTU)</span>
              </div>
            </div>
            <div className="hidden md:flex text-slate-300">
              <ArrowRight className="w-5 h-5" />
            </div>
            <div className="flex-1 flex items-center gap-3 w-full bg-slate-50/80 px-6 py-4 rounded-2xl border border-slate-100">
              <MapPin className="w-5 h-5 text-[var(--hero-accent)]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-wider text-[var(--hero-accent)]/70 uppercase">To</span>
                <span className="text-slate-700 font-bold">VNR VJIET Gate 1</span>
              </div>
            </div>
            <button 
              onClick={() => setShowAuthModal(true)}
              className="w-full md:w-auto px-8 py-5 rounded-2xl bg-[var(--hero-accent)] hover:bg-[var(--hero-accent)]/90 text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
            >
              <Search className="w-5 h-5" /> Search
            </button>
          </div>
        </motion.div>

        {/* LIVE RIDE FEED GRID */}
        <div className="mb-32">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Live Rides Right Now</h3>
            <span className="flex items-center gap-2 text-sm font-semibold text-[var(--hero-success)] bg-[var(--hero-success)]/10 px-4 py-2 rounded-full border border-[var(--hero-success)]/20">
              <span className="w-2 h-2 rounded-full bg-[var(--hero-success)] animate-pulse"></span> Active Network
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockRides.map((ride, i) => (
              <motion.div
                key={ride.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/60 backdrop-blur-xl border border-slate-200/60 hover:border-[var(--hero-accent)]/30 p-6 rounded-3xl transition-all shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(79,124,255,0.1)] group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-lg text-slate-700">
                    {ride.driver}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-900">₹{ride.price}</p>
                    <p className="text-xs text-slate-500 font-medium">per seat</p>
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-600">{ride.origin}</span>
                  </div>
                  <div className="w-px h-4 bg-slate-200 ml-2"></div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[var(--hero-accent)]" />
                    <span className="font-bold text-slate-800">{ride.dest}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                    <Clock className="w-4 h-4" /> {ride.time}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-[var(--hero-accent)] font-bold bg-[var(--hero-accent)]/10 px-3 py-1 rounded-full">
                    <Users className="w-4 h-4" /> {ride.seats} left
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* BENTO GRID */}
        <div>
          <h3 className="text-2xl font-black text-slate-900 mb-8 text-center tracking-tight">Built for VNR Students</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-2 bg-gradient-to-br from-indigo-50/50 to-white/60 backdrop-blur-xl border border-slate-200/60 p-8 rounded-3xl relative overflow-hidden group shadow-sm"
            >
              <Shield className="w-10 h-10 text-[var(--hero-accent)] mb-6" />
              <h4 className="text-2xl font-bold text-slate-900 mb-2">100% Verified Identity</h4>
              <p className="text-slate-600 font-medium">Every user must register with a valid @vnrvjiet.in email address. No outsiders allowed.</p>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[var(--hero-accent)]/10 blur-3xl rounded-full group-hover:bg-[var(--hero-accent)]/20 transition-colors"></div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 bg-gradient-to-br from-purple-50/50 to-white/60 backdrop-blur-xl border border-slate-200/60 p-8 rounded-3xl relative overflow-hidden group shadow-sm"
            >
              <Users className="w-10 h-10 text-purple-500 mb-6" />
              <h4 className="text-2xl font-bold text-slate-900 mb-2">Female-Only Rides</h4>
              <p className="text-slate-600 font-medium">Dedicated filters to find and offer rides exclusively for female students for maximum comfort.</p>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full group-hover:bg-purple-500/20 transition-colors"></div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-4 bg-white/60 backdrop-blur-xl border border-slate-200/60 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm"
            >
              <div>
                <Zap className="w-10 h-10 text-amber-500 mb-6" />
                <h4 className="text-2xl font-bold text-slate-900 mb-2">Instant Fuel Split</h4>
                <p className="text-slate-600 font-medium max-w-lg">No more awkward money conversations. The app automatically calculates a fair fuel split based on the route and number of passengers.</p>
              </div>
              <button 
                onClick={() => setShowAuthModal(true)}
                className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors shrink-0 shadow-xl shadow-slate-900/20"
              >
                Join the Network
              </button>
            </motion.div>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-200/60 bg-[var(--hero-bg)] py-12 text-center text-slate-500 font-medium text-sm">
        <p>&copy; {new Date().getFullYear()} VNR Pool. For VNR VJIET Students.</p>
      </footer>

      {/* AUTH MODAL OVERLAY */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-md"
            >
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative">
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-4 right-4 z-20 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
                <AuthScreen onAuthSuccess={onLogin} isModal={true} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
