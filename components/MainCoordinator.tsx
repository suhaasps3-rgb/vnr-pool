"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthScreen from "./AuthScreen";
import LandingPage from "./LandingPage";
import OnboardingForm from "./OnboardingForm";
import Dashboard from "./Dashboard";
import { createClient } from "@/lib/supabase/client";

export default function MainCoordinator({ initialUserId, initialProfileCompleted }: { initialUserId: string | null, initialProfileCompleted: boolean }) {
  const [userId, setUserId] = useState<string | null>(initialUserId);
  const [profileCompleted, setProfileCompleted] = useState<boolean>(initialProfileCompleted);
  const router = useRouter();

  const handleAuthSuccess = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (data?.profile_completed) {
        setProfileCompleted(true);
      }
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserId(null);
    setProfileCompleted(false);
    router.refresh();
  };

  if (!userId) {
    return <LandingPage onLogin={handleAuthSuccess} />;
  }

  if (!profileCompleted) {
    return <OnboardingForm userId={userId} onComplete={() => setProfileCompleted(true)} />;
  }

  return <Dashboard onSignOut={handleSignOut} userId={userId} />;
}
