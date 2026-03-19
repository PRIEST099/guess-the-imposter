import { GameMode, GamePhase, GameSettings, Submission, VoteResult } from './game';
import { Player, PlayerInGame } from './player';

// Client → Server events
export interface ClientToServerEvents {
  // Lobby
  'lobby:create': (data: { settings: GameSettings }) => void;
  'lobby:join': (data: { roomCode: string }) => void;
  'lobby:leave': () => void;
  'lobby:ready': (data: { isReady: boolean }) => void;
  'lobby:settings-update': (data: Partial<GameSettings>) => void;
  'lobby:kick': (data: { playerId: string }) => void;
  // Auth
  'auth:register': (data: { nickname: string; avatarId: string; sessionId?: string }) => void;
  // Game
  'game:start': () => void;
  'game:rematch': () => void;
  // Tasks
  'task:submit-word': (data: { text: string }) => void;
  'task:canvas-stroke': (data: { stroke: CanvasStroke }) => void;
  'task:turn-done': () => void;
  'task:submit-trivia': (data: { answer: string }) => void;
  'task:submit-caption': (data: { caption: string }) => void;
  'task:submit-ranking': (data: { ranking: string[] }) => void;
  // Chat
  'chat:message': (data: { text: string }) => void;
  // Voting
  'vote:cast': (data: { votedPlayerId: string }) => void;
  // Imposter guess
  'imposter:guess-prompt': (data: { guess: string }) => void;
  // Public lobbies
  'lobbies:list': () => void;
  // Reconnection
  'player:reconnect': (data: { sessionId: string; roomCode: string }) => void;
}

// Server → Client events
export interface ServerToClientEvents {
  // Auth
  'auth:registered': (data: { player: Player }) => void;
  // Lobby
  'lobby:created': (data: { roomCode: string }) => void;
  'lobby:joined': (data: { game: { roomCode: string; settings: GameSettings; players: PlayerInGame[]; hostId: string } }) => void;
  'lobby:player-joined': (data: { player: PlayerInGame; playerCount: number }) => void;
  'lobby:player-left': (data: { playerId: string; newHostId?: string }) => void;
  'lobby:ready-update': (data: { playerId: string; isReady: boolean }) => void;
  'lobby:settings-changed': (data: { settings: GameSettings }) => void;
  'lobby:kicked': (data: { reason: string }) => void;
  // Game
  'game:phase-change': (data: { phase: GamePhase; roundNumber: number; timeLimit: number }) => void;
  'game:role-assigned': (data: { role: 'PLAYER' | 'IMPOSTER'; prompt: string }) => void;
  'game:round-start': (data: { roundNumber: number; gameMode?: string }) => void;
  // Tasks
  'task:all-submitted': (data: { submissions: Array<{ playerId: string; content: string }> }) => void;
  'task:submission-count': (data: { count: number; total: number }) => void;
  'task:canvas-stroke': (data: { playerId: string; stroke: CanvasStroke }) => void;
  'task:canvas-reset': () => void;
  // Turn-based drawing
  'task:turn-start': (data: { drawerId: string; turnNumber: number; totalTurns: number; turnDuration: number; turnOrder: string[]; playerColors?: Record<string, string> }) => void;
  'task:turn-timer': (data: { secondsRemaining: number }) => void;
  // Chat
  'chat:message': (data: { playerId: string; nickname: string; text: string; timestamp: number }) => void;
  // Voting
  'vote:cast-ack': (data: { success: boolean }) => void;
  'vote:results': (data: VoteResult) => void;
  // Imposter guess
  'imposter:guess-phase': (data: { imposterId: string; timeLimit: number }) => void;
  'imposter:guess-result': (data: { correct: boolean; guess: string; actualPrompt: string; bonusPoints: number }) => void;
  // Timer
  'timer:sync': (data: { secondsRemaining: number }) => void;
  // Game end
  'game:ended': (data: { finalScores: Record<string, number>; winner: 'PLAYERS' | 'IMPOSTER' }) => void;
  'game:rematch-started': (data: { roomCode: string }) => void;
  // Reconnection
  'player:reconnected': (data: { fullGameState: any }) => void;
  // Public lobbies
  'lobbies:list': (data: Array<{ code: string; name: string; icon: string; playerCount: number; status: string; maxPlayers: number }>) => void;
  // Errors
  'error': (data: { code: string; message: string }) => void;
}

export interface CanvasStroke {
  points: Array<{ x: number; y: number; pressure?: number }>;
  color: string;
  width: number;
  tool: 'pen' | 'eraser';
}
