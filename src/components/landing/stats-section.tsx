"use client";

import { motion } from "framer-motion";
import { PlayerStats } from "@/components/profile/player-stats";

/* ─── Decorative radar/stats chart SVG ─── */
function StatsRadar() {
  const points = [
    { angle: 0, value: 0.7, label: "WIN" },
    { angle: 60, value: 0.85, label: "DED" },
    { angle: 120, value: 0.5, label: "IMP" },
    { angle: 180, value: 0.9, label: "VOT" },
    { angle: 240, value: 0.65, label: "STK" },
    { angle: 300, value: 0.75, label: "RND" },
  ];

  const cx = 100, cy = 100, r = 70;

  const getPoint = (angle: number, value: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + Math.cos(rad) * r * value,
      y: cy + Math.sin(rad) * r * value,
    };
  };

  const dataPoints = points.map((p) => getPoint(p.angle, p.value));
  const pathD = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div className="relative w-full max-w-[200px] aspect-square">
      <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
        {/* Grid rings */}
        {[0.33, 0.66, 1].map((s, i) => (
          <polygon
            key={i}
            points={points.map((p) => { const pt = getPoint(p.angle, s); return `${pt.x},${pt.y}`; }).join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="0.5"
          />
        ))}
        {/* Axis lines */}
        {points.map((p, i) => {
          const pt = getPoint(p.angle, 1);
          return <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />;
        })}
        {/* Data shape */}
        <motion.path
          d={pathD}
          fill="var(--accent-sky)"
          fillOpacity="0.06"
          stroke="var(--accent-sky)"
          strokeWidth="1.5"
          strokeOpacity="0.25"
          initial={{ pathLength: 0, fillOpacity: 0 }}
          whileInView={{ pathLength: 1, fillOpacity: 0.06 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Data points */}
        {dataPoints.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="var(--accent-sky)"
            opacity="0.35"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
          />
        ))}
        {/* Labels */}
        {points.map((p, i) => {
          const pt = getPoint(p.angle, 1.2);
          return (
            <text key={i} x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="middle"
              className="font-mono" fontSize="7" fill="rgba(255,255,255,0.12)" letterSpacing="1">
              {p.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export function StatsSection() {
  return (
    <section className="relative py-28 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Monospace section label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          className="mb-6"
        >
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-white/25">
            [ stats ] — your track record
          </span>
        </motion.div>

        {/* Large section heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] }}
          className="font-[family-name:var(--font-outfit)] text-3xl sm:text-4xl md:text-5xl font-bold text-white/90 tracking-tight mb-16 leading-[1.1]"
        >
          Numbers don&apos;t lie.
        </motion.h2>

        {/* Stats + radar chart side by side */}
        <div className="flex flex-col md:flex-row items-start gap-12 md:gap-16">
          {/* Stats grid — delegates to PlayerStats */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            className="max-w-md flex-1"
          >
            <PlayerStats />
          </motion.div>

          {/* Decorative radar chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="hidden md:flex items-center justify-center flex-1"
          >
            <StatsRadar />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
