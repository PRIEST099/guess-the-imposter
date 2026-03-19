"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { CheckCircle2, Users } from "lucide-react";

export function SubmissionProgress() {
  const submissionCount = useGameStore((s) => s.submissionCount);
  const submissionTotal = useGameStore((s) => s.submissionTotal);
  const hasSubmitted = useGameStore((s) => s.hasSubmitted);

  if (submissionTotal <= 0) return null;

  const allDone = submissionCount >= submissionTotal;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center"
    >
      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/[0.06] bg-[#0c0c14]/70 backdrop-blur-sm">
        {/* Counter */}
        <span className="font-mono text-xs">
          <AnimatePresence mode="wait">
            <motion.span
              key={submissionCount}
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 6, opacity: 0 }}
              transition={{ duration: 0.15, type: "spring", stiffness: 300, damping: 25 }}
              className={allDone ? "text-[#86efac] font-bold" : "text-[#7dd3fc] font-bold"}
            >
              {submissionCount}
            </motion.span>
          </AnimatePresence>
          <span className="text-white/15 mx-1">/</span>
          <span className="text-white/25">{submissionTotal}</span>
          <span className="text-white/20 ml-1.5 text-[10px] tracking-wider uppercase">
            {allDone ? "done" : "submitted"}
          </span>
        </span>

        {/* Progress dots */}
        <div className="flex gap-1">
          {Array.from({ length: submissionTotal }).map((_, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{
                backgroundColor: i < submissionCount
                  ? allDone ? "rgba(134,239,172,0.6)" : "rgba(125,211,252,0.5)"
                  : "rgba(255,255,255,0.06)",
                scale: i === submissionCount - 1 && i < submissionTotal ? [1, 1.3, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
              className="w-1.5 h-1.5 rounded-full"
            />
          ))}
        </div>

        {/* Your status */}
        {hasSubmitted && !allDone && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-mono text-[9px] tracking-wider uppercase text-[#86efac]/50"
          >
            you
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}
