import type { Server, Socket } from 'socket.io';
import type { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '../../../shared/types.js';
import * as state from '../state.js';

type IO = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type Sock = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

const CURSOR_THROTTLE_MS = 50;
const lastCursorTime = new Map<string, number>();

export function registerLobbyHandlers(io: IO, socket: Sock): void {
  socket.on('join-lobby', ({ name, color }) => {
    const safeName = name.trim().slice(0, 24) || 'Anonymous';
    const safeColor = /^#[0-9A-Fa-f]{6}$/.test(color) ? color : '#FF6B6B';
    state.addPlayer(socket.id, safeName, safeColor);

    socket.emit('game-state', state.getState());
    io.emit('players-update', state.getPlayers());

    const history = state.getChatHistory();
    const myTeamId = state.getPlayerTeamId(socket.id);
    for (const msg of history) {
      if (!msg.teamId || msg.teamId === myTeamId) socket.emit('chat-message', msg);
    }
  });

  socket.on('cursor-move', ({ x, y }) => {
    const now = Date.now();
    const last = lastCursorTime.get(socket.id) ?? 0;
    if (now - last < CURSOR_THROTTLE_MS) return;
    lastCursorTime.set(socket.id, now);
    state.updateCursor(socket.id, x, y);
    socket.broadcast.emit('cursors-update', state.getCursors());
  });

  socket.on('send-chat', (text) => {
    if (typeof text !== 'string' || !text.trim()) return;
    const currentState = state.getState();
    let teamId: string | undefined;
    if (currentState.phase === 'VOTING_THEME' && currentState.teams.length > 0) {
      teamId = state.getPlayerTeamId(socket.id);
    }
    const msg = state.addChatMessage(socket.id, text.trim(), teamId);
    if (!msg) return;
    if (teamId) {
      for (const pid of state.getTeamPlayerIds(teamId)) {
        io.to(pid).emit('chat-message', msg);
      }
    } else {
      io.emit('chat-message', msg);
    }
  });
}
