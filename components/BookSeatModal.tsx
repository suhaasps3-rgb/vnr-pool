import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Loader2, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { DISTANCE_MAP } from "@/lib/locations";
import { calculateFractionalPrice, calculateDynamicOverlappingSplit, ROUTES, findLocIndex } from "@/lib/matchmaking";

export default function BookSeatModal({ 
  ride, 
  isOpen, 
  onClose, 
  onConfirm, 
  isProcessing,
  initialPickup,
  initialDropoff
}: { 
  ride: any, 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: (pickup: string, dropoff: string, price: number) => void, 
  isProcessing: boolean,
  initialPickup?: string,
  initialDropoff?: string
}) {
  const [pickup, setPickup] = useState(initialPickup || "");
  const [dropoff, setDropoff] = useState(initialDropoff || "");
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  const isToVnr = ride?.destination?.toLowerCase().includes('vnr');
  const isFromVnr = ride?.origin?.toLowerCase().includes('vnr');

  useEffect(() => {
    if (ride) {
      setPickup(isFromVnr ? ride.origin : (initialPickup || ride.origin));
      setDropoff(isToVnr ? ride.destination : (initialDropoff || ride.destination));
    }
  }, [ride, initialPickup, initialDropoff, isToVnr, isFromVnr]);

  useEffect(() => {
    if (ride && pickup && dropoff) {
      if (ride.ride_category === 'auto_split') {
        // Build list of already-approved passengers from the ride's bookings
        const approvedPassengers = (ride.bookings || [])
          .filter((b: any) => b.status === 'approved')
          .map((b: any) => ({ id: b.passenger_id, pickup: b.pickup_location, dropoff: b.dropoff_location }))
          .filter((b: any) => b.pickup && b.dropoff);

        // Simulate this user joining on top of existing passengers
        const isAuto = ride.ride_category === 'auto_split';
        const split = calculateDynamicOverlappingSplit(
          ride.origin, ride.destination, ride.price_per_seat, ride.total_seats, isAuto,
          [...approvedPassengers, { id: '__me__', pickup, dropoff }]
        );

        if (split && split.passengerShares['__me__']) {
          setCalculatedPrice(split.passengerShares['__me__']);
        } else {
          // Fallback to fractional if location not found in distance map
          setCalculatedPrice(calculateFractionalPrice(ride.origin, ride.destination, pickup, dropoff, ride.price_per_seat));
        }
      } else {
        setCalculatedPrice(calculateFractionalPrice(ride.origin, ride.destination, pickup, dropoff, ride.price_per_seat));
      }
    }
  }, [ride, pickup, dropoff]);

  if (!ride) return null;

  // Determine valid locations based on the driver's chosen route
  let validLocations = Object.keys(DISTANCE_MAP);
  if (ride.chosen_route_index !== null && ride.chosen_route_index !== undefined && ROUTES[ride.chosen_route_index]) {
    const fullRoute = ROUTES[ride.chosen_route_index];
    const dStart = findLocIndex(fullRoute, ride.origin);
    const dEnd = findLocIndex(fullRoute, ride.destination);
    
    if (dStart !== -1 && dEnd !== -1) {
      const minIdx = Math.min(dStart, dEnd);
      const maxIdx = Math.max(dStart, dEnd);
      validLocations = fullRoute.slice(minIdx, maxIdx + 1);
    } else {
      validLocations = fullRoute;
    }
  }

  // Validate that at least one location is VNR
  const isVnrPresent = pickup.toLowerCase().includes('vnr') || dropoff.toLowerCase().includes('vnr');
  // Ensure the route is somewhat valid (different points)
  const isSameLocation = pickup?.toLowerCase() === dropoff?.toLowerCase();
  const canSubmit = isVnrPresent && !isSameLocation && pickup && dropoff;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isProcessing ? onClose : undefined}
            className="absolute inset-0 bg-[#0B1F1C]/60 backdrop-blur-sm"
          ></motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-md bg-[var(--bg-surface)] rounded-2xl shadow-xl border border-[var(--border-subtle)] flex flex-col max-h-[90vh]"
          >
            <div className="p-6 pb-4 border-b border-[var(--border-subtle)] shrink-0 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Confirm Boarding</h3>
              <button 
                onClick={!isProcessing ? onClose : undefined}
                className="p-2 bg-[var(--bg-primary)] hover:bg-[var(--bg-surface-hover)] rounded-full transition-colors text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-[var(--text-secondary)] font-medium">Driver</span>
                  <span className="font-bold text-[var(--text-primary)]">{ride.driver?.full_name}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-[var(--text-secondary)] font-medium">Departure</span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {ride.departure_time ? format(new Date(ride.departure_time), "h:mm a, MMM d") : "N/A"}
                  </span>
                </div>

                <div className="bg-[var(--accent-primary)]/10 p-4 rounded-xl border border-[var(--accent-primary)]/20 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-2">Pickup Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent-primary)]" />
                      {isFromVnr ? (
                        <div className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-[var(--border-subtle)] rounded-lg text-sm font-semibold text-[var(--text-secondary)] capitalize cursor-not-allowed flex items-center">
                          {ride.origin}
                        </div>
                      ) : (
                        <select 
                          value={pickup} 
                          onChange={(e) => setPickup(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] capitalize"
                        >
                          {!validLocations.includes(ride.origin) && !ride.origin.toLowerCase().includes('vnr') && (
                            <option value={ride.origin}>{ride.origin} (Driver's Start)</option>
                          )}
                          {validLocations.filter(loc => !loc.toLowerCase().includes('vnr')).map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    {isFromVnr && <p className="text-[10px] text-[var(--accent-primary)] mt-1 font-medium">* Pickup is locked to VNR VJIET for this route.</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-2">Dropoff Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent-primary)]" />
                      {isToVnr ? (
                        <div className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-[var(--border-subtle)] rounded-lg text-sm font-semibold text-[var(--text-secondary)] capitalize cursor-not-allowed flex items-center">
                          {ride.destination}
                        </div>
                      ) : (
                        <select 
                          value={dropoff} 
                          onChange={(e) => setDropoff(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] capitalize"
                        >
                          {!validLocations.includes(ride.destination) && !ride.destination.toLowerCase().includes('vnr') && (
                            <option value={ride.destination}>{ride.destination} (Driver's End)</option>
                          )}
                          {validLocations.filter(loc => !loc.toLowerCase().includes('vnr')).map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    {isToVnr && <p className="text-[10px] text-[var(--accent-primary)] mt-1 font-medium">* Dropoff is locked to VNR VJIET for this route.</p>}
                  </div>
                  
                  {!isVnrPresent && (
                    <div className="text-red-500 text-xs font-bold mt-2">
                      * At least one location (Pickup or Dropoff) must be VNR VJIET.
                    </div>
                  )}
                  {isSameLocation && (
                    <div className="text-red-500 text-xs font-bold mt-2">
                      * Pickup and Dropoff cannot be the same.
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-[var(--border-subtle)]">
                  <div>
                    <span className="text-[var(--text-primary)] font-medium">Dynamic Split Price</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">Based on your route segment & co-passengers</p>
                  </div>
                  <span className="font-black text-2xl text-[var(--accent-primary)]">
                    ₹{calculatedPrice}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-[#EF9F27]/10 rounded-xl border border-[#EF9F27]/20 mb-6">
                <AlertCircle className="w-5 h-5 text-[#EF9F27] shrink-0 mt-0.5" />
                <p className="text-sm text-[#EF9F27]">
                  By confirming, you commit to paying your share of the fuel cost directly to the driver.
                </p>
              </div>
            </div>

            <div className="p-6 pt-4 border-t border-[var(--border-subtle)] shrink-0">
              <button
                onClick={() => onConfirm(pickup, dropoff, calculatedPrice)}
                disabled={isProcessing || !canSubmit}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isProcessing || !canSubmit
                    ? 'bg-[var(--bg-primary)] text-slate-400 cursor-not-allowed' 
                    : 'bg-[var(--accent-primary)] hover:bg-[#178361] text-white shadow-sm'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Sending Request...
                  </>
                ) : (
                  "Request Seat"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
