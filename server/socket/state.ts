import { nanoid } from 'nanoid';
import { generateRoomCode } from '../../src/lib/room-code';

export interface ServerPlayer {
  id: string;
  nickname: string;
  avatarId: string;
  sessionId: string;
  socketId: string;
  score: number;
  isReady: boolean;
  isOnline: boolean;
}

export interface ServerGameState {
  id: string;
  roomCode: string;
  status: 'LOBBY' | 'IN_PROGRESS' | 'FINISHED';
  hostId: string;
  settings: {
    gameMode: string;
    maxPlayers: number;
    totalRounds: number;
    taskDuration: number;
    discussionDuration: number;
    votingDuration: number;
    turnsPerRound: number;
  };
  currentRound: number;
  currentPhase: string;
  players: ServerPlayer[];
  rounds: ServerRoundState[];
  phaseTimer: NodeJS.Timeout | null;
  timerInterval: NodeJS.Timeout | null;
  timeRemaining: number;
  // Turn-based drawing (SKETCH_OFF)
  turnOrder: string[];       // Randomized player IDs for turn order
  currentTurnIndex: number;  // Index into turnOrder
  turnTimer: NodeJS.Timeout | null;
  turnInterval: NodeJS.Timeout | null;
  playerColors: Record<string, string>;  // Auto-assigned colors per player (SKETCH_OFF)
  // Imposter guess phase
  imposterGuessTimer: NodeJS.Timeout | null;
  imposterGuessResolved: boolean;
}

export interface ServerRoundState {
  roundNumber: number;
  normalPrompt: string;
  imposterPrompt: string;
  imposterId: string;
  submissions: Map<string, { content: string; submittedAt: number }>;
  votes: Map<string, string>;
  isVotingLocked: boolean;
}

export const PUBLIC_LOBBY_CODES = ['PUBLIC1', 'PUBLIC2', 'PUBLIC3', 'PUBLIC4', 'PUBLIC5'] as const;

export const PUBLIC_LOBBY_THEMES: Record<string, { name: string; icon: string }> = {
  PUBLIC1: { name: 'Cosmic Arena', icon: '🌌' },
  PUBLIC2: { name: 'Neon Lounge', icon: '💜' },
  PUBLIC3: { name: 'Shadow Den', icon: '🕵️' },
  PUBLIC4: { name: 'Pixel Palace', icon: '🎮' },
  PUBLIC5: { name: 'Crystal Hub', icon: '💎' },
};

export class GameStateManager {
  private games: Map<string, ServerGameState> = new Map();
  private playerToRoom: Map<string, string> = new Map();
  private sessionToPlayer: Map<string, ServerPlayer> = new Map();

  registerPlayer(socketId: string, nickname: string, avatarId: string, existingSessionId?: string): ServerPlayer {
    // If this session already exists, reconnect with same player
    if (existingSessionId && this.sessionToPlayer.has(existingSessionId)) {
      const existing = this.sessionToPlayer.get(existingSessionId)!;
      existing.socketId = socketId;
      existing.nickname = nickname;
      existing.avatarId = avatarId;
      existing.isOnline = true;
      return existing;
    }

    // Check if this socketId already has a registered player (duplicate auth:register call)
    for (const player of this.sessionToPlayer.values()) {
      if (player.socketId === socketId) {
        player.nickname = nickname;
        player.avatarId = avatarId;
        player.isOnline = true;
        return player;
      }
    }

    const player: ServerPlayer = {
      id: nanoid(12),
      nickname,
      avatarId,
      sessionId: existingSessionId || nanoid(16),
      socketId,
      score: 0,
      isReady: false,
      isOnline: true,
    };
    this.sessionToPlayer.set(player.sessionId, player);
    return player;
  }

  reconnectPlayer(sessionId: string, newSocketId: string): ServerPlayer | null {
    const player = this.sessionToPlayer.get(sessionId);
    if (player) {
      player.socketId = newSocketId;
      player.isOnline = true;
      return player;
    }
    return null;
  }

  createGame(hostId: string, settings: ServerGameState['settings']): ServerGameState {
    let roomCode: string;
    do {
      roomCode = generateRoomCode();
    } while (this.games.has(roomCode));

    const game: ServerGameState = {
      id: nanoid(12),
      roomCode,
      status: 'LOBBY',
      hostId,
      settings,
      currentRound: 0,
      currentPhase: 'WAITING',
      players: [],
      rounds: [],
      phaseTimer: null,
      timerInterval: null,
      timeRemaining: 0,
      turnOrder: [],
      currentTurnIndex: 0,
      turnTimer: null,
      turnInterval: null,
      playerColors: {},
      imposterGuessTimer: null,
      imposterGuessResolved: false,
    };

    this.games.set(roomCode, game);
    return game;
  }

  getGame(roomCode: string): ServerGameState | undefined {
    return this.games.get(roomCode);
  }

  listGameRooms(): string[] {
    return Array.from(this.games.keys());
  }

