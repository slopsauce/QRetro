"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed top-4 right-4 p-2 border-2 border-current ascii-border hover:bg-foreground hover:text-background transition-colors z-50"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "[LIGHT]" : "[DARK]"}
    </button>
  );
}