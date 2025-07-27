"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      // Hide "back online" indicator after 3 seconds
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
      // Keep offline indicator visible
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't show indicator if online and not transitioning
  if (isOnline && !showIndicator) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 border-2 text-sm font-bold transition-all duration-300",
        isOnline
          ? "bg-secondary text-background border-secondary animate-pulse"
          : "bg-accent text-background border-accent"
      )}
    >
      {isOnline ? (
        <div className="flex items-center gap-2">
          <span className="text-background">🌐</span>
          <span>BACK ONLINE</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-background">📱</span>
          <span>OFFLINE MODE - QR GENERATION STILL WORKS</span>
        </div>
      )}
    </div>
  );
}