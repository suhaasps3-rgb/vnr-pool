"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

export default function AuthScreen({ onAuthSuccess, isModal = false }: { onAuthSuccess: () => void, isModal?: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot_password" | "verify_otp">("login");
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@vnrvjiet\.in$/i;
    if (!emailRegex.test(email)) {
      toast.error("Access Restricted: You must use a valid @vnrvjiet.in college email ID.");
      return;
    }

    setLoading(true);

    try {
      if (authMode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Check your email for the confirmation link!");
      } else if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Successfully logged in!");
        onAuthSuccess();
      } else if (authMode === "verify_otp") {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match!");
          setLoading(false);
          return;
        }
        
        // 1. Verify the OTP
        const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: otp, type: 'recovery' });
        if (verifyError) throw verifyError;
        
        // 2. Once verified, the user is temporarily logged in, so we can update their password
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
        
        toast.success("Password successfully reset! You can now log in.");
        setAuthMode("login");
        setPassword("");
        setConfirmPassword("");
        setOtp("");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@vnrvjiet\.in$/i;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid @vnrvjiet.in college email in the field above first.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success("OTP sent to your email!");
      setAuthMode("verify_otp");
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-4 relative", isModal ? "w-full" : "min-h-screen")}>
      {!isModal && (
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
      )}
      
      <motion.div 
        initial={isModal ? {} : { opacity: 0, y: 20 }}
        animate={isModal ? {} : { opacity: 1, y: 0 }}
        className={cn("w-full max-w-md p-8", isModal ? "" : "ui-card")}
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
              disabled={authMode === "verify_otp"}
              onChange={e => setEmail(e.target.value)}
              placeholder="rollno@vnrvjiet.in"
              className="w-full mt-1 p-3 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
            />
          </div>

          {(authMode === "login" || authMode === "signup") && (
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
          )}

          {authMode === "verify_otp" && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">6-Digit OTP</label>
                <input 
                  type="text"
                  required
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full mt-1 p-3 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all tracking-widest text-center font-bold"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full mt-1 p-3 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                <input 
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full mt-1 p-3 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              authMode === "login" ? "Sign In" : 
              authMode === "signup" ? "Create Account" : "Verify & Reset"
            )}
          </motion.button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3">
          {authMode === "login" && (
            <button 
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Forgot your password?
            </button>
          )}

          <button 
            onClick={() => {
              setAuthMode(authMode === "login" ? "signup" : "login");
              setPassword("");
              setConfirmPassword("");
              setOtp("");
            }}
            className="text-sm text-gray-600 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {authMode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
