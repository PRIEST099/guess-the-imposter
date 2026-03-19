"use client";
import { useParams } from "next/navigation";
import { useGame } from "@/hooks/use-game";
import { useGameStore } from "@/stores/game-store";
import { PhaseManager } from "@/components/game/phase-manager";
import { Scoreboard } from "@/components/shared/scoreboard";
import { RoomCodeDisplay } from "@/components/shared/room-code-display";
import { AnimatedBackground } from "@/components/shared/animated-background";
import { SoundToggle } from "@/components/shared/sound-toggle";
import { motion } from "framer-motion";

export default function GamePage() {
  const params = useParams();
  const code = params.code as string;
  useGame();
  const { currentRound, settings } = useGameStore();

  return (
    <main className="relative min-h-screen bg-[#08080f] overflow-hidden">
      <AnimatedBackground variant="game" />

      <div className="relative z-10 p-3 sm:p-4 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.23, 0.86, 0.39, 0.96] }}
          className="flex items-center justify-between mb-6 sm:mb-8 max-w-5xl mx-auto gap-2"
        >
          <RoomCodeDisplay code={code} />
          <div className="flex items-center gap-2 sm:gap-3">
            <SoundToggle />
            <div className="rounded-xl px-3 sm:px-5 py-2.5 sm:py-3 border border-white/[0.06] bg-[#0c0c14]/70 backdrop-blur-sm shrink-0">
              <span className="font-mono text-[9px] tracking-wider uppercase text-white/20 mr-1.5 sm:mr-2 hidden sm:inline">Round</span>
              <span className="font-mono text-[9px] tracking-wider uppercase text-white/20 mr-1 sm:hidden">R</span>
              <span className="font-mono font-bold text-[#7dd3fc] text-base sm:text-lg">
                {currentRound}
              </span>
              <span className="text-white/10 mx-1 sm:mx-1.5">/</span>
              <span className="font-mono text-white/30 text-sm sm:text-base">{settings.totalRounds}</span>
            </div>
          </div>
        </motion.div>

        {/* Main game area */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="lg:col-span-3"
          >
            <PhaseManager />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="lg:col-span-1"
          >
            <Scoreboard className="rounded-xl border border-white/[0.06] bg-[#0c0c14]/70 backdrop-blur-sm" />
          </motion.div>
        </div>
      </div>
    </main>
  );
}
