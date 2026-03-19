"use client";

import { useEffect, useRef, useCallback } from "react";
import { useThemeStore } from "@/stores/theme-store";
import { THEMES, type ThemeId } from "@/lib/themes";

const STYLE_ID = "ambient-theme-transition";
const DWELL_MS = 120_000;    // 2 minutes between switches
const TRANSITION_S = 20;     // 20-second fade

/**
 * Ambient Theme Cycling
 *
 * Automatically cycles through themes on the landing page to make
 * it feel alive. The transition is ultra-slow (20s) so users barely
 * notice the color shift — it feels organic, like ambient lighting.
 *
 * - Dwell time: 2 minutes per theme
 * - Transition: 20 seconds (imperceptible gradual shift)
 * - Only runs on landing page (via LandingHeader)
 * - Stops if user manually selects a theme (respects user choice)
 * - Cleans up on unmount
 */
export function useAmbientTheme() {
  const setTheme = useThemeStore((s) => s.setTheme);
  const currentTheme = useThemeStore((s) => s.theme);
  const manualOverride = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const themeIndexRef = useRef(0);

  useEffect(() => {
    const idx = THEMES.findIndex((t) => t.id === currentTheme);
    themeIndexRef.current = idx >= 0 ? idx : 0;

    // Inject a <style> tag that adds slow transitions to key layout elements.
    // We target specific selectors rather than `*` to avoid interfering
    // with Framer Motion transforms and interactive hover states.
    const styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    styleEl.textContent = `
      /* Ambient theme transition — slow fade on backgrounds & text */
      html, body,
      main, section, footer, header, nav,
      div[class*="bg-"], div[class*="border-"],
      h1, h2, h3, h4, h5, h6, p, span,
      svg line, svg circle, svg path, svg rect {
        transition: color ${TRANSITION_S}s ease-in-out,
                    background-color ${TRANSITION_S}s ease-in-out,
                    border-color ${TRANSITION_S}s ease-in-out,
                    fill ${TRANSITION_S}s ease-in-out,
                    stroke ${TRANSITION_S}s ease-in-out,
                    box-shadow ${TRANSITION_S}s ease-in-out;
      }

      /* Interactive elements stay snappy */
      button, a, input, textarea, select,
      [role="button"], [data-slot="control"] {
        transition: color 0.3s, background-color 0.3s, border-color 0.3s,
                    transform 0.2s, box-shadow 0.3s, opacity 0.3s !important;
      }
    `;
    document.head.appendChild(styleEl);

    // Cycle to next theme
    const cycleTheme = () => {
      if (manualOverride.current) return;
      themeIndexRef.current = (themeIndexRef.current + 1) % THEMES.length;
      const nextTheme = THEMES[themeIndexRef.current].id as ThemeId;
      setTheme(nextTheme);
    };

    intervalRef.current = setInterval(cycleTheme, DWELL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const el = document.getElementById(STYLE_ID);
      if (el) el.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stopAmbient = useCallback(() => {
    manualOverride.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Remove slow transitions so user's manual pick is instant
    const el = document.getElementById(STYLE_ID);
    if (el) el.remove();
  }, []);

  return { stopAmbient };
}
