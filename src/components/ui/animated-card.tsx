"use client";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

function useMouse() {
  const [mouse, setMouse] = useState<{ elementX: number | null; elementY: number | null }>({
    elementX: null,
    elementY: null,
  });
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (parentRef.current) {
        const { left, top } = parentRef.current.getBoundingClientRect();
        setMouse({ elementX: event.clientX - left, elementY: event.clientY - top });
      }
    };
    const handleMouseLeave = () => setMouse({ elementX: null, elementY: null });

    const currentRef = parentRef.current;
    if (currentRef) {
      currentRef.addEventListener("mousemove", handleMouseMove);
      currentRef.addEventListener("mouseleave", handleMouseLeave);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("mousemove", handleMouseMove);
        currentRef.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return [mouse, parentRef] as const;
}

export function AnimatedCard({
  title,
  description,
  icon,
  circleSize = 400,
  className,
  children,
  glowColors = "linear-gradient(135deg, #7dd3fc, #c4b5fd, #fda4af, #86efac)",
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  circleSize?: number;
  children?: ReactNode;
  className?: string;
  glowColors?: string;
}) {
  const [mouse, parentRef] = useMouse();
  const isHovered = mouse.elementX !== null && mouse.elementY !== null;

  return (
    <div
      className="group relative transform-gpu overflow-hidden rounded-2xl bg-white/[0.03] p-[1px] transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
      ref={parentRef}
    >
      {/* Mouse-tracking gradient glow */}
      <div
        className={cn(
          "absolute -translate-x-1/2 -translate-y-1/2 transform-gpu rounded-full transition-all duration-500",
          isHovered ? "opacity-100 scale-100 group-hover:scale-[2.5]" : "opacity-0 scale-75"
        )}
        style={{
          maskImage: `radial-gradient(${circleSize / 2}px circle at center, white, transparent)`,
          width: `${circleSize}px`,
          height: `${circleSize}px`,
          left: `${mouse.elementX}px`,
          top: `${mouse.elementY}px`,
          background: glowColors,
        }}
      />

      {/* Inner card bg */}
      <div className="absolute inset-px rounded-[calc(1rem-1px)] bg-[#0c0c14]/95 transition-colors duration-500 group-hover:bg-[#0c0c14]/90" />

      {/* Children slot */}
      {children && (
        <div className={cn("relative overflow-hidden rounded-[calc(1rem-1px)] border border-white/[0.04] bg-white/[0.02]", className)}>
          {children}
        </div>
      )}

      {/* Card content */}
      <div className="relative px-6 pb-5 pt-6">
        {icon && (
          <div className="mb-4 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] transition-all duration-500 group-hover:bg-white/[0.06] group-hover:border-white/[0.1] group-hover:scale-110">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-white/90 font-[family-name:var(--font-outfit)] tracking-tight transition-colors duration-300 group-hover:text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm text-white/35 leading-relaxed transition-colors duration-300 group-hover:text-white/45">
          {description}
        </p>

        {/* Bottom accent line on hover */}
        <div className="absolute bottom-0 left-6 right-6 h-px overflow-hidden">
          <div
            className="h-full w-0 group-hover:w-full transition-all duration-700 ease-out"
            style={{ background: glowColors }}
          />
        </div>
      </div>
    </div>
  );
}
