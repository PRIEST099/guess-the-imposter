"use client";

import { cn } from "@/lib/utils";

interface GradientOrbProps {
  colors?: string[];
  size?: number;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  speed?: "slow" | "medium";
  className?: string;
}

const positionClasses = {
  "top-left": "-top-[20%] -left-[10%]",
  "top-right": "-top-[20%] -right-[10%]",
  "bottom-left": "-bottom-[20%] -left-[10%]",
  "bottom-right": "-bottom-[20%] -right-[10%]",
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
};

export function GradientOrb({
  colors = ["#7dd3fc", "#c4b5fd"],
  size = 400,
  position = "top-left",
  speed = "slow",
  className,
}: GradientOrbProps) {
  const gradientColors = colors.length >= 2
    ? `radial-gradient(circle, ${colors[0]}30 0%, ${colors[1]}15 50%, transparent 70%)`
    : `radial-gradient(circle, ${colors[0]}30 0%, transparent 70%)`;

  return (
    <div
      className={cn(
        "absolute pointer-events-none",
        positionClasses[position],
        speed === "slow" ? "animate-[orb-drift-slow_25s_ease-in-out_infinite]" : "animate-[orb-drift_18s_ease-in-out_infinite]",
        className
      )}
      style={{
        width: size,
        height: size,
        background: gradientColors,
        filter: "blur(80px)",
        borderRadius: "50%",
      }}
    />
  );
}
