"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useSpring, type MotionValue } from "framer-motion";

/* ═══════════════════════════════════════════════════════
   CAROUSEL SCROLL — 3D Carousel / Drum effect

   Sections live on the surface of a vertical drum.
   As you scroll, each section:

   1. ENTERS from below — slides up, slightly rotated,
      scaled down, with a subtle blur (depth-of-field)
   2. CENTERS — full size, sharp, facing the viewer,
      with a faint glow ring to draw the eye
   3. EXITS at top — slides up further, rotates away,
      scales down, blurs out

   Performance notes:
   - All transforms are GPU-composited (transform + opacity)
   - filter: blur() is only applied at edges (0px at center)
   - useSpring gives smooth 60fps interpolation
   - will-change hints used sparingly
   ═══════════════════════════════════════════════════════ */

/* ── Shared spring config — light, responsive ── */
const SPRING = { stiffness: 90, damping: 24, restDelta: 0.001 };

/* ── Helper: clamp a MotionValue through useTransform ── */
function useClampedSpring(value: MotionValue<number>) {
  return useSpring(value, SPRING);
}

/* ═══════════════════════════════════════════════════════ */

interface CarouselSectionProps {
  children: ReactNode;
  id?: string;
  /** Disable carousel for this section (e.g. hero) */
  disabled?: boolean;
  className?: string;
}

export function WheelSection({
  children,
  id,
  disabled = false,
  className = "",
}: CarouselSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  /*
   * scrollYProgress mapping:
   *   0.0 — section top hits viewport bottom  (just entering)
   *   ~0.5 — section is roughly centered
   *   1.0 — section bottom leaves viewport top (fully gone)
   */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const smooth = useClampedSpring(scrollYProgress);

  /* ── Transform curves ── */

  // Vertical slide: enters from +60px below, exits -60px above
  const translateY = useTransform(
    smooth,
    [0, 0.3, 0.5, 0.7, 1],
    [60, 10, 0, -10, -60]
  );

  // Rotation on X-axis: tilted when off-center, flat at center
  const rotateX = useTransform(
    smooth,
    [0, 0.25, 0.4, 0.6, 0.75, 1],
    [8, 3, 0, 0, -3, -8]
  );

  // Scale: 0.88 at edges → 1.0 at center
  const scale = useTransform(
    smooth,
    [0, 0.2, 0.38, 0.62, 0.8, 1],
    [0.88, 0.95, 1, 1, 0.95, 0.88]
  );

  // Opacity: fade edges, fully visible in center zone
  const opacity = useTransform(
    smooth,
    [0, 0.12, 0.28, 0.72, 0.88, 1],
    [0, 0.6, 1, 1, 0.6, 0]
  );

  // Z-translation for depth push
  const translateZ = useTransform(
    smooth,
    [0, 0.35, 0.5, 0.65, 1],
    [-40, -8, 0, -8, -40]
  );

  // Blur for depth-of-field (only at far edges, 0 at center)
  const blur = useTransform(
    smooth,
    [0, 0.15, 0.3, 0.7, 0.85, 1],
    [4, 1, 0, 0, 1, 4]
  );

  // CSS filter string from blur value
  const filter = useTransform(blur, (v) =>
    v > 0.1 ? `blur(${v}px)` : "none"
  );

  if (disabled) {
    return (
      <div ref={ref} id={id} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      id={id}
      className={`relative ${className}`}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        style={{
          y: translateY,
          rotateX,
          scale,
          opacity,
          translateZ,
          filter,
          transformOrigin: "center center",
          willChange: "transform, opacity, filter",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   WHEEL CONTAINER — The page-level wrapper.
   Keeps preserve-3d so child perspectives compose.
   ═══════════════════════════════════════════════════════ */
interface WheelContainerProps {
  children: ReactNode;
  className?: string;
}

export function WheelContainer({ children, className = "" }: WheelContainerProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}
