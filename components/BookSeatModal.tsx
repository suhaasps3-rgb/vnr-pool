import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function BookSeatModal({ 
  ride, 
  isOpen, 
  onClose, 
  onConfirm, 
  isProcessing,
  price
}: { 
  ride: any, 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  isProcessing: boolean,
  price: number
}) {
  if (!ride) return null;

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
            className="relative z-10 w-full max-w-md bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Confirm Booking</h3>
                <button 
                  onClick={!isProcessing ? onClose : undefined}
                  className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Driver</span>
                  <span className="font-bold text-slate-900 dark:text-white">{ride.driver?.full_name}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Departure Time</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {ride.departure_time ? format(new Date(ride.departure_time), "h:mm a, MMM d") : "N/A"}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                  <span className="text-blue-700 dark:text-blue-300 font-medium">Estimated Fuel Split</span>
                  <span className="font-black text-xl text-blue-700 dark:text-blue-400">
                    ₹{price}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl border border-yellow-200 dark:border-yellow-500/20 mb-6">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  By confirming, you commit to paying your share of the fuel cost directly to the driver upon completion of the ride.
                </p>
              </div>

              <button
                onClick={onConfirm}
                disabled={isProcessing}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isProcessing 
                    ? 'bg-blue-400 dark:bg-blue-600/50 cursor-not-allowed text-white' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/25'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : (
                  "Confirm Seat Booking"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
