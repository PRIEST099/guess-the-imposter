"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AvatarDisplay } from "@/components/profile/avatar-picker";
import { Crown, Wifi, WifiOff, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlayerInGame } from "@/types/player";

interface PlayerCardProps {
  player: PlayerInGame;
  isCurrentPlayer: boolean;
  isHost: boolean;
  canKick: boolean;
  onKick?: () => void;
}

export function PlayerCard({ player, isCurrentPlayer, isHost, canKick, onKick }: PlayerCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 border-b border-white/[0.04] last:border-b-0 transition-colors duration-300",
        "hover:bg-white/[0.02]"
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <AvatarDisplay avatarId={player.avatarId} />
        {player.isReady && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent-mint rounded-full border-2 border-[#0c0c14] flex items-center justify-center"
          >
            <Check className="w-1.5 h-1.5 text-black" />
          </motion.div>
        )}
      </div>

      {/* Name + status */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-mono text-xs truncate",
            isCurrentPlayer ? "text-accent-sky" : "text-white/70"
          )}>
            {player.nickname}
          </span>
          {isHost && (
            <Crown className="w-3 h-3 text-accent-amber/60 shrink-0" />
          )}
          {isCurrentPlayer && (
            <span className="text-[8px] text-accent-sky/40 uppercase tracking-wider font-mono">you</span>
          )}
        </div>
      </div>

      {/* Ready status */}
      <div className="shrink-0 flex items-center gap-2">
        {player.isOnline ? (
          <Wifi className="w-2.5 h-2.5 text-white/10" />
        ) : (
          <WifiOff className="w-2.5 h-2.5 text-white/10" />
        )}
        {player.isReady ? (
          <span className="text-[9px] font-mono text-accent-mint tracking-wider uppercase">Ready</span>
        ) : (
          <span className="text-[9px] font-mono text-white/20 tracking-wider uppercase">Waiting</span>
        )}
      </div>

      {/* Kick button */}
      {canKick && !isCurrentPlayer && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onKick}
          className="text-white/10 hover:text-accent-rose hover:bg-accent-rose/[0.06] h-6 w-6 p-0 rounded-md transition-colors duration-300"
        >
          <X className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}
