"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export default function NotificationBell({ userId }: { userId: string }) {
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
    <div className="relative">
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors relative group"
      >
        <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950"></span>
        )}
      </button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-12 right-0 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-indigo-400 font-medium hover:text-indigo-300">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              {notifications?.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  No new notifications.
                </div>
              ) : (
                notifications?.map((notification) => (
                  <div 
                    key={notification.id} 
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                    className={`p-4 border-b border-slate-800/50 last:border-0 cursor-pointer transition-colors ${notification.is_read ? 'opacity-50' : 'bg-indigo-500/5 hover:bg-indigo-500/10'}`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        {notification.is_read ? (
                          <Check className="w-4 h-4 text-slate-500" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-slate-200 leading-snug">{notification.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(notification.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
