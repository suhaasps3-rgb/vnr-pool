"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function useRideReminders() {
  useEffect(() => {
    const supabase = createClient();
    let interval: NodeJS.Timeout;

    const checkReminders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's upcoming approved bookings or drives
      const now = new Date();
      const in30Mins = new Date(now.getTime() + 30 * 60000);
      
      const { data: rides, error } = await supabase
        .from('rides')
        .select(`
          id, 
          destination, 
          departure_time, 
          status,
          driver_id,
          bookings!inner(passenger_id, status)
        `)
        .eq('status', 'active')
        .gte('departure_time', now.toISOString())
        .lte('departure_time', in30Mins.toISOString());

      if (error || !rides) return;

      rides.forEach(ride => {
        const isDriver = ride.driver_id === user.id;
        const isApprovedPassenger = ride.bookings.some(
          b => b.passenger_id === user.id && b.status === 'approved'
        );

        if (isDriver || isApprovedPassenger) {
          const departure = new Date(ride.departure_time);
          const diffMins = Math.round((departure.getTime() - now.getTime()) / 60000);

          // Trigger notifications at exactly 30 mins or 15 mins
          if (diffMins === 30 || diffMins === 15) {
            toast.info(`Upcoming Ride to ${ride.destination}`, {
              description: `Leaves in ${diffMins} minutes!`,
              duration: 5000,
            });

            // Native Browser push if supported and granted
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(`Ride in ${diffMins} mins!`, {
                body: `Your ride to ${ride.destination} departs soon.`,
                icon: "/icon.png"
              });
            }
          }
        }
      });
    };

    // Request notification permissions
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Check immediately, then every 1 minute
    checkReminders();
    interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, []);
}
