"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useAdminStore, QuienSoyDeck, QuienSoyWord } from '@/store/adminStore';
import { 
  ArrowLeft, Heart, Lock, Crown, PlusCircle, Gamepad2, 
  HelpCircle, Settings, RotateCcw, Volume2, VolumeX, CheckCircle, XCircle 
} from 'lucide-react';

export default function QuienSoyGamePage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  
  // Connect to Admin Store
  const adminDecks = useAdminStore((state) => state.quienSoyDecks);

  // User Profile
  const username = (user as any)?.username || (user?.email ? user.email.split('@')[0] : 'SpeedyCat99');
  const avatarUrl = (user as any)?.avatarUrl || '/avatars/avatar-green.png';

  // Filters & State
  const [activeFilter, setActiveFilter] = useState<string>('free');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    'deck-professions': true,
    'deck-hollywood': true,
  });

  const [selectedDeck, setSelectedDeck] = useState<QuienSoyDeck | null>(null);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAME_OVER'>('IDLE');
  const [wordsList, setWordsList] = useState<QuienSoyWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [correctCount, setCorrectCount] = useState(0);
  const [passCount, setPassCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Bottom Tab
  const [activeTab, setActiveTab] = useState<'play' | 'how' | 'settings'>('play');

  // Filter Decks
  const filteredDecks = adminDecks.filter((deck) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'free') return deck.categoryType === 'free' || !deck.isPremium;
    return deck.categoryType === activeFilter;
  });

  const toggleFavorite = (deckId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [deckId]: !prev[deckId] }));
  };

  // Fisher-Yates Shuffle
  const shuffleWords = (arr: QuienSoyWord[]) => {
    const list = [...arr];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };

  const handleStartGame = (deck: QuienSoyDeck) => {
    if (deck.isPremium) return; // Locked deck guard
    setSelectedDeck(deck);
    const shuffled = shuffleWords(deck.words);
    setWordsList(shuffled);
    setCurrentIndex(0);
    setTimerSeconds(60);
    setCorrectCount(0);
    setPassCount(0);
    setGameState('PLAYING');
  };

  // Timer Tick
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (gameState === 'PLAYING') {
      timer = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setGameState('GAME_OVER');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState]);

  const handleWordAction = (status: 'correct' | 'pass') => {
    if (status === 'correct') {
      setCorrectCount((prev) => prev + 1);
    } else {
      setPassCount((prev) => prev + 1);
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= wordsList.length) {
      setGameState('GAME_OVER');
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const currentWord = wordsList[currentIndex];
  const activeText = currentWord ? (lang === 'en' ? currentWord.en : currentWord.es) : '';

  return (
    <div className="min-h-screen bg-[#fff7fc] text-[#1e1a1f] font-body flex flex-col justify-between pb-28 pt-20">
      
      {/* TOP BAR WITH HOME BUTTON, LOGO, USERNAME & AVATAR */}
      <header className="sticky top-0 z-50 bg-[#fff7fc]/90 backdrop-blur-md border-b border-slate-200/60 px-5 py-3 flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          {/* Top Button to return to Homepage */}
          <Link href="/">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-ronda-purple font-bold text-xs transition-colors">
              <ArrowLeft className="w-4 h-4 text-ronda-pink" />
              <span>Inicio</span>
            </button>
          </Link>

          {/* Logo */}
          <div className="relative h-12 w-32">
            <Image 
              src="/games/quien-soy/logo.png" 
              alt="¿Quién Soy? Logo" 
              fill
              className="object-contain" 
            />
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm text-[#2c0247]">@{username}</span>
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#2c0247] shadow-sm relative">
            <Image 
              src={avatarUrl} 
              alt="User Avatar" 
              fill 
              className="object-cover" 
            />
          </div>
        </div>
      </header>

      {/* IDLE MAIN VIEW: CATEGORY SELECTION & DECK GRID */}
      {gameState === 'IDLE' && (
        <main className="px-5 mt-4 space-y-6 max-w-4xl mx-auto w-full">
          
          {/* CATEGORIES HORIZONTAL SCROLL FILTER */}
          <nav className="flex gap-3 overflow-x-auto no-scrollbar py-2 -mx-5 px-5">
            <button
              onClick={() => setActiveFilter('free')}
              className={`px-6 py-2 rounded-full whitespace-nowrap border-2 font-extrabold text-xs transition-all ${
                activeFilter === 'free'
                  ? 'bg-[#72f5e3] text-[#006f65] border-[#006a61] shadow-[3px_3px_0px_0px_rgba(0,106,97,1)]'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              Gratis (Free)
            </button>
            <button
              onClick={() => setActiveFilter('general')}
              className={`px-6 py-2 rounded-full whitespace-nowrap border-2 font-extrabold text-xs transition-all ${
                activeFilter === 'general'
                  ? 'bg-[#72f5e3] text-[#006f65] border-[#006a61] shadow-[3px_3px_0px_0px_rgba(0,106,97,1)]'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveFilter('movies')}
              className={`px-6 py-2 rounded-full whitespace-nowrap border-2 font-extrabold text-xs transition-all ${
                activeFilter === 'movies'
                  ? 'bg-[#72f5e3] text-[#006f65] border-[#006a61] shadow-[3px_3px_0px_0px_rgba(0,106,97,1)]'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              Cine & Series (Movies)
            </button>
            <button
              onClick={() => setActiveFilter('characters')}
              className={`px-6 py-2 rounded-full whitespace-nowrap border-2 font-extrabold text-xs transition-all ${
                activeFilter === 'characters'
                  ? 'bg-[#72f5e3] text-[#006f65] border-[#006a61] shadow-[3px_3px_0px_0px_rgba(0,106,97,1)]'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              Personajes (Characters)
            </button>
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-6 py-2 rounded-full whitespace-nowrap border-2 font-extrabold text-xs transition-all ${
                activeFilter === 'all'
                  ? 'bg-[#72f5e3] text-[#006f65] border-[#006a61] shadow-[3px_3px_0px_0px_rgba(0,106,97,1)]'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              Todos (All)
            </button>
          </nav>

          {/* DECK GRID */}
          <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredDecks.map((deck) => {
              const isFav = Boolean(favorites[deck.id]);
              return (
                <div
                  key={deck.id}
                  onClick={() => handleStartGame(deck)}
                  className={`group relative flex flex-col bg-white border-2 border-[#2c0247] rounded-3xl overflow-hidden transition-all duration-200 hover:-translate-y-1 shadow-md cursor-pointer ${
                    deck.isPremium ? 'opacity-85' : ''
                  }`}
                >
                  <div className="relative h-44 bg-slate-800 overflow-hidden">
                    <Image
                      src={deck.imageUrl || '/games/quien-soy/professions.png'}
                      alt={deck.titleEs}
                      fill
                      className={`object-cover ${deck.isPremium ? 'grayscale opacity-60' : ''}`}
                    />
                    
                    {/* Favorite Toggle Button */}
                    <button
                      onClick={(e) => toggleFavorite(deck.id, e)}
                      className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full shadow-sm text-pink-500 hover:scale-110 transition-transform"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-ronda-pink text-ronda-pink' : 'text-slate-400'}`} />
                    </button>

                    {/* Premium Lock Overlay */}
                    {deck.isPremium && (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                          <Lock className="w-9 h-9 text-white" />
                        </div>
                        <div className="absolute top-2 left-2 bg-[#72f5e3] text-[#006f65] p-1.5 rounded-lg shadow-sm flex items-center">
                          <Crown className="w-4 h-4 fill-current" />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-3 flex flex-col items-center text-center bg-white">
                    <h3 className="font-extrabold text-base text-[#2c0247] truncate w-full">
                      {lang === 'en' ? deck.titleEn : deck.titleEs}
                    </h3>
                    <p className="font-bold text-xs text-slate-400 mt-0.5">
                      {deck.isPremium ? 'Premium' : `${deck.words.length} Cartas`}
                    </p>
                  </div>
                </div>
              );
            })}
          </section>

          {/* REQUEST NEW DECK CTA BANNER */}
          <div className="relative bg-[#2c0247] p-6 rounded-3xl text-white overflow-hidden shadow-xl mb-8">
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h4 className="font-extrabold text-lg text-white mb-1">¿No encuentras lo que buscas?</h4>
                <p className="text-xs text-slate-300">¡Pide un nuevo mazo en el Admin y lo añadiremos!</p>
              </div>
              <Link href="/admin/games">
                <button className="flex items-center gap-2 bg-[#006a61] text-white font-extrabold text-xs px-5 py-3 rounded-full border-b-4 border-[#289689] active:translate-y-1 active:border-b-0 transition-all">
                  <PlusCircle className="w-4 h-4" />
                  Gestionar en Admin
                </button>
              </Link>
            </div>
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#006a61]/20 rounded-full blur-2xl"></div>
            <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-ronda-pink/20 rounded-full blur-2xl"></div>
          </div>
        </main>
      )}

      {/* ACTIVE GAMEPLAY SCREEN */}
      {gameState === 'PLAYING' && selectedDeck && (
        <div className="max-w-2xl mx-auto w-full px-5 py-6">
          <div className="bg-slate-900 border-2 border-ronda-teal rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-8 min-h-[420px] justify-between">
            <div className="w-full flex justify-between items-center text-sm font-bold text-slate-300 border-b border-slate-700/60 pb-4">
              <span>Mazo: {lang === 'en' ? selectedDeck.titleEn : selectedDeck.titleEs}</span>
              <span className="text-3xl font-black text-ronda-pink">{timerSeconds}s</span>
            </div>

            {/* CARD DISPLAY */}
            <div className="w-full bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-ronda-teal rounded-2xl py-16 px-6 text-center shadow-2xl my-4">
              <span className="text-4xl sm:text-6xl font-black text-white tracking-wide uppercase">
                {activeText}
              </span>
            </div>

            {/* TILT SIMULATOR BUTTONS */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <button
                onClick={() => handleWordAction('pass')}
                className="py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 text-base shadow-lg active:scale-95 transition-all"
              >
                <XCircle className="w-6 h-6" /> PASAR (Tilt Up)
              </button>
              <button
                onClick={() => handleWordAction('correct')}
                className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 text-base shadow-lg active:scale-95 transition-all"
              >
                <CheckCircle className="w-6 h-6" /> CORRECTO (Tilt Down)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER SUMMARY */}
      {gameState === 'GAME_OVER' && (
        <div className="max-w-md mx-auto w-full px-5 py-8 text-center space-y-6 bg-white border-2 border-[#2c0247] rounded-3xl shadow-2xl">
          <h2 className="text-3xl font-black text-ronda-pink">¡Tiempo Agotado!</h2>

          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 block mb-1">CORRECTAS</span>
              <span className="text-4xl font-black text-emerald-600">{correctCount}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 block mb-1">PASADAS</span>
              <span className="text-4xl font-black text-red-500">{passCount}</span>
            </div>
          </div>

          <button
            onClick={() => setGameState('IDLE')}
            className="w-full py-4 bg-[#006a61] text-white rounded-2xl font-extrabold flex items-center justify-center gap-2 text-base shadow-lg hover:bg-[#289689] transition-colors"
          >
            <RotateCcw className="w-5 h-5" /> Volver a Mazos
          </button>
        </div>
      )}

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-lg">
        <button
          onClick={() => setActiveTab('play')}
          className={`flex flex-col items-center justify-center rounded-xl px-5 py-1.5 transition-all ${
            activeTab === 'play'
              ? 'bg-[#72f5e3] text-[#006f65] font-extrabold scale-105'
              : 'text-slate-500 font-bold hover:bg-slate-100'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span className="text-xs mt-0.5">Jugar</span>
        </button>

        <button
          onClick={() => setActiveTab('how')}
          className={`flex flex-col items-center justify-center rounded-xl px-5 py-1.5 transition-all ${
            activeTab === 'how'
              ? 'bg-[#72f5e3] text-[#006f65] font-extrabold scale-105'
              : 'text-slate-500 font-bold hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-xs mt-0.5">¿Cómo Jugar?</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center rounded-xl px-5 py-1.5 transition-all ${
            activeTab === 'settings'
              ? 'bg-[#72f5e3] text-[#006f65] font-extrabold scale-105'
              : 'text-slate-500 font-bold hover:bg-slate-100'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-xs mt-0.5">Ajustes</span>
        </button>
      </nav>
    </div>
  );
}
