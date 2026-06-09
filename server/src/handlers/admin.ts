import type { Server, Socket } from 'socket.io';
import type { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData, AdminState } from '../../../shared/types.js';
import * as state from '../state.js';

type IO = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type Sock = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin';
export const ADMIN_ROOM = 'admin-room';

export function registerAdminHandlers(io: IO, socket: Sock): void {
  socket.on('admin-auth', (password, cb) => {
    if (password === ADMIN_PASSWORD) {
      state.addAdmin(socket.id);
      socket.join(ADMIN_ROOM);
      cb(true);
      pushAdminState(io);
    } else {
      cb(false);
    }
  });

  socket.on('admin-start-game', (config) => {
    if (!state.isAdmin(socket.id)) return;
    const timerSeconds = Math.min(Math.max(config.timerSeconds ?? 3600, 60), 7200);
    state.startGame({ timerSeconds, sameTheme: !!config.sameTheme });
  });

  socket.on('admin-advance', () => {
    if (!state.isAdmin(socket.id)) return;
    state.adminAdvance();
  });

  socket.on('admin-kick', (playerId) => {
    if (!state.isAdmin(socket.id)) return;
    const kicked = state.kickPlayer(playerId);
    if (kicked) {
      io.to(playerId).emit('kicked');
      io.emit('players-update', state.getPlayers());
    }
  });

  socket.on('admin-broadcast', (message: string) => {
    if (!state.isAdmin(socket.id)) return;
    const text = String(message).slice(0, 300).trim();
    if (text) io.emit('broadcast-message', text);
  });

  socket.on('admin-reset', () => {
    if (!state.isAdmin(socket.id)) return;
    state.adminAdvance();
  });
}

export function pushAdminState(io: IO): void {
  const gs = state.getState();
  const adminState: AdminState = {
    ...gs,
    allCursors: state.getCursors(),
    chatHistory: state.getChatHistory(),
  };
  io.to(ADMIN_ROOM).emit('admin-state', adminState);
}
