import { motion } from "framer-motion";
import { Search } from "lucide-react";

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
      <div className="w-24 h-24 mb-6 text-[var(--accent-primary)] opacity-80 flex items-center justify-center">
        {icon || <Search className="w-16 h-16" strokeWidth={1.5} />}
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
