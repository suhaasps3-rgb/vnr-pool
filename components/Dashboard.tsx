"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, MapPin, Calendar, Users, Search, UserX } from "lucide-react";
import FindRideFeed from "./FindRideFeed";
import OfferSeatForm from "./OfferSeatForm";
import Navigation from "./Navigation";
import BlockedUsersModal from "./BlockedUsersModal";
import MyRides from "./MyRides";
import Profile from "./Profile";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import ActiveRideView from "./ActiveRideView";

type TabType = "find" | "offer" | "my-rides" | "profile" | "active";

export default function Dashboard({ onSignOut, userId }: { onSignOut: () => void, userId: string }) {
  const [activeTab, setActiveTab] = useState<TabType>("find");
  const [selectedVehicle, setSelectedVehicle] = useState<"car" | "auto" | "bike">("car");
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Instant real-time listener to force UI updates immediately
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

  const { data: hasActiveTrip } = useQuery({
    queryKey: ["activeTripGlobal", userId],
    queryFn: async () => {
      // 1. Check if user is driver
      const { data: driverRides, error: dError } = await supabase.from('rides')
        .select('id')
        .eq('driver_id', userId)
        .in('status', ['active', 'in_progress'])
        .limit(1);
      
      if (driverRides && driverRides.length > 0) return true;

      // 2. Check if user is passenger
      const { data: bookings, error: bError } = await supabase.from('bookings')
        .select('ride_id')
        .eq('passenger_id', userId)
        .in('status', ['approved', 'pending']);
      
      if (bookings && bookings.length > 0) {
        const rideIds = bookings.map(b => b.ride_id);
        const { data: passengerRides } = await supabase.from('rides')
          .select('id')
          .in('id', rideIds)
          .in('status', ['active', 'in_progress'])
          .limit(1);
        
        if (passengerRides && passengerRides.length > 0) return true;
      }

      return false;
    },
    refetchInterval: 5000
  });

  useEffect(() => {
    if (hasActiveTrip) {
      setActiveTab("active");
    } else if (activeTab === "active") {
      setActiveTab("find");
    }
  }, [hasActiveTrip, activeTab]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col">
      <Navigation 
        userId={userId} 
        onSignOut={onSignOut} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        hasActiveTrip={hasActiveTrip}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col items-center">
        
        {/* Trust & Safety Badges */}
        <div className="w-full flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
            Verified College Platform
          </div>
        </div>

        {/* Hero Section */}
        <div className="w-full text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#0F172A] dark:text-white tracking-tight mb-4">
            Commute <span className="text-[#2563EB] dark:text-[#3B82F6]">Smarter,</span><br/>Together.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Safe, affordable, and eco-friendly ride-pooling exclusively for VNR VJIET students and faculty.
          </p>
        </div>

        {/* Action Button for Mobile Blocked Users */}
        <div className="w-full max-w-4xl flex justify-end mb-4">
          <button 
            onClick={() => setShowBlockedModal(true)} 
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <UserX className="w-4 h-4" /> Manage Blocked
          </button>
        </div>

        {/* Main Content Area */}
        <div className="w-full max-w-4xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/5 rounded-3xl shadow-xl overflow-hidden">
          <div className="p-4 md:p-8">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "find" && !hasActiveTrip ? (
                <div className="space-y-6">
                  <FindRideFeed userId={userId} onVehicleSelect={setSelectedVehicle} />
                </div>
              ) : activeTab === "active" ? (
                <ActiveRideView userId={userId} onVehicleSelect={setSelectedVehicle} />
              ) : activeTab === "offer" && !hasActiveTrip ? (
                <OfferSeatForm userId={userId} onVehicleSelect={setSelectedVehicle} />
              ) : activeTab === "my-rides" ? (
                <MyRides userId={userId} onVehicleSelect={setSelectedVehicle} />
              ) : (
                <Profile userId={userId} />
              )}
            </motion.div>
          </div>
        </div>
      </main>

      {showBlockedModal && (
        <BlockedUsersModal userId={userId} onClose={() => setShowBlockedModal(false)} />
      )}
    </div>
  );
}
