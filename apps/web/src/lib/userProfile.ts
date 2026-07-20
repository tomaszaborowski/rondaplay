import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  increment,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, UserStats } from '@/types/user';
import { RONDA_CHARACTERS, getAvatarUrl } from './avatars';

export function normalizeUsername(input: string): string {
  return input.trim().replace(/^@+/, '').toLowerCase().replace(/[^a-z0-9_]/g, '');
}

export async function isUsernameAvailable(rawUsername: string): Promise<boolean> {
  const normalized = normalizeUsername(rawUsername);
  if (!normalized || normalized.length < 3) return false;
  try {
    const unameDoc = await getDoc(doc(db, 'usernames', normalized));
    return !unameDoc.exists();
  } catch (err) {
    console.error('Error checking username availability:', err);
    return true; // Fallback
  }
}

export async function createUserProfile(
  uid: string,
  email: string | null,
  displayName: string,
  rawUsername: string,
  avatarCharacterId: string = 'alex-vortex',
  customAvatarUrl?: string
): Promise<UserProfile> {
  const normalizedUsername = normalizeUsername(rawUsername) || `user_${uid.slice(0, 6)}`;
  const avatarUrl = getAvatarUrl(avatarCharacterId, customAvatarUrl);

  const initialStats: UserStats = {
    totalWins: 0,
    totalGamesPlayed: 0,
    impostorWins: 0,
    speedMatchWins: 0,
    winRate: 0,
    totalPoints: 0,
  };

  const profile: UserProfile = {
    uid,
    email,
    displayName: displayName.trim() || normalizedUsername,
    username: normalizedUsername,
    avatarUrl,
    avatarCharacterId,
    createdAt: new Date().toISOString(),
    stats: initialStats,
  };

  try {
    // Save user profile document and reserve username
    await setDoc(doc(db, 'users', uid), profile, { merge: true });
    await setDoc(
      doc(db, 'usernames', normalizedUsername),
      { uid, createdAt: new Date().toISOString() },
      { merge: true }
    );
  } catch (err: any) {
    console.warn('Warning saving profile to Firestore:', err?.message || err);
  }

  return profile;


  return profile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.error('Error fetching user profile:', err);
  }
  return null;
}

export async function getUserProfileByUsername(rawUsername: string): Promise<UserProfile | null> {
  const normalized = normalizeUsername(rawUsername);
  if (!normalized) return null;
  try {
    const unameDoc = await getDoc(doc(db, 'usernames', normalized));
    if (unameDoc.exists()) {
      const uid = unameDoc.data().uid;
      return await getUserProfile(uid);
    }
    // Fallback query users collection
    const q = query(collection(db, 'users'), where('username', '==', normalized), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as UserProfile;
    }
  } catch (err) {
    console.error('Error fetching profile by username:', err);
  }
  return null;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  try {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error updating profile:', err);
  }
}

export async function recordGameVictory(
  rawUsername: string,
  gameId: 'impostor' | 'speed-match',
  pointsGained: number = 100
): Promise<void> {
  const normalized = normalizeUsername(rawUsername);
  if (!normalized) return;

  const profile = await getUserProfileByUsername(normalized);
  if (!profile) return;

  const ref = doc(db, 'users', profile.uid);
  const currentTotalWins = (profile.stats?.totalWins || 0) + 1;
  const currentTotalPlayed = (profile.stats?.totalGamesPlayed || 0) + 1;
  const newWinRate = Math.round((currentTotalWins / currentTotalPlayed) * 100);
  const currentPoints = (profile.stats?.totalPoints || 0) + pointsGained;

  const updates: any = {
    'stats.totalWins': increment(1),
    'stats.totalGamesPlayed': increment(1),
    'stats.winRate': newWinRate,
    'stats.totalPoints': increment(pointsGained),
  };

  if (gameId === 'impostor') {
    updates['stats.impostorWins'] = increment(1);
  } else if (gameId === 'speed-match') {
    updates['stats.speedMatchWins'] = increment(1);
  }

  try {
    await updateDoc(ref, updates);
  } catch (err) {
    console.error('Error recording game victory:', err);
  }
}

export async function getLeaderboardUsers(limitCount: number = 20): Promise<UserProfile[]> {
  try {
    const q = query(
      collection(db, 'users'),
      orderBy('stats.totalPoints', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as UserProfile);
    }
  } catch (err) {
    console.warn('Error loading leaderboard from Firestore, returning dummy sample data:', err);
  }

  // Fallback sample leaderboard data matching Google Stitch design proposal if db is empty
  return [
    {
      uid: 'sample-1',
      email: 'alex@example.com',
      displayName: 'Alex Vortex',
      username: 'alex_vortex',
      avatarUrl: RONDA_CHARACTERS[0].avatarUrl,
      avatarCharacterId: 'alex-vortex',
      createdAt: new Date().toISOString(),
      stats: {
        totalWins: 42,
        totalGamesPlayed: 50,
        impostorWins: 25,
        speedMatchWins: 17,
        winRate: 84,
        totalPoints: 12450,
      },
    },
    {
      uid: 'sample-2',
      email: 'pixel@example.com',
      displayName: 'Pixel Queen',
      username: 'pixel_queen',
      avatarUrl: RONDA_CHARACTERS[1].avatarUrl,
      avatarCharacterId: 'pixel-queen',
      createdAt: new Date().toISOString(),
      stats: {
        totalWins: 38,
        totalGamesPlayed: 48,
        impostorWins: 20,
        speedMatchWins: 18,
        winRate: 79,
        totalPoints: 11920,
      },
    },
    {
      uid: 'sample-3',
      email: 'drift@example.com',
      displayName: 'Drift King',
      username: 'drift_king',
      avatarUrl: RONDA_CHARACTERS[2].avatarUrl,
      avatarCharacterId: 'drift-king',
      createdAt: new Date().toISOString(),
      stats: {
        totalWins: 31,
        totalGamesPlayed: 45,
        impostorWins: 15,
        speedMatchWins: 16,
        winRate: 68,
        totalPoints: 10800,
      },
    },
    {
      uid: 'sample-4',
      email: 'gramps@example.com',
      displayName: 'Gamer Gramps',
      username: 'gamer_gramps',
      avatarUrl: RONDA_CHARACTERS[3].avatarUrl,
      avatarCharacterId: 'gamer-gramps',
      createdAt: new Date().toISOString(),
      stats: {
        totalWins: 27,
        totalGamesPlayed: 40,
        impostorWins: 12,
        speedMatchWins: 15,
        winRate: 67,
        totalPoints: 9950,
      },
    },
  ];
}
