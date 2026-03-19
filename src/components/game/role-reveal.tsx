"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { Eye, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientText } from "@/components/ui/gradient-text";
import { GlassCard } from "@/components/shared/glass-card";
import { playRoleReveal } from "@/lib/sounds";

export function RoleReveal() {
  const myRole = useGameStore((s) => s.myRole);
  const myPrompt = useGameStore((s) => s.myPrompt);
  const currentRound = useGameStore((s) => s.currentRound);
  const isImposter = myRole === "IMPOSTER";

  // Play role reveal sound on mount
  useEffect(() => {
    const timer = setTimeout(() => playRoleReveal(isImposter), 400);
    return () => clearTimeout(timer);
  }, [isImposter]);

  const particles = Array.from({ length: 16 }, (_, i) => ({
    angle: (i / 16) * 360,
    delay: i * 0.04,
    distance: 80 + Math.random() * 50,
    size: 2 + Math.random() * 3,
  }));

  return (
    <div className="relative flex items-center justify-center min-h-[60vh] overflow-hidden">
      {/* Subtle color tint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 1.2 }}
        className={cn(
          "absolute inset-0 pointer-events-none",
          isImposter
            ? "bg-gradient-to-b from-[#fda4af]/[0.04] via-transparent to-transparent"
            : "bg-gradient-to-b from-[#86efac]/[0.04] via-transparent to-transparent"
        )}
      />

      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.5, opacity: 0, filter: "blur(20px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", duration: 1 }}
          className="relative z-10 w-full max-w-2xl mx-auto"
        >
          {/* Round indicator */}
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-mono text-[9px] tracking-wider uppercase text-white/20 text-center mb-8"
          >
            Round {currentRound}
          </motion.p>

          {/* Two-card layout */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8">
            {/* PLAYER card (left) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: isImposter ? 0.4 : 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className={cn(
                "rounded-xl border bg-[#0c0c14]/70 backdrop-blur-sm p-5 sm:p-6 text-center",
                !isImposter
                  ? "border-[#86efac]/10"
                  : "border-white/[0.06]"
              )}
              style={
                !isImposter
                  ? { boxShadow: "0 0 30px rgba(134,239,172,0.1)" }
                  : undefined
              }
            >
              <div className="px-4 py-2 border-b border-white/[0.04] -mx-5 -mt-5 sm:-mx-6 sm:-mt-6 mb-4 sm:mb-5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#86efac]" />
                <span className="font-mono text-[9px] tracking-wider uppercase text-white/20">
                  Player
                </span>
              </div>
              <div className={cn(
                "w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto mb-4 flex items-center justify-center",
                !isImposter ? "bg-[#86efac]/10 border border-[#86efac]/20" : "bg-white/[0.03] border border-white/[0.06]"
              )}>
                <Eye className={cn("w-7 h-7 sm:w-8 sm:h-8", !isImposter ? "text-[#86efac]" : "text-white/20")} />
              </div>
              <p className="font-mono text-xs tracking-wider uppercase text-white/30 mb-2">
                {!isImposter ? "Your Prompt" : "Prompt"}
              </p>
              <p className={cn(
                "text-lg sm:text-xl font-[family-name:var(--font-outfit)] font-semibold",
                !isImposter ? "text-white/90" : "text-white/20"
              )}>
                {!isImposter ? myPrompt : "—"}
              </p>
            </motion.div>

            {/* IMPOSTER card (right) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: isImposter ? 1 : 0.4, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className={cn(
                "rounded-xl border bg-[#0c0c14]/70 backdrop-blur-sm p-5 sm:p-6 text-center",
                isImposter
                  ? "border-[#fda4af]/10"
                  : "border-white/[0.06]"
              )}
              style={
                isImposter
                  ? { boxShadow: "0 0 30px rgba(253,164,175,0.1)" }
                  : undefined
              }
            >
              <div className="px-4 py-2 border-b border-white/[0.04] -mx-5 -mt-5 sm:-mx-6 sm:-mt-6 mb-4 sm:mb-5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#fda4af]" />
                <span className="font-mono text-[9px] tracking-wider uppercase text-white/20">
                  Imposter
                </span>
              </div>
              <div className={cn(
                "w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto mb-4 flex items-center justify-center",
                isImposter ? "bg-[#fda4af]/10 border border-[#fda4af]/20" : "bg-white/[0.03] border border-white/[0.06]"
              )}>
                <AlertTriangle className={cn("w-7 h-7 sm:w-8 sm:h-8", isImposter ? "text-[#fda4af]" : "text-white/20")} />
              </div>
              <p className="font-mono text-xs tracking-wider uppercase text-white/30 mb-2">
                {isImposter ? "No Prompt" : "Prompt"}
              </p>
              <p className={cn(
                "text-lg sm:text-xl font-[family-name:var(--font-outfit)] font-semibold",
                isImposter ? "text-[#fda4af]/70" : "text-white/20"
              )}>
                ???
              </p>
            </motion.div>
          </div>

          {/* Role announcement */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="text-center mb-6"
          >
            <GradientText
              className="font-[family-name:var(--font-outfit)] text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight"
              colors={
                isImposter
                  ? ["#fda4af", "#c4b5fd", "#fda4af", "#c4b5fd", "#fda4af"]
                  : ["#86efac", "#7dd3fc", "#86efac", "#7dd3fc", "#86efac"]
              }
              animationSpeed={6}
            >
              {isImposter ? "IMPOSTER" : "PLAYER"}
            </GradientText>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-white/40 text-base font-[family-name:var(--font-outfit)] text-center"
          >
            {isImposter ? "Blend in. Don't get caught." : "Find the imposter among you."}
          </motion.p>

          {/* Particle burst */}
          <div className="absolute top-1/2 left-1/2 pointer-events-none">
            {particles.map((particle, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
                  y: Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  delay: 0.5 + particle.delay,
                  duration: 1.2,
                  ease: "easeOut",
                }}
                className={cn(
                  "absolute rounded-full",
                  isImposter ? "bg-[#fda4af]" : "bg-[#86efac]"
                )}
                style={{
                  width: particle.size,
                  height: particle.size,
                  marginLeft: -particle.size / 2,
                  marginTop: -particle.size / 2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
