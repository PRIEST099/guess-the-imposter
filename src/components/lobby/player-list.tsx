"use client";
import { PlayerCard } from "./player-card";
import { useGameStore } from "@/stores/game-store";
import { usePlayerStore } from "@/stores/player-store";

interface PlayerListProps {
  onKick?: (playerId: string) => void;
}

export function PlayerList({ onKick }: PlayerListProps) {
  const { players, hostId } = useGameStore();
  const { playerId } = usePlayerStore();
  const isHost = playerId === hostId;

  return (
    <div>
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          isCurrentPlayer={player.id === playerId}
          isHost={player.id === hostId}
          canKick={isHost && player.id !== playerId}
          onKick={() => onKick?.(player.id)}
        />
      ))}
    </div>
  );
}
