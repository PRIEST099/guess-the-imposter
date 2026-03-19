import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  roundsPlayed: number;
  timesImposter: number;
  timesImposterSurvived: number;
  correctVotes: number;
  totalVotes: number;
  totalScore: number;
  highestScore: number;
  imposterGuessesCorrect: number;
  imposterGuessesTotal: number;
  currentStreak: number;
  bestStreak: number;
  lastPlayedAt: number | null;
}

interface StatsState extends PlayerStats {
  // Actions
  recordGamePlayed: (won: boolean, score: number) => void;
  recordRound: (wasImposter: boolean, imposterSurvived: boolean, votedCorrectly: boolean) => void;
  recordImposterGuess: (correct: boolean) => void;
  resetStats: () => void;
}

const defaultStats: PlayerStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  roundsPlayed: 0,
  timesImposter: 0,
  timesImposterSurvived: 0,
  correctVotes: 0,
  totalVotes: 0,
  totalScore: 0,
  highestScore: 0,
  imposterGuessesCorrect: 0,
  imposterGuessesTotal: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastPlayedAt: null,
};

export const useStatsStore = create<StatsState>()(
  persist(
    (set) => ({
      ...defaultStats,

      recordGamePlayed: (won, score) =>
        set((state) => {
          const newStreak = won ? state.currentStreak + 1 : 0;
          return {
            gamesPlayed: state.gamesPlayed + 1,
            gamesWon: state.gamesWon + (won ? 1 : 0),
            totalScore: state.totalScore + score,
            highestScore: Math.max(state.highestScore, score),
            currentStreak: newStreak,
            bestStreak: Math.max(state.bestStreak, newStreak),
            lastPlayedAt: Date.now(),
          };
        }),

      recordRound: (wasImposter, imposterSurvived, votedCorrectly) =>
        set((state) => ({
          roundsPlayed: state.roundsPlayed + 1,
          timesImposter: state.timesImposter + (wasImposter ? 1 : 0),
          timesImposterSurvived: state.timesImposterSurvived + (wasImposter && imposterSurvived ? 1 : 0),
          correctVotes: state.correctVotes + (!wasImposter && votedCorrectly ? 1 : 0),
          totalVotes: state.totalVotes + (!wasImposter ? 1 : 0),
        })),

      recordImposterGuess: (correct) =>
        set((state) => ({
          imposterGuessesCorrect: state.imposterGuessesCorrect + (correct ? 1 : 0),
          imposterGuessesTotal: state.imposterGuessesTotal + 1,
        })),

      resetStats: () => set(defaultStats),
    }),
    {
      name: 'imposter-stats',
    }
  )
);
