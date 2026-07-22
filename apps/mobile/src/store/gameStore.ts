import { create } from 'zustand';
import { GameState, TargetWord, WordResult, Deck, Language } from '../types';

interface GameStoreState {
  // Config & Deck
  language: Language;
  selectedDeck: Deck | null;
  timerDurationSeconds: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;

  // Active Game State
  gameState: GameState;
  shuffledWords: TargetWord[];
  currentWordIndex: number;
  timeRemainingSeconds: number;
  matchHistory: WordResult[];

  // Statistics
  correctCount: number;
  passCount: number;

  // Actions
  setLanguage: (lang: Language) => void;
  setTimerDuration: (seconds: number) => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
  
  selectDeck: (deck: Deck) => void;
  startGame: () => void;
  registerWordResult: (status: 'correct' | 'pass') => void;
  tickTimer: () => void;
  endGame: () => void;
  resetGame: () => void;
}

/**
 * FISHER-YATES SHUFFLE ALGORITHM
 * Produces an unbiased random permutation of the deck word array.
 * Ensures target words appear in unpredictable order without repetition.
 */
function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  // Config Defaults
  language: 'es',
  selectedDeck: null,
  timerDurationSeconds: 60,
  soundEnabled: true,
  hapticsEnabled: true,

  // Active State Defaults
  gameState: 'IDLE',
  shuffledWords: [],
  currentWordIndex: 0,
  timeRemainingSeconds: 60,
  matchHistory: [],
  correctCount: 0,
  passCount: 0,

  setLanguage: (language) => set({ language }),
  setTimerDuration: (timerDurationSeconds) => set({ timerDurationSeconds }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  toggleHaptics: () => set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),

  selectDeck: (selectedDeck) => set({ selectedDeck }),

  startGame: () => {
    const { selectedDeck, timerDurationSeconds } = get();
    if (!selectedDeck || selectedDeck.words.length === 0) return;

    // Apply Fisher-Yates Shuffle to word pool
    const randomizedWords = fisherYatesShuffle(selectedDeck.words);

    set({
      gameState: 'PLAYING',
      shuffledWords: randomizedWords,
      currentWordIndex: 0,
      timeRemainingSeconds: timerDurationSeconds,
      matchHistory: [],
      correctCount: 0,
      passCount: 0,
    });
  },

  registerWordResult: (status) => {
    const { gameState, shuffledWords, currentWordIndex, matchHistory, language } = get();
    if (gameState !== 'PLAYING' || currentWordIndex >= shuffledWords.length) return;

    const activeTargetWord = shuffledWords[currentWordIndex];
    const wordText = language === 'en' ? activeTargetWord.en : activeTargetWord.es;

    const newResult: WordResult = {
      word: wordText,
      status,
      timestampMs: Date.now(),
    };

    const nextIndex = currentWordIndex + 1;
    const isDeckExhausted = nextIndex >= shuffledWords.length;

    set((state) => ({
      matchHistory: [...matchHistory, newResult],
      correctCount: status === 'correct' ? state.correctCount + 1 : state.correctCount,
      passCount: status === 'pass' ? state.passCount + 1 : state.passCount,
      currentWordIndex: nextIndex,
      ...(isDeckExhausted ? { gameState: 'GAME_OVER' } : {}),
    }));
  },

  tickTimer: () => {
    const { timeRemainingSeconds, gameState } = get();
    if (gameState !== 'PLAYING') return;

    if (timeRemainingSeconds <= 1) {
      set({ timeRemainingSeconds: 0, gameState: 'GAME_OVER' });
    } else {
      set({ timeRemainingSeconds: timeRemainingSeconds - 1 });
    }
  },

  endGame: () => set({ gameState: 'GAME_OVER' }),

  resetGame: () => set({
    gameState: 'IDLE',
    shuffledWords: [],
    currentWordIndex: 0,
    timeRemainingSeconds: 60,
    matchHistory: [],
    correctCount: 0,
    passCount: 0,
  }),
}));
