import { v4 as uuid } from 'uuid';
import type { GamePhase, GameState, Player, CursorPos, ChatMsg, Team, VoteMap, GameConfig, ThemeVoteGroup } from '../../shared/types.js';
import { THEMES } from './themes.js';
import { generateTeams } from './teams.js';

function pickRandomThemes(count = 3): string[] {
  const shuffled = [...THEMES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

interface State {
  phase: GamePhase;
  players: Map<string, Player>;
  cursors: Map<string, CursorPos>;
  chatHistory: ChatMsg[];
  votes: VoteMap;
  teams: Team[];
  currentThemes: string[];
  chosenTheme: string | null;
  chosenMode: 'individual' | 'teams' | null;
  countdown: number;
  gameTimer: number;
  config: GameConfig;
  themeVoteGroups: ThemeVoteGroup[];
  countdownInterval: ReturnType<typeof setInterval> | null;
  adminSocketIds: Set<string>;
  onPhaseChange?: (phase: GamePhase, data?: unknown) => void;
  onTimerTick?: (seconds: number) => void;
  onVoteUpdate?: (votes: VoteMap) => void;
  onTeamsAssigned?: (teams: Team[]) => void;
  onPlayersUpdate?: (players: Player[]) => void;
}

const state: State = {
  phase: 'LOBBY',
  players: new Map(),
  cursors: new Map(),
  chatHistory: [],
  votes: {},
  teams: [],
  currentThemes: [],
  chosenTheme: null,
  chosenMode: null,
  countdown: 0,
  gameTimer: 0,
  config: { timerSeconds: 3600, sameTheme: false },
  themeVoteGroups: [],
  countdownInterval: null,
  adminSocketIds: new Set(),
};

export function getState(): GameState {
  return {
    phase: state.phase,
    players: [...state.players.values()],
    votes: { ...state.votes },
    teams: state.teams,
    currentThemes: state.currentThemes,
    chosenTheme: state.chosenTheme,
    chosenMode: state.chosenMode,
    countdown: state.countdown,
    gameTimer: state.gameTimer,
    config: state.config,
    themeVoteGroups: state.themeVoteGroups.map((g) => ({ ...g, votes: { ...g.votes } })),
  };
}

export function addPlayer(id: string, name: string, color: string): Player {
  const player: Player = { id, name, color };
  state.players.set(id, player);
  return player;
}

export function removePlayer(id: string): void {
  state.players.delete(id);
  state.cursors.delete(id);
  delete state.votes[id];
  state.adminSocketIds.delete(id);
}

export function getPlayers(): Player[] {
  return [...state.players.values()];
}

export function updateCursor(id: string, x: number, y: number): void {
  const player = state.players.get(id);
  if (!player) return;
  state.cursors.set(id, { id, name: player.name, color: player.color, x, y });
}

export function getCursors(): CursorPos[] {
  return [...state.cursors.values()];
}

export function addChatMessage(playerId: string, text: string, teamId?: string): ChatMsg | null {
  const player = state.players.get(playerId);
  if (!player) return null;
  const msg: ChatMsg = {
    id: uuid(),
    name: player.name,
    color: player.color,
    text: text.slice(0, 300),
    ts: Date.now(),
    ...(teamId ? { teamId } : {}),
  };
  state.chatHistory.push(msg);
  if (state.chatHistory.length > 100) state.chatHistory.shift();
  return msg;
}

export function getPlayerTeamId(playerId: string): string | undefined {
  return state.teams.find((t) => t.playerIds.includes(playerId))?.id;
}

export function getTeamPlayerIds(teamId: string): string[] {
  return state.teams.find((t) => t.id === teamId)?.playerIds ?? [];
}

export function getChatHistory(): ChatMsg[] {
  return state.chatHistory;
}

export function setVote(playerId: string, vote: string): void {
  if (state.players.has(playerId)) {
    state.votes[playerId] = vote;
  }
}

export function setGroupVote(playerId: string, themeIndex: number): void {
  const group = state.themeVoteGroups.find((g) => g.playerIds.includes(playerId));
  if (group) {
    group.votes[playerId] = String(themeIndex);
  }
}

export function hasThemeVoteGroups(): boolean {
  return state.themeVoteGroups.length > 0;
}

export function clearVotes(): void {
  state.votes = {};
}

function stopCountdown(): void {
  if (state.countdownInterval) {
    clearInterval(state.countdownInterval);
    state.countdownInterval = null;
  }
}

function startCountdown(seconds: number, onDone: () => void): void {
  stopCountdown();
  state.countdown = seconds;
  state.onTimerTick?.(state.countdown);
  state.countdownInterval = setInterval(() => {
    state.countdown--;
    state.onTimerTick?.(state.countdown);
    if (state.countdown <= 0) {
      stopCountdown();
      onDone();
    }
  }, 1000);
}

function tallyVotes(): string {
  const counts: Record<string, number> = {};
  for (const v of Object.values(state.votes)) {
    counts[v] = (counts[v] ?? 0) + 1;
  }
  let winner = '';
  let max = -1;
  for (const [k, v] of Object.entries(counts)) {
    if (v > max) { max = v; winner = k; }
  }
  return winner;
}

export function registerCallbacks(
  onPhaseChange: State['onPhaseChange'],
  onTimerTick: State['onTimerTick'],
  onVoteUpdate: State['onVoteUpdate'],
  onTeamsAssigned: State['onTeamsAssigned'],
  onPlayersUpdate: State['onPlayersUpdate'],
): void {
  state.onPhaseChange = onPhaseChange;
  state.onTimerTick = onTimerTick;
  state.onVoteUpdate = onVoteUpdate;
  state.onTeamsAssigned = onTeamsAssigned;
  state.onPlayersUpdate = onPlayersUpdate;
}

export function startGame(config: GameConfig): void {
  if (state.phase !== 'LOBBY') return;
  state.config = config;
  clearVotes();
  transitionTo('VOTING_MODE');
}

export function adminAdvance(): void {
  if (state.phase === 'ACTIVE_GAME') {
    resetToLobby();
  }
}

function transitionTo(phase: GamePhase, data?: unknown): void {
  stopCountdown();
  state.phase = phase;
  state.onPhaseChange?.(phase, data);

  if (phase === 'VOTING_MODE') {
    startCountdown(30, () => resolveVoteMode());
  } else if (phase === 'ANNOUNCING_MODE') {
    startCountdown(5, () => {
      if (state.chosenMode === 'teams') {
        const teams = generateTeams([...state.players.keys()]);
        state.teams = teams;
        for (const team of teams) {
          for (const pid of team.playerIds) {
            const p = state.players.get(pid);
            if (p) p.teamId = team.id;
          }
        }
        state.onTeamsAssigned?.(state.teams);
        state.onPlayersUpdate?.(getPlayers());
        transitionTo('TEAM_REVEAL');
      } else {
        beginThemeVoting();
      }
    });
  } else if (phase === 'TEAM_REVEAL') {
    startCountdown(8, () => beginThemeVoting());
  } else if (phase === 'VOTING_THEME') {
    startCountdown(30, () => resolveVoteTheme());
  } else if (phase === 'ANNOUNCING_THEME') {
    startCountdown(5, () => transitionTo('GAME_STARTING'));
  } else if (phase === 'GAME_STARTING') {
    startCountdown(3, () => {
      state.countdown = 0;
      state.gameTimer = state.config.timerSeconds;
      transitionTo('ACTIVE_GAME');
    });
  } else if (phase === 'ACTIVE_GAME') {
    startCountdown(state.config.timerSeconds, () => resetToLobby());
  }
}

function beginThemeVoting(): void {
  clearVotes();
  if (state.config.sameTheme) {
    // Global vote between 3 themes — everyone votes regardless of teams
    state.currentThemes = pickRandomThemes(3);
    state.themeVoteGroups = [];
    transitionTo('VOTING_THEME');
  } else {
    state.currentThemes = [];
    if (state.chosenMode === 'teams' && state.teams.length > 0) {
      state.themeVoteGroups = state.teams.map((team) => ({
        groupId: team.id,
        playerIds: [...team.playerIds],
        themes: pickRandomThemes(3),
        votes: {},
      }));
    } else {
      state.themeVoteGroups = [...state.players.keys()].map((playerId) => ({
        groupId: playerId,
        playerIds: [playerId],
        themes: pickRandomThemes(3),
        votes: {},
      }));
    }
    transitionTo('VOTING_THEME');
  }
}

function resolveVoteMode(): void {
  const winner = tallyVotes() as 'individual' | 'teams' | '';
  state.chosenMode = winner === 'teams' ? 'teams' : 'individual';
  clearVotes();
  transitionTo('ANNOUNCING_MODE', { mode: state.chosenMode });
}

function resolveVoteTheme(): void {
  if (state.themeVoteGroups.length > 0) {
    for (const group of state.themeVoteGroups) {
      const counts: Record<string, number> = {};
      for (const v of Object.values(group.votes)) {
        counts[v] = (counts[v] ?? 0) + 1;
      }
      let winner = '0';
      let max = -1;
      for (const [k, v] of Object.entries(counts)) {
        if (v > max) { max = v; winner = k; }
      }
      const idx = parseInt(winner, 10);
      group.chosenTheme = group.themes[isNaN(idx) ? 0 : idx] ?? group.themes[0];
    }
    transitionTo('ANNOUNCING_THEME', {});
  } else {
    const winnerIndex = tallyVotes();
    const idx = parseInt(winnerIndex, 10);
    state.chosenTheme = state.currentThemes[isNaN(idx) ? 0 : idx] ?? state.currentThemes[0];
    clearVotes();
    transitionTo('ANNOUNCING_THEME', { theme: state.chosenTheme });
  }
}

function resetToLobby(): void {
  stopCountdown();
  state.phase = 'LOBBY';
  state.votes = {};
  state.teams = [];
  state.currentThemes = [];
  state.chosenTheme = null;
  state.chosenMode = null;
  state.countdown = 0;
  state.gameTimer = 0;
  state.themeVoteGroups = [];
  for (const p of state.players.values()) delete p.teamId;
  state.onPhaseChange?.('LOBBY');
}

export function isAdmin(socketId: string): boolean {
  return state.adminSocketIds.has(socketId);
}

export function addAdmin(socketId: string): void {
  state.adminSocketIds.add(socketId);
}

export function removeAdmin(socketId: string): void {
  state.adminSocketIds.delete(socketId);
}

export function kickPlayer(playerId: string): boolean {
  if (!state.players.has(playerId)) return false;
  removePlayer(playerId);
  return true;
}
