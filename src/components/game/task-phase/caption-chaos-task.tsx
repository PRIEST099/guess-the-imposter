"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { Camera, CheckCircle2, Send } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { GlassButton } from "@/components/shared/glass-button";

interface CaptionChaosTaskProps {
  onSubmit: (caption: string) => void;
}

export function CaptionChaosTask({ onSubmit }: CaptionChaosTaskProps) {
  const [caption, setCaption] = useState("");
  const myPrompt = useGameStore((s) => s.myPrompt);
  const hasSubmitted = useGameStore((s) => s.hasSubmitted);

  const handleSubmit = () => {
    if (!caption.trim() || hasSubmitted) return;
    onSubmit(caption.trim());
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
          <div className="w-2 h-2 rounded-full bg-[#fda4af]" style={{ boxShadow: "0 0 6px #fda4af60" }} />
          <span className="font-mono text-[9px] tracking-wider uppercase text-white/20">Caption Chaos</span>
        </div>

        <div className="p-6 space-y-6">
          {/* Scene description */}
          <div className="text-center space-y-2">
            <p className="font-mono text-[9px] tracking-wider uppercase text-white/20">Imagine This Scene</p>
            <p className="text-lg font-semibold text-white/80 italic font-mono">&ldquo;{myPrompt}&rdquo;</p>
          </div>

          <p className="text-white/30 text-sm text-center">
            Write a funny caption for this image. The imposter sees a <em className="text-[#fda4af]/60">different</em> image!
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
                Caption submitted
              </p>
              <p className="text-white/20 text-xs font-mono mt-1">Waiting for other players...</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value.slice(0, 280))}
                placeholder="Write your caption..."
                className="w-full border border-white/[0.06] bg-white/[0.02] rounded-lg font-mono px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/[0.12] transition-colors min-h-[100px] resize-none"
                maxLength={280}
              />
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-mono text-white/15">{caption.length}/280</p>
                <button
                  onClick={handleSubmit}
                  disabled={!caption.trim()}
                  className="px-5 py-2 rounded-lg border border-[#fda4af]/20 bg-transparent text-[#fda4af] font-mono text-xs tracking-wider uppercase hover:bg-[#fda4af]/[0.06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
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
