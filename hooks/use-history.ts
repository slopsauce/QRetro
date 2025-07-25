"use client";

import { useSyncExternalStore, useCallback } from "react";
import { QRDataType } from "@/lib/qr-types";

export interface HistoryItem {
  id: string;                          // timestamp-based unique ID
  type: QRDataType;                    // text, url, wifi, etc.
  data: Record<string, string>;        // form data
  qrData: string;                      // generated QR string
  qrOptions?: {                        // QR generation options
    errorCorrectionLevel: "L" | "M" | "Q" | "H";
    margin: number;
    width: number;
  };
  timestamp: number;                   // creation time
  preview: string;                     // truncated display text
  title?: string;                      // optional user-provided title
}

interface HistoryState {
  items: HistoryItem[];
  maxItems: number;
}

const HISTORY_STORAGE_KEY = "qretro-history";
const DEFAULT_MAX_ITEMS = 20;

// Cached server snapshot to avoid infinite loops
const serverSnapshot = { items: [], maxItems: DEFAULT_MAX_ITEMS };

function createPreview(type: QRDataType, data: Record<string, string>): string {
  const maxLength = 40;
  
  switch (type) {
    case "text":
      return data.text?.substring(0, maxLength) || "";
    case "url":
      return data.url?.substring(0, maxLength) || "";
    case "wifi":
      return `${data.ssid} (${data.security || "No security"})`;
    case "email":
      return data.email || "";
    case "sms":
      return `${data.phone}${data.message ? ` -> ${data.message.substring(0, 20)}...` : ""}`;
    case "phone":
      return data.phone || "";
    case "vcard":
      return data.name || data.email || data.phone || "Contact";
    case "crypto":
      const currency = data.currency || "Crypto";
      const address = data.address || "";
      return `${currency.toUpperCase()}: ${address.substring(0, 15)}${address.length > 15 ? "..." : ""}`;
    default:
      return "Unknown type";
  }
}

// Cached snapshot to avoid infinite loops
let cachedSnapshot: HistoryState | null = null;

// External store for history data
const historyStore = {
  getSnapshot(): HistoryState {
    if (cachedSnapshot) {
      return cachedSnapshot;
    }

    if (typeof window === "undefined") {
      cachedSnapshot = { items: [], maxItems: DEFAULT_MAX_ITEMS };
      return cachedSnapshot;
    }

    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!stored) {
        cachedSnapshot = { items: [], maxItems: DEFAULT_MAX_ITEMS };
        return cachedSnapshot;
      }

      const parsed = JSON.parse(stored);
      cachedSnapshot = {
        items: Array.isArray(parsed.items) ? parsed.items : [],
        maxItems: parsed.maxItems || DEFAULT_MAX_ITEMS,
      };
      return cachedSnapshot;
    } catch (error) {
      console.warn("Failed to load history from localStorage:", error);
      cachedSnapshot = { items: [], maxItems: DEFAULT_MAX_ITEMS };
      return cachedSnapshot;
    }
  },

  subscribe(listener: () => void) {
    if (typeof window === "undefined") {
      return () => {}; // No-op for SSR
    }

    const handleStorageChange = (e: StorageEvent) => {
      // Only listen to changes for our specific key from OTHER tabs
      if (e.key === HISTORY_STORAGE_KEY && e.newValue !== e.oldValue) {
        cachedSnapshot = null; // Invalidate cache
        listener();
      }
    };

    const handleCustomChange = () => {
      cachedSnapshot = null; // Invalidate cache
      listener();
    };

    // Listen to storage events from other tabs only
    window.addEventListener("storage", handleStorageChange);
    // Listen to custom events from this tab
    window.addEventListener("qretro-history-change", handleCustomChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("qretro-history-change", handleCustomChange);
    };
  },

  setState(newHistory: HistoryState) {
    if (typeof window === "undefined") return;

    try {
      const currentData = localStorage.getItem(HISTORY_STORAGE_KEY);
      const newData = JSON.stringify(newHistory);
      
      // Only update if data actually changed
      if (currentData !== newData) {
        cachedSnapshot = null; // Invalidate cache
        localStorage.setItem(HISTORY_STORAGE_KEY, newData);
        // Fire custom event to notify THIS tab's listeners
        window.dispatchEvent(new CustomEvent("qretro-history-change"));
      }
    } catch (error) {
      console.warn("Failed to save history to localStorage:", error);
    }
  }
};

export function useHistory() {
  // Use useSyncExternalStore for proper synchronization
  const history = useSyncExternalStore(
    historyStore.subscribe,
    historyStore.getSnapshot,
    () => serverSnapshot // Cached server snapshot to avoid infinite loops
  );

  const addToHistory = useCallback((
    type: QRDataType,
    data: Record<string, string>,
    qrData: string,
    qrOptions?: {
      errorCorrectionLevel: "L" | "M" | "Q" | "H";
      margin: number;
      width: number;
    },
    title?: string
  ) => {
    const currentHistory = historyStore.getSnapshot();
    
    // Check if this exact QR data already exists
    const existingItem = currentHistory.items.find(item => 
      item.qrData === qrData && item.type === type
    );

    let newHistory: HistoryState;
    let addedItemId: string;

    if (existingItem) {
      // If it exists, move it to the front and update timestamp
      const updatedItem = { ...existingItem, timestamp: Date.now() };
      const filteredItems = currentHistory.items.filter(item => item.id !== existingItem.id);
      addedItemId = existingItem.id;
      
      newHistory = {
        ...currentHistory,
        items: [updatedItem, ...filteredItems],
      };
    } else {
      // Create new item
      const item: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        data: { ...data }, // Clone to avoid reference issues
        qrData,
        qrOptions: qrOptions ? { ...qrOptions } : undefined, // Clone QR options
        timestamp: Date.now(),
        preview: createPreview(type, data),
        title,
      };

      const newItems = [item, ...currentHistory.items];
      
      // Enforce maxItems limit (FIFO)
      if (newItems.length > currentHistory.maxItems) {
        newItems.splice(currentHistory.maxItems);
      }

      addedItemId = item.id;
      
      newHistory = {
        ...currentHistory,
        items: newItems,
      };
    }

    historyStore.setState(newHistory);
    return addedItemId;
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    const currentHistory = historyStore.getSnapshot();
    const newHistory = {
      ...currentHistory,
      items: currentHistory.items.filter(item => item.id !== id),
    };
    historyStore.setState(newHistory);
  }, []);

  const clearHistory = useCallback(() => {
    const currentHistory = historyStore.getSnapshot();
    const newHistory = {
      ...currentHistory,
      items: [],
    };
    historyStore.setState(newHistory);
  }, []);

  const getHistoryItem = useCallback((id: string): HistoryItem | undefined => {
    return history.items.find(item => item.id === id);
  }, [history.items]);

  const exportHistory = useCallback(() => {
    const exportData = {
      exportDate: new Date().toISOString(),
      version: "1.0",
      items: history.items,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: "application/json" 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `qretro-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [history.items]);

  return {
    // State
    items: history.items,
    isLoaded: true, // Always loaded with useSyncExternalStore
    
    // Actions
    addToHistory,
    removeFromHistory,
    clearHistory,
    getHistoryItem,
    exportHistory,
    
    // Computed
    isEmpty: history.items.length === 0,
    count: history.items.length,
    maxItems: history.maxItems,
  };
}