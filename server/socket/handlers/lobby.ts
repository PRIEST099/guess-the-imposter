import { Server, Socket } from 'socket.io';
import { GameStateManager } from '../state';

export function handleLobbyEvents(io: Server, socket: Socket, manager: GameStateManager) {
  socket.on('lobby:create', (data) => {
    const playerId = socket.data.playerId;
    if (!playerId) return socket.emit('error', { code: 'NOT_AUTHENTICATED', message: 'Must register first' });

    const game = manager.createGame(playerId, {
      gameMode: data.settings.gameMode || 'WORD_PLAY',
      maxPlayers: data.settings.maxPlayers || 8,
      totalRounds: data.settings.totalRounds || 3,
      taskDuration: data.settings.taskDuration || 30,
      discussionDuration: data.settings.discussionDuration || 90,
      votingDuration: data.settings.votingDuration || 30,
      turnsPerRound: data.settings.turnsPerRound || 1,
    });

    const player = manager.getPlayerBySocketId(socket.id);
    if (player) {
      manager.addPlayerToGame(game.roomCode, player);
      socket.join(game.roomCode);
      socket.emit('lobby:created', { roomCode: game.roomCode });
      socket.emit('lobby:joined', {
        game: {
          roomCode: game.roomCode,
          settings: game.settings,
          players: game.players.map(p => ({
            id: p.id,
            nickname: p.nickname,
            avatarId: p.avatarId,
            sessionId: p.sessionId,
            score: p.score,
            isReady: p.isReady,
            isOnline: p.isOnline,
            isHost: p.id === game.hostId,
          })),
          hostId: game.hostId,
        },
      });
    }
  });

  socket.on('lobby:join', (data) => {
    const playerId = socket.data.playerId;
    if (!playerId) return socket.emit('error', { code: 'NOT_AUTHENTICATED', message: 'Must register first' });

    const game = manager.getGame(data.roomCode);
    if (!game) return socket.emit('error', { code: 'GAME_NOT_FOUND', message: 'Room not found' });
    const isPublic = manager.isPublicLobby(data.roomCode);
    if (!isPublic && game.status !== 'LOBBY') return socket.emit('error', { code: 'GAME_STARTED', message: 'Game already in progress' });
    if (isPublic && game.status !== 'LOBBY') return socket.emit('error', { code: 'GAME_STARTED', message: 'Game in progress. Try again shortly!' });
    if (game.players.length >= game.settings.maxPlayers) return socket.emit('error', { code: 'GAME_FULL', message: 'Room is full' });

    // Auto-assign host for public lobbies if no host or host left
    if (isPublic && (!game.hostId || !game.players.find(p => p.id === game.hostId && p.isOnline))) {
      game.hostId = playerId;
    }

    const player = manager.getPlayerBySocketId(socket.id);
    if (!player) return;

    // Check if player is already in this game (e.g., host reconnecting)
    const alreadyInGame = game.players.find(p => p.id === player.id);
    if (!alreadyInGame) {
      const added = manager.addPlayerToGame(data.roomCode, player);
      if (!added) return socket.emit('error', { code: 'JOIN_FAILED', message: 'Could not join game' });
    } else {
      // Re-establish the player-to-room mapping for reconnected players
      manager.setPlayerRoom(player.id, data.roomCode);
    }

    socket.join(data.roomCode);

    const playerInGame = {
      id: player.id,
      nickname: player.nickname,
      avatarId: player.avatarId,
      sessionId: player.sessionId,
      score: player.score,
      isReady: player.isReady,
      isOnline: player.isOnline,
      isHost: player.id === game.hostId,
    };

    socket.emit('lobby:joined', {
      game: {
        roomCode: game.roomCode,
        settings: game.settings,
        players: game.players.map(p => ({
          id: p.id,
          nickname: p.nickname,
          avatarId: p.avatarId,
          sessionId: p.sessionId,
          score: p.score,
          isReady: p.isReady,
          isOnline: p.isOnline,
          isHost: p.id === game.hostId,
        })),
        hostId: game.hostId,
      },
    });

    if (!alreadyInGame) {
      socket.to(data.roomCode).emit('lobby:player-joined', {
        player: playerInGame,
        playerCount: game.players.length,
      });
    }
  });

  socket.on('lobby:ready', (data) => {
    const playerId = socket.data.playerId;
    if (!playerId) return;
    const roomCode = manager.getPlayerRoom(playerId);
    if (!roomCode) return;

    manager.setPlayerReady(roomCode, playerId, data.isReady);
    io.to(roomCode).emit('lobby:ready-update', { playerId, isReady: data.isReady });
  });

  socket.on('lobby:settings-update', (data) => {
    const playerId = socket.data.playerId;
    if (!playerId) return;
    const roomCode = manager.getPlayerRoom(playerId);
    if (!roomCode) return;
    const game = manager.getGame(roomCode);
    if (!game || game.hostId !== playerId) return;

    manager.updateSettings(roomCode, data);
    io.to(roomCode).emit('lobby:settings-changed', { settings: game.settings });
  });

  socket.on('lobby:kick', (data) => {
    const playerId = socket.data.playerId;
    if (!playerId) return;
    const roomCode = manager.getPlayerRoom(playerId);
    if (!roomCode) return;
    const game = manager.getGame(roomCode);
    if (!game || game.hostId !== playerId) return;

    const kickedPlayer = game.players.find(p => p.id === data.playerId);
    if (kickedPlayer) {
      // Find the kicked player's socket and emit to them
      io.to(roomCode).emit('lobby:player-left', { playerId: data.playerId });
      manager.removePlayer(roomCode, data.playerId);

      // Notify the kicked player via their socket
      const sockets = io.sockets.sockets;
      for (const [, s] of sockets) {
        if (s.data.playerId === data.playerId) {
          s.emit('lobby:kicked', { reason: 'You were kicked by the host' });
          s.leave(roomCode);
          break;
        }
      }
    }
  });

  socket.on('lobby:leave', () => {
    const playerId = socket.data.playerId;
    if (!playerId) return;
    const roomCode = manager.getPlayerRoom(playerId);
    if (!roomCode) return;

    const game = manager.getGame(roomCode);
    const isPublic = manager.isPublicLobby(roomCode);

    if (isPublic) {
      // For public lobbies, just remove the player but don't delete the room
      game?.players.splice(game.players.findIndex(p => p.id === playerId), 1);
      manager.setPlayerRoom(playerId, '');
      socket.leave(roomCode);

      if (game && game.players.length > 0) {
        // Auto-assign new host
        if (game.hostId === playerId) {
          const onlinePlayer = game.players.find(p => p.isOnline);
          if (onlinePlayer) game.hostId = onlinePlayer.id;
        }
        io.to(roomCode).emit('lobby:player-left', {
          playerId,
          newHostId: game.hostId
        });
      }
    } else {
      manager.removePlayer(roomCode, playerId);
      socket.leave(roomCode);

      if (game && game.players.length > 0) {
        io.to(roomCode).emit('lobby:player-left', {
          playerId,
          newHostId: game.hostId
        });
      }
    }
  });
}
