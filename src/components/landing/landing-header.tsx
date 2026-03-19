"use client";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { useAmbientTheme } from "@/hooks/use-ambient-theme";

export function LandingHeader() {
  const { stopAmbient } = useAmbientTheme();

  return (
    <div className="fixed top-4 right-4 z-50">
      <ThemeSwitcher compact onManualSelect={stopAmbient} />
    </div>
  );
}
