import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ParticleField } from '../components/three/ParticleField';
import { useGameStore } from '../store/gameStore';

export function PasswordGate() {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const setSiteUnlocked = useGameStore((s) => s.setSiteUnlocked);
  const navigate = useNavigate();

  const submit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: input }),
      });
      if (res.ok) {
        setSiteUnlocked(true);
        navigate('/hub');
      } else {
        setError(true);
        setInput('');
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ParticleField />

      <motion.div
        animate={error ? { x: [-8, 8, -8, 8, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '48px 40px',
          background: 'rgba(10,10,20,0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: 20,
          boxShadow: '0 0 60px rgba(168,85,247,0.15)',
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: -1 }}
        >
          🤏Club des Petits🤏
        </motion.h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32, fontSize: 14 }}>
          Enter password to continue
        </p>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Password..."
            autoFocus
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: 10,
              color: '#fff',
              fontSize: 16,
              padding: '10px 16px',
              outline: 'none',
              width: 220,
              transition: 'border-color 0.2s',
            }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={submit}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #a855f7, #6366f1)',
              border: 'none',
              borderRadius: 10,
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              padding: '10px 22px',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(168,85,247,0.4)',
            }}
          >
            {loading ? '...' : '→'}
          </motion.button>
        </div>

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#ef4444', marginTop: 12, fontSize: 13 }}>
            Wrong password, try again
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
