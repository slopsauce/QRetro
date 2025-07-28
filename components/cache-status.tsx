"use client";

import { useState, useEffect } from "react";

interface CacheStatus {
  isSupported: boolean;
  isReady: boolean;
  estimatedSize: number;
  lastUpdated: Date | null;
  version: string | null;
}

export function CacheStatus() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({
    isSupported: false,
    isReady: false,
    estimatedSize: 0,
    lastUpdated: null,
    version: null
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

    return () => {
      // Cleanup if needed
    };
  }, []);

  const checkCacheStatus = async () => {
    try {
      if (!('caches' in window)) {
        setCacheStatus(prev => ({ ...prev, isSupported: false }));
        return;
      }

      const cacheNames = await caches.keys();
      const qretroCaches = cacheNames.filter(name => name.startsWith('qretro-'));
      
      // Extract version from cache name (e.g., "qretro-static-v2307642-t045if" -> "2307642-t045if")
      let version = null;
      if (qretroCaches.length > 0) {
        const cacheName = qretroCaches[0];
        const versionMatch = cacheName.match(/qretro-(?:static|dynamic)-v(.+)/);
        if (versionMatch) {
          version = versionMatch[1];
        }
      }
      
      let totalSize = 0;
      let hasContent = false;
      
      // Try to get accurate storage usage first
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          if (estimate.usage) {
            totalSize = estimate.usage;
            hasContent = qretroCaches.length > 0;
          }
        } catch (storageError) {
          console.warn('[Cache Status] Storage API failed, using fallback:', storageError);
        }
      }
      
      // Fallback: estimate based on cache entries if Storage API unavailable
      if (totalSize === 0) {
        for (const cacheName of qretroCaches) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          
          if (keys.length > 0) {
            hasContent = true;
            
            // Better estimation: sample a few responses to get average size
            const sampleSize = Math.min(keys.length, 3);
            let averageSize = 0;
            
            for (let i = 0; i < sampleSize; i++) {
              try {
                const response = await cache.match(keys[i]);
                if (response) {
                  const blob = await response.blob();
                  averageSize += blob.size;
                }
              } catch (sampleError) {
                // Ignore individual sample errors
                console.warn('[Cache Status] Sample error:', sampleError);
              }
            }
            
            if (averageSize > 0) {
              const estimatedAverageSize = averageSize / sampleSize;
              totalSize += keys.length * estimatedAverageSize;
            } else {
              // Last resort: rough estimate
              totalSize += keys.length * 50 * 1024; // 50KB average per file
            }
          }
        }
      }

      setCacheStatus({
        isSupported: true,
        isReady: hasContent,
        estimatedSize: totalSize,
        lastUpdated: hasContent ? new Date() : null,
        version: version
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
    <div className="text-xs text-muted">
      <div className="flex justify-between">
        <span>Cache</span>
        <span>{cacheStatus.isReady ? "Ready" : "Loading..."}</span>
      </div>
      
      {cacheStatus.isReady && (
        <div className="mt-1 space-y-1">
          <div className="flex justify-between">
            <span>Size</span>
            <span>{formatSize(cacheStatus.estimatedSize)}</span>
          </div>
          <div className="flex justify-between">
            <span>Updated</span>
            <span>{formatDate(cacheStatus.lastUpdated)}</span>
          </div>
          {cacheStatus.version && (
            <div className="text-right">
              <span className="font-mono text-xs">{cacheStatus.version}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}