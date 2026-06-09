import { useGameStore } from '../../store/gameStore';

export function PlayerList() {
  const players = useGameStore((s) => s.players);
  const myId = useGameStore((s) => s.myId);

  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 20,
        background: 'rgba(10,10,20,0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: '10px 14px',
        minWidth: 160,
      }}
    >
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>
        Players ({players.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {players.map((p) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              opacity: p.id === myId ? 1 : 0.85,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: p.color,
                boxShadow: `0 0 6px ${p.color}`,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 13, color: '#fff', fontWeight: p.id === myId ? 700 : 400 }}>
              {p.name}{p.id === myId ? ' (you)' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
