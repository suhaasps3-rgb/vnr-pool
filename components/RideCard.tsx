"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ShieldCheck, ChevronRight, Map, MessageCircle, Share2 } from "lucide-react";
import { format } from "date-fns";
import DynamicRouteMap from "./DynamicRouteMap";
import { ROUTES, findLocIndex } from "@/lib/matchmaking";

// ── Seat Visual Map ────────────────────────────────────────
function SeatMap({ total, available }: { total: number; available: number }) {
  const booked = total - available;
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <svg key={i} width="14" height="16" viewBox="0 0 14 16" fill="none">
          <rect x="1" y="1" width="12" height="9" rx="2.5" fill={i < booked ? "#EF4444" : "#10B981"} opacity="0.9"/>
          <rect x="2" y="10" width="10" height="4" rx="1.5" fill={i < booked ? "#EF4444" : "#10B981"} opacity="0.7"/>
          <rect x="2" y="13" width="2" height="2.5" rx="0.5" fill={i < booked ? "#EF4444" : "#10B981"} opacity="0.6"/>
          <rect x="10" y="13" width="2" height="2.5" rx="0.5" fill={i < booked ? "#EF4444" : "#10B981"} opacity="0.6"/>
        </svg>
      ))}
      <div className="relative overflow-hidden h-4 flex items-center ml-1">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={available}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -15, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="text-[10px] font-bold uppercase tracking-wider inline-block"
            style={{ color: available > 0 ? "#10B981" : "#EF4444" }}
          >
            {available > 0
              ? `${available} ${available === 1 ? 'Seat' : 'Seats'}`
              : "Full"}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Vehicle Type Badge ─────────────────────────────────────
function VehicleTag({ type, vehicleNumber }: { type: string; vehicleNumber?: string }) {
  const colors: Record<string, string> = {
    car: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    auto: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    bike: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  };
  const labels: Record<string, string> = { car: "Car", auto: "Auto", bike: "Bike" };

  // Mask vehicle number: show first 2 + last 4 only
  const maskedNumber = vehicleNumber
    ? vehicleNumber.length > 4
      ? vehicleNumber.slice(0, 2) + " •••• " + vehicleNumber.slice(-4)
      : vehicleNumber
    : null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
        {labels[type] || type}
      </span>
      {maskedNumber && (
        <span className="text-[10px] font-mono text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-full">
          {maskedNumber}
        </span>
      )}
    </div>
  );
}

