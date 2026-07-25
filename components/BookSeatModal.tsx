import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Loader2, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { DISTANCE_MAP } from "@/lib/locations";
import { calculateFractionalPrice, ROUTES } from "@/lib/matchmaking";

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
      setCalculatedPrice(calculateFractionalPrice(ride.origin, ride.destination, pickup, dropoff, ride.price_per_seat));
    }
  }, [ride, pickup, dropoff]);

  if (!ride) return null;

  // Determine valid locations based on the driver's chosen route
  const validLocations = (ride.chosen_route_index !== null && ride.chosen_route_index !== undefined && ROUTES[ride.chosen_route_index])
    ? ROUTES[ride.chosen_route_index]
    : Object.keys(DISTANCE_MAP);

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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          ></motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-md bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh]"
          >
            <div className="p-6 pb-4 border-b border-slate-100 dark:border-white/5 shrink-0 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Confirm Boarding</h3>
              <button 
                onClick={!isProcessing ? onClose : undefined}
                className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Driver</span>
                  <span className="font-bold text-slate-900 dark:text-white">{ride.driver?.full_name}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Departure</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {ride.departure_time ? format(new Date(ride.departure_time), "h:mm a, MMM d") : "N/A"}
                  </span>
                </div>

                <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-2">Pickup Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                      {isFromVnr ? (
                        <div className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-semibold text-gray-500 dark:text-gray-400 capitalize cursor-not-allowed flex items-center">
                          {ride.origin}
                        </div>
                      ) : (
                        <select 
                          value={pickup} 
                          onChange={(e) => setPickup(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1E293B] border border-blue-200 dark:border-blue-500/30 rounded-lg text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
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
                    {isFromVnr && <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 font-medium">* Pickup is locked to VNR VJIET for this route.</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-2">Dropoff Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                      {isToVnr ? (
                        <div className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-semibold text-gray-500 dark:text-gray-400 capitalize cursor-not-allowed flex items-center">
                          {ride.destination}
                        </div>
                      ) : (
                        <select 
                          value={dropoff} 
                          onChange={(e) => setDropoff(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1E293B] border border-blue-200 dark:border-blue-500/30 rounded-lg text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
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
                    {isToVnr && <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 font-medium">* Dropoff is locked to VNR VJIET for this route.</p>}
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

                <div className="flex justify-between items-center p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                  <span className="text-emerald-700 dark:text-emerald-300 font-medium">Fractional Price</span>
                  <span className="font-black text-2xl text-emerald-700 dark:text-emerald-400">
                    ₹{calculatedPrice}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl border border-yellow-200 dark:border-yellow-500/20 mb-6">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  By confirming, you commit to paying your share of the fuel cost directly to the driver.
                </p>
              </div>
            </div>

            <div className="p-6 pt-4 border-t border-slate-100 dark:border-white/5 shrink-0">
              <button
                onClick={() => onConfirm(pickup, dropoff, calculatedPrice)}
                disabled={isProcessing || !canSubmit}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isProcessing || !canSubmit
                    ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/25'
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
