"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCanvas } from "@/hooks/use-canvas";
import { useGameStore } from "@/stores/game-store";
import { usePlayerStore } from "@/stores/player-store";
import { useSocket } from "@/hooks/use-socket";
import { setCanvasResetCallback } from "@/hooks/use-game";
import { Check, Eye, Clock, Paintbrush, AlertTriangle, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/shared/glass-card";
import { GlassButton } from "@/components/shared/glass-button";
import { SKETCH_BRUSH_WIDTH } from "@/lib/constants";
import type { CanvasStroke } from "@/types/socket-events";

interface SketchCanvasProps {
  onStroke: (stroke: CanvasStroke) => void;
  onEndTurn: () => void;
}

export function SketchCanvas({ onStroke, onEndTurn }: SketchCanvasProps) {
  const socket = useSocket();
  const myPrompt = useGameStore((s) => s.myPrompt);
  const myRole = useGameStore((s) => s.myRole);
  const currentDrawerId = useGameStore((s) => s.currentDrawerId);
  const turnNumber = useGameStore((s) => s.turnNumber);
  const totalTurns = useGameStore((s) => s.totalTurns);
  const turnTimeRemaining = useGameStore((s) => s.turnTimeRemaining);
  const players = useGameStore((s) => s.players);
  const playerColors = useGameStore((s) => s.playerColors);
  const { playerId } = usePlayerStore();
  const isImposter = myRole === "IMPOSTER";
  const isMyTurn = currentDrawerId === playerId;
  const isTurnBased = totalTurns > 0;

  // Get auto-assigned color for this player
  const myColor = playerId ? (playerColors[playerId] || "#7dd3fc") : "#7dd3fc";

  // Find the current drawer's info
  const currentDrawer = players.find((p) => p.id === currentDrawerId);
  const currentDrawerName = currentDrawer?.nickname || "Someone";
  const currentDrawerColor = currentDrawerId ? (playerColors[currentDrawerId] || "#7dd3fc") : "#7dd3fc";

  const {
    canvasRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    addExternalStroke,
    clearAll,
  } = useCanvas({
    width: 500,
    height: 400,
    onStroke,
    readOnly: isTurnBased && !isMyTurn,
    assignedColor: myColor,
    fixedBrushWidth: SKETCH_BRUSH_WIDTH,
  });

  // Register canvas reset callback for round-start clearing
  useEffect(() => {
    setCanvasResetCallback(clearAll);
    return () => setCanvasResetCallback(null);
  }, [clearAll]);

  // Listen for other players' strokes (persist across turns — no clearing!)
  useEffect(() => {
    const handleStroke = (data: { playerId: string; stroke: CanvasStroke }) => {
      if (data.playerId !== playerId) {
        addExternalStroke(data.stroke);
      }
    };

    socket.on("task:canvas-stroke", handleStroke);

    return () => {
      socket.off("task:canvas-stroke", handleStroke);
    };
  }, [socket, playerId, addExternalStroke]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-4"
    >
      {/* Canvas card with header */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0c0c14]/70 backdrop-blur-sm overflow-hidden">
        {/* Header bar */}
        <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#7dd3fc]" style={{ boxShadow: "0 0 6px #7dd3fc60" }} />
            <span className="font-mono text-[9px] tracking-wider uppercase text-white/20">
              Canvas — Live
            </span>
          </div>
          {isTurnBased && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] tracking-wider uppercase text-white/20">
                Turn {turnNumber}/{totalTurns}
              </span>
              <span className={cn(
                "font-mono text-xs font-bold",
                turnTimeRemaining <= 5 ? "text-[#fda4af]" : turnTimeRemaining <= 10 ? "text-amber-400" : "text-[#7dd3fc]"
              )}>
                {turnTimeRemaining}s
              </span>
            </div>
          )}
        </div>

        {/* Turn indicator */}
        {isTurnBased && (
          <div className="px-4 py-3 border-b border-white/[0.04]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentDrawerId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center gap-2"
              >
                {isMyTurn ? (
                  <>
                    <Paintbrush className="w-3.5 h-3.5 text-[#7dd3fc]" />
                    <span className="font-mono text-[10px] tracking-wider uppercase text-[#7dd3fc]">
                      Your turn to draw
                    </span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-white/30" />
                    <span className="font-mono text-[10px] tracking-wider uppercase text-white/30">
                      <span style={{ color: currentDrawerColor }}>{currentDrawerName}</span> is drawing
                    </span>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Player color legend */}
            <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
              {players.filter(p => playerColors[p.id]).map((p) => (
                <div key={p.id} className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      p.id === currentDrawerId && "scale-125 ring-1 ring-white/30"
                    )}
                    style={{ backgroundColor: playerColors[p.id] }}
                  />
                  <span className={cn(
                    "font-mono text-[9px] tracking-wider uppercase",
                    p.id === currentDrawerId ? "text-white/50" : "text-white/20"
                  )}>
                    {p.nickname.slice(0, 8)}
                  </span>
                </div>
              ))}
            </div>

            {/* Turn progress dots */}
            <div className="flex items-center justify-center gap-1.5 mt-2">
              {Array.from({ length: totalTurns }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-400",
                    i + 1 < turnNumber
                      ? "bg-[#7dd3fc]/50"
                      : i + 1 === turnNumber
                        ? "bg-[#7dd3fc]"
                        : "bg-white/[0.08]"
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Prompt chip floating at top of canvas area */}
        <div className="relative">
          {/* Prompt chip */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
            {isImposter ? (
              <div className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-[#fda4af]/70" />
                <span className="font-mono text-[9px] tracking-wider uppercase text-[#fda4af]/60">Imposter — Blend In</span>
              </div>
            ) : (
              <div className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center gap-2">
                <Palette className="w-3 h-3 text-[#fda4af]/70" />
                <span className="font-mono text-[9px] tracking-wider uppercase text-white/30">Draw:</span>
                <span className="font-[family-name:var(--font-outfit)] text-sm font-semibold text-[#fda4af]">{myPrompt}</span>
              </div>
            )}
          </div>

          {/* Canvas */}
          <div className="p-2 bg-[#08080f]">
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className={cn(
                "w-full rounded-lg bg-[#08080f]",
                isTurnBased && !isMyTurn
                  ? "cursor-default"
                  : "cursor-crosshair"
              )}
              style={{
                touchAction: "none",
                aspectRatio: "5/4",
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            {/* Your color indicator while drawing */}
            {isTurnBased && isMyTurn && (
              <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: myColor, boxShadow: `0 0 6px ${myColor}60` }}
                />
                <span className="font-mono text-[9px] tracking-wider uppercase text-white/20">Your color</span>
              </div>
            )}

            {/* Overlay when it's not your turn */}
            {isTurnBased && !isMyTurn && (
              <div className="absolute inset-2 rounded-lg flex items-end justify-center pb-4 pointer-events-none">
                <div className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                  <p className="font-mono text-[10px] tracking-wider uppercase text-white/25">
                    <Eye className="w-3 h-3 inline mr-1.5 -mt-0.5" />
                    Watching {currentDrawerName} draw
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Done button */}
      {isTurnBased && isMyTurn && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
        >
          <button
            onClick={onEndTurn}
            className="px-6 py-2 rounded-lg border border-[#7dd3fc]/20 bg-transparent text-[#7dd3fc] font-mono text-xs tracking-wider uppercase hover:bg-[#7dd3fc]/[0.06] transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Done Drawing
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
