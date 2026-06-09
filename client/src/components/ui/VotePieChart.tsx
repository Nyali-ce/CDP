import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { Player, VoteMap } from '@cdp/shared';

interface Props {
  votes: VoteMap;
  players: Player[];
  options: { key: string; label: string; color: string }[];
}

export function VotePieChart({ votes, players, options }: Props) {
  const counts: Record<string, number> = {};
  for (const opt of options) counts[opt.key] = 0;
  for (const v of Object.values(votes)) {
    if (counts[v] !== undefined) counts[v]++;
  }

  const data = options.map((opt) => ({
    name: opt.label,
    value: counts[opt.key],
    color: opt.color,
    key: opt.key,
  }));

  const totalVotes = Object.keys(votes).length;

  const votersByOption: Record<string, string[]> = {};
  for (const opt of options) votersByOption[opt.key] = [];
  for (const [playerId, vote] of Object.entries(votes)) {
    const player = players.find((p) => p.id === playerId);
    if (player && votersByOption[vote]) {
      votersByOption[vote].push(player.name);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
        {totalVotes} / {players.length} voted
      </div>
      <div style={{ width: 180, height: 180 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              isAnimationActive
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value} votes`, name]}
              contentStyle={{ background: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        {options.map((opt) => (
          <div key={opt.key} style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: opt.color }} />
              <span style={{ fontSize: 12, color: opt.color, fontWeight: 700 }}>{opt.label}</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
              {votersByOption[opt.key].slice(0, 3).join(', ')}
              {votersByOption[opt.key].length > 3 ? ` +${votersByOption[opt.key].length - 3}` : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
