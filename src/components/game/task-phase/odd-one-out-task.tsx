"use client";
import { useState } from "react";
import { motion, Reorder } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { ListOrdered, CheckCircle2, GripVertical, Send } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { GlassButton } from "@/components/shared/glass-button";
import { cn } from "@/lib/utils";

interface OddOneOutTaskProps {
  onSubmit: (ranking: string[]) => void;
}

export function OddOneOutTask({ onSubmit }: OddOneOutTaskProps) {
  const myPrompt = useGameStore((s) => s.myPrompt);
  const hasSubmitted = useGameStore((s) => s.hasSubmitted);

  // Parse the prompt: "Rank by X: Item1, Item2, Item3..."
  const [criterion, itemsStr] = (myPrompt || "").split(":").map(s => s.trim());
  const initialItems = itemsStr ? itemsStr.split(",").map(s => s.trim()) : [];
  const [items, setItems] = useState(initialItems);

  const handleSubmit = () => {
    if (hasSubmitted || items.length === 0) return;
    onSubmit(items);
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
          <div className="w-2 h-2 rounded-full bg-[#c4b5fd]" style={{ boxShadow: "0 0 6px #c4b5fd60" }} />
          <span className="font-mono text-[9px] tracking-wider uppercase text-white/20">Odd One Out</span>
        </div>

        <div className="p-6 space-y-6">
          {/* Criterion display */}
          <div className="text-center space-y-2">
            <p className="font-mono text-[9px] tracking-wider uppercase text-white/20">Ranking Criterion</p>
            <p className="text-lg font-semibold text-white/90 font-[family-name:var(--font-outfit)]">{criterion}</p>
          </div>

          <p className="text-white/30 text-sm text-center">
            Drag to reorder the items. The imposter has a <em className="text-[#fda4af]/60">different</em> criterion!
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
                Ranking submitted
              </p>
              <p className="text-white/20 text-xs font-mono mt-1">Waiting for other players...</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
                {items.map((item, index) => (
                  <Reorder.Item
                    key={item}
                    value={item}
                    className="rounded-lg p-3 cursor-grab active:cursor-grabbing flex items-center gap-3 select-none transition-all duration-300 border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                    whileDrag={{
                      scale: 1.02,
                      boxShadow: "0 0 20px rgba(196,181,253,0.1)",
                      borderColor: "rgba(196,181,253,0.15)",
                    }}
                  >
                    <span className="font-mono text-[10px] text-[#c4b5fd]/60 w-5 shrink-0 font-bold">{index + 1}</span>
                    <GripVertical className="w-3.5 h-3.5 text-white/15 shrink-0" />
                    <span className="flex-1 text-left text-sm text-white/70 font-[family-name:var(--font-outfit)]">{item}</span>
                  </Reorder.Item>
                ))}
              </Reorder.Group>

              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 rounded-lg border border-[#c4b5fd]/20 bg-transparent text-[#c4b5fd] font-mono text-xs tracking-wider uppercase hover:bg-[#c4b5fd]/[0.06] transition-colors flex items-center gap-2"
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
