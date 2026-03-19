"use client";
import { cn } from "@/lib/utils";
import { AVATARS } from "@/lib/constants";
import { motion } from "framer-motion";

interface AvatarPickerProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

const AVATAR_ICONS = [
  "\u{1F47E}", "\u{1F916}", "\u{1F47D}", "\u{1F3AE}", "\u{1F98A}", "\u{1F43A}", "\u{1F981}", "\u{1F419}",
  "\u{1F3AF}", "\u{1F52E}", "\u{26A1}", "\u{1F31F}", "\u{1F3AA}", "\u{1F3AD}", "\u{1F0CF}", "\u{1F3B2}",
  "\u{1F985}", "\u{1F409}", "\u{1F988}", "\u{1F42C}", "\u{1F99C}", "\u{1F438}", "\u{1F989}", "\u{1F41D}",
];

export function AvatarPicker({ selectedId, onSelect }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-6 sm:grid-cols-6 gap-2 sm:gap-2.5">
      {AVATARS.map((avatar, index) => {
        const isSelected = selectedId === avatar.id;
        return (
          <motion.button
            key={avatar.id}
            onClick={() => onSelect(avatar.id)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className={cn(
              "aspect-square w-full min-h-[44px] rounded-xl flex items-center justify-center text-lg sm:text-xl transition-all duration-400 relative",
              "border",
              isSelected
                ? "border-accent-sky/40 bg-accent-sky/[0.08]"
                : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
            )}
            style={{
              boxShadow: isSelected
                ? `0 0 20px ${avatar.color}20, 0 0 40px ${avatar.color}08`
                : undefined,
            }}
          >
            <span className="relative z-10">{AVATAR_ICONS[index] || "\u{1F464}"}</span>
            {isSelected && (
              <motion.div
                layoutId="avatar-ring"
                className="absolute inset-[-1px] rounded-xl border border-accent-sky/40"
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export function AvatarDisplay({ avatarId, size = "md" }: { avatarId: string; size?: "sm" | "md" | "lg" }) {
  const index = AVATARS.findIndex(a => a.id === avatarId);
  const avatar = AVATARS[index] || AVATARS[0];
  const icon = AVATAR_ICONS[index] || "\u{1F464}";
  const sizeClasses = {
    sm: "w-8 h-8 text-sm rounded-lg",
    md: "w-10 h-10 text-lg rounded-xl",
    lg: "w-14 h-14 text-2xl rounded-xl",
  };

  return (
    <div
      className={cn("flex items-center justify-center shrink-0", sizeClasses[size])}
      style={{
        backgroundColor: `${avatar.color}0a`,
        border: `1px solid ${avatar.color}20`,
      }}
    >
      {icon}
    </div>
  );
}
