"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { AvatarDisplay } from "@/components/profile/avatar-picker";
import { Trophy, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientText } from "@/components/ui/gradient-text";
import { GlassCard } from "@/components/shared/glass-card";
import { playVictoryFanfare, playSuspenseSting } from "@/lib/sounds";

function AnimatedCounter({ value, delay = 0 }: { value: number; delay?: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 300 }}
    >
      {value > 0 ? "+" : ""}{value}
    </motion.span>
  );
}

export function RoundResults() {
  const voteResult = useGameStore((s) => s.voteResult);
  const players = useGameStore((s) => s.players);

  // Play victory or suspense sound on mount
  useEffect(() => {
    if (!voteResult) return;
    const timer = setTimeout(() => {
      if (voteResult.imposterWasFound) {
        playVictoryFanfare();
      } else {
        playSuspenseSting();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [voteResult]);

  if (!voteResult) return null;

  const getPlayer = (id: string) => players.find((p) => p.id === id);
  const imposter = getPlayer(voteResult.imposterId);

  // Sort players by votes received
  const sortedPlayers = [...players].sort((a, b) => {
    const aVotes = voteResult.voteCounts[a.id] || 0;
    const bVotes = voteResult.voteCounts[b.id] || 0;
    return bVotes - aVotes;
  });

  const maxVotes = Math.max(...Object.values(voteResult.voteCounts), 1);

  // Particle burst for celebration (muted colors)
  const particles = Array.from({ length: 24 }, (_, i) => ({
    angle: (i / 24) * 360,
    delay: Math.random() * 0.5,
    distance: 80 + Math.random() * 80,
    size: 2 + Math.random() * 4,
    color: ["#7dd3fc", "#c4b5fd", "#fda4af", "#86efac", "#fde68a"][Math.floor(Math.random() * 5)],
  }));

  return (
    <div className="relative max-w-2xl mx-auto text-center overflow-hidden px-1">
      {/* Particle burst */}
      <div className="absolute inset-0 flex items-start justify-center pointer-events-none">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1.5, 0],
              x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
              y: Math.sin((p.angle * Math.PI) / 180) * p.distance - 50,
              opacity: [0, 0.7, 0],
            }}
            transition={{ delay: 0.2 + p.delay, duration: 1.2, ease: "easeOut" }}
            className="absolute top-20 rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
            }}
          />
        ))}
      </div>

      {/* Result announcement */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="mb-8 relative"
      >
        {voteResult.imposterWasFound ? (
          <div className="space-y-3">
            <motion.div
              animate={{
                rotate: [0, -10, 10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-[#86efac] mx-auto opacity-80" />
            </motion.div>
            <h3 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-4xl font-bold">
              <GradientText colors={["#86efac", "#7dd3fc", "#86efac", "#7dd3fc", "#86efac"]} animationSpeed={3}>
                Imposter Found!
              </GradientText>
            </h3>
          </div>
        ) : (
          <div className="space-y-3">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-[#fda4af] mx-auto opacity-80" />
            </motion.div>
            <h3 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-4xl font-bold">
              <GradientText colors={["#fda4af", "#c4b5fd", "#fda4af", "#c4b5fd", "#fda4af"]} animationSpeed={3}>
                Imposter Escaped!
              </GradientText>
            </h3>
          </div>
        )}
      </motion.div>

      {/* Imposter reveal card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="mb-8"
      >
        <div
          className="rounded-xl border border-[#fda4af]/10 bg-[#0c0c14]/70 backdrop-blur-sm overflow-hidden"
          style={{ boxShadow: "0 0 30px rgba(253,164,175,0.08)" }}
        >
          <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#fda4af]" />
            <span className="font-mono text-[9px] tracking-wider uppercase text-white/20">
              The Imposter Was
            </span>
          </div>
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              {imposter && (
                <AvatarDisplay avatarId={imposter.avatarId} size="lg" />
              )}
              <span className="text-2xl sm:text-3xl font-bold text-[#fda4af] font-[family-name:var(--font-outfit)]">
                {imposter?.nickname}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Vote tally */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="rounded-xl border border-white/[0.06] bg-[#0c0c14]/70 backdrop-blur-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#7dd3fc]" />
            <span className="font-mono text-[9px] tracking-wider uppercase text-white/20">
              Vote Results &amp; Scores
            </span>
          </div>
          <div className="p-3 sm:p-4 space-y-2">
            {sortedPlayers.map((player, index) => {
              const votes = voteResult.voteCounts[player.id] || 0;
              const scoreChange = voteResult.scores[player.id] || 0;
              const isImposter = player.id === voteResult.imposterId;
              const voteBarWidth = maxVotes > 0 ? (votes / maxVotes) * 100 : 0;

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -30, filter: "blur(8px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.8 + index * 0.12, duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
                  className="relative flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg overflow-hidden"
                >
                  {/* Vote count bar background */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${voteBarWidth}%` }}
                    transition={{ delay: 1 + index * 0.12, duration: 0.6, ease: "easeOut" }}
                    className={cn(
                      "absolute left-0 top-0 h-full rounded-lg",
                      isImposter ? "bg-[#fda4af]/[0.06]" : "bg-[#7dd3fc]/[0.04]"
                    )}
                  />

                  {/* Rank number */}
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9 + index * 0.12, type: "spring" }}
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold relative",
                      index === 0 ? "bg-[#fde68a]/10 text-[#fde68a]" : "bg-white/[0.03] text-white/25"
                    )}
                  >
                    {index + 1}
                  </motion.span>

                  <div className="relative">
                    <AvatarDisplay avatarId={player.avatarId} size="sm" />
                  </div>
                  <span className={cn(
                    "font-mono text-xs flex-1 text-left relative",
                    isImposter ? "text-[#fda4af]" : "text-white/60"
                  )}>
                    {player.nickname}
                    {isImposter && <span className="text-[10px] ml-1 text-[#fda4af]/40">(Imposter)</span>}
                  </span>
                  <span className="text-[10px] text-white/25 font-mono relative">
                    {votes} vote{votes !== 1 ? "s" : ""}
                  </span>
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + index * 0.12 }}
                    className={cn(
                      "text-xs font-mono font-bold flex items-center gap-1 relative min-w-[50px] justify-end",
                      scoreChange > 0 ? "text-[#86efac]" : scoreChange < 0 ? "text-[#fda4af]" : "text-white/25"
                    )}
                  >
                    {scoreChange > 0 ? <TrendingUp className="w-3 h-3" /> : scoreChange < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                    <AnimatedCounter value={scoreChange} delay={1.3 + index * 0.12} />
                  </motion.span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
