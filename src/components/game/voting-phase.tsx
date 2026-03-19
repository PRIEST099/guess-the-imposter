"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { usePlayerStore } from "@/stores/player-store";
import { AvatarDisplay } from "@/components/profile/avatar-picker";
import { Vote, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { playVoteCast } from "@/lib/sounds";

interface VotingPhaseProps {
  onVote: (playerId: string) => void;
}

function VotingCard({
  player,
  isVoted,
  onVote,
  index,
}: {
  player: { id: string; nickname: string; avatarId: string };
  isVoted: boolean;
  onVote: (id: string) => void;
  index: number;
}) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.button
      ref={cardRef}
      key={player.id}
      initial={{ opacity: 0, scale: 0.8, y: 20, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay: index * 0.07, type: "spring", stiffness: 200, damping: 25 }}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => { playVoteCast(); onVote(player.id); }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative rounded-xl p-3 sm:p-5 border transition-all duration-300 text-center group overflow-hidden min-h-[100px] bg-[#0c0c14]/70 backdrop-blur-sm",
        isVoted
          ? "border-[#fda4af]/20"
          : "border-white/[0.06] hover:border-white/[0.12]"
      )}
      style={
        isVoted
          ? { boxShadow: "0 0 30px rgba(253,164,175,0.1)" }
          : undefined
      }
    >
      <div className="relative flex flex-col items-center gap-3">
        {/* Player avatar as colored circle */}
        <div className={cn(
          "relative rounded-full transition-all duration-300",
          isVoted && "ring-2 ring-[#fda4af]/30 ring-offset-2 ring-offset-[#0c0c14]"
        )}>
          <AvatarDisplay avatarId={player.avatarId} size="lg" />
        </div>
        <span className="font-mono text-xs text-white/50 truncate w-full">{player.nickname}</span>

        <AnimatePresence>
          {isVoted && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex items-center gap-1.5 text-[#fda4af] text-[10px] font-mono uppercase tracking-wider"
            >
              <div className="w-4 h-4 rounded-full bg-[#fda4af]/10 border border-[#fda4af]/20 flex items-center justify-center">
                <Check className="w-2.5 h-2.5" />
              </div>
              <span>Voted</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}

export function VotingPhase({ onVote }: VotingPhaseProps) {
  const players = useGameStore((s) => s.players);
  const myVote = useGameStore((s) => s.myVote);
  const { playerId } = usePlayerStore();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-10 px-2"
      >
        <div className="rounded-xl border border-white/[0.06] bg-[#0c0c14]/70 backdrop-blur-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#fda4af]" />
            <span className="font-mono text-[9px] tracking-wider uppercase text-white/20">
              Cast Your Vote
            </span>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-white/40 text-sm">
              Who do you think is the imposter? You cannot vote for yourself.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {players
          .filter((p) => p.id !== playerId)
          .map((player, index) => (
            <VotingCard
              key={player.id}
              player={player}
              isVoted={myVote === player.id}
              onVote={onVote}
              index={index}
            />
          ))}
      </div>
    </div>
  );
}
