"use client";
import { useEffect, useRef } from "react";
import { getSocket, type GameSocket } from "@/lib/socket-client";
import { usePlayerStore } from "@/stores/player-store";
import { useGameStore } from "@/stores/game-store";
import { toast } from "sonner";

const ERROR_MESSAGES: Record<string, string> = {
  GAME_NOT_FOUND: "Room not found. Please check the code and try again.",
  GAME_FULL: "This room is full.",
  GAME_STARTED: "This game has already started.",
  NOT_AUTHENTICATED: "Connection error. Please refresh the page.",
  NOT_HOST: "Only the host can do that.",
  NOT_ENOUGH_PLAYERS: "Not enough players to start the game.",
  NOT_ALL_READY: "Not all players are ready.",
  JOIN_FAILED: "Could not join the game. Please try again.",
};

export function useSocket() {
  const socketRef = useRef<GameSocket | null>(null);
  const { nickname, avatarId, sessionId, setPlayerId, setSessionId } = usePlayerStore();
  const { setConnected, setRole, setTurn, setTurnTimeRemaining } = useGameStore();

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      setConnected(true);
      // Register player
      socket.emit("auth:register", { nickname, avatarId, sessionId: sessionId || undefined });
    });

    socket.on("auth:registered", (data) => {
      setPlayerId(data.player.id);
      setSessionId(data.player.sessionId);
    });

    // Listen for role assignment at socket level so it's never missed during page transitions
    socket.on("game:role-assigned", (data) => {
      setRole(data.role, data.prompt);
    });

    // Listen for turn-based drawing events
    socket.on("task:turn-start", (data) => {
      setTurn(data.drawerId, data.turnNumber, data.totalTurns, data.turnDuration, data.turnOrder);
    });

    socket.on("task:turn-timer", (data) => {
      setTurnTimeRemaining(data.secondsRemaining);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("error", (data: { code: string; message: string }) => {
      console.error("Socket error:", data.code, data.message);
      const friendlyMessage = ERROR_MESSAGES[data.code] || data.message || "Something went wrong.";
      toast.error(friendlyMessage);
    });

    return () => {
      socket.off("connect");
      socket.off("auth:registered");
      socket.off("game:role-assigned");
      socket.off("task:turn-start");
      socket.off("task:turn-timer");
      socket.off("disconnect");
      socket.off("error");
    };
  }, [nickname, avatarId, sessionId, setPlayerId, setSessionId, setConnected, setRole, setTurn, setTurnTimeRemaining]);

  return socketRef.current || getSocket();
}
