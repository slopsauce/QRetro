"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeColor() {
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    // Get the actual theme (handle system theme)
    const currentTheme = theme === "system" ? systemTheme : theme;
    
    // Define colors for each theme
    const themeColors = {
      dark: "#00ff00",    // Classic terminal green for dark mode
      light: "#1a1a1a",   // Dark charcoal for light mode status bar
    };

    // Get the appropriate color
    const color = themeColors[currentTheme as keyof typeof themeColors] || themeColors.dark;

    // Update or create the theme-color meta tag
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    
    metaThemeColor.setAttribute('content', color);
  }, [theme, systemTheme]);

  // This component doesn't render anything visible
  return null;
}