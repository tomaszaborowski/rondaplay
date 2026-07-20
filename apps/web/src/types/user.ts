export interface UserStats {
  totalWins: number;
  totalGamesPlayed: number;
  impostorWins: number;
  speedMatchWins: number;
  winRate: number; // e.g. 68
  totalPoints: number; // e.g. 12450
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  username: string; // stored without leading @, formatted as @username for display
  avatarUrl: string;
  avatarCharacterId?: string;
  createdAt: string;
  updatedAt?: string;
  stats: UserStats;
}
