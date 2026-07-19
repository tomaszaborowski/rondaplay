import { create } from 'zustand';

export type GamePhase = 'lobby' | 'assign' | 'play' | 'vote' | 'results';

export interface WordPair {
  innocent: string;
  imposter: string;
}

export const CATEGORIES_DB: Record<string, { free: boolean; pairs: WordPair[] }> = {
  'Objetos': {
    free: true,
    pairs: [
      { innocent: 'Manzana', imposter: 'Pera' },
      { innocent: 'Computadora', imposter: 'Tablet' },
      { innocent: 'Pizza', imposter: 'Hamburguesa' },
      { innocent: 'Bicicleta', imposter: 'Motocicleta' },
      { innocent: 'Avión', imposter: 'Helicóptero' },
      { innocent: 'Guitarra', imposter: 'Violín' },
      { innocent: 'Café', imposter: 'Té' }
    ]
  },
  'Animales': {
    free: true,
    pairs: [
      { innocent: 'Perro', imposter: 'Gato' },
      { innocent: 'León', imposter: 'Tigre' },
      { innocent: 'Delfín', imposter: 'Tiburón' },
      { innocent: 'Caballo', imposter: 'Cebra' },
      { innocent: 'Oso', imposter: 'Panda' },
      { innocent: 'Rana', imposter: 'Sapo' }
    ]
  },
  'Películas': {
    free: false, // Premium
    pairs: [
      { innocent: 'Star Wars', imposter: 'Star Trek' },
      { innocent: 'Harry Potter', imposter: 'El Señor de los Anillos' },
      { innocent: 'Batman', imposter: 'Spiderman' },
      { innocent: 'Titanic', imposter: 'Avatar' },
      { innocent: 'Toy Story', imposter: 'Shrek' }
    ]
  },
  'Lugares': {
    free: false, // Premium
    pairs: [
      { innocent: 'París', imposter: 'Roma' },
      { innocent: 'Tokio', imposter: 'Seúl' },
      { innocent: 'Nueva York', imposter: 'Los Ángeles' },
      { innocent: 'Londres', imposter: 'Madrid' },
      { innocent: 'El Cairo', imposter: 'Atenas' }
    ]
  },
  'Profesiones': {
    free: false, // Premium
    pairs: [
      { innocent: 'Médico', imposter: 'Enfermero' },
      { innocent: 'Piloto', imposter: 'Conductor' },
      { innocent: 'Policía', imposter: 'Bombero' },
      { innocent: 'Chef', imposter: 'Panadero' },
      { innocent: 'Pintor', imposter: 'Escultor' }
    ]
  }
};

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
  
  // New requirements
  category: string;
  gameMode: 'local' | 'online';
  lobbyId: string | null;
  isHost: boolean;
  scoreboard: Record<string, number>;
  isPremium: boolean;
  
  // Actions
  initializePlayers: () => void;
  addPlayer: (name: string) => void;
  removePlayer: (index: number) => void;
  renamePlayer: (index: number, newName: string) => void;
  setImposterCount: (count: number) => void;
  setCategory: (cat: string) => void;
  setGameMode: (mode: 'local' | 'online') => void;
  setLobbyId: (id: string | null) => void;
  setIsHost: (isHost: boolean) => void;
  setPremium: (premium: boolean) => void;
  startGame: () => void;
  nextPlayerReveal: () => void;
  submitVote: (voter: string, votedFor: string) => void;
  tallyVotes: () => void;
  resetGame: () => void;
  updateScoreboard: (winner: 'innocents' | 'imposters') => void;
  resetScoreboard: () => void;
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
  
  category: 'Objetos',
  gameMode: 'local',
  lobbyId: null,
  isHost: true,
  scoreboard: {},
  isPremium: false,

  initializePlayers: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('rondaplay_imposter_players');
      const premium = localStorage.getItem('rondaplay_premium') === 'true';
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length >= 3) {
            set({ players: parsed, isPremium: premium });
            return;
          }
        } catch (_) {}
      }
      set({ isPremium: premium });
    }
  },

  addPlayer: (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    set((state) => {
      if (state.players.includes(trimmed)) return {};
      const nextPlayers = [...state.players, trimmed];
      if (typeof window !== 'undefined') {
        localStorage.setItem('rondaplay_imposter_players', JSON.stringify(nextPlayers));
      }
      return { players: nextPlayers };
    });
  },

  removePlayer: (index: number) => {
    set((state) => {
      const players = [...state.players];
      players.splice(index, 1);
      if (typeof window !== 'undefined') {
        localStorage.setItem('rondaplay_imposter_players', JSON.stringify(players));
      }
      return { players };
    });
  },

  renamePlayer: (index: number, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    set((state) => {
      const players = [...state.players];
      players[index] = trimmed;
      if (typeof window !== 'undefined') {
        localStorage.setItem('rondaplay_imposter_players', JSON.stringify(players));
      }
      return { players };
    });
  },

  setImposterCount: (count: number) => {
    set({ imposterCount: count });
  },

  setCategory: (cat: string) => {
    set({ category: cat });
  },

  setGameMode: (mode: 'local' | 'online') => {
    set({ gameMode: mode });
  },

  setLobbyId: (id: string | null) => {
    set({ lobbyId: id });
  },

  setIsHost: (isHost: boolean) => {
    set({ isHost });
  },

  setPremium: (premium: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rondaplay_premium', premium ? 'true' : 'false');
    }
    set({ isPremium: premium });
  },

  startGame: () => {
    const { players, imposterCount, category } = get();
    if (players.length < 3) return; // Need at least 3 players
    
    // Choose random word pair from database
    const catData = CATEGORIES_DB[category] || CATEGORIES_DB['Objetos'];
    const wordPair = catData.pairs[Math.floor(Math.random() * catData.pairs.length)];
    
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

    let roundWinner: 'innocents' | 'imposters';

    if (tie || !votedOutPlayer) {
      // Tie results in imposter win
      roundWinner = 'imposters';
    } else {
      // Check if voted out player is an imposter
      const isImposter = imposters.includes(votedOutPlayer);
      roundWinner = isImposter ? 'innocents' : 'imposters';
    }

    set({
      gamePhase: 'results',
      winner: roundWinner,
    });

    get().updateScoreboard(roundWinner);
  },

  updateScoreboard: (roundWinner: 'innocents' | 'imposters') => {
    const { players, imposters, scoreboard } = get();
    const nextScoreboard = { ...scoreboard };
    
    players.forEach((p) => {
      if (nextScoreboard[p] === undefined) {
        nextScoreboard[p] = 0;
      }
      
      const isImposter = imposters.includes(p);
      if (roundWinner === 'innocents' && !isImposter) {
        nextScoreboard[p] += 1; // Citizen points
      } else if (roundWinner === 'imposters' && isImposter) {
        nextScoreboard[p] += 2; // Imposter points (harder role)
      }
    });

    set({ scoreboard: nextScoreboard });
  },

  resetScoreboard: () => {
    set({ scoreboard: {} });
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
