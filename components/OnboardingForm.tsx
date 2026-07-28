"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react";

export default function OnboardingForm({ onComplete, userId }: { onComplete: () => void, userId: string }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    roll_no: "",
    branch: "",
    mobile_number: "",
    gender: "",
  });
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");

  const branches = ["CSE", "ECE", "IT", "EEE", "MECH", "CIVIL", "AIML", "DS", "CSBS"];

  const handleNext = async () => {
    if (step === 1) {
      const rollStr = formData.roll_no.trim();
      if (rollStr.length < 10) {
        toast.error("Roll Number must be at least 10 characters long.");
        return;
      }
      const year = parseInt(rollStr.substring(0, 2), 10);
      if (isNaN(year) || year < 21 || year > 25) {
        toast.error("Roll Number must start with year 21, 22, 23, 24, or 25.");
        return;
      }
    }

    if (step === 3) {
      if (!/^[6-9]\d{9}$/.test(formData.mobile_number)) {
        toast.error("Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.");
        return;
      }
      
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(otp);
      
      // Always show toast as a guaranteed fallback in case OS notifications are blocked
      toast.success(`(Simulated SMS) Your OTP is: ${otp}`, { duration: 8000 });
      
      // Also attempt to show native notification
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("VNR Pool Verification", { body: `Your code is ${otp}` });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              new Notification("VNR Pool Verification", { body: `Your code is ${otp}` });
            }
          });
        }
      }
      
      setStep(4);
      return;
    }
    
    if (step === 4) {
      if (enteredOtp !== generatedOtp) {
        toast.error("Invalid OTP. Please try again.");
        return;
      }
      setStep(5);
      return;
    }

    setStep(s => Math.min(s + 1, 5));
  };
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 5) return handleNext();

    setLoading(true);
    const supabase = createClient();

    try {
      // Validate mobile (10 digits starting with 6-9)
      if (!/^[6-9]\d{9}$/.test(formData.mobile_number)) {
        throw new Error("Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.");
      }

      // We need user email to complete the profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found.");

      const { error } = await supabase.from('users').insert({
        id: userId,
        email: user.email,
        full_name: formData.full_name,
        roll_no: formData.roll_no.toUpperCase(),
        branch: formData.branch,
        mobile_number: formData.mobile_number,
        gender: formData.gender,
        verified_status: true,
        profile_completed: true,
      });

      if (error) {
        if (error.code === '23505') { // Unique violation
            throw new Error("This Roll Number is already registered.");
        }
        throw error;
      }

      toast.success("Profile completed successfully!");
      onComplete();

    } catch (err: any) {
      toast.error(err.message || "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        layoutId="onboarding-card"
        className="ui-card w-full max-w-md p-8 relative overflow-hidden"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-gray-200 dark:bg-white/10 w-full">
          <motion.div 
            className="h-full bg-blue-500"
            initial={{ width: "20%" }}
            animate={{ width: `${(step / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <h2 className="text-2xl font-bold mb-6 mt-2 text-gray-900 dark:text-white">Complete Profile</h2>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                  <input 
                    required
                    value={formData.full_name}
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                    placeholder="John Doe"
                    className="w-full mt-1 p-3 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Roll Number</label>
                  <input 
                    required
                    value={formData.roll_no}
                    onChange={e => setFormData({...formData, roll_no: e.target.value})}
                    placeholder="21071A05XX"
                    className="w-full mt-1 p-3 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all uppercase"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Branch</label>
                  <select 
                    required
                    value={formData.branch}
                    onChange={e => setFormData({...formData, branch: e.target.value})}
                    className="w-full mt-1 p-3 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  >
                    <option value="" disabled>Select your branch</option>
                    {branches.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number (10 digits)</label>
                  <input 
                    required
                    type="tel"
                    pattern="[6-9]\d{9}"
                    value={formData.mobile_number}
                    onChange={e => setFormData({...formData, mobile_number: e.target.value})}
                    placeholder="9876543210"
                    className="w-full mt-1 p-3 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Verify Mobile Number</label>
                  <p className="text-xs text-gray-500 mb-2">We've sent a 4-digit code to {formData.mobile_number}</p>
                  <input 
                    required
                    type="text"
                    maxLength={4}
                    value={enteredOtp}
                    onChange={e => setEnteredOtp(e.target.value)}
                    placeholder="1234"
                    className="w-full mt-1 p-3 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-center tracking-widest font-bold"
                  />
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Gender</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['male', 'female', 'other'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormData({...formData, gender: g})}
                        className={`p-3 rounded-xl border transition-all ${
                          formData.gender === g 
                            ? 'bg-blue-50 dark:bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-400 font-medium' 
                            : 'bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/30'
                        }`}
                      >
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="p-3 rounded-xl ui-button"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : <div />}

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading || (step === 5 && !formData.gender)}
              className="ui-button-primary px-6 py-3 rounded-xl flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : step === 5 ? (
                <>Finish <Check className="w-5 h-5" /></>
              ) : (
                <>Next <ArrowRight className="w-5 h-5" /></>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
