"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    let onlineTimer: NodeJS.Timeout | null = null;

    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      
      // Clear any existing timer
      if (onlineTimer) {
        clearTimeout(onlineTimer);
      }
      
      // Hide "back online" indicator after 3 seconds
      onlineTimer = setTimeout(() => {
        setShowIndicator(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
      
      // Clear online timer when going offline
      if (onlineTimer) {
        clearTimeout(onlineTimer);
        onlineTimer = null;
      }
      // Keep offline indicator visible
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup function to prevent race conditions
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      // Clear any pending timers
      if (onlineTimer) {
        clearTimeout(onlineTimer);
      }
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
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={isOnline ? "Connection restored" : "Working offline"}
    >
      {isOnline ? (
        <div className="flex items-center gap-2">
          <span className="text-background" aria-hidden="true">🌐</span>
          <span>BACK ONLINE</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-background" aria-hidden="true">📱</span>
          <span>OFFLINE MODE - QR GENERATION STILL WORKS</span>
        </div>
      )}
    </div>
  );
}