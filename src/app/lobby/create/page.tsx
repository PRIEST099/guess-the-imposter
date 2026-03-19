"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLobby } from "@/hooks/use-lobby";
import { useGameStore } from "@/stores/game-store";
import { usePlayerStore } from "@/stores/player-store";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import { useSocket } from "@/hooks/use-socket";
import { motion } from "framer-motion";
import { Gamepad2 } from "lucide-react";
import { GradientOrb } from "@/components/shared/gradient-orb";

export default function CreateLobbyPage() {
  const router = useRouter();
  const socket = useSocket();
  const { createGame } = useLobby();
  const { roomCode } = useGameStore();
  const { playerId } = usePlayerStore();
  const created = useRef(false);
  const redirecting = useRef(false);

  // Listen for lobby:created event (persistent, not dependent on other state)
  useEffect(() => {
    const handleCreated = (data: { roomCode: string }) => {
      if (!redirecting.current) {
        redirecting.current = true;
        router.replace(`/lobby/${data.roomCode}`);
      }
    };

    socket.on("lobby:created", handleCreated);
    return () => { socket.off("lobby:created", handleCreated); };
  }, [socket, router]);

  // Wait for auth to complete (playerId set) before creating game
  useEffect(() => {
    if (!created.current && socket.connected && playerId) {
      created.current = true;
      createGame(DEFAULT_SETTINGS);
    }
  }, [socket.connected, playerId, createGame]);

  // If already have a room code from the store, redirect
  useEffect(() => {
    if (roomCode && !redirecting.current) {
      redirecting.current = true;
      router.replace(`/lobby/${roomCode}`);
    }
  }, [roomCode, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c14] relative overflow-hidden">
      {/* Ambient gradient orbs */}
      <GradientOrb colors={["#7dd3fc", "#c4b5fd"]} size={400} position="top-left" speed="slow" />
      <GradientOrb colors={["#fda4af", "#c4b5fd"]} size={300} position="bottom-right" speed="medium" />

      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
        className="relative z-10 text-center space-y-6"
      >
        {/* Animated spinner */}
        <div className="relative w-20 h-20 mx-auto">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-accent-sky/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-1 rounded-full border-2 border-transparent border-t-accent-lavender"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-transparent border-b-accent-rose"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Gamepad2 className="w-6 h-6 text-accent-sky" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-[family-name:var(--font-outfit)] text-lg font-semibold text-white/80"
          >
            Creating Game
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-1"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-accent-sky"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
