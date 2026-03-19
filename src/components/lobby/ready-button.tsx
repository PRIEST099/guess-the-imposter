"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadyButtonProps {
  onToggle: (isReady: boolean) => void;
}

export function ReadyButton({ onToggle }: ReadyButtonProps) {
  const [isReady, setIsReady] = useState(false);

  const handleToggle = () => {
    const newState = !isReady;
    setIsReady(newState);
    onToggle(newState);
  };

  return (
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
      <Button
        onClick={handleToggle}
        size="lg"
        className={cn(
          "relative w-full font-mono text-sm uppercase tracking-wider transition-all duration-400 rounded-xl h-14 overflow-hidden",
          isReady
            ? "bg-accent-mint/[0.06] text-accent-mint border border-accent-mint/20 hover:bg-accent-mint/[0.12]"
            : "bg-white/[0.02] border border-white/[0.06] text-white/40 hover:bg-white/[0.04] hover:text-white/60"
        )}
      >
        <AnimatePresence mode="wait">
          {isReady ? (
            <motion.span
              key="ready"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center"
            >
              <Check className="w-4 h-4 mr-2" />
              Ready
            </motion.span>
          ) : (
            <motion.span
              key="not-ready"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center"
            >
              <Circle className="w-4 h-4 mr-2" />
              Ready Up
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  );
}
