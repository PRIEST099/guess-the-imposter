"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { usePlayerStore } from "@/stores/player-store";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/shared/glass-card";
import { GlassButton } from "@/components/shared/glass-button";
import { GradientText } from "@/components/ui/gradient-text";
import { Brain, Clock, Check, X, Sparkles, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { playSuspenseSting, playVictoryFanfare, playConfetti } from "@/lib/sounds";

interface ImposterGuessProps {
  onGuess: (guess: string) => void;
}

export function ImposterGuess({ onGuess }: ImposterGuessProps) {
  const { playerId } = usePlayerStore();
  const imposterGuessActive = useGameStore((s) => s.imposterGuessActive);
  const imposterId = useGameStore((s) => s.imposterGuessImposterId);
  const timeLimit = useGameStore((s) => s.imposterGuessTimeLimit);
  const guessResult = useGameStore((s) => s.imposterGuessResult);
  const players = useGameStore((s) => s.players);

  const [guess, setGuess] = useState("");
  const [hasGuessed, setHasGuessed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isImposter = playerId === imposterId;
  const imposterPlayer = players.find((p) => p.id === imposterId);

  // Countdown timer
  useEffect(() => {
    if (!imposterGuessActive || guessResult) return;
    setTimeLeft(timeLimit);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [imposterGuessActive, timeLimit, guessResult]);

  // Play sounds on result
  useEffect(() => {
    if (!guessResult) return;
    if (guessResult.correct) {
      playConfetti();
    } else {
      playSuspenseSting();
    }
  }, [guessResult]);

  const handleSubmit = () => {
    if (!guess.trim() || hasGuessed) return;
    setHasGuessed(true);
    onGuess(guess.trim());
  };

  if (!imposterGuessActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="max-w-lg mx-auto"
      >
        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <div className="w-14 h-14 rounded-full bg-[#c4b5fd]/10 border border-[#c4b5fd]/15 mx-auto mb-4 flex items-center justify-center">
            <Brain className="w-7 h-7 text-[#c4b5fd] opacity-80" />
          </div>
          <h3 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-bold mb-2">
            <GradientText
              colors={["#c4b5fd", "#fda4af", "#c4b5fd", "#7dd3fc", "#c4b5fd"]}
              animationSpeed={4}
            >
              Comeback Chance!
            </GradientText>
          </h3>
          <p className="text-white/30 text-sm">
            {isImposter
              ? "You were caught! Guess the prompt to earn bonus points."
              : `${imposterPlayer?.nickname || "The imposter"} is trying to guess the prompt...`}
          </p>
        </motion.div>

        {/* Timer */}
        {!guessResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <Clock className={cn("w-4 h-4", timeLeft <= 5 ? "text-[#fda4af]" : "text-[#7dd3fc]")} />
            <motion.span
              className={cn(
                "font-mono text-2xl font-bold",
                timeLeft <= 5 ? "text-[#fda4af]" : "text-[#7dd3fc]"
              )}
              animate={timeLeft <= 5 ? { scale: [1, 1.1, 1] } : {}}
              transition={timeLeft <= 5 ? { duration: 0.5, repeat: Infinity } : {}}
            >
              {timeLeft}s
            </motion.span>
          </motion.div>
        )}

        {/* Guess result */}
        <AnimatePresence>
          {guessResult && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div
                className={cn(
                  "rounded-xl border bg-[#0c0c14]/70 backdrop-blur-sm overflow-hidden",
                  guessResult.correct ? "border-[#86efac]/10" : "border-[#fda4af]/10"
                )}
                style={{
                  boxShadow: guessResult.correct
                    ? "0 0 30px rgba(134,239,172,0.08)"
                    : "0 0 30px rgba(253,164,175,0.08)",
                }}
              >
                <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: guessResult.correct ? "#86efac" : "#fda4af" }}
                  />
                  <span className="font-mono text-[9px] tracking-wider uppercase text-white/20">
                    {guessResult.correct ? "Correct" : "Incorrect"}
                  </span>
                </div>
                <div className="p-5 sm:p-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                    className={cn(
                      "inline-flex items-center justify-center w-12 h-12 rounded-full mb-4",
                      guessResult.correct
                        ? "bg-[#86efac]/10 border border-[#86efac]/15"
                        : "bg-[#fda4af]/10 border border-[#fda4af]/15"
                    )}
                  >
                    {guessResult.correct ? (
                      <Check className="w-6 h-6 text-[#86efac]" />
                    ) : (
                      <X className="w-6 h-6 text-[#fda4af]" />
                    )}
                  </motion.div>

                  <h4 className="font-[family-name:var(--font-outfit)] text-xl font-bold mb-3">
                    {guessResult.correct ? (
                      <span className="text-[#86efac]">Correct Guess!</span>
                    ) : (
                      <span className="text-[#fda4af]">Wrong Guess!</span>
                    )}
                  </h4>

                  <div className="space-y-2 text-sm">
                    <p className="text-white/30">
                      Guessed: <span className="text-white/60 font-mono">&quot;{guessResult.guess}&quot;</span>
                    </p>
                    <p className="text-white/30">
                      Actual prompt: <span className="text-[#7dd3fc] font-mono">&quot;{guessResult.actualPrompt}&quot;</span>
                    </p>
                    {guessResult.correct && guessResult.bonusPoints > 0 && (
                      <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-center gap-1.5 text-[#86efac] font-mono font-bold mt-3"
                      >
                        <Sparkles className="w-4 h-4" />
                        +{guessResult.bonusPoints} bonus points!
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input (imposter only, before result) */}
        {isImposter && !guessResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="rounded-xl border border-[#c4b5fd]/10 bg-[#0c0c14]/70 backdrop-blur-sm overflow-hidden"
              style={{ boxShadow: "0 0 30px rgba(196,181,253,0.06)" }}
            >
              <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#c4b5fd]" />
                <span className="font-mono text-[9px] tracking-wider uppercase text-white/20">
                  What Was The Prompt?
                </span>
              </div>
              <div className="p-4">
                <div className="flex gap-2">
                  <Input
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="Type your guess..."
                    disabled={hasGuessed || timeLeft === 0}
                    className="bg-white/[0.02] border-white/[0.06] focus-visible:ring-[#c4b5fd]/20 text-white/80 placeholder:text-white/15 min-h-[48px]"
                    maxLength={100}
                    autoFocus
                  />
                  <GlassButton
                    variant="lavender"
                    onClick={handleSubmit}
                    disabled={!guess.trim() || hasGuessed || timeLeft === 0}
                    className="shrink-0 h-12 px-5"
                  >
                    <Brain className="w-4 h-4 mr-1.5" />
                    Guess
                  </GlassButton>
                </div>
                {hasGuessed && !guessResult && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-[10px] text-white/20 mt-3 font-mono uppercase tracking-wider"
                  >
                    Waiting for result...
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Waiting state (non-imposter, before result) */}
        {!isImposter && !guessResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="rounded-xl border border-white/[0.06] bg-[#0c0c14]/70 backdrop-blur-sm p-6 text-center">
              <motion.div
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center justify-center gap-2 text-white/30"
              >
                <Eye className="w-5 h-5 text-[#c4b5fd] opacity-60" />
                <span className="text-sm font-mono">
                  {imposterPlayer?.nickname || "The imposter"} is guessing...
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
