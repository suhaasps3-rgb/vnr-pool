"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Bell, User, Search, PlusCircle, Bookmark, Check } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface NavigationProps {
  userId: string;
  onSignOut: () => void;
  activeTab: "find" | "offer" | "my-rides" | "profile";
  setActiveTab: (tab: "find" | "offer" | "my-rides" | "profile") => void;
}

export default function Navigation({ userId, onSignOut, activeTab, setActiveTab }: NavigationProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const supabase = createClient();
  const queryClient = useQueryClient();

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
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "profile"
                  ? "bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/20 dark:text-[#3B82F6]"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <User className="w-4 h-4" /> Profile
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
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
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications?.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        No new notifications.
                      </div>
                    ) : (
                      notifications?.map((notification) => (
                        <div 
                          key={notification.id} 
                          onClick={() => !notification.is_read && markAsRead(notification.id)}
                          className={`p-4 border-b border-gray-50 dark:border-white/5 last:border-0 cursor-pointer transition-colors ${notification.is_read ? 'opacity-60' : 'bg-[#2563EB]/5 dark:bg-[#3B82F6]/5 hover:bg-[#2563EB]/10 dark:hover:bg-[#3B82F6]/10'}`}
                        >
                          <div className="flex gap-3">
                            <div className="mt-0.5">
                              {notification.is_read ? (
                                <Check className="w-4 h-4 text-slate-400" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-[#3B82F6] mt-1.5" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-[#0F172A] dark:text-slate-200 leading-snug">{notification.message}</p>
                              <p className="text-xs text-slate-400 mt-1">{new Date(notification.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <ThemeToggle />
            <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-2 hidden sm:block"></div>
            <button onClick={onSignOut} className="hidden sm:flex items-center gap-2 p-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
            
            {/* Mobile Profile Avatar */}
            <button 
              onClick={() => setActiveTab("profile")}
              className={`sm:hidden p-2 rounded-full transition-colors ${
                activeTab === "profile" 
                  ? "bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/20 dark:text-[#3B82F6]" 
                  : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300"
              }`}
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Links (Below Header) */}
      <div className="md:hidden flex border-t border-gray-200 dark:border-white/10 bg-white/50 dark:bg-[#0F172A]/50 backdrop-blur-md px-2 py-2 gap-2">
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
