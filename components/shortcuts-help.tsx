"use client";

import { KeyboardShortcut } from "@/hooks/use-keyboard-shortcuts";
import { RetroFrame } from "./retro-frame";

interface ShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
  isVisible: boolean;
  onClose: () => void;
}

function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts = [];
  if (shortcut.ctrl) parts.push("Ctrl");
  if (shortcut.alt) parts.push("Alt");
  if (shortcut.shift) parts.push("Shift");
  parts.push(shortcut.key.toUpperCase());
  return parts.join("+");
}

export function ShortcutsHelp({ shortcuts, isVisible, onClose }: ShortcutsHelpProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="max-w-md w-full mx-4">
        <RetroFrame title="KEYBOARD SHORTCUTS">
          <div className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex justify-between items-center p-2 hover:bg-surface">
                <span className="text-foreground">{shortcut.description}</span>
                <span className="text-accent font-mono font-bold">
                  [{formatShortcut(shortcut)}]
                </span>
              </div>
            ))}
            
            <div className="pt-4 border-t border-current">
              <button
                onClick={onClose}
                className="w-full p-2 border-2 border-accent text-accent hover:bg-accent hover:text-background transition-colors"
              >
                [CLOSE] or press ESC
              </button>
            </div>
          </div>
        </RetroFrame>
      </div>
    </div>
  );
}