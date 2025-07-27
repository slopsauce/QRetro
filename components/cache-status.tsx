"use client";

import { useState, useEffect } from "react";

interface CacheStatus {
  isSupported: boolean;
  isReady: boolean;
  estimatedSize: number;
  lastUpdated: Date | null;
}

export function CacheStatus() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({
    isSupported: false,
    isReady: false,
    estimatedSize: 0,
    lastUpdated: null
  });

  useEffect(() => {
    checkCacheStatus();
    
    // Listen for service worker messages about cache updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'CACHE_UPDATED') {
          checkCacheStatus();
        }
      });
    }
  }, []);

  const checkCacheStatus = async () => {
    try {
      if (!('caches' in window)) {
        setCacheStatus(prev => ({ ...prev, isSupported: false }));
        return;
      }

      const cacheNames = await caches.keys();
      const qretroCaches = cacheNames.filter(name => name.startsWith('qretro-'));
      
      let totalSize = 0;
      let hasContent = false;
      
      for (const cacheName of qretroCaches) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        if (keys.length > 0) {
          hasContent = true;
          // Estimate size (rough calculation)
          totalSize += keys.length * 1024; // Approximate 1KB per cached item
        }
      }

      setCacheStatus({
        isSupported: true,
        isReady: hasContent,
        estimatedSize: totalSize,
        lastUpdated: hasContent ? new Date() : null
      });
    } catch (error) {
      console.warn('[Cache Status] Failed to check cache:', error);
      setCacheStatus(prev => ({ ...prev, isSupported: false }));
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Never';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!cacheStatus.isSupported) {
    return null; // Don't show if caching not supported
  }

  return (
    <div className="text-xs text-muted border-t border-muted pt-2 mt-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1">
          <span className={cacheStatus.isReady ? "text-secondary" : "text-muted"}>
            {cacheStatus.isReady ? "●" : "○"}
          </span>
          <span>Cache Status</span>
        </span>
        <span>{cacheStatus.isReady ? "Ready" : "Loading..."}</span>
      </div>
      
      {cacheStatus.isReady && (
        <div className="mt-1 space-y-1">
          <div className="flex justify-between">
            <span>Size:</span>
            <span>{formatSize(cacheStatus.estimatedSize)}</span>
          </div>
          <div className="flex justify-between">
            <span>Updated:</span>
            <span>{formatDate(cacheStatus.lastUpdated)}</span>
          </div>
        </div>
      )}
    </div>
  );
}