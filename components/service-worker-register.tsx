"use client";

import { useEffect } from "react";
import { showUpdateNotification, showCacheStatusNotification } from "./notification-utils";

const registerServiceWorker = async () => {
  try {
    console.log("[SW] Registering service worker...");
    
    // Determine the correct SW path based on environment
    const swPath = process.env.NODE_ENV === 'production' ? '/QRetro/sw.js' : '/sw.js';
    
    const registration = await navigator.serviceWorker.register(swPath, {
      scope: process.env.NODE_ENV === 'production' ? '/QRetro/' : '/',
    });

    console.log("[SW] Service worker registered successfully:", registration);

    // Handle service worker updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (newWorker) {
        console.log("[SW] New service worker found, installing...");
        
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              // New update available
              console.log("[SW] New content is available; please refresh.");
              showUpdateNotification();
            } else {
              // Content is cached for the first time
              console.log("[SW] Content is cached for offline use.");
              showCacheStatusNotification('ready');
            }
          }
        });
      }
    });

    // Listen for service worker controlling this page
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      console.log("[SW] New service worker is controlling the page");
      window.location.reload();
    });

    // Handle service worker messages
    navigator.serviceWorker.addEventListener("message", (event) => {
      console.log("[SW] Message from service worker:", event.data);
    });

  } catch (error) {
    console.error("[SW] Service worker registration failed:", error);
    
    // Show user-friendly error notification
    showCacheStatusNotification('error');
    
    // Try to provide fallback functionality
    console.log("[SW] App will continue to work but without offline support");
  }
};

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Only register service worker in production and if supported
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      registerServiceWorker();
    }
  }, []);

  // This component doesn't render anything visible
  return null;
}