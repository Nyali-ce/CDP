import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import type { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '../../shared/types.js';
import * as state from './state.js';
import { registerLobbyHandlers } from './handlers/lobby.js';
import { registerGameHandlers } from './handlers/game.js';
import { registerAdminHandlers, pushAdminState } from './handlers/admin.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 80);
const SITE_PASSWORD = process.env.SITE_PASSWORD ?? '';

const app = express();
app.use(cors());
app.use(express.json());

// Serve built client in production
const clientDist = join(__dirname, '../../client/dist');
app.use(express.static(clientDist));

// Site password verification
app.post('/api/verify-password', (req, res) => {
  const { password } = req.body as { password?: string };
  if (!SITE_PASSWORD || password === SITE_PASSWORD) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false });
  }
});

app.get('/api/config', (_req, res) => {
  res.json({ hasPassword: !!SITE_PASSWORD });
});

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(join(clientDist, 'index.html'));
});

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
  cors: { origin: '*' },
});

// Register state machine callbacks → broadcast to all clients
state.registerCallbacks(
  (phase, data) => {
    io.emit('phase-change', phase, data);
    io.emit('game-state', state.getState());
    pushAdminState(io);
  },
  (seconds) => {
    io.emit('timer-tick', seconds);
  },
  (votes) => {
    io.emit('vote-update', votes);
    pushAdminState(io);
  },
  (teams) => {
    io.emit('teams-assigned', teams);
    pushAdminState(io);
  },
  (players) => {
    io.emit('players-update', players);
    pushAdminState(io);
  },
);

io.on('connection', (socket) => {
  registerLobbyHandlers(io, socket);
  registerGameHandlers(io, socket);
  registerAdminHandlers(io, socket);

  socket.on('disconnect', () => {
    state.removePlayer(socket.id);
    io.emit('players-update', state.getPlayers());
    io.emit('cursors-update', state.getCursors());
    pushAdminState(io);
  });
});

httpServer.listen(PORT, () => {
  console.log(`CDP server running on port ${PORT}`);
});
