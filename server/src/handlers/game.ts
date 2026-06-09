import type { Server, Socket } from 'socket.io';
import type { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '../../../shared/types.js';
import * as state from '../state.js';

type IO = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type Sock = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function registerGameHandlers(io: IO, socket: Sock): void {
  socket.on('vote-mode', (vote) => {
    if (state.getState().phase !== 'VOTING_MODE') return;
    if (vote !== 'individual' && vote !== 'teams') return;
    state.setVote(socket.id, vote);
    io.emit('vote-update', state.getState().votes);
  });

  socket.on('vote-theme', (themeIndex) => {
    if (state.getState().phase !== 'VOTING_THEME') return;
    if (typeof themeIndex !== 'number') return;
    if (state.hasThemeVoteGroups()) {
      state.setGroupVote(socket.id, themeIndex);
      io.emit('game-state', state.getState());
    } else {
      state.setVote(socket.id, String(themeIndex));
      io.emit('vote-update', state.getState().votes);
    }
  });
}
