import type { Team } from '../../shared/types.js';

const TEAM_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
];

const TEAM_NAMES = [
  'The Wildcards', 'Neon Prophets', 'Static Dreams',
  'Phantom Ink', 'Raw Signal', 'Velvet Noise',
  'Prism Gang', 'Deep Cut', 'The Overflow',
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateTeams(playerIds: string[]): Team[] {
  const shuffled = shuffle(playerIds);
  const teams: Team[] = [];
  const teamSize = shuffled.length <= 4 ? 2 : 3;
  let i = 0;
  let teamIndex = 0;

  while (i < shuffled.length) {
    const remaining = shuffled.length - i;
    const size = remaining <= teamSize + 1 ? remaining : teamSize;
    const team: Team = {
      id: `team-${teamIndex}`,
      name: TEAM_NAMES[teamIndex % TEAM_NAMES.length],
      color: TEAM_COLORS[teamIndex % TEAM_COLORS.length],
      playerIds: shuffled.slice(i, i + size),
    };
    teams.push(team);
    i += size;
    teamIndex++;
  }

  return teams;
}
