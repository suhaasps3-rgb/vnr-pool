import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ShieldCheck, Zap } from "lucide-react";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  const steps = [
    {
      icon: <Search className="w-6 h-6 text-[#4F7CFF]" />,
      title: "Find Your Route",
      description: "Enter your destination or pickup point. The app scans the live network of VNR students heading the same way.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#34C759]" />,
      title: "Secure Matching",
      description: "Connect instantly with 100% verified peers. Dedicated filters ensure safety and comfort for all riders.",
    },
    {
      icon: <Zap className="w-6 h-6 text-[#FFD84D]" />,
      title: "Instant Split",
      description: "No awkward money talks. The system automatically calculates and splits the fuel cost fairly among passengers.",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">How It Works</h3>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Steps */}
            <div className="p-6 space-y-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{step.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 text-center">
              <button
                onClick={onClose}
                className="w-full py-4 bg-[#4F7CFF] hover:bg-[#3D63CC] text-white font-bold rounded-xl transition-colors shadow-lg shadow-[#4F7CFF]/20"
              >
                Got It, Let's Go!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
