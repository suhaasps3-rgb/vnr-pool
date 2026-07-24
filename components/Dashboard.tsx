"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import FindRideFeed from "./FindRideFeed";
import OfferSeatForm from "./OfferSeatForm";
import ThemeToggle from "./ThemeToggle";

type TabType = "find" | "offer";

export default function Dashboard({ onSignOut, userId }: { onSignOut: () => void, userId: string }) {
  const [activeTab, setActiveTab] = useState<TabType>("find");
  const [selectedVehicle, setSelectedVehicle] = useState<"car" | "auto" | "bike">("car");

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Sidebar - Fixed on Desktop */}
      <div className="lg:w-1/3 xl:w-2/5 p-6 md:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#201E2B] lg:sticky lg:top-0 lg:h-screen">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tighter uppercase mb-2">
              YOUR CAMPUS <br /> COMMUTE
            </h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-sm">
              Exclusive ride-pooling for VNR VJIET. Find your perfect ride or offer an empty seat to a peer.
            </p>
          </div>
        </header>

        {/* Dynamic 3D Image */}
        <div className="relative flex-1 flex flex-col justify-center items-center min-h-[300px]">
          <motion.img 
            key={selectedVehicle}
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.4 }}
            src={`/3d_${selectedVehicle === 'auto' ? 'car' : selectedVehicle}.png`} 
            alt={`3D ${selectedVehicle}`}
            className="w-full max-w-[400px] object-contain drop-shadow-2xl"
          />
        </div>

        {/* User Controls */}
        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-white/5">
          <ThemeToggle />
          <button onClick={onSignOut} className="ui-button px-4 py-2 text-sm font-medium flex-1 justify-center flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 p-4 md:p-8 lg:p-12 max-w-4xl mx-auto w-full">
        {/* Tabs */}
        <div className="flex bg-gray-200/50 dark:bg-black/20 p-1.5 rounded-2xl border border-gray-200 dark:border-white/5 mb-8 relative w-full flex-wrap">

        {(["find", "offer"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab ? "text-white dark:text-gray-900" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="tab-slider"
                className="absolute inset-0 bg-gray-900 dark:bg-white rounded-full shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 font-bold tracking-wide">
              {tab === "find" ? "Find a Ride" : "Offer a Seat"}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "find" ? (
          <FindRideFeed userId={userId} onVehicleSelect={setSelectedVehicle} />
        ) : (
          <OfferSeatForm userId={userId} onVehicleSelect={setSelectedVehicle} />
        )}
      </motion.div>
    </div>
    </div>
  );
}
