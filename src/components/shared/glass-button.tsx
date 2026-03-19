"use client";

import { cn } from "@/lib/utils";
import { forwardRef, useState } from "react";

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "sky" | "rose" | "lavender" | "mint" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  shimmer?: boolean;
}

const variantStyles = {
  sky: "bg-accent-sky/12 text-accent-sky border-accent-sky/20 hover:bg-accent-sky/20 hover:border-accent-sky/35 hover:shadow-[0_0_20px_rgba(125,211,252,0.1)]",
  rose: "bg-accent-rose/12 text-accent-rose border-accent-rose/20 hover:bg-accent-rose/20 hover:border-accent-rose/35 hover:shadow-[0_0_20px_rgba(253,164,175,0.1)]",
  lavender: "bg-accent-lavender/12 text-accent-lavender border-accent-lavender/20 hover:bg-accent-lavender/20 hover:border-accent-lavender/35 hover:shadow-[0_0_20px_rgba(196,181,253,0.1)]",
  mint: "bg-accent-mint/12 text-accent-mint border-accent-mint/20 hover:bg-accent-mint/20 hover:border-accent-mint/35 hover:shadow-[0_0_20px_rgba(134,239,172,0.1)]",
  ghost: "bg-white/[0.03] text-white/60 border-white/[0.06] hover:bg-white/[0.06] hover:text-white/85 hover:border-white/[0.1]",
};

const sizeStyles = {
  sm: "h-9 px-4 text-sm rounded-xl",
  md: "h-11 px-6 text-base rounded-xl",
  lg: "h-13 px-8 text-lg rounded-2xl",
};

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ variant = "sky", size = "md", loading, shimmer = false, className, children, disabled, ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "group relative inline-flex items-center justify-center gap-2 border font-semibold font-[family-name:var(--font-outfit)]",
          "transition-all duration-300 active:scale-[0.97] backdrop-blur-sm overflow-hidden",
          "disabled:opacity-30 disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {/* Glass reflection */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/[0.04] to-transparent rounded-t-inherit pointer-events-none transition-opacity duration-300 opacity-50 group-hover:opacity-80" />

        {/* Shimmer sweep on hover */}
        {(shimmer || variant !== "ghost") && isHovered && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
              animation: "shimmer-sweep 0.7s ease-in-out",
              transform: "skewX(-15deg)",
            }}
          />
        )}

        {/* Bottom highlight line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent pointer-events-none" />

        {/* Content */}
        <span className="relative z-[1] flex items-center gap-2">
          {loading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : null}
          {children}
        </span>
      </button>
    );
  }
);

GlassButton.displayName = "GlassButton";
