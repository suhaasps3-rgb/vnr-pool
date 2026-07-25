"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Car, UserPlus, XCircle, Info, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

export default function NotificationBell({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: notifications = [], refetch } = useQuery({
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
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Optimistic update
    queryClient.setQueryData(["notifications", userId], (old: any) => 
      old?.map((n: any) => n.id === id ? { ...n, is_read: true } : n) || []
    );

    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    queryClient.setQueryData(["notifications", userId], (old: any) => 
      old?.map((n: any) => ({ ...n, is_read: true })) || []
    );

    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking_request': return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'booking_approved': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'booking_rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'ride_reminder': return <Car className="w-5 h-5 text-yellow-500" />;
      default: return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group"
      >
        <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-950" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900 rounded-2xl shadow-2xl shadow-black/50 border border-slate-800 z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
              <h3 className="font-bold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                    <Bell className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-300 font-medium">You're all caught up!</p>
                  <p className="text-xs text-slate-500 mt-1">No new notifications.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/50">
                  {notifications.map((notification: any) => (
                    <div 
                      key={notification.id} 
                      onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                      className={`p-4 transition-colors cursor-pointer flex gap-3 ${
                        notification.is_read 
                          ? 'bg-slate-900 opacity-60' 
                          : 'bg-indigo-500/10 hover:bg-indigo-500/20'
                      }`}
                    >
                      <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        notification.is_read 
                          ? 'bg-slate-800' 
                          : 'bg-slate-900 shadow-sm border border-slate-700'
                      }`}>
                        {getIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm font-semibold truncate ${
                            notification.is_read ? 'text-slate-300' : 'text-white'
                          }`}>
                            {notification.title}
                          </h4>
                          <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap ml-2">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className={`text-xs line-clamp-2 ${
                          notification.is_read ? 'text-slate-400' : 'text-slate-300 font-medium'
                        }`}>
                          {notification.message}
                        </p>
                      </div>
                      
                      {!notification.is_read && (
                        <div className="shrink-0 flex items-center">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
