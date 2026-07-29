"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Bell, User, Search, PlusCircle, Bookmark, Check, ChevronDown, Settings, Car, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface NavigationProps {
  userId: string;
  onSignOut: () => void;
  activeTab: "find" | "offer" | "my-rides" | "profile" | "active";
  setActiveTab: (tab: "find" | "offer" | "my-rides" | "profile" | "active") => void;
  hasActiveTrip?: boolean;
}

export default function Navigation({ userId, onSignOut, activeTab, setActiveTab, hasActiveTrip }: NavigationProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: userProfile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
      if (error) throw error;
      return data;
    }
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000 // Poll every 5 seconds as fallback
  });

  useEffect(() => {
    const channel = supabase
      .channel('realtime:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          toast.success(payload.new.message, {
            duration: 8000,
            icon: '🔔',
          });
          queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, supabase]);

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
  };

  const markAllAsRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
    queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    setShowNotifications(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[var(--bg-nav)] shadow-sm border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <img src="/vnr_logo.png" alt="VNR Logo" className="w-8 h-8 rounded shadow-sm bg-white" />
              <span className="font-extrabold text-xl tracking-tight text-[var(--text-primary)]">
                VNR<span className="text-[var(--accent-primary)]">-Pool</span>
              </span>
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex space-x-2">
              {hasActiveTrip ? (
                <button
                  onClick={() => setActiveTab("active")}
                  className={`flex items-center gap-2 px-4 py-2 min-h-[48px] rounded-lg text-sm font-medium transition-colors bg-[var(--accent-warning)]/10 text-[var(--accent-warning)] relative overflow-hidden`}
                >
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-warning)] animate-pulse" /> Ride in Progress
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab("find")}
                    className={`flex items-center gap-2 px-4 py-2 min-h-[48px] rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "find"
                        ? "bg-[#1D9E75]/20 text-[#1D9E75]"
                        : "text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <Search className="w-4 h-4" /> Find a Ride
                  </button>
                  <button
                    onClick={() => setActiveTab("offer")}
                    className={`flex items-center gap-2 px-4 py-2 min-h-[48px] rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "offer"
                        ? "bg-[#1D9E75]/20 text-[#1D9E75]"
                        : "text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" /> Offer a Ride
                  </button>
                </>
              )}
              <button
                onClick={() => setActiveTab("my-rides")}
                className={`flex items-center gap-2 px-4 py-2 min-h-[48px] rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "my-rides"
                    ? "bg-[#1D9E75]/20 text-[#1D9E75]"
                    : "text-slate-300 hover:bg-white/10"
                }`}
              >
                <Bookmark className="w-4 h-4" /> My Rides
              </button>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3 relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
                className="p-2 min-h-[48px] min-w-[48px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                   <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[var(--accent-primary)] rounded-full border-2 border-[var(--bg-nav)]"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-14 right-0 w-80 bg-[#FFFFFF] dark:bg-[#122926] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden z-50 text-[#0B1F1C] dark:text-[#F5F5F0]"
                  >
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <h3 className="font-bold">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-[#1D9E75] font-medium hover:underline">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications?.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                            <Bell className="w-6 h-6 text-slate-400" />
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 font-medium">You're all caught up!</p>
                        </div>
                      ) : (
                        notifications?.map((notification) => (
                          <div 
                            key={notification.id} 
                            onClick={() => !notification.is_read && markAsRead(notification.id)}
                            className={`p-4 transition-colors cursor-pointer flex gap-3 ${
                              notification.is_read 
                                ? 'bg-white dark:bg-[#122926] opacity-75' 
                                : 'bg-[#1D9E75]/5 hover:bg-[#1D9E75]/10'
                            }`}
                          >
                            <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                              {notification.type === 'booking_request' ? <User className="w-5 h-5 text-[#1D9E75]" /> :
                               notification.type === 'booking_approved' ? <Check className="w-5 h-5 text-[#639922]" /> :
                               notification.type === 'ride_reminder' ? <Car className="w-5 h-5 text-[#EF9F27]" /> :
                               <Bell className="w-5 h-5 text-slate-500" />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-sm font-semibold truncate ${notification.is_read ? 'text-slate-600 dark:text-slate-400' : 'text-[#0B1F1C] dark:text-white'}`}>
                                {notification.title}
                              </h4>
                              <p className={`text-xs line-clamp-2 ${notification.is_read ? 'text-slate-500' : 'text-slate-600 dark:text-slate-300 font-medium'}`}>
                                {notification.message}
                              </p>
                              <p className="text-[10px] font-medium text-slate-400 mt-1.5">
                                {new Date(notification.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                            
                            {!notification.is_read && (
                              <div className="shrink-0 flex items-center">
                                <div className="w-2 h-2 rounded-full bg-[#1D9E75]"></div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Profile Dropdown */}
              <div className="relative hidden md:block">
                <button 
                  onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                  className="flex items-center gap-2 p-1 pl-2 pr-3 min-h-[48px] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--text-secondary)] text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                    {userProfile?.avatar_url ? (
                      <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      userProfile?.full_name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-300" />
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-14 right-0 w-64 bg-[#FFFFFF] dark:bg-[#122926] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden z-50 text-[#0B1F1C] dark:text-[#F5F5F0]"
                    >
                      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-[#1D9E75]/10 text-[#1D9E75] flex items-center justify-center font-black text-2xl mb-3 overflow-hidden">
                          {userProfile?.avatar_url ? (
                            <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            userProfile?.full_name?.charAt(0).toUpperCase() || <User className="w-8 h-8" />
                          )}
                        </div>
                        <h3 className="font-bold truncate w-full px-2">{userProfile?.full_name || "Loading..."}</h3>
                        <p className="text-xs text-slate-500 mt-1">{userProfile?.roll_no}</p>
                      </div>

                      <div className="p-2 space-y-1">
                        <button 
                          onClick={() => { setActiveTab("profile"); setShowProfileMenu(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-[#1A3632] rounded-lg transition-colors text-left"
                        >
                          <Settings className="w-4 h-4 text-slate-400" /> Edit Profile & Photo
                        </button>
                        <button 
                          onClick={() => { setActiveTab("profile"); setShowProfileMenu(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-[#1A3632] rounded-lg transition-colors text-left"
                        >
                          <Car className="w-4 h-4 text-slate-400" /> Vehicle Details
                        </button>
                        
                        {mounted && (
                          <button 
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-[#1A3632] rounded-lg transition-colors text-left"
                          >
                            {theme === "dark" ? <Sun className="w-4 h-4 text-slate-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
                            {theme === "dark" ? "Light Mode" : "Dark Mode"}
                          </button>
                        )}
                      </div>
                      
                      <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                        <button 
                          onClick={() => { onSignOut(); setShowProfileMenu(false); }} 
                          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold text-[#E24B4A] hover:bg-[#E24B4A]/10 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav Links (Fixed Bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex bottom-nav px-2 py-2 gap-2 pb-safe">
        <button
          onClick={() => setActiveTab("find")}
          className={`flex-1 flex flex-col justify-center items-center gap-1 min-h-[48px] rounded-xl text-[10px] font-medium transition-colors ${
            activeTab === "find" ? "text-[var(--accent-primary)]" : "text-[var(--text-secondary)]"
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Find</span>
        </button>
        <button
          onClick={() => setActiveTab("offer")}
          className={`flex-1 flex flex-col justify-center items-center gap-1 min-h-[48px] rounded-xl text-[10px] font-medium transition-colors ${
            activeTab === "offer" ? "text-[var(--accent-primary)]" : "text-[var(--text-secondary)]"
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          <span>Offer</span>
        </button>
        <button
          onClick={() => setActiveTab("my-rides")}
          className={`flex-1 flex flex-col justify-center items-center gap-1 min-h-[48px] rounded-xl text-[10px] font-medium transition-colors ${
            activeTab === "my-rides" ? "text-[var(--accent-primary)]" : "text-[var(--text-secondary)]"
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span>Bookings</span>
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 flex flex-col justify-center items-center gap-1 min-h-[48px] rounded-xl text-[10px] font-medium transition-colors ${
            activeTab === "profile" ? "text-[var(--accent-primary)]" : "text-[var(--text-secondary)]"
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </button>
      </div>
      
      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-16 w-full"></div>
    </>
  );
}
