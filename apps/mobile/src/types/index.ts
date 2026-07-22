export type Language = 'en' | 'es';

export interface TargetWord {
  id: string;
  en: string;
  es: string;
}

export interface Deck {
  id: string;
  titleEn: string;
  titleEs: string;
  imageUrl: string;
  isPremium: boolean;
  category: 'movies' | 'animals' | 'celebrities' | 'actions' | 'custom';
  words: TargetWord[];
}

export type WordResultStatus = 'correct' | 'pass';

export interface WordResult {
  word: string;
  status: WordResultStatus;
  timestampMs: number;
}

export interface MatchResultPayload {
  deckId: string;
  deckTitle: string;
  correctCount: number;
  incorrectCount: number;
  successRate: number;
  durationSeconds: number;
  matchHistory: WordResult[];
  username: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatarUrl: string;
  score: number;
  successRate: number;
  isFriend: boolean;
}

export type GameState = 'IDLE' | 'COUNTDOWN' | 'PLAYING' | 'GAME_OVER';
