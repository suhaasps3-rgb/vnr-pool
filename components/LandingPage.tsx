"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ShieldCheck, MapPin, Zap, Users, Search, ArrowRight, Shield, Clock, X } from "lucide-react";
import AuthScreen from "./AuthScreen";

export default function LandingPage({ onLogin }: { onLogin: () => void }) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Mock rides for the live feed
  const mockRides = [
    { id: 1, origin: "Kukatpally", dest: "VNR VJIET", time: "08:15 AM", seats: 2, price: 40, driver: "S", type: "car" },
    { id: 2, origin: "Miyapur", dest: "VNR VJIET", time: "08:30 AM", seats: 1, price: 30, driver: "P", type: "bike" },
    { id: 3, origin: "Secunderabad", dest: "VNR VJIET", time: "07:45 AM", seats: 3, price: 60, driver: "A", type: "car" },
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-50 relative overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* Background Grid & Gradient Effects */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-blue-900/10"></div>
      </div>
      
      {/* Top Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            V
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">VNR Pool</span>
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setShowAuthModal(true)}
          className="px-6 py-2.5 rounded-full font-semibold text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-md"
        >
          Student Login
        </motion.button>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-32">
        
        {/* HERO SECTION */}
        <div className="flex flex-col items-center text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium text-sm mb-8 shadow-[0_0_30px_rgba(37,99,235,0.15)]"
          >
            <ShieldCheck className="w-4 h-4" /> Exclusive for VNR VJIET Students
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.1]"
          >
            Carpool to Campus, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              Made Seamless.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 font-medium"
          >
            Share rides with verified peers. Split fuel costs automatically. Connect with your college community every morning.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <button 
              onClick={() => setShowAuthModal(true)}
              className="px-8 py-4 rounded-2xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] transition-all flex items-center justify-center gap-2 group"
            >
              Find a Ride <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => setShowAuthModal(true)}
              className="px-8 py-4 rounded-2xl font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all flex items-center justify-center gap-2"
            >
              Offer a Seat
            </button>
          </motion.div>
        </div>

        {/* INTERACTIVE SEARCH BAR (MOCK) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto mb-32"
        >
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 flex items-center gap-3 w-full bg-black/40 px-6 py-4 rounded-2xl border border-white/5">
              <MapPin className="w-5 h-5 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">From</span>
                <span className="text-white font-medium">Kukatpally (JNTU)</span>
              </div>
            </div>
            <div className="hidden md:flex text-slate-500">
              <ArrowRight className="w-5 h-5" />
            </div>
            <div className="flex-1 flex items-center gap-3 w-full bg-black/40 px-6 py-4 rounded-2xl border border-white/5">
              <MapPin className="w-5 h-5 text-blue-400" />
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider text-blue-500/70 uppercase">To</span>
                <span className="text-white font-medium">VNR VJIET Gate 1</span>
              </div>
            </div>
            <button 
              onClick={() => setShowAuthModal(true)}
              className="w-full md:w-auto px-8 py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Search className="w-5 h-5" /> Search
            </button>
          </div>
        </motion.div>

        {/* LIVE RIDE FEED GRID */}
        <div className="mb-32">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <h3 className="text-2xl font-black text-white">Live Rides Right Now</h3>
            <span className="flex items-center gap-2 text-sm font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Active Feed
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockRides.map((ride, i) => (
              <motion.div
                key={ride.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-slate-900/40 backdrop-blur-sm border border-white/5 hover:border-blue-500/30 p-6 rounded-3xl transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-lg text-white">
                    {ride.driver}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">₹{ride.price}</p>
                    <p className="text-xs text-slate-500 font-medium">per seat</p>
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-slate-300">{ride.origin}</span>
                  </div>
                  <div className="w-px h-4 bg-white/10 ml-2"></div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-white">{ride.dest}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex items-center gap-1.5 text-sm text-slate-400 font-medium">
                    <Clock className="w-4 h-4" /> {ride.time}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-blue-400 font-bold bg-blue-500/10 px-3 py-1 rounded-full">
                    <Users className="w-4 h-4" /> {ride.seats} left
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* BENTO GRID */}
        <div>
          <h3 className="text-2xl font-black text-white mb-8 text-center">Built for VNR Students</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-2 bg-gradient-to-br from-blue-900/40 to-slate-900/40 border border-white/10 p-8 rounded-3xl relative overflow-hidden group"
            >
              <Shield className="w-10 h-10 text-blue-400 mb-6" />
              <h4 className="text-2xl font-bold text-white mb-2">100% Verified Identity</h4>
              <p className="text-slate-400 font-medium">Every user must register with a valid @vnrvjiet.in email address. No outsiders allowed.</p>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full group-hover:bg-blue-500/30 transition-colors"></div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 bg-gradient-to-br from-purple-900/30 to-slate-900/40 border border-white/10 p-8 rounded-3xl relative overflow-hidden group"
            >
              <Users className="w-10 h-10 text-purple-400 mb-6" />
              <h4 className="text-2xl font-bold text-white mb-2">Female-Only Rides</h4>
              <p className="text-slate-400 font-medium">Dedicated filters to find and offer rides exclusively for female students for maximum comfort.</p>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full group-hover:bg-purple-500/30 transition-colors"></div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-4 bg-slate-900/40 border border-white/10 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8"
            >
              <div>
                <Zap className="w-10 h-10 text-yellow-400 mb-6" />
                <h4 className="text-2xl font-bold text-white mb-2">Instant Fuel Split</h4>
                <p className="text-slate-400 font-medium max-w-lg">No more awkward money conversations. The app automatically calculates a fair fuel split based on the route and number of passengers.</p>
              </div>
              <button 
                onClick={() => setShowAuthModal(true)}
                className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-slate-200 transition-colors shrink-0"
              >
                Join the Network
              </button>
            </motion.div>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 bg-[#09090B] py-12 text-center text-slate-500 font-medium text-sm">
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-md"
            >
              <div className="bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative">
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-4 right-4 z-20 p-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-full transition-colors text-slate-600 dark:text-slate-300"
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
