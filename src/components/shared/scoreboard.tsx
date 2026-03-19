"use client";
import { useGameStore } from "@/stores/game-store";
import { AvatarDisplay } from "@/components/profile/avatar-picker";
import { Trophy, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";

export function Scoreboard({ className }: { className?: string }) {
  const players = useGameStore((s) => s.players);
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <GlassCard
      className={cn("p-5", className)}
    >
      <h3 className="font-[family-name:var(--font-outfit)] font-semibold mb-4 flex items-center gap-2 text-sm text-white/70">
        <Trophy className="w-4 h-4 text-accent-amber" />
        Scoreboard
      </h3>
      <div className="space-y-1.5">
        {sorted.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "flex items-center gap-2.5 text-sm rounded-xl p-2 transition-all duration-400",
              index === 0 && "bg-accent-amber/[0.06] border border-accent-amber/10"
            )}
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 + 0.1, type: "spring", stiffness: 300 }}
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                index === 0
                  ? "bg-accent-amber/15 text-accent-amber"
                  : index === 1
                  ? "bg-white/[0.06] text-white/50"
                  : index === 2
                  ? "bg-orange-500/[0.08] text-orange-400/50"
                  : "bg-transparent text-muted-foreground"
              )}
            >
              {index === 0 ? (
                <Crown className="w-3.5 h-3.5" />
              ) : (
                index + 1
              )}
            </motion.span>
            <AvatarDisplay avatarId={player.avatarId} size="sm" />
            <span className={cn(
              "flex-1 truncate font-[family-name:var(--font-fredoka)]",
              index === 0 && "text-accent-amber/90 font-medium"
            )}>
              {player.nickname}
            </span>
            <motion.span
              key={`${player.id}-${player.score}`}
              initial={{ scale: 1.3, color: "#7dd3fc" }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={cn(
                "font-mono font-bold min-w-[2ch] text-right",
                index === 0 ? "text-accent-amber" : "text-accent-sky"
              )}
            >
              {player.score}
            </motion.span>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
