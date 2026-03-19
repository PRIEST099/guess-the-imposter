"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLobby } from "@/hooks/use-lobby";
import { useGameStore } from "@/stores/game-store";
import { usePlayerStore } from "@/stores/player-store";
import { useSocket } from "@/hooks/use-socket";
import { PlayerList } from "@/components/lobby/player-list";
import { ChatPanel } from "@/components/lobby/chat-panel";
import { GameSettings } from "@/components/lobby/game-settings";
import { ReadyButton } from "@/components/lobby/ready-button";
import { RoomCodeDisplay } from "@/components/shared/room-code-display";
import { AnimatedBackground } from "@/components/shared/animated-background";
import { GlassCard } from "@/components/shared/glass-card";
import { GlassButton } from "@/components/shared/glass-button";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Users, Sparkles } from "lucide-react";
import { MIN_PLAYERS } from "@/lib/constants";
import { SoundToggle } from "@/components/shared/sound-toggle";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const fadeIn = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 100, damping: 15 } },
};

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const socket = useSocket();
  const code = params.code as string;
  const { joinGame, toggleReady, updateSettings, kickPlayer, leaveGame, startGame } = useLobby();
  const { players, roomCode, hostId, settings, phase } = useGameStore();
  const { playerId } = usePlayerStore();

  const isHost = playerId === hostId;
  const allReady = players.every((p) => p.id === hostId || p.isReady);
  const hasEnoughPlayers = players.length >= MIN_PLAYERS;

  useEffect(() => {
    if (socket.connected && playerId && !roomCode) {
      joinGame(code);
    }
  }, [socket.connected, playerId, roomCode, code, joinGame]);

  useEffect(() => {
    const handleJoinError = (data: { code: string; message: string }) => {
      if (["GAME_NOT_FOUND", "GAME_STARTED", "GAME_FULL", "JOIN_FAILED"].includes(data.code)) {
        setTimeout(() => router.push("/"), 1500);
      }
    };
    socket.on("error", handleJoinError);
    return () => { socket.off("error", handleJoinError); };
  }, [socket, router]);

  useEffect(() => {
    const handlePhaseChange = (data: { phase: string }) => {
      if (data.phase === "ROLE_REVEAL") {
        router.push(`/game/${code}`);
      }
    };
    socket.on("game:phase-change", handlePhaseChange);
    return () => { socket.off("game:phase-change", handlePhaseChange); };
  }, [socket, code, router]);

  const handleLeave = () => {
    leaveGame();
    router.push("/");
  };

  return (
    <main className="relative min-h-screen bg-[#0c0c14] overflow-hidden">
      <AnimatedBackground variant="default" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 p-3 sm:p-4 md:p-8 max-w-6xl mx-auto"
      >
        {/* Header */}
        <motion.div
          variants={fadeIn}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLeave}
              className="text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors duration-400 font-mono text-[10px] uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Leave
            </Button>
            <RoomCodeDisplay code={code} />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <SoundToggle />
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-[#0c0c14]/70">
              <Users className="w-3.5 h-3.5 text-accent-sky/50" />
              <span className="font-mono text-[10px] tracking-wider uppercase">
                <span className="text-accent-sky">{players.length}</span>
                <span className="text-white/10 mx-1">/</span>
                <span className="text-white/30">{settings.maxPlayers}</span>
                <span className="ml-1.5 text-white/15">players</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main content — 3-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
          {/* Left: Players + Ready / Start */}
          <motion.div variants={fadeIn} className="lg:col-span-1 space-y-4">
            <div className="rounded-xl border border-white/[0.06] bg-[#0c0c14]/70 backdrop-blur-sm overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-sky/40" />
                <span className="text-[9px] font-mono text-white/20 tracking-wider uppercase">Players</span>
                <span className="ml-auto text-[9px] font-mono text-accent-sky/30">{players.length}/{settings.maxPlayers}</span>
              </div>
              <div className="p-3">
                <PlayerList onKick={isHost ? kickPlayer : undefined} />
              </div>
            </div>

            {!isHost && (
              <ReadyButton onToggle={toggleReady} />
            )}

            {isHost && (
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <button
                  onClick={startGame}
                  disabled={!allReady || !hasEnoughPlayers}
                  className="w-full h-14 rounded-xl border font-mono text-sm uppercase tracking-wider transition-all duration-400 flex items-center justify-center gap-2 disabled:opacity-30 disabled:pointer-events-none bg-accent-mint/[0.06] text-accent-mint border-accent-mint/20 hover:bg-accent-mint/[0.12]"
                >
                  {!hasEnoughPlayers ? (
                    <>
                      <Users className="w-4 h-4" />
                      {`Need ${MIN_PLAYERS - players.length} more`}
                    </>
                  ) : !allReady ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Waiting...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Start Game
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Middle: Settings */}
          <motion.div variants={fadeIn} className="lg:col-span-1">
            <div className="rounded-xl border border-white/[0.06] bg-[#0c0c14]/70 backdrop-blur-sm overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-lavender/40" />
                <span className="text-[9px] font-mono text-white/20 tracking-wider uppercase">Settings</span>
              </div>
              <div className="p-4">
                <GameSettings onUpdate={updateSettings} disabled={!isHost} />
              </div>
            </div>
          </motion.div>

          {/* Right: Chat */}
          <motion.div variants={fadeIn} className="lg:col-span-1">
            <div className="rounded-xl border border-white/[0.06] bg-[#0c0c14]/70 backdrop-blur-sm overflow-hidden h-full flex flex-col">
              <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-rose/40" />
                <span className="text-[9px] font-mono text-white/20 tracking-wider uppercase">Lobby Chat</span>
              </div>
              <div className="p-3 flex-1 flex flex-col min-h-0">
                <ChatPanel />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
