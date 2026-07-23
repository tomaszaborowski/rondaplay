"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useAdminStore, QuienSoyDeck, QuienSoyWord } from '@/store/adminStore';
import { 
  ArrowLeft, Heart, Lock, Crown, PlusCircle, Gamepad2, 
  HelpCircle, Settings, RotateCcw, Volume2, VolumeX, CheckCircle, 
  XCircle, Users, Plus, X, ArrowRight, Trophy, Shield, Smartphone
} from 'lucide-react';

export interface Team {
  id: number;
  name: string;
  headerBg: string;
  headerText: string;
  borderColor: string;
  accentBg: string;
  enabled: boolean;
  players: string[];
  score: number;
}

export default function QuienSoyGamePage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  
  // Connect to Admin Store
  const adminDecks = useAdminStore((state) => state.quienSoyDecks);

  // User Profile
  const username = (user as any)?.username || (user?.email ? user.email.split('@')[0] : 'SpeedyCat99');
  const avatarUrl = (user as any)?.avatarUrl || '/avatars/avatar-green.png';

  // Flow State
  const [viewStep, setViewStep] = useState<'TEAM_SETUP' | 'CATEGORY_SELECT' | 'ROTATION_WARNING' | 'PLAYING' | 'GAME_OVER'>('TEAM_SETUP');

  // Teams Configuration
  const [teams, setTeams] = useState<Team[]>([
    {
      id: 1,
      name: 'Equipo 1',
      headerBg: 'bg-[#72f5e3]',
      headerText: 'text-[#006f65]',
      borderColor: 'border-[#006a61]',
      accentBg: 'bg-[#006f65]',
      enabled: true,
      players: [`@${username}`, 'Jugador 2'],
      score: 0,
    },
    {
      id: 2,
      name: 'Equipo 2',
      headerBg: 'bg-[#ffd9e1]',
      headerText: 'text-[#881644]',
      borderColor: 'border-[#d95a82]',
      accentBg: 'bg-[#d95a82]',
      enabled: true,
      players: ['Jugador 1', 'Jugador 2'],
      score: 0,
    },
    {
      id: 3,
      name: 'Equipo 3',
      headerBg: 'bg-purple-200',
      headerText: 'text-purple-900',
      borderColor: 'border-purple-400',
      accentBg: 'bg-purple-600',
      enabled: false,
      players: ['Jugador 1'],
      score: 0,
    },
    {
      id: 4,
      name: 'Equipo 4',
      headerBg: 'bg-emerald-200',
      headerText: 'text-emerald-900',
      borderColor: 'border-emerald-400',
      accentBg: 'bg-emerald-600',
      enabled: false,
      players: ['Jugador 1'],
      score: 0,
    },
  ]);

  // Match Configuration
  const [totalRounds, setTotalRounds] = useState<number>(4);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [currentTeamIndex, setCurrentTeamIndex] = useState<number>(0);

  // Deck Filters & Favorites
  const [activeFilter, setActiveFilter] = useState<string>('free');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    'deck-professions': true,
    'deck-hollywood': true,
  });

  // Gameplay State
  const [selectedDeck, setSelectedDeck] = useState<QuienSoyDeck | null>(null);
  const [wordsList, setWordsList] = useState<QuienSoyWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [correctCount, setCorrectCount] = useState(0);
  const [passCount, setPassCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Rotation Screen Countdown Hold State
  const [rotationCountdown, setRotationCountdown] = useState<number | null>(null);

  // Active Bottom Tab
  const [activeTab, setActiveTab] = useState<'play' | 'how' | 'settings'>('play');

  // Active Enabled Teams List
  const activeTeams = teams.filter((t) => t.enabled);

  // Filter Decks
  const filteredDecks = adminDecks.filter((deck) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'free') return deck.categoryType === 'free' || !deck.isPremium;
    return deck.categoryType === activeFilter;
  });

  // Team Setup Handlers
  const handleToggleTeam = (id: number) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const handlePlayerNameChange = (teamId: number, playerIdx: number, val: string) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId) return t;
        const newPlayers = [...t.players];
        newPlayers[playerIdx] = val;
        return { ...t, players: newPlayers };
      })
    );
  };

  const handleAddPlayer = (teamId: number) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId) return t;
        return { ...t, players: [...t.players, `Jugador ${t.players.length + 1}`] };
      })
    );
  };

  const handleRemovePlayer = (teamId: number, playerIdx: number) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId) return t;
        if (t.players.length <= 1) return t;
        return { ...t, players: t.players.filter((_, idx) => idx !== playerIdx) };
      })
    );
  };

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

  // Flash feedback state for visual juice ('correct' | 'pass' | null)
  const [flashFeedback, setFlashFeedback] = useState<'correct' | 'pass' | null>(null);
  const lastTiltTimeRef = React.useRef<number>(0);

  // Request iOS / Mobile Motion Permission helper
  const requestMotionPermission = async () => {
    if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
      try {
        const resp = await (DeviceOrientationEvent as any).requestPermission();
        console.log('DeviceOrientation permission:', resp);
      } catch (err) {
        console.error('Error requesting orientation permission:', err);
      }
    }
  };

  // When a deck is selected, show Rotation Warning screen first
  const handleSelectDeckForTurn = (deck: QuienSoyDeck) => {
    if (deck.isPremium) return;
    requestMotionPermission();
    setSelectedDeck(deck);
    const shuffled = shuffleWords(deck.words);
    setWordsList(shuffled);
    setCurrentIndex(0);
    setTimerSeconds(60);
    setCorrectCount(0);
    setPassCount(0);
    setRotationCountdown(null);
    setViewStep('ROTATION_WARNING');
  };

  // Trigger 2-second hold countdown on phone flip/continue click
  const handleTriggerRotationStart = async () => {
    await requestMotionPermission();
    if (rotationCountdown !== null) return;
    setRotationCountdown(2);
  };

  // Rotation Countdown Timer Effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (rotationCountdown !== null) {
      if (rotationCountdown <= 0) {
        setRotationCountdown(null);
        setViewStep('PLAYING');
      } else {
        timer = setInterval(() => {
          setRotationCountdown((prev) => (prev !== null ? prev - 1 : null));
        }, 1000);
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [rotationCountdown]);

  // Orientation Change Listener in Rotation Warning
  useEffect(() => {
    if (viewStep !== 'ROTATION_WARNING') return;

    const handleOrientation = () => {
      if (window.orientation === 90 || window.orientation === -90) {
        handleTriggerRotationStart();
      }
    };

    window.addEventListener('orientationchange', handleOrientation);
    return () => {
      window.removeEventListener('orientationchange', handleOrientation);
    };
  }, [viewStep]);

  // Active Gameplay Timer Tick
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (viewStep === 'PLAYING') {
      timer = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            finishTurn();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [viewStep]);

  const handleWordAction = (status: 'correct' | 'pass') => {
    // Haptic vibration feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (status === 'correct') {
        navigator.vibrate([60, 40, 60]);
      } else {
        navigator.vibrate([150]);
      }
    }

    // Set visual flash feedback effect
    setFlashFeedback(status);
    setTimeout(() => {
      setFlashFeedback(null);
    }, 450);

    if (status === 'correct') {
      setCorrectCount((prev) => prev + 1);
    } else {
      setPassCount((prev) => prev + 1);
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= wordsList.length) {
      finishTurn();
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  // Device Orientation Motion Tilt Detector during Active Gameplay
  useEffect(() => {
    if (viewStep !== 'PLAYING') return;

    const handleDeviceTilt = (e: DeviceOrientationEvent) => {
      const now = Date.now();
      // Require 1000ms cooldown between tilt triggers
      if (now - lastTiltTimeRef.current < 1000) return;

      const beta = e.beta ?? 0;   // Pitch tilt [-180, 180]
      const gamma = e.gamma ?? 0; // Roll tilt [-90, 90]

      // Detect Tilt DOWN (Face towards floor = Correct)
      // When phone is on forehead:
      // Forward tilt: beta < 35° or gamma < -35°
      const isTiltDown = (beta > 0 && beta < 35) || gamma < -35;

      // Detect Tilt UP (Face towards ceiling = Pass)
      // Backward tilt: beta > 140° or beta < -40° or gamma > 35°
      const isTiltUp = (beta > 140 || beta < -40) || gamma > 35;

      if (isTiltDown) {
        lastTiltTimeRef.current = now;
        handleWordAction('correct');
      } else if (isTiltUp) {
        lastTiltTimeRef.current = now;
        handleWordAction('pass');
      }
    };

    window.addEventListener('deviceorientation', handleDeviceTilt, true);
    return () => {
      window.removeEventListener('deviceorientation', handleDeviceTilt, true);
    };
  }, [viewStep, currentIndex, wordsList]);

  const finishTurn = () => {
    const activeTeam = activeTeams[currentTeamIndex] || activeTeams[0];
    if (activeTeam) {
      setTeams((prev) =>
        prev.map((t) => (t.id === activeTeam.id ? { ...t, score: t.score + correctCount } : t))
      );
    }

    const nextTeamIdx = (currentTeamIndex + 1) % activeTeams.length;
    if (nextTeamIdx === 0) {
      const nextRound = currentRound + 1;
      if (nextRound > totalRounds) {
        setViewStep('GAME_OVER');
        return;
      } else {
        setCurrentRound(nextRound);
      }
    }
    setCurrentTeamIndex(nextTeamIdx);
    setViewStep('CATEGORY_SELECT');
  };

  const handleResetFullMatch = () => {
    setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })));
    setCurrentRound(1);
    setCurrentTeamIndex(0);
    setViewStep('TEAM_SETUP');
  };

  const activePlayingTeam = activeTeams[currentTeamIndex] || activeTeams[0] || teams[0];
  const currentWord = wordsList[currentIndex];
  const activeText = currentWord ? (lang === 'en' ? currentWord.en : currentWord.es) : '';
  const sortedTeams = [...activeTeams].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-[#fff7fc] text-[#1e1a1f] font-body flex flex-col justify-between pb-28 pt-20 relative overflow-hidden">
      
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. SCREEN: TEAM MANAGEMENT SETUP                                    */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {viewStep === 'TEAM_SETUP' && (
        <main className="px-5 max-w-2xl mx-auto w-full space-y-6 pt-2">
          
          {/* TOP BAR */}
          <header className="sticky top-0 z-50 bg-[#fff7fc]/95 backdrop-blur-md border-b border-slate-200/60 px-5 py-3 flex justify-between items-center w-full -mx-5">
            <div className="flex items-center gap-3">
              <Link href="/">
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#2c0247] font-bold text-xs transition-colors">
                  <ArrowLeft className="w-4 h-4 text-ronda-pink" />
                  <span>Inicio</span>
                </button>
              </Link>

              <div className="relative h-20 w-56">
                <Image src="/games/quien-soy/logo.png" alt="¿Quién Soy? Logo" fill className="object-contain" />
              </div>
            </div>

            {/* Active User Avatar & Name */}
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs text-[#2c0247]">@{username}</span>
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#2c0247] relative">
                <Image src={avatarUrl} alt="User Avatar" fill className="object-cover" />
              </div>
            </div>
          </header>

          {/* TITLE SECTION */}
          <section className="text-center space-y-1">
            <h2 className="text-3xl font-extrabold text-[#2c0247]">Formar Equipos</h2>
            <p className="text-xs font-semibold text-slate-500 max-w-xs mx-auto">
              Configura tus equipos y personas jugadoras para empezar el juego.
            </p>
          </section>

          {/* TEAMS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className={`rounded-3xl shadow-sm overflow-hidden border transition-all ${
                  team.enabled
                    ? 'bg-white border-slate-200 shadow-md'
                    : 'bg-slate-100/70 border-slate-200 opacity-60'
                }`}
              >
                {/* Team Color Header */}
                <div className={`${team.headerBg} px-4 py-3 flex justify-between items-center`}>
                  <span className={`font-black text-base ${team.headerText}`}>{team.name}</span>
                  {team.enabled ? (
                    <div className="flex items-center gap-1.5">
                      <Users className={`w-5 h-5 ${team.headerText}`} />
                      {teams.filter((t) => t.enabled).length > 2 && (
                        <button
                          onClick={() => handleToggleTeam(team.id)}
                          className="p-1 hover:bg-black/10 rounded-full text-slate-700"
                          title="Deshabilitar Equipo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <Lock className="w-4 h-4 text-slate-500" />
                  )}
                </div>

                {/* Team Players List */}
                <div className="p-4 space-y-3">
                  {team.enabled ? (
                    <>
                      {team.players.map((player, pIdx) => (
                        <div key={pIdx} className="relative">
                          <input
                            type="text"
                            value={player}
                            onChange={(e) => handlePlayerNameChange(team.id, pIdx, e.target.value)}
                            placeholder="Nombre o @usuario"
                            className="w-full h-12 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 text-xs font-bold outline-none focus:border-ronda-teal transition-colors"
                          />
                          {team.players.length > 1 && (
                            <button
                              onClick={() => handleRemovePlayer(team.id, pIdx)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        onClick={() => handleAddPlayer(team.id)}
                        className="w-full h-11 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold text-xs gap-1.5 transition-colors"
                      >
                        <Plus className="w-4 h-4 text-ronda-pink" />
                        <span>Añadir Jugador</span>
                      </button>
                    </>
                  ) : (
                    <div className="py-6 flex flex-col items-center justify-center">
                      <button
                        onClick={() => handleToggleTeam(team.id)}
                        className="px-6 py-2.5 bg-[#2c0247] hover:bg-[#431c5d] text-white rounded-full font-bold text-xs shadow-md transition-all active:scale-95"
                      >
                        Habilitar Equipo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ROUNDS CONFIGURATION */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 text-center">
            <label className="block text-xs font-extrabold text-[#2c0247] uppercase tracking-wider">
              Rondas por Partida
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[2, 4, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTotalRounds(num)}
                  className={`py-3 rounded-2xl font-black text-sm border-2 transition-all ${
                    totalRounds === num
                      ? 'bg-[#72f5e3] text-[#006f65] border-[#006a61] shadow-[3px_3px_0px_0px_rgba(0,106,97,1)]'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {num} Rondas
                </button>
              ))}
            </div>
          </div>

          {/* PRIMARY CTA */}
          <div className="pt-2">
            <button
              onClick={() => setViewStep('CATEGORY_SELECT')}
              className="w-full h-16 bg-[#006a61] hover:bg-[#289689] text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-[0_6px_0_0_#00201c] active:translate-y-1 active:shadow-none transition-all"
            >
              <span>Seleccionar Categoría</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </main>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. SCREEN: CATEGORY SELECTION WITH ACTIVE TEAM TURN INDICATOR       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {viewStep === 'CATEGORY_SELECT' && (
        <div className="max-w-4xl mx-auto w-full px-5 space-y-6">
          
          {/* HEADER BAR */}
          <header className="sticky top-0 z-50 bg-[#fff7fc]/95 backdrop-blur-md border-b border-slate-200/60 px-5 py-3 flex justify-between items-center w-full -mx-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewStep('TEAM_SETUP')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#2c0247] font-bold text-xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-ronda-pink" />
                <span>Equipos</span>
              </button>

              <div className="relative h-20 w-56">
                <Image src="/games/quien-soy/logo.png" alt="¿Quién Soy? Logo" fill className="object-contain" />
              </div>
            </div>

            {/* Active User Avatar & Name */}
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs text-[#2c0247]">@{username}</span>
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#2c0247] relative">
                <Image src={avatarUrl} alt="User Avatar" fill className="object-cover" />
              </div>
            </div>
          </header>

          {/* ACTIVE TEAM TURN BANNER */}
          <div className="bg-white border-2 border-[#2c0247] rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-2xl font-black text-sm ${activePlayingTeam.headerBg} ${activePlayingTeam.headerText} border-2 ${activePlayingTeam.borderColor}`}>
                {activePlayingTeam.name}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                  Ronda {currentRound} de {totalRounds}
                </span>
                <h3 className="text-lg font-black text-[#2c0247]">
                  ¡Turno de {activePlayingTeam.name}!
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-2xl">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-black text-[#2c0247]">
                Puntos: {activePlayingTeam.score} pts
              </span>
            </div>
          </div>

          {/* CATEGORIES HORIZONTAL FILTER */}
          <nav className="flex gap-3 overflow-x-auto no-scrollbar py-1">
            {['free', 'general', 'movies', 'characters', 'all'].map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setActiveFilter(filterKey)}
                className={`px-5 py-2 rounded-full whitespace-nowrap border-2 font-extrabold text-xs transition-all ${
                  activeFilter === filterKey
                    ? 'bg-[#72f5e3] text-[#006f65] border-[#006a61] shadow-[3px_3px_0px_0px_rgba(0,106,97,1)]'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {filterKey === 'free' && 'Gratis'}
                {filterKey === 'general' && 'General'}
                {filterKey === 'movies' && 'Cine & Series'}
                {filterKey === 'characters' && 'Personajes'}
                {filterKey === 'all' && 'Todos'}
              </button>
            ))}
          </nav>

          {/* DECK GRID */}
          <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredDecks.map((deck) => {
              const isFav = Boolean(favorites[deck.id]);
              return (
                <div
                  key={deck.id}
                  onClick={() => handleSelectDeckForTurn(deck)}
                  className={`group relative flex flex-col bg-white border-2 border-[#2c0247] rounded-3xl overflow-hidden transition-all duration-200 hover:-translate-y-1 shadow-md cursor-pointer ${
                    deck.isPremium ? 'opacity-80' : ''
                  }`}
                >
                  <div className="relative h-40 bg-slate-800 overflow-hidden">
                    <Image
                      src={deck.imageUrl || '/games/quien-soy/professions.png'}
                      alt={deck.titleEs}
                      fill
                      className={`object-cover ${deck.isPremium ? 'grayscale opacity-60' : ''}`}
                    />
                    
                    <button
                      onClick={(e) => toggleFavorite(deck.id, e)}
                      className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full shadow-sm text-pink-500 hover:scale-110 transition-transform"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-ronda-pink text-ronda-pink' : 'text-slate-400'}`} />
                    </button>

                    {deck.isPremium && (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                          <Lock className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute top-2 left-2 bg-[#72f5e3] text-[#006f65] p-1.5 rounded-lg shadow-sm">
                          <Crown className="w-4 h-4 fill-current" />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-3 flex flex-col items-center text-center bg-white">
                    <h3 className="font-extrabold text-sm text-[#2c0247] truncate w-full">
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
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. SCREEN: ROTATE PHONE / PLACE ON FOREHEAD WARNING                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {viewStep === 'ROTATION_WARNING' && (
        <div className="fixed inset-0 z-50 bg-[#2c0247] flex flex-col justify-between p-6 text-white font-body select-none">
          {/* Background Mesh Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#431c5d] via-[#2c0247] to-[#3d0019] opacity-90 pointer-events-none"></div>

          {/* Main Rotation Canvas */}
          <main className="relative z-10 flex-1 flex flex-col items-center justify-center">
            
            {/* Rotating Phone Graphic */}
            <div className="relative mb-8">
              <div className="w-64 h-64 flex items-center justify-center relative">
                {/* Outer Glow Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#e3b5ff]/30 animate-spin" style={{ animationDuration: '12s' }}></div>
                
                {/* Rotating Phone Body */}
                <div className="animate-[bounce_2s_infinite] flex flex-col items-center">
                  <div className="w-32 h-56 border-8 border-white/90 rounded-[2.5rem] relative flex items-center justify-center bg-[#2a113a]/90 shadow-[0_0_50px_rgba(227,181,255,0.3)] transform transition-transform hover:rotate-90 duration-500">
                    <div className="w-16 h-1 bg-white/30 rounded-full absolute top-6"></div>
                    <Smartphone className="w-16 h-16 text-white opacity-80 animate-pulse" />
                    <div className="w-10 h-10 border-4 border-white/20 rounded-full absolute bottom-4"></div>
                  </div>
                </div>

                {/* Dashed Rotation Arc SVG */}
                <svg className="absolute -top-4 -right-4 w-72 h-72 pointer-events-none opacity-40" viewBox="0 0 100 100">
                  <path d="M 80,20 A 45,45 0 0 1 90,50" fill="none" stroke="white" strokeDasharray="4 4" strokeLinecap="round" strokeWidth="2" />
                  <path d="M 90,50 l -3,0 l 3,5 l 3,-5 z" fill="white" />
                </svg>
              </div>
            </div>

            {/* Instruction Text */}
            <div className="text-center space-y-2 max-w-sm">
              <h1 className="text-3xl font-black text-white drop-shadow-md">
                {rotationCountdown !== null ? `¡Empezando en ${rotationCountdown}s!` : 'Coloca el móvil en tu frente'}
              </h1>
              <p className="text-sm font-bold text-[#e3b5ff]/80">
                Gira tu teléfono de lado en la frente para empezar el juego
              </p>
            </div>
          </main>

          {/* Action Buttons */}
          <footer className="relative z-20 w-full max-w-md mx-auto space-y-3 pb-6">
            <button
              onClick={handleTriggerRotationStart}
              className="w-full h-14 bg-[#006a61] hover:bg-[#289689] rounded-2xl font-black text-base text-white flex items-center justify-center gap-3 shadow-[0_6px_0_0_#289689] active:translate-y-1 active:shadow-none transition-all"
            >
              <Smartphone className="w-5 h-5" />
              <span>{rotationCountdown !== null ? `Iniciando (${rotationCountdown}s)...` : 'Girar para continuar'}</span>
            </button>

            <button
              onClick={() => setViewStep('CATEGORY_SELECT')}
              className="w-full h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl font-extrabold text-sm text-white flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver atrás</span>
            </button>
          </footer>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. SCREEN: ACTIVE GAMEPLAY                                          */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {viewStep === 'PLAYING' && selectedDeck && (
        <div className="max-w-2xl mx-auto w-full px-5 py-4 relative">
          {/* Fullscreen Flash Visual Juice Feedback Overlay */}
          {flashFeedback && (
            <div
              className={`fixed inset-0 z-50 flex flex-col items-center justify-center text-white transition-all duration-200 ${
                flashFeedback === 'correct' ? 'bg-emerald-600' : 'bg-red-600'
              }`}
            >
              {flashFeedback === 'correct' ? (
                <div className="flex flex-col items-center gap-4 animate-bounce">
                  <CheckCircle className="w-36 h-36 text-white drop-shadow-2xl" />
                  <span className="text-5xl font-black uppercase tracking-wider drop-shadow-lg">¡CORRECTO!</span>
                  <span className="text-2xl font-extrabold bg-white/20 px-6 py-2 rounded-full border border-white/30">+1 Punto</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 animate-pulse">
                  <XCircle className="w-36 h-36 text-white drop-shadow-2xl" />
                  <span className="text-5xl font-black uppercase tracking-wider drop-shadow-lg">¡PASAR!</span>
                </div>
              )}
            </div>
          )}

          <div className="bg-slate-900 border-2 border-ronda-teal rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-8 min-h-[420px] justify-between">
            <div className="w-full flex justify-between items-center text-sm font-bold text-slate-300 border-b border-slate-700/60 pb-4">
              <span>Jugando: <strong className="text-[#72f5e3]">{activePlayingTeam.name}</strong></span>
              <span className="text-3xl font-black text-ronda-pink">{timerSeconds}s</span>
            </div>

            {/* CARD DISPLAY */}
            <div className="w-full bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-ronda-teal rounded-2xl py-16 px-6 text-center shadow-2xl my-4">
              <span className="text-4xl sm:text-6xl font-black text-white tracking-wide uppercase">
                {activeText}
              </span>
            </div>

            {/* TILT BUTTONS */}
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

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 5. SCREEN: GAME OVER MATCH SCOREBOARD                               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {viewStep === 'GAME_OVER' && (
        <div className="max-w-md mx-auto w-full px-5 py-8 text-center space-y-6 bg-white border-2 border-[#2c0247] rounded-3xl shadow-2xl">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-8 h-8" />
          </div>

          <h2 className="text-3xl font-black text-[#2c0247]">¡Fin de la Partida!</h2>
          <p className="text-xs font-bold text-slate-400">Puntuación Final por Equipos ({totalRounds} Rondas)</p>

          {/* TEAM RANKINGS SCOREBOARD */}
          <div className="space-y-3 my-4">
            {sortedTeams.map((team, idx) => (
              <div
                key={team.id}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
                  idx === 0
                    ? 'bg-amber-50 border-amber-300 shadow-md'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-black text-lg text-[#2c0247] w-6">#{idx + 1}</span>
                  <span className={`px-3 py-1 rounded-xl text-xs font-extrabold ${team.headerBg} ${team.headerText}`}>
                    {team.name}
                  </span>
                  {idx === 0 && <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />}
                </div>
                <span className="font-black text-lg text-[#2c0247]">{team.score} pts</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleResetFullMatch}
            className="w-full py-4 bg-[#006a61] text-white rounded-2xl font-extrabold flex items-center justify-center gap-2 text-base shadow-lg hover:bg-[#289689] transition-colors"
          >
            <RotateCcw className="w-5 h-5" /> Nueva Partida (Formar Equipos)
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
          <span className="text-xs mt-0.5">Reglas</span>
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
