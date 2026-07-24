"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { X, Unlock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function BlockedUsersModal({ userId, onClose }: { userId: string, onClose: () => void }) {
  const supabase = createClient();

  const { data: blockedUsers, isLoading, refetch } = useQuery({
    queryKey: ["blocked_users", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blocked_users')
        .select(`
          blocked_id,
          blocked:users!blocked_id(full_name, branch, roll_no)
        `)
        .eq('blocker_id', userId);
      
      if (error) throw error;
      return data;
    }
  });

  const handleUnblock = async (blockedId: string) => {
    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', userId)
        .eq('blocked_id', blockedId);
        
      if (error) throw error;
      toast.success("User unblocked successfully.");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to unblock user.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, y: 10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="ui-card w-full max-w-md p-6 max-h-[80vh] flex flex-col"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Blocked Users</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : blockedUsers?.length === 0 ? (
            <div className="text-center p-8 text-gray-500 dark:text-gray-400">
              You haven't blocked any users.
            </div>
          ) : (
            blockedUsers?.map((block: any) => (
              <div key={block.blocked_id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{block.blocked?.full_name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{block.blocked?.roll_no} • {block.blocked?.branch}</p>
                </div>
                <button
                  onClick={() => handleUnblock(block.blocked_id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Unlock className="w-4 h-4" /> Unblock
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
