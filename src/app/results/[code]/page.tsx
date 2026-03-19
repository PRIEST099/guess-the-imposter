"use client";
import { useGameStore } from "@/stores/game-store";
import { usePlayerStore } from "@/stores/player-store";
import { AvatarDisplay } from "@/components/profile/avatar-picker";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/use-socket";
import { motion } from "framer-motion";
import { Trophy, Crown, Medal, Award, Home, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useEffect, useCallback } from "react";
import { GradientText } from "@/components/ui/gradient-text";
import { AnimatedBackground } from "@/components/shared/animated-background";
import { GlassCard } from "@/components/shared/glass-card";
import { GlassButton } from "@/components/shared/glass-button";
import { playVictoryFanfare } from "@/lib/sounds";

const CONFETTI_COLORS = ["#7dd3fc", "#c4b5fd", "#fda4af", "#86efac", "#fde68a", "#fda4af"];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 80, damping: 15 },
  },
};

const podiumAccents: Record<number, { color: string; border: string; label: string }> = {
  0: { color: "#fde68a", border: "border-[#fde68a]/15", label: "1st" },
  1: { color: "#c0c0c0", border: "border-[#c0c0c0]/10", label: "2nd" },
  2: { color: "#cd7f32", border: "border-[#cd7f32]/10", label: "3rd" },
};

export default function ResultsPage() {
  const router = useRouter();
  const socket = useSocket();
  const players = useGameStore((s) => s.players);
  const hostId = useGameStore((s) => s.hostId);
  const store = useGameStore();
  const { playerId } = usePlayerStore();
  const isHost = playerId === hostId;
  const sorted = [...players].sort((a, b) => b.score - a.score);

  // Play victory fanfare on mount
  useEffect(() => {
    const timer = setTimeout(() => playVictoryFanfare(), 500);
    return () => clearTimeout(timer);
  }, []);

  // Listen for rematch event on this page too
  useEffect(() => {
    const handleRematch = (data: { roomCode: string }) => {
      store.resetRound();
      store.setPhase("WAITING" as any);
      router.push(`/lobby/${data.roomCode}`);
    };
    socket.on("game:rematch-started", handleRematch);
    return () => { socket.off("game:rematch-started", handleRematch); };
  }, [socket, store, router]);

  const handleRematch = useCallback(() => {
    socket.emit("game:rematch");
  }, [socket]);

  const confetti = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        x: ((i * 31 + 5) % 200 - 100) * 1.5,
        y: -(40 + ((i * 43 + 17) % 100)),
        color: CONFETTI_COLORS[i % 6],
        size: 3 + ((i * 19 + 3) % 4),
        rotation: (i * 73 + 11) % 360,
        delay: (i % 8) * 0.03,
      })),
    []
  );

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-4 bg-[#08080f] relative overflow-hidden">
      <AnimatedBackground variant="results" />

      {/* Confetti burst */}
      {confetti.map((c, i) => (
        <motion.div
          key={`c-${i}`}
          className="absolute rounded-sm z-20 pointer-events-none"
          style={{ left: "50%", top: "30%", width: c.size, height: c.size * 0.6, backgroundColor: c.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            x: c.x,
            y: [c.y, c.y + 300],
            opacity: [1, 0.8, 0],
            rotate: c.rotation,
            scale: [1, 0.8, 0],
          }}
          transition={{ duration: 2, delay: 0.5 + c.delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      ))}

      {/* Main content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center max-w-lg w-full space-y-8"
      >
        {/* Title */}
        <motion.div variants={fadeUpItem}>
          <p className="font-mono text-[9px] tracking-wider uppercase text-white/20 mb-2">Final Results</p>
          <h1 className="font-[family-name:var(--font-outfit)] text-4xl sm:text-5xl font-bold tracking-tighter">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white/95 to-white/60">
              Game{" "}
            </span>
            <GradientText
              colors={["#7dd3fc", "#c4b5fd", "#fda4af", "#86efac", "#7dd3fc"]}
              animationSpeed={4}
              className="font-[family-name:var(--font-outfit)]"
            >
              Over
            </GradientText>
          </h1>
        </motion.div>

        {/* Leaderboard card */}
        <motion.div variants={fadeUpItem}>
          <div className="rounded-xl border border-white/[0.06] bg-[#0c0c14]/70 backdrop-blur-sm overflow-hidden">
            {/* Header */}
            <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#fde68a]" style={{ boxShadow: "0 0 6px #fde68a60" }} />
              <span className="font-mono text-[9px] tracking-wider uppercase text-white/20">Leaderboard</span>
            </div>

            {/* Podium — top 3 */}
            <div className="p-4 space-y-0">
              {sorted.map((player, index) => {
                const isTopThree = index < 3;
                const accent = podiumAccents[index];

                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.8 + index * 0.1,
                      type: "spring",
                      stiffness: 120,
                      damping: 14,
                    }}
                    className={cn(
                      "flex items-center gap-3 sm:gap-4 px-3 py-3",
                      index < sorted.length - 1 && "border-b border-white/[0.04]"
                    )}
                  >
                    {/* Rank */}
                    <div className="w-7 flex items-center justify-center shrink-0">
                      {isTopThree ? (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold"
                          style={{
                            backgroundColor: `${accent.color}15`,
                            color: accent.color,
                            border: `1px solid ${accent.color}30`,
                          }}
                        >
                          {index + 1}
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-white/20 font-bold">{index + 1}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <AvatarDisplay avatarId={player.avatarId} size="md" />

                    {/* Name */}
                    <span className="font-medium flex-1 text-left text-white/80 text-sm font-[family-name:var(--font-outfit)]">
                      {player.nickname}
                    </span>

                    {/* Score */}
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.0 + index * 0.12, duration: 0.5, type: "spring", stiffness: 200, damping: 15 }}
                      className={cn(
                        "font-mono text-sm font-bold tabular-nums",
                        isTopThree ? "text-[#7dd3fc]" : "text-white/30"
                      )}
                    >
                      {player.score}
                    </motion.span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div variants={fadeUpItem} className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => router.push("/")}
            className="px-5 py-2 rounded-lg border border-white/[0.06] bg-transparent text-white/40 font-mono text-xs tracking-wider uppercase hover:bg-white/[0.04] transition-colors flex items-center gap-2"
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </button>
          {isHost ? (
            <button
              onClick={handleRematch}
              className="px-5 py-2 rounded-lg border border-[#86efac]/20 bg-transparent text-[#86efac] font-mono text-xs tracking-wider uppercase hover:bg-[#86efac]/[0.06] transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Rematch
            </button>
          ) : (
            <button
              onClick={() => router.push("/")}
              className="px-5 py-2 rounded-lg border border-[#7dd3fc]/20 bg-transparent text-[#7dd3fc] font-mono text-xs tracking-wider uppercase hover:bg-[#7dd3fc]/[0.06] transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Play Again
            </button>
          )}
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#08080f] to-transparent pointer-events-none" />
    </main>
  );
}
