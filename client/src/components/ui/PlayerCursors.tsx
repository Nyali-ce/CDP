import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';

export function PlayerCursors() {
  const cursors = useGameStore((s) => s.cursors);
  const myId = useGameStore((s) => s.myId);
  const myName = useGameStore((s) => s.myName);
  const myColor = useGameStore((s) => s.myColor);
  const teams = useGameStore((s) => s.teams);

  const [localPos, setLocalPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setLocalPos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const myTeam = teams.find((t) => t.playerIds.includes(myId));

  const allCursors = [
    ...(localPos && myId ? [{ id: myId, name: myName, color: myColor, x: localPos.x, y: localPos.y }] : []),
    ...cursors.filter((c) => {
      if (c.id === myId) return false;
      if (myTeam) return myTeam.playerIds.includes(c.id);
      return true;
    }),
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none', overflow: 'hidden' }}>
      {allCursors.map((cursor) => {
        const x = cursor.x * window.innerWidth - 2;
        const y = cursor.y * window.innerHeight - 2;
        const isLocal = cursor.id === myId;
        return (
          <motion.div
            key={cursor.id}
            style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
            initial={{ x, y }}
            animate={{ x, y }}
            transition={isLocal
              ? { type: 'tween', duration: 0, ease: 'linear' }
              : { type: 'tween', duration: 0.09, ease: 'linear' }
            }
          >
            {/* Cursor dot */}
            <svg width="20" height="20" viewBox="0 0 20 20" style={{ overflow: 'visible' }}>
              <circle cx="4" cy="4" r="5" fill={cursor.color} opacity={0.9} />
              <circle cx="4" cy="4" r="5" fill="none" stroke="white" strokeWidth="1" opacity={0.4} />
            </svg>
            {/* Name tag */}
            <div
              style={{
                position: 'absolute',
                left: 14,
                top: -4,
                background: cursor.color,
                color: '#000',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '10px',
                whiteSpace: 'nowrap',
                boxShadow: `0 0 8px ${cursor.color}88`,
              }}
            >
              {cursor.name}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
