"use client";
import { useRef, useCallback, useState, useEffect } from "react";

interface TiltStyle {
  transform: string;
  transition: string;
}

interface UseTiltOptions {
  intensity?: number; // degrees of rotation (default 8)
  perspective?: number; // CSS perspective in px (default 800)
  scale?: number; // hover scale (default 1.02)
  speed?: number; // transition speed in ms (default 400)
}

export function useTilt({
  intensity = 8,
  perspective = 800,
  scale = 1.02,
  speed = 400,
}: UseTiltOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<TiltStyle>({
    transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
    transition: `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`,
  });
  const [isTouch, setIsTouch] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
    setPrefersReduced(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isTouch || prefersReduced) return;
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -intensity;
      const rotateY = ((x - centerX) / centerX) * intensity;

      setStyle({
        transform: `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`,
        transition: "transform 100ms ease-out",
      });
    },
    [intensity, perspective, scale, isTouch, prefersReduced]
  );

  const onMouseLeave = useCallback(() => {
    setStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`,
    });
  }, [perspective, speed]);

  return { ref, style, onMouseMove, onMouseLeave };
}
