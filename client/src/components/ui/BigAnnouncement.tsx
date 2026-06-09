import { motion } from 'framer-motion';

interface Props {
  text: string;
  subText?: string;
  color?: string;
}

export function BigAnnouncement({ text, subText, color = '#fff' }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 30,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <motion.div
        initial={{ scale: 0.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 10, stiffness: 100 }}
        style={{
          fontSize: 'clamp(48px, 10vw, 120px)',
          fontWeight: 900,
          color,
          textAlign: 'center',
          textShadow: `0 0 40px ${color}88, 0 0 80px ${color}44`,
          lineHeight: 1.1,
          padding: '0 20px',
        }}
      >
        {text}
      </motion.div>
      {subText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            fontSize: 'clamp(18px, 3vw, 32px)',
            color: 'rgba(255,255,255,0.7)',
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          {subText}
        </motion.div>
      )}
    </motion.div>
  );
}
