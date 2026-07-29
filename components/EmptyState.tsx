import { motion } from "framer-motion";
import { Search, Car } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ title, description, icon, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 text-center min-h-[50vh]"
    >
      <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
        {/* Animated background blobs */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[var(--accent-primary)]/5 rounded-full blur-2xl"
        />
        <motion.div 
          animate={{ scale: [1.1, 1, 1.1], rotate: [90, 0, 90] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[var(--accent-success)]/5 rounded-full blur-2xl"
        />
        
        {/* Illustration Container */}
        <div className="relative z-10 w-24 h-24 bg-[var(--bg-surface)] rounded-full border-2 border-[var(--border-subtle)] shadow-[var(--shadow-card)] flex items-center justify-center text-[var(--accent-primary)]">
          {icon || (
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Search className="w-10 h-10" strokeWidth={2} />
            </motion.div>
          )}
        </div>

        {/* Orbiting element */}
        {!icon && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 z-20"
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-[var(--bg-surface)] rounded-full border border-[var(--border-subtle)] flex items-center justify-center shadow-sm text-[var(--accent-primary)]">
              <Car className="w-4 h-4" />
            </div>
          </motion.div>
        )}
      </div>
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-[var(--text-secondary)] max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-primary px-8 py-4 rounded-xl font-bold text-lg w-full max-w-xs"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
