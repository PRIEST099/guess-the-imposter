"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { GamePhase } from "@/types/game";
import { Palette, MessageSquare, Vote, Trophy, Eye, Sparkles } from "lucide-react";

const PHASE_CONFIG: Record<string, { label: string; icon: typeof Palette; color: string; dotColor: string }> = {
  [GamePhase.ROLE_REVEAL]: {
    label: "Role Reveal",
    icon: Eye,
    color: "text-[#c4b5fd]",
    dotColor: "#c4b5fd",
  },
  [GamePhase.TASK]: {
    label: "Task Time",
    icon: Palette,
    color: "text-[#7dd3fc]",
    dotColor: "#7dd3fc",
  },
  [GamePhase.DISCUSSION]: {
    label: "Discussion",
    icon: MessageSquare,
    color: "text-[#c4b5fd]",
    dotColor: "#c4b5fd",
  },
  [GamePhase.VOTING]: {
    label: "Vote Now",
    icon: Vote,
    color: "text-[#fda4af]",
    dotColor: "#fda4af",
  },
  [GamePhase.ROUND_RESULTS]: {
    label: "Results",
    icon: Trophy,
    color: "text-[#fde68a]",
    dotColor: "#fde68a",
  },
};

interface PhaseAnnouncementProps {
  phase: GamePhase;
}

export function PhaseAnnouncement({ phase }: PhaseAnnouncementProps) {
  const [visible, setVisible] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<GamePhase | null>(null);

  useEffect(() => {
    const config = PHASE_CONFIG[phase];
    if (!config) return;

    setCurrentPhase(phase);
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, [phase]);

  const config = currentPhase ? PHASE_CONFIG[currentPhase] : null;

  return (
    <AnimatePresence>
      {visible && config && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-[#08080f]/80"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            transition={{
              duration: 0.4,
              type: "spring",
              stiffness: 150,
              damping: 20,
            }}
            className="text-center relative"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
              className="mb-4"
            >
              <config.icon className={`w-10 h-10 sm:w-14 sm:h-14 mx-auto ${config.color} opacity-60`} />
            </motion.div>

            {/* Label */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className={`font-[family-name:var(--font-outfit)] text-4xl sm:text-6xl font-bold tracking-tight ${config.color}`}
            >
              {config.label}
            </motion.h2>

            {/* Decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex items-center justify-center gap-2 mt-4"
            >
              <div className="w-10 h-px bg-white/[0.06]" />
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.dotColor, opacity: 0.4 }} />
              <div className="w-10 h-px bg-white/[0.06]" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
