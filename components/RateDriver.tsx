"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

export default function RateDriver({ rideId, driverId, userId }: { rideId: string, driverId: string, userId: string }) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: existingRating, isLoading } = useQuery({
    queryKey: ["rating", rideId, userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('ratings')
        .select('*')
        .eq('ride_id', rideId)
        .eq('rater_id', userId)
        .single();
      return data;
    }
  });

  const rateMutation = useMutation({
    mutationFn: async (score: number) => {
      // 1. Insert Rating
      const { error: ratingError } = await supabase.from('ratings').insert({
        ride_id: rideId,
        rater_id: userId,
        rated_id: driverId,
        score
      });
      if (ratingError) throw ratingError;

      // 2. Fetch driver's current stats
      const { data: driver, error: driverError } = await supabase
        .from('users')
        .select('rating_sum, rating_count')
        .eq('id', driverId)
        .single();
      if (driverError) throw driverError;

      // 3. Update driver stats
      const { error: updateError } = await supabase
        .from('users')
        .update({
          rating_sum: (driver?.rating_sum || 0) + score,
          rating_count: (driver?.rating_count || 0) + 1
        })
        .eq('id', driverId);
      
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast.success("Thanks for rating!");
      queryClient.invalidateQueries({ queryKey: ["rating", rideId, userId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit rating.");
    }
  });

  if (isLoading) return null;

  if (existingRating) {
    return (
      <div className="flex items-center gap-2 mt-4 p-4 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-100 dark:border-green-500/20">
        <div className="flex text-green-500">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className={`w-5 h-5 ${star <= existingRating.score ? 'fill-current' : 'opacity-30'}`} />
          ))}
        </div>
        <span className="text-sm font-semibold text-green-700 dark:text-green-400">You rated this ride!</span>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
      <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Rate your driver</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={rateMutation.isPending}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => rateMutation.mutate(star)}
            className={`p-1 transition-colors ${rateMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Star 
              className={`w-8 h-8 transition-all ${
                hoveredStar >= star 
                  ? 'fill-yellow-400 text-yellow-400 scale-110' 
                  : 'text-gray-300 dark:text-gray-600 hover:text-yellow-200'
              }`} 
            />
          </button>
        ))}
        {rateMutation.isPending && <Loader2 className="w-5 h-5 animate-spin text-[#2563EB] ml-2" />}
      </div>
    </div>
  );
}
