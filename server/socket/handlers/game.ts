import { Server, Socket } from 'socket.io';
import { GameStateManager, ServerGameState, ServerRoundState } from '../state';
import { nanoid } from 'nanoid';
import * as fs from 'fs';
import * as path from 'path';

const PLAYER_PALETTE = [
  '#7dd3fc', '#fda4af', '#86efac', '#c4b5fd',
  '#fde68a', '#f472b6', '#a78bfa', '#34d399',
] as const;

function loadPrompts(gameMode: string): Array<{ id: string; normal: string; imposter: string }> {
  const modeToFile: Record<string, string> = {
    'WORD_PLAY': 'word-play.json',
    'SKETCH_OFF': 'sketch-off.json',
    'TRIVIA_TWIST': 'trivia-twist.json',
    'CAPTION_CHAOS': 'caption-chaos.json',
    'ODD_ONE_OUT': 'odd-one-out.json',
  };
  const filename = modeToFile[gameMode] || 'word-play.json';
  const filePath = path.join(process.cwd(), 'src', 'lib', 'prompts', filename);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

function selectImposter(playerIds: string[]): string {
  return playerIds[Math.floor(Math.random() * playerIds.length)];
}

function selectPrompt(prompts: Array<{ id: string; normal: string; imposter: string }>, usedIds: Set<string>) {
  const available = prompts.filter(p => !usedIds.has(p.id));
  if (available.length === 0) {
    // Reset if all used
    return prompts[Math.floor(Math.random() * prompts.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

// Shuffle array in-place (Fisher-Yates)
function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function handleGameEvents(io: Server, socket: Socket, manager: GameStateManager) {
  socket.on('game:start', () => {
    const playerId = socket.data.playerId;
    if (!playerId) return;
    const roomCode = manager.getPlayerRoom(playerId);
    if (!roomCode) return;
    const game = manager.getGame(roomCode);
    if (!game) return;
    if (game.hostId !== playerId) return socket.emit('error', { code: 'NOT_HOST', message: 'Only the host can start' });
    if (game.players.length < 3) return socket.emit('error', { code: 'NOT_ENOUGH_PLAYERS', message: 'Need at least 3 players' });

    // Check all players ready (except host)
    const allReady = game.players.every(p => p.id === game.hostId || p.isReady);
    if (!allReady) return socket.emit('error', { code: 'NOT_ALL_READY', message: 'Not all players are ready' });

    game.status = 'IN_PROGRESS';
    startNextRound(io, manager, roomCode);
  });

  // Task submissions
  socket.on('task:submit-word', (data) => handleSubmission(io, socket, manager, data.text));
  socket.on('task:submit-trivia', (data) => handleSubmission(io, socket, manager, data.answer));
  socket.on('task:submit-caption', (data) => handleSubmission(io, socket, manager, data.caption));
  socket.on('task:submit-ranking', (data) => handleSubmission(io, socket, manager, JSON.stringify(data.ranking)));

  // Canvas events — gated by turn in SKETCH_OFF mode
  socket.on('task:canvas-stroke', (data) => {
    const playerId = socket.data.playerId;
    if (!playerId) return;
    const roomCode = manager.getPlayerRoom(playerId);
    if (!roomCode) return;
    const game = manager.getGame(roomCode);
    if (!game) return;

    // In SKETCH_OFF, only the current drawer can send strokes
    const canvasMode = (game as any)._lastRoundMode || game.settings.gameMode;
    if (canvasMode === 'SKETCH_OFF' && game.turnOrder.length > 0) {
      const currentDrawer = game.turnOrder[game.currentTurnIndex];
      if (playerId !== currentDrawer) return; // Not your turn
    }

    socket.to(roomCode).emit('task:canvas-stroke', { playerId, stroke: data.stroke });
  });

  // Canvas clear removed — in SKETCH_OFF, canvas persists across turns
  // Canvas only resets at the start of each round (server emits task:canvas-reset)

  // Quick rematch
  socket.on('game:rematch', () => {
    const playerId = socket.data.playerId;
    if (!playerId) return;
    const roomCode = manager.getPlayerRoom(playerId);
    if (!roomCode) return;
    const game = manager.getGame(roomCode);
    if (!game) return;
    if (game.hostId !== playerId) return socket.emit('error', { code: 'NOT_HOST', message: 'Only the host can start a rematch' });
    if (game.status !== 'FINISHED') return;

    // Reset game state for rematch
    game.status = 'LOBBY';
    game.currentRound = 0;
    game.currentPhase = 'WAITING';
    game.rounds = [];
    game.timeRemaining = 0;
    game.turnOrder = [];
    game.currentTurnIndex = 0;
    game.imposterGuessResolved = false;
    clearTimers(game);
    clearTurnTimers(game);
    if (game.imposterGuessTimer) {
      clearTimeout(game.imposterGuessTimer);
      game.imposterGuessTimer = null;
    }

    // Reset player scores and ready states
    game.players.forEach(p => {
      p.score = 0;
      p.isReady = p.id === game.hostId; // Host is auto-ready
    });

    // Notify all players to go back to lobby
    io.to(roomCode).emit('game:rematch-started', { roomCode });
  });

  // Imposter guess (comeback mechanic)
  socket.on('imposter:guess-prompt', (data) => {
    const playerId = socket.data.playerId;
    if (!playerId) return;
    const roomCode = manager.getPlayerRoom(playerId);
    if (!roomCode) return;
    const game = manager.getGame(roomCode);
    if (!game || game.imposterGuessResolved) return;
    const round = manager.getCurrentRound(roomCode);
    if (!round) return;

    // Only the imposter can guess
    if (playerId !== round.imposterId) return;

    resolveImposterGuess(io, manager, roomCode, data.guess);
  });

  // Turn-based: player signals they're done drawing
  socket.on('task:turn-done', () => {
    const playerId = socket.data.playerId;
    if (!playerId) return;
    const roomCode = manager.getPlayerRoom(playerId);
    if (!roomCode) return;
    const game = manager.getGame(roomCode);
    if (!game || game.currentPhase !== 'TASK') return;

    // Only the current drawer can end their turn
    if (game.turnOrder.length === 0) return;
    const currentDrawer = game.turnOrder[game.currentTurnIndex];
    if (playerId !== currentDrawer) return;

    // Clear turn timer and advance
    clearTurnTimers(game);
    advanceToNextTurn(io, manager, roomCode);
  });
}

function handleSubmission(io: Server, socket: Socket, manager: GameStateManager, content: string) {
  const playerId = socket.data.playerId;
  if (!playerId) return;
  const roomCode = manager.getPlayerRoom(playerId);
  if (!roomCode) return;
  const game = manager.getGame(roomCode);
  if (!game || game.currentPhase !== 'TASK') return;

  const round = manager.getCurrentRound(roomCode);
  if (!round) return;
  if (round.submissions.has(playerId)) return; // Already submitted

  round.submissions.set(playerId, { content, submittedAt: Date.now() });

  // Broadcast submission progress (no names, just count)
  const onlineCount = game.players.filter(p => p.isOnline).length;
  io.to(roomCode).emit('task:submission-count', {
    count: round.submissions.size,
    total: onlineCount,
  });

  // Check if all players submitted
  if (round.submissions.size >= onlineCount) {
    // All submitted, move to discussion
    clearTimers(game);
    clearTurnTimers(game);
    transitionToDiscussion(io, manager, roomCode);
  }
}

const CONCRETE_MODES = ['WORD_PLAY', 'SKETCH_OFF', 'TRIVIA_TWIST', 'CAPTION_CHAOS', 'ODD_ONE_OUT'];

function startNextRound(io: Server, manager: GameStateManager, roomCode: string) {
  const game = manager.getGame(roomCode);
  if (!game) return;

  game.currentRound++;

  if (game.currentRound > game.settings.totalRounds) {
    endGame(io, manager, roomCode);
    return;
  }

  // Resolve game mode for this round (RANDOM picks a different mode each round)
  let roundMode = game.settings.gameMode;
  if (roundMode === 'RANDOM') {
    // Pick a random concrete mode, avoid repeating the previous round's mode if possible
    const lastRoundMode = (game as any)._lastRoundMode as string | undefined;
    const candidates = lastRoundMode
      ? CONCRETE_MODES.filter(m => m !== lastRoundMode)
      : CONCRETE_MODES;
    roundMode = candidates[Math.floor(Math.random() * candidates.length)];
  }
  (game as any)._lastRoundMode = roundMode;

  const prompts = loadPrompts(roundMode);
  const usedIds = new Set(game.rounds.map(r => r.normalPrompt));
  const prompt = selectPrompt(prompts, usedIds);
  const imposterId = selectImposter(game.players.filter(p => p.isOnline).map(p => p.id));

  const round: ServerRoundState = {
    roundNumber: game.currentRound,
    normalPrompt: prompt.normal,
    imposterPrompt: prompt.imposter,
    imposterId,
    submissions: new Map(),
    votes: new Map(),
    isVotingLocked: false,
  };

  game.rounds.push(round);

  // Role reveal phase
  game.currentPhase = 'ROLE_REVEAL';
  io.to(roomCode).emit('game:phase-change', {
    phase: 'ROLE_REVEAL' as any,
    roundNumber: game.currentRound,
    timeLimit: 5
  });
  io.to(roomCode).emit('game:round-start', { roundNumber: game.currentRound, gameMode: roundMode });

  // Send roles privately — imposter gets NO prompt (must blend in without knowing the word)
  game.players.forEach(player => {
    const isImposter = player.id === imposterId;
    const playerSocket = findSocketByPlayerId(io, player.id);
    if (playerSocket) {
      playerSocket.emit('game:role-assigned', {
        role: isImposter ? 'IMPOSTER' : 'PLAYER',
        prompt: isImposter ? null : prompt.normal,
      });
    }
  });

  // After role reveal, transition to task
  game.phaseTimer = setTimeout(() => {
    transitionToTask(io, manager, roomCode);
  }, 5000);
}

function transitionToTask(io: Server, manager: GameStateManager, roomCode: string) {
  const game = manager.getGame(roomCode);
  if (!game) return;

  game.currentPhase = 'TASK';

  // Use the resolved round mode (handles RANDOM)
  const roundMode = (game as any)._lastRoundMode || game.settings.gameMode;

  if (roundMode === 'SKETCH_OFF') {
    // Turn-based drawing: shared persistent canvas
    const onlinePlayers = game.players.filter(p => p.isOnline).map(p => p.id);
    const shuffled = shuffleArray([...onlinePlayers]);
    const turnsPerRound = game.settings.turnsPerRound || 1;

    // Build turn order: repeat shuffled list turnsPerRound times [A,B,C,A,B,C]
    game.turnOrder = [];
    for (let i = 0; i < turnsPerRound; i++) {
      game.turnOrder.push(...shuffled);
    }
    game.currentTurnIndex = 0;

    // Assign unique colors to each player
    game.playerColors = {};
    onlinePlayers.forEach((pid, idx) => {
      game.playerColors[pid] = PLAYER_PALETTE[idx % PLAYER_PALETTE.length];
    });

    // taskDuration is now the per-turn inactivity timeout
    const turnDuration = Math.max(10, game.settings.taskDuration);
    const totalTurns = game.turnOrder.length;
    const totalDuration = turnDuration * totalTurns;
    game.timeRemaining = totalDuration;

    // Clear canvas at the start of each round (not between turns)
    io.to(roomCode).emit('task:canvas-reset');

    // Emit phase change with total duration (all turns combined)
    io.to(roomCode).emit('game:phase-change', {
      phase: 'TASK' as any,
      roundNumber: game.currentRound,
      timeLimit: totalDuration,
    });

    // Emit turn info to all players (includes playerColors)
    io.to(roomCode).emit('task:turn-start', {
      drawerId: game.turnOrder[0],
      turnNumber: 1,
      totalTurns,
      turnDuration,
      turnOrder: game.turnOrder,
      playerColors: game.playerColors,
    });

    // Start turn timer
    startTurnTimer(io, manager, roomCode, turnDuration);

    // Start overall phase timer (fallback, ends all turns if something goes wrong)
    startTimer(io, game, roomCode, totalDuration, () => {
      clearTurnTimers(game);
      transitionToDiscussion(io, manager, roomCode);
    });
  } else {
    // Non-turn-based: all players work simultaneously
    game.turnOrder = [];
    const duration = game.settings.taskDuration;
    game.timeRemaining = duration;

    io.to(roomCode).emit('game:phase-change', {
      phase: 'TASK' as any,
      roundNumber: game.currentRound,
      timeLimit: duration
    });

    // Send initial submission progress (0 of N)
    const onlineCount = game.players.filter(p => p.isOnline).length;
    io.to(roomCode).emit('task:submission-count', { count: 0, total: onlineCount });

    startTimer(io, game, roomCode, duration, () => {
      transitionToDiscussion(io, manager, roomCode);
    });
  }
}

function startTurnTimer(io: Server, manager: GameStateManager, roomCode: string, duration: number) {
  const game = manager.getGame(roomCode);
  if (!game) return;

  clearTurnTimers(game);

  let turnTimeLeft = duration;

  game.turnInterval = setInterval(() => {
    turnTimeLeft--;
    // Sync turn timer every 5 seconds or in final 10 seconds
    if (turnTimeLeft % 5 === 0 || turnTimeLeft <= 10) {
      io.to(roomCode).emit('task:turn-timer', { secondsRemaining: turnTimeLeft });
    }
    if (turnTimeLeft <= 0) {
      if (game.turnInterval) {
        clearInterval(game.turnInterval);
        game.turnInterval = null;
      }
    }
  }, 1000);

  game.turnTimer = setTimeout(() => {
    clearTurnTimers(game);
    advanceToNextTurn(io, manager, roomCode);
  }, duration * 1000);
}

function advanceToNextTurn(io: Server, manager: GameStateManager, roomCode: string) {
  const game = manager.getGame(roomCode);
  if (!game) return;

  game.currentTurnIndex++;

  if (game.currentTurnIndex >= game.turnOrder.length) {
    // All turns done — move to discussion
    clearTimers(game);
    clearTurnTimers(game);
    transitionToDiscussion(io, manager, roomCode);
    return;
  }

  // Per-turn inactivity timeout
  const turnDuration = Math.max(10, game.settings.taskDuration);
  const totalTurns = game.turnOrder.length;

  // Notify all players about the new turn (NO canvas clear — drawings persist)
  io.to(roomCode).emit('task:turn-start', {
    drawerId: game.turnOrder[game.currentTurnIndex],
    turnNumber: game.currentTurnIndex + 1,
    totalTurns,
    turnDuration,
    turnOrder: game.turnOrder,
    playerColors: game.playerColors || {},
  });

  // Start timer for this turn
  startTurnTimer(io, manager, roomCode, turnDuration);
}

function transitionToDiscussion(io: Server, manager: GameStateManager, roomCode: string) {
  const game = manager.getGame(roomCode);
  if (!game) return;

  game.currentPhase = 'DISCUSSION';
  const duration = game.settings.discussionDuration;
  const round = manager.getCurrentRound(roomCode);

  // Reset turn state
  game.turnOrder = [];
  game.currentTurnIndex = 0;

  // Broadcast all submissions
  if (round) {
    const submissions = Array.from(round.submissions.entries()).map(([playerId, sub]) => ({
      playerId,
      content: sub.content,
    }));
    // Shuffle to not reveal order
    for (let i = submissions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [submissions[i], submissions[j]] = [submissions[j], submissions[i]];
    }
    io.to(roomCode).emit('task:all-submitted', { submissions });
  }

  io.to(roomCode).emit('game:phase-change', {
    phase: 'DISCUSSION' as any,
    roundNumber: game.currentRound,
    timeLimit: duration
  });

  startTimer(io, game, roomCode, duration, () => {
    transitionToVoting(io, manager, roomCode);
  });
}

function transitionToVoting(io: Server, manager: GameStateManager, roomCode: string) {
  const game = manager.getGame(roomCode);
  if (!game) return;

  game.currentPhase = 'VOTING';
  const duration = game.settings.votingDuration;

  io.to(roomCode).emit('game:phase-change', {
    phase: 'VOTING' as any,
    roundNumber: game.currentRound,
    timeLimit: duration
  });

  startTimer(io, game, roomCode, duration, () => {
    resolveVotes(io, manager, roomCode);
  });
}

function resolveVotes(io: Server, manager: GameStateManager, roomCode: string) {
  const game = manager.getGame(roomCode);
  if (!game) return;
  const round = manager.getCurrentRound(roomCode);
  if (!round) return;

  round.isVotingLocked = true;

  // Tally votes
  const voteCounts: Record<string, number> = {};
  const votes: Record<string, string> = {};

  for (const [voterId, votedId] of round.votes) {
    votes[voterId] = votedId;
    voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
  }

  // Find who got most votes
  let maxVotes = 0;
  let eliminatedId: string | null = null;
  for (const [playerId, count] of Object.entries(voteCounts)) {
    if (count > maxVotes) {
      maxVotes = count;
      eliminatedId = playerId;
    }
  }

  const imposterWasFound = eliminatedId === round.imposterId;

  // Store vote data for later use
  (game as any)._pendingVoteData = { votes, voteCounts, eliminatedId, imposterWasFound };

  if (imposterWasFound) {
    // Imposter was caught — give them a chance to guess the prompt
    const GUESS_TIME_LIMIT = 15;
    game.imposterGuessResolved = false;
    io.to(roomCode).emit('imposter:guess-phase', {
      imposterId: round.imposterId,
      timeLimit: GUESS_TIME_LIMIT,
    });

    // Auto-resolve after time limit if imposter doesn't guess
    game.imposterGuessTimer = setTimeout(() => {
      if (!game.imposterGuessResolved) {
        resolveImposterGuess(io, manager, roomCode, null);
      }
    }, GUESS_TIME_LIMIT * 1000);
  } else {
    // Imposter escaped — skip guess phase, go straight to results
    game.imposterGuessResolved = true;
    showRoundResults(io, manager, roomCode, false, false);
  }
}

function normalizeGuess(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
}

function isGuessCorrect(guess: string, actualPrompt: string): boolean {
  const g = normalizeGuess(guess);
  const p = normalizeGuess(actualPrompt);
  if (!g) return false;
  // Exact match
  if (g === p) return true;
  // One contains the other (for multi-word prompts)
  if (p.includes(g) || g.includes(p)) return true;
  // Levenshtein distance for typo tolerance (allow ~20% error)
  const maxDist = Math.max(1, Math.floor(p.length * 0.25));
  return levenshtein(g, p) <= maxDist;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function resolveImposterGuess(io: Server, manager: GameStateManager, roomCode: string, guess: string | null) {
  const game = manager.getGame(roomCode);
  if (!game || game.imposterGuessResolved) return;
  game.imposterGuessResolved = true;

  // Clear the guess timer
  if (game.imposterGuessTimer) {
    clearTimeout(game.imposterGuessTimer);
    game.imposterGuessTimer = null;
  }

  const round = manager.getCurrentRound(roomCode);
  if (!round) return;

  const correct = guess ? isGuessCorrect(guess, round.normalPrompt) : false;
  const bonusPoints = correct ? 50 : 0;

  // Emit guess result to all players
  io.to(roomCode).emit('imposter:guess-result', {
    correct,
    guess: guess || '(no guess)',
    actualPrompt: round.normalPrompt,
    bonusPoints,
  });

  // Award bonus points if correct
  if (correct) {
    const imposter = game.players.find(p => p.id === round.imposterId);
    if (imposter) imposter.score += bonusPoints;
  }

  // Show results after a brief delay to display the guess result
  setTimeout(() => {
    showRoundResults(io, manager, roomCode, true, correct);
  }, 3000);
}

function showRoundResults(io: Server, manager: GameStateManager, roomCode: string, imposterWasFound: boolean, imposterGuessedCorrectly: boolean) {
  const game = manager.getGame(roomCode);
  if (!game) return;
  const round = manager.getCurrentRound(roomCode);
  if (!round) return;

  game.currentPhase = 'ROUND_RESULTS';

  const pendingData = (game as any)._pendingVoteData as { votes: Record<string, string>; voteCounts: Record<string, number>; eliminatedId: string | null; imposterWasFound: boolean };

  // Calculate scores
  const scores: Record<string, number> = {};
  game.players.forEach(p => { scores[p.id] = 0; });

  if (imposterWasFound) {
    // Players who voted correctly get points
    for (const [voterId, votedId] of round.votes) {
      if (votedId === round.imposterId) {
        scores[voterId] = 100;
        const player = game.players.find(p => p.id === voterId);
        if (player) player.score += 100;
      } else {
        scores[voterId] = -25;
        const player = game.players.find(p => p.id === voterId);
        if (player) player.score -= 25;
      }
    }
    // Add imposter guess bonus to display
    if (imposterGuessedCorrectly) {
      scores[round.imposterId] = (scores[round.imposterId] || 0) + 50;
    }
  } else {
    // Imposter survives
    scores[round.imposterId] = 150;
    const imposter = game.players.find(p => p.id === round.imposterId);
    if (imposter) imposter.score += 150;

    // Wrong voters lose points
    for (const [voterId, votedId] of round.votes) {
      if (votedId !== round.imposterId) {
        scores[voterId] = -25;
        const player = game.players.find(p => p.id === voterId);
        if (player) player.score -= 25;
      }
    }
  }

  const result = {
    votes: pendingData.votes,
    voteCounts: pendingData.voteCounts,
    eliminatedId: pendingData.eliminatedId,
    imposterWasFound,
    imposterId: round.imposterId,
    scores,
  };

  io.to(roomCode).emit('game:phase-change', {
    phase: 'ROUND_RESULTS' as any,
    roundNumber: game.currentRound,
    timeLimit: 8
  });
  io.to(roomCode).emit('vote:results', result);

  // Clean up pending data
  delete (game as any)._pendingVoteData;

  // After results display, start next round or end game
  game.phaseTimer = setTimeout(() => {
    startNextRound(io, manager, roomCode);
  }, 8000);
}

function endGame(io: Server, manager: GameStateManager, roomCode: string) {
  const game = manager.getGame(roomCode);
  if (!game) return;

  game.status = 'FINISHED';
  game.currentPhase = 'GAME_OVER';
  clearTimers(game);
  clearTurnTimers(game);

  const finalScores: Record<string, number> = {};
  game.players.forEach(p => { finalScores[p.id] = p.score; });

  // Determine winner (simplified: if imposter has highest score, imposter wins)
  const maxScore = Math.max(...Object.values(finalScores));
  const winnerId = Object.entries(finalScores).find(([, s]) => s === maxScore)?.[0];
  const imposterIds = game.rounds.map(r => r.imposterId);
  const winner = winnerId && imposterIds.includes(winnerId) ? 'IMPOSTER' : 'PLAYERS';

  io.to(roomCode).emit('game:phase-change', {
    phase: 'GAME_OVER' as any,
    roundNumber: game.currentRound,
    timeLimit: 0
  });
  io.to(roomCode).emit('game:ended', { finalScores, winner });

  // Auto-reset public lobbies after 15 seconds
  if (manager.isPublicLobby(roomCode)) {
    setTimeout(() => {
      manager.resetPublicLobby(roomCode);
      io.to(roomCode).emit('game:rematch-started', { roomCode });
    }, 15000);
  }
}

function startTimer(io: Server, game: ServerGameState, roomCode: string, duration: number, onComplete: () => void) {
  clearTimers(game);
  game.timeRemaining = duration;

  game.timerInterval = setInterval(() => {
    game.timeRemaining--;
    if (game.timeRemaining % 5 === 0 || game.timeRemaining <= 10) {
      io.to(roomCode).emit('timer:sync', { secondsRemaining: game.timeRemaining });
    }
    if (game.timeRemaining <= 0) {
      clearTimers(game);
    }
  }, 1000);

  game.phaseTimer = setTimeout(() => {
    clearTimers(game);
    onComplete();
  }, duration * 1000);
}

function clearTimers(game: ServerGameState) {
  if (game.phaseTimer) { clearTimeout(game.phaseTimer); game.phaseTimer = null; }
  if (game.timerInterval) { clearInterval(game.timerInterval); game.timerInterval = null; }
}

function clearTurnTimers(game: ServerGameState) {
  if (game.turnTimer) { clearTimeout(game.turnTimer); game.turnTimer = null; }
  if (game.turnInterval) { clearInterval(game.turnInterval); game.turnInterval = null; }
}

function findSocketByPlayerId(io: Server, playerId: string): Socket | undefined {
  for (const [, socket] of io.sockets.sockets) {
    if (socket.data.playerId === playerId) return socket;
  }
  return undefined;
}
