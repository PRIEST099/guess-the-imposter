"use client";
import { useEffect, useCallback } from "react";
import { useSocket } from "./use-socket";
import { useGameStore } from "@/stores/game-store";
import { usePlayerStore } from "@/stores/player-store";
import { useRouter } from "next/navigation";
import type { GameSettings } from "@/types/game";

export function useLobby() {
  const socket = useSocket();
  const router = useRouter();
  const { setRoomCode, setPlayers, addPlayer, removePlayer, updatePlayerReady, setSettings, setHostId } = useGameStore();
  const { playerId } = usePlayerStore();

  useEffect(() => {
    socket.on("lobby:joined", (data) => {
      setRoomCode(data.game.roomCode);
      setHostId(data.game.hostId);
      setSettings(data.game.settings);
      setPlayers(data.game.players);
    });

    socket.on("lobby:player-joined", (data) => {
      addPlayer(data.player);
    });

    socket.on("lobby:player-left", (data) => {
      removePlayer(data.playerId);
      if (data.newHostId) {
        setHostId(data.newHostId);
      }
    });

    socket.on("lobby:ready-update", (data) => {
      updatePlayerReady(data.playerId, data.isReady);
    });

    socket.on("lobby:settings-changed", (data) => {
      setSettings(data.settings);
    });

    socket.on("lobby:kicked", () => {
      router.push("/");
    });

    // Handle errors that should redirect (invalid room, game started, etc.)
    const handleError = (data: { code: string; message: string }) => {
      if (["GAME_NOT_FOUND", "GAME_STARTED", "GAME_FULL", "JOIN_FAILED"].includes(data.code)) {
        // Delay redirect so the user can see the toast error message
        setTimeout(() => router.push("/"), 1500);
      }
    };
    socket.on("error", handleError);

    return () => {
      socket.off("lobby:joined");
      socket.off("lobby:player-joined");
      socket.off("lobby:player-left");
      socket.off("lobby:ready-update");
      socket.off("lobby:settings-changed");
      socket.off("lobby:kicked");
      socket.off("error", handleError);
    };
  }, [socket, router, setRoomCode, setPlayers, addPlayer, removePlayer, updatePlayerReady, setSettings, setHostId]);

  const createGame = useCallback((settings: Partial<GameSettings>) => {
    socket.emit("lobby:create", { settings: settings as GameSettings });
  }, [socket]);

  const joinGame = useCallback((roomCode: string) => {
    socket.emit("lobby:join", { roomCode });
  }, [socket]);

  const toggleReady = useCallback((isReady: boolean) => {
    socket.emit("lobby:ready", { isReady });
  }, [socket]);

  const updateSettings = useCallback((settings: Partial<GameSettings>) => {
    socket.emit("lobby:settings-update", settings);
  }, [socket]);

  const kickPlayer = useCallback((targetId: string) => {
    socket.emit("lobby:kick", { playerId: targetId });
  }, [socket]);

  const leaveGame = useCallback(() => {
    socket.emit("lobby:leave");
  }, [socket]);

  const startGame = useCallback(() => {
    socket.emit("game:start");
  }, [socket]);

  return { createGame, joinGame, toggleReady, updateSettings, kickPlayer, leaveGame, startGame };
}