  addPlayerToGame(roomCode: string, player: ServerPlayer): boolean {
    const game = this.games.get(roomCode);
    if (!game) return false;
    if (game.players.length >= game.settings.maxPlayers) return false;
    if (game.status !== 'LOBBY') return false;
    if (game.players.find(p => p.id === player.id)) return false;

    game.players.push(player);
    this.playerToRoom.set(player.id, roomCode);
    return true;
  }

  removePlayer(roomCode: string, playerId: string): void {
    const game = this.games.get(roomCode);
    if (!game) return;

    game.players = game.players.filter(p => p.id !== playerId);
    this.playerToRoom.delete(playerId);

    // If host left, assign new host
    if (game.hostId === playerId && game.players.length > 0) {
      game.hostId = game.players[0].id;
    }

    // If no players left, delete the game
    if (game.players.length === 0) {
      if (game.phaseTimer) clearTimeout(game.phaseTimer);
      if (game.timerInterval) clearInterval(game.timerInterval);
      this.games.delete(roomCode);
    }
  }

  setPlayerOnline(roomCode: string, playerId: string, isOnline: boolean): void {
    const game = this.games.get(roomCode);
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (player) player.isOnline = isOnline;
  }

  setPlayerReady(roomCode: string, playerId: string, isReady: boolean): void {
    const game = this.games.get(roomCode);
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (player) player.isReady = isReady;
  }

  getPlayerRoom(playerId: string): string | undefined {
    return this.playerToRoom.get(playerId);
  }

  setPlayerRoom(playerId: string, roomCode: string): void {
    this.playerToRoom.set(playerId, roomCode);
  }

  updateSettings(roomCode: string, settings: Partial<ServerGameState['settings']>): void {
    const game = this.games.get(roomCode);
    if (!game) return;
    game.settings = { ...game.settings, ...settings };
  }

  getCurrentRound(roomCode: string): ServerRoundState | undefined {
    const game = this.games.get(roomCode);
    if (!game) return;
    return game.rounds[game.currentRound - 1];
  }

  getPlayerBySocketId(socketId: string): ServerPlayer | undefined {
    for (const player of this.sessionToPlayer.values()) {
      if (player.socketId === socketId) return player;
    }
    return undefined;
  }

  initPublicLobbies(): void {
    for (const code of PUBLIC_LOBBY_CODES) {
      if (this.games.has(code)) continue;
      const game: ServerGameState = {
        id: code.toLowerCase(),
        roomCode: code,
        status: 'LOBBY',
        hostId: '',
        settings: {
          gameMode: 'RANDOM',
          maxPlayers: 8,
          totalRounds: 3,
          taskDuration: 30,
          discussionDuration: 90,
          votingDuration: 30,
          turnsPerRound: 1,
        },
        currentRound: 0,
        currentPhase: 'WAITING',
        players: [],
        rounds: [],
        phaseTimer: null,
        timerInterval: null,
        timeRemaining: 0,
        turnOrder: [],
        currentTurnIndex: 0,
        turnTimer: null,
        turnInterval: null,
        playerColors: {},
        imposterGuessTimer: null,
        imposterGuessResolved: false,
      };
      this.games.set(code, game);
    }
  }

  isPublicLobby(roomCode: string): boolean {
    return (PUBLIC_LOBBY_CODES as readonly string[]).includes(roomCode);
  }

  resetPublicLobby(roomCode: string): void {
    if (!this.isPublicLobby(roomCode)) return;
    const game = this.games.get(roomCode);
    if (!game) return;

    // Reset game state but keep players
    game.status = 'LOBBY';
    game.currentRound = 0;
    game.currentPhase = 'WAITING';
    game.rounds = [];
    game.timeRemaining = 0;
    game.turnOrder = [];
    game.currentTurnIndex = 0;
    game.imposterGuessResolved = false;
    if (game.phaseTimer) { clearTimeout(game.phaseTimer); game.phaseTimer = null; }
    if (game.timerInterval) { clearInterval(game.timerInterval); game.timerInterval = null; }
    if (game.turnTimer) { clearTimeout(game.turnTimer); game.turnTimer = null; }
    if (game.turnInterval) { clearInterval(game.turnInterval); game.turnInterval = null; }
    if (game.imposterGuessTimer) { clearTimeout(game.imposterGuessTimer); game.imposterGuessTimer = null; }

    // Reset player scores/ready
    game.players.forEach(p => {
      p.score = 0;
      p.isReady = false;
    });

    // Assign new host if needed
    if (game.players.length > 0) {
      game.hostId = game.players[0].id;
    }
  }

  getPublicLobbies(): Array<{ code: string; name: string; icon: string; playerCount: number; status: string; maxPlayers: number }> {
    return PUBLIC_LOBBY_CODES.map(code => {
      const game = this.games.get(code);
      const theme = PUBLIC_LOBBY_THEMES[code];
      return {
        code,
        name: theme.name,
        icon: theme.icon,
        playerCount: game?.players.filter(p => p.isOnline).length || 0,
        status: game?.status || 'LOBBY',
        maxPlayers: game?.settings.maxPlayers || 8,
      };
    });
  }
}
