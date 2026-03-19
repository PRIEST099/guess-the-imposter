"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { GradientText } from "@/components/ui/gradient-text";
import { GamePreview } from "@/components/landing/game-preview";

/* ─── Letter-by-letter reveal for the massive headline ─── */
function RevealHeadline({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const letters = text.split("");
  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.035, delayChildren: delay },
        },
      }}
      aria-label={text}
    >
      {letters.map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          style={{ whiteSpace: char === " " ? "pre" : undefined }}
          variants={{
            hidden: { opacity: 0, y: 60, rotateX: -90 },
            visible: {
              opacity: 1,
              y: 0,
              rotateX: 0,
              transition: {
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              },
            },
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ─── Word-by-word subtitle reveal ─── */
function AnimatedSubtitle({ text, delay = 1.4 }: { text: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <motion.p
      className="font-mono text-sm sm:text-base text-white/25 leading-relaxed tracking-wide max-w-lg"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.03, delayChildren: delay } },
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.35em]"
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] },
            },
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
}

/* ─── Horizontal rule that draws itself ─── */
function DrawLine({ delay = 1.8 }: { delay?: number }) {
  return (
    <motion.div
      className="w-full max-w-[120px]"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: "left" }}
    >
      <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent" />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   HERO — Good Fella–inspired: massive type, scroll-push,
   monospace accents, generous whitespace, flat & bold.
   ═══════════════════════════════════════════════════════ */
export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Scroll-push: scale down + fade out as user scrolls away
  const scale = useTransform(scrollYProgress, [0, 0.6], [1, 0.88]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const translateY = useTransform(scrollYProgress, [0, 0.6], [0, -60]);

  return (
    <>
    <section
      ref={heroRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
    >
      {/* Subtle single-color ambient glow — NOT overpowering */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(900px,90vw)] h-[min(900px,90vw)] rounded-full opacity-[0.04]"
        style={{
          background:
            "radial-gradient(circle, var(--accent-sky) 0%, transparent 70%)",
        }}
      />

      {/* ── Scroll-push wrapper ── */}
      <motion.div
        style={{ scale, opacity, y: translateY }}
        className="relative z-10 w-full px-6 md:px-10"
      >
        <div className="max-w-[1400px] mx-auto flex flex-col items-start gap-10 md:gap-14">

          {/* Monospace index label */}
          <motion.span
            className="font-mono text-xs sm:text-sm tracking-[0.2em] text-white/20 uppercase"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            [ 01 ] &mdash; multiplayer deduction
          </motion.span>

          {/* ── MASSIVE headline ── */}
          <h1
            className="font-[family-name:var(--font-outfit)] font-extrabold leading-[0.88] tracking-[-0.04em]"
            style={{
              fontSize: "clamp(3rem, 10vw, 10rem)",
              perspective: "600px",
            }}
          >
            {/* Line 1: GUESS THE */}
            <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white/90 to-white/40">
              <RevealHeadline text="GUESS THE" delay={0.3} />
            </span>

            {/* Line 2: IMPOSTER — gradient animated */}
            <span className="block mt-[-0.02em]">
              <GradientText
                colors={["#7dd3fc", "#c4b5fd", "#fda4af", "#86efac", "#7dd3fc"]}
                animationSpeed={10}
                className="font-[family-name:var(--font-outfit)]"
              >
                <RevealHeadline text="IMPOSTER" delay={0.65} />
              </GradientText>
            </span>
          </h1>

          {/* ── Bottom info row: line + subtitle + meta ── */}
          <div className="flex flex-col gap-6 w-full max-w-2xl">
            <DrawLine delay={1.6} />

            <AnimatedSubtitle
              text="Blend in or stand out. Draw, write, and deceive your friends in the ultimate multiplayer party game of deduction."
              delay={1.8}
            />

            {/* Monospace metadata row */}
            <motion.div
              className="flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-[11px] sm:text-xs tracking-[0.15em] uppercase text-white/15"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 2.4 }}
            >
              <span>// real-time</span>
              <span>// 4–12 players</span>
              <span>// browser-based</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        className="absolute bottom-10 left-6 md:left-10 flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] uppercase text-white/15"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
      >
        <motion.span
          className="block w-px h-8 bg-white/15 origin-top"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        <span>scroll</span>
      </motion.div>

      {/* Bottom fade to page background */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[var(--black-base,#0c0c14)] to-transparent pointer-events-none" />
    </section>

    {/* ── Game Preview — 3D tilted mockup composition ── */}
    <section className="relative -mt-10 px-6">
      <GamePreview />
    </section>
    </>
  );
}
