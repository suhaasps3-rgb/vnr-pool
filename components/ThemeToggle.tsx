"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-xl bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-gray-200 dark:border-white/10 shadow-sm"
      title="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
      ) : (
        <Moon className="w-5 h-5 text-gray-500 hover:text-gray-900 transition-colors" />
      )}
    </button>
  );
}
