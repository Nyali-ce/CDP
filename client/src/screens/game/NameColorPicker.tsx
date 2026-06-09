import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { socket, connectSocket } from '../../socket/client';
import { useGameStore } from '../../store/gameStore';
import { ParticleField } from '../../components/three/ParticleField';

const PRESET_COLORS = [
  '#FF6B6B', '#FF9FF3', '#FECA57', '#48DBFB',
  '#FF9F43', '#54A0FF', '#5F27CD', '#00D2D3',
  '#1DD1A1', '#C44569', '#F8A5C2', '#F7D794',
];

export function NameColorPicker() {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#FF6B6B');
  const navigate = useNavigate();
  const setIdentity = useGameStore((s) => s.setIdentity);
  const setHasJoined = useGameStore((s) => s.setHasJoined);

  const join = () => {
    if (!name.trim()) return;
    connectSocket();
    socket.once('connect', () => {
      const id = socket.id ?? '';
      setIdentity(id, name.trim(), color);
      socket.emit('join-lobby', { name: name.trim(), color });
      setHasJoined(true);
      navigate('/game/lobby');
    });
    if (socket.connected) {
      const id = socket.id ?? '';
      setIdentity(id, name.trim(), color);
      socket.emit('join-lobby', { name: name.trim(), color });
      setHasJoined(true);
      navigate('/game/lobby');
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ParticleField />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          position: 'relative',
          zIndex: 10,
          background: 'rgba(10,10,20,0.75)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24,
          padding: '40px 48px',
          textAlign: 'center',
          maxWidth: 420,
          width: '90%',
        }}
      >
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Who are you?</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 32, fontSize: 14 }}>
          Pick a name and a color to represent you
        </p>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && join()}
          placeholder="Your name..."
          maxLength={24}
          autoFocus
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 12,
            color: '#fff',
            fontSize: 18,
            padding: '12px 16px',
            outline: 'none',
            marginBottom: 28,
            textAlign: 'center',
            fontWeight: 700,
          }}
        />

        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
            Your Color
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {PRESET_COLORS.map((c) => (
              <motion.button
                key={c}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setColor(c)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: c,
                  border: color === c ? '3px solid #fff' : '3px solid transparent',
                  cursor: 'pointer',
                  boxShadow: color === c ? `0 0 12px ${c}` : 'none',
                  transition: 'box-shadow 0.2s',
                }}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 28, padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}` }} />
          <span style={{ fontWeight: 700, fontSize: 16, color: color }}>{name || 'Preview'}</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={join}
          disabled={!name.trim()}
          style={{
            width: '100%',
            background: name.trim() ? `linear-gradient(135deg, ${color}, ${color}aa)` : 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: 12,
            color: name.trim() ? '#000' : 'rgba(255,255,255,0.3)',
            fontWeight: 900,
            fontSize: 17,
            padding: '14px',
            cursor: name.trim() ? 'pointer' : 'not-allowed',
            boxShadow: name.trim() ? `0 0 24px ${color}66` : 'none',
            transition: 'all 0.2s',
          }}
        >
          Join Game →
        </motion.button>
      </motion.div>
    </div>
  );
}
