"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive";
  glow?: string | false;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ variant = "default", glow, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-2xl transition-all overflow-hidden",
          variant === "default" && "glass duration-400",
          variant === "elevated" && "glass-elevated duration-400",
          variant === "interactive" && "glass duration-300 hover:bg-white/[0.05] hover:border-white/[0.1] hover:scale-[1.01]",
          className
        )}
        style={{
          boxShadow: glow ? `0 0 30px ${glow}12, 0 0 60px ${glow}06` : undefined,
        }}
        {...props}
      >
        {/* Top reflection */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent pointer-events-none" />
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
