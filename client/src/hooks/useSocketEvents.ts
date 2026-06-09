import { useEffect } from 'react';
import { socket } from '../socket/client';
import { useGameStore } from '../store/gameStore';

export function useSocketEvents() {
  const store = useGameStore();

  useEffect(() => {
    socket.on('game-state', store.applyGameState);
    socket.on('players-update', store.setPlayers);
    socket.on('cursors-update', store.setCursors);
    socket.on('chat-message', store.addChatMessage);
    socket.on('vote-update', store.setVotes);
    socket.on('teams-assigned', store.setTeams);
    socket.on('timer-tick', store.setCountdown);

    socket.on('phase-change', (phase, data) => {
      store.setPhase(phase);
      const d = data as Record<string, unknown> | undefined;
      if (d?.mode) store.setChosenMode(d.mode as 'individual' | 'teams');
      if (d?.theme) store.setChosenTheme(d.theme as string);
    });

    socket.on('admin-state', (adminState) => {
      store.applyGameState(adminState);
    });

    socket.on('broadcast-message', (msg) => {
      store.setBroadcastMessage(msg);
      setTimeout(() => store.setBroadcastMessage(null), 10000);
    });

    socket.on('connect', () => {
      store.setIdentity(socket.id ?? '', store.myName, store.myColor);
    });

    return () => {
      socket.off('game-state');
      socket.off('players-update');
      socket.off('cursors-update');
      socket.off('chat-message');
      socket.off('vote-update');
      socket.off('teams-assigned');
      socket.off('timer-tick');
      socket.off('phase-change');
      socket.off('admin-state');
      socket.off('broadcast-message');
      socket.off('connect');
    };
  }, [store]);
}
