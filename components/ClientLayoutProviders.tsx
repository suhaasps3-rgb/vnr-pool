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
      <Toaster theme="dark" richColors position="top-center" />
    </QueryProvider>
  );
}
