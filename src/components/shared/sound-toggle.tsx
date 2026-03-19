"use client";
import { useSettingsStore } from "@/stores/settings-store";
import { initAudio } from "@/lib/sounds";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SoundToggle({ className }: { className?: string }) {
  const { soundEnabled, toggleSound } = useSettingsStore();

  const handleToggle = () => {
    initAudio();
    toggleSound();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleToggle}
      className={cn(
        "relative h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-300",
        "border border-white/[0.06] bg-white/[0.02]",
        soundEnabled
          ? "text-accent-sky hover:bg-accent-sky/[0.08] hover:border-accent-sky/20"
          : "text-white/25 hover:bg-white/[0.04] hover:border-white/[0.1]",
        className
      )}
      title={soundEnabled ? "Mute sounds" : "Unmute sounds"}
    >
      {soundEnabled ? (
        <Volume2 className="w-4 h-4" />
      ) : (
        <VolumeX className="w-4 h-4" />
      )}
    </motion.button>
  );
}
