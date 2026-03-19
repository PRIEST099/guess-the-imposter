"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  colorIndex: number;
}

interface AnimatedBackgroundProps {
  variant?: "default" | "hero" | "game" | "results";
  className?: string;
  /** Enable parallax scroll effect (requires being inside a scrollable container) */
  parallax?: boolean;
}

const COLORS = [
  "rgba(125, 211, 252, 1)",  // sky
  "rgba(196, 181, 253, 1)",  // lavender
  "rgba(253, 164, 175, 1)",  // rose
  "rgba(134, 239, 172, 1)",  // mint
];

const BLOB_CONFIGS = {
  default: [
    { color: "rgba(125, 211, 252, 0.06)", size: 500, x: "-5%", y: "-10%", duration: "25s" },
    { color: "rgba(196, 181, 253, 0.05)", size: 600, x: "60%", y: "10%", duration: "30s" },
    { color: "rgba(253, 164, 175, 0.04)", size: 450, x: "10%", y: "60%", duration: "22s" },
    { color: "rgba(134, 239, 172, 0.03)", size: 350, x: "70%", y: "70%", duration: "28s" },
  ],
  hero: [
    { color: "rgba(125, 211, 252, 0.08)", size: 700, x: "-10%", y: "-15%", duration: "20s" },
    { color: "rgba(196, 181, 253, 0.07)", size: 800, x: "50%", y: "5%", duration: "25s" },
    { color: "rgba(253, 164, 175, 0.06)", size: 600, x: "5%", y: "55%", duration: "18s" },
    { color: "rgba(134, 239, 172, 0.05)", size: 500, x: "65%", y: "65%", duration: "23s" },
  ],
  game: [
    { color: "rgba(125, 211, 252, 0.08)", size: 400, x: "-5%", y: "-10%", duration: "30s" },
    { color: "rgba(196, 181, 253, 0.06)", size: 450, x: "60%", y: "10%", duration: "35s" },
    { color: "rgba(253, 164, 175, 0.05)", size: 350, x: "10%", y: "60%", duration: "28s" },
    { color: "rgba(134, 239, 172, 0.04)", size: 300, x: "70%", y: "70%", duration: "32s" },
  ],
  results: [
    { color: "rgba(253, 230, 138, 0.18)", size: 600, x: "-5%", y: "-10%", duration: "22s" },
    { color: "rgba(196, 181, 253, 0.15)", size: 550, x: "55%", y: "5%", duration: "28s" },
    { color: "rgba(125, 211, 252, 0.12)", size: 500, x: "10%", y: "55%", duration: "25s" },
    { color: "rgba(134, 239, 172, 0.10)", size: 400, x: "65%", y: "65%", duration: "30s" },
  ],
};

const PARTICLE_COUNTS = { default: 50, hero: 80, game: 30, results: 60 };

// Parallax speed multipliers per layer (lower = slower = farther away)
const PARALLAX_SPEEDS = {
  blobs: 0.3,      // Deepest layer — moves slowest
  particles: 0.5,  // Mid layer
  grid: 0.1,       // Nearly static
};

export function AnimatedBackground({ variant = "default", className, parallax = false }: AnimatedBackgroundProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const blobs = BLOB_CONFIGS[variant];
  const particleCount = PARTICLE_COUNTS[variant];

  // Parallax scroll tracking
  const { scrollY } = useScroll();
  // Blobs: very slow, nearly static (traditional parallax)
  const blobY = useTransform(scrollY, [0, 5000], [0, -5000 * 0.15]);
  // Particles: REVERSE direction — move opposite to scroll
  const particleY = useTransform(scrollY, [0, 5000], [0, 5000 * 0.3]);
  // Grid: nearly static
  const gridY = useTransform(scrollY, [0, 5000], [0, -5000 * 0.05]);

  useEffect(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1.5,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
        colorIndex: i % 4,
      });
    }
    setParticles(newParticles);
  }, [particleCount]);

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <style>{`
        @keyframes aurora-drift {
          0%, 100% { transform: translate(0%, 0%) scale(1); opacity: var(--blob-opacity); }
          25% { transform: translate(5%, -3%) scale(1.05); opacity: calc(var(--blob-opacity) * 1.2); }
          50% { transform: translate(-3%, 5%) scale(0.95); opacity: var(--blob-opacity); }
          75% { transform: translate(-5%, -2%) scale(1.03); opacity: calc(var(--blob-opacity) * 0.9); }
        }
        @keyframes particle-float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(var(--float-x), var(--float-y)); }
        }
        @keyframes particle-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .aurora-blob { animation: aurora-drift var(--aurora-duration) ease-in-out infinite; }
        .bg-particle {
          animation: particle-float var(--p-duration) ease-in-out infinite,
                     particle-pulse calc(var(--p-duration) * 0.5) ease-in-out infinite;
          animation-delay: var(--p-delay);
          will-change: transform, opacity;
        }
      `}</style>

      {/* Aurora Gradient Blobs — deepest parallax layer */}
      <motion.div
        className="absolute inset-0"
        style={parallax ? { y: blobY, willChange: "transform" } : undefined}
      >
        {blobs.map((blob, i) => (
          <div
            key={`blob-${i}`}
            className="aurora-blob absolute rounded-full"
            style={{
              width: blob.size,
              height: blob.size,
              left: blob.x,
              top: blob.y,
              background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
              filter: "blur(80px)",
              "--aurora-duration": blob.duration,
              "--blob-opacity": "1",
            } as React.CSSProperties}
          />
        ))}
      </motion.div>

      {/* Floating Particles — mid parallax layer */}
      <motion.div
        className="absolute inset-0"
        style={parallax ? { y: particleY, willChange: "transform" } : undefined}
      >
        {particles.map((particle) => (
          <div
            key={`p-${particle.id}`}
            className="bg-particle absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              background: `radial-gradient(circle, ${COLORS[particle.colorIndex]}, transparent)`,
              "--p-duration": `${particle.duration}s`,
              "--p-delay": `${particle.delay}s`,
              "--float-x": `${(Math.random() - 0.5) * 80}px`,
              "--float-y": `${(Math.random() - 0.5) * 80}px`,
            } as React.CSSProperties}
          />
        ))}
      </motion.div>

      {/* Subtle Grid Overlay — near-static */}
      <motion.div
        className="absolute inset-0 opacity-[0.03]"
        style={parallax ? { y: gridY, willChange: "transform" } : undefined}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(125, 211, 252, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(125, 211, 252, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </motion.div>
    </div>
  );
}
