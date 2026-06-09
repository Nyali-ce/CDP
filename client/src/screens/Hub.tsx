import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ParticleField } from '../components/three/ParticleField';

const items = [
  { id: 'game', label: 'Creative Game', icon: '🎮', desc: 'Multiplayer creative challenge', color: '#a855f7', available: true },
  { id: 'photos', label: 'Photos', icon: '📸', desc: 'Coming soon', color: '#06b6d4', available: false },
  { id: 'more', label: 'More Soon', icon: '✨', desc: 'Stay tuned', color: '#f59e0b', available: false },
];

function HubCard({ label, icon, desc, color, available, onClick }: {
  label: string; icon: string; desc: string; color: string; available: boolean; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={available ? { scale: 1.05, rotateX: -5, rotateY: 5 } : {}}
      whileTap={available ? { scale: 0.97 } : {}}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={available ? onClick : undefined}
      style={{
        background: hovered && available
          ? `linear-gradient(135deg, ${color}22, ${color}11)`
          : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hovered && available ? color + '66' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 20,
        padding: '32px 28px',
        cursor: available ? 'pointer' : 'default',
        opacity: available ? 1 : 0.5,
        transition: 'background 0.3s, border-color 0.3s',
        boxShadow: hovered && available ? `0 0 40px ${color}33` : 'none',
        minWidth: 200,
        textAlign: 'center',
        perspective: 1000,
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: available ? '#fff' : 'rgba(255,255,255,0.5)' }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{desc}</div>
      {!available && (
        <div style={{ fontSize: 11, color: color, marginTop: 8, fontWeight: 600 }}>Coming Soon</div>
      )}
    </motion.div>
  );
}

export function Hub() {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <ParticleField />
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, marginBottom: 12, letterSpacing: -2 }}
        >
          Club des Petits
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 48, fontSize: 16 }}
        >
          What do you want to do?
        </motion.p>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {items.map((item, i) => (
            <motion.div key={item.id} transition={{ delay: 0.1 + i * 0.1 }}>
              <HubCard
                {...item}
                onClick={() => item.id === 'game' && navigate('/game')}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
