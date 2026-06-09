import { motion } from 'framer-motion';
import { LobbyBackground } from '../../components/three/LobbyBackground';
import { PlayerCursors } from '../../components/ui/PlayerCursors';
import { ChatBox } from '../../components/ui/ChatBox';
import { PlayerList } from '../../components/ui/PlayerList';
import { useCursorBroadcast } from '../../hooks/useCursorBroadcast';
import { useGameStore } from '../../store/gameStore';

export function Lobby() {
  const players = useGameStore((s) => s.players);
  useCursorBroadcast(true);

  return (
    <div className="game-area" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <LobbyBackground players={players} />
      <PlayerCursors />

      {/* Center content */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 5, pointerEvents: 'none' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          style={{ textAlign: 'center' }}
        >
          <motion.h1
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            style={{
              fontSize: 'clamp(36px, 7vw, 88px)',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #a855f7, #06b6d4, #f59e0b, #a855f7)',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: -2,
              lineHeight: 1.1,
            }}
          >
            Waiting for host
            <br />
            to start
          </motion.h1>
          <motion.p
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ color: 'rgba(255,255,255,0.5)', marginTop: 20, fontSize: 16 }}
          >
            {players.length} player{players.length !== 1 ? 's' : ''} in lobby
          </motion.p>
        </motion.div>
      </div>

      <ChatBox />
      <PlayerList />
    </div>
  );
}
