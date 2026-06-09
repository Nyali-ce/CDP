import { BigAnnouncement } from '../../components/ui/BigAnnouncement';
import { useGameStore } from '../../store/gameStore';

export function AnnounceMode() {
  const mode = useGameStore((s) => s.chosenMode);
  const text = mode === 'teams' ? 'TEAM UP! 🤝' : 'SOLO! ⚡';
  const sub = mode === 'teams' ? 'Generating your teams...' : 'Every player for themselves!';
  const color = mode === 'teams' ? '#f59e0b' : '#06b6d4';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: 'radial-gradient(ellipse at center, #1a0a2e 0%, #0a0a0f 70%)' }}>
      <BigAnnouncement text={text} subText={sub} color={color} />
    </div>
  );
}
