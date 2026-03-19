"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoomCodeDisplayProps {
  code: string;
  className?: string;
}

export function RoomCodeDisplay({ code, className }: RoomCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "relative inline-flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl overflow-hidden min-h-[44px]",
        "glass hover:border-accent-sky/20 transition-all duration-500 group",
        className
      )}
    >
      {/* Subtle shimmer sweep */}
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
        className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent skew-x-12 pointer-events-none"
      />

      <span className="relative text-[10px] text-white/25 uppercase tracking-[0.2em] font-mono hidden sm:inline">
        Room
      </span>

      <span className="relative font-mono text-xl sm:text-3xl font-bold text-accent-sky tracking-[0.2em] sm:tracking-[0.35em] text-glow-sky select-all">
        {code}
      </span>

      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="relative"
          >
            <Check className="w-5 h-5 text-accent-mint" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="relative"
          >
            <Copy className="w-4 h-4 text-white/20 group-hover:text-accent-sky transition-colors duration-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
