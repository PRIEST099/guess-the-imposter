"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface SectionDividerProps {
  variant?: "wave" | "diagonal" | "glow";
  flip?: boolean;
  className?: string;
}

export function SectionDivider({ variant = "wave", flip = false, className = "" }: SectionDividerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const morphProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  if (variant === "wave") {
    return (
      <div
        ref={ref}
        className={`relative w-full h-16 sm:h-24 overflow-hidden ${className}`}
        style={{ transform: flip ? "scaleY(-1)" : undefined }}
      >
        <motion.svg
          viewBox="0 0 1440 96"
          fill="none"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
          style={{ opacity: useTransform(scrollYProgress, [0, 0.5], [0.3, 0.8]) }}
        >
          <motion.path
            d="M0,48 C360,96 720,0 1080,48 C1260,72 1360,60 1440,48 L1440,96 L0,96 Z"
            fill="url(#wave-gradient)"
            fillOpacity="0.08"
          />
          <motion.path
            d="M0,64 C240,32 480,80 720,48 C960,16 1200,72 1440,56 L1440,96 L0,96 Z"
            fill="url(#wave-gradient)"
            fillOpacity="0.04"
          />
          <defs>
            <linearGradient id="wave-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--sky-400)" />
              <stop offset="50%" stopColor="var(--lavender-400)" />
              <stop offset="100%" stopColor="var(--rose-400)" />
            </linearGradient>
          </defs>
        </motion.svg>
      </div>
    );
  }

  if (variant === "diagonal") {
    return (
      <div
        ref={ref}
        className={`relative w-full h-12 sm:h-20 overflow-hidden ${className}`}
        style={{ transform: flip ? "scaleY(-1)" : undefined }}
      >
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
        >
          <polygon
            points="0,80 1440,0 1440,80"
            fill="var(--sky-400)"
            fillOpacity="0.04"
          />
          <polygon
            points="0,80 1440,20 1440,80"
            fill="var(--lavender-400)"
            fillOpacity="0.03"
          />
        </svg>
      </div>
    );
  }

  // Glow variant — a soft horizontal line with glow
  return (
    <div ref={ref} className={`relative w-full py-8 flex items-center justify-center ${className}`}>
      <motion.div
        className="w-full max-w-md h-[1px] mx-auto"
        style={{
          background: "linear-gradient(90deg, transparent, var(--sky-400), var(--lavender-400), transparent)",
          opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.6, 0.2]),
          boxShadow: "0 0 20px rgba(125, 211, 252, 0.1)",
        }}
      />
    </div>
  );
}
