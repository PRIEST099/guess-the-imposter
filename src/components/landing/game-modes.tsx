"use client";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { GAME_MODE_INFO } from "@/lib/constants";
import { GameMode } from "@/types/game";
import {
  Pencil,
  Palette,
  Brain,
  Camera,
  ListOrdered,
  Shuffle,
  ArrowUpRight,
} from "lucide-react";
import { ModePreview } from "@/components/landing/mode-previews";

const modeIcons: Record<GameMode, typeof Pencil> = {
  [GameMode.WORD_PLAY]: Pencil,
  [GameMode.SKETCH_OFF]: Palette,
  [GameMode.TRIVIA_TWIST]: Brain,
  [GameMode.CAPTION_CHAOS]: Camera,
  [GameMode.ODD_ONE_OUT]: ListOrdered,
  [GameMode.RANDOM]: Shuffle,
};

const modeAccents: Record<GameMode, string> = {
  [GameMode.WORD_PLAY]: "#7dd3fc",
  [GameMode.SKETCH_OFF]: "#fda4af",
  [GameMode.TRIVIA_TWIST]: "#c4b5fd",
  [GameMode.CAPTION_CHAOS]: "#86efac",
  [GameMode.ODD_ONE_OUT]: "#fde68a",
  [GameMode.RANDOM]: "#e2e8f0",
};

const modeEntries = Object.entries(GAME_MODE_INFO) as [
  GameMode,
  { name: string; description: string; icon: string },
][];

function ModeRow({
  mode,
  modeKey,
  index,
}: {
  mode: { name: string; description: string };
  modeKey: GameMode;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [hovered, setHovered] = useState(false);

  const Icon = modeIcons[modeKey];
  const accent = modeAccents[modeKey];
  const idx = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Divider */}
      <div className="h-px w-full bg-white/[0.06]" />

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group relative cursor-pointer"
      >
        {/* Hover background wash */}
        <motion.div
          className="absolute inset-0 -mx-6 md:-mx-10 pointer-events-none"
          initial={false}
          animate={{
            backgroundColor: hovered ? `${accent}06` : "transparent",
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />

        {/* Accent left bar on hover */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-px pointer-events-none"
          initial={false}
          animate={{
            backgroundColor: hovered ? accent : "transparent",
            opacity: hovered ? 0.4 : 0,
          }}
          transition={{ duration: 0.3 }}
        />

        <div className="relative flex items-center gap-6 md:gap-10 py-8 md:py-10">
          {/* Index */}
          <span
            className="font-mono text-sm tracking-wider shrink-0 transition-colors duration-500"
            style={{ color: hovered ? accent : "rgba(255,255,255,0.15)" }}
          >
            {idx} /
          </span>

          {/* Icon */}
          <motion.div
            className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border transition-colors duration-500"
            style={{
              borderColor: hovered
                ? `${accent}30`
                : "rgba(255,255,255,0.04)",
              backgroundColor: hovered
                ? `${accent}0a`
                : "transparent",
            }}
            animate={{ rotate: hovered ? 12 : 0, scale: hovered ? 1.05 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Icon
              className="w-4 h-4 md:w-5 md:h-5 transition-colors duration-500"
              style={{ color: hovered ? accent : "rgba(255,255,255,0.2)" }}
              strokeWidth={1.5}
            />
          </motion.div>

          {/* Title + description */}
          <div className="flex-1 min-w-0">
            <h3
              className="font-[family-name:var(--font-outfit)] text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight transition-colors duration-500"
              style={{
                color: hovered
                  ? "rgba(255,255,255,0.95)"
                  : "rgba(255,255,255,0.55)",
              }}
            >
              {mode.name}
            </h3>

            {/* Description — revealed on hover */}
            <motion.div
              className="overflow-hidden"
              initial={false}
              animate={{
                height: hovered ? "auto" : 0,
                opacity: hovered ? 1 : 0,
                marginTop: hovered ? 6 : 0,
              }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start gap-4">
                <p className="text-sm md:text-base flex-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {mode.description}
                </p>
                {/* Mode preview thumbnail */}
                {hovered && <ModePreview mode={modeKey} accent={accent} />}
              </div>
            </motion.div>
          </div>

          {/* Arrow indicator */}
          <motion.div
            className="shrink-0"
            animate={{
              x: hovered ? 0 : -8,
              opacity: hovered ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <ArrowUpRight
              className="w-5 h-5 md:w-6 md:h-6"
              style={{ color: accent }}
              strokeWidth={1.5}
            />
          </motion.div>
        </div>
      </div>

      {/* Final divider after last item */}
      {index === modeEntries.length - 1 && (
        <div className="h-px w-full bg-white/[0.06]" />
      )}
    </motion.div>
  );
}

export function GameModes() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const lineWidth = useTransform(scrollYProgress, [0.1, 0.4], ["0%", "100%"]);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 md:py-44 px-6 md:px-10 overflow-hidden"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div ref={headerRef} className="mb-20 md:mb-28">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={
              headerInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 20 }
            }
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block font-mono text-[11px] uppercase tracking-[0.35em] text-white/20 mb-6"
          >
            [ Game Modes ]
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={
              headerInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 30 }
            }
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="font-[family-name:var(--font-outfit)] text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white/90 leading-[1.1]"
          >
            Six ways to
            <br />
            find the imposter
          </motion.h2>

          {/* Animated underline */}
          <motion.div
            className="h-px mt-8 bg-gradient-to-r from-white/10 to-transparent origin-left"
            style={{ width: lineWidth }}
          />
        </div>

        {/* Mode list */}
        <div>
          {modeEntries.map(([key, mode], index) => (
            <ModeRow
              key={key}
              mode={mode}
              modeKey={key}
              index={index}
            />
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/10 mt-16 md:mt-20 text-right"
        >
          Each mode tests different skills
        </motion.p>
      </div>
    </section>
  );
}
