"use client";

import { useRef, type ComponentType } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Users, Eye, MessageCircle, Trophy } from "lucide-react";
import {
  GatherIllustration,
  AssignIllustration,
  DeceiveIllustration,
  DecideIllustration,
} from "@/components/landing/step-illustrations";

const steps = [
  {
    index: "01",
    label: "Gather",
    title: "Join a Lobby",
    description:
      "Create or join a game room with 3-8 players. Share your room code with friends and get everyone in.",
    icon: Users,
    accent: "var(--accent-sky)",
    Illustration: GatherIllustration,
  },
  {
    index: "02",
    label: "Assign",
    title: "Get Your Role",
    description:
      "One player secretly becomes the imposter — given a different prompt from everyone else. Nobody knows who.",
    icon: Eye,
    accent: "var(--accent-rose)",
    Illustration: AssignIllustration,
  },
  {
    index: "03",
    label: "Deceive",
    title: "Play & Discuss",
    description:
      "Complete the task, then debate who seems suspicious. The imposter must blend in or risk being caught.",
    icon: MessageCircle,
    accent: "var(--accent-lavender)",
    Illustration: DeceiveIllustration,
  },
  {
    index: "04",
    label: "Decide",
    title: "Vote & Win",
    description:
      "Vote out the imposter to win — or survive as the imposter for bonus points. Trust no one.",
    icon: Trophy,
    accent: "var(--accent-mint)",
    Illustration: DecideIllustration,
  },
];

function Step({
  step,
  isReversed,
}: {
  step: (typeof steps)[0];
  isReversed: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0.4, 1]);

  return (
    <div ref={ref} className="relative">
      <motion.div
        style={{ y, opacity }}
        className={`
          grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center
          ${isReversed ? "" : ""}
        `}
      >
        {/* Text content side */}
        <div
          className={`
            flex flex-col gap-5
            ${isReversed ? "lg:order-2" : "lg:order-1"}
          `}
        >
          {/* Index + label row */}
          <div className="flex items-center gap-4">
            <span
              className="font-mono text-4xl md:text-5xl font-bold tracking-tighter select-none"
              style={{ color: step.accent, opacity: 0.2 }}
            >
              {step.index}
            </span>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `color-mix(in srgb, ${step.accent} 10%, transparent)` }}
            >
              <step.icon
                className="w-4 h-4"
                style={{ color: step.accent }}
              />
            </div>
            <span
              className="font-mono text-xs uppercase tracking-[0.35em]"
              style={{ color: step.accent }}
            >
              {step.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-[family-name:var(--font-outfit)] text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white/90 leading-[1.1]">
            {step.title}
          </h3>

          {/* Description */}
          <p className="text-sm md:text-base leading-relaxed text-white/35 max-w-md">
            {step.description}
          </p>
        </div>

        {/* Illustration side */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className={`w-full max-w-sm mx-auto lg:mx-0 ${isReversed ? "lg:order-1" : "lg:order-2"}`}
        >
          <step.Illustration accent={step.accent} />
        </motion.div>
      </motion.div>
    </div>
  );
}

export function HowToPlay() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const lineHeight = useTransform(scrollYProgress, [0.05, 0.85], ["0%", "100%"]);

  return (
    <section ref={sectionRef} className="relative py-32 md:py-44 px-6 md:px-12 overflow-hidden">
      {/* Section header — editorial, left-aligned */}
      <div className="max-w-6xl mx-auto mb-16 md:mb-24">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="block font-mono text-[11px] uppercase tracking-[0.5em] text-white/20 mb-6"
        >
          How it works
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-[family-name:var(--font-outfit)] text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white/90 leading-[1.05] max-w-3xl"
        >
          Four steps to
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-sky via-accent-lavender to-accent-rose bg-[length:200%] animate-gradient">
            find the imposter
          </span>
        </motion.h2>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="h-px w-32 mt-10 origin-left"
          style={{
            background:
              "linear-gradient(to right, var(--accent-sky), transparent)",
          }}
        />
      </div>

      {/* Vertical progress line — desktop only */}
      <div className="hidden lg:block absolute left-1/2 top-[280px] bottom-32 w-px -translate-x-1/2 pointer-events-none">
        <div className="absolute inset-0 bg-white/[0.04]" />
        <motion.div
          style={{ height: lineHeight }}
          className="absolute top-0 left-0 w-full bg-gradient-to-b from-accent-sky/30 via-accent-lavender/20 to-accent-mint/30"
        />
      </div>

      {/* Steps — stacked vertically with alternating alignment */}
      <div className="max-w-6xl mx-auto flex flex-col gap-20 md:gap-28">
        {steps.map((step, i) => (
          <Step key={step.index} step={step} isReversed={i % 2 !== 0} />
        ))}
      </div>
    </section>
  );
}
