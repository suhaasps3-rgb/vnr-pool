"use client";

import { useRideReminders } from "@/hooks/useRideReminders";
import QueryProvider from "./QueryProvider";
import { Toaster } from "sonner";

export default function ClientLayoutProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  useRideReminders(); // Initialize global reminders

  return (
    <QueryProvider>
      {children}
      <Toaster 
        theme="system" 
        position="top-center" 
        toastOptions={{
          className: "backdrop-blur-xl border border-[var(--border-subtle)] shadow-[var(--shadow-card)] text-[var(--text-primary)] rounded-2xl font-sans font-medium",
          classNames: {
            toast: "bg-[var(--bg-surface)]",
            success: "border-[var(--accent-success)]/30 bg-[var(--accent-success)]/10 text-[var(--accent-success)]",
            error: "border-[var(--accent-danger)]/30 bg-[var(--accent-danger)]/10 text-[var(--accent-danger)]",
            warning: "border-[var(--accent-warning)]/30 bg-[var(--accent-warning)]/10 text-[var(--accent-warning)]",
            info: "border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]",
          }
        }}
      />
    </QueryProvider>
  );
}
