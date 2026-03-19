"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSocket } from "@/hooks/use-socket";
import { AnimatedBackground } from "@/components/shared/animated-background";
import { GlassCard } from "@/components/shared/glass-card";
import { GlassButton } from "@/components/shared/glass-button";
import { GradientText } from "@/components/ui/gradient-text";
import { ArrowLeft, Globe, Users, Loader2, RefreshCw, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PublicLobby {
  code: string;
  name: string;
  icon: string;
  playerCount: number;
  status: string;
  maxPlayers: number;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const fadeIn = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 100, damping: 15 } },
};

const statusColors: Record<string, { text: string; bg: string; dot: string }> = {
  LOBBY: { text: "text-accent-mint", bg: "bg-accent-mint/10", dot: "bg-accent-mint" },
  IN_PROGRESS: { text: "text-accent-amber", bg: "bg-accent-amber/10", dot: "bg-accent-amber" },
  FINISHED: { text: "text-accent-rose", bg: "bg-accent-rose/10", dot: "bg-accent-rose" },
};

const statusLabels: Record<string, string> = {
  LOBBY: "Open",
  IN_PROGRESS: "In Game",
  FINISHED: "Finishing",
};

export default function PublicLobbiesPage() {
  const router = useRouter();
  const socket = useSocket();
  const [lobbies, setLobbies] = useState<PublicLobby[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLobbies = useCallback(() => {
    setLoading(true);
    socket.emit("lobbies:list");
  }, [socket]);

  useEffect(() => {
    socket.on("lobbies:list", (data: PublicLobby[]) => {
      setLobbies(data);
      setLoading(false);
    });

    if (socket.connected) {
      fetchLobbies();
    }

    socket.on("connect", fetchLobbies);

    // Refresh every 5 seconds
    const interval = setInterval(fetchLobbies, 5000);

    return () => {
      socket.off("lobbies:list");
      socket.off("connect", fetchLobbies);
      clearInterval(interval);
    };
  }, [socket, fetchLobbies]);

  const joinLobby = (code: string) => {
    router.push(`/lobby/${code}`);
  };

  return (
    <main className="relative min-h-screen bg-[#0c0c14] overflow-hidden">
      <AnimatedBackground variant="default" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 p-4 sm:p-6 md:p-8 max-w-3xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={fadeIn} className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="text-muted-foreground hover:text-accent-sky hover:bg-accent-sky/[0.06] transition-colors duration-400"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </motion.div>

        {/* Title */}
        <motion.div variants={fadeIn} className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Globe className="w-7 h-7 text-accent-lavender" />
            <h1 className="font-[family-name:var(--font-outfit)] text-3xl sm:text-4xl font-bold">
              <GradientText
                colors={["#c4b5fd", "#7dd3fc", "#c4b5fd", "#fda4af", "#c4b5fd"]}
                animationSpeed={4}
              >
                Public Lobbies
              </GradientText>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Join a lobby and play with people worldwide. No room code needed!
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchLobbies}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-white/25 hover:text-accent-sky/60 transition-colors font-mono"
          >
            <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
            Refresh
          </motion.button>
        </motion.div>

        {/* Lobby Cards */}
        <div className="space-y-4">
          {loading && lobbies.length === 0 ? (
            <motion.div variants={fadeIn} className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-accent-sky/30 animate-spin" />
            </motion.div>
          ) : (
            lobbies.map((lobby, index) => {
              const status = statusColors[lobby.status] || statusColors.LOBBY;
              const statusLabel = statusLabels[lobby.status] || lobby.status;
              const canJoin = lobby.status === "LOBBY" && lobby.playerCount < lobby.maxPlayers;
              const isFull = lobby.playerCount >= lobby.maxPlayers;

              return (
                <motion.div
                  key={lobby.code}
                  variants={fadeIn}
                  custom={index}
                >
                  <GlassCard
                    variant={canJoin ? "interactive" : "default"}
                    glow={canJoin && lobby.playerCount > 0 ? "#c4b5fd" : false}
                    className={cn(
                      "p-5 sm:p-6 transition-all duration-300",
                      !canJoin && "opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <motion.div
                        animate={canJoin ? { y: [0, -3, 0] } : {}}
                        transition={canJoin ? { duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 } : {}}
                        className="text-3xl sm:text-4xl shrink-0"
                      >
                        {lobby.icon}
                      </motion.div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-[family-name:var(--font-outfit)] text-lg sm:text-xl font-bold text-white/90 mb-1">
                          {lobby.name}
                        </h3>
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Player count */}
                          <div className="flex items-center gap-1.5 text-sm">
                            <Users className="w-3.5 h-3.5 text-accent-sky/60" />
                            <span className="font-mono">
                              <span className="text-accent-sky font-bold">{lobby.playerCount}</span>
                              <span className="text-white/15 mx-0.5">/</span>
                              <span className="text-white/30">{lobby.maxPlayers}</span>
                            </span>
                          </div>
                          {/* Status badge */}
                          <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider", status.bg)}>
                            <motion.div
                              animate={lobby.status === "LOBBY" ? { scale: [1, 1.3, 1] } : {}}
                              transition={{ duration: 2, repeat: Infinity }}
                              className={cn("w-1.5 h-1.5 rounded-full", status.dot)}
                            />
                            <span className={status.text}>{statusLabel}</span>
                          </div>
                          {/* Game mode */}
                          <span className="text-[10px] font-mono text-white/15 flex items-center gap-1">
                            <Gamepad2 className="w-3 h-3" />
                            Random Mode
                          </span>
                        </div>
                      </div>

                      {/* Join button */}
                      <div className="shrink-0">
                        {canJoin ? (
                          <GlassButton
                            variant="lavender"
                            size="md"
                            onClick={() => joinLobby(lobby.code)}
                          >
                            Join
                          </GlassButton>
                        ) : isFull ? (
                          <span className="text-xs text-accent-rose/50 font-mono">Full</span>
                        ) : (
                          <span className="text-xs text-accent-amber/50 font-mono">In Game</span>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </main>
  );
}
