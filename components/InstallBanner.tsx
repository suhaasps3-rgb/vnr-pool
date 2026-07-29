"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { triggerHaptic, playUISound } from "@/lib/interactions";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed it
    const dismissed = localStorage.getItem("pwa_install_dismissed");
    
    // Also, don't show if already in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    
    if (dismissed === "true" || isStandalone) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Update UI notify the user they can install the PWA
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    triggerHaptic('success');
    playUISound('pop');
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowBanner(false);
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
      localStorage.setItem("pwa_install_dismissed", "true");
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa_install_dismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-[9999] animate-in slide-in-from-bottom-full duration-500">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] rounded-2xl p-4 flex items-center gap-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Download className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-[var(--text-primary)] text-sm mb-0.5 leading-tight">Install VNR Pool</h4>
          <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-tight">Add to home screen for a faster, app-like experience.</p>
        </div>
        
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button 
            onClick={handleInstallClick}
            className="bg-[var(--accent-primary)] hover:opacity-90 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-opacity"
          >
            Install
          </button>
          <button 
            onClick={handleDismiss}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-[10px] font-bold uppercase tracking-wider text-center transition-colors"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}
