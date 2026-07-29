"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, LocateFixed } from "lucide-react";
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
    if (formData.vehicle_type === 'auto') return 3; // auto can carry up to 3 passengers
    if (formData.vehicle_type === 'car') return 6;  // car can carry up to 6 passengers
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

    let finalVehicleNumber = formData.vehicle_number;
    if (formData.ride_category === 'personal_vehicle') {
      const hasProfileNumber = (formData.vehicle_type === 'car' && userCarNumber) || (formData.vehicle_type === 'bike' && userBikeNumber);
      if (hasProfileNumber && vehicleEntryMode === 'profile') {
        finalVehicleNumber = (formData.vehicle_type === 'car' ? userCarNumber : userBikeNumber) as string;
      }
      
      if (finalVehicleNumber) {
        const vehicleRegex = /^(AP|AR|AS|BR|CG|GA|GJ|HR|HP|JH|KA|KL|MP|MH|MN|ML|MZ|NL|OD|OR|PB|RJ|SK|TN|TS|TG|TR|UP|UK|WB|AN|CH|DD|DN|DL|JK|LA|LD|PY)\s?[0-9]{2}\s?[A-Z]{1,2}\s?[0-9]{4}$/i;
        if (!vehicleRegex.test(finalVehicleNumber.trim())) {
          toast.error("Invalid vehicle number format. Please enter a valid Indian vehicle number (e.g., TS 08 AB 1234).");
          setLoading(false);
          return;
        }
      }
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
          const res = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data) {
            const locName =
              data.poiLabel ||
              data.address?.neighbourhood ||
              data.address?.suburb ||
              data.address?.residential ||
              data.address?.village ||
              data.address?.town ||
              data.name ||
              (data.display_name ? data.display_name.split(',')[0] : 'Unknown Location');
            setFormData(prev => ({...prev, origin: locName}));
            toast.success(`📍 ${locName}`);
          } else {
            toast.error('Could not resolve location name');
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
    <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] p-4 md:p-8 mb-6 md:mb-8 shadow-sm">
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-extrabold text-[var(--text-primary)]">Offer a Ride</h2>
        <p className="text-sm md:text-base text-[var(--text-secondary)] mt-1">Fill in the details to share your journey with campus peers.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── SECTION: Trip Details ── */}
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 border-b border-[var(--border-subtle)] pb-2">
            Trip Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="text-sm font-semibold text-[var(--text-secondary)] block mb-2">Ride Category</label>
              <select 
                value={formData.ride_category}
                onChange={(e) => setFormData({...formData, ride_category: e.target.value})}
                className="w-full p-3 md:p-4 text-sm md:text-base bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
              >
                <option value="auto_split">Auto/Cab Fare Split</option>
                <option value="personal_vehicle">Student Vehicle Pool</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-[var(--text-secondary)] block mb-2">Vehicle Type</label>
              <select 
                value={formData.vehicle_type}
                onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                className="w-full p-3 md:p-4 text-sm md:text-base bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
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
                <label className="text-sm font-semibold text-[var(--text-secondary)]">
                  Origin
                </label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={gettingLocation}
                  className="text-xs font-bold text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] flex items-center gap-1 bg-[var(--accent-primary)]/10 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                >
                  {gettingLocation ? <Loader2 className="w-3 h-3 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
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
                onBlur={() => setTimeout(() => setShowOriginDropdown(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (showOriginDropdown) {
                      const matches = formData.origin ? COMMON_LOCATIONS.filter(loc => loc.toLowerCase().includes(formData.origin.toLowerCase())) : COMMON_LOCATIONS;
                      if (matches.length > 0) {
                        setFormData({...formData, origin: matches[0]});
                      }
                      setShowOriginDropdown(false);
                    }
                  }
                }}
                className="w-full p-3 md:p-4 text-sm md:text-base bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
              />
            <div 
              className="absolute z-[100] w-full mt-1 bg-[var(--bg-surface)] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto"
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
                  className="p-3 hover:bg-[var(--bg-surface-hover)] cursor-pointer text-sm text-slate-700 dark:text-slate-200"
                >
                  {loc}
                </div>
              ))}
            </div>
          </div>

            <div className="relative z-[90]">
              <label className="text-sm font-semibold text-[var(--text-secondary)] block mb-2">
                Destination
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
                onBlur={() => setTimeout(() => setShowDestDropdown(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (showDestDropdown) {
                      const matches = formData.destination ? COMMON_LOCATIONS.filter(loc => loc.toLowerCase().includes(formData.destination.toLowerCase())) : COMMON_LOCATIONS;
                      if (matches.length > 0) {
                        setFormData({...formData, destination: matches[0]});
                      }
                      setShowDestDropdown(false);
                    }
                  }
                }}
                className="w-full p-3 md:p-4 text-sm md:text-base bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
              />
            <div 
              className="absolute z-[100] w-full mt-1 bg-[var(--bg-surface)] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto"
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
                  className="p-3 hover:bg-[var(--bg-surface-hover)] cursor-pointer text-sm text-slate-700 dark:text-slate-200"
                >
                  {loc}
                </div>
              ))}
            </div>
          </div>

            {possibleRoutes.length > 0 && (
              <div className="col-span-1 md:col-span-2">
                <label className="text-sm font-semibold text-[var(--text-secondary)] block mb-2">
                  Select Your Exact Route
                </label>
                <div className="space-y-3">
                  {possibleRoutes.map((r, idx) => (
                    <label 
                      key={r.index}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        chosenRouteIndex === r.index 
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10' 
                          : 'border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50'
                      }`}
                    >
                      <input 
                        type="radio"
                        name="route"
                        checked={chosenRouteIndex === r.index}
                        onChange={() => setChosenRouteIndex(r.index)}
                        className="mt-1 w-4 h-4 text-[var(--accent-primary)] border-gray-300 focus:ring-[#1D9E75]"
                      />
                      <div>
                        <div className="font-bold text-[var(--text-primary)]">Option {idx + 1}</div>
                        <div className="text-xs text-[var(--text-secondary)] mt-1 capitalize leading-relaxed">
                          Via {r.path.join(' → ')}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── SECTION: Schedule & Capacity ── */}
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 border-b border-[var(--border-subtle)] pb-2">
            Schedule & Capacity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-[var(--text-secondary)] block mb-2">Departure Date</label>
                <input 
                  required
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.departure_date}
                  onChange={(e) => setFormData({...formData, departure_date: e.target.value})}
                  className="w-full p-3 md:p-4 text-sm md:text-base bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[var(--text-secondary)] block mb-2">Time</label>
                <input 
                  required
                  type="time"
                  min={formData.departure_date === new Date().toISOString().split('T')[0] ? new Date().toTimeString().slice(0, 5) : undefined}
                  value={formData.departure_time}
                  onChange={(e) => setFormData({...formData, departure_time: e.target.value})}
                  className="w-full p-3 md:p-4 text-sm md:text-base bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                />
              </div>
          </div>

            <div>
              <label className="text-sm font-semibold text-[var(--text-secondary)] block mb-2">
                Available {formData.vehicle_type === 'bike' ? 'Seats (Max: 1)' : `Seats (Max: ${maxSeats})`}
              </label>
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: maxSeats }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData({...formData, total_seats: num})}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                      formData.total_seats === num
                        ? 'bg-[var(--accent-primary)] text-white shadow-md'
                        : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <p className="text-xs mt-1.5 text-slate-500">
                {formData.total_seats} {formData.total_seats === 1 ? 'seat' : 'seats'} available
              </p>
            </div>
          </div>
        </div>

        {/* ── SECTION: Pricing ── */}
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 border-b border-[var(--border-subtle)] pb-2">
            Pricing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="text-sm font-semibold text-[var(--text-secondary)] block mb-2">Total Trip Cost (₹)</label>
              <input 
                required
                type="number"
                min="0"
                value={formData.total_cost}
                onChange={(e) => setFormData({...formData, total_cost: Number(e.target.value)})}
                className="w-full p-3 md:p-4 text-sm md:text-base bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[var(--text-secondary)] block mb-2">
                {formData.ride_category === 'auto_split' ? "Pricing Method" : "Price Per Seat (Calculated)"}
              </label>
              <div className="w-full p-4 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold border border-[var(--accent-primary)]/20 rounded-xl flex items-center justify-between shadow-sm">
                {formData.ride_category === 'auto_split' ? (
                  <span className="text-sm">Dynamic split based on active passengers</span>
                ) : (
                  <>
                    <span className="text-xl">₹{Math.ceil(formData.total_cost / formData.total_seats)}</span>
                    <span className="text-xs font-medium opacity-80">
                      ({formData.total_seats} seats)
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <FareSplitterSection seats={formData.total_seats} />
        </div>

        {/* ── SECTION: Preferences ── */}
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 border-b border-[var(--border-subtle)] pb-2">
            Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

          {formData.ride_category === "personal_vehicle" && (
            <div>
              <label className="text-sm font-semibold text-[var(--text-secondary)] block mb-2">Vehicle Number</label>
              {((formData.vehicle_type === 'car' && userCarNumber) || (formData.vehicle_type === 'bike' && userBikeNumber)) ? (
                <div className="space-y-3">
                  <select 
                    value={vehicleEntryMode}
                    onChange={(e) => setVehicleEntryMode(e.target.value as 'profile' | 'manual')}
                    className="w-full p-3 md:p-4 text-sm md:text-base bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all font-medium"
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
                      className="w-full p-3 md:p-4 text-sm md:text-base bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all uppercase"
                    />
                  )}
                </div>
              ) : (
                <input 
                  required
                  placeholder="TS 08 AB 1234"
                  value={formData.vehicle_number}
                  onChange={(e) => setFormData({...formData, vehicle_number: e.target.value})}
                  className="w-full p-3 md:p-4 text-sm md:text-base bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all uppercase"
                />
              )}
            </div>
          )}

          {userGender === 'female' && (
            <label className="flex items-center gap-3 cursor-pointer bg-pink-50 dark:bg-pink-500/10 p-4 rounded-xl border border-pink-200 dark:border-pink-500/20 col-span-1 md:col-span-2">
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
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-4 rounded-xl font-black text-lg flex justify-center items-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Post Ride'}
        </motion.button>
      </form>
    </div>
  );
}

// ── Collapsible Fare Splitter ──────────────────────────────
function FareSplitterSection({ seats }: { seats: number }) {
  const [open, setOpen] = useState(false);
  const [distance, setDistance] = useState(15);
  const [manualDistance, setManualDistance] = useState('');
  const [vehicle, setVehicle] = useState<'car' | 'bike'>('car');
  const [passengers, setPassengers] = useState(seats || 2);

  useEffect(() => { setPassengers(seats || 2); }, [seats]);

  let ratePerKm = 0;
  if (vehicle === 'bike') {
    ratePerKm = 2.55;
  } else {
    if (passengers >= 4) ratePerKm = 2.66;
    else if (passengers === 3) ratePerKm = 3.55;
    else if (passengers === 2) ratePerKm = 5.32;
    else ratePerKm = 10.65;
  }
  const effectiveDistance = manualDistance !== '' ? Number(manualDistance) : distance;
  const perSeat = Math.ceil(ratePerKm * effectiveDistance);
  const total = perSeat * passengers;

  return (
    <div
      className="rounded-xl overflow-hidden mt-4 border border-[var(--border-subtle)] bg-[var(--bg-primary)]"
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors"
        style={{ color: 'var(--text-secondary)' }}
      >
        <span className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Quick Fare Splitter
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {(['car', 'bike'] as const).map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setVehicle(v)}
                className="py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: vehicle === v ? 'var(--accent-primary)' : 'transparent',
                  color: vehicle === v ? 'white' : 'inherit',
                  borderColor: vehicle === v ? 'var(--accent-primary)' : 'inherit',
                }}
              >
                {v === 'car' ? 'Car' : 'Bike'}
              </button>
            ))}
          </div>

          {vehicle === 'car' && (
            <div className="flex gap-1.5 flex-wrap">
              {[1,2,3,4,5,6].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPassengers(n)}
                  className="w-9 h-9 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: passengers === n ? 'var(--accent-primary)' : 'transparent',
                    color: passengers === n ? 'white' : 'inherit',
                    borderColor: passengers === n ? 'var(--accent-primary)' : 'inherit',
                  }}
                >
                  {n}
                </button>
              ))}
              <span className="self-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {passengers} {passengers === 1 ? 'passenger' : 'passengers'}
              </span>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold" style={{ color: 'var(--text-tertiary)' }}>Distance</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={manualDistance !== '' ? manualDistance : distance}
                  onChange={e => setManualDistance(e.target.value)}
                  className="w-16 text-center text-xs font-bold rounded-lg px-2 py-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-[var(--accent-primary)]"
                />
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>km</span>
              </div>
            </div>
            <input
              type="range" min="1" max="100"
              value={manualDistance !== '' ? Number(manualDistance) : distance}
              onChange={e => { setDistance(Number(e.target.value)); setManualDistance(''); }}
              className="w-full h-1.5 rounded-full"
            />
          </div>

          <div
            className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
          >
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Per Seat</div>
              <div className="text-xl font-black text-[var(--text-primary)]">₹{perSeat}</div>
            </div>
            <div className="w-px h-8 bg-[var(--border-subtle)]" />
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--accent-primary)]">Total Fare</div>
              <div className="text-2xl font-black text-[var(--accent-primary)]">₹{total}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
