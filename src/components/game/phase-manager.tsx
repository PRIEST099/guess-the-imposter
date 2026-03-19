"use client";
import { useEffect, useRef } from "react";
import { useGameStore } from "@/stores/game-store";
import { GamePhase, GameMode } from "@/types/game";
import { RoleReveal } from "./role-reveal";
import { WordPlayTask } from "./task-phase/word-play-task";
import { SketchCanvas } from "./task-phase/sketch-canvas";
import { TriviaTwistTask } from "./task-phase/trivia-twist-task";
import { CaptionChaosTask } from "./task-phase/caption-chaos-task";
import { OddOneOutTask } from "./task-phase/odd-one-out-task";
import { DiscussionPhase } from "./discussion-phase";
import { VotingPhase } from "./voting-phase";
import { RoundResults } from "./round-results";
import { TimerBar } from "./timer-bar";
import { PhaseAnnouncement } from "./phase-announcement";
import { SubmissionProgress } from "./submission-progress";
import { ImposterGuess } from "./imposter-guess";
import { useGame } from "@/hooks/use-game";
import { playPhaseTransition } from "@/lib/sounds";
import { motion, AnimatePresence } from "framer-motion";

export function PhaseManager() {
  const phase = useGameStore((s) => s.phase);
  const settings = useGameStore((s) => s.settings);
  const gameMode = useGameStore((s) => s.gameMode);
  const imposterGuessActive = useGameStore((s) => s.imposterGuessActive);
  const prevPhaseRef = useRef<string | null>(null);

  // Play phase transition sound when phase changes
  useEffect(() => {
    if (prevPhaseRef.current !== null && prevPhaseRef.current !== phase) {
      playPhaseTransition();
    }
    prevPhaseRef.current = phase;
  }, [phase]);
  const {
    submitWord,
    submitTrivia,
    submitCaption,
    submitRanking,
    castVote,
    sendCanvasStroke,
    endTurn,
    submitImposterGuess,
  } = useGame();

  const getTimerDuration = () => {
    switch (phase) {
      case GamePhase.TASK:
        return settings.taskDuration;
      case GamePhase.DISCUSSION:
        return settings.discussionDuration;
      case GamePhase.VOTING:
        return settings.votingDuration;
      case GamePhase.ROLE_REVEAL:
        return 5;
      case GamePhase.ROUND_RESULTS:
        return 8;
      default:
        return 0;
    }
  };

  const showTimer = [
    GamePhase.TASK,
    GamePhase.DISCUSSION,
    GamePhase.VOTING,
  ].includes(phase as GamePhase);

  const renderTaskPhase = () => {
    switch (gameMode) {
      case GameMode.WORD_PLAY:
        return <WordPlayTask onSubmit={submitWord} />;
      case GameMode.SKETCH_OFF:
        return (
          <SketchCanvas onStroke={sendCanvasStroke} onEndTurn={endTurn} />
        );
      case GameMode.TRIVIA_TWIST:
        return <TriviaTwistTask onSubmit={submitTrivia} />;
      case GameMode.CAPTION_CHAOS:
        return <CaptionChaosTask onSubmit={submitCaption} />;
      case GameMode.ODD_ONE_OUT:
        return <OddOneOutTask onSubmit={submitRanking} />;
      default:
        return <WordPlayTask onSubmit={submitWord} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Phase announcement overlay */}
      <PhaseAnnouncement phase={phase as GamePhase} />

      {/* Timer + submission progress */}
      {showTimer && <TimerBar totalTime={getTimerDuration()} />}
      {phase === GamePhase.TASK && <SubmissionProgress />}

      {/* Imposter guess overlay (between voting and results) */}
      {imposterGuessActive && (
        <ImposterGuess onGuess={submitImposterGuess} />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={imposterGuessActive ? "imposter-guess" : phase}
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
          transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
        >
          {!imposterGuessActive && phase === GamePhase.ROLE_REVEAL && <RoleReveal />}
          {!imposterGuessActive && phase === GamePhase.TASK && renderTaskPhase()}
          {!imposterGuessActive && phase === GamePhase.DISCUSSION && <DiscussionPhase />}
          {!imposterGuessActive && phase === GamePhase.VOTING && <VotingPhase onVote={castVote} />}
          {!imposterGuessActive && phase === GamePhase.ROUND_RESULTS && <RoundResults />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
