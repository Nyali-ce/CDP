import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface Props {
  seconds: number;
  total: number;
  size?: number;
}

export function CountdownRing({ seconds, total, size = 160 }: Props) {
  const progress = useMotionValue(seconds / total);
  const dashOffset = useTransform(progress, [0, 1], [0, 2 * Math.PI * 60]);
  const prevSeconds = useRef(seconds);

  useEffect(() => {
    if (prevSeconds.current !== seconds) {
      animate(progress, seconds / total, { duration: 0.9, ease: 'linear' });
      prevSeconds.current = seconds;
    }
  }, [seconds, total, progress]);

  const isUrgent = seconds <= 5;
  const color = isUrgent ? '#ef4444' : '#a855f7';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={60} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={6} />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={60}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 60}
            strokeDashoffset={dashOffset}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.28,
            fontWeight: 900,
            color: isUrgent ? '#ef4444' : '#fff',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {seconds}
        </div>
      </div>
    </div>
  );
}
