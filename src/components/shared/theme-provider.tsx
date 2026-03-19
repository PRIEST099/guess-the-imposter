"use client";
import { useEffect } from "react";
import { useThemeStore } from "@/stores/theme-store";
import { getTheme } from "@/lib/themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const themeData = getTheme(theme);
    const html = document.documentElement;

    // Remove all theme classes
    html.classList.forEach((cls) => {
      if (cls.startsWith("theme-")) {
        html.classList.remove(cls);
      }
    });

    // Apply new theme class
    if (themeData.class && themeData.class !== "theme-midnight") {
      html.classList.add(themeData.class);
    }

    // Update body background for theme
    const style = getComputedStyle(html);
    const bg = style.getPropertyValue("--black-base").trim();
    if (bg) {
      document.body.style.backgroundColor = bg;
    }
  }, [theme]);

  return <>{children}</>;
}
