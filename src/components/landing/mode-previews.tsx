"use client";

import { motion } from "framer-motion";
import { GameMode } from "@/types/game";

/* ═══════════════════════════════════════════════════════
   MODE PREVIEWS — Small inline SVG art for each game mode.
   Appears on hover/expand in the game modes list.
   ═══════════════════════════════════════════════════════ */

function SketchPreview({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full" fill="none">
      <rect width="120" height="80" rx="6" fill="rgba(255,255,255,0.015)" />
      <motion.path d="M20 60 Q40 20, 60 40 Q80 55, 100 25" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.5"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.5 }} />
      <motion.circle cx="75" cy="45" r="12" stroke={accent} strokeWidth="1.5" opacity="0.3"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 }} />
      <circle cx="30" cy="65" r="3" fill={accent} opacity="0.15" />
      <circle cx="90" cy="15" r="2" fill={accent} opacity="0.1" />
    </svg>
  );
}

function WordPreview({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full" fill="none">
      <rect width="120" height="80" rx="6" fill="rgba(255,255,255,0.015)" />
      {[
        { x: 15, y: 20, w: 40 },
        { x: 15, y: 35, w: 55 },
        { x: 15, y: 50, w: 35 },
        { x: 15, y: 65, w: 50 },
      ].map((l, i) => (
        <motion.rect key={i} x={l.x} y={l.y} width={l.w} height={6} rx="3"
          fill={i === 2 ? accent : "rgba(255,255,255,0.04)"} opacity={i === 2 ? 0.25 : 1}
          initial={{ width: 0 }} whileInView={{ width: l.w }} viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.1 }} />
      ))}
      <rect x="75" y="20" width="30" height="30" rx="6" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      <text x="90" y="39" textAnchor="middle" fontSize="10" fill={accent} opacity="0.3">Aa</text>
    </svg>
  );
}

function TriviaPreview({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full" fill="none">
      <rect width="120" height="80" rx="6" fill="rgba(255,255,255,0.015)" />
      <text x="60" y="20" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.1)" letterSpacing="1">QUESTION</text>
      {[
        { y: 30, label: "A", correct: false },
        { y: 45, label: "B", correct: true },
        { y: 60, label: "C", correct: false },
      ].map((q, i) => (
        <g key={i}>
          <rect x="15" y={q.y} width="90" height="11" rx="3"
            fill={q.correct ? `${accent}12` : "rgba(255,255,255,0.02)"}
            stroke={q.correct ? `${accent}30` : "rgba(255,255,255,0.03)"}
            strokeWidth="0.5" />
          <text x="25" y={q.y + 8} fontSize="6" fill={q.correct ? accent : "rgba(255,255,255,0.15)"} opacity={q.correct ? 0.5 : 1}>
            {q.label}
          </text>
          <rect x="35" y={q.y + 3} width={30 + Math.random() * 20} height="4" rx="2" fill="rgba(255,255,255,0.03)" />
        </g>
      ))}
    </svg>
  );
}

function CaptionPreview({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full" fill="none">
      <rect width="120" height="80" rx="6" fill="rgba(255,255,255,0.015)" />
      {/* Image placeholder */}
      <rect x="20" y="10" width="80" height="40" rx="4" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      <text x="60" y="34" textAnchor="middle" fontSize="14" opacity="0.1">🖼</text>
      {/* Caption lines */}
      <rect x="25" y="58" width="70" height="5" rx="2.5" fill="rgba(255,255,255,0.03)" />
      <rect x="35" y="67" width="50" height="5" rx="2.5" fill={accent} opacity="0.12" />
    </svg>
  );
}

function OddOnePreview({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full" fill="none">
      <rect width="120" height="80" rx="6" fill="rgba(255,255,255,0.015)" />
      {[
        { cx: 30, cy: 30, same: true },
        { cx: 60, cy: 30, same: true },
        { cx: 90, cy: 30, same: true },
        { cx: 30, cy: 55, same: true },
        { cx: 60, cy: 55, same: false },
        { cx: 90, cy: 55, same: true },
      ].map((p, i) => (
        <g key={i}>
          <circle cx={p.cx} cy={p.cy} r="10"
            fill={p.same ? "rgba(255,255,255,0.02)" : `${accent}10`}
            stroke={p.same ? "rgba(255,255,255,0.04)" : `${accent}30`}
            strokeWidth={p.same ? 0.5 : 1} />
          {p.same ? (
            <circle cx={p.cx} cy={p.cy} r="3" fill="rgba(255,255,255,0.06)" />
          ) : (
            <text x={p.cx} y={p.cy + 3} textAnchor="middle" fontSize="8" fill={accent} opacity="0.4">?</text>
          )}
        </g>
      ))}
    </svg>
  );
}

function RandomPreview({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full" fill="none">
      <rect width="120" height="80" rx="6" fill="rgba(255,255,255,0.015)" />
      {/* Dice/shuffle visual */}
      <motion.g
        initial={{ rotate: 0 }}
        whileInView={{ rotate: 360 }}
        viewport={{ once: true }}
        transition={{ duration: 2, ease: "easeOut" }}
        style={{ transformOrigin: "60px 40px" }}
      >
        {[0, 72, 144, 216, 288].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const cx = 60 + Math.cos(rad) * 22;
          const cy = 40 + Math.sin(rad) * 22;
          const colors = ["#7dd3fc", "#fda4af", "#86efac", "#c4b5fd", "#fde68a"];
          return (
            <circle key={i} cx={cx} cy={cy} r="6" fill={colors[i]} opacity="0.15"
              stroke={colors[i]} strokeWidth="0.5" strokeOpacity="0.2" />
          );
        })}
      </motion.g>
      <text x="60" y="44" textAnchor="middle" fontSize="10" fill={accent} opacity="0.2">?</text>
    </svg>
  );
}

const modePreviews: Record<GameMode, (props: { accent: string }) => React.ReactNode> = {
  [GameMode.SKETCH_OFF]: SketchPreview,
  [GameMode.WORD_PLAY]: WordPreview,
  [GameMode.TRIVIA_TWIST]: TriviaPreview,
  [GameMode.CAPTION_CHAOS]: CaptionPreview,
  [GameMode.ODD_ONE_OUT]: OddOnePreview,
  [GameMode.RANDOM]: RandomPreview,
};

export function ModePreview({ mode, accent }: { mode: GameMode; accent: string }) {
  const Preview = modePreviews[mode];
  if (!Preview) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-28 md:w-36 shrink-0 rounded-lg overflow-hidden border border-white/[0.04]"
    >
      <Preview accent={accent} />
    </motion.div>
  );
}
