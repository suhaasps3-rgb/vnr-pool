"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

export default function AuthScreen({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Domain Check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@vnrvjiet\.in$/i;
    if (!emailRegex.test(email)) {
      toast.error("Access Restricted: You must use a valid @vnrvjiet.in college email ID.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Successfully logged in!");
        onAuthSuccess();
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="ui-card w-full max-w-md p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            VNR Pool
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Exclusive ride-pooling for VNR VJIET.</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">College Email</label>
            <input 
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="rollno@vnrvjiet.in"
              className="w-full mt-1 p-3 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input 
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-1 p-3 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full ui-button-primary py-3 rounded-xl font-medium flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isSignUp ? "Create Account" : "Sign In")}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
