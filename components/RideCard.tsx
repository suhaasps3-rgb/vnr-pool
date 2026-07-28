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
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <svg key={i} width="14" height="16" viewBox="0 0 14 16" fill="none">
          {/* Seat back */}
          <rect x="1" y="1" width="12" height="9" rx="2.5" fill={i < booked ? "#EF4444" : "#10B981"} opacity="0.9"/>
          {/* Seat base */}
          <rect x="2" y="10" width="10" height="4" rx="1.5" fill={i < booked ? "#EF4444" : "#10B981"} opacity="0.7"/>
          {/* Legs */}
          <rect x="2" y="13" width="2" height="2.5" rx="0.5" fill={i < booked ? "#DC2626" : "#059669"} opacity="0.6"/>
          <rect x="10" y="13" width="2" height="2.5" rx="0.5" fill={i < booked ? "#DC2626" : "#059669"} opacity="0.6"/>
        </svg>
      ))}
      <span
        className="text-[10px] font-bold ml-1"
        style={{ color: available > 0 ? "#10B981" : "#EF4444" }}
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
      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${colors[type] || colors.car}`}>
        {labels[type] || type}
      </span>
      {maskedNumber && (
        <span className="text-[10px] font-mono text-[color:var(--text-secondary)] bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">
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

  const glowMap: Record<string, string> = {
    car: "rgba(99,102,241,0.3)",
    auto: "rgba(16,185,129,0.3)",
    bike: "rgba(168,85,247,0.3)",
  };
  const glowColor = glowMap[ride.vehicle_type] || glowMap.car;

  const driverRating =
    ride.driver?.rating_count > 0
      ? (ride.driver.rating_sum / ride.driver.rating_count).toFixed(1)
      : null;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24, scale: 0.97 },
        show: {
          opacity: 1, y: 0, scale: 1,
          transition: { type: "spring", stiffness: 220, damping: 22 },
        },
      }}
      whileHover={{ y: -3, boxShadow: `0 16px 40px ${glowColor}` }}
      className={`glass-card rounded-3xl relative overflow-hidden transition-all duration-300 ${
        ride.status === "cancelled" ? "opacity-60 grayscale" : ""
      }`}
    >
      {/* Vehicle watermark (dark mode only) */}
      <div
        className="ride-card-watermark absolute bottom-3 right-4 w-24 h-16 pointer-events-none select-none"
        aria-hidden
      >
        {ride.vehicle_type === "car" && (
          <svg viewBox="0 0 80 40" fill="white" opacity="0.06">
            <path d="M10 28 L14 16 Q16 12 20 12 L60 12 Q64 12 66 16 L70 28 L72 30 L72 36 L8 36 L8 30 Z"/>
            <circle cx="20" cy="36" r="6"/><circle cx="60" cy="36" r="6"/>
          </svg>
        )}
        {ride.vehicle_type === "auto" && (
          <svg viewBox="0 0 80 40" fill="white" opacity="0.06">
            <path d="M8 30 L12 16 Q14 12 18 12 L50 12 Q54 12 56 16 L60 30 L62 36 L6 36 Z"/>
            <circle cx="16" cy="36" r="5"/><circle cx="54" cy="36" r="5"/>
          </svg>
        )}
        {ride.vehicle_type === "bike" && (
          <svg viewBox="0 0 80 40" fill="white" opacity="0.06">
            <circle cx="16" cy="30" r="10" stroke="white" strokeWidth="3" fill="none"/>
            <circle cx="64" cy="30" r="10" stroke="white" strokeWidth="3" fill="none"/>
            <path d="M16 30 L36 14 L50 18 L64 30" stroke="white" strokeWidth="3" fill="none"/>
            <path d="M36 14 L40 8 L48 8 L50 18" stroke="white" strokeWidth="2" fill="none"/>
          </svg>
        )}
      </div>

      {/* Status badges */}
      {ride.status === "cancelled" && (
        <div className="absolute top-3 left-3 bg-red-500/20 text-red-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-red-500/30 z-10">
          Cancelled
        </div>
      )}
      {ride.status === "in_progress" && (
        <div className="absolute top-3 left-3 bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-blue-500/30 z-10 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          Live
        </div>
      )}
      {ride.status === "completed" && (
        <div className="absolute top-3 left-3 bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-emerald-500/30 z-10">
          Completed
        </div>
      )}
      {ride.is_women_only && (
        <div className="absolute top-3 right-3 bg-pink-500/10 text-pink-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-pink-500/20 z-10">
          👩 Women Only
        </div>
      )}

      <div className="p-5">
        {/* ── Header: Driver + Price ── */}
        <div className="flex items-start justify-between mb-5">
          {/* Driver info */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-indigo-400/40 bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-black text-base shadow-md">
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
              {/* Verified badge */}
              <div
                className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-indigo-500 rounded-full flex items-center justify-center border-2 shadow-sm"
                style={{ borderColor: "var(--bg-surface)", width: 18, height: 18 }}
                title="Verified VNRian"
              >
                <ShieldCheck className="w-2.5 h-2.5 text-white" />
              </div>
            </div>

            {/* Name + rating */}
            <div>
              <h4 className="font-bold text-sm leading-tight" style={{ color: "var(--text-primary)" }}>
                {ride.driver?.full_name || "Unknown Driver"}
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                {driverRating && (
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                    ★ {driverRating}
                  </span>
                )}
                <span className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded-full">
                  VNRian
                </span>
              </div>
            </div>
          </div>

          {/* Price badge — Electric Purple, commanding visual weight */}
          <div className="text-right flex-shrink-0">
            <div
              className="price-badge inline-flex flex-col items-end px-3 py-2 rounded-2xl"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">per seat</span>
              <span className="text-2xl font-black leading-none" style={{ color: "var(--accent-price)" }}>
                {price === 0 ? "Free" : `₹${price}`}
              </span>
            </div>
            {priceNote && (
              <p className="text-[10px] mt-1" style={{ color: "var(--text-secondary)" }}>
                {priceNote}
              </p>
            )}
          </div>
        </div>

        {/* ── Route Micro-Timeline ── */}
        <div className="relative pl-5 mb-4">
          {/* Vertical dotted line connector */}
          <div
            className="absolute left-[7px] top-3 bottom-3 w-px"
            style={{
              backgroundImage: "repeating-linear-gradient(to bottom, #94A3B8 0px, #94A3B8 4px, transparent 4px, transparent 8px)",
            }}
          />

          {/* Origin */}
          <div className="relative flex items-start gap-3 mb-4">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-slate-500 ring-4 ring-white/60 dark:ring-slate-900/60 flex-shrink-0 mt-0.5 z-10" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                Pickup
              </p>
              <p className="text-sm font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
                {ride.origin}
              </p>
            </div>
          </div>

          {/* Destination */}
          <div className="relative flex items-start gap-3">
            <div
              className="w-3.5 h-3.5 rounded-full flex-shrink-0 mt-0.5 z-10"
              style={{
                background: "var(--accent-price)",
                boxShadow: `0 0 10px var(--accent-price)`,
              }}
            />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "var(--accent-price)" }}>
                Dropoff
              </p>
              <p className="text-sm font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
                {ride.destination}
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div
          className="flex items-center justify-between px-3 py-2.5 rounded-2xl mb-4"
          style={{ background: "var(--bg-primary)", border: "1px solid var(--border-subtle)" }}
        >
          {/* Departure time */}
          <div className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-xs font-semibold">
              {ride.departure_time
                ? format(new Date(ride.departure_time), "h:mm a, MMM d")
                : "Flexible"}
            </span>
          </div>

          <div className="w-px h-5" style={{ background: "var(--border-subtle)" }} />

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
        <div className="mb-4">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMap(!showMap); }}
            className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
            style={{ color: "var(--text-secondary)" }}
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
        <div className="flex gap-2">
          {/* PUBLIC FEED: Single "Request Seat" CTA only — no driver actions */}
          {mode === "feed" && !isDriver && !hasRequested && ride.available_seats > 0 && ride.status === "active" && (
            <button
              onClick={onBookClick}
              disabled={isProcessing}
              className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: isProcessing
                  ? "var(--accent-price)"
                  : "linear-gradient(135deg, #A855F7, #7C3AED)",
                boxShadow: isProcessing ? "none" : "0 6px 20px rgba(168,85,247,0.4)",
              }}
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
            <div
              className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-center"
              style={{
                background: "var(--bg-primary)",
                color: "var(--text-tertiary)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              Ride Full
            </div>
          )}

          {/* Pending request */}
          {hasRequested && !isApproved && !isDriver && (
            <div
              className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-center"
              style={{
                background: "rgba(245, 158, 11, 0.08)",
                color: "#F59E0B",
                border: "1px solid rgba(245, 158, 11, 0.2)",
              }}
            >
              ⏳ Request Pending
            </div>
          )}

          {/* Approved / driver — chat + cancel */}
          {(isApproved || isDriver) && ride.status !== "cancelled" && (
            <>
              {onChatClick && (
                <button
                  onClick={onChatClick}
                  className="p-3.5 rounded-2xl transition-colors"
                  style={{
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--accent-primary)",
                  }}
                  disabled={isProcessing}
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onCancelClick}
                disabled={isProcessing}
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all disabled:opacity-50"
                style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  color: "#EF4444",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
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
            className="w-full mt-2 py-3.5 rounded-2xl font-bold text-sm text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #10B981, #059669)",
              boxShadow: "0 4px 16px rgba(16, 185, 129, 0.35)",
            }}
          >
            ✓ Complete Ride
          </button>
        )}
      </div>
    </motion.div>
  );
}
