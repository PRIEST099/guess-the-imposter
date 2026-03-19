"use client";
import { motion } from "framer-motion";
import { THEMES } from "@/lib/themes";
import { useThemeStore } from "@/stores/theme-store";
import { cn } from "@/lib/utils";
import { Palette } from "lucide-react";

interface ThemeSwitcherProps {
  compact?: boolean;
  /** Called when the user manually picks a theme (stops ambient cycling) */
  onManualSelect?: () => void;
}

export function ThemeSwitcher({ compact = false, onManualSelect }: ThemeSwitcherProps) {
  const { theme, setTheme } = useThemeStore();

  const handleSelect = (id: string) => {
    onManualSelect?.();
    setTheme(id as any);
  };

  return (
    <div className={cn(
      "flex items-center gap-2",
      !compact && "p-2 rounded-xl border border-white/[0.06] bg-white/[0.02]"
    )}>
      {!compact && (
        <Palette className="w-3.5 h-3.5 text-white/25 mr-0.5" />
      )}
      {THEMES.map((t) => (
        <motion.button
          key={t.id}
          onClick={() => handleSelect(t.id)}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "relative rounded-full transition-all duration-300",
            compact ? "w-5 h-5" : "w-6 h-6",
            theme === t.id
              ? "ring-2 ring-white/50 ring-offset-1 ring-offset-[#0c0c14]"
              : "ring-1 ring-white/[0.08] hover:ring-white/20"
          )}
          style={{
            backgroundColor: t.preview,
            boxShadow: theme === t.id ? `0 0 12px ${t.preview}40` : undefined,
          }}
          title={t.name}
        >
          {theme === t.id && (
            <motion.div
              layoutId="theme-active"
              className="absolute inset-0 rounded-full ring-2 ring-white/60"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}
