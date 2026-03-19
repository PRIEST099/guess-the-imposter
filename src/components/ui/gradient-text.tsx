import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
}

export function GradientText({
  children,
  className = "",
  colors = ["#7dd3fc", "#c4b5fd", "#fda4af", "#86efac", "#7dd3fc"],
  animationSpeed = 6,
  showBorder = false,
}: GradientTextProps) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
    animationDuration: `${animationSpeed}s`,
  };

  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden",
        className
      )}
    >
      {showBorder && (
        <span
          className="absolute inset-0 bg-cover z-0 pointer-events-none animate-gradient"
          style={{ ...gradientStyle, backgroundSize: "300% 100%" }}
        >
          <span
            className="absolute inset-0 rounded-[1.25rem] z-[-1]"
            style={{
              background: "var(--color-surface-primary, #0c0c14)",
              width: "calc(100% - 2px)",
              height: "calc(100% - 2px)",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </span>
      )}
      <span
        className="inline-block relative z-2 text-transparent bg-cover animate-gradient"
        style={{
          ...gradientStyle,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          backgroundSize: "300% 100%",
        }}
      >
        {children}
      </span>
    </span>
  );
}