// ── Main RideCard Component ────────────────────────────────
export default function RideCard({
  ride,
  price,
  priceNote,
  isApproved,
  hasRequested,
  isDriver,
  mode,
  onBookClick,
  onCancelClick,
  onCompleteClick,
  onChatClick,
  isProcessing,
}: {
  ride: any;
  price: number;
  priceNote?: string;
  isApproved: boolean;
  hasRequested: boolean;
  isDriver: boolean;
  mode: string;
  onBookClick: () => void;
  onCancelClick: () => void;
  onCompleteClick?: () => void;
  onChatClick?: () => void;
  isProcessing: boolean;
}) {
  const [showMap, setShowMap] = useState(false);
  const driverRating = ride.driver?.rating_count > 0 
    ? (ride.driver.rating_sum / ride.driver.rating_count).toFixed(1) 
    : null;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: {
          opacity: 1, y: 0,
          transition: { type: "tween", ease: "easeOut", duration: 0.15 },
        },
      }}
      className={`ui-card rounded-2xl relative overflow-hidden ${
        ride.status === "cancelled" ? "opacity-60 grayscale" : ""
      }`}
    >

      {/* Status badges */}
      {ride.status === "cancelled" && (
        <div className="absolute top-4 left-4 bg-[#E24B4A]/10 text-[#E24B4A] px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-[#E24B4A]/20 z-10">
          Cancelled
        </div>
      )}
      {ride.status === "in_progress" && (
        <div className="absolute top-4 left-4 bg-[#EF9F27]/10 text-[#EF9F27] px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-[#EF9F27]/20 z-10 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#EF9F27] rounded-full animate-pulse" />
          Live
        </div>
      )}
      {ride.status === "completed" && (
        <div className="absolute top-4 left-4 bg-[#639922]/10 text-[#639922] px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-[#639922]/20 z-10">
          Completed
        </div>
      )}
      {ride.is_women_only && (
        <div className="absolute top-4 right-4 bg-pink-500/10 text-pink-500 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-pink-500/20 z-10">
          Women Only
        </div>
      )}

      <div className="p-4 sm:p-6">
        {/* ── Header: Driver + Price ── */}
        <div className="flex items-start justify-between mb-8">
          {/* Driver info */}
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-[var(--bg-surface-hover)] flex items-center justify-center text-[var(--text-primary)] font-bold text-xl border border-[var(--border-subtle)] shadow-sm">
                {ride.driver?.avatar_url ? (
                  <img
                    src={ride.driver.avatar_url}
                    alt={ride.driver.full_name || "Driver"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  ride.driver?.full_name?.charAt(0).toUpperCase() || "?"
                )}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--accent-primary)] rounded-full flex items-center justify-center border-2 border-[var(--bg-surface)] shadow-sm"
                title="Verified VNRian"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg text-[var(--text-primary)] leading-tight tracking-tight">
                {ride.driver?.full_name || "Unknown Driver"}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                {driverRating && (
                  <span className="text-[11px] font-bold text-[var(--accent-warning)] bg-[var(--accent-warning)]/10 px-1.5 py-0.5 rounded-md">
                    ★ {driverRating}
                  </span>
                )}
                <span className="text-[10px] font-bold text-[var(--accent-primary)] uppercase tracking-wider bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded-full">
                  VNRian
                </span>
              </div>
            </div>
          </div>

          {/* Floating Price Badge & Share */}
          <div className="flex-shrink-0 flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1.5">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const time = ride.departure_time ? format(new Date(ride.departure_time), "h:mm a, MMM d") : "N/A";
                  const text = `🚗 VNR Pool Ride Available!\n📍 From: ${ride.origin}\n🏁 To: ${ride.destination}\n🕒 At: ${time}\n💵 Price: ₹${price}\n\nBook your seat now: ${window.location.origin}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="p-1.5 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                title="Share on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Cost</span>
            </div>
            <div className="bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 px-3 py-1.5 rounded-xl text-right">
              <span className="text-2xl font-black text-[var(--accent-primary)]">
                {price === 0 ? "Free" : `₹${price}`}
              </span>
            </div>
          </div>
        </div>

        {/* ── Route Micro-Timeline ── */}
        <div className="relative pl-[22px] mb-8">
          {/* Solid line connector */}
          <div className="absolute left-[7px] top-4 bottom-5 w-[2px] bg-gradient-to-b from-[var(--border-subtle)] via-[var(--border-subtle)] to-[var(--accent-primary)] rounded-full" />

          {/* Origin */}
          <div className="relative flex items-start gap-4 mb-6">
            <div className="absolute -left-[20.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[var(--text-secondary)] shadow-[0_0_0_4px_var(--bg-surface)] z-10" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-0.5">
                Pickup
              </p>
              <p className="text-base font-semibold text-[var(--text-primary)] leading-tight">
                {ride.origin}
              </p>
            </div>
          </div>

          {/* Destination */}
          <div className="relative flex items-start gap-4">
            <div className="absolute -left-[20.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_0_4px_var(--bg-surface)] z-10" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-0.5">
                Dropoff
              </p>
              <p className="text-base font-semibold text-[var(--text-primary)] leading-tight">
                {ride.destination}
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] mb-5">
          {/* Departure time */}
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs font-bold">
              {ride.departure_time
                ? format(new Date(ride.departure_time), "h:mm a, MMM d")
                : "Flexible"}
            </span>
          </div>

          <div className="w-px h-6 bg-[var(--border-subtle)]" />

          {/* Visual seat map */}
          <SeatMap total={ride.total_seats} available={ride.available_seats} />
        </div>

        {/* ── Vehicle Tag ── */}
        <div className="mb-4">
          <VehicleTag
            type={ride.vehicle_type}
            vehicleNumber={
              // Only show plate in my-rides / booked states (data masking for public feed)
              mode !== "feed" ? ride.vehicle_number : undefined
            }
          />
        </div>

        {/* ── Map Toggle ── */}
        <div className="mb-5 pt-4 border-t border-gray-100 dark:border-white/5">
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              setShowMap(!showMap); 
            }}
            className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${showMap ? 'bg-[#0F172A] text-white shadow-lg' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'}`}
          >
            <Map className="w-4 h-4" />
            {showMap ? "Hide Route Map" : "View Route Map"}
          </button>

          {showMap && (
            <div className="mt-4 w-full h-48 md:h-64 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
              {(() => {
                let waypoints: string[] = [];
                if (
                  ride.chosen_route_index !== null &&
                  ride.chosen_route_index !== undefined &&
                  ROUTES[ride.chosen_route_index]
                ) {
                  const fullRoute = ROUTES[ride.chosen_route_index];
                  const oIdx = findLocIndex(fullRoute, ride.origin);
                  const dIdx = findLocIndex(fullRoute, ride.destination);
                  
                  if (oIdx !== -1 && dIdx !== -1) {
                    if (oIdx <= dIdx) {
                      waypoints = fullRoute.slice(oIdx, dIdx + 1);
                    } else {
                      waypoints = fullRoute.slice(dIdx, oIdx + 1).reverse();
                    }
                  }
                }
                
                if (waypoints.length === 0) {
                   waypoints = [ride.origin, ride.destination];
                }
                
                return <DynamicRouteMap waypoints={waypoints} className="h-full w-full" />;
              })()}
            </div>
          )}
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex gap-3">
          {/* PUBLIC FEED: Single "Request Seat" CTA only — no driver actions */}
          {mode === "feed" && !isDriver && !hasRequested && ride.available_seats > 0 && ride.status === "active" && (
            <button
              onClick={onBookClick}
              disabled={isProcessing}
              className="btn-primary flex-1 py-4 rounded-xl font-black text-[15px] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <>
                  Request Seat
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}

          {/* No available seats */}
          {mode === "feed" && !isDriver && !hasRequested && ride.available_seats === 0 && ride.status === "active" && (
            <div className="flex-1 py-3 rounded-lg font-bold text-sm text-center bg-slate-100 dark:bg-slate-800 text-slate-500">
              Ride Full
            </div>
          )}

          {/* Pending request */}
          {hasRequested && !isApproved && !isDriver && (
            <div className="flex-1 py-3 rounded-lg font-bold text-sm text-center bg-[var(--accent-warning)]/10 text-[var(--accent-warning)] border border-[var(--accent-warning)]/20">
              Request Pending
            </div>
          )}

          {/* Approved / driver — chat + cancel */}
          {(isApproved || isDriver) && ride.status !== "cancelled" && (
            <>
              {onChatClick && (
                <button
                  onClick={onChatClick}
                  className="p-3 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#1D9E75]"
                  disabled={isProcessing}
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onCancelClick}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 bg-[#E24B4A]/10 text-[#E24B4A] hover:bg-[#E24B4A]/20"
              >
                Cancel {isApproved ? "Seat" : "Ride"}
              </button>
            </>
          )}
        </div>

        {/* Driver: Complete Ride */}
        {isDriver && ride.status === "in_progress" && (
          <button
            onClick={onCompleteClick}
            className="w-full mt-3 py-4 rounded-xl font-black text-sm text-white transition-colors bg-[var(--accent-success)] hover:opacity-90"
          >
            Complete Ride
          </button>
        )}
      </div>
    </motion.div>
  );
}
