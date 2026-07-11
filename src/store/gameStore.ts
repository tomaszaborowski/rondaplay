import { create } from 'zustand';

export type GamePhase = 'lobby' | 'assign' | 'play' | 'vote' | 'results';

interface WordPair {
  innocent: string;
  imposter: string;
}

const WORD_PAIRS: WordPair[] = [
  { innocent: 'Apple', imposter: 'Pear' },
  { innocent: 'Football', imposter: 'Basketball' },
  { innocent: 'Airplane', imposter: 'Helicopter' },
  { innocent: 'Guitar', imposter: 'Violin' },
  { innocent: 'Coffee', imposter: 'Tea' },
  { innocent: 'Library', imposter: 'School' },
  { innocent: 'Beach', imposter: 'Swimming Pool' },
  { innocent: 'Laptop', imposter: 'Tablet' },
  { innocent: 'Pizza', imposter: 'Hamburger' },
  { innocent: 'Dog', imposter: 'Cat' },
  { innocent: 'Cinema', imposter: 'Theatre' },
  { innocent: 'Bicycle', imposter: 'Motorcycle' },
];

interface GameState {
  players: string[];
  imposters: string[];
  imposterCount: number;
  gamePhase: GamePhase;
  wordPair: WordPair | null;
  currentPlayerIndex: number;
  revealedCount: number;
  selectedVotes: Record<string, string>; // voter -> votedFor
  winner: 'innocents' | 'imposters' | null;
  
  // Actions
  addPlayer: (name: string) => void;
  removePlayer: (index: number) => void;
  setImposterCount: (count: number) => void;
  startGame: () => void;
  nextPlayerReveal: () => void;
  submitVote: (voter: string, votedFor: string) => void;
  tallyVotes: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  players: ['Alex', 'Emma', 'Lucas', 'Sofia'], // Default starting players
  imposters: [],
  imposterCount: 1,
  gamePhase: 'lobby',
  wordPair: null,
  currentPlayerIndex: 0,
  revealedCount: 0,
  selectedVotes: {},
  winner: null,

  addPlayer: (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    set((state) => {
      if (state.players.includes(trimmed)) return {};
      return { players: [...state.players, trimmed] };
    });
  },

  removePlayer: (index: number) => {
    set((state) => {
      const players = [...state.players];
      players.splice(index, 1);
      return { players };
    });
  },

  setImposterCount: (count: number) => {
    set({ imposterCount: count });
  },

  startGame: () => {
    const { players, imposterCount } = get();
    if (players.length < 3) return; // Need at least 3 players
    
    // Choose random word pair
    const wordPair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
    
    // Choose random imposters
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const chosenImposters = shuffled.slice(0, Math.min(imposterCount, players.length - 2));

    set({
      imposters: chosenImposters,
      wordPair,
      gamePhase: 'assign',
      currentPlayerIndex: 0,
      revealedCount: 0,
      selectedVotes: {},
      winner: null,
    });
  },

  nextPlayerReveal: () => {
    const { currentPlayerIndex, players } = get();
    if (currentPlayerIndex + 1 < players.length) {
      set({
        currentPlayerIndex: currentPlayerIndex + 1,
        gamePhase: 'assign',
      });
    } else {
      set({
        gamePhase: 'play',
      });
    }
  },

  submitVote: (voter: string, votedFor: string) => {
    set((state) => ({
      selectedVotes: { ...state.selectedVotes, [voter]: votedFor },
    }));
  },

  tallyVotes: () => {
    const { selectedVotes, imposters, players } = get();
    
    // Count votes
    const voteCounts: Record<string, number> = {};
    players.forEach(p => { voteCounts[p] = 0; });
    
    Object.values(selectedVotes).forEach((votedFor) => {
      voteCounts[votedFor] = (voteCounts[votedFor] || 0) + 1;
    });

    // Find the player with maximum votes
    let maxVotes = -1;
    let votedOutPlayer: string | null = null;
    let tie = false;

    Object.entries(voteCounts).forEach(([player, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        votedOutPlayer = player;
        tie = false;
      } else if (count === maxVotes) {
        tie = true;
      }
    });

    if (tie || !votedOutPlayer) {
      // Tie results in imposter win or retry. Let's make it so imposters win on tie to add pressure!
      set({
        gamePhase: 'results',
        winner: 'imposters',
      });
    } else {
      // Check if voted out player is an imposter
      const isImposter = imposters.includes(votedOutPlayer);
      set({
        gamePhase: 'results',
        winner: isImposter ? 'innocents' : 'imposters',
      });
    }
  },

  resetGame: () => {
    set({
      gamePhase: 'lobby',
      imposters: [],
      wordPair: null,
      currentPlayerIndex: 0,
      revealedCount: 0,
      selectedVotes: {},
      winner: null,
    });
  },
}));
