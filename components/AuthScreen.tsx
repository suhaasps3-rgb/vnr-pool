"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

export default function AuthScreen({ onAuthSuccess, isModal = false }: { onAuthSuccess: () => void, isModal?: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot_password" | "verify_otp" | "verify_signup_otp">("login");
  const supabase = createClient();

  const COLLEGE_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@vnrvjiet\.in$/i;

  const validateEmail = (val: string) => {
    if (!val) { setEmailError(""); return; }
    if (!COLLEGE_EMAIL_REGEX.test(val)) {
      setEmailError("Only @vnrvjiet.in emails are allowed");
    } else {
      setEmailError("");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!COLLEGE_EMAIL_REGEX.test(email)) {
      setEmailError("Only @vnrvjiet.in emails are allowed");
      toast.error("Access Restricted: Use your @vnrvjiet.in college email.");
      return;
    }
    setEmailError("");

    setLoading(true);

    try {
      if (authMode === "signup") {
        const response = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, type: 'signup' }),
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to send signup email');
        
        toast.success("Verification code sent to your email!");
        setAuthMode("verify_signup_otp");
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
      } else if (authMode === "verify_signup_otp") {
        if (otp.trim().length !== 8) {
          toast.error("Please enter a valid 8-digit OTP");
          setLoading(false);
          return;
        }

        const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: otp, type: 'signup' });
        if (verifyError) throw verifyError;
        
        toast.success("Account successfully created and verified!");
        onAuthSuccess();
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
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'recovery' }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send OTP');

      toast.success("8-Digit OTP sent to your email!");
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
              disabled={authMode === "verify_otp" || authMode === "verify_signup_otp"}
              onChange={e => { setEmail(e.target.value); validateEmail(e.target.value); }}
              onBlur={e => validateEmail(e.target.value)}
              placeholder="rollno@vnrvjiet.in"
              className={`w-full mt-1 p-3 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border rounded-xl outline-none focus:ring-1 transition-all disabled:opacity-50 ${
                emailError
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                  : "border-gray-200 dark:border-white/10 focus:border-blue-500 focus:ring-blue-500"
              }`}
            />
            {emailError && (
              <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {emailError}
              </p>
            )}
          </div>

          {(authMode === "login" || authMode === "signup") && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full mt-1 p-3 pr-10 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {authMode === "verify_signup_otp" && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">8-Digit OTP</label>
              <input 
                type="text"
                required
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="12345678"
                className="w-full mt-1 p-3 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all tracking-widest text-center font-bold"
              />
            </div>
          )}

          {authMode === "verify_otp" && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">8-Digit OTP</label>
                <input 
                  type="text"
                  required
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="12345678"
                  className="w-full mt-1 p-3 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all tracking-widest text-center font-bold"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full mt-1 p-3 pr-10 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full mt-1 p-3 pr-10 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
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
              authMode === "signup" ? "Create Account" : 
              authMode === "verify_signup_otp" ? "Verify Code" : "Verify & Reset"
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
