import { motion } from 'framer-motion';
import { socket } from '../../socket/client';
import { useGameStore } from '../../store/gameStore';
import { VotePieChart } from '../../components/ui/VotePieChart';
import { CountdownRing } from '../../components/ui/CountdownRing';
import { PlayerCursors } from '../../components/ui/PlayerCursors';
import { ChatBox } from '../../components/ui/ChatBox';
import { useCursorBroadcast } from '../../hooks/useCursorBroadcast';

const OPTIONS = [
  { key: 'individual', label: 'Go Solo', color: '#06b6d4' },
  { key: 'teams', label: 'Team Up', color: '#f59e0b' },
];

export function VoteMode() {
  const votes = useGameStore((s) => s.votes);
  const players = useGameStore((s) => s.players);
  const myId = useGameStore((s) => s.myId);
  const countdown = useGameStore((s) => s.countdown);
  const myVote = votes[myId];
  useCursorBroadcast(true);

  const vote = (v: 'individual' | 'teams') => socket.emit('vote-mode', v);

  return (
    <div className="game-area" style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at center, #1a0a2e 0%, #0a0a0f 70%)' }}>
      <PlayerCursors />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', zIndex: 10 }}
      >
        <h2 style={{ fontSize: 'clamp(22px, 4vw, 44px)', fontWeight: 900, marginBottom: 8 }}>
          How do you want to play?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 32, fontSize: 14 }}>
          Vote before the timer runs out — you can change your mind!
        </p>

        {/* Pie + Timer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, marginBottom: 40, flexWrap: 'wrap' }}>
          <VotePieChart votes={votes} players={players} options={OPTIONS} />
          <CountdownRing seconds={countdown} total={30} />
        </div>

        {/* Vote buttons */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          {OPTIONS.map((opt) => {
            const selected = myVote === opt.key;
            return (
              <motion.button
                key={opt.key}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                animate={selected ? {
                  boxShadow: [`0 0 20px ${opt.color}66`, `0 0 40px ${opt.color}aa`, `0 0 20px ${opt.color}66`],
                } : { boxShadow: '0 0 0px rgba(0,0,0,0)' }}
                transition={selected ? { duration: 1.5, repeat: Infinity } : { duration: 0.3 }}
                onClick={() => vote(opt.key as 'individual' | 'teams')}
                style={{
                  background: selected ? `linear-gradient(135deg, ${opt.color}, ${opt.color}bb)` : 'rgba(255,255,255,0.06)',
                  border: `2px solid ${selected ? opt.color : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 20,
                  color: selected ? '#000' : '#fff',
                  fontWeight: 900,
                  fontSize: 'clamp(18px, 3vw, 28px)',
                  padding: '24px 48px',
                  cursor: 'pointer',
                  transition: 'background 0.2s, color 0.2s',
                  minWidth: 180,
                }}
              >
                {opt.label}
                {selected && <div style={{ fontSize: 12, fontWeight: 400, marginTop: 4, opacity: 0.7 }}>Your vote ✓</div>}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <ChatBox />
    </div>
  );
}
