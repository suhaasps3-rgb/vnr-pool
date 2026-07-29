"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Car, CalendarCheck, User, Activity,
  UserX, LogOut, Zap
} from "lucide-react";
import FindRideFeed from "./FindRideFeed";
import OfferSeatForm from "./OfferSeatForm";
import BlockedUsersModal from "./BlockedUsersModal";
import MyRides from "./MyRides";
import Profile from "./Profile";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import ActiveRideView from "./ActiveRideView";
import { cn } from "@/lib/utils";
import AIChatBot from "./AIChatBot";

type TabType = "find" | "offer" | "my-rides" | "profile" | "active";

interface NavTab {
  id: TabType;
  label: string;
  icon: React.ElementType;
}

const BASE_TABS: NavTab[] = [
  { id: "find", label: "Find Ride", icon: Search },
  { id: "offer", label: "Offer Ride", icon: Car },
  { id: "my-rides", label: "Bookings", icon: CalendarCheck },
  { id: "profile", label: "Profile", icon: User },
];

export default function Dashboard({ onSignOut, userId }: { onSignOut: () => void; userId: string }) {
  const [activeTab, setActiveTab] = useState<TabType>("find");
  const [selectedVehicle, setSelectedVehicle] = useState<"car" | "auto" | "bike">("car");
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Listen for custom switchTab events (e.g. from empty state CTA)
  useEffect(() => {
    const handler = (e: Event) => {
      const tab = (e as CustomEvent).detail as TabType;
      if (tab) setActiveTab(tab);
    };
    window.addEventListener('switchTab', handler);
    return () => window.removeEventListener('switchTab', handler);
  }, []);

  // Real-time listener
  useEffect(() => {
    const channel = supabase.channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "rides" }, () => {
        queryClient.invalidateQueries({ queryKey: ["activeTripGlobal"] });
        queryClient.invalidateQueries({ queryKey: ["activeTrip"] });
        queryClient.invalidateQueries({ queryKey: ["rides"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `passenger_id=eq.${userId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["activeTripGlobal"] });
        queryClient.invalidateQueries({ queryKey: ["activeTrip"] });
        queryClient.invalidateQueries({ queryKey: ["rides"] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, queryClient, userId]);

  // Active Trip Checker
  const { data: hasActiveTrip } = useQuery({
    queryKey: ["activeTripGlobal", userId],
    queryFn: async () => {
      const { data: driverRides } = await supabase.from("rides")
        .select("id, status")
        .eq("driver_id", userId)
        .eq("status", "in_progress");
      if (driverRides && driverRides.length > 0) return true;

      const { data: pBookings } = await supabase.from("bookings")
        .select("id, rides(id, status)")
        .eq("passenger_id", userId)
        .eq("status", "approved");
      if (pBookings && pBookings.some((b: any) => b.rides && b.rides.status === "in_progress")) {
        return true;
      }
      return false;
    },
    refetchInterval: 5000,
  });

  useEffect(() => {
    setActiveTab((prev) => {
      if (hasActiveTrip && prev !== "active") return "active";
      if (!hasActiveTrip && prev === "active") return "find";
      return prev;
    });
  }, [hasActiveTrip]);

  // User profile for greeting
  const { data: userProfile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("users").select("full_name").eq("id", userId).single();
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const firstName = userProfile?.full_name?.split(" ")[0] || "VNRian";

  // Build tabs — inject active trip tab if needed
  const TABS: NavTab[] = [...BASE_TABS];
  if (hasActiveTrip) {
    TABS.splice(2, 0, { id: "active", label: "Live Trip", icon: Activity });
  }

  return (
    <div
      className="min-h-screen relative font-sans"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      {/* Ambient light blobs removed as requested to avoid vibe-coding */}

      {/* ─── Top Header ─── */}
      <header
        className="sticky top-0 z-50 w-full bg-[var(--bg-nav)] text-[var(--text-primary)] shadow-[var(--shadow-nav)] border-b border-[var(--border-subtle)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo + Greeting */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800">
                <img src="/vnr_logo.png" alt="VNR Logo" className="w-full h-full object-contain p-0.5" />
              </div>
              <div className="hidden sm:block">
                <p className="text-[13px] font-bold leading-none text-[var(--text-primary)]">
                  Hey, {firstName}
                </p>
                <span className="flex items-center gap-1 text-[11px] font-medium mt-0.5 text-[var(--accent-success)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-success)] animate-pulse" />
                  VNRPool rides active
                </span>
              </div>
            </div>

            {/* Top Navigation Eradicated as per Strict Mobile-First Directive */}
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBlockedModal(true)}
              className="p-2 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
              title="Blocked Users"
            >
              <UserX className="w-5 h-5" />
            </button>
            <div className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <ThemeToggle />
            </div>
            <div className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <NotificationBell userId={userId} />
            </div>
            <button
              onClick={onSignOut}
              className="p-2 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl transition-colors text-[var(--accent-danger)] hover:bg-[var(--accent-danger)]/10"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 relative z-10 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full"
          >
            {activeTab === "find" && (
              <FindRideFeed userId={userId} onVehicleSelect={setSelectedVehicle} />
            )}
            {activeTab === "offer" && (
              <OfferSeatForm userId={userId} onVehicleSelect={setSelectedVehicle} />
            )}
            {activeTab === "my-rides" && (
              <MyRides userId={userId} onVehicleSelect={setSelectedVehicle} />
            )}
            {activeTab === "profile" && (
              <Profile userId={userId} />
            )}
            {activeTab === "active" && (
              <ActiveRideView userId={userId} onVehicleSelect={setSelectedVehicle} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ─── Fixed Bottom Navigation Bar (Global) ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bottom-nav pb-safe border-t border-[var(--border-subtle)] bg-[var(--bg-nav)] shadow-[0_-4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        <div className="max-w-2xl mx-auto px-2">
          <div className="flex items-stretch h-[64px]">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              const isLiveTrip = tab.id === "active";

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors duration-150 py-2 rounded-xl mx-0.5 min-h-[48px]",
                    isActive
                      ? "text-[var(--accent-primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {/* Pulse for live trip */}
                  {isLiveTrip && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--accent-warning)] rounded-full animate-pulse" />
                  )}

                  <span className="relative z-10 flex flex-col items-center gap-1">
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium tracking-wide leading-none">
                      {tab.label}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {showBlockedModal && (
        <BlockedUsersModal userId={userId} onClose={() => setShowBlockedModal(false)} />
      )}

      <AIChatBot />
    </div>
  );
}
