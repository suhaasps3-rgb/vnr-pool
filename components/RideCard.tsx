"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, ShieldCheck, ChevronRight, Map, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import DynamicMap from "./DynamicMap";
import { ROUTES, findLocIndex } from "@/lib/matchmaking";

// ── Seat Visual Map ────────────────────────────────────────
function SeatMap({ total, available }: { total: number; available: number }) {
  const booked = total - available;
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <svg key={i} width="14" height="16" viewBox="0 0 14 16" fill="none">
          <rect x="1" y="1" width="12" height="9" rx="2.5" fill={i < booked ? "#E24B4A" : "#1D9E75"} opacity="0.9"/>
          <rect x="2" y="10" width="10" height="4" rx="1.5" fill={i < booked ? "#E24B4A" : "#1D9E75"} opacity="0.7"/>
          <rect x="2" y="13" width="2" height="2.5" rx="0.5" fill={i < booked ? "#E24B4A" : "#1D9E75"} opacity="0.6"/>
          <rect x="10" y="13" width="2" height="2.5" rx="0.5" fill={i < booked ? "#E24B4A" : "#1D9E75"} opacity="0.6"/>
        </svg>
      ))}
      <span
        className="text-[10px] font-bold ml-1"
        style={{ color: available > 0 ? "#1D9E75" : "#E24B4A" }}
      >
        {available > 0
          ? `${available} open`
          : "Full"}
      </span>
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
  const labels: Record<string, string> = { car: "🚗 Car", auto: "🛺 Auto", bike: "🏍️ Bike" };

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
      className={`bg-white dark:bg-[#122926] border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl relative overflow-hidden transition-all duration-150 ease-out sm:hover:-translate-y-[2px] sm:hover:shadow-md ${
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
          👩 Women Only
        </div>
      )}

      <div className="p-4 sm:p-6">
        {/* ── Header: Driver + Price ── */}
        <div className="flex items-start justify-between mb-6">
          {/* Driver info */}
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#0B1F1C] dark:text-white font-bold text-lg border border-slate-200 dark:border-slate-700">
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
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#1D9E75] rounded-full flex items-center justify-center border-2 border-white dark:border-[#122926]"
                title="Verified VNRian"
              >
                <ShieldCheck className="w-3 h-3 text-white" />
              </div>
            </div>

            <div>
              <h4 className="font-bold text-base text-[#0B1F1C] dark:text-white leading-tight">
                {ride.driver?.full_name || "Unknown Driver"}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                {driverRating && (
                  <span className="text-xs font-medium text-[#EF9F27]">
                    ★ {driverRating}
                  </span>
                )}
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                  VNRian
                </span>
              </div>
            </div>
          </div>

          {/* Price badge */}
          <div className="text-right flex-shrink-0 flex flex-col items-end">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">Price</span>
            <span className="text-xl font-bold leading-none text-[#0B1F1C] dark:text-white">
              {price === 0 ? "Free" : `₹${price}`}
            </span>
            {priceNote && (
              <p className="text-[10px] mt-1 text-slate-500">
                {priceNote}
              </p>
            )}
          </div>
        </div>

        {/* ── Route Micro-Timeline ── */}
        <div className="relative pl-5 mb-6">
          {/* Solid line connector */}
          <div className="absolute left-[7px] top-3 bottom-4 w-[2px] bg-[#1D9E75] rounded-full" />

          {/* Origin */}
          <div className="relative flex items-start gap-4 mb-5">
            <div className="w-3.5 h-3.5 rounded-full bg-white dark:bg-[#122926] border-2 border-[#1D9E75] flex-shrink-0 mt-0.5 z-10 -ml-[5px]" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                Pickup
              </p>
              <p className="text-sm font-medium text-[#0B1F1C] dark:text-white leading-tight">
                {ride.origin}
              </p>
            </div>
          </div>

          {/* Destination */}
          <div className="relative flex items-start gap-4">
            <div className="w-3.5 h-3.5 rounded-full bg-[#1D9E75] flex-shrink-0 mt-0.5 z-10 -ml-[5px]" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                Dropoff
              </p>
              <p className="text-sm font-medium text-[#0B1F1C] dark:text-white leading-tight">
                {ride.destination}
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mb-5">
          {/* Departure time */}
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs font-semibold">
              {ride.departure_time
                ? format(new Date(ride.departure_time), "h:mm a, MMM d")
                : "Flexible"}
            </span>
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

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
        <div className="mb-5">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMap(!showMap); }}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1D9E75] hover:text-[#178361] transition-colors"
          >
            <Map className="w-3.5 h-3.5" />
            {showMap ? "Hide Route Map" : "View Route Map"}
          </button>

          {showMap && (
            <div className="mt-3 rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {(() => {
                let waypoints = undefined;
                if (
                  ride.chosen_route_index !== null &&
                  ride.chosen_route_index !== undefined &&
                  ROUTES[ride.chosen_route_index]
                ) {
                  const fullRoute = ROUTES[ride.chosen_route_index];
                  const oIdx = findLocIndex(fullRoute, ride.origin);
                  const dIdx = findLocIndex(fullRoute, ride.destination);
                  if (oIdx !== -1 && dIdx !== -1 && oIdx <= dIdx) {
                    waypoints = fullRoute.slice(oIdx, dIdx + 1);
                  }
                }
                return <DynamicMap origin={ride.origin} destination={ride.destination} waypoints={waypoints} />;
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
              className="flex-1 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 text-white transition-colors bg-[#1D9E75] hover:bg-[#178361] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <>
                  Request Seat
                  <ChevronRight className="w-4 h-4" />
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
            <div className="flex-1 py-3 rounded-lg font-bold text-sm text-center bg-[#EF9F27]/10 text-[#EF9F27] border border-[#EF9F27]/20">
              ⏳ Request Pending
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
            className="w-full mt-3 py-3 rounded-lg font-bold text-sm text-white transition-colors bg-[#639922] hover:bg-[#52821a]"
          >
            ✓ Complete Ride
          </button>
        )}
      </div>
    </motion.div>
  );
}
