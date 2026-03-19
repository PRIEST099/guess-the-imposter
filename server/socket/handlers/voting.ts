import { Server, Socket } from 'socket.io';
import { GameStateManager } from '../state';

export function handleVotingEvents(io: Server, socket: Socket, manager: GameStateManager) {
  socket.on('vote:cast', (data) => {
    const playerId = socket.data.playerId;
    if (!playerId) return;
    const roomCode = manager.getPlayerRoom(playerId);
    if (!roomCode) return;
    const game = manager.getGame(roomCode);
    if (!game || game.currentPhase !== 'VOTING') return;

    const round = manager.getCurrentRound(roomCode);
    if (!round || round.isVotingLocked) return;

    // Can't vote for yourself
    if (data.votedPlayerId === playerId) {
      socket.emit('vote:cast-ack', { success: false });
      return;
    }

    // Validate target exists
    if (!game.players.find(p => p.id === data.votedPlayerId)) {
      socket.emit('vote:cast-ack', { success: false });
      return;
    }

    round.votes.set(playerId, data.votedPlayerId);
    socket.emit('vote:cast-ack', { success: true });

    // Check if all online players voted
    const onlinePlayers = game.players.filter(p => p.isOnline);
    if (round.votes.size >= onlinePlayers.length) {
      // All voted, resolve immediately
      // The game handler will handle this through the timer callback
    }
  });
}
