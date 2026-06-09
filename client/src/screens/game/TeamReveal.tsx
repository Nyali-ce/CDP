import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';

export function TeamReveal() {
  const teams = useGameStore((s) => s.teams);
  const myId = useGameStore((s) => s.myId);
  const players = useGameStore((s) => s.players);

  const myTeam = teams.find((t) => t.playerIds.includes(myId));

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, #1a0a2e 0%, #0a0a0f 70%)',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        style={{ textAlign: 'center', maxWidth: 700, padding: '0 20px' }}
      >
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 56px)', fontWeight: 900, marginBottom: 12 }}>
          Teams are in! 🎲
        </h1>

        {myTeam && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: `linear-gradient(135deg, ${myTeam.color}33, ${myTeam.color}11)`,
              border: `2px solid ${myTeam.color}`,
              borderRadius: 20,
              padding: '20px 32px',
              marginBottom: 32,
              boxShadow: `0 0 30px ${myTeam.color}44`,
            }}
          >
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>You're on</p>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: myTeam.color, marginBottom: 0 }}>{myTeam.name}</h2>
          </motion.div>
        )}

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {teams.map((team, i) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${team.color}55`,
                borderRadius: 16,
                padding: '16px 24px',
                minWidth: 160,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: team.color, boxShadow: `0 0 8px ${team.color}` }} />
                <span style={{ fontWeight: 700, color: team.color, fontSize: 14 }}>{team.name}</span>
              </div>
              {team.playerIds.map((pid) => {
                const p = players.find((pl) => pl.id === pid);
                return p ? (
                  <div key={pid} style={{ fontSize: 13, color: pid === myId ? '#fff' : 'rgba(255,255,255,0.6)', fontWeight: pid === myId ? 700 : 400, marginBottom: 2 }}>
                    {p.name}{pid === myId ? ' (you)' : ''}
                  </div>
                ) : null;
              })}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
