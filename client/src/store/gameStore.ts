import { create } from 'zustand';
import type { GamePhase, Player, CursorPos, ChatMsg, Team, VoteMap, GameState, ThemeVoteGroup } from '@cdp/shared';

interface GameStore {
  // Auth
  siteUnlocked: boolean;
  setSiteUnlocked: (v: boolean) => void;

  // Player identity
  myId: string;
  myName: string;
  myColor: string;
  setIdentity: (id: string, name: string, color: string) => void;
  hasJoined: boolean;
  setHasJoined: (v: boolean) => void;

  // Game state
  phase: GamePhase;
  players: Player[];
  votes: VoteMap;
  teams: Team[];
  currentThemes: string[];
  chosenTheme: string | null;
  chosenMode: 'individual' | 'teams' | null;
  countdown: number;
  gameTimer: number;
  themeVoteGroups: ThemeVoteGroup[];

  // Cursors (other players)
  cursors: CursorPos[];

  // Chat
  chatMessages: ChatMsg[];

  // Admin
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;

  // Broadcast overlay
  broadcastMessage: string | null;
  setBroadcastMessage: (msg: string | null) => void;

  // Actions from socket events
  applyGameState: (state: GameState) => void;
  setPlayers: (players: Player[]) => void;
  setCursors: (cursors: CursorPos[]) => void;
  addChatMessage: (msg: ChatMsg) => void;
  setVotes: (votes: VoteMap) => void;
  setTeams: (teams: Team[]) => void;
  setPhase: (phase: GamePhase) => void;
  setCountdown: (n: number) => void;
  setCurrentThemes: (themes: string[]) => void;
  setChosenTheme: (theme: string | null) => void;
  setChosenMode: (mode: 'individual' | 'teams' | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  siteUnlocked: false,
  setSiteUnlocked: (v) => set({ siteUnlocked: v }),

  myId: '',
  myName: '',
  myColor: '#FF6B6B',
  setIdentity: (id, name, color) => set({ myId: id, myName: name, myColor: color }),
  hasJoined: false,
  setHasJoined: (v) => set({ hasJoined: v }),

  phase: 'LOBBY',
  players: [],
  votes: {},
  teams: [],
  currentThemes: [],
  chosenTheme: null,
  chosenMode: null,
  countdown: 0,
  gameTimer: 0,
  themeVoteGroups: [],
  cursors: [],
  chatMessages: [],
  isAdmin: false,
  setIsAdmin: (v) => set({ isAdmin: v }),

  broadcastMessage: null,
  setBroadcastMessage: (msg) => set({ broadcastMessage: msg }),

  applyGameState: (gs) => set({
    phase: gs.phase,
    players: gs.players,
    votes: gs.votes,
    teams: gs.teams,
    currentThemes: gs.currentThemes,
    chosenTheme: gs.chosenTheme,
    chosenMode: gs.chosenMode,
    countdown: gs.countdown,
    gameTimer: gs.gameTimer,
    themeVoteGroups: gs.themeVoteGroups ?? [],
  }),
  setPlayers: (players) => set({ players }),
  setCursors: (cursors) => set({ cursors }),
  addChatMessage: (msg) => set((s) => ({
    chatMessages: [...s.chatMessages.slice(-99), msg],
  })),
  setVotes: (votes) => set({ votes }),
  setTeams: (teams) => set({ teams }),
  setPhase: (phase) => set({ phase }),
  setCountdown: (countdown) => set({ countdown }),
  setCurrentThemes: (currentThemes) => set({ currentThemes }),
  setChosenTheme: (chosenTheme) => set({ chosenTheme }),
  setChosenMode: (chosenMode) => set({ chosenMode }),
}));
