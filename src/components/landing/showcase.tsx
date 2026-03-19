"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/* ═══════════════════════════════════════════════════════
   SHOWCASE — Full-width visual break between sections.
   Uses a staggered grid of game UI mockups with subtle
   parallax per card. No absolute overlap chaos.
   ═══════════════════════════════════════════════════════ */
export function Showcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const y2 = useTransform(scrollYProgress, [0, 1], [60, -20]);
  const y3 = useTransform(scrollYProgress, [0, 1], [20, -50]);
  return (
    <section ref={ref} className="relative py-20 md:py-32 overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-6">

        {/* ── Section label ── */}
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="block font-mono text-[11px] uppercase tracking-[0.4em] text-white/15 mb-10 text-center"
        >
          [ The Experience ]
        </motion.span>

        {/* ── Bento-style grid of mockup cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">

          {/* Card 1: Sketch canvas — spans 2 cols on lg */}
          <motion.div
            style={{ y: y1 }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-2 rounded-xl border border-white/[0.06] bg-[#0c0c14]/70 backdrop-blur-sm overflow-hidden"
          >
            <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-sky/40" />
              <span className="text-[9px] font-mono text-white/20 tracking-wider">CANVAS — LIVE</span>
              <span className="ml-auto text-[8px] font-mono text-accent-sky/30">0:24</span>
              <div className="w-14 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="w-[60%] h-full bg-accent-sky/30 rounded-full" />
              </div>
            </div>
            <div className="aspect-[2/1] md:aspect-[2.5/1] relative bg-[#08080f]">
              <svg viewBox="0 0 500 200" className="w-full h-full" fill="none" preserveAspectRatio="xMidYMid meet">
                {/* Grid dots */}
                {Array.from({ length: 200 }).map((_, i) => (
                  <circle key={i} cx={25 + (i % 20) * 25} cy={20 + Math.floor(i / 20) * 20} r="0.5" fill="rgba(255,255,255,0.03)" />
                ))}
                <motion.path d="M60 150 Q120 40, 200 90 Q280 130, 380 60"
                  stroke="#7dd3fc" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }} transition={{ duration: 2, delay: 0.3 }} />
                <motion.path d="M100 170 Q160 80, 250 120 Q320 155, 420 75"
                  stroke="#fda4af" strokeWidth="2" strokeLinecap="round" opacity="0.4"
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }} transition={{ duration: 2, delay: 0.6 }} />
                <motion.path d="M80 70 Q140 120, 220 80 Q300 45, 400 100"
                  stroke="#86efac" strokeWidth="2" strokeLinecap="round" opacity="0.35"
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }} transition={{ duration: 2, delay: 0.9 }} />
                <motion.circle cx="300" cy="90" r="30"
                  stroke="#c4b5fd" strokeWidth="1.5" opacity="0.25"
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }} transition={{ duration: 1.5, delay: 1.2 }} />
              </svg>
              {/* Prompt chip */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
                <span className="text-[8px] font-mono text-white/25 tracking-wide">Draw: &quot;Cat&quot;</span>
              </div>
              {/* Player dots */}
              <div className="absolute bottom-3 left-3 flex gap-1.5">
                {["#7dd3fc", "#fda4af", "#86efac", "#c4b5fd"].map((c, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c, opacity: i === 0 ? 0.8 : 0.3 }} />
                    {i === 0 && <span className="text-[7px] font-mono text-white/20">drawing</span>}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Card 2: Word Play — single col */}
          <motion.div
            style={{ y: y2 }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl border border-white/[0.06] bg-[#0c0c14]/70 backdrop-blur-sm overflow-hidden"
          >
            <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-lavender/40" />
              <span className="text-[9px] font-mono text-white/20 tracking-wider">WORD PLAY</span>
            </div>
            <div className="p-4 space-y-2.5">
              {[
                { word: "Fluffy", color: "#7dd3fc", sus: false },
                { word: "Purring", color: "#86efac", sus: false },
                { word: "Whiskers", color: "#c4b5fd", sus: false },
                { word: "Barking?", color: "#fda4af", sus: true },
              ].map((w, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.12, duration: 0.4 }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${
                    w.sus ? "bg-accent-rose/[0.06] border border-accent-rose/10" : "bg-white/[0.02]"
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: w.color, opacity: 0.5 }} />
                  <span className={`text-xs font-mono flex-1 ${w.sus ? "text-accent-rose/40" : "text-white/25"}`}>{w.word}</span>
                  {w.sus && <span className="text-[8px] font-mono text-accent-rose/30 shrink-0">SUS</span>}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Card 3: Discussion — single col */}
          <motion.div
            style={{ y: y3 }}
            initial={{ opacity: 0, y: 45 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl border border-white/[0.06] bg-[#0c0c14]/70 backdrop-blur-sm overflow-hidden"
          >
            <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-rose/40" />
              <span className="text-[9px] font-mono text-white/20 tracking-wider">DISCUSSION</span>
            </div>
            <div className="p-3 space-y-2">
              {[
                { name: "Alex", color: "#7dd3fc", msg: "I think it's Player 3...", align: "left" as const },
                { name: "You", color: "#fda4af", msg: "Wait, what was the prompt?", align: "right" as const },
                { name: "Sam", color: "#86efac", msg: "Everyone drew a cat, right?", align: "left" as const },
                { name: "Player 3", color: "#c4b5fd", msg: "Yeah obviously 😅", align: "right" as const },
              ].map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.12, duration: 0.35 }}
                  className={`flex flex-col ${m.align === "right" ? "items-end" : "items-start"}`}
                >
                  <span className="text-[7px] font-mono mb-0.5" style={{ color: m.color, opacity: 0.5 }}>{m.name}</span>
                  <div className={`px-2.5 py-1.5 rounded-lg text-[10px] leading-tight max-w-[85%] ${
                    m.align === "right" ? "bg-white/[0.04] text-white/35" : "bg-white/[0.02] text-white/30"
                  }`}>
                    {m.msg}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Card 4: Leaderboard — single col */}
          <motion.div
            style={{ y: y1 }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl border border-white/[0.06] bg-[#0c0c14]/70 backdrop-blur-sm overflow-hidden"
          >
            <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-mint/40" />
              <span className="text-[9px] font-mono text-white/20 tracking-wider">LEADERBOARD</span>
            </div>
            <div className="p-3 space-y-2.5">
              {[
                { name: "Alex", pts: 420, color: "#7dd3fc", rank: 1 },
                { name: "Sam", pts: 380, color: "#86efac", rank: 2 },
                { name: "You", pts: 350, color: "#fda4af", rank: 3 },
                { name: "Player 3", pts: 290, color: "#c4b5fd", rank: 4 },
              ].map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.35 }}
                  className="flex items-center gap-2.5"
                >
                  <span className="text-[9px] font-mono text-white/10 w-4">{p.rank}.</span>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${p.color}12` }}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color, opacity: 0.35 }} />
                  </div>
                  <span className="text-[10px] font-mono text-white/25 flex-1">{p.name}</span>
                  <span className="text-[10px] font-mono font-medium" style={{ color: p.color, opacity: 0.4 }}>{p.pts}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Card 5: Voting results — spans 2 cols on lg */}
          <motion.div
            style={{ y: y2 }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-2 lg:col-span-2 rounded-xl border border-white/[0.06] bg-[#0c0c14]/70 backdrop-blur-sm overflow-hidden"
          >
            <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-lavender/40" />
              <span className="text-[9px] font-mono text-white/20 tracking-wider">VOTING RESULTS</span>
            </div>
            <div className="p-4 flex flex-col sm:flex-row items-center gap-6">
              {/* Vote bars */}
              <div className="flex items-end gap-3 h-20 flex-1">
                {[
                  { name: "Alex", pct: 20, color: "#7dd3fc" },
                  { name: "Sam", pct: 15, color: "#86efac" },
                  { name: "P3", pct: 50, color: "#c4b5fd" },
                  { name: "You", pct: 15, color: "#fda4af" },
                ].map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <motion.div
                      className="w-full rounded-t-sm max-w-8"
                      initial={{ height: 0 }}
                      whileInView={{ height: `${v.pct * 1.4}px` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 + i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      style={{ backgroundColor: v.color, opacity: 0.5 }}
                    />
                    <span className="text-[8px] font-mono text-white/20">{v.name}</span>
                  </div>
                ))}
              </div>
              {/* Result */}
              <div className="px-5 py-3 rounded-lg bg-accent-lavender/[0.05] border border-accent-lavender/10 text-center">
                <p className="text-[10px] font-mono text-accent-lavender/50 tracking-wider uppercase mb-1">Player 3 Eliminated</p>
                <p className="text-[9px] font-mono text-white/20">They were the IMPOSTER! ✓</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Caption ── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center font-mono text-[11px] tracking-[0.3em] uppercase text-white/10 mt-10"
        >
          Real-time multiplayer deduction — right in your browser
        </motion.p>
      </div>

      {/* Subtle edge fades for depth */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[var(--black-base,#0c0c14)]/50 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[var(--black-base,#0c0c14)]/50 to-transparent pointer-events-none" />
    </section>
  );
}
