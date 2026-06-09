import { BigAnnouncement } from '../../components/ui/BigAnnouncement';
import { useGameStore } from '../../store/gameStore';

export function AnnounceTheme() {
  const chosenTheme = useGameStore((s) => s.chosenTheme);
  const myId = useGameStore((s) => s.myId);
  const themeVoteGroups = useGameStore((s) => s.themeVoteGroups);

  const myGroup = themeVoteGroups.find((g) => g.playerIds.includes(myId));
  const theme = chosenTheme ?? myGroup?.chosenTheme ?? '...';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: 'radial-gradient(ellipse at center, #0a1a2e 0%, #0a0a0f 70%)' }}>
      <BigAnnouncement text={theme} subText="Game starting soon..." color="#06b6d4" />
    </div>
  );
}
