"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import anime from "animejs";
import { toast } from "sonner";
import { MessageCircle, Shield, Loader2, MapPin, Clock, User, Ban, Trash2 } from "lucide-react";
import ChatModal from "./ChatModal";

export default function FindRideFeed({ userId, onVehicleSelect }: { userId: string, onVehicleSelect: (v: "car" | "auto" | "bike") => void }) {
  const [rideCategory, setRideCategory] = useState<"auto_split" | "personal_vehicle" | "all">("all");
  const [womenOnly, setWomenOnly] = useState(false);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
  const [userGender, setUserGender] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.from('users').select('gender').eq('id', userId).single().then(({ data }) => {
      if (data) setUserGender(data.gender);
    });
  }, [userId, supabase]);

  const { data: rides, isLoading, refetch } = useQuery({
    queryKey: ["rides", rideCategory, womenOnly],
    queryFn: async () => {
      let query = supabase.from('rides').select(`
        *,
        driver:users!driver_id(full_name, mobile_number, gender, branch, roll_no),
        bookings(id, passenger_id, status, passenger:users!passenger_id(full_name, gender, roll_no))
      `).eq('status', 'active');

      if (rideCategory !== "all") {
        query = query.eq('ride_category', rideCategory);
      }
      if (womenOnly) {
        query = query.eq('is_women_only', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Stagger animation on data load
  useEffect(() => {
    if (!isLoading && rides && rides.length > 0 && containerRef.current) {
      anime({
        targets: '.ride-card',
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(100, { start: 100 }),
        easing: 'easeOutQuint',
        duration: 800
      });
    }
  }, [rides, isLoading]);

  const handleRequestSeat = async (rideId: string) => {
    try {
      const { error } = await supabase.from('bookings').insert({
        ride_id: rideId,
        passenger_id: userId,
        status: 'pending'
      });
      if (error) throw error;
      toast.success("Seat requested! Waiting for driver approval.");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to request seat.");
    }
  };

  const handleManageRequest = async (bookingId: string, status: 'approved' | 'rejected', rideId: string, availableSeats: number) => {
    try {
      const { error: bookingError } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
      if (bookingError) throw bookingError;

      if (status === 'approved') {
        const { error: rideError } = await supabase.from('rides').update({ available_seats: availableSeats - 1 }).eq('id', rideId);
        if (rideError) throw rideError;
      }
      toast.success(`Request ${status}!`);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to manage request.");
    }
  };

  const handleDeleteRide = async (rideId: string) => {
    if (!confirm("Are you sure you want to cancel and remove this ride?")) return;
    try {
      // Perform a soft-delete by updating status to 'cancelled' 
      // since RLS policies don't permit hard deletes by default.
      const { data, error } = await supabase.from('rides').update({ status: 'cancelled' }).eq('id', rideId).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Could not cancel the ride. It may have already been removed or you don't have permission.");
      }
      toast.success("Ride removed successfully.");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove ride.");
    }
  };

  const handleBlockUser = async (driverId: string, driverName: string) => {
    if (!confirm(`Are you sure you want to block ${driverName}? You will no longer see their rides.`)) return;
    try {
      const { error } = await supabase.from('blocked_users').insert({
        blocker_id: userId,
        blocked_id: driverId
      });
      if (error) throw error;
      toast.success(`${driverName} blocked successfully.`);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to block user.");
    }
  };

  const maskMobile = (mobile: string, isApproved: boolean) => {
    if (isApproved) return mobile;
    return `+91 ${mobile.slice(0, 2)}XXX X${mobile.slice(-4)}`;
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select 
          className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
          value={rideCategory}
          onChange={(e) => setRideCategory(e.target.value as any)}
        >
          <option value="all">All Ride Types</option>
          <option value="auto_split">Auto/Cab Fare Split</option>
          <option value="personal_vehicle">Student Vehicle Pool</option>
        </select>

        {userGender === 'female' && (
          <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-gray-900 dark:text-white transition-colors">
            <input 
              type="checkbox"
              checked={womenOnly}
              onChange={(e) => setWomenOnly(e.target.checked)}
              className="accent-pink-500"
            />
            <span className="text-sm font-medium">Women-Only Rides</span>
          </label>
        )}
      </div>

      {/* Feed */}
      <div ref={containerRef} className="space-y-4">
        {isLoading ? (
          // Skeleton Loaders
          [...Array(3)].map((_, i) => (
            <div key={i} className="glass-card h-32 animate-pulse" />
          ))
        ) : rides?.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            No rides found for the selected filters.
          </div>
        ) : (
          rides?.map((ride) => {
            const isApproved = ride.bookings.some((b: any) => b.passenger_id === userId && b.status === 'approved');
            const hasRequested = ride.bookings.some((b: any) => b.passenger_id === userId);

            return (
              <div 
                key={ride.id} 
                onMouseEnter={() => onVehicleSelect(ride.vehicle_type as "car" | "auto" | "bike")}
                className="ride-card opacity-0 ui-card ui-card-hover p-5 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                  {ride.driver_id === userId && (
                    <button onClick={() => handleDeleteRide(ride.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Delete Ride">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {ride.driver_id !== userId && (
                    <button onClick={() => handleBlockUser(ride.driver_id, ride.driver?.full_name)} className="text-gray-400 hover:text-red-500 transition-colors" title="Block User">
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm">
                      {ride.ride_category === 'auto_split' ? "🚕 Fare Split" : "🏍️ Student Rider"}
                      {ride.is_women_only && <span className="bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded text-xs">Women Only</span>}
                    </div>
                    
                    <div className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white">
                      <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      {ride.origin} <span className="text-gray-400">→</span> {ride.destination}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(ride.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      <div className="flex items-center gap-1"><User className="w-4 h-4" /> {ride.driver?.full_name}</div>
                      <div className="flex items-center gap-1"><Shield className="w-4 h-4" /> {maskMobile(ride.driver?.mobile_number, isApproved)}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 w-full md:w-auto mt-4 md:mt-0">
                    <div className="text-2xl font-black bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white px-5 py-3 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                      ₹{ride.price_per_seat} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/ seat</span>
                    </div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {ride.available_seats} seats left
                    </div>
                    
                    <div className="flex gap-2 w-full mt-2">
                      {(isApproved || ride.driver_id === userId) && (
                        <button 
                          onClick={() => setSelectedRideId(ride.id)}
                          className="ui-button p-2 rounded-xl text-blue-500 dark:text-blue-400 flex-1 flex justify-center"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                      )}
                      
                      {ride.driver_id !== userId && (
                        <button 
                          onClick={() => handleRequestSeat(ride.id)}
                          disabled={hasRequested}
                          className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all ${
                            hasRequested ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed" : "ui-button-primary hover:text-white"
                          }`}
                        >
                          {hasRequested ? (isApproved ? "Approved" : "Requested") : "Request Seat"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {ride.driver_id === userId && ride.bookings.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 space-y-2">
                    <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400">Manage Requests</h4>
                    {ride.bookings.map((booking: any) => (
                      <div key={booking.id} className="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                        <div className="text-sm">
                          <span className="font-bold text-gray-900 dark:text-white">{booking.passenger?.full_name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({booking.passenger?.roll_no})</span>
                          {booking.status === 'approved' && <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-bold">Approved</span>}
                          {booking.status === 'rejected' && <span className="ml-2 text-xs text-red-600 dark:text-red-400 font-bold">Rejected</span>}
                        </div>
                        {booking.status === 'pending' && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleManageRequest(booking.id, 'approved', ride.id, ride.available_seats)}
                              disabled={ride.available_seats <= 0}
                              className="text-xs bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-500/30 transition-colors disabled:opacity-50 font-medium"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleManageRequest(booking.id, 'rejected', ride.id, ride.available_seats)}
                              className="text-xs bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/30 transition-colors font-medium"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {selectedRideId && (
        <ChatModal rideId={selectedRideId} userId={userId} onClose={() => setSelectedRideId(null)} />
      )}
    </div>
  );
}
