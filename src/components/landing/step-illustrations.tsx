"use client";

import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════
   STEP ILLUSTRATIONS — Inline SVG art for How-to-Play steps
   Each illustration is a small, atmospheric scene that
   communicates the step visually without real screenshots.
   ═══════════════════════════════════════════════════════ */

/* ─── Step 01: Gather — Players joining a lobby ─── */
export function GatherIllustration({ accent }: { accent: string }) {
  return (
    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#0a0a16]/60 border border-white/[0.04]">
      <svg viewBox="0 0 320 240" className="w-full h-full" fill="none">
        {/* Room code display */}
        <rect x="95" y="30" width="130" height="36" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <text x="160" y="53" textAnchor="middle" className="font-mono" fontSize="14" fill="rgba(255,255,255,0.25)" letterSpacing="6">
          XK7R2P
        </text>
        <text x="160" y="22" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.12)" letterSpacing="2">
          ROOM CODE
        </text>

        {/* Player avatars joining */}
        {[
          { cx: 90, cy: 120, color: "#7dd3fc", delay: 0 },
          { cx: 150, cy: 110, color: "#fda4af", delay: 0.2 },
          { cx: 210, cy: 120, color: "#86efac", delay: 0.4 },
          { cx: 120, cy: 170, color: "#c4b5fd", delay: 0.6 },
          { cx: 180, cy: 165, color: "#fde68a", delay: 0.8 },
        ].map((p, i) => (
          <motion.g key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: p.delay + 0.3, duration: 0.5 }}
          >
            <circle cx={p.cx} cy={p.cy} r="18" fill={p.color} opacity="0.08" />
            <circle cx={p.cx} cy={p.cy} r="12" fill={p.color} opacity="0.15" />
            <circle cx={p.cx} cy={p.cy - 4} r="5" fill={p.color} opacity="0.25" />
            <path d={`M${p.cx - 8} ${p.cy + 8} Q${p.cx} ${p.cy + 2} ${p.cx + 8} ${p.cy + 8}`}
              fill={p.color} opacity="0.2" />
          </motion.g>
        ))}

        {/* Connection lines between players */}
        <motion.path
          d="M90 120 L150 110 L210 120 M120 170 L150 110 L180 165 M90 120 L120 170 M210 120 L180 165"
          stroke={accent}
          strokeWidth="0.5"
          opacity="0.08"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, delay: 1 }}
        />

        {/* "Waiting for players..." text */}
        <text x="160" y="220" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.1)" letterSpacing="1">
          5 / 8 players joined
        </text>
      </svg>
    </div>
  );
}

/* ─── Step 02: Assign — Role reveal moment ─── */
export function AssignIllustration({ accent }: { accent: string }) {
  return (
    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#0a0a16]/60 border border-white/[0.04]">
      <svg viewBox="0 0 320 240" className="w-full h-full" fill="none">
        {/* Two cards — one face up, one mystery */}
        {/* Regular player card */}
        <motion.g
          initial={{ opacity: 0, rotateY: 90 }}
          whileInView={{ opacity: 1, rotateY: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <rect x="40" y="50" width="100" height="140" rx="12" fill="rgba(255,255,255,0.03)" stroke="rgba(125,211,252,0.15)" strokeWidth="1" />
          <text x="90" y="90" textAnchor="middle" fontSize="28">👤</text>
          <text x="90" y="120" textAnchor="middle" fontSize="9" fill="#7dd3fc" opacity="0.5" letterSpacing="2">
            REGULAR
          </text>
          <text x="90" y="140" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.15)">
            Draw: &quot;Cat&quot;
          </text>
          <rect x="60" y="155" width="60" height="16" rx="4" fill="rgba(125,211,252,0.06)" />
          <text x="90" y="166" textAnchor="middle" fontSize="7" fill="rgba(125,211,252,0.3)">
            Blend in
          </text>
        </motion.g>

        {/* Imposter card */}
        <motion.g
          initial={{ opacity: 0, rotateY: -90 }}
          whileInView={{ opacity: 1, rotateY: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.7 }}
        >
          <rect x="180" y="50" width="100" height="140" rx="12" fill="rgba(253,164,175,0.04)" stroke="rgba(253,164,175,0.2)" strokeWidth="1" />
          <text x="230" y="90" textAnchor="middle" fontSize="28">🕵️</text>
          <text x="230" y="120" textAnchor="middle" fontSize="9" fill="#fda4af" opacity="0.6" letterSpacing="2">
            IMPOSTER
          </text>
          <text x="230" y="140" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.15)">
            Draw: &quot;???&quot;
          </text>
          <rect x="200" y="155" width="60" height="16" rx="4" fill="rgba(253,164,175,0.08)" />
          <text x="230" y="166" textAnchor="middle" fontSize="7" fill="rgba(253,164,175,0.35)">
            Deceive
          </text>
        </motion.g>

        {/* "VS" or divider */}
        <motion.line
          x1="160" y1="70" x2="160" y2="180"
          stroke={accent}
          strokeWidth="0.5"
          opacity="0.1"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
        />

        {/* Question mark particles */}
        {[
          { x: 200, y: 40, size: 10 },
          { x: 260, y: 55, size: 8 },
          { x: 270, y: 195, size: 9 },
        ].map((p, i) => (
          <motion.text
            key={i}
            x={p.x} y={p.y}
            fontSize={p.size}
            fill={accent}
            opacity="0.08"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.08 }}
            viewport={{ once: true }}
            transition={{ delay: 1 + i * 0.2 }}
          >
            ?
          </motion.text>
        ))}

        <text x="160" y="225" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.08)" letterSpacing="2">
          ROLES ASSIGNED SECRETLY
        </text>
      </svg>
    </div>
  );
}

