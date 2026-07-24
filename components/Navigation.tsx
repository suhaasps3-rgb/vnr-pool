"use client";

import { motion } from "framer-motion";
import { LogOut, Bell, User, Search, PlusCircle, Bookmark } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface NavigationProps {
  userId: string;
  onSignOut: () => void;
  activeTab: "find" | "offer";
  setActiveTab: (tab: "find" | "offer") => void;
}

export default function Navigation({ userId, onSignOut, activeTab, setActiveTab }: NavigationProps) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-[#0F172A]/80 border-b border-gray-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <img src="/vnr_logo.png" alt="VNR Logo" className="w-8 h-8 rounded shadow-sm" />
            <span className="font-extrabold text-xl tracking-tight text-[#0F172A] dark:text-white">
              VNR<span className="text-[#2563EB] dark:text-[#3B82F6]">-Pool</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex space-x-1">
            <button
              onClick={() => setActiveTab("find")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "find"
                  ? "bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/20 dark:text-[#3B82F6]"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <Search className="w-4 h-4" /> Find a Ride
            </button>
            <button
              onClick={() => setActiveTab("offer")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "offer"
                  ? "bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/20 dark:text-[#3B82F6]"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <PlusCircle className="w-4 h-4" /> Offer a Ride
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#10B981] rounded-full border border-white dark:border-[#0F172A]"></span>
            </button>
            <ThemeToggle />
            <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-2 hidden sm:block"></div>
            <button onClick={onSignOut} className="hidden sm:flex items-center gap-2 p-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
            
            {/* Mobile Profile Avatar */}
            <button className="sm:hidden p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Links (Below Header) */}
      <div className="md:hidden flex border-t border-gray-200 dark:border-white/10 bg-white/50 dark:bg-[#0F172A]/50 backdrop-blur-md px-2 py-2 gap-2">
        <button
          onClick={() => setActiveTab("find")}
          className={`flex-1 flex justify-center items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "find"
              ? "bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/20 dark:text-[#3B82F6]"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
          }`}
        >
          <Search className="w-4 h-4" /> Find
        </button>
        <button
          onClick={() => setActiveTab("offer")}
          className={`flex-1 flex justify-center items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "offer"
              ? "bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/20 dark:text-[#3B82F6]"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
          }`}
        >
          <PlusCircle className="w-4 h-4" /> Offer
        </button>
      </div>
    </header>
  );
}
