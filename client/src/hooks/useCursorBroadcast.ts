import { useEffect, useRef } from 'react';
import { socket } from '../socket/client';
import { useGameStore } from '../store/gameStore';

const THROTTLE_MS = 50;

export function useCursorBroadcast(enabled: boolean) {
  const lastSent = useRef(0);
  const myId = useGameStore((s) => s.myId);

  useEffect(() => {
    if (!enabled || !myId) return;

    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastSent.current < THROTTLE_MS) return;
      lastSent.current = now;
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      socket.emit('cursor-move', { x, y });
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [enabled, myId]);
}
