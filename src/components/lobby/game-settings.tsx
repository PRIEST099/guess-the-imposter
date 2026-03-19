"use client";
import { motion } from "framer-motion";
import { GameMode } from "@/types/game";
import { GAME_MODE_INFO } from "@/lib/constants";
import { useGameStore } from "@/stores/game-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Pencil, PaintBucket, Brain, Camera, ListOrdered, Settings, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

const modeIcons: Record<string, typeof Pencil> = {
  [GameMode.WORD_PLAY]: Pencil,
  [GameMode.SKETCH_OFF]: PaintBucket,
  [GameMode.TRIVIA_TWIST]: Brain,
  [GameMode.CAPTION_CHAOS]: Camera,
  [GameMode.ODD_ONE_OUT]: ListOrdered,
  [GameMode.RANDOM]: Shuffle,
};

const modeIconColors: Record<string, string> = {
  [GameMode.WORD_PLAY]: "text-accent-sky",
  [GameMode.SKETCH_OFF]: "text-accent-rose",
  [GameMode.TRIVIA_TWIST]: "text-accent-lavender",
  [GameMode.CAPTION_CHAOS]: "text-accent-amber",
  [GameMode.ODD_ONE_OUT]: "text-accent-mint",
  [GameMode.RANDOM]: "text-accent-amber",
};

interface GameSettingsProps {
  onUpdate: (settings: Record<string, any>) => void;
  disabled?: boolean;
}

export function GameSettings({ onUpdate, disabled }: GameSettingsProps) {
  const { settings } = useGameStore();

  return (
    <div className="space-y-5">
      {/* Game Mode */}
      <div className="space-y-2">
        <label className="text-[9px] font-mono uppercase tracking-wider text-white/20">Game Mode</label>
        <Select
          value={settings.gameMode}
          onValueChange={(value) => onUpdate({ gameMode: value })}
          disabled={disabled}
        >
          <SelectTrigger className="bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1] transition-colors rounded-lg h-10 text-sm text-white/60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0c0c14] border-white/[0.06] rounded-lg">
            {Object.entries(GAME_MODE_INFO).map(([key, mode]) => {
              const Icon = modeIcons[key];
              return (
                <SelectItem key={key} value={key}>
                  <span className="flex items-center gap-2">
                    {Icon && <Icon className={cn("w-3.5 h-3.5", modeIconColors[key] || "text-accent-sky")} />}
                    <span className="text-sm">{mode.name}</span>
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Rounds */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-[9px] font-mono uppercase tracking-wider text-white/20">Rounds</label>
          <motion.span
            key={settings.totalRounds}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-xs font-mono text-accent-sky"
          >
            {settings.totalRounds}
          </motion.span>
        </div>
        <Slider
          value={[settings.totalRounds]}
          onValueChange={(v) => onUpdate({ totalRounds: Array.isArray(v) ? v[0] : v })}
          min={1}
          max={5}
          step={1}
          disabled={disabled}
          className="[&_[role=slider]]:bg-accent-sky [&_[role=slider]]:border-accent-sky/40"
        />
      </div>

      {/* Task Duration / Turn Timeout */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-[9px] font-mono uppercase tracking-wider text-white/20">
            {settings.gameMode === GameMode.SKETCH_OFF ? "Turn Timeout" : "Task Time"}
          </label>
          <motion.span
            key={settings.taskDuration}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-xs font-mono text-accent-sky"
          >
            {settings.taskDuration}s
          </motion.span>
        </div>
        <Slider
          value={[settings.taskDuration]}
          onValueChange={(v) => onUpdate({ taskDuration: Array.isArray(v) ? v[0] : v })}
          min={settings.gameMode === GameMode.SKETCH_OFF ? 10 : 30}
          max={settings.gameMode === GameMode.SKETCH_OFF ? 60 : 120}
          step={settings.gameMode === GameMode.SKETCH_OFF ? 5 : 10}
          disabled={disabled}
          className="[&_[role=slider]]:bg-accent-sky [&_[role=slider]]:border-accent-sky/40"
        />
      </div>

      {/* Turns Per Round (SKETCH_OFF only) */}
      {(settings.gameMode === GameMode.SKETCH_OFF || settings.gameMode === GameMode.RANDOM) && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[9px] font-mono uppercase tracking-wider text-white/20">Turns Per Round</label>
            <motion.span
              key={settings.turnsPerRound}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-xs font-mono text-accent-sky"
            >
              {settings.turnsPerRound || 1}
            </motion.span>
          </div>
          <Slider
            value={[settings.turnsPerRound || 1]}
            onValueChange={(v) => onUpdate({ turnsPerRound: Array.isArray(v) ? v[0] : v })}
            min={1}
            max={3}
            step={1}
            disabled={disabled}
            className="[&_[role=slider]]:bg-accent-sky [&_[role=slider]]:border-accent-sky/40"
          />
          <p className="text-[9px] text-white/15 font-mono tracking-wide">
            How many times each player draws per round
          </p>
        </div>
      )}

      {/* Discussion Duration */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-[9px] font-mono uppercase tracking-wider text-white/20">Discussion Time</label>
          <motion.span
            key={settings.discussionDuration}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-xs font-mono text-accent-sky"
          >
            {settings.discussionDuration}s
          </motion.span>
        </div>
        <Slider
          value={[settings.discussionDuration]}
          onValueChange={(v) => onUpdate({ discussionDuration: Array.isArray(v) ? v[0] : v })}
          min={30}
          max={180}
          step={10}
          disabled={disabled}
          className="[&_[role=slider]]:bg-accent-sky [&_[role=slider]]:border-accent-sky/40"
        />
      </div>
    </div>
  );
}