/* ─── Step 03: Deceive — Discussion with speech bubbles ─── */
export function DeceiveIllustration({ accent }: { accent: string }) {
  return (
    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#0a0a16]/60 border border-white/[0.04]">
      <svg viewBox="0 0 320 240" className="w-full h-full" fill="none">
        {/* Player circles in a discussion arrangement */}
        {[
          { cx: 80, cy: 160, color: "#7dd3fc" },
          { cx: 160, cy: 180, color: "#fda4af" },
          { cx: 240, cy: 160, color: "#86efac" },
          { cx: 120, cy: 200, color: "#c4b5fd" },
          { cx: 200, cy: 200, color: "#fde68a" },
        ].map((p, i) => (
          <g key={i}>
            <circle cx={p.cx} cy={p.cy} r="14" fill={p.color} opacity="0.12" />
            <circle cx={p.cx} cy={p.cy - 3} r="5" fill={p.color} opacity="0.2" />
            <path d={`M${p.cx - 6} ${p.cy + 5} Q${p.cx} ${p.cy + 1} ${p.cx + 6} ${p.cy + 5}`}
              fill={p.color} opacity="0.15" />
          </g>
        ))}

        {/* Speech bubbles floating above */}
        <motion.g
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <rect x="45" y="95" width="85" height="32" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(125,211,252,0.1)" strokeWidth="0.5" />
          <text x="87" y="114" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.2)">It&apos;s definitely not me</text>
          <polygon points="80,127 85,127 82,135" fill="rgba(255,255,255,0.03)" />
        </motion.g>

        <motion.g
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <rect x="175" y="75" width="105" height="32" rx="8" fill="rgba(253,164,175,0.04)" stroke="rgba(253,164,175,0.1)" strokeWidth="0.5" />
          <text x="227" y="94" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.2)">That drawing was sus 🤔</text>
          <polygon points="230,107 235,107 232,115" fill="rgba(253,164,175,0.04)" />
        </motion.g>

        <motion.g
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <rect x="100" y="40" width="120" height="32" rx="8" fill="rgba(134,239,172,0.04)" stroke="rgba(134,239,172,0.1)" strokeWidth="0.5" />
          <text x="160" y="59" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.2)">Wait, who drew last? 👀</text>
          <polygon points="155,72 160,72 157,80" fill="rgba(134,239,172,0.04)" />
        </motion.g>

        {/* Eye/suspicion icon */}
        <motion.circle
          cx="160" cy="25"
          r="10"
          fill="none"
          stroke={accent}
          strokeWidth="0.5"
          opacity="0.1"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 0.4 }}
        />
        <text x="160" y="29" textAnchor="middle" fontSize="10" opacity="0.15">👁</text>
      </svg>
    </div>
  );
}

/* ─── Step 04: Decide — Voting interface ─── */
export function DecideIllustration({ accent }: { accent: string }) {
  return (
    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#0a0a16]/60 border border-white/[0.04]">
      <svg viewBox="0 0 320 240" className="w-full h-full" fill="none">
        {/* Voting cards */}
        {[
          { x: 30, y: 40, name: "Alex", color: "#7dd3fc", votes: 1, w: 60 },
          { x: 100, y: 40, name: "Sam", color: "#86efac", votes: 0, w: 60 },
          { x: 170, y: 40, name: "P3", color: "#c4b5fd", votes: 3, w: 60 },
          { x: 240, y: 40, name: "You", color: "#fda4af", votes: 1, w: 60 },
        ].map((p, i) => (
          <motion.g key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
          >
            <rect x={p.x} y={p.y} width={p.w} height={80} rx="8"
              fill={p.votes === 3 ? `${p.color}08` : "rgba(255,255,255,0.02)"}
              stroke={p.votes === 3 ? `${p.color}30` : "rgba(255,255,255,0.04)"}
              strokeWidth={p.votes === 3 ? 1.5 : 0.5}
            />
            <circle cx={p.x + 30} cy={p.y + 28} r="12" fill={p.color} opacity="0.15" />
            <circle cx={p.x + 30} cy={p.y + 25} r="4" fill={p.color} opacity="0.25" />
            <text x={p.x + 30} y={p.y + 55} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.25)">
              {p.name}
            </text>
            <text x={p.x + 30} y={p.y + 72} textAnchor="middle" fontSize="10" fill={p.color} opacity="0.4" fontWeight="bold">
              {p.votes}
            </text>
          </motion.g>
        ))}

        {/* Result banner */}
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <rect x="70" y="145" width="180" height="50" rx="12" fill="rgba(196,181,253,0.06)" stroke="rgba(196,181,253,0.15)" strokeWidth="1" />
          <text x="160" y="167" textAnchor="middle" fontSize="9" fill="#c4b5fd" opacity="0.5" letterSpacing="2">
            PLAYER 3 ELIMINATED
          </text>
          <text x="160" y="183" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.15)">
            They were the IMPOSTER! ✓
          </text>
        </motion.g>

        {/* Confetti-like dots */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.circle
            key={i}
            cx={80 + Math.random() * 160}
            cy={200 + Math.random() * 30}
            r={1.5 + Math.random() * 2}
            fill={["#7dd3fc", "#fda4af", "#86efac", "#c4b5fd", "#fde68a"][i % 5]}
            opacity="0.1"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 0.1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.2 + i * 0.05 }}
          />
        ))}
      </svg>
    </div>
  );
}
