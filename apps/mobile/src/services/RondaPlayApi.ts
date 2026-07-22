import { MatchResultPayload, LeaderboardEntry } from '../types';

export class RondaPlayApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = 'https://rondaplay.com/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Sets the user's RondaPlay authentication token.
   */
  public setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  /**
   * Links a RondaPlay account using a user session token.
   */
  public async linkAccount(userToken: string): Promise<{ username: string; isPremium: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ game: 'quien-soy' }),
      });

      if (!response.ok) {
        throw new Error(`Auth linking failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.authToken = userToken;
      return {
        username: data.username || 'RondaPlayer',
        isPremium: Boolean(data.isPremium),
      };
    } catch (error) {
      console.warn('RondaPlay Auth offline fallback mode enabled');
      return { username: 'GuestPlayer', isPremium: false };
    }
  }

  /**
   * POST match results (Deck Theme, Correct Count, Incorrect Count, Success Rate) to RondaPlay backend.
   */
  public async postMatchResult(payload: MatchResultPayload): Promise<{ success: boolean; matchId?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to post match result: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, matchId: data.matchId };
    } catch (error) {
      console.error('Error posting match result to RondaPlay:', error);
      return { success: false };
    }
  }

  /**
   * GET request to retrieve RondaPlay Leaderboards (filtering by friends list or global).
   */
  public async getLeaderboards(filter: 'global' | 'friends' = 'global'): Promise<LeaderboardEntry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/leaderboard?game=quien-soy&filter=${filter}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
      }

      const data = await response.json();
      return data.entries as LeaderboardEntry[];
    } catch (error) {
      console.warn('Error fetching leaderboards from RondaPlay backend, returning fallback list');
      return [
        { rank: 1, username: 'AlexVortex', avatarUrl: '/avatars/avatar-purple.png', score: 142, successRate: 0.94, isFriend: true },
        { rank: 2, username: 'ElImpostor', avatarUrl: '/avatars/avatar-detective.png', score: 128, successRate: 0.88, isFriend: false },
        { rank: 3, username: 'PixelQueen', avatarUrl: '/avatars/avatar-pink-granny.png', score: 110, successRate: 0.85, isFriend: true },
      ];
    }
  }
}

export const rondaPlayApi = new RondaPlayApiService();
