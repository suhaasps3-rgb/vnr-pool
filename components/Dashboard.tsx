"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Car, CalendarCheck, User, Activity,
  UserX, LogOut, Zap, Phone, Mail, X, ChevronRight, Settings, Plus, List
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
  { id: "find", label: "Search", icon: Search },
  { id: "offer", label: "Offer", icon: Plus },
  { id: "my-rides", label: "Rides", icon: List },
];

export default function Dashboard({ onSignOut, userId }: { onSignOut: () => void; userId: string }) {
  const [activeTab, setActiveTab] = useState<TabType>("find");
  const [selectedVehicle, setSelectedVehicle] = useState<"car" | "auto" | "bike">("car");
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
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
            <button 
              onClick={() => setShowMenu(true)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
            >
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                  {firstName.charAt(0).toUpperCase()}
                </span>
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
            </button>

            {/* Top Navigation Eradicated as per Strict Mobile-First Directive */}
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            <div className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <NotificationBell userId={userId} />
            </div>
          </div>
        </div>
      </header>

      {/* ─── Side Menu (Profile Drawer) ─── */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-[#111111] z-[70] shadow-2xl flex flex-col border-r border-gray-200 dark:border-white/10"
            >
              <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menu</h2>
                <button 
                  onClick={() => setShowMenu(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">
                      {firstName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{userProfile?.full_name || 'VNRian'}</h3>
                    <p className="text-sm text-yellow-500 font-medium flex items-center gap-1">
                      ⭐ Member
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                <div className="px-4 space-y-1">
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
                        <Zap className="w-5 h-5" />
                      </div>
                      Theme
                    </div>
                    <ThemeToggle />
                  </div>

                  <button 
                    onClick={() => {
                      setActiveTab("profile");
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium">
                      <div className="p-2 bg-slate-100 dark:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400">
                        <User className="w-5 h-5" />
                      </div>
                      Edit Profile
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  <button 
                    onClick={() => {
                      setShowBlockedModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium">
                      <div className="p-2 bg-slate-100 dark:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400">
                        <UserX className="w-5 h-5" />
                      </div>
                      Blocked Users
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-white/5">
                <button 
                  onClick={onSignOut}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors text-red-600 dark:text-red-400 font-bold"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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

        {/* Polished Support Footer */}
        <footer className="mt-16 mb-8 w-full">
          <div className="bg-slate-50/50 dark:bg-white/[0.02] border-t border-[var(--border-subtle)] px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-10 rounded-3xl shadow-sm">
            {/* Left Side: Brand */}
            <div className="text-center md:text-left max-w-sm">
              <h2 className="text-2xl font-black text-[var(--accent-primary)] mb-2 tracking-tight">VNR Pool</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                Exclusive ride-sharing platform for VNR VJIET students.
              </p>
            </div>

            {/* Right Side: Contact Pills */}
            <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Support</span>
              
              <a href="tel:+919949953311" className="flex items-center justify-center md:justify-start gap-3 px-6 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/10 rounded-full transition-all text-sm font-bold text-slate-700 dark:text-slate-300 w-full md:w-auto min-w-[280px]">
                <Phone className="w-4 h-4 text-blue-500" />
                +91 99499 53311
              </a>

              <a href="mailto:support.vnrpool2@gmail.com" className="flex items-center justify-center md:justify-start gap-3 px-6 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/10 rounded-full transition-all text-sm font-bold text-slate-700 dark:text-slate-300 w-full md:w-auto min-w-[280px]">
                <Mail className="w-4 h-4 text-blue-500" />
                support.vnrpool2@gmail.com
              </a>
            </div>
          </div>
          
          <div className="text-center pt-8 pb-20 text-xs font-semibold text-slate-400 dark:text-slate-500 border-t border-[var(--border-subtle)]/50 mt-4 mx-6">
            Made with ❤️ for VNR VJIET
          </div>
        </footer>
      </main>

      {/* ─── Fixed Bottom Navigation Bar (Global) ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bottom-nav pb-safe border-t border-[var(--border-subtle)] bg-[var(--bg-nav)] shadow-[0_-4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        <div className="max-w-2xl mx-auto px-2">
          <div className="flex items-stretch h-[64px]">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              const isLiveTrip = tab.id === "active";

              if (tab.id === "offer") {
                return (
                  <div key={tab.id} className="flex-1 flex flex-col items-center justify-center relative">
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className="absolute -top-5 bg-white dark:bg-[#1f1f1f] w-14 h-14 rounded-full flex items-center justify-center shadow-[0_-2px_15px_rgba(0,0,0,0.08)] dark:shadow-[0_-2px_15px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-white/5 transition-transform hover:scale-105 active:scale-95"
                    >
                      <Icon className={cn("w-7 h-7", isActive ? "text-[var(--accent-primary)]" : "text-slate-500 dark:text-slate-400")} />
                    </button>
                    <span className={cn("absolute bottom-2 text-[11px] font-semibold tracking-wide leading-none", isActive ? "text-[var(--accent-primary)]" : "text-[var(--text-secondary)]")}>
                      {tab.label}
                    </span>
                  </div>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors duration-150 py-2 rounded-xl mx-0.5 min-h-[64px]",
                    isActive
                      ? "text-[var(--accent-primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {/* Pulse for live trip */}
                  {isLiveTrip && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--accent-warning)] rounded-full animate-pulse" />
                  )}

                  <span className="relative z-10 flex flex-col items-center gap-1.5 mt-2">
                    <Icon className="w-6 h-6" />
                    <span className="text-[11px] font-semibold tracking-wide leading-none">
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
