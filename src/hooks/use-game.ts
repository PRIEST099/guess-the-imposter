"use client";
import { useEffect, useCallback, useRef } from "react";
import { useSocket } from "./use-socket";
import { useGameStore } from "@/stores/game-store";
import { usePlayerStore } from "@/stores/player-store";
import { useStatsStore } from "@/stores/stats-store";
import { useRouter } from "next/navigation";

// Callback ref for canvas reset (set by SketchCanvas component)
let canvasResetCallback: (() => void) | null = null;
export function setCanvasResetCallback(cb: (() => void) | null) {
  canvasResetCallback = cb;
}

export function useGame() {
  const socket = useSocket();
  const router = useRouter();
  const store = useGameStore();
  const { playerId: myPlayerId } = usePlayerStore();
  const statsStore = useStatsStore();

  useEffect(() => {
    socket.on("game:phase-change", (data) => {
      store.setPhase(data.phase as any, data.timeLimit);
      store.setCurrentRound(data.roundNumber);
    });

    socket.on("game:round-start", (data: { roundNumber: number; gameMode?: string }) => {
      if (data.gameMode) {
        store.setSettings({ gameMode: data.gameMode as any });
      }
    });

    socket.on("game:role-assigned", (data) => {
      store.setRole(data.role, data.prompt);
    });

    socket.on("task:all-submitted", (data) => {
      store.setSubmissions(data.submissions);
    });

    socket.on("task:submission-count", (data: { count: number; total: number }) => {
      store.setSubmissionProgress(data.count, data.total);
    });

    // Turn-based drawing: receive turn info with playerColors
    socket.on("task:turn-start", (data: { drawerId: string; turnNumber: number; totalTurns: number; turnDuration: number; turnOrder: string[]; playerColors?: Record<string, string> }) => {
      store.setTurn(data.drawerId, data.turnNumber, data.totalTurns, data.turnDuration, data.turnOrder, data.playerColors);
    });

    // Turn timer sync
    socket.on("task:turn-timer", (data: { secondsRemaining: number }) => {
      store.setTurnTimeRemaining(data.secondsRemaining);
    });

    // Canvas reset at round start (SKETCH_OFF persistent canvas)
    socket.on("task:canvas-reset", () => {
      if (canvasResetCallback) canvasResetCallback();
    });

    socket.on("vote:results", (data) => {
      store.clearImposterGuess();
      store.setVoteResult(data);

      // Record round stats
      if (myPlayerId) {
        const wasImposter = data.imposterId === myPlayerId;
        const imposterSurvived = !data.imposterWasFound;
        const myVotedId = data.votes[myPlayerId];
        const votedCorrectly = myVotedId === data.imposterId;
        statsStore.recordRound(wasImposter, imposterSurvived, votedCorrectly);
      }
    });

    socket.on("imposter:guess-phase", (data: { imposterId: string; timeLimit: number }) => {
      store.setImposterGuessPhase(data.imposterId, data.timeLimit);
    });

    socket.on("imposter:guess-result", (data: { correct: boolean; guess: string; actualPrompt: string; bonusPoints: number }) => {
      store.setImposterGuessResult(data);
      // Record imposter guess stat if this player was the imposter
      if (myPlayerId && store.myRole === 'IMPOSTER') {
        statsStore.recordImposterGuess(data.correct);
      }
    });

    socket.on("timer:sync", (data) => {
      store.setTimeRemaining(data.secondsRemaining);
    });

    socket.on("game:ended", (data: { finalScores: Record<string, number>; winner: string }) => {
      // Record game stats
      if (myPlayerId && data.finalScores[myPlayerId] !== undefined) {
        const myScore = data.finalScores[myPlayerId];
        const maxScore = Math.max(...Object.values(data.finalScores));
        const won = myScore === maxScore && myScore > 0;
        statsStore.recordGamePlayed(won, myScore);
      }

      // Navigate to results after a short delay
      const roomCode = store.roomCode;
      if (roomCode) {
        setTimeout(() => router.push(`/results/${roomCode}`), 1000);
      }
    });

    socket.on("game:rematch-started", (data: { roomCode: string }) => {
      store.resetRound();
      store.setPhase("WAITING" as any);
      router.push(`/lobby/${data.roomCode}`);
    });

    return () => {
      socket.off("game:phase-change");
      socket.off("game:round-start");
      socket.off("game:role-assigned");
      socket.off("task:all-submitted");
      socket.off("task:submission-count");
      socket.off("task:turn-start");
      socket.off("task:turn-timer");
      socket.off("task:canvas-reset");
      socket.off("vote:results");
      socket.off("imposter:guess-phase");
      socket.off("imposter:guess-result");
      socket.off("timer:sync");
      socket.off("game:ended");
      socket.off("game:rematch-started");
    };
  }, [socket, store, router]);

  const submitWord = useCallback((text: string) => {
    socket.emit("task:submit-word", { text });
    store.setHasSubmitted(true);
  }, [socket, store]);

  const submitTrivia = useCallback((answer: string) => {
    socket.emit("task:submit-trivia", { answer });
    store.setHasSubmitted(true);
  }, [socket, store]);

  const submitCaption = useCallback((caption: string) => {
    socket.emit("task:submit-caption", { caption });
    store.setHasSubmitted(true);
  }, [socket, store]);

  const submitRanking = useCallback((ranking: string[]) => {
    socket.emit("task:submit-ranking", { ranking });
    store.setHasSubmitted(true);
  }, [socket, store]);

  const castVote = useCallback((votedPlayerId: string) => {
    socket.emit("vote:cast", { votedPlayerId });
    store.setMyVote(votedPlayerId);
  }, [socket, store]);

  const sendCanvasStroke = useCallback((stroke: any) => {
    socket.emit("task:canvas-stroke", { stroke });
  }, [socket]);

  const endTurn = useCallback(() => {
    socket.emit("task:turn-done");
  }, [socket]);

  const submitImposterGuess = useCallback((guess: string) => {
    socket.emit("imposter:guess-prompt", { guess });
  }, [socket]);

  const requestRematch = useCallback(() => {
    socket.emit("game:rematch");
  }, [socket]);

  return { submitWord, submitTrivia, submitCaption, submitRanking, castVote, sendCanvasStroke, endTurn, submitImposterGuess, requestRematch };
}
