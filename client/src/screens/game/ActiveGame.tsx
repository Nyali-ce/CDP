import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { PlayerCursors } from '../../components/ui/PlayerCursors';
import { ChatBox } from '../../components/ui/ChatBox';
import { useCursorBroadcast } from '../../hooks/useCursorBroadcast';

function formatTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export function ActiveGame() {
  const countdown = useGameStore((s) => s.countdown);
  const chosenTheme = useGameStore((s) => s.chosenTheme);
  const myId = useGameStore((s) => s.myId);
  const teams = useGameStore((s) => s.teams);
  const chosenMode = useGameStore((s) => s.chosenMode);
  const themeVoteGroups = useGameStore((s) => s.themeVoteGroups);
  useCursorBroadcast(true);

  const myTeam = teams.find((t) => t.playerIds.includes(myId));
  const myGroup = themeVoteGroups.find((g) => g.playerIds.includes(myId));
  const theme = chosenTheme ?? myGroup?.chosenTheme ?? '...';
  const isUrgent = countdown <= 60 && countdown > 0;

  return (
    <div className="game-area" style={{
      position: 'relative', width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, #0a0a1e 0%, #0a0a0f 70%)',
    }}>
      <PlayerCursors />
      <ChatBox />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center', zIndex: 10 }}
      >
        {/* Timer */}
        <motion.div
          animate={isUrgent ? {
            color: ['#ef4444', '#ff6b6b', '#ef4444'],
            textShadow: ['0 0 20px #ef444488', '0 0 40px #ef4444cc', '0 0 20px #ef444488'],
          } : {}}
          transition={isUrgent ? { duration: 1, repeat: Infinity } : {}}
          style={{
            fontSize: 'clamp(72px, 15vw, 180px)',
            fontWeight: 900,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            color: isUrgent ? '#ef4444' : '#fff',
            textShadow: isUrgent ? '0 0 40px #ef444466' : '0 0 20px rgba(255,255,255,0.1)',
            letterSpacing: -4,
            marginBottom: 24,
          }}
        >
          {formatTime(countdown)}
        </motion.div>

        {/* Theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: '16px 32px',
            display: 'inline-block',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 2 }}>Your Theme</div>
          <div style={{ fontSize: 'clamp(20px, 4vw, 36px)', fontWeight: 900, background: 'linear-gradient(135deg, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {theme ?? '...'}
          </div>
        </motion.div>

        {/* Team info */}
        {chosenMode === 'teams' && myTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}
          >
            Team: <span style={{ color: myTeam.color, fontWeight: 700 }}>{myTeam.name}</span>
          </motion.div>
        )}

        <motion.p
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ color: 'rgba(255,255,255,0.3)', marginTop: 24, fontSize: 13 }}
        >
          Go create something! Use any medium you want.
        </motion.p>
      </motion.div>
    </div>
  );
}
