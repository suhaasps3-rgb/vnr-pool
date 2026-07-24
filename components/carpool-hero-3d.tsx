'use client'

import { SplineScene } from "@/components/ui/spline"
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import { Car, ShieldCheck, MapPin, ArrowRight } from "lucide-react"

export function VNRCarPool3DHero({ onAction }: { onAction?: () => void }) {
  return (
    <Card className="w-full min-h-[550px] bg-slate-950 relative overflow-hidden border-slate-800">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
      />
      
      <div className="flex flex-col md:flex-row h-full">
        {/* Left Section: VNR Carpool Details */}
        <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold w-fit mb-4">
            <ShieldCheck className="w-4 h-4" /> VNR VJIET Exclusive Campus Network
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-200 to-slate-400">
            Commute Smarter to Campus.
          </h1>

          <p className="mt-4 text-slate-400 text-base md:text-lg max-w-lg leading-relaxed">
            Connect with verified peers traveling to VNR VJIET from Kukatpally, Bachupally, Miyapur, and across Hyderabad. Share rides, cut costs, and beat campus traffic.
          </p>

          {/* Quick Route Pills */}
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-300">
            <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-400" /> Bachupally
            </span>
            <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-400" /> Kukatpally
            </span>
            <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-400" /> Pragathi Nagar
            </span>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <button 
              onClick={onAction}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
            >
              <Car className="w-4 h-4" /> Find a Ride
            </button>
            <button 
              onClick={onAction}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-medium border border-slate-800 flex items-center gap-2 transition-all"
            >
              Offer Seats <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Section: Interactive 3D Spline Canvas */}
        <div className="flex-1 relative min-h-[350px] md:min-h-full">
          <SplineScene 
            scene="https://prod.spline.design/JpCfJxJpc-qQX9gu/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
}
