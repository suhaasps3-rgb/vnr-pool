"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Send, ShieldAlert, Loader2 } from "lucide-react";
import anime from "animejs";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatModal({ rideId, userId, onClose }: { rideId: string, userId: string, onClose: () => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  
  const notifyUser = async (targetUserId: string, title: string, message: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ targetUserId, title, message })
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase.channel('realtime:messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `ride_id=eq.${rideId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        // Trigger elastic bounce for the new message
        setTimeout(() => {
          anime({
            targets: `.msg-${payload.new.id}`,
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 600,
            easing: 'easeOutElastic(1, .5)'
          });
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [rideId]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('ride_id', rideId)
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data);
    setLoading(false);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView();
    }, 100);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const text = inputText;
    setInputText("");

    const { error } = await supabase.from('messages').insert({
      ride_id: rideId,
      sender_id: userId,
      text: text
    });

    if (error) {
      toast.error("Failed to send message");
      return;
    }

    // Notify other ride participants
    const { data: rideData } = await supabase
      .from('rides')
      .select('driver_id, bookings(passenger_id, status)')
      .eq('id', rideId)
      .single();

    if (rideData) {
      const participants = new Set<string>();
      participants.add(rideData.driver_id);
      rideData.bookings.forEach((b: any) => {
        if (b.status === 'approved') participants.add(b.passenger_id);
      });
      participants.delete(userId); // Don't notify sender

      const { data: userData } = await supabase.from('users').select('full_name').eq('id', userId).single();
      const senderName = userData?.full_name || 'Someone';

      const notifications = Array.from(participants).map(pid => ({
        user_id: pid,
        title: `Message from ${senderName}`,
        message: `New message from ${senderName}: "${text.length > 30 ? text.substring(0,30)+'...' : text}"`,
        type: "chat_message"
      }));

      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications);
        
        for (const pid of participants) {
          notifyUser(pid, `Message from ${senderName}`, `"${text.length > 30 ? text.substring(0,30)+'...' : text}"`);
        }
      }
    }
  };

  const handleBlockUser = async (targetUserId: string) => {
    if (targetUserId === userId) return;
    if (confirm("Are you sure you want to block this user? You won't see their rides anymore.")) {
      const { error } = await supabase.from('blocked_users').insert({
        blocker_id: userId,
        blocked_id: targetUserId
      });
      if (error) toast.error("Failed to block user");
      else {
        toast.success("User blocked. Closing chat.");
        onClose();
        window.location.reload();
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#0B1F1C]/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-[var(--bg-surface)] w-full max-w-lg h-[600px] max-h-[90vh] flex flex-col overflow-hidden rounded-2xl shadow-xl border border-[var(--border-subtle)]"
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-slate-50 dark:bg-[var(--bg-primary)]">
              <h3 className="font-bold text-[var(--text-primary)]">Ride Chat</h3>
              <button onClick={onClose} className="p-2 hover:bg-[var(--bg-surface-hover)] rounded-full transition-colors">
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-slate-500 h-full flex items-center justify-center">
                  No messages yet. Start the conversation!
                </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === userId;
                return (
                  <div key={msg.id} className={`msg-${msg.id} flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">User</span>
                        <button 
                          onClick={() => handleBlockUser(msg.sender_id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Block User"
                        >
                          <ShieldAlert className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                        isMe 
                          ? 'bg-[var(--accent-primary)] text-white rounded-br-none' 
                          : 'bg-slate-100 dark:bg-[var(--bg-primary)] text-[var(--text-primary)] dark:text-slate-200 rounded-bl-none border border-[var(--border-subtle)]'
                      }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-slate-50 dark:bg-[var(--bg-primary)] border-t border-[var(--border-subtle)] flex gap-2">
              <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="bg-[var(--accent-primary)] hover:bg-[#178361] p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
