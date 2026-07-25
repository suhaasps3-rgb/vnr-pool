"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { MessageCircle, Shield, Loader2, MapPin, Clock, User, Users, Ban, Trash2, Calendar } from "lucide-react";
import ChatModal from "./ChatModal";
import RateUser from "./RateUser";
import RideCard from "./RideCard";
import BookSeatModal from "./BookSeatModal";
import { format } from "date-fns";
import DriverProfileModal from "./DriverProfileModal";
import { isAIMatch, ROUTES, calculateFractionalPrice } from "@/lib/matchmaking";
import DynamicMap from "./DynamicMap";

export default function FindRideFeed({ userId, onVehicleSelect, mode = "feed", onSearchChange }: { userId: string, onVehicleSelect: (v: "car" | "auto" | "bike") => void, mode?: "feed" | "offered" | "booked" | "active_trip", onSearchChange?: (origin: string, dest: string) => void }) {
  const [rideCategory, setRideCategory] = useState<"auto_split" | "personal_vehicle" | "all">("all");
  const [womenOnly, setWomenOnly] = useState(false);
  const [searchOrigin, setSearchOrigin] = useState("");
  const [searchDestination, setSearchDestination] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [timeFilter, setTimeFilter] = useState<"all" | "morning" | "afternoon" | "evening">("all");
  const [minSeats, setMinSeats] = useState<number>(1);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
  const [activeMapId, setActiveMapId] = useState<string | null>(null);
  const [selectedRideForBooking, setSelectedRideForBooking] = useState<{ride: any, price: number} | null>(null);
  const [selectedDriverForModal, setSelectedDriverForModal] = useState<{driver: any, vehicleNumber: string} | null>(null);
  const [userGender, setUserGender] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [gettingLocation, setGettingLocation] = useState(false);
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.address) {
            // Prefer smaller localities first
            const addr = data.address;
            const locName = addr.neighbourhood || addr.suburb || addr.residential || addr.village || addr.town || addr.city_district || addr.county || addr.road || addr.city || data.name || (data.display_name ? data.display_name.split(',')[0] : "Unknown Location");
            setSearchOrigin(locName);
            toast.success(`Location found: ${locName}`);
          } else {
            toast.error("Could not resolve location name");
          }
        } catch (error) {
          console.error("Geocoding error", error);
          toast.error("Failed to get location details");
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        setGettingLocation(false);
        toast.error("Location access denied or failed.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    supabase.from('users').select('gender').eq('id', userId).single().then(({ data }) => {
      if (data) setUserGender(data.gender);
    });
  }, [userId, supabase]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('updateDistance', { detail: { origin: searchOrigin, dest: searchDestination } }));
  }, [searchOrigin, searchDestination]);

  const { data: rides, isLoading, refetch } = useQuery({
    queryKey: ["rides", rideCategory, womenOnly, mode, searchOrigin, searchDestination, searchDate],
    queryFn: async () => {
      const queryStr = `
        *,
        driver:users!driver_id(full_name, mobile_number, gender, branch, roll_no, avatar_url, rating_sum, rating_count),
        bookings(id, passenger_id, status, passenger:users!passenger_id(full_name, gender, roll_no, avatar_url))
      `;

      if (mode === "feed") {

        let query = supabase.from('rides').select(queryStr).eq('status', 'active');
        if (rideCategory !== "all") query = query.eq('ride_category', rideCategory);
        if (womenOnly) query = query.eq('is_women_only', true);
        if (searchDate) {
          const startOfDay = new Date(searchDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(searchDate);
          endOfDay.setHours(23, 59, 59, 999);
          query = query.gte('departure_time', startOfDay.toISOString());
          query = query.lte('departure_time', endOfDay.toISOString());
        }
        
        query = query.order('created_at', { ascending: false });
        
        const { data, error } = await query;
        if (error) throw error;

        let filteredData = data;
        if (searchOrigin || searchDestination) {
          filteredData = filteredData?.filter(ride => {
            const matchesOrigin = !searchOrigin || ride.origin.toLowerCase().includes(searchOrigin.toLowerCase());
            const matchesDest = !searchDestination || ride.destination.toLowerCase().includes(searchDestination.toLowerCase());
            const exactMatch = matchesOrigin && matchesDest;
            const aiMatch = isAIMatch(ride.origin, ride.destination, searchOrigin, searchDestination);
            return exactMatch || aiMatch;
          }) || [];
        }

        return filteredData;
      } else if (mode === "offered") {
        const { data, error } = await supabase.from('rides').select(queryStr).eq('driver_id', userId).order('created_at', { ascending: false });
        if (error) throw error;
        return data;
      } else if (mode === "booked") {
        const { data: bookingData, error: bError } = await supabase.from('bookings').select('ride_id').eq('passenger_id', userId);
        if (bError) throw bError;
        const rideIds = bookingData.map((b: any) => b.ride_id);
        
        if (rideIds.length === 0) return [];

        const { data, error } = await supabase.from('rides').select(queryStr).order('created_at', { ascending: false });
        if (error) throw error;
        return data?.filter(r => rideIds.includes(r.id)) || [];
      } else if (mode === "active_trip") {
        // Driver rides
        const { data: driverRides, error: dError } = await supabase.from('rides')
          .select(queryStr)
          .eq('driver_id', userId)
          .in('status', ['active', 'in_progress']);
        
        let allRidesArr: any[] = driverRides || [];

        // Passenger rides
        const { data: bookings } = await supabase.from('bookings')
          .select('ride_id')
          .eq('passenger_id', userId)
          .in('status', ['approved', 'pending']);
        
        if (bookings && bookings.length > 0) {
          const rideIds = bookings.map(b => b.ride_id);
          const { data: allRides } = await supabase.from('rides').select(queryStr);
          if (allRides) {
            const passengerRides = allRides.filter(r => rideIds.includes(r.id) && (r.status === 'active' || r.status === 'in_progress'));
            if (passengerRides.length > 0) {
              allRidesArr = [...allRidesArr, ...passengerRides];
            }
          }
        }
        
        const uniqueIds = new Set();
        return allRidesArr.filter(r => {
          if (uniqueIds.has(r.id)) return false;
          uniqueIds.add(r.id);
          return true;
        });
      }
    }
  });

  const { data: hasActiveTrip } = useQuery({
    queryKey: ["activeTrip", userId],
    queryFn: async () => {
      // 1. Check if user is driver
      const { data: driverRides } = await supabase.from('rides')
        .select('id, status')
        .eq('driver_id', userId)
        .eq('status', 'in_progress');
      
      if (driverRides && driverRides.length > 0) return true;

      // 2. Check if user is passenger
      let isActivePassenger = false;
      const { data: pBookings } = await supabase.from('bookings').select('id, rides(id, status)').eq('passenger_id', userId).eq('status', 'approved');
      if (pBookings && pBookings.some((b: any) => b.rides && b.rides.status === 'in_progress')) {
        isActivePassenger = true;
      }

      // FALLBACK
      if (!isActivePassenger) {
        const { data: rawBookings } = await supabase.from('bookings').select('ride_id, status').eq('passenger_id', userId).eq('status', 'approved');
        if (rawBookings && rawBookings.length > 0) {
          const rIds = rawBookings.map(b => b.ride_id);
          const { data: allRidesRaw } = await supabase.from('rides').select('id, status').eq('status', 'in_progress');
          if (allRidesRaw) {
            const passengerRides = allRidesRaw.filter(r => rIds.includes(r.id));
            if (passengerRides.length > 0) {
              isActivePassenger = true;
            }
          }
        }
      }
      return isActivePassenger;
    }
  });


  const handleRequestSeat = async (pickup: string, dropoff: string, finalPrice: number) => {
    const ride = selectedRideForBooking?.ride;
    if (!ride) return;
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      // 1. FRESH DEEP CHECK: Guarantee user has no active trips before allowing request
      const { data: driverRides } = await supabase.from('rides')
        .select('id, status')
        .eq('driver_id', userId)
        .eq('status', 'in_progress');
        
      if (driverRides && driverRides.length > 0) {
        toast.error("Action Blocked: You cannot join a ride while you are driving an active trip.");
        setIsProcessing(false);
        return;
      }

      let isLocked = false;
      const { data: pBookings } = await supabase.from('bookings').select('id, rides(id, status)').eq('passenger_id', userId).eq('status', 'approved');
      if (pBookings && pBookings.some((b: any) => b.rides && b.rides.status === 'in_progress')) {
        isLocked = true;
      }
      
      if (!isLocked) {
        const { data: rawBookings } = await supabase.from('bookings').select('ride_id, status').eq('passenger_id', userId).eq('status', 'approved');
        if (rawBookings && rawBookings.length > 0) {
          const rIds = rawBookings.map(b => b.ride_id);
          const { data: allRidesRaw } = await supabase.from('rides').select('id, status').eq('status', 'in_progress');
          if (allRidesRaw) {
            const passengerRides = allRidesRaw.filter(r => rIds.includes(r.id));
            if (passengerRides.length > 0) {
              isLocked = true;
            }
          }
        }
      }

      if (isLocked) {
        toast.error("Action Blocked: You cannot join a ride while you are currently in an active trip.");
        setIsProcessing(false);
        return;
      }

      // 2. FRESH DEEP CHECK: Target Ride Status
      const { data: targetRide } = await supabase.from('rides').select('status, available_seats').eq('id', ride.id).single();
      if (!targetRide || targetRide.status !== 'active') {
        toast.error("Action Blocked: This ride has already started or is no longer available.");
        refetch();
        return;
      }
      if (targetRide.available_seats <= 0) {
        toast.error("Action Blocked: This ride is already full.");
        refetch();
        return;
      }

      // 3. Proceed with booking
      const existingBooking = ride.bookings?.find((b: any) => b.passenger_id === userId);

      let error;
      if (existingBooking) {
        const { error: updateError } = await supabase.from('bookings').update({ 
          status: 'pending',
          pickup_location: pickup,
          dropoff_location: dropoff,
          calculated_price: finalPrice
        }).eq('id', existingBooking.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('bookings').insert({
          ride_id: ride.id,
          passenger_id: userId,
          status: 'pending',
          pickup_location: pickup,
          dropoff_location: dropoff,
          calculated_price: finalPrice
        });
        error = insertError;
      }
      
      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: ride.driver_id,
        title: "New Booking Request",
        message: `Someone requested to join your ride from ${ride.origin} to ${ride.destination}!`,
        type: "booking_request"
      });

      toast.success("Seat requested! Waiting for driver approval.");
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.7 }
      });
      queryClient.invalidateQueries({ queryKey: ["activeTripGlobal"] });
      queryClient.invalidateQueries({ queryKey: ["activeTrip"] });
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      setSelectedRideForBooking(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to request seat.");
    } finally {
      setIsProcessing(false);
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
        title: status === 'approved' ? "Seat Approved!" : "Seat Rejected",
        message: `Your seat request for ${ride.origin} to ${ride.destination} has been ${status}!`,
        type: status === 'approved' ? 'booking_approved' : 'booking_rejected'
      });

      toast.success(`Request ${status}!`);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to manage request.");
    }
  };

  const handleStartRide = async (ride: any) => {
    try {
      const { error } = await supabase.from('rides').update({ status: 'in_progress' }).eq('id', ride.id);
      if (error) throw error;

      // Notify approved passengers
      const approvedPassengers = ride.bookings?.filter((b: any) => b.status === 'approved') || [];
      if (approvedPassengers.length > 0) {
        const notifications = approvedPassengers.map((b: any) => ({
          user_id: b.passenger_id,
          message: `Your ride from ${ride.origin} to ${ride.destination} is now in progress!`
        }));
        await supabase.from('notifications').insert(notifications);
      }

      toast.success("Ride started! It has been removed from the public feed.");
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      queryClient.invalidateQueries({ queryKey: ["activeTrip"] });
      queryClient.invalidateQueries({ queryKey: ["activeTripGlobal"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCompleteRide = async (ride: any) => {
    try {
      const { error } = await supabase.from('rides').update({ status: 'completed' }).eq('id', ride.id);
      if (error) throw error;

      // Notify approved passengers
      const approvedPassengers = ride.bookings?.filter((b: any) => b.status === 'approved') || [];
      if (approvedPassengers.length > 0) {
        const notifications = approvedPassengers.map((b: any) => ({
          user_id: b.passenger_id,
          message: `Your ride from ${ride.origin} to ${ride.destination} has been completed by the driver. Please rate your experience!`
        }));
        await supabase.from('notifications').insert(notifications);
      }

      toast.success("Ride marked as completed!");
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      queryClient.invalidateQueries({ queryKey: ["activeTrip"] });
      queryClient.invalidateQueries({ queryKey: ["activeTripGlobal"] });
    } catch (error: any) {
      toast.error(error.message);
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
        {/* FULL SCREEN OVERLAY LOCK FOR ACTIVE TRIPS */}
        {mode === "feed" && hasActiveTrip && (
          <div className="flex flex-col items-center justify-center py-12 px-6 animate-in fade-in duration-300">
            <div className="bg-white/90 dark:bg-[#1E293B] p-10 rounded-3xl shadow-2xl border border-blue-200 dark:border-blue-500/20 max-w-md w-full text-center backdrop-blur-xl">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
              🚗
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Ride Reserved / In Progress</h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-8">
              You are strictly restricted to one active ride or pending request at a time. You cannot view other rides or book new seats until your current ride is completed or cancelled.
            </p>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              Navigate to the "Ride in Progress" tab.
            </p>
          </div>
        </div>
      )}

      {mode === "feed" && (
        <>
          {hasActiveTrip && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl">
                  🚗
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 dark:text-blue-100">You have a ride in progress!</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">You cannot book new rides until your current trip is completed. Check the My Rides section.</p>
                </div>
              </div>
            </div>
          )}

          {/* Functional Search Bar */}
          <div className="hidden md:flex flex-wrap gap-3 p-3 bg-white/60 dark:bg-[#0F172A]/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 mb-4 items-center shadow-sm">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-white dark:bg-[#1E293B] p-3 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500/50 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900 transition-all duration-300 group">
              <MapPin className="w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Leaving from..." 
                value={searchOrigin}
                onChange={(e) => setSearchOrigin(e.target.value)}
                className="bg-transparent outline-none w-full text-sm text-slate-900 dark:text-white placeholder-slate-400 group-focus-within:placeholder-slate-300" 
              />
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={gettingLocation}
                title="Use Current Location"
                className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/20 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
              >
                {gettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : "📍"}
              </button>
            </div>
            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-white dark:bg-[#1E293B] p-3 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500/50 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900 transition-all duration-300 group">
              <MapPin className="w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Going to..." 
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
                className="bg-transparent outline-none w-full text-sm text-slate-900 dark:text-white placeholder-slate-400 group-focus-within:placeholder-slate-300" 
              />
            </div>
            <div className="flex-1 min-w-[160px] flex items-center gap-2 bg-white dark:bg-[#1E293B] p-3 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500/50 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900 transition-all duration-300">
              <Calendar className="w-5 h-5 text-slate-400" />
              <input 
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="bg-transparent outline-none w-full text-sm text-slate-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" 
              />
            </div>
          </div>

          {/* Filters Bar Redesign */}
          <div className="flex flex-wrap gap-3 mb-6 bg-white/60 dark:bg-[#0F172A]/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <select 
          className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-[#2563EB] hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 shadow-sm cursor-pointer"
          value={rideCategory}
          onChange={(e) => setRideCategory(e.target.value as any)}
        >
          <option value="all">All Ride Types</option>
          <option value="auto_split">Auto/Cab Fare Split</option>
          <option value="personal_vehicle">Student Vehicle Pool</option>
        </select>

        {userGender === 'female' && (
          <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-[#1E293B] border border-pink-200 dark:border-pink-500/20 rounded-xl px-4 py-2 text-pink-700 dark:text-pink-400 shadow-sm transition-all duration-300 hover:shadow-md hover:border-pink-300 dark:hover:bg-pink-500/10">
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
        ) : rides?.length === 0 || (mode === "feed" && hasActiveTrip) ? (
          <div className="text-center py-12 text-neutral-500">
            {hasActiveTrip && mode === "feed" 
              ? "You are currently restricted to your active trip."
              : mode === "active_trip" 
                ? "No active trips found." 
                : "No rides available at the moment. Try adjusting your filters!"}
          </div>
        ) : (
          <motion.div
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.25, delayChildren: 0.1 } } }}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {rides?.filter((ride) => {
            if (mode === "booked" || mode === "offered") return true;
            
            if (mode === "feed") {
              if (ride.status !== 'active') return false;
              if (ride.available_seats <= 0) return false;
              return true;
            }

            if (mode === "active_trip") {
              if (ride.status === 'cancelled' || ride.status === 'completed') return false;
              return true;
            }

            return true;
          }).map((ride) => {
            const myBooking = ride.bookings.find((b: any) => b.passenger_id === userId && (b.status === 'approved' || b.status === 'pending'));
            const isApproved = myBooking?.status === 'approved';
            const hasRequested = !!myBooking;
            const approvedPassengers = ride.bookings.filter((b: any) => b.status === 'approved');

            const impliedTotalCost = ride.price_per_seat * (ride.ride_category === 'auto_split' ? ride.total_seats + 1 : ride.total_seats);
            let displayPrice = ride.price_per_seat;
            let dynamicPriceNote = "";

            if (myBooking?.calculated_price) {
              displayPrice = myBooking.calculated_price;
              dynamicPriceNote = "Your fractional share";
            } else if (searchOrigin && searchDestination) {
              displayPrice = calculateFractionalPrice(ride.origin, ride.destination, searchOrigin, searchDestination, ride.price_per_seat);
              dynamicPriceNote = "Your fractional share";
            }

            if (ride.ride_category === 'auto_split') {
              const currentPeople = 1 + approvedPassengers.length;
              if (isApproved || ride.driver_id === userId) {
                displayPrice = myBooking?.calculated_price || Math.ceil(impliedTotalCost / currentPeople);
                dynamicPriceNote = "Current split";
              } else if (ride.available_seats > 0) {
                displayPrice = (myBooking?.calculated_price) || Math.ceil(impliedTotalCost / (currentPeople + 1));
                dynamicPriceNote = "If you join";
              } else {
                displayPrice = myBooking?.calculated_price || Math.ceil(impliedTotalCost / currentPeople);
                dynamicPriceNote = "Final split";
              }
            }

            return (
              <motion.div 
                key={ride.id} 
                onMouseEnter={() => onVehicleSelect(ride.vehicle_type as "car" | "auto" | "bike")}
                variants={{ 
                  hidden: { opacity: 0, y: 30, scale: 0.95 }, 
                  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } } 
                }}
                whileHover={{ scale: 1.02, boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.15)" }}
                className={`ui-card p-6 relative overflow-hidden group mb-4 ${ride.status === 'cancelled' ? 'grayscale opacity-75' : ''} ${ride.status === 'completed' ? 'border-emerald-200 dark:border-emerald-500/30' : ''}`}
              >
                {ride.status === 'cancelled' && (
                  <div className="absolute top-4 right-4 bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-200 dark:border-red-500/30 z-10">
                    CANCELLED
                  </div>
                )}
                {ride.status === 'in_progress' && (
                  <div className="absolute top-4 right-4 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-500/30 z-10">
                    IN PROGRESS
                  </div>
                )}
                {ride.status === 'completed' && (
                  <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-500/30 z-10">
                    COMPLETED
                  </div>
                )}
                
                {mode === "feed" && isAIMatch(ride.origin, ride.destination, searchOrigin, searchDestination, ride.chosen_route_index) && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 text-purple-700 dark:text-purple-300 px-4 py-1 rounded-full text-[10px] font-black tracking-widest border border-purple-500/30 flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-pulse z-10">
                    ✨ AI MATCH: PERFECT ROUTE OVERLAY
                  </div>
                )}
                
                {/* Driver Info Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div 
                      onClick={() => setSelectedDriverForModal({ driver: ride.driver, vehicleNumber: ride.vehicle_number })}
                      className="cursor-pointer w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xl overflow-hidden shadow-sm hover:scale-105 transition-transform border-2 border-transparent hover:border-indigo-400"
                    >
                      {ride.driver?.avatar_url ? (
                        <img src={ride.driver.avatar_url} alt={ride.driver.full_name || "Driver"} className="w-full h-full object-cover" />
                      ) : (
                        ride.driver?.full_name?.charAt(0).toUpperCase()
                      )}
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
                          ★ {ride.driver?.rating_count > 0 ? (ride.driver.rating_sum / ride.driver.rating_count).toFixed(1) : "New"} 
                          <span className="text-slate-400 dark:text-slate-500 ml-1 font-normal">({ride.driver?.rating_count || 0})</span>
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
                        {format(new Date(ride.departure_time), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="font-bold text-[#0F172A] dark:text-white">{ride.destination}</p>
                    </div>
                  </div>
                </div>

                {ride.chosen_route_index !== null && ride.chosen_route_index !== undefined && ROUTES[ride.chosen_route_index] && (
                  <div className="mb-4 bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400 capitalize">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Chosen Route: </span>
                    {ROUTES[ride.chosen_route_index].join(' → ')}
                  </div>
                )}

                {/* Route Map Toggle */}
                <div className="mb-6">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setActiveMapId(activeMapId === ride.id ? null : ride.id); 
                    }}
                    className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2"
                  >
                    <MapPin className="w-4 h-4" />
                    {activeMapId === ride.id ? "Hide Route Map" : "View Route Map"}
                  </button>
                  
                  {activeMapId === ride.id && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300" onClick={(e) => e.stopPropagation()}>
                      <DynamicMap origin={ride.origin} destination={ride.destination} />
                    </div>
                  )}
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
                        <div key={b.id} className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20 w-fit">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs shadow-sm overflow-hidden border border-white dark:border-slate-800">
                              {b.passenger?.avatar_url ? (
                                <img src={b.passenger.avatar_url} alt={b.passenger.full_name || "Passenger"} className="w-full h-full object-cover" />
                              ) : (
                                b.passenger?.full_name?.charAt(0).toUpperCase()
                              )}
                            </div>
                            <span className="text-sm font-semibold text-[#0F172A] dark:text-slate-200">
                              {b.passenger?.full_name?.split(' ')[0]}
                              {b.calculated_price && <span className="ml-1 text-emerald-700 dark:text-emerald-400 font-black">₹{b.calculated_price}</span>}
                            </span>
                          </div>
                          {b.pickup_location && b.dropoff_location && (
                            <div className="w-full text-[10px] font-medium text-slate-500 pl-2 border-l-2 border-slate-200 dark:border-slate-700">
                              Route: {b.pickup_location} → {b.dropoff_location}
                            </div>
                          )}
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
                    {ride.ride_category === 'personal_vehicle' && ride.vehicle_number && (
                      <span className="bg-orange-50 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 dark:border-orange-500/30 uppercase tracking-widest ml-1 shadow-sm">
                        {ride.vehicle_number}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="text-right flex-1 md:flex-none">
                      <p className="text-2xl font-black text-[#0F172A] dark:text-white">₹{displayPrice}</p>
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{ride.available_seats} seats left</p>
                      {dynamicPriceNote && (
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">{dynamicPriceNote}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {(isApproved || ride.driver_id === userId) && ride.status !== 'cancelled' && (
                        <button 
                          onClick={() => setSelectedRideId(ride.id)}
                          className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-[#0F172A] dark:hover:bg-slate-800 text-[#2563EB] dark:text-[#3B82F6] rounded-xl transition-colors"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                      )}
                      
                      {ride.driver_id !== userId && !hasRequested && ride.status === 'active' && (
                        <button 
                          onClick={() => {
                            if (hasActiveTrip) {
                              toast.error("You cannot book a new ride while you are in an active trip.");
                              return;
                            }
                            setSelectedRideForBooking({ ride, price: displayPrice });
                          }}
                          className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${hasActiveTrip || isProcessing ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500' : 'ui-button-primary'}`}
                          disabled={hasActiveTrip || isProcessing}
                        >
                          Book Seat
                        </button>
                      )}

                      {ride.driver_id !== userId && hasRequested && ride.status === 'active' && (
                        <button 
                          onClick={() => handleCancelBooking(ride, myBooking)}
                          disabled={isProcessing}
                          className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''} bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20`}
                        >
                          Cancel {isApproved ? 'Seat' : 'Request'}
                        </button>
                      )}

                    </div>
                  </div>
                </div>

                {/* Driver Controls */}
                {ride.driver_id === userId && ride.status !== 'cancelled' && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex gap-2 justify-end">
                    {ride.status === 'active' && (() => {
                      const isFull = ride.available_seats === 0;
                      const thirtyMinsBefore = new Date(new Date(ride.departure_time).getTime() - 30 * 60000);
                      const canStartEarly = isFull && new Date() >= thirtyMinsBefore;
                      const canStartNormally = new Date() >= new Date(ride.departure_time);
                      const isStartDisabled = !canStartNormally && !canStartEarly;

                      return (
                        <button 
                          onClick={() => handleStartRide(ride)}
                          disabled={isStartDisabled}
                          title={isStartDisabled ? (isFull ? "You can start the ride up to 30 minutes early." : "You can only start the ride once the departure time is reached.") : ""}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                            isStartDisabled
                              ? 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500 cursor-not-allowed'
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20'
                          }`}
                        >
                          Start Ride
                        </button>
                      );
                    })()}
                    {ride.status === 'in_progress' && (
                      <button 
                        onClick={() => handleCompleteRide(ride)}
                        className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 rounded-lg text-sm font-bold transition-colors"
                      >
                        Complete Ride
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteRide(ride)}
                      className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Ride
                    </button>
                  </div>
                )}

                {/* Rate Driver Section for Passengers */}
                {ride.status === 'completed' && ride.driver_id !== userId && isApproved && (
                  <RateUser rideId={ride.id} raterId={userId} ratedId={ride.driver_id} role="driver" />
                )}

                {/* Rate Passengers Section for Drivers */}
                {ride.status === 'completed' && ride.driver_id === userId && ride.bookings.some((b: any) => b.status === 'approved') && (
                  <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-white/5">
                    <h4 className="text-sm font-bold text-[#0F172A] dark:text-white mb-3">Rate Passengers</h4>
                    <div className="space-y-4">
                      {ride.bookings.filter((b: any) => b.status === 'approved').map((booking: any) => (
                        <div key={booking.id} className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/10">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#0F172A] dark:text-white">{booking.users?.full_name || 'Passenger'}</p>
                              <p className="text-xs text-slate-500">{maskMobile(booking.users?.mobile_number, true)}</p>
                            </div>
                          </div>
                          <RateUser 
                            rideId={ride.id} 
                            raterId={userId} 
                            ratedId={booking.passenger_id} 
                            role="passenger" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {ride.driver_id === userId && ride.bookings.length > 0 && ride.status !== 'cancelled' && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 space-y-2">
                    <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400">Manage Requests</h4>
                    {ride.bookings.map((booking: any) => (
                      <div key={booking.id} className="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                        <div className="text-sm flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white">{booking.passenger?.full_name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">({booking.passenger?.roll_no})</span>
                            {booking.calculated_price && <span className="text-emerald-600 dark:text-emerald-400 font-black text-xs ml-auto pr-4">₹{booking.calculated_price}</span>}
                          </div>
                          {booking.pickup_location && booking.dropoff_location && (
                            <div className="text-[10px] font-medium text-slate-500 mt-1">
                              📍 {booking.pickup_location} <span className="mx-1">→</span> 📍 {booking.dropoff_location}
                            </div>
                          )}
                          {booking.status === 'approved' && <span className="mt-1 block text-xs text-green-600 dark:text-green-400 font-bold">Approved</span>}
                          {booking.status === 'rejected' && <span className="mt-1 block text-xs text-red-600 dark:text-red-400 font-bold">Rejected</span>}
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
              </motion.div>
            );
          })}
          </motion.div>
        )}
      </div>

      {selectedRideId && (
        <ChatModal rideId={selectedRideId} userId={userId} onClose={() => setSelectedRideId(null)} />
      )}
      {selectedDriverForModal && (
        <DriverProfileModal
          driver={selectedDriverForModal.driver}
          vehicleNumber={selectedDriverForModal.vehicleNumber}
          onClose={() => setSelectedDriverForModal(null)}
        />
      )}
      <BookSeatModal
        ride={selectedRideForBooking?.ride}
        isOpen={!!selectedRideForBooking}
        onClose={() => setSelectedRideForBooking(null)}
        onConfirm={handleRequestSeat}
        isProcessing={isProcessing}
        initialPickup={searchOrigin || undefined}
        initialDropoff={searchDestination || undefined}
      />
    </div>
  );
}
