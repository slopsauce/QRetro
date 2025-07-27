"use client";

import { useEffect } from "react";

const showUpdateNotification = () => {
  // Create a simple notification for updates
  const notification = document.createElement("div");
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--color-accent);
      color: var(--color-background);
      padding: 12px 16px;
      border: 2px solid currentColor;
      font-family: var(--font-pixel), monospace;
      font-size: 14px;
      z-index: 9999;
      max-width: 300px;
      cursor: pointer;
    ">
      ⚡ NEW VERSION AVAILABLE<br>
      <small>Click to update and reload</small>
    </div>
  `;
  
  notification.onclick = () => {
    // Tell the service worker to skip waiting
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "SKIP_WAITING" });
    }
    notification.remove();
  };
  
  document.body.appendChild(notification);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 10000);
};

const showOfflineCapabilityNotification = () => {
  // Create a notification for offline capability
  const notification = document.createElement("div");
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--color-secondary);
      color: var(--color-background);
      padding: 12px 16px;
      border: 2px solid currentColor;
      font-family: var(--font-pixel), monospace;
      font-size: 14px;
      z-index: 9999;
      max-width: 300px;
    ">
      📱 APP READY FOR OFFLINE USE<br>
      <small>QRetro now works without internet!</small>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
};

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
              showOfflineCapabilityNotification();
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