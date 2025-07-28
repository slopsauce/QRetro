"use client";

import { useState, useEffect } from "react";
import { useHistory, HistoryItem } from "@/hooks/use-history";
import { RetroFrame } from "./retro-frame";
import { cn } from "@/lib/utils";

interface HistoryPanelProps {
  onLoadItem?: (item: HistoryItem) => void;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (itemDate.getTime() === today.getTime()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString([], { month: '2-digit', day: '2-digit' }) + 
           ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case "text": return "TEXT";
    case "url": return "URL";
    case "wifi": return "WIFI";
    case "email": return "EMAIL";
    case "sms": return "SMS";
    case "phone": return "PHONE";
    case "vcard": return "VCARD";
    case "crypto": return "CRYPTO";
    default: return type.toUpperCase();
  }
}

export function HistoryPanel({ onLoadItem }: HistoryPanelProps) {
  const { items, isEmpty, count, removeFromHistory, clearHistory, exportHistory } = useHistory();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [hasAutoExpanded, setHasAutoExpanded] = useState(false);

  // Auto-expand when items are first added (only once)
  useEffect(() => {
    if (!isEmpty && !isExpanded && !hasAutoExpanded) {
      setIsExpanded(true);
      setHasAutoExpanded(true);
    }
  }, [isEmpty, isExpanded, hasAutoExpanded]);

  const displayItems = showAll ? items : items.slice(0, 3);
  const hasMore = items.length > 3;

  const handleLoadItem = (item: HistoryItem) => {
    if (onLoadItem) {
      onLoadItem(item);
    }
  };

  const handleRemoveItem = (id: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the load action
    removeFromHistory(id);
  };

  // Don't render the panel at all when empty
  if (isEmpty) {
    return null;
  }

  return (
    <div className="space-y-4">
      <RetroFrame title="HISTORY">
        <div role="region" aria-labelledby="history-heading">
          <h3 id="history-heading" className="sr-only">QR Code History</h3>
          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls="history-items"
            aria-label={`${isExpanded ? "Hide" : "Show"} saved QR codes, ${count} items total`}
            className="w-full text-left p-2 hover:bg-surface transition-colors"
          >
            <span className="text-foreground" aria-hidden="true">
              {isExpanded ? "[▼]" : "[▶]"}
            </span>
            <span className="ml-2">
              {isExpanded ? "Hide" : "Show"} Saved QR Codes ({count})
            </span>
          </button>

          {/* History Items */}
          {isExpanded && (
            <div id="history-items" className="space-y-1 mt-2">
              {displayItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleLoadItem(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleLoadItem(item);
                    }
                  }}
                  aria-label={`Load ${getTypeLabel(item.type)} QR code from ${formatDate(item.timestamp)}: ${item.preview || "No preview available"}`}
                  className={cn(
                    "group flex items-center justify-between p-2 border border-transparent",
                    "hover:border-current hover:bg-surface cursor-pointer transition-colors",
                    "focus:outline-none focus:border-accent focus:bg-surface"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted font-mono">
                        [{formatDate(item.timestamp)}]
                      </span>
                      <span className="text-accent font-bold">
                        {getTypeLabel(item.type)}
                      </span>
                    </div>
                    <div className="text-foreground truncate mt-1">
                      {item.preview || "No preview available"}
                    </div>
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleRemoveItem(item.id, e)}
                    aria-label={`Remove ${getTypeLabel(item.type)} QR code from ${formatDate(item.timestamp)} from history`}
                    className={cn(
                      "ml-2 px-2 py-1 text-xs opacity-0 group-hover:opacity-100",
                      "border border-current hover:bg-foreground hover:text-background",
                      "transition-all duration-200 focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-accent"
                    )}
                  >
                    [×]
                  </button>
                </div>
              ))}

              {/* Show More/Less Toggle */}
              {hasMore && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  aria-label={showAll ? `Show only first 3 items` : `Show all ${count} saved QR codes`}
                  className="w-full p-2 text-center text-accent border border-current hover:bg-surface transition-colors focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {showAll ? `[SHOW LESS]` : `[SHOW ALL (${count})]`}
                </button>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={clearHistory}
                  aria-label={`Clear all ${count} saved QR codes from history`}
                  className="px-3 py-1 text-sm border border-current hover:bg-foreground hover:text-background transition-colors focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  [CLEAR ALL]
                </button>
                <button
                  onClick={exportHistory}
                  aria-label="Export QR code history as JSON file"
                  className="px-3 py-1 text-sm border border-current hover:bg-foreground hover:text-background transition-colors focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  [EXPORT]
                </button>
              </div>
            </div>
          )}

          {/* Privacy Notice - shown at bottom inside the frame when user has few items */}
          {count <= 3 && (
            <div className="p-2 text-xs text-muted opacity-75">
              <div>
                <span>PRIVACY: All history stored locally on your device only</span>
              </div>
            </div>
          )}
        </div>
      </RetroFrame>
    </div>
  );
}