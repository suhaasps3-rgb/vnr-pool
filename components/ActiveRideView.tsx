"use client";

import FindRideFeed from "./FindRideFeed";

export default function ActiveRideView({ userId, onVehicleSelect }: { userId: string, onVehicleSelect: (v: "car" | "auto" | "bike") => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-6 rounded-3xl text-center shadow-sm">
        <h2 className="text-2xl font-black text-blue-900 dark:text-blue-100 mb-2">🚗 Ride in Progress</h2>
        <p className="text-blue-700 dark:text-blue-300 font-medium">You are currently in an active ride. You cannot join or offer other rides until this trip is completed.</p>
      </div>
      
      <FindRideFeed userId={userId} onVehicleSelect={onVehicleSelect} mode="active_trip" />
    </div>
  );
}
