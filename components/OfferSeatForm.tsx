"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { ALL_LOCATIONS as COMMON_LOCATIONS } from "@/lib/locations";
import { getPossibleRoutes } from "@/lib/matchmaking";

export default function OfferSeatForm({ userId, onVehicleSelect }: { userId: string, onVehicleSelect: (v: "car" | "auto" | "bike") => void }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [userGender, setUserGender] = useState<string | null>(null);
  const [userCarNumber, setUserCarNumber] = useState<string | null>(null);
  const [userBikeNumber, setUserBikeNumber] = useState<string | null>(null);
  const [vehicleEntryMode, setVehicleEntryMode] = useState<'profile' | 'manual'>('profile');
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [possibleRoutes, setPossibleRoutes] = useState<{index: number, path: string[]}[]>([]);
  const [chosenRouteIndex, setChosenRouteIndex] = useState<number | null>(null);


  useEffect(() => {
    const supabase = createClient();
    supabase.from('users').select('gender, car_number, bike_number').eq('id', userId).single().then(({ data }) => {
      if (data) {
        setUserGender(data.gender);
        setUserCarNumber(data.car_number);
        setUserBikeNumber(data.bike_number);
      }
    });
  }, [userId]);

  const [formData, setFormData] = useState({
    ride_category: "auto_split",
    origin: "",
    destination: "VNR VJIET Campus Gate 1",
    departure_date: "",
    departure_time: "",
    vehicle_type: "auto",
    vehicle_number: "",
    total_seats: 3,
    total_cost: 200,
    is_women_only: false,
  });

  const maxSeats = (() => {
    if (formData.vehicle_type === 'bike') return 1;
    if (formData.vehicle_type === 'auto') return 2;
    if (formData.vehicle_type === 'car') {
      return formData.ride_category === 'auto_split' ? 3 : 4;
    }
    return 4;
  })();

  useEffect(() => {
    if (formData.total_seats > maxSeats) {
      setFormData(prev => ({ ...prev, total_seats: maxSeats }));
    }
    if (formData.ride_category === 'auto_split' && formData.vehicle_type === 'bike') {
      setFormData(prev => ({ ...prev, vehicle_type: 'auto' }));
    }
    if (formData.ride_category === 'personal_vehicle' && formData.vehicle_type === 'auto') {
      setFormData(prev => ({ ...prev, vehicle_type: 'car' }));
    }
  }, [formData.vehicle_type, formData.ride_category, maxSeats]);

  useEffect(() => {
    onVehicleSelect(formData.vehicle_type as "car" | "auto" | "bike");
  }, [formData.vehicle_type, onVehicleSelect]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('updateDistance', { detail: { origin: formData.origin, dest: formData.destination } }));
    
    if (formData.origin && formData.destination) {
      const routes = getPossibleRoutes(formData.origin, formData.destination);
      setPossibleRoutes(routes);
      if (routes.length === 1) {
        setChosenRouteIndex(routes[0].index);
      } else {
        setChosenRouteIndex(null);
      }
    } else {
      setPossibleRoutes([]);
      setChosenRouteIndex(null);
    }
  }, [formData.origin, formData.destination]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const o = formData.origin.toLowerCase().replace(/[^a-z]/g, '');
    const d = formData.destination.toLowerCase().replace(/[^a-z]/g, '');

    if (o === d) {
      toast.error("Origin and Destination cannot be the same location.");
      setLoading(false);
      return;
    }

    if (!o.includes('vnr') && !d.includes('vnr')) {
      toast.error("This app is exclusively for VNR VJIET students. Either your Origin or Destination must be VNR VJIET.");
      setLoading(false);
      return;
    }

    if (possibleRoutes.length > 0 && chosenRouteIndex === null) {
      toast.error("Please explicitly select which route you will take so AI matchmaking can accurately overlay passengers.");
      setLoading(false);
      return;
    }

    const departureDateTime = new Date(`${formData.departure_date}T${formData.departure_time}`);
    if (departureDateTime < new Date()) {
      toast.error("You cannot schedule a ride in the past. Please select a valid future date and time.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      // 1. FRESH DEEP CHECK: Guarantee user has no active trips before allowing to offer
      const { data: driverRides } = await supabase.from('rides').select('id, status').eq('driver_id', userId);
      if (driverRides && driverRides.some(r => r.status === 'active' || r.status === 'in_progress')) {
        toast.error("Action Blocked: You cannot offer a new ride while you are driving an active trip.");
        setLoading(false);
        return;
      }

      // 2. Cannot offer if passenger in active ride
      let isLocked = false;
      const { data: pBookings } = await supabase.from('bookings').select('id, rides(id, status)').eq('passenger_id', userId).in('status', ['approved', 'pending']);
      if (pBookings && pBookings.some((b: any) => b.rides && (b.rides.status === 'active' || b.rides.status === 'in_progress'))) {
        isLocked = true;
      }
      if (!isLocked) {
        const { data: rawBookings } = await supabase.from('bookings').select('ride_id, status').eq('passenger_id', userId);
        const activeRaw = rawBookings?.filter(b => b.status === 'approved' || b.status === 'pending') || [];
        if (activeRaw.length > 0) {
          const rIds = activeRaw.map(b => b.ride_id);
          const { data: allRidesRaw } = await supabase.from('rides').select('id, status');
          if (allRidesRaw) {
            const passengerRides = allRidesRaw.filter(r => rIds.includes(r.id));
            if (passengerRides.some(r => r.status === 'active' || r.status === 'in_progress')) {
              isLocked = true;
            }
          }
        }
      }

      if (isLocked) {
        toast.error("Action Blocked: You cannot offer a new ride while you are currently in an active trip.");
        setLoading(false);
        return;
      }

      const departureTimeUTC = new Date(`${formData.departure_date}T${formData.departure_time}`).toISOString();
      
      let finalVehicleNumber = formData.vehicle_number;
      if (formData.ride_category === 'personal_vehicle') {
        const hasProfileNumber = (formData.vehicle_type === 'car' && userCarNumber) || (formData.vehicle_type === 'bike' && userBikeNumber);
        if (hasProfileNumber && vehicleEntryMode === 'profile') {
          finalVehicleNumber = (formData.vehicle_type === 'car' ? userCarNumber : userBikeNumber) as string;
        }
      }

      const { error } = await supabase.from('rides').insert({
        driver_id: userId,
        ride_category: formData.ride_category,
        origin: formData.origin,
        destination: formData.destination,
        departure_time: departureTimeUTC,
        vehicle_type: formData.vehicle_type,
        vehicle_number: finalVehicleNumber || null,
        total_seats: Number(formData.total_seats),
        available_seats: Number(formData.total_seats),
        price_per_seat: Math.ceil(Number(formData.total_cost) / (formData.ride_category === 'auto_split' ? Number(formData.total_seats) + 1 : Number(formData.total_seats))),
        is_women_only: formData.is_women_only,
        status: 'active',
        chosen_route_index: chosenRouteIndex
      });

      if (error) throw error;
      toast.success("Ride offered successfully!");
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      queryClient.invalidateQueries({ queryKey: ["activeTripGlobal"] });
      queryClient.invalidateQueries({ queryKey: ["activeTrip"] });
      // Reset form
      setFormData({
        ...formData,
        origin: "",
        departure_date: "",
        departure_time: "",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to offer ride.");
    } finally {
      setLoading(false);
    }
  };

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
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.address) {
            // Prefer suburb, then neighbourhood, then city_district
            const locName = data.address.suburb || data.address.neighbourhood || data.address.city_district || data.name || "Unknown Location";
            setFormData(prev => ({...prev, origin: locName}));
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

  return (
    <div className="ui-card p-6 md:p-10 mb-8 border-t-4 border-t-[#2563EB] dark:border-t-[#3B82F6]">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-[#0F172A] dark:text-white">Offer a Ride</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Fill in the details to share your journey with campus peers.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Ride Category</label>
            <select 
              value={formData.ride_category}
              onChange={(e) => setFormData({...formData, ride_category: e.target.value})}
              className="w-full p-4 bg-slate-50 dark:bg-[#0F172A] text-[#0F172A] dark:text-white border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
            >
              <option value="auto_split">Auto/Cab Fare Split</option>
              <option value="personal_vehicle">Student Vehicle Pool</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Vehicle Type</label>
            <select 
              value={formData.vehicle_type}
              onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
              className="w-full p-4 bg-slate-50 dark:bg-[#0F172A] text-[#0F172A] dark:text-white border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
            >
              {formData.ride_category === 'auto_split' && (
                <option value="auto">Auto</option>
              )}
              <option value="car">Car</option>
              {formData.ride_category === 'personal_vehicle' && (
                <option value="bike">Bike</option>
              )}
            </select>
          </div>

          <div className="relative z-[100]">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Origin {showOriginDropdown ? "(OPEN)" : "(CLOSED)"}
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={gettingLocation}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
              >
                {gettingLocation ? <Loader2 className="w-3 h-3 animate-spin" /> : "📍"}
                {gettingLocation ? "Locating..." : "Use Current Location"}
              </button>
            </div>
            <input 
              required
              placeholder="e.g. JNTU Metro"
              value={formData.origin}
              onChange={(e) => {
                setFormData({...formData, origin: e.target.value});
                setShowOriginDropdown(true);
              }}
              onFocus={() => setShowOriginDropdown(true)}
              className="w-full p-4 bg-slate-50 dark:bg-[#0F172A] text-[#0F172A] dark:text-white border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
            />
            <div 
              className="absolute z-[100] w-full mt-1 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto"
              style={{ display: showOriginDropdown ? "block" : "none" }}
            >
              {(formData.origin ? COMMON_LOCATIONS.filter(loc => loc.toLowerCase().includes(formData.origin.toLowerCase())) : COMMON_LOCATIONS).map(loc => (
                <div 
                  key={loc}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent focus loss
                    setFormData({...formData, origin: loc});
                    setShowOriginDropdown(false);
                  }}
                  className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-sm text-slate-700 dark:text-slate-200"
                >
                  {loc}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-[90]">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Destination {showDestDropdown ? "(OPEN)" : "(CLOSED)"}
            </label>
            <input 
              required
              placeholder="e.g. VNR VJIET"
              value={formData.destination}
              onChange={(e) => {
                setFormData({...formData, destination: e.target.value});
                setShowDestDropdown(true);
              }}
              onFocus={() => setShowDestDropdown(true)}
              className="w-full p-4 bg-slate-50 dark:bg-[#0F172A] text-[#0F172A] dark:text-white border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
            />
            <div 
              className="absolute z-[100] w-full mt-1 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto"
              style={{ display: showDestDropdown ? "block" : "none" }}
            >
              {(formData.destination ? COMMON_LOCATIONS.filter(loc => loc.toLowerCase().includes(formData.destination.toLowerCase())) : COMMON_LOCATIONS).map(loc => (
                <div 
                  key={loc}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent focus loss
                    setFormData({...formData, destination: loc});
                    setShowDestDropdown(false);
                  }}
                  className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-sm text-slate-700 dark:text-slate-200"
                >
                  {loc}
                </div>
              ))}
            </div>
          </div>

          {possibleRoutes.length > 1 && (
            <div className="col-span-1 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Select Your Exact Route
              </label>
              <div className="space-y-3">
                {possibleRoutes.map((r, idx) => (
                  <label 
                    key={r.index}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      chosenRouteIndex === r.index 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' 
                        : 'border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/50'
                    }`}
                  >
                    <input 
                      type="radio"
                      name="route"
                      checked={chosenRouteIndex === r.index}
                      onChange={() => setChosenRouteIndex(r.index)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Option {idx + 1}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize leading-relaxed">
                        Via {r.path.join(' → ')}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Departure Date</label>
              <input 
                required
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.departure_date}
                onChange={(e) => setFormData({...formData, departure_date: e.target.value})}
                className="w-full p-4 bg-slate-50 dark:bg-[#0F172A] text-[#0F172A] dark:text-white border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Time</label>
              <input 
                required
                type="time"
                min={formData.departure_date === new Date().toISOString().split('T')[0] ? new Date().toTimeString().slice(0, 5) : undefined}
                value={formData.departure_time}
                onChange={(e) => setFormData({...formData, departure_time: e.target.value})}
                className="w-full p-4 bg-slate-50 dark:bg-[#0F172A] text-[#0F172A] dark:text-white border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Total Seats (Max: {maxSeats})</label>
            <input 
              required
              type="number"
              min="1"
              max={maxSeats}
              value={formData.total_seats}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val > maxSeats) return;
                setFormData({...formData, total_seats: val});
              }}
              className="w-full p-4 bg-slate-50 dark:bg-[#0F172A] text-[#0F172A] dark:text-white border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Total Trip Cost (₹)</label>
            <input 
              required
              type="number"
              min="0"
              value={formData.total_cost}
              onChange={(e) => setFormData({...formData, total_cost: Number(e.target.value)})}
              className="w-full p-4 bg-slate-50 dark:bg-[#0F172A] text-[#0F172A] dark:text-white border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              {formData.ride_category === 'auto_split' ? "Pricing Method" : "Price Per Seat (Calculated)"}
            </label>
            <div className="w-full p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-500/20 rounded-xl flex items-center justify-between shadow-sm">
              {formData.ride_category === 'auto_split' ? (
                <span className="text-sm">Dynamic split based on active passengers</span>
              ) : (
                <>
                  <span className="text-xl">₹{Math.ceil(formData.total_cost / formData.total_seats)}</span>
                  <span className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-medium">
                    ({formData.total_seats} seats)
                  </span>
                </>
              )}
            </div>
          </div>

          {formData.ride_category === "personal_vehicle" && (
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Vehicle Number</label>
              {((formData.vehicle_type === 'car' && userCarNumber) || (formData.vehicle_type === 'bike' && userBikeNumber)) ? (
                <div className="space-y-3">
                  <select 
                    value={vehicleEntryMode}
                    onChange={(e) => setVehicleEntryMode(e.target.value as 'profile' | 'manual')}
                    className="w-full p-4 bg-slate-50 dark:bg-[#0F172A] text-[#0F172A] dark:text-white border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all font-medium"
                  >
                    <option value="profile">{formData.vehicle_type === 'car' ? userCarNumber : userBikeNumber} (From Profile)</option>
                    <option value="manual">Use a different vehicle...</option>
                  </select>
                  
                  {vehicleEntryMode === 'manual' && (
                    <input 
                      required
                      placeholder="e.g. TS 08 AB 1234"
                      value={formData.vehicle_number}
                      onChange={(e) => setFormData({...formData, vehicle_number: e.target.value})}
                      className="w-full p-4 bg-slate-50 dark:bg-[#0F172A] text-[#0F172A] dark:text-white border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all uppercase"
                    />
                  )}
                </div>
              ) : (
                <input 
                  required
                  placeholder="TS 08 AB 1234"
                  value={formData.vehicle_number}
                  onChange={(e) => setFormData({...formData, vehicle_number: e.target.value})}
                  className="w-full p-4 bg-slate-50 dark:bg-[#0F172A] text-[#0F172A] dark:text-white border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all uppercase"
                />
              )}
            </div>
          )}
        </div>

        {userGender === 'female' && (
          <label className="flex items-center gap-3 cursor-pointer bg-pink-50 dark:bg-pink-500/10 p-4 rounded-xl border border-pink-200 dark:border-pink-500/20">
            <input 
              type="checkbox"
              checked={formData.is_women_only}
              onChange={(e) => setFormData({...formData, is_women_only: e.target.checked})}
              className="w-5 h-5 accent-pink-500"
            />
            <div>
              <span className="font-medium text-pink-700 dark:text-pink-400 block">Women-Only Ride</span>
              <span className="text-xs text-pink-600/70 dark:text-pink-400/70">Only female users will be able to see and request this ride.</span>
            </div>
          </label>
        )}

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full ui-button-primary py-4 rounded-xl font-bold flex justify-center items-center text-lg"
        >
          {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Post Ride"}
        </motion.button>
      </form>
    </div>
  );
}
