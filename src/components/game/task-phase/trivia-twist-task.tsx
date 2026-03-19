"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { Brain, CheckCircle2, Check } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { GlassButton } from "@/components/shared/glass-button";

interface TriviaTwistTaskProps {
  onSubmit: (answer: string) => void;
}

export function TriviaTwistTask({ onSubmit }: TriviaTwistTaskProps) {
  const [answer, setAnswer] = useState("");
  const myPrompt = useGameStore((s) => s.myPrompt);
  const hasSubmitted = useGameStore((s) => s.hasSubmitted);

  const handleSubmit = () => {
    if (!answer.trim() || hasSubmitted) return;
    onSubmit(answer.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto space-y-6"
    >
      {/* Main card */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0c0c14]/70 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#7dd3fc]" style={{ boxShadow: "0 0 6px #7dd3fc60" }} />
          <span className="font-mono text-[9px] tracking-wider uppercase text-white/20">Trivia Twist</span>
        </div>

        <div className="p-6 space-y-6">
          {/* Question display */}
          <div className="text-center space-y-2">
            <p className="font-mono text-[9px] tracking-wider uppercase text-white/20">Question</p>
            <p className="text-lg font-semibold text-white/90 font-[family-name:var(--font-outfit)]">{myPrompt}</p>
          </div>

          <p className="text-white/30 text-sm text-center">
            Type your answer. The imposter has a <em className="text-[#fda4af]/60">different</em> question!
          </p>

          {hasSubmitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-center py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              >
                <CheckCircle2 className="w-10 h-10 text-[#86efac] mx-auto mb-3" />
              </motion.div>
              <p className="font-mono text-xs tracking-wider uppercase text-[#86efac]">
                Answer submitted
              </p>
              <p className="text-white/20 text-xs font-mono mt-1">Waiting for other players...</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value.slice(0, 200))}
                placeholder="Type your answer..."
                className="w-full border border-white/[0.06] bg-white/[0.02] rounded-lg font-mono px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/[0.12] transition-colors"
                maxLength={200}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={!answer.trim()}
                  className="px-5 py-2 rounded-lg border border-[#7dd3fc]/20 bg-transparent text-[#7dd3fc] font-mono text-xs tracking-wider uppercase hover:bg-[#7dd3fc]/[0.06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5" />
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
