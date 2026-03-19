"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/* ─── Fake chat bubbles for the discussion mockup ─── */
const chatMessages = [
  { name: "Alex", color: "#7dd3fc", msg: "I think it's Player 3...", align: "left" as const },
  { name: "You", color: "#fda4af", msg: "Wait, what was the prompt?", align: "right" as const },
  { name: "Sam", color: "#86efac", msg: "Everyone drew a cat, right?", align: "left" as const },
  { name: "Player 3", color: "#c4b5fd", msg: "Yeah obviously 😅", align: "right" as const },
];

/* ─── Mini canvas strokes (fake drawing) ─── */
function FakeCanvas() {
  return (
    <svg viewBox="0 0 200 140" className="w-full h-full" fill="none">
      {/* Background grid */}
      {Array.from({ length: 10 }).map((_, i) => (
        <line
          key={`h${i}`}
          x1="0" y1={i * 14} x2="200" y2={i * 14}
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="0.5"
        />
      ))}
      {Array.from({ length: 14 }).map((_, i) => (
        <line
          key={`v${i}`}
          x1={i * 14.3} y1="0" x2={i * 14.3} y2="140"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="0.5"
        />
      ))}
      {/* Cat-like doodle strokes */}
      <path
        d="M60 100 Q70 40, 100 50 Q130 60, 140 100"
        stroke="#7dd3fc"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="82" cy="70" r="3" fill="#7dd3fc" opacity="0.6" />
      <circle cx="118" cy="70" r="3" fill="#7dd3fc" opacity="0.6" />
      <path
        d="M95 80 Q100 85, 105 80"
        stroke="#fda4af"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Whiskers */}
      <line x1="70" y1="78" x2="90" y2="76" stroke="#86efac" strokeWidth="1.5" opacity="0.5" />
      <line x1="70" y1="82" x2="90" y2="82" stroke="#86efac" strokeWidth="1.5" opacity="0.5" />
      <line x1="110" y1="76" x2="130" y2="78" stroke="#c4b5fd" strokeWidth="1.5" opacity="0.5" />
      <line x1="110" y1="82" x2="130" y2="82" stroke="#c4b5fd" strokeWidth="1.5" opacity="0.5" />
      {/* Ears */}
      <path d="M65 55 L60 30 L80 50" stroke="#7dd3fc" strokeWidth="2" opacity="0.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M135 55 L140 30 L120 50" stroke="#fda4af" strokeWidth="2" opacity="0.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Voting bar chart mockup ─── */
function VoteChart() {
  const votes = [
    { name: "Alex", pct: 15, color: "#7dd3fc" },
    { name: "Sam", pct: 10, color: "#86efac" },
    { name: "P3", pct: 60, color: "#c4b5fd" },
    { name: "You", pct: 15, color: "#fda4af" },
  ];
  return (
    <div className="flex items-end gap-2 h-16 px-3">
      {votes.map((v) => (
        <div key={v.name} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm"
            style={{
              height: `${v.pct}%`,
              minHeight: 4,
              backgroundColor: v.color,
              opacity: 0.6,
            }}
          />
          <span className="text-[7px] text-white/30 font-mono">{v.name}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   GAME PREVIEW — Floating 3D-tilted mockup of the game UI
   Shows multiple "screens" in a layered composition
   ═══════════════════════════════════════════════════════ */
export function GamePreview() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const y2 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const y3 = useTransform(scrollYProgress, [0, 1], [20, -80]);
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [4, 0, -2]);

  return (
    <div ref={ref} className="relative w-full max-w-[600px] mx-auto pb-48 md:pb-56" style={{ perspective: "1200px" }}>
      <motion.div
        style={{ rotateX: rotate }}
        className="relative"
      >
        {/* ─── Main canvas card ─── */}
        <motion.div
          style={{ y: y1 }}
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-20 rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0e0e1a]/80 backdrop-blur-sm shadow-2xl shadow-black/40"
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.04]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/30" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/30" />
            </div>
            <span className="text-[9px] font-mono text-white/15 ml-3 tracking-wider">SKETCH-OFF — ROUND 2</span>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[9px] font-mono text-accent-sky/40">0:24</span>
              <div className="w-16 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="w-[60%] h-full bg-accent-sky/30 rounded-full" />
              </div>
            </div>
          </div>

          {/* Canvas area */}
          <div className="relative aspect-[16/11] bg-[#0a0a16]">
            <FakeCanvas />
            {/* Prompt overlay */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
              <span className="text-[10px] font-mono text-white/30 tracking-wider">Draw: &quot;Cat&quot;</span>
            </div>
            {/* Player indicator dots */}
            <div className="absolute bottom-3 left-3 flex gap-1.5">
              {["#7dd3fc", "#fda4af", "#86efac", "#c4b5fd"].map((c, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c, opacity: i === 0 ? 1 : 0.4 }} />
                  {i === 0 && <span className="text-[8px] font-mono text-white/25">drawing</span>}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ─── Discussion card (overlapping, offset right) ─── */}
        <motion.div
          style={{ y: y2 }}
          initial={{ opacity: 0, x: 40, y: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-0 md:-right-8 top-[50%] z-30 w-48 md:w-52 rounded-xl border border-white/[0.06] bg-[#0e0e1a]/90 backdrop-blur-sm shadow-2xl shadow-black/50"
        >
          <div className="px-3 py-2 border-b border-white/[0.04]">
            <span className="text-[9px] font-mono text-white/20 tracking-wider uppercase">Discussion</span>
          </div>
          <div className="p-3 space-y-2.5">
            {chatMessages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.align === "right" ? "items-end" : "items-start"}`}>
                <span className="text-[7px] font-mono mb-0.5" style={{ color: m.color, opacity: 0.5 }}>{m.name}</span>
                <div
                  className={`px-2.5 py-1.5 rounded-lg text-[9px] leading-tight max-w-[85%] ${
                    m.align === "right"
                      ? "bg-white/[0.04] text-white/35"
                      : "bg-white/[0.02] text-white/30"
                  }`}
                >
                  {m.msg}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── Vote card (overlapping, offset left bottom) ─── */}
        <motion.div
          style={{ y: y3 }}
          initial={{ opacity: 0, x: -30, y: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-0 md:-left-6 top-[65%] z-30 w-40 md:w-44 rounded-xl border border-white/[0.06] bg-[#0e0e1a]/90 backdrop-blur-sm shadow-2xl shadow-black/50"
        >
          <div className="px-3 py-2 border-b border-white/[0.04]">
            <span className="text-[9px] font-mono text-white/20 tracking-wider uppercase">Voting</span>
          </div>
          <div className="p-3">
            <VoteChart />
            <div className="mt-2 flex items-center justify-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-rose/50" />
              <span className="text-[8px] font-mono text-white/20">Player 3 eliminated</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Ambient glow behind the composition */}
      <div className="absolute inset-0 -z-10 scale-110 blur-3xl opacity-[0.06]"
        style={{
          background: "radial-gradient(ellipse at 40% 50%, var(--accent-sky) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, var(--accent-lavender) 0%, transparent 50%)"
        }}
      />
    </div>
  );
}
