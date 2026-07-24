"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function OfferSeatForm({ userId, onVehicleSelect }: { userId: string, onVehicleSelect: (v: "car" | "auto" | "bike") => void }) {
  const [loading, setLoading] = useState(false);
  const [userGender, setUserGender] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.from('users').select('gender').eq('id', userId).single().then(({ data }) => {
      if (data) setUserGender(data.gender);
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
  }, [formData.vehicle_type, formData.ride_category, maxSeats]);

  useEffect(() => {
    onVehicleSelect(formData.vehicle_type as "car" | "auto" | "bike");
  }, [formData.vehicle_type, onVehicleSelect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    try {
      const departureTimeUTC = new Date(`${formData.departure_date}T${formData.departure_time}`).toISOString();
      const { error } = await supabase.from('rides').insert({
        driver_id: userId,
        ride_category: formData.ride_category,
        origin: formData.origin,
        destination: formData.destination,
        departure_time: departureTimeUTC,
        vehicle_type: formData.vehicle_type,
        vehicle_number: formData.vehicle_number || null,
        total_seats: Number(formData.total_seats),
        available_seats: Number(formData.total_seats),
        price_per_seat: Math.ceil(Number(formData.total_cost) / (formData.ride_category === 'auto_split' ? Number(formData.total_seats) + 1 : Number(formData.total_seats))),
        is_women_only: formData.is_women_only,
        status: 'active'
      });

      if (error) throw error;
      toast.success("Ride posted successfully!");
      // Reset form
      setFormData({
        ...formData,
        origin: "",
        departure_date: "",
        departure_time: "",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to post ride.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ui-card p-6 md:p-8">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Post a New Ride</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Ride Category</label>
            <select 
              value={formData.ride_category}
              onChange={(e) => setFormData({...formData, ride_category: e.target.value})}
              className="w-full p-3 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            >
              <option value="auto_split">Auto/Cab Fare Split</option>
              <option value="personal_vehicle">Student Vehicle Pool</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Vehicle Type</label>
            <select 
              value={formData.vehicle_type}
              onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
              className="w-full p-3 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            >
              <option value="auto">Auto</option>
              <option value="car">Car</option>
              {formData.ride_category === 'personal_vehicle' && (
                <option value="bike">Bike</option>
              )}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Origin</label>
            <input 
              required
              placeholder="e.g. JNTU Metro"
              value={formData.origin}
              onChange={(e) => setFormData({...formData, origin: e.target.value})}
              className="w-full p-3 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Destination</label>
            <input 
              required
              value={formData.destination}
              onChange={(e) => setFormData({...formData, destination: e.target.value})}
              className="w-full p-3 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Departure Date</label>
              <input 
                required
                type="date"
                value={formData.departure_date}
                onChange={(e) => setFormData({...formData, departure_date: e.target.value})}
                className="w-full p-3 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Time</label>
              <input 
                required
                type="time"
                value={formData.departure_time}
                onChange={(e) => setFormData({...formData, departure_time: e.target.value})}
                className="w-full p-3 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Total Seats (Max: {maxSeats})</label>
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
              className="w-full p-3 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Total Trip Cost (₹)</label>
            <input 
              required
              type="number"
              min="0"
              value={formData.total_cost}
              onChange={(e) => setFormData({...formData, total_cost: Number(e.target.value)})}
              className="w-full p-3 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Price Per Seat (Calculated)</label>
            <div className="w-full p-3 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-bold border border-green-200 dark:border-green-500/20 rounded-xl flex items-center justify-between">
              <span>₹{Math.ceil(formData.total_cost / (formData.ride_category === 'auto_split' ? formData.total_seats + 1 : formData.total_seats))}</span>
              <span className="text-xs text-green-600/70 dark:text-green-400/70 font-normal">
                ({formData.total_seats} seats{formData.ride_category === 'auto_split' ? " + 1 driver" : ""})
              </span>
            </div>
          </div>

          {formData.ride_category === "personal_vehicle" && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Vehicle Number</label>
              <input 
                placeholder="TS 08 AB 1234"
                value={formData.vehicle_number}
                onChange={(e) => setFormData({...formData, vehicle_number: e.target.value})}
                className="w-full p-3 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all uppercase"
              />
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
