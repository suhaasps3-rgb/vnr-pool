"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, MapPin, Users, Search, UserX, Car, 
  Wallet, ChevronRight, CheckCircle2, TrendingUp, AlertTriangle, Route, Activity, LogOut
} from "lucide-react";
import FindRideFeed from "./FindRideFeed";
import OfferSeatForm from "./OfferSeatForm";
import BlockedUsersModal from "./BlockedUsersModal";
import MyRides from "./MyRides";
import Profile from "./Profile";
import NotificationBell from "./NotificationBell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import ActiveRideView from "./ActiveRideView";
import { cn } from "@/lib/utils";

type TabType = "find" | "offer" | "my-rides" | "profile" | "active";

export default function Dashboard({ onSignOut, userId }: { onSignOut: () => void, userId: string }) {
  const [activeTab, setActiveTab] = useState<TabType>("find");
  const [selectedVehicle, setSelectedVehicle] = useState<"car" | "auto" | "bike">("car");
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Widget States
  const [calcDistance, setCalcDistance] = useState<number>(15);
  const [calcVehicle, setCalcVehicle] = useState<"car" | "bike">("car");
  const [calcPassengers, setCalcPassengers] = useState<number>(4);

  // Real-time listener
  useEffect(() => {
    const channel = supabase.channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, () => {
        queryClient.invalidateQueries({ queryKey: ["activeTripGlobal"] });
        queryClient.invalidateQueries({ queryKey: ["activeTrip"] });
        queryClient.invalidateQueries({ queryKey: ["rides"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `passenger_id=eq.${userId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["activeTripGlobal"] });
        queryClient.invalidateQueries({ queryKey: ["activeTrip"] });
        queryClient.invalidateQueries({ queryKey: ["rides"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient, userId]);

  // Active Trip Checker Hook
  const { data: hasActiveTrip } = useQuery({
    queryKey: ["activeTripGlobal", userId],
    queryFn: async () => {
      const { data: driverRides } = await supabase.from('rides')
        .select('id, status')
        .eq('driver_id', userId);
      
      if (driverRides && driverRides.some(r => r.status === 'active' || r.status === 'in_progress')) return true;

      let isActivePassenger = false;
      const { data: pBookings } = await supabase.from('bookings').select('id, rides(id, status)').eq('passenger_id', userId).in('status', ['approved', 'pending']);
      if (pBookings && pBookings.some((b: any) => b.rides && (b.rides.status === 'active' || b.rides.status === 'in_progress'))) {
        isActivePassenger = true;
      }

      if (!isActivePassenger) {
        const { data: rawBookings } = await supabase.from('bookings').select('ride_id, status').eq('passenger_id', userId);
        const activeRaw = rawBookings?.filter(b => b.status === 'approved' || b.status === 'pending') || [];
        if (activeRaw.length > 0) {
          const rIds = activeRaw.map(b => b.ride_id);
          const { data: allRidesRaw } = await supabase.from('rides').select('id, status');
          if (allRidesRaw) {
            const passengerRides = allRidesRaw.filter(r => rIds.includes(r.id));
            if (passengerRides.some(r => r.status === 'active' || r.status === 'in_progress')) {
              isActivePassenger = true;
            }
          }
        }
      }
      return isActivePassenger;
    },
    refetchInterval: 5000
  });

  useEffect(() => {
    setActiveTab(prev => {
      if (hasActiveTrip && prev !== "active") return "active";
      if (!hasActiveTrip && prev === "active") return "find";
      return prev;
    });
  }, [hasActiveTrip]);


  // Tab Configuration
  const TABS = [
    { id: "find", label: "Find a Ride", icon: Search },
    { id: "offer", label: "Offer a Ride", icon: Car },
    { id: "my-rides", label: "My Bookings", icon: Route },
    { id: "profile", label: "Profile", icon: Users },
  ];

  if (hasActiveTrip && !TABS.find(t => t.id === "active")) {
    TABS.push({ id: "active", label: "Active Trip", icon: Activity });
  }

  // Cost Calc Logic
  let ratePerKm = 0;
  if (calcVehicle === "bike") {
    ratePerKm = 2.55;
  } else {
    if (calcPassengers === 4) ratePerKm = 2.66;
    else if (calcPassengers === 3) ratePerKm = 3.55;
    else if (calcPassengers === 2) ratePerKm = 5.32;
    else ratePerKm = 10.65;
  }
  
  const recommendedSplit = Math.ceil(ratePerKm * calcDistance);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-x-hidden font-sans selection:bg-teal-500/30">
      
      {/* Ambient Lighting */}
      <div className="absolute top-0 left-[20%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none opacity-50 mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none opacity-50 mix-blend-screen" />

      {/* Modern Top Bar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-slate-950/60 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-lg shadow-indigo-600/20">
              V
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white leading-none">VNR Pool Dashboard</h1>
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Campus Network
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            
            <NotificationBell userId={userId} />

            <button onClick={onSignOut} className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group">
              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex flex-col gap-8">
        
        {/* Animated Staggered Container */}
        <motion.div 
          initial="hidden" animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="flex flex-col gap-8"
        >

          {/* Verified Student Banner */}
          <motion.section 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="w-full"
          >

            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-center items-center text-center gap-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
              <ShieldCheck className="w-8 h-8 text-indigo-400 relative z-10" />
              <div className="relative z-10">
                <div className="text-sm font-bold text-white">Verified Student</div>
                <div className="text-xs text-slate-400">VNR VJIET ID Authenticated</div>
              </div>
            </div>
          </motion.section>

          {/* 2-Column Workspace Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Main App Area */}
            <motion.div 
              variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
              className="lg:col-span-8 flex flex-col gap-6"
            >
              
              {/* Tab Navigation */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl p-1.5 flex overflow-x-auto no-scrollbar shadow-sm">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={cn(
                        "relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex-shrink-0",
                        isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute inset-0 bg-slate-800 rounded-lg shadow-sm border border-slate-700/50"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <Icon className={cn("w-4 h-4", isActive ? "text-indigo-400" : "")} />
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Workspace Container */}
              <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 rounded-2xl p-1 shadow-2xl relative overflow-hidden group">
                {/* Subtle border glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/10 group-hover:via-transparent transition-all duration-500 pointer-events-none" />
                
                <div className="bg-slate-950 rounded-xl p-4 sm:p-6 lg:p-8 min-h-[500px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      {activeTab === "find" && <FindRideFeed userId={userId} onVehicleSelect={setSelectedVehicle} />}
                      {activeTab === "offer" && <OfferSeatForm userId={userId} onVehicleSelect={setSelectedVehicle} />}
                      {activeTab === "my-rides" && <MyRides userId={userId} onVehicleSelect={setSelectedVehicle} />}
                      {activeTab === "profile" && <Profile userId={userId} />}
                      {activeTab === "active" && <ActiveRideView userId={userId} onVehicleSelect={setSelectedVehicle} />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

            </motion.div>

            {/* RIGHT COLUMN: Sidebar Widgets */}
            <motion.div 
              variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
              className="lg:col-span-4 flex flex-col gap-6 sticky top-24"
            >
              
              {/* Pickup Map Placeholder */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm group">
                <div className="h-32 bg-slate-800 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_100%)]" />
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:16px_16px]" />
                  <MapPin className="w-8 h-8 text-indigo-400 relative z-10 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                  
                  {/* Decorative map nodes */}
                  <div className="absolute top-8 left-8 w-2 h-2 bg-slate-600 rounded-full" />
                  <div className="absolute top-20 right-12 w-2 h-2 bg-slate-600 rounded-full" />
                  <div className="absolute bottom-6 left-24 w-3 h-3 bg-teal-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                  
                  <svg className="absolute inset-0 w-full h-full stroke-slate-700/50 fill-none" strokeWidth="2" strokeDasharray="4 4">
                    <path d="M 40,40 L 100,100 L 150,80" />
                  </svg>
                </div>
                <div className="p-4 border-t border-slate-800/80">
                  <h3 className="text-sm font-bold text-white mb-1">Campus Hotspots</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    High demand pickups at Kukatpally (JNTU), Pragathi Nagar, and Miyapur X Roads.
                  </p>
                </div>
              </div>

              {/* Fuel Split Calculator */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-teal-400" />
                  Quick Fare Splitter
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => { setCalcVehicle("car"); setCalcPassengers(4); }}
                      className={`py-2 rounded-lg text-xs font-bold transition-colors ${calcVehicle === "car" ? "bg-teal-500 text-slate-950" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                    >
                      Car
                    </button>
                    <button 
                      onClick={() => { setCalcVehicle("bike"); setCalcPassengers(1); }}
                      className={`py-2 rounded-lg text-xs font-bold transition-colors ${calcVehicle === "bike" ? "bg-teal-500 text-slate-950" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                    >
                      Bike
                    </button>
                  </div>

                  {calcVehicle === "car" && (
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Total Passengers (excluding you)</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4].map(num => (
                          <button
                            key={num}
                            onClick={() => setCalcPassengers(num)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${calcPassengers === num ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex justify-between">
                      <span>Distance (km)</span>
                      <span className="text-teal-400">{calcDistance} km</span>
                    </label>
                    <input 
                      type="range" min="1" max="40" 
                      value={calcDistance} onChange={(e) => setCalcDistance(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-full appearance-none accent-teal-400"
                    />
                  </div>
                  
                  <div className="pt-2 border-t border-slate-800/50 flex justify-between items-end">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Recommended per seat</div>
                      <div className="text-2xl font-black text-white flex items-start gap-1">
                        <span className="text-sm text-slate-400 mt-1">₹</span>{recommendedSplit}
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors">
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Safety Guidelines */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Safety Guidelines
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-xs text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    Verify the driver's college ID before boarding.
                  </li>
                  <li className="flex items-start gap-2 text-xs text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    Share your live location with a friend via WhatsApp.
                  </li>
                  <li className="flex items-start gap-2 text-xs text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    Payments should only be made directly to the driver via UPI.
                  </li>
                </ul>
              </div>

            </motion.div>
          </section>
        </motion.div>
      </main>

      {showBlockedModal && (
        <BlockedUsersModal userId={userId} onClose={() => setShowBlockedModal(false)} />
      )}
    </div>
  );
}
