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
        <div>
          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-left p-2 hover:bg-surface transition-colors"
          >
            <span className="text-foreground">
              {isExpanded ? "[▼]" : "[▶]"}
            </span>
            <span className="ml-2">
              {isExpanded ? "Hide" : "Show"} Saved QR Codes ({count})
            </span>
          </button>

          {/* History Items */}
          {isExpanded && (
            <div className="space-y-1 mt-2">
              {displayItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleLoadItem(item)}
                  className={cn(
                    "group flex items-center justify-between p-2 border border-transparent",
                    "hover:border-current hover:bg-surface cursor-pointer transition-colors"
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
                    className={cn(
                      "ml-2 px-2 py-1 text-xs opacity-0 group-hover:opacity-100",
                      "border border-current hover:bg-foreground hover:text-background",
                      "transition-all duration-200"
                    )}
                    title="Remove from history"
                  >
                    [×]
                  </button>
                </div>
              ))}

              {/* Show More/Less Toggle */}
              {hasMore && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full p-2 text-center text-accent border border-current hover:bg-surface transition-colors"
                >
                  {showAll ? `[SHOW LESS]` : `[SHOW ALL (${count})]`}
                </button>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={clearHistory}
                  className="px-3 py-1 text-sm border border-current hover:bg-foreground hover:text-background transition-colors"
                >
                  [CLEAR ALL]
                </button>
                <button
                  onClick={exportHistory}
                  className="px-3 py-1 text-sm border border-current hover:bg-foreground hover:text-background transition-colors"
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