import { create } from 'zustand';
import { GamePhase, GameMode, GameSettings, Submission, VoteResult } from '@/types/game';
import { PlayerInGame } from '@/types/player';
import { DEFAULT_SETTINGS } from '@/lib/constants';

interface GameState {
  // Connection
  roomCode: string | null;
  isConnected: boolean;

  // Game state
  phase: GamePhase;
  gameMode: GameMode;
  settings: GameSettings;
  currentRound: number;
  totalRounds: number;
  hostId: string | null;

  // Players
  players: PlayerInGame[];

  // Role (private to this player)
  myRole: 'PLAYER' | 'IMPOSTER' | null;
  myPrompt: string | null;

  // Task phase
  submissions: Array<{ playerId: string; content: string }>;
  hasSubmitted: boolean;
  submissionCount: number;
  submissionTotal: number;

  // Turn-based drawing (SKETCH_OFF)
  currentDrawerId: string | null;
  turnNumber: number;
  totalTurns: number;
  turnDuration: number;
  turnTimeRemaining: number;
  turnOrder: string[];
  playerColors: Record<string, string>;

  // Voting phase
  myVote: string | null;

  // Imposter guess (comeback mechanic)
  imposterGuessActive: boolean;
  imposterGuessImposterId: string | null;
  imposterGuessTimeLimit: number;
  imposterGuessResult: { correct: boolean; guess: string; actualPrompt: string; bonusPoints: number } | null;

  // Results
  voteResult: VoteResult | null;
  timeRemaining: number;

  // Actions
  setRoomCode: (code: string | null) => void;
  setConnected: (connected: boolean) => void;
  setPhase: (phase: GamePhase, timeLimit?: number) => void;
  setSettings: (settings: Partial<GameSettings>) => void;
  setHostId: (id: string) => void;
  setPlayers: (players: PlayerInGame[]) => void;
  addPlayer: (player: PlayerInGame) => void;
  removePlayer: (playerId: string) => void;
  updatePlayerReady: (playerId: string, isReady: boolean) => void;
  setRole: (role: 'PLAYER' | 'IMPOSTER', prompt: string | null) => void;
  setSubmissions: (submissions: Array<{ playerId: string; content: string }>) => void;
  setHasSubmitted: (submitted: boolean) => void;
  setSubmissionProgress: (count: number, total: number) => void;
  setTurn: (drawerId: string, turnNumber: number, totalTurns: number, turnDuration: number, turnOrder: string[], playerColors?: Record<string, string>) => void;
  setTurnTimeRemaining: (time: number) => void;
  setMyVote: (votedId: string | null) => void;
  setImposterGuessPhase: (imposterId: string, timeLimit: number) => void;
  setImposterGuessResult: (result: { correct: boolean; guess: string; actualPrompt: string; bonusPoints: number }) => void;
  clearImposterGuess: () => void;
  setVoteResult: (result: VoteResult | null) => void;
  setTimeRemaining: (time: number) => void;
  setCurrentRound: (round: number) => void;
  resetRound: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>()((set) => ({
  roomCode: null,
  isConnected: false,
  phase: GamePhase.WAITING,
  gameMode: GameMode.SKETCH_OFF,
  settings: DEFAULT_SETTINGS,
  currentRound: 0,
  totalRounds: 3,
  hostId: null,
  players: [],
  myRole: null,
  myPrompt: null,
  submissions: [],
  hasSubmitted: false,
  submissionCount: 0,
  submissionTotal: 0,
  currentDrawerId: null,
  turnNumber: 0,
  totalTurns: 0,
  turnDuration: 0,
  turnTimeRemaining: 0,
  turnOrder: [],
  playerColors: {},
  myVote: null,
  imposterGuessActive: false,
  imposterGuessImposterId: null,
  imposterGuessTimeLimit: 0,
  imposterGuessResult: null,
  voteResult: null,
  timeRemaining: 0,

  setRoomCode: (code) => set({ roomCode: code }),
  setConnected: (connected) => set({ isConnected: connected }),
  setPhase: (phase, timeLimit) => set({ phase, ...(timeLimit !== undefined ? { timeRemaining: timeLimit } : {}) }),
  setSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings }, gameMode: settings.gameMode ?? state.gameMode })),
  setHostId: (id) => set({ hostId: id }),
  setPlayers: (players) => set({ players }),
  addPlayer: (player) => set((state) => ({ players: [...state.players, player] })),
  removePlayer: (playerId) => set((state) => ({ players: state.players.filter((p) => p.id !== playerId) })),
  updatePlayerReady: (playerId, isReady) =>
    set((state) => ({
      players: state.players.map((p) => (p.id === playerId ? { ...p, isReady } : p)),
    })),
  setRole: (role, prompt) => set({ myRole: role, myPrompt: prompt }),
  setSubmissions: (submissions) => set({ submissions }),
  setHasSubmitted: (submitted) => set({ hasSubmitted: submitted }),
  setSubmissionProgress: (count, total) => set({ submissionCount: count, submissionTotal: total }),
  setTurn: (drawerId, turnNumber, totalTurns, turnDuration, turnOrder, playerColors) => set((state) => ({ currentDrawerId: drawerId, turnNumber, totalTurns, turnDuration, turnTimeRemaining: turnDuration, turnOrder, playerColors: playerColors ?? state.playerColors })),
  setTurnTimeRemaining: (time) => set({ turnTimeRemaining: time }),
  setMyVote: (votedId) => set({ myVote: votedId }),
  setImposterGuessPhase: (imposterId, timeLimit) => set({ imposterGuessActive: true, imposterGuessImposterId: imposterId, imposterGuessTimeLimit: timeLimit, imposterGuessResult: null }),
  setImposterGuessResult: (result) => set({ imposterGuessResult: result }),
  clearImposterGuess: () => set({ imposterGuessActive: false, imposterGuessImposterId: null, imposterGuessTimeLimit: 0, imposterGuessResult: null }),
  setVoteResult: (result) => set({ voteResult: result }),
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  setCurrentRound: (round) => set({ currentRound: round }),
  resetRound: () =>
    set({
      myRole: null,
      myPrompt: null,
      submissions: [],
      hasSubmitted: false,
      submissionCount: 0,
      submissionTotal: 0,
      currentDrawerId: null,
      turnNumber: 0,
      totalTurns: 0,
      turnDuration: 0,
      turnTimeRemaining: 0,
      turnOrder: [],
      playerColors: {},
      myVote: null,
      imposterGuessActive: false,
      imposterGuessImposterId: null,
      imposterGuessTimeLimit: 0,
      imposterGuessResult: null,
      voteResult: null,
    }),
  resetGame: () =>
    set({
      phase: GamePhase.WAITING,
      currentRound: 0,
      players: [],
      myRole: null,
      myPrompt: null,
      submissions: [],
      hasSubmitted: false,
      myVote: null,
      voteResult: null,
      roomCode: null,
      hostId: null,
    }),
}));
