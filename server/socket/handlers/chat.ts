import { Server, Socket } from 'socket.io';
import { GameStateManager } from '../state';

export function handleChatEvents(io: Server, socket: Socket, manager: GameStateManager) {
  socket.on('chat:message', (data) => {
    const playerId = socket.data.playerId;
    if (!playerId) return;
    const roomCode = manager.getPlayerRoom(playerId);
    if (!roomCode) return;
    const game = manager.getGame(roomCode);
    if (!game) return;

    const player = game.players.find(p => p.id === playerId);
    if (!player) return;

    io.to(roomCode).emit('chat:message', {
      playerId,
      nickname: player.nickname,
      text: data.text.slice(0, 500), // Limit message length
      timestamp: Date.now(),
    });
  });
}
