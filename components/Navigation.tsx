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
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-[#0F172A]/80 border-b border-gray-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <img src="/vnr_logo.png" alt="VNR Logo" className="w-8 h-8 rounded shadow-sm" />
            <span className="font-extrabold text-xl tracking-tight text-[#0F172A] dark:text-white">
              VNR<span className="text-[#2563EB] dark:text-[#3B82F6]">-Pool</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex space-x-1">
            {hasActiveTrip ? (
              <button
                onClick={() => setActiveTab("active")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-100/50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 relative overflow-hidden group`}
              >
                <span className="animate-pulse">🚗</span> Ride in Progress
                <span className="absolute inset-0 bg-blue-500/10 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-lg"></span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab("find")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "find"
                      ? "bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/20 dark:text-[#3B82F6]"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <Search className="w-4 h-4" /> Find a Ride
                </button>
                <button
                  onClick={() => setActiveTab("offer")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "offer"
                      ? "bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/20 dark:text-[#3B82F6]"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <PlusCircle className="w-4 h-4" /> Offer a Ride
                </button>
              </>
            )}
            <button
              onClick={() => setActiveTab("my-rides")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "my-rides"
                  ? "bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/20 dark:text-[#3B82F6]"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <Bookmark className="w-4 h-4" /> My Rides
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3 relative">
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#10B981] rounded-full border-2 border-white dark:border-[#0F172A]"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-12 right-0 w-80 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-[#0F172A] dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-[#2563EB] dark:text-[#3B82F6] font-medium hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
                    {notifications?.length === 0 ? (
                      <div className="p-8 text-center flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                          <Bell className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">You're all caught up!</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">No new notifications.</p>
                      </div>
                    ) : (
                      notifications?.map((notification) => (
                        <div 
                          key={notification.id} 
                          onClick={() => !notification.is_read && markAsRead(notification.id)}
                          className={`p-4 transition-colors cursor-pointer flex gap-3 ${
                            notification.is_read 
                              ? 'bg-white dark:bg-[#1E293B] opacity-75' 
                              : 'bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                          }`}
                        >
                          <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            notification.is_read 
                              ? 'bg-slate-100 dark:bg-slate-800' 
                              : 'bg-white dark:bg-[#0F172A] shadow-sm border border-slate-100 dark:border-slate-700'
                          }`}>
                            {notification.type === 'booking_request' ? <User className="w-5 h-5 text-blue-500" /> :
                             notification.type === 'booking_approved' ? <Check className="w-5 h-5 text-emerald-500" /> :
                             notification.type === 'ride_reminder' ? <Car className="w-5 h-5 text-yellow-500" /> :
                             <Bell className="w-5 h-5 text-slate-500" />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm font-semibold truncate ${
                                notification.is_read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'
                              }`}>
                                {notification.title}
                              </h4>
                            </div>
                            <p className={`text-xs line-clamp-2 ${
                              notification.is_read ? 'text-slate-500' : 'text-slate-600 dark:text-slate-300 font-medium'
                            }`}>
                              {notification.message}
                            </p>
                            <p className="text-[10px] font-medium text-slate-400 mt-1.5">
                              {new Date(notification.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                          
                          {!notification.is_read && (
                            <div className="shrink-0 flex items-center">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
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
            <div className="relative">
              <button 
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 dark:focus:ring-offset-[#0F172A]"
              >
                <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm shadow-inner overflow-hidden relative">
                  {userProfile?.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    userProfile?.full_name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-12 right-0 w-64 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-white/5 flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-2xl shadow-inner mb-3 overflow-hidden relative">
                        {userProfile?.avatar_url ? (
                          <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          userProfile?.full_name?.charAt(0).toUpperCase() || <User className="w-8 h-8" />
                        )}
                      </div>
                      <h3 className="font-bold text-[#0F172A] dark:text-white truncate w-full px-2">{userProfile?.full_name || "Loading..."}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{userProfile?.roll_no}</p>
                    </div>

                    <div className="p-2 space-y-1">
                      <button 
                        onClick={() => { setActiveTab("profile"); setShowProfileMenu(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left"
                      >
                        <Settings className="w-4 h-4 text-slate-400" /> Edit Profile & Photo
                      </button>
                      <button 
                        onClick={() => { setActiveTab("profile"); setShowProfileMenu(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left"
                      >
                        <Car className="w-4 h-4 text-slate-400" /> Vehicle Details
                      </button>
                      
                      {mounted && (
                        <button 
                          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left"
                        >
                          {theme === "dark" ? <Sun className="w-4 h-4 text-slate-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
                          {theme === "dark" ? "Light Mode" : "Dark Mode"}
                        </button>
                      )}
                    </div>
                    
                    <div className="p-2 border-t border-gray-100 dark:border-white/5">
                      <button 
                        onClick={() => { onSignOut(); setShowProfileMenu(false); }} 
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
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

      {/* Mobile Nav Links (Below Header) */}
      <div className="md:hidden flex border-t border-gray-200 dark:border-white/10 bg-white/50 dark:bg-[#0F172A]/50 backdrop-blur-md px-2 py-2 gap-2">
        {hasActiveTrip ? (
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 flex justify-center items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-100/50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 relative overflow-hidden group`}
          >
            <span className="animate-pulse">🚗</span> Ride in Progress
            <span className="absolute inset-0 bg-blue-500/10 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-lg"></span>
          </button>
        ) : (
          <>
            <button
              onClick={() => setActiveTab("find")}
              className={`flex-1 flex justify-center items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "find"
                  ? "bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/20 dark:text-[#3B82F6]"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <Search className="w-4 h-4" /> Find
            </button>
            <button
              onClick={() => setActiveTab("offer")}
              className={`flex-1 flex justify-center items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "offer"
                  ? "bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/20 dark:text-[#3B82F6]"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <PlusCircle className="w-4 h-4" /> Offer
            </button>
          </>
        )}
        <button
          onClick={() => setActiveTab("my-rides")}
          className={`flex-1 flex justify-center items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "my-rides"
              ? "bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/20 dark:text-[#3B82F6]"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
          }`}
        >
          <Bookmark className="w-4 h-4" /> My Rides
        </button>
      </div>
    </header>
  );
}
