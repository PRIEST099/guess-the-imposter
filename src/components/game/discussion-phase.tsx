"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { usePlayerStore } from "@/stores/player-store";
import { ChatPanel } from "@/components/lobby/chat-panel";
import { AvatarDisplay } from "@/components/profile/avatar-picker";
import { MessageSquare, FileText, AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { cn } from "@/lib/utils";
import { playClick } from "@/lib/sounds";

const QUICK_REACTIONS = ["👀", "🤔", "😂", "👍", "🔥", "💀"];

interface ReactionState {
  [playerId: string]: { [emoji: string]: Set<string> };
}

interface SusState {
  [playerId: string]: Set<string>;
}

export function DiscussionPhase() {
  const submissions = useGameStore((s) => s.submissions);
  const players = useGameStore((s) => s.players);
  const { playerId: myId } = usePlayerStore();
  const [reactions, setReactions] = useState<ReactionState>({});
  const [susVotes, setSusVotes] = useState<SusState>({});
  const [spotlightId, setSpotlightId] = useState<string | null>(null);

  const getPlayer = (id: string) => players.find((p) => p.id === id);

  const toggleReaction = (targetPlayerId: string, emoji: string) => {
    playClick();
    setReactions((prev) => {
      const playerReactions = prev[targetPlayerId] || {};
      const emojiSet = new Set(playerReactions[emoji] || []);
      if (emojiSet.has(myId!)) {
        emojiSet.delete(myId!);
      } else {
        emojiSet.add(myId!);
      }
      return {
        ...prev,
        [targetPlayerId]: {
          ...playerReactions,
          [emoji]: emojiSet,
        },
      };
    });
  };

  const toggleSus = (targetPlayerId: string) => {
    playClick();
    setSusVotes((prev) => {
      const susSet = new Set(prev[targetPlayerId] || []);
      if (susSet.has(myId!)) {
        susSet.delete(myId!);
      } else {
        susSet.add(myId!);
      }
      return { ...prev, [targetPlayerId]: susSet };
    });
  };

  const getSusCount = (targetPlayerId: string) => susVotes[targetPlayerId]?.size || 0;
  const isSussed = (targetPlayerId: string) => susVotes[targetPlayerId]?.has(myId!) || false;

  return (
    <div className="max-w-4xl mx-auto px-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Submissions panel */}
        <div>
          <div className="rounded-xl border border-white/[0.06] bg-[#0c0c14]/70 backdrop-blur-sm overflow-hidden">
            {/* Card header */}
            <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#7dd3fc]" />
              <span className="font-mono text-[9px] tracking-wider uppercase text-white/20">
                Submissions
              </span>
            </div>

            <div className="p-3 sm:p-4 space-y-3">
              {submissions.map((sub, index) => {
                const player = getPlayer(sub.playerId);
                const susCount = getSusCount(sub.playerId);
                const playerIsSussed = isSussed(sub.playerId);
                const isSpotlight = spotlightId === sub.playerId;
                const playerReactions = reactions[sub.playerId] || {};

                return (
                  <motion.div
                    key={sub.playerId}
                    initial={{ opacity: 0, x: -20, filter: "blur(8px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{
                      delay: index * 0.12,
                      duration: 0.6,
                      ease: [0.25, 0.4, 0.25, 1],
                    }}
                    className={cn(
                      "rounded-lg border p-3 sm:p-4 transition-all duration-300",
                      susCount >= 2
                        ? "border-[#fda4af]/15 bg-[#fda4af]/[0.03]"
                        : isSpotlight
                        ? "border-[#c4b5fd]/15 bg-[#c4b5fd]/[0.03]"
                        : "border-white/[0.04] bg-white/[0.01]"
                    )}
                  >
                    {/* Header with player + sus button */}
                    <div className="flex items-center gap-3 mb-2.5">
                      <button
                        onClick={() => setSpotlightId(isSpotlight ? null : sub.playerId)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                      >
                        {player && <AvatarDisplay avatarId={player.avatarId} size="sm" />}
                        <span className="font-mono text-xs text-white/50">
                          {player?.nickname || "Unknown"}
                        </span>
                      </button>
                      <div className="flex-1 h-px bg-white/[0.04]" />

                      {/* Sus button */}
                      {sub.playerId !== myId && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleSus(sub.playerId)}
                          className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider font-bold transition-all duration-300 border shrink-0",
                            playerIsSussed
                              ? "bg-[#fda4af]/10 text-[#fda4af] border-[#fda4af]/20"
                              : "bg-transparent text-white/20 border-white/[0.06] hover:border-[#fda4af]/15 hover:text-[#fda4af]/60"
                          )}
                        >
                          <AlertTriangle className="w-2.5 h-2.5" />
                          SUS
                          {susCount > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-0.5"
                            >
                              ({susCount})
                            </motion.span>
                          )}
                        </motion.button>
                      )}
                    </div>

                    {/* Submission content bubble */}
                    <div className="bg-white/[0.02] rounded-lg px-3 py-2.5 mb-2.5">
                      <p className="text-white/70 text-sm">{sub.content}</p>
                    </div>

                    {/* Quick reactions */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {QUICK_REACTIONS.map((emoji) => {
                        const count = playerReactions[emoji]?.size || 0;
                        const myReacted = playerReactions[emoji]?.has(myId!) || false;
                        return (
                          <motion.button
                            key={emoji}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleReaction(sub.playerId, emoji)}
                            className={cn(
                              "flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs transition-all duration-200 border",
                              myReacted
                                ? "bg-[#c4b5fd]/10 border-[#c4b5fd]/15"
                                : "bg-transparent border-white/[0.04] hover:border-white/[0.08]"
                            )}
                          >
                            <span className="text-xs">{emoji}</span>
                            <AnimatePresence>
                              {count > 0 && (
                                <motion.span
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  className={cn(
                                    "font-mono text-[9px]",
                                    myReacted ? "text-[#c4b5fd]" : "text-white/25"
                                  )}
                                >
                                  {count}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chat panel */}
        <motion.div
          initial={{ opacity: 0, x: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.3 }}
        >
          <div className="rounded-xl border border-white/[0.06] bg-[#0c0c14]/70 backdrop-blur-sm overflow-hidden h-full flex flex-col">
            {/* Card header */}
            <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#c4b5fd]" />
              <span className="font-mono text-[9px] tracking-wider uppercase text-white/20">
                Discussion
              </span>
            </div>
            <div className="p-3 sm:p-4 flex-1 min-h-0">
              <ChatPanel />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
