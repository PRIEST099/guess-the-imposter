import { Server, Socket } from 'socket.io';
import { GameStateManager } from './state';
import { handleLobbyEvents } from './handlers/lobby';
import { handleGameEvents } from './handlers/game';
import { handleChatEvents } from './handlers/chat';
import { handleVotingEvents } from './handlers/voting';

const gameManager = new GameStateManager();

// Initialize public lobbies on startup
gameManager.initPublicLobbies();

export function registerSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Authentication
    socket.on('auth:register', (data: { nickname: string; avatarId: string; sessionId?: string }) => {
      const player = gameManager.registerPlayer(socket.id, data.nickname, data.avatarId, data.sessionId);
      socket.data.playerId = player.id;
      socket.data.sessionId = player.sessionId;
      socket.emit('auth:registered', { player });
    });

    // Public lobbies listing
    socket.on('lobbies:list', () => {
      socket.emit('lobbies:list', gameManager.getPublicLobbies());
    });

    // Register all event handlers
    handleLobbyEvents(io, socket, gameManager);
    handleGameEvents(io, socket, gameManager);
    handleChatEvents(io, socket, gameManager);
    handleVotingEvents(io, socket, gameManager);

    // Handle disconnection
    socket.on('disconnect', () => {
      const playerId = socket.data.playerId;
      if (playerId) {
        const roomCode = gameManager.getPlayerRoom(playerId);
        if (roomCode) {
          const game = gameManager.getGame(roomCode);
          if (game) {
            gameManager.setPlayerOnline(roomCode, playerId, false);
            io.to(roomCode).emit('lobby:player-left', { playerId });

            // Grace period for reconnection
            setTimeout(() => {
              const currentGame = gameManager.getGame(roomCode);
              if (currentGame) {
                const player = currentGame.players.find(p => p.id === playerId);
                if (player && !player.isOnline) {
                  gameManager.removePlayer(roomCode, playerId);
                  io.to(roomCode).emit('lobby:player-left', {
                    playerId,
                    newHostId: currentGame.hostId
                  });
                }
              }
            }, 30000);
          }
        }
      }
      console.log(`Player disconnected: ${socket.id}`);
    });

    // Handle reconnection
    socket.on('player:reconnect', (data: { sessionId: string; roomCode: string }) => {
      const player = gameManager.reconnectPlayer(data.sessionId, socket.id);
      if (player) {
        const game = gameManager.getGame(data.roomCode);
        if (game) {
          socket.data.playerId = player.id;
          socket.data.sessionId = player.sessionId;
          socket.join(data.roomCode);
          gameManager.setPlayerOnline(data.roomCode, player.id, true);
          socket.emit('player:reconnected', { fullGameState: game });
        }
      }
    });
  });
}
