import { motion, AnimatePresence } from "framer-motion";
import { X, Map as MapIcon } from "lucide-react";
import DynamicMap from "./DynamicMap";
import { RouteConfig } from "./MapComponent";

interface MultiRouteMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  routes: RouteConfig[];
  title?: string;
}

export default function MultiRouteMapModal({ isOpen, onClose, routes, title = "Route Maps" }: MultiRouteMapModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ height: '80vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0F172A]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <MapIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">{title}</h2>
                <p className="text-xs text-slate-400 font-medium">{routes.length} Active Route{routes.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Map Container */}
          <div className="flex-1 w-full relative bg-slate-900">
            <DynamicMap routes={routes} height="h-full" />
            
            {/* Legend / Overlay */}
            <div className="absolute bottom-6 left-6 right-6 z-[400] pointer-events-none">
              <div className="flex flex-wrap gap-2 justify-center">
                {routes.map(r => (
                  <div key={r.id} className="bg-[#0F172A]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 pointer-events-auto shadow-lg">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color, boxShadow: `0 0 8px ${r.color}80` }} />
                    <span className="text-xs font-bold text-white truncate max-w-[150px]">{r.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
