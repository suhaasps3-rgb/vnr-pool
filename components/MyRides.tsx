"use client";

import { useState } from "react";
import FindRideFeed from "./FindRideFeed";

export default function MyRides({ userId, onVehicleSelect }: { userId: string, onVehicleSelect: (v: "car" | "auto" | "bike") => void }) {
  const [subTab, setSubTab] = useState<"booked" | "offered">("booked");

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-slate-50 dark:bg-[#0F172A] p-2 rounded-2xl border border-gray-200 dark:border-white/5">
        <button
          onClick={() => setSubTab("booked")}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
            subTab === "booked"
              ? "bg-white dark:bg-[#1E293B] shadow-sm text-[#2563EB] dark:text-[#3B82F6]"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          Booked Rides
        </button>
        <button
          onClick={() => setSubTab("offered")}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
            subTab === "offered"
              ? "bg-white dark:bg-[#1E293B] shadow-sm text-[#2563EB] dark:text-[#3B82F6]"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          Offered Rides
        </button>
      </div>

      <FindRideFeed userId={userId} onVehicleSelect={onVehicleSelect} mode={subTab} />
    </div>
  );
}
