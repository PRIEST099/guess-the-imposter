import { PlayerInGame } from './player';

export enum GameStatus { LOBBY = 'LOBBY', IN_PROGRESS = 'IN_PROGRESS', FINISHED = 'FINISHED' }
export enum GameMode { WORD_PLAY = 'WORD_PLAY', SKETCH_OFF = 'SKETCH_OFF', TRIVIA_TWIST = 'TRIVIA_TWIST', CAPTION_CHAOS = 'CAPTION_CHAOS', ODD_ONE_OUT = 'ODD_ONE_OUT', RANDOM = 'RANDOM' }
export enum GamePhase { WAITING = 'WAITING', ROLE_REVEAL = 'ROLE_REVEAL', TASK = 'TASK', DISCUSSION = 'DISCUSSION', VOTING = 'VOTING', ROUND_RESULTS = 'ROUND_RESULTS', GAME_OVER = 'GAME_OVER' }
export enum PlayerRole { PLAYER = 'PLAYER', IMPOSTER = 'IMPOSTER' }

export interface GameSettings {
  gameMode: GameMode;
  maxPlayers: number;
  totalRounds: number;
  taskDuration: number; // seconds (per-turn inactivity timeout in SKETCH_OFF)
  discussionDuration: number;
  votingDuration: number;
  turnsPerRound: number; // how many full cycles through all players per round (SKETCH_OFF)
}

export interface Game {
  id: string;
  roomCode: string;
  status: GameStatus;
  settings: GameSettings;
  hostId: string;
  currentRound: number;
  currentPhase: GamePhase;
  players: PlayerInGame[];
  createdAt: string;
}

export interface RoundData {
  roundNumber: number;
  normalPrompt: string;
  imposterPrompt: string;
  imposterId: string;
  submissions: Submission[];
  votes: Record<string, string>; // voterId -> votedId
}

export interface Submission {
  playerId: string;
  content: string; // text or JSON canvas data
  submittedAt: number;
}

export interface VoteResult {
  votes: Record<string, string>;
  voteCounts: Record<string, number>;
  eliminatedId: string | null;
  imposterWasFound: boolean;
  imposterId: string;
  scores: Record<string, number>;
}
