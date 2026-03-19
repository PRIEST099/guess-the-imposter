"use client";
import { motion } from "framer-motion";
import { useStatsStore } from "@/stores/stats-store";
import { GlassCard } from "@/components/shared/glass-card";
import {
  Trophy, Target, Eye, Flame, Gamepad2,
  TrendingUp, Award, Brain, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatItemProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  delay?: number;
}

function StatItem({ label, value, icon, color = "text-accent-sky", delay = 0 }: StatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
    >
      <div className={cn("shrink-0", color)}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-white/25 font-mono uppercase tracking-wider truncate">{label}</p>
        <p className={cn("text-sm font-bold font-mono", color)}>{value}</p>
      </div>
    </motion.div>
  );
}

export function PlayerStats({ compact = false }: { compact?: boolean }) {
  const stats = useStatsStore();

  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;

  const voteAccuracy = stats.totalVotes > 0
    ? Math.round((stats.correctVotes / stats.totalVotes) * 100)
    : 0;

  const imposterSurvivalRate = stats.timesImposter > 0
    ? Math.round((stats.timesImposterSurvived / stats.timesImposter) * 100)
    : 0;

  if (stats.gamesPlayed === 0) {
    return (
      <GlassCard className="p-5 text-center">
        <BarChart3 className="w-8 h-8 text-white/[0.06] mx-auto mb-2" />
        <p className="text-xs text-white/20 font-mono">No stats yet</p>
        <p className="text-[10px] text-white/10 mt-1">Play a game to start tracking!</p>
      </GlassCard>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-xs font-mono">
        <span className="flex items-center gap-1 text-accent-sky">
          <Gamepad2 className="w-3 h-3" />
          {stats.gamesPlayed} games
        </span>
        <span className="flex items-center gap-1 text-accent-mint">
          <Trophy className="w-3 h-3" />
          {winRate}% wins
        </span>
        {stats.bestStreak > 0 && (
          <span className="flex items-center gap-1 text-accent-amber">
            <Flame className="w-3 h-3" />
            {stats.bestStreak} streak
          </span>
        )}
      </div>
    );
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-accent-lavender" />
        <h3 className="font-[family-name:var(--font-outfit)] font-semibold text-white/85 text-sm">
          Your Stats
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatItem
          label="Games Played"
          value={stats.gamesPlayed}
          icon={<Gamepad2 className="w-4 h-4" />}
          color="text-accent-sky"
          delay={0}
        />
        <StatItem
          label="Win Rate"
          value={`${winRate}%`}
          icon={<Trophy className="w-4 h-4" />}
          color="text-accent-mint"
          delay={0.05}
        />
        <StatItem
          label="Vote Accuracy"
          value={`${voteAccuracy}%`}
          icon={<Target className="w-4 h-4" />}
          color="text-accent-lavender"
          delay={0.1}
        />
        <StatItem
          label="Imposter Survival"
          value={`${imposterSurvivalRate}%`}
          icon={<Eye className="w-4 h-4" />}
          color="text-accent-rose"
          delay={0.15}
        />
        <StatItem
          label="Best Streak"
          value={stats.bestStreak}
          icon={<Flame className="w-4 h-4" />}
          color="text-accent-amber"
          delay={0.2}
        />
        <StatItem
          label="High Score"
          value={stats.highestScore}
          icon={<Award className="w-4 h-4" />}
          color="text-accent-sky"
          delay={0.25}
        />
        <StatItem
          label="Total Score"
          value={stats.totalScore}
          icon={<TrendingUp className="w-4 h-4" />}
          color="text-white/50"
          delay={0.3}
        />
        {stats.imposterGuessesTotal > 0 && (
          <StatItem
            label="Prompt Guesses"
            value={`${stats.imposterGuessesCorrect}/${stats.imposterGuessesTotal}`}
            icon={<Brain className="w-4 h-4" />}
            color="text-accent-lavender"
            delay={0.35}
          />
        )}
      </div>
    </GlassCard>
  );
}
