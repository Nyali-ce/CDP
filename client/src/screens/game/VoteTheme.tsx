import { motion } from 'framer-motion';
import { socket } from '../../socket/client';
import { useGameStore } from '../../store/gameStore';
import { VotePieChart } from '../../components/ui/VotePieChart';
import { CountdownRing } from '../../components/ui/CountdownRing';
import { PlayerCursors } from '../../components/ui/PlayerCursors';
import { ChatBox } from '../../components/ui/ChatBox';
import { useCursorBroadcast } from '../../hooks/useCursorBroadcast';

const THEME_COLORS = ['#a855f7', '#06b6d4', '#f59e0b'];

export function VoteTheme() {
  const votes = useGameStore((s) => s.votes);
  const players = useGameStore((s) => s.players);
  const myId = useGameStore((s) => s.myId);
  const countdown = useGameStore((s) => s.countdown);
  const themes = useGameStore((s) => s.currentThemes);
  const themeVoteGroups = useGameStore((s) => s.themeVoteGroups);
  useCursorBroadcast(true);

  const myGroup = themeVoteGroups.find((g) => g.playerIds.includes(myId));
  const displayThemes = myGroup ? myGroup.themes : themes;
  const currentVotes = myGroup ? myGroup.votes : votes;
  const groupPlayers = myGroup
    ? players.filter((p) => myGroup.playerIds.includes(p.id))
    : players;

  const myVote = currentVotes[myId];
  const options = displayThemes.map((t, i) => ({ key: String(i), label: t, color: THEME_COLORS[i] ?? '#fff' }));

  return (
    <div className="game-area" style={{
      position: 'relative', width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, #0a1a2e 0%, #0a0a0f 70%)',
    }}>
      <PlayerCursors />
      <ChatBox />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', zIndex: 10, maxWidth: 800, padding: '0 20px' }}
      >
        <h2 style={{ fontSize: 'clamp(22px, 4vw, 44px)', fontWeight: 900, marginBottom: 8 }}>
          Choose your theme 🎨
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 32, fontSize: 14 }}>
          {myGroup && themeVoteGroups.length > 1
            ? 'These are your group\'s themes — vote before the timer runs out!'
            : 'Vote for what you want to create!'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, marginBottom: 40, flexWrap: 'wrap' }}>
          <VotePieChart votes={currentVotes} players={groupPlayers} options={options} />
          <CountdownRing seconds={countdown} total={30} />
        </div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {options.map((opt) => {
            const selected = myVote === opt.key;
            return (
              <motion.button
                key={opt.key}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.96 }}
                animate={selected ? {
                  boxShadow: [`0 0 20px ${opt.color}66`, `0 0 40px ${opt.color}aa`, `0 0 20px ${opt.color}66`],
                } : { boxShadow: '0 0 0px rgba(0,0,0,0)' }}
                transition={selected ? { duration: 1.5, repeat: Infinity } : { duration: 0.3 }}
                onClick={() => socket.emit('vote-theme', parseInt(opt.key))}
                style={{
                  background: selected ? `linear-gradient(135deg, ${opt.color}44, ${opt.color}22)` : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${selected ? opt.color : opt.color + '44'}`,
                  borderRadius: 20,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 'clamp(16px, 2.5vw, 22px)',
                  padding: '28px 32px',
                  cursor: 'pointer',
                  minWidth: 180,
                  maxWidth: 220,
                  transition: 'background 0.2s, border-color 0.2s',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>🎭</div>
                {opt.label}
                {selected && <div style={{ fontSize: 12, fontWeight: 400, marginTop: 8, color: opt.color }}>Your vote ✓</div>}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
