"use client";
import { useEffect, useRef } from "react";
import { useGameStore } from "@/stores/game-store";
import { formatTime } from "@/lib/utils";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { playTimerTick, playTimerUrgent } from "@/lib/sounds";

interface TimerBarProps {
  totalTime: number;
  className?: string;
}

export function TimerBar({ totalTime, className }: TimerBarProps) {
  const timeRemaining = useGameStore((s) => s.timeRemaining);
  const progress = totalTime > 0 ? timeRemaining / totalTime : 0;
  const isLow = timeRemaining <= 10;
  const isCritical = timeRemaining <= 5;
  const prevTimeRef = useRef(timeRemaining);

  // Play timer sounds
  useEffect(() => {
    // Only play on actual countdown (not initial set)
    if (prevTimeRef.current !== timeRemaining && timeRemaining > 0) {
      if (isCritical) {
        playTimerUrgent();
      } else if (isLow) {
        playTimerTick();
      }
    }
    prevTimeRef.current = timeRemaining;
  }, [timeRemaining, isLow, isCritical]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <span className="font-mono text-[9px] tracking-wider uppercase text-white/20 flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          Time
        </span>
        <motion.span
          className={cn(
            "font-mono text-sm font-bold tabular-nums",
            isCritical ? "text-[#fda4af]" : isLow ? "text-amber-400" : "text-[#7dd3fc]"
          )}
          animate={isCritical ? { opacity: [1, 0.5, 1] } : {}}
          transition={isCritical ? { duration: 0.6, repeat: Infinity } : {}}
        >
          {formatTime(timeRemaining)}
        </motion.span>
      </div>

      <div className="relative h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full transition-colors duration-500",
            isCritical
              ? "bg-[#fda4af]"
              : isLow
              ? "bg-amber-400"
              : "bg-[#7dd3fc]"
          )}
          style={{ width: `${progress * 100}%` }}
          animate={isCritical ? { opacity: [1, 0.5, 1] } : {}}
          transition={isCritical ? { duration: 0.6, repeat: Infinity } : {}}
        />
      </div>
    </div>
  );
}
