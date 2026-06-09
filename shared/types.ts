export type GamePhase =
  | 'LOBBY'
  | 'VOTING_MODE'
  | 'ANNOUNCING_MODE'
  | 'TEAM_REVEAL'
  | 'VOTING_THEME'
  | 'ANNOUNCING_THEME'
  | 'GAME_STARTING'
  | 'ACTIVE_GAME';

export interface Player {
  id: string;
  name: string;
  color: string;
  teamId?: string;
  isAdmin?: boolean;
}

export interface CursorPos {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

export interface ChatMsg {
  id: string;
  name: string;
  color: string;
  text: string;
  ts: number;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  playerIds: string[];
  theme?: string;
}

export interface ThemeVoteGroup {
  groupId: string;
  playerIds: string[];
  themes: string[];
  votes: VoteMap;
  chosenTheme?: string;
}

export type VoteMap = Record<string, string>;

export interface GameConfig {
  timerSeconds: number;
  sameTheme: boolean;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  votes: VoteMap;
  teams: Team[];
  currentThemes: string[];
  chosenTheme: string | null;
  chosenMode: 'individual' | 'teams' | null;
  countdown: number;
  gameTimer: number;
  config: GameConfig;
  themeVoteGroups: ThemeVoteGroup[];
}

export interface AdminState extends GameState {
  allCursors: CursorPos[];
  chatHistory: ChatMsg[];
}

export interface ServerToClientEvents {
  'game-state': (state: GameState) => void;
  'players-update': (players: Player[]) => void;
  'cursors-update': (cursors: CursorPos[]) => void;
  'chat-message': (msg: ChatMsg) => void;
  'phase-change': (phase: GamePhase, data?: unknown) => void;
  'vote-update': (votes: VoteMap) => void;
  'teams-assigned': (teams: Team[]) => void;
  'timer-tick': (seconds: number) => void;
  'admin-state': (state: AdminState) => void;
  'kicked': () => void;
  'broadcast-message': (message: string) => void;
}

export interface ClientToServerEvents {
  'join-lobby': (payload: { name: string; color: string }) => void;
  'cursor-move': (pos: { x: number; y: number }) => void;
  'send-chat': (text: string) => void;
  'vote-mode': (vote: 'individual' | 'teams') => void;
  'vote-theme': (themeIndex: number) => void;
  'admin-auth': (password: string, cb: (ok: boolean) => void) => void;
  'admin-start-game': (config: GameConfig) => void;
  'admin-advance': () => void;
  'admin-kick': (playerId: string) => void;
  'admin-reset': () => void;
  'admin-broadcast': (message: string) => void;
}

export interface InterServerEvents {}
export interface SocketData {}
