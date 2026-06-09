import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { socket } from './socket/client';
import { useSocketEvents } from './hooks/useSocketEvents';
import { useGameStore } from './store/gameStore';
import { PasswordGate } from './screens/PasswordGate';
import { Hub } from './screens/Hub';
import { NameColorPicker } from './screens/game/NameColorPicker';
import { Lobby } from './screens/game/Lobby';
import { VoteMode } from './screens/game/VoteMode';
import { AnnounceMode } from './screens/game/AnnounceMode';
import { TeamReveal } from './screens/game/TeamReveal';
import { VoteTheme } from './screens/game/VoteTheme';
import { AnnounceTheme } from './screens/game/AnnounceTheme';
import { ActiveGame } from './screens/game/ActiveGame';
import { AdminPanel } from './screens/AdminPanel';

const PHASE_ROUTES: Record<string, string> = {
  LOBBY: '/game/lobby',
  VOTING_MODE: '/game/vote-mode',
  ANNOUNCING_MODE: '/game/announce-mode',
  TEAM_REVEAL: '/game/team-reveal',
  VOTING_THEME: '/game/vote-theme',
  ANNOUNCING_THEME: '/game/announce-theme',
  GAME_STARTING: '/game/announce-theme',
  ACTIVE_GAME: '/game/active',
};

function GamePhaseRouter() {
  const phase = useGameStore((s) => s.phase);
  const hasJoined = useGameStore((s) => s.hasJoined);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!hasJoined) return;
    const target = PHASE_ROUTES[phase];
    if (target && location.pathname !== target) {
      navigate(target, { replace: true });
    }
  }, [phase, hasJoined, navigate, location.pathname]);

  useEffect(() => {
    socket.on('kicked', () => {
      useGameStore.getState().setHasJoined(false);
      navigate('/game', { replace: true });
    });
    return () => { socket.off('kicked'); };
  }, [navigate]);

  return null;
}

function RequireUnlocked({ children }: { children: React.ReactNode }) {
  const unlocked = useGameStore((s) => s.siteUnlocked);
  if (!unlocked) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function BroadcastOverlay() {
  const message = useGameStore((s) => s.broadcastMessage);
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key="broadcast"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.75)',
            pointerEvents: 'none',
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(99,102,241,0.15))',
            border: '2px solid rgba(168,85,247,0.5)',
            borderRadius: 24,
            padding: '40px 60px',
            maxWidth: '80vw',
            textAlign: 'center',
            boxShadow: '0 0 60px rgba(168,85,247,0.3)',
          }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 16 }}>
              Message from Admin
            </div>
            <div style={{
              fontSize: 'clamp(24px, 5vw, 56px)',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.2,
              textShadow: '0 0 30px rgba(168,85,247,0.6)',
            }}>
              {message}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  useSocketEvents();

  return (
    <>
      <GamePhaseRouter />
      <BroadcastOverlay />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<PasswordGate />} />
          <Route path="/hub" element={<RequireUnlocked><Hub /></RequireUnlocked>} />
          <Route path="/game" element={<RequireUnlocked><NameColorPicker /></RequireUnlocked>} />
          <Route path="/game/lobby" element={<RequireUnlocked><Lobby /></RequireUnlocked>} />
          <Route path="/game/vote-mode" element={<RequireUnlocked><VoteMode /></RequireUnlocked>} />
          <Route path="/game/announce-mode" element={<RequireUnlocked><AnnounceMode /></RequireUnlocked>} />
          <Route path="/game/team-reveal" element={<RequireUnlocked><TeamReveal /></RequireUnlocked>} />
          <Route path="/game/vote-theme" element={<RequireUnlocked><VoteTheme /></RequireUnlocked>} />
          <Route path="/game/announce-theme" element={<RequireUnlocked><AnnounceTheme /></RequireUnlocked>} />
          <Route path="/game/active" element={<RequireUnlocked><ActiveGame /></RequireUnlocked>} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
