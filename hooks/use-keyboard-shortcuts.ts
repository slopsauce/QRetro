"use client";

import { useEffect, useCallback, useState } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return;
    }

    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrl === event.ctrlKey;
      const altMatches = !!shortcut.alt === event.altKey;
      const shiftMatches = !!shortcut.shift === event.shiftKey;

      if (keyMatches && ctrlMatches && altMatches && shiftMatches) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

// Hook to show/hide shortcuts help overlay
export function useShortcutsHelp() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleHelp = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  const hideHelp = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    isVisible,
    toggleHelp,
    hideHelp,
  };
}