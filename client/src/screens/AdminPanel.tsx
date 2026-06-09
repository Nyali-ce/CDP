import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { socket, connectSocket } from '../socket/client';
import { useGameStore } from '../store/gameStore';
import { VotePieChart } from '../components/ui/VotePieChart';

const PHASE_LABELS: Record<string, string> = {
  LOBBY: 'Lobby',
  VOTING_MODE: 'Voting: Mode',
  ANNOUNCING_MODE: 'Announcing Mode',
  TEAM_REVEAL: 'Team Reveal',
  VOTING_THEME: 'Voting: Theme',
  ANNOUNCING_THEME: 'Announcing Theme',
  GAME_STARTING: 'Game Starting',
  ACTIVE_GAME: 'Active Game',
};

export function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);
  const [timerHours, setTimerHours] = useState(1);
  const [sameTheme, setSameTheme] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const isAdmin = useGameStore((s) => s.isAdmin);
  const setIsAdmin = useGameStore((s) => s.setIsAdmin);
  const phase = useGameStore((s) => s.phase);
  const players = useGameStore((s) => s.players);
  const votes = useGameStore((s) => s.votes);
  const countdown = useGameStore((s) => s.countdown);
  const currentThemes = useGameStore((s) => s.currentThemes);
  const teams = useGameStore((s) => s.teams);
  const themeVoteGroups = useGameStore((s) => s.themeVoteGroups);

  useEffect(() => {
    if (!authed && isAdmin) setAuthed(true);
  }, [isAdmin, authed]);

  const tryAuth = () => {
    connectSocket();
    const doAuth = () => {
      socket.emit('admin-auth', password, (ok) => {
        if (ok) {
          setAuthed(true);
          setIsAdmin(true);
          setAuthError(false);
        } else {
          setAuthError(true);
        }
      });
    };
    if (socket.connected) {
      doAuth();
    } else {
      socket.once('connect', doAuth);
    }
  };

  const startGame = () => {
    socket.emit('admin-start-game', {
      timerSeconds: timerHours * 3600,
      sameTheme,
    });
  };

  const advance = () => socket.emit('admin-advance');
  const kick = (id: string) => socket.emit('admin-kick', id);
  const sendBroadcast = () => {
    const text = broadcastMsg.trim();
    if (text) {
      socket.emit('admin-broadcast', text);
      setBroadcastMsg('');
    }
  };

  if (!authed) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: '40px 48px',
            textAlign: 'center',
            maxWidth: 360,
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Admin Panel</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 24, fontSize: 14 }}>Enter admin password</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && tryAuth()}
            placeholder="Admin password..."
            autoFocus
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.08)',
              border: `1px solid ${authError ? '#ef4444' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: 10,
              color: '#fff',
              fontSize: 15,
              padding: '10px 14px',
              outline: 'none',
              marginBottom: 12,
            }}
          />
          {authError && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>Wrong password</p>}
          <button
            onClick={tryAuth}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #a855f7, #6366f1)',
              border: 'none',
              borderRadius: 10,
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              padding: '11px',
              cursor: 'pointer',
            }}
          >
            Access Panel
          </button>
        </motion.div>
      </div>
    );
  }

  const modeVoteOptions = [
    { key: 'individual', label: 'Solo', color: '#06b6d4' },
    { key: 'teams', label: 'Teams', color: '#f59e0b' },
  ];
  const themeVoteOptions = currentThemes.map((t, i) => ({
    key: String(i),
    label: t,
    color: ['#a855f7', '#06b6d4', '#f59e0b'][i] ?? '#fff',
  }));
  const isVoting = phase === 'VOTING_MODE' || phase === 'VOTING_THEME';

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', background: '#0a0a0f', padding: '24px', scrollbarWidth: 'thin' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900 }}>Admin Panel</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>
              Phase: <span style={{ color: '#a855f7', fontWeight: 700 }}>{PHASE_LABELS[phase] ?? phase}</span>
              {countdown > 0 && <span style={{ color: '#f59e0b', marginLeft: 12 }}>⏱ {countdown}s</span>}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1DD1A1', boxShadow: '0 0 8px #1DD1A1' }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Connected</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {/* Game Controls */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#a855f7' }}>Game Controls</h3>

            {phase === 'LOBBY' && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>
                    Timer (hours)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={2}
                    value={timerHours}
                    onChange={(e) => setTimerHours(Number(e.target.value))}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 16,
                      padding: '8px 12px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <input
                    type="checkbox"
                    id="same-theme"
                    checked={sameTheme}
                    onChange={(e) => setSameTheme(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#a855f7', cursor: 'pointer' }}
                  />
                  <label htmlFor="same-theme" style={{ fontSize: 14, cursor: 'pointer', userSelect: 'none' }}>
                    Same theme for everyone
                  </label>
                </div>
                <button
                  onClick={startGame}
                  disabled={players.length < 1}
                  style={{
                    width: '100%',
                    background: players.length >= 1 ? 'linear-gradient(135deg, #a855f7, #6366f1)' : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: 10,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 15,
                    padding: '12px',
                    cursor: players.length >= 1 ? 'pointer' : 'not-allowed',
                    boxShadow: players.length >= 1 ? '0 0 20px rgba(168,85,247,0.4)' : 'none',
                  }}
                >
                  Start Game ({players.length} player{players.length !== 1 ? 's' : ''})
                </button>
              </>
            )}

            {phase === 'ACTIVE_GAME' && (
              <button
                onClick={advance}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none',
                  borderRadius: 10,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 15,
                  padding: '12px',
                  cursor: 'pointer',
                }}
              >
                End Game → Return to Lobby
              </button>
            )}

            {!['LOBBY', 'ACTIVE_GAME'].includes(phase) && (
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center' }}>
                Game is in progress — {PHASE_LABELS[phase]}
              </div>
            )}
          </div>

          {/* Players */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#06b6d4' }}>
              Players ({players.length})
            </h3>
            {players.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No players yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {players.map((p) => {
                  const hasVoted = !!votes[p.id];
                  const team = teams.find((t) => t.playerIds.includes(p.id));
                  return (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 10px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, boxShadow: `0 0 6px ${p.color}`, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</span>
                        {team && <span style={{ fontSize: 11, color: team.color, marginLeft: 8 }}>{team.name}</span>}
                        {isVoting && (
                          <span style={{ fontSize: 11, color: hasVoted ? '#1DD1A1' : 'rgba(255,255,255,0.3)', marginLeft: 8 }}>
                            {hasVoted ? '✓ voted' : '...'}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => kick(p.id)}
                        style={{
                          background: 'rgba(239,68,68,0.15)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          borderRadius: 6,
                          color: '#ef4444',
                          fontSize: 11,
                          padding: '3px 8px',
                          cursor: 'pointer',
                        }}
                      >
                        Kick
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Broadcast Message */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#f59e0b' }}>Broadcast Message</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 12 }}>
              Displays big on every player's screen for 10 seconds.
            </p>
            <input
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendBroadcast()}
              placeholder="Type a message..."
              maxLength={300}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                padding: '10px 12px',
                outline: 'none',
                marginBottom: 10,
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={sendBroadcast}
              disabled={!broadcastMsg.trim()}
              style={{
                width: '100%',
                background: broadcastMsg.trim() ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 8,
                color: '#000',
                fontWeight: 700,
                fontSize: 14,
                padding: '10px',
                cursor: broadcastMsg.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Send to All Players
            </button>
          </div>

          {/* Vote monitor */}
          {isVoting && (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#f59e0b' }}>Live Votes</h3>
              {phase === 'VOTING_THEME' && themeVoteGroups.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {themeVoteGroups.map((group) => {
                    const groupOpts = group.themes.map((t, i) => ({
                      key: String(i),
                      label: t,
                      color: ['#a855f7', '#06b6d4', '#f59e0b'][i] ?? '#fff',
                    }));
                    const groupPlayers = players.filter((p) => group.playerIds.includes(p.id));
                    const groupLabel = teams.find((t) => t.id === group.groupId)?.name
                      ?? groupPlayers[0]?.name
                      ?? group.groupId;
                    return (
                      <div key={group.groupId}>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                          {groupLabel}
                        </div>
                        <VotePieChart votes={group.votes} players={groupPlayers} options={groupOpts} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <VotePieChart
                  votes={votes}
                  players={players}
                  options={phase === 'VOTING_MODE' ? modeVoteOptions : themeVoteOptions}
                />
              )}
            </div>
          )}

          {/* Teams display */}
          {teams.length > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#1DD1A1' }}>Teams</h3>
              {teams.map((team) => (
                <div key={team.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: team.color }} />
                    <span style={{ fontWeight: 700, color: team.color, fontSize: 13 }}>{team.name}</span>
                  </div>
                  {team.playerIds.map((pid) => {
                    const pl = players.find((p) => p.id === pid);
                    return pl ? <div key={pid} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', paddingLeft: 16, marginBottom: 2 }}>{pl.name}</div> : null;
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
