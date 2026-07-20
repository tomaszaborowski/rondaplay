"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserProfile } from '@/types/user';
import { getUserProfile, createUserProfile, isUsernameAvailable } from '@/lib/userProfile';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<UserProfile | null>;
  signInWithApple: () => Promise<UserProfile | null>;
  signInWithEmail: (e: string, p: string) => Promise<UserProfile | null>;
  signUpWithEmail: (
    e: string,
    p: string,
    displayName: string,
    username: string,
    avatarId?: string,
    customAvatarUrl?: string
  ) => Promise<UserProfile | null>;

  signOutUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signInWithGoogle: async () => null,
  signInWithApple: async () => null,
  signInWithEmail: async () => null,
  signUpWithEmail: async () => null,
  signOutUser: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setUserProfile(null);
      return;
    }
    try {
      const profile = await getUserProfile(firebaseUser.uid);
      if (profile) {
        setUserProfile(profile);
      } else {
        // Auto-create initial profile for OAuth / new users
        const fallbackName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Jugador';
        const fallbackUsername = (firebaseUser.email?.split('@')[0] || `user_${firebaseUser.uid.slice(0, 5)}`)
          .replace(/[^a-zA-Z0-9_]/g, '');
        const newProfile = await createUserProfile(
          firebaseUser.uid,
          firebaseUser.email,
          fallbackName,
          fallbackUsername,
          'alex-vortex',
          firebaseUser.photoURL || undefined
        );
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.warn('Error loading user profile from Firestore:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      await loadUserProfile(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<UserProfile | null> => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await loadUserProfile(result.user);
    return userProfile;
  };

  const signInWithApple = async (): Promise<UserProfile | null> => {
    const provider = new OAuthProvider('apple.com');
    const result = await signInWithPopup(auth, provider);
    await loadUserProfile(result.user);
    return userProfile;
  };

  const signInWithEmail = async (email: string, pass: string): Promise<UserProfile | null> => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    await loadUserProfile(result.user);
    return userProfile;
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    displayName: string,
    username: string,
    avatarId: string = 'avatar-detective',
    customAvatarUrl?: string
  ): Promise<UserProfile | null> => {
    // 1. Authenticate & create user in Firebase Auth FIRST (establishes request.auth)
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    
    // 2. Create profile document in Firestore as authenticated user
    const newProfile = await createUserProfile(
      result.user.uid,
      email,
      displayName || username,
      username,
      avatarId,
      customAvatarUrl
    );
    setUserProfile(newProfile);
    return newProfile;
  };


  const signOutUser = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithGoogle,
        signInWithApple,
        signInWithEmail,
        signUpWithEmail,
        signOutUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
