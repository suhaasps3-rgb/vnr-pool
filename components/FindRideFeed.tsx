"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import anime from "animejs";
import { toast } from "sonner";
import { MessageCircle, Shield, Loader2, MapPin, Clock, User, Users, Ban, Trash2 } from "lucide-react";
import ChatModal from "./ChatModal";

export default function FindRideFeed({ userId, onVehicleSelect, mode = "feed" }: { userId: string, onVehicleSelect: (v: "car" | "auto" | "bike") => void, mode?: "feed" | "offered" | "booked" }) {
  const [rideCategory, setRideCategory] = useState<"auto_split" | "personal_vehicle" | "all">("all");
  const [womenOnly, setWomenOnly] = useState(false);
  const [searchOrigin, setSearchOrigin] = useState("");
  const [searchDestination, setSearchDestination] = useState("");
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
    queryKey: ["rides", rideCategory, womenOnly, mode, searchOrigin, searchDestination],
    queryFn: async () => {
      const queryStr = `
        *,
        driver:users!driver_id(full_name, mobile_number, gender, branch, roll_no),
        bookings(id, passenger_id, status, passenger:users!passenger_id(full_name, gender, roll_no))
      `;

      if (mode === "feed") {
        let query = supabase.from('rides').select(queryStr).eq('status', 'active');
        if (rideCategory !== "all") query = query.eq('ride_category', rideCategory);
        if (womenOnly) query = query.eq('is_women_only', true);
        if (searchOrigin) query = query.ilike('origin', `%${searchOrigin}%`);
        if (searchDestination) query = query.ilike('destination', `%${searchDestination}%`);
        
        query = query.order('created_at', { ascending: false });
        
        const { data, error } = await query;
        if (error) throw error;
        return data;
      } else if (mode === "offered") {
        const { data, error } = await supabase.from('rides').select(queryStr).eq('driver_id', userId).neq('status', 'cancelled').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
      } else if (mode === "booked") {
        const { data: bookingData, error: bError } = await supabase.from('bookings').select('ride_id').eq('passenger_id', userId).in('status', ['pending', 'approved']);
        if (bError) throw bError;
        const rideIds = bookingData.map((b: any) => b.ride_id);
        
        if (rideIds.length === 0) return [];

        const { data, error } = await supabase.from('rides').select(queryStr).in('id', rideIds).order('created_at', { ascending: false });
        if (error) throw error;
        return data;
      }
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

  const handleRequestSeat = async (ride: any) => {
    try {
      const { error } = await supabase.from('bookings').insert({
        ride_id: ride.id,
        passenger_id: userId,
        status: 'pending'
      });
      if (error) throw error;

      // Send Notification to Driver
      await supabase.from('notifications').insert({
        user_id: ride.driver_id,
        message: `Someone requested to join your ride from ${ride.origin} to ${ride.destination}!`
      });

      toast.success("Seat requested! Waiting for driver approval.");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to request seat.");
    }
  };

  const handleManageRequest = async (bookingId: string, passengerId: string, status: 'approved' | 'rejected', ride: any) => {
    try {
      const { error: bookingError } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
      if (bookingError) throw bookingError;

      if (status === 'approved') {
        const { error: rideError } = await supabase.from('rides').update({ available_seats: ride.available_seats - 1 }).eq('id', ride.id);
        if (rideError) throw rideError;
      }

      // Send Notification to Passenger
      await supabase.from('notifications').insert({
        user_id: passengerId,
        message: `Your seat request for ${ride.origin} to ${ride.destination} has been ${status}!`
      });

      toast.success(`Request ${status}!`);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to manage request.");
    }
  };

  const handleCancelBooking = async (ride: any, booking: any) => {
    if (!confirm("Are you sure you want to cancel your seat?")) return;
    try {
      const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);
      if (error) throw error;

      if (booking.status === 'approved') {
        const { error: rideError } = await supabase.from('rides').update({ available_seats: ride.available_seats + 1 }).eq('id', ride.id);
        if (rideError) throw rideError;
      }

      const { data: userData } = await supabase.from('users').select('full_name').eq('id', userId).single();
      const passengerName = userData?.full_name || 'A passenger';

      // Notify the driver
      await supabase.from('notifications').insert({
        user_id: ride.driver_id,
        message: `${passengerName} has cancelled their ${booking.status === 'approved' ? 'seat' : 'request'} on your ride from ${ride.origin} to ${ride.destination}.`
      });

      toast.success("Seat cancelled successfully.");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel seat.");
    }
  };

  const handleDeleteRide = async (ride: any) => {
    if (!confirm("Are you sure you want to cancel and remove this ride?")) return;
    try {
      // Perform a soft-delete by updating status to 'cancelled' 
      // since RLS policies don't permit hard deletes by default.
      const { data, error } = await supabase.from('rides').update({ status: 'cancelled' }).eq('id', ride.id).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Could not cancel the ride. It may have already been removed or you don't have permission.");
      }

      // Notify approved passengers
      const approvedPassengers = ride.bookings?.filter((b: any) => b.status === 'approved') || [];
      if (approvedPassengers.length > 0) {
        const notifications = approvedPassengers.map((b: any) => ({
          user_id: b.passenger_id,
          message: `The ride from ${ride.origin} to ${ride.destination} has been cancelled by the driver.`
        }));
        await supabase.from('notifications').insert(notifications);
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
      {mode === "feed" && (
        <>
          {/* Functional Search Bar */}
          <div className="hidden md:flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-[#0F172A] rounded-2xl border border-gray-200 dark:border-white/10 mb-4 items-center">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-white dark:bg-[#1E293B] p-3 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm focus-within:border-[#2563EB] transition-colors">
              <MapPin className="w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Leaving from..." 
                value={searchOrigin}
                onChange={(e) => setSearchOrigin(e.target.value)}
                className="bg-transparent outline-none w-full text-sm dark:text-white" 
              />
            </div>
            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-white dark:bg-[#1E293B] p-3 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm focus-within:border-[#2563EB] transition-colors">
              <MapPin className="w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Going to..." 
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
                className="bg-transparent outline-none w-full text-sm dark:text-white" 
              />
            </div>
          </div>

          {/* Filters Bar Redesign */}
          <div className="flex flex-wrap gap-3 mb-6 bg-slate-50 dark:bg-[#0F172A] p-2 rounded-2xl border border-gray-200 dark:border-white/5">
        <select 
          className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-[#2563EB] transition-colors shadow-sm"
          value={rideCategory}
          onChange={(e) => setRideCategory(e.target.value as any)}
        >
          <option value="all">All Ride Types</option>
          <option value="auto_split">Auto/Cab Fare Split</option>
          <option value="personal_vehicle">Student Vehicle Pool</option>
        </select>

        {userGender === 'female' && (
          <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-[#1E293B] border border-pink-200 dark:border-pink-500/20 rounded-xl px-4 py-2 text-pink-700 dark:text-pink-400 shadow-sm transition-colors hover:bg-pink-50 dark:hover:bg-pink-500/10">
            <input 
              type="checkbox"
              checked={womenOnly}
              onChange={(e) => setWomenOnly(e.target.checked)}
              className="accent-pink-500 rounded"
            />
              <span className="text-sm font-bold">Women-Only</span>
            </label>
          )}
        </div>
        </>
      )}

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
          rides?.filter((ride) => {
            if (mode === "booked") return true;
            if (mode === "offered") return true;
            
            if (ride.available_seats > 0) return true;
            if (ride.driver_id === userId) return true;
            const isApproved = ride.bookings.some((b: any) => b.passenger_id === userId && b.status === 'approved');
            return isApproved;
          }).map((ride) => {
            const myBooking = ride.bookings.find((b: any) => b.passenger_id === userId && (b.status === 'approved' || b.status === 'pending'));
            const isApproved = myBooking?.status === 'approved';
            const hasRequested = !!myBooking;
            const approvedPassengers = ride.bookings.filter((b: any) => b.status === 'approved');

            return (
              <div 
                key={ride.id} 
                onMouseEnter={() => onVehicleSelect(ride.vehicle_type as "car" | "auto" | "bike")}
                className="ride-card opacity-0 ui-card ui-card-hover p-6 relative overflow-hidden group mb-4"
              >
                {/* Driver Info Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xl overflow-hidden shadow-sm">
                      {ride.driver?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[#0F172A] dark:text-white text-lg">{ride.driver?.full_name}</h3>
                        <span className="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-blue-200 dark:border-blue-500/20">
                          ✓ Verified
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center text-yellow-500 font-medium">
                          ★ 4.9 <span className="text-slate-400 dark:text-slate-500 ml-1 font-normal">(12)</span>
                        </span>
                        <span>•</span>
                        <span>{ride.driver?.branch}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {ride.driver_id !== userId && (
                      <button onClick={() => handleBlockUser(ride.driver_id, ride.driver?.full_name)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 dark:bg-white/5 dark:hover:bg-red-500/10 rounded-full transition-colors" title="Block User">
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Route Visualizer */}
                <div className="flex gap-6 mb-6">
                  {/* Timeline Node */}
                  <div className="flex flex-col items-center mt-1">
                    <div className="w-3 h-3 rounded-full border-2 border-[#10B981] bg-white dark:bg-[#1E293B] z-10"></div>
                    <div className="w-0.5 h-10 bg-gray-200 dark:bg-slate-700 -my-1"></div>
                    <div className="w-3 h-3 rounded-full bg-[#2563EB] z-10"></div>
                  </div>
                  
                  {/* Locations & Time */}
                  <div className="flex flex-col justify-between py-0.5 flex-1 h-[4.5rem]">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-[#0F172A] dark:text-white">{ride.origin}</p>
                      <p className="text-sm font-semibold text-[#0F172A] dark:text-white">
                        {new Date(ride.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="font-bold text-[#0F172A] dark:text-white">{ride.destination}</p>
                    </div>
                  </div>
                </div>

                {/* Co-Passengers List */}
                {approvedPassengers.length > 0 && (
                  <div className="mb-6 pt-4 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-300 font-bold">
                      <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                      <span>Co-Passengers ({approvedPassengers.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {approvedPassengers.map((b: any) => (
                        <div key={b.id} className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                          <div className="w-6 h-6 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                            {b.passenger?.full_name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-[#0F172A] dark:text-slate-200">
                            {b.passenger?.full_name?.split(' ')[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer: Details & CTA */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-4 border-t border-gray-100 dark:border-white/5 gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-slate-100 text-slate-600 dark:bg-[#0F172A] dark:text-slate-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-slate-200 dark:border-white/10">
                      {ride.ride_category === 'auto_split' ? "🚕 Auto/Cab" : "🏍️ Student Vehicle"}
                    </span>
                    {ride.is_women_only && (
                      <span className="bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400 px-3 py-1 rounded-full text-xs font-semibold border border-pink-100 dark:border-pink-500/20">
                        Women Only
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 font-medium ml-2">
                      <Shield className="w-4 h-4" /> {maskMobile(ride.driver?.mobile_number, isApproved)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="text-right flex-1 md:flex-none">
                      <p className="text-2xl font-black text-[#0F172A] dark:text-white">₹{ride.price_per_seat}</p>
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{ride.available_seats} seats left</p>
                    </div>

                    <div className="flex gap-2">
                      {(isApproved || ride.driver_id === userId) && (
                        <button 
                          onClick={() => setSelectedRideId(ride.id)}
                          className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-[#0F172A] dark:hover:bg-slate-800 text-[#2563EB] dark:text-[#3B82F6] rounded-xl transition-colors"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                      )}
                      
                      {ride.driver_id !== userId && !hasRequested && (
                        <button 
                          onClick={() => handleRequestSeat(ride)}
                          className="px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ui-button-primary"
                        >
                          Book Seat
                        </button>
                      )}

                      {ride.driver_id !== userId && hasRequested && (
                        <button 
                          onClick={() => handleCancelBooking(ride, myBooking)}
                          className="px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20"
                        >
                          Cancel {isApproved ? 'Seat' : 'Request'}
                        </button>
                      )}

                      {ride.driver_id === userId && ride.status !== 'cancelled' && (
                        <button 
                          onClick={() => handleDeleteRide(ride)}
                          className="px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20"
                        >
                          Delete Ride
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
                              onClick={() => handleManageRequest(booking.id, booking.passenger_id, 'approved', ride)}
                              disabled={ride.available_seats <= 0}
                              className="text-xs bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-500/30 transition-colors disabled:opacity-50 font-medium"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleManageRequest(booking.id, booking.passenger_id, 'rejected', ride)}
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
