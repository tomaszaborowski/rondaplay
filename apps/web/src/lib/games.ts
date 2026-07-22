import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Game } from '@/store/adminStore';

const GAMES_COLLECTION = 'games';

export async function getGamesFromFirestore(initialGames: Game[]): Promise<Game[]> {
  try {
    const querySnapshot = await getDocs(collection(db, GAMES_COLLECTION));
    if (querySnapshot.empty) {
      // Seed default games
      const batch = writeBatch(db);
      for (const game of initialGames) {
        const gameDocRef = doc(db, GAMES_COLLECTION, game.id);
        batch.set(gameDocRef, game);
      }
      await batch.commit();
      return initialGames;
    }
    
    const games: Game[] = [];
    querySnapshot.forEach((doc) => {
      games.push(doc.data() as Game);
    });
    return games;
  } catch (error) {
    console.error('Error fetching games from Firestore:', error);
    return initialGames;
  }
}

export async function saveGameToFirestore(game: Game): Promise<void> {
  try {
    await setDoc(doc(db, GAMES_COLLECTION, game.id), game, { merge: true });
  } catch (error) {
    console.error('Error saving game to Firestore:', error);
  }
}

export async function deleteGameFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, GAMES_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting game from Firestore:', error);
  }
}
