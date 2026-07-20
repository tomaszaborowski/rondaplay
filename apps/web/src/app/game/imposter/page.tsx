"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useGameStore, CATEGORIES_DB, GamePhase } from '@/store/gameStore';
import { 
  UserPlus, Trash2, ShieldAlert, HelpCircle, CheckCircle2, 
  Play, RotateCcw, Vote, ArrowRight, Share2, Lock, X, Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from "@/lib/firebase";
import { doc, setDoc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import { recordGameVictory } from "@/lib/userProfile";

export default function ImposterGame() {
  const {
    players,
    imposters,
    imposterCount,
    gamePhase,
    wordPair,
    currentPlayerIndex,
    selectedVotes,
    winner,
    categories,
    showHint,
    gameMode,
    lobbyId,
    isHost,
    scoreboard,
    isPremium,
    
    initializePlayers,
    addPlayer,
    removePlayer,
    renamePlayer,
    setImposterCount,
    setShowHint,
    toggleCategory,
    setGameMode,
    setLobbyId,
    setIsHost,
    setPremium,
    startGame,
    nextPlayerReveal,
    submitVote,
    tallyVotes,
    resetGame,
    resetScoreboard,
  } = useGameStore();

  // Local state
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isHolding, setIsHolding] = useState(false);
  const [revealDone, setRevealDone] = useState(false);
  const [activeModal, setActiveModal] = useState<'players' | 'categories' | 'impostors' | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  
  // Voting helper
  const [voteIndex, setVoteIndex] = useState(0);

  // Circular Timer state
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerMax, setTimerMax] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ad State
  const [showAd, setShowAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(3);
  const adTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Online Multiplayer State
  const [onlinePlayerName, setOnlinePlayerName] = useState('');
  const [hasJoinedOnline, setHasJoinedOnline] = useState(false);

  // Initialize store and local storage
  useEffect(() => {
    initializePlayers();
  }, [initializePlayers]);

  // Firestore Sync Effect for Online Mode
  useEffect(() => {
    if (gameMode !== 'online' || !lobbyId) return;

    const docRef = doc(db, 'imposter_lobbies', lobbyId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Sync states from database to Zustand store
        useGameStore.setState({
          players: data.players || [],
          imposters: data.imposters || [],
          imposterCount: data.imposterCount || 1,
          gamePhase: data.gamePhase || 'lobby',
          wordPair: data.wordPair || null,
          currentPlayerIndex: data.currentPlayerIndex || 0,
          selectedVotes: data.selectedVotes || {},
          winner: data.winner || null,
          categories: data.categories || ['Animales Salvajes'],
          showHint: data.showHint !== undefined ? data.showHint : true,
          scoreboard: data.scoreboard || {},
        });

        // Sync timer state
        if (data.timerState) {
          setTimeLeft(data.timerState.timeLeft);
          setTimerMax(data.timerState.timerMax);
          setIsTimerRunning(data.timerState.isTimerRunning);
        }
      }
    });

    return () => unsubscribe();
  }, [gameMode, lobbyId]);

  // URL Query Parser for entering shared lobby links
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const lobbyParam = params.get('lobby');
      if (lobbyParam) {
        setLobbyId(lobbyParam);
        setGameMode('online');
        setIsHost(false);
      }
    }
  }, [setLobbyId, setGameMode, setIsHost]);

  // Ad Countdown timer trigger
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (gamePhase === 'results' && !isPremium) {
      timer = setTimeout(() => {
        setShowAd(true);
        setAdCountdown(3);
      }, 0);
      
      adTimerRef.current = setInterval(() => {
        setAdCountdown((prev) => {
          if (prev <= 1) {
            if (adTimerRef.current) clearInterval(adTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
      if (adTimerRef.current) clearInterval(adTimerRef.current);
    };
  }, [gamePhase, isPremium]);

  // Circular Timer tick
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const nextVal = prev - 1;
          if (nextVal <= 0) {
            setIsTimerRunning(false);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            return 0;
          }
          return nextVal;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, timeLeft]);

  // Sync Timer to Firestore (Host Only)
  const syncTimerToFirestore = async (running: boolean, remaining: number) => {
    if (gameMode !== 'online' || !lobbyId || !isHost) return;
    try {
      const docRef = doc(db, 'imposter_lobbies', lobbyId);
      await updateDoc(docRef, {
        timerState: {
          timeLeft: remaining,
          timerMax,
          isTimerRunning: running
        }
      });
    } catch (e) {
      console.error("Timer Firestore sync error:", e);
    }
  };

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    syncTimerToFirestore(true, timeLeft);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
    syncTimerToFirestore(false, timeLeft);
  };

  const handleResetTimer = () => {
    setTimeLeft(timerMax);
    setIsTimerRunning(false);
    syncTimerToFirestore(false, timerMax);
  };

  // Add player submit handler
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      if (players.length >= 20) {
        alert("Máximo 20 jugadores.");
        return;
      }
      addPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };

  // Lobby initial creation (Online Mode)
  const handleCreateOnlineLobby = async () => {
    if (!onlinePlayerName.trim()) {
      alert("Por favor ingresa tu nombre");
      return;
    }
    const uuid = Math.random().toString(36).substring(2, 9).toUpperCase();
    const docRef = doc(db, 'imposter_lobbies', uuid);
    
    const initialData = {
      players: [onlinePlayerName.trim()],
      imposters: [],
      imposterCount: 1,
      gamePhase: 'lobby',
      wordPair: null,
      currentPlayerIndex: 0,
      selectedVotes: {},
      winner: null,
      categories: ['Animales Salvajes'],
      showHint: true,
      scoreboard: { [onlinePlayerName.trim()]: 0 },
      host: onlinePlayerName.trim(),
      timerState: { timeLeft: 60, timerMax: 60, isTimerRunning: false }
    };

    try {
      await setDoc(docRef, initialData);
      setLobbyId(uuid);
      setIsHost(true);
      setGameMode('online');
      setHasJoinedOnline(true);
      useGameStore.setState({ players: [onlinePlayerName.trim()] });
    } catch (e) {
      console.error("Error creating Firestore lobby:", e);
      alert("Error al conectar con el servidor.");
    }
  };

  // Client joining existing online lobby
  const handleJoinOnlineLobby = async () => {
    if (!onlinePlayerName.trim() || !lobbyId) return;
    const docRef = doc(db, 'imposter_lobbies', lobbyId);
    
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const currentPlayers = data.players || [];
        if (currentPlayers.includes(onlinePlayerName.trim())) {
          setHasJoinedOnline(true);
          return;
        }
        if (currentPlayers.length >= 20) {
          alert("La sala está llena.");
          return;
        }
        const updatedPlayers = [...currentPlayers, onlinePlayerName.trim()];
        const nextScoreboard = { ...data.scoreboard, [onlinePlayerName.trim()]: 0 };
        
        await updateDoc(docRef, { 
          players: updatedPlayers,
          scoreboard: nextScoreboard 
        });
        setHasJoinedOnline(true);
      } else {
        alert("La sala no existe.");
        setLobbyId(null);
        setGameMode('local');
      }
    } catch (e) {
      console.error("Error joining Firestore lobby:", e);
      alert("Error al unirse a la sala.");
    }
  };

  // Start Online Game (Host Only)
  const handleStartOnlineGame = async () => {
    if (players.length < 3) return;
    
    const activeCats = categories.length > 0 ? categories : ['Objetos'];
    const randomCatKey = activeCats[Math.floor(Math.random() * activeCats.length)];
    const catData = CATEGORIES_DB[randomCatKey] || CATEGORIES_DB['Objetos'];
    const wordPair = catData.pairs[Math.floor(Math.random() * catData.pairs.length)];
    
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const chosenImposters = shuffled.slice(0, Math.min(imposterCount, players.length - 2));

    if (!lobbyId) return;
    const docRef = doc(db, 'imposter_lobbies', lobbyId);
    try {
      await updateDoc(docRef, {
        imposters: chosenImposters,
        wordPair,
        gamePhase: 'assign',
        currentPlayerIndex: 0,
        selectedVotes: {},
        winner: null,
      });
    } catch (e) {
      console.error("Error starting online game:", e);
    }
  };

  // Sync state transitions to Firestore (Online Mode)
  const syncPhaseToFirestore = async (nextPhase: GamePhase, overrides: Record<string, unknown> = {}) => {
    if (gameMode !== 'online' || !lobbyId) return;
    const docRef = doc(db, 'imposter_lobbies', lobbyId);
    try {
      await updateDoc(docRef, {
        gamePhase: nextPhase,
        ...overrides
      });
    } catch (e) {
      console.error("Firestore sync error:", e);
    }
  };

  // Reveal phase pass-and-play actions
  const handleRevealNext = () => {
    setRevealDone(false);
    if (gameMode === 'online') {
      const nextIndex = currentPlayerIndex + 1;
      if (nextIndex < players.length) {
        syncPhaseToFirestore('assign', { currentPlayerIndex: nextIndex });
      } else {
        syncPhaseToFirestore('play');
      }
    } else {
      nextPlayerReveal();
    }
  };

  // Voting Submit handles
  const handleVoteSubmit = async (voter: string, votedFor: string) => {
    if (gameMode === 'online') {
      const nextVotes = { ...selectedVotes, [voter]: votedFor };
      const docRef = doc(db, 'imposter_lobbies', lobbyId!);
      await updateDoc(docRef, { selectedVotes: nextVotes });
    } else {
      submitVote(voter, votedFor);
    }
  };

  // Host Tallies votes online
  const handleTallyVotesOnline = async () => {
    // Count votes
    const voteCounts: Record<string, number> = {};
    players.forEach(p => { voteCounts[p] = 0; });
    
    Object.values(selectedVotes).forEach((votedFor) => {
      voteCounts[votedFor] = (voteCounts[votedFor] || 0) + 1;
    });

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
      roundWinner = 'imposters';
    } else {
      const isImposter = imposters.includes(votedOutPlayer);
      roundWinner = isImposter ? 'innocents' : 'imposters';
    }

    // Update scoreboard & record Firestore track records for registered @usernames
    const nextScoreboard = { ...scoreboard };
    players.forEach((p) => {
      if (nextScoreboard[p] === undefined) nextScoreboard[p] = 0;
      const isImposter = imposters.includes(p);
      const won = (roundWinner === 'innocents' && !isImposter) || (roundWinner === 'imposters' && isImposter);
      if (won) {
        nextScoreboard[p] += isImposter ? 2 : 1;
        recordGameVictory(p, 'impostor', isImposter ? 250 : 100).catch((err) =>
          console.warn('Could not record victory for', p, err)
        );
      }
    });


    if (!lobbyId) return;
    const docRef = doc(db, 'imposter_lobbies', lobbyId);
    try {
      await updateDoc(docRef, {
        gamePhase: 'results',
        winner: roundWinner,
        scoreboard: nextScoreboard
      });
    } catch (e) {
      console.error("Error tallying votes online:", e);
    }
  };

  // Replay Reset online
  const handleResetOnline = async () => {
    if (!lobbyId) return;
    const docRef = doc(db, 'imposter_lobbies', lobbyId);
    try {
      await updateDoc(docRef, {
        gamePhase: 'lobby',
        imposters: [],
        wordPair: null,
        currentPlayerIndex: 0,
        selectedVotes: {},
        winner: null,
      });
    } catch (e) {
      console.error("Error resetting online game:", e);
    }
  };

  // Native Billing Simulation
  const handleSimulatePurchase = (skuType: 'weekly' | 'annual') => {
    // Triggers standard WebView bridge protocol for mobile app wrapper if present
    const win = window as unknown as { ReactNativeWebView?: { postMessage: (msg: string) => void } };
    if (typeof window !== 'undefined' && win.ReactNativeWebView) {
      win.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'PURCHASE', sku: skuType })
      );
    }
    
    // Simulate API delay and set premium
    setTimeout(() => {
      setPremium(true);
      setPurchaseSuccess(true);
      setTimeout(() => {
        setPurchaseSuccess(false);
        setShowPaywall(false);
      }, 1500);
    }, 800);
  };

  // Copy share links
  const handleShareSession = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}${window.location.pathname}?lobby=${lobbyId}`;
      navigator.clipboard.writeText(shareUrl);
      alert("¡Enlace de invitación copiado al portapapeles!");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#2B2D42] font-body pt-6 pb-16 px-4 relative overflow-hidden flex flex-col items-center select-none">
      {/* Ambient Glow Bubbles */}
      <div className="absolute top-10 left-5 w-48 h-48 bg-[#34c2b2] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float pointer-events-none" />
      <div className="absolute bottom-10 right-5 w-60 h-60 bg-[#ff75a0] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float pointer-events-none" />
      
      {/* ── HEADER NAVIGATION ── */}
      <header className="w-full max-w-md px-2 flex justify-between items-center mb-6 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.location.href = '/'}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-full shadow-sm active:scale-95 transition-all cursor-pointer text-slate-700"
            title="Volver al Inicio"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
          <img 
            src="/images/imposter-logo.png" 
            alt="Impostor Logo" 
            className="h-9 w-auto object-contain drop-shadow-sm" 
          />
        </div>
        {isPremium && (
          <span className="bg-gradient-to-r from-[#006a61] to-[#34c2b2] text-white text-[10px] font-fredoka font-bold px-3 py-1 rounded-full uppercase shadow-sm">
            Premium ⭐
          </span>
        )}
      </header>

      {/* ── MAIN CONTENT LAYOUT ── */}
      <main className="flex-1 w-full max-w-md px-2 flex flex-col justify-center relative z-10">
        <AnimatePresence mode="wait">

          {/* ──────────────────────────────────────────────────────── */}
          {/* SCREEN: PREMIUM PAYWALL OVERLAY                          */}
          {/* ──────────────────────────────────────────────────────── */}
          {showPaywall && (
            <motion.div
              key="paywall"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute inset-0 bg-[#F9FAFB] z-50 p-6 flex flex-col justify-between rounded-3xl"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-fredoka font-bold uppercase tracking-widest text-[#d95a82]">RondaPlay Pro</span>
                <button onClick={() => setShowPaywall(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {purchaseSuccess ? (
                <div className="flex-grow flex flex-col items-center justify-center space-y-4">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 text-4xl animate-bounce">
                    ✓
                  </div>
                  <h2 className="text-2xl font-fredoka font-bold text-center text-[#431c5d]">¡Compra Completada!</h2>
                  <p className="text-sm text-slate-500 font-body">Ya eres miembro Premium de RondaPlay.</p>
                </div>
              ) : (
                <div className="flex-grow flex flex-col justify-center space-y-8 my-6">
                  <div className="text-center space-y-3">
                    <div className="w-20 h-20 bg-gradient-to-tr from-[#006a61] to-[#34c2b2] rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-md rotate-3 text-white">
                      ⭐
                    </div>
                    <h2 className="text-3xl font-fredoka font-extrabold tracking-tight text-[#431c5d]">Desbloquea RondaPlay Premium</h2>
                    <p className="text-sm text-slate-600 font-body max-w-xs mx-auto">
                      Accede a todas las categorías exclusivas, elimina todos los anuncios y juega partidas online ilimitadas con amigos.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white rounded-3xl p-5 border-2 border-[#006a61] shadow-md flex justify-between items-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-[#006a61] text-white text-[9px] font-fredoka font-bold uppercase px-3 py-1 rounded-bl-xl">
                        3 Días Gratis
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm font-fredoka font-bold uppercase text-[#431c5d]">Plan Anual</span>
                        <p className="text-xs text-slate-500 font-body">Paga una vez al año. Cancela cuando quieras.</p>
                      </div>
                      <button 
                        onClick={() => handleSimulatePurchase('annual')}
                        className="py-2.5 px-4 bg-[#006a61] hover:bg-[#00524b] text-white rounded-full font-fredoka font-bold text-xs shadow cursor-pointer transition-all"
                      >
                        $9.99 / año
                      </button>
                    </div>

                    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="text-sm font-fredoka font-bold uppercase text-[#431c5d]">Plan Semanal</span>
                        <p className="text-xs text-slate-500 font-body">Suscripción recurrente semanal.</p>
                      </div>
                      <button 
                        onClick={() => handleSimulatePurchase('weekly')}
                        className="py-2.5 px-4 bg-[#431c5d] hover:bg-[#341549] text-white rounded-full font-fredoka font-bold text-xs shadow cursor-pointer transition-all"
                      >
                        $1.99 / sem
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center space-y-4">
                <span className="text-[10px] text-slate-400 block max-w-xs mx-auto font-body">
                  La facturación se realiza a través de su cuenta de Apple App Store o Google Play Store. Puede cancelar en cualquier momento en los ajustes de su cuenta.
                </span>
                <button 
                  onClick={() => handleSimulatePurchase('annual')}
                  className="text-xs font-bold text-[#d95a82] hover:underline tracking-wide block mx-auto font-body cursor-pointer"
                >
                  Restaurar Compras
                </button>
              </div>
            </motion.div>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* SCREEN: INTERSTITIAL AD OVERLAY                          */}
          {/* ──────────────────────────────────────────────────────── */}
          {showAd && (
            <motion.div
              key="adScreen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#2C0247]/95 z-50 p-6 flex flex-col justify-between text-white rounded-3xl"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-fredoka font-bold text-white/60 tracking-wider">ANUNCIO SPONSOR</span>
                {adCountdown === 0 ? (
                  <button 
                    onClick={() => setShowAd(false)}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center font-bold text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                ) : (
                  <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">
                    Cerrar en {adCountdown}s
                  </span>
                )}
              </div>

              <div className="flex-grow flex flex-col items-center justify-center space-y-4">
                <div className="text-7xl animate-bounce">🎮</div>
                <h3 className="text-3xl font-fredoka font-extrabold text-center uppercase tracking-tight text-[#34c2b2]">RondaPlay Games</h3>
                <p className="text-sm text-white/80 text-center max-w-xs font-body leading-relaxed">
                  Prueba nuestros otros juegos de cartas y mesa en la app de RondaPlay. ¡Diversión garantizada!
                </p>
                <button className="tactile-button-teal bg-[#006a61] text-white py-3.5 px-8 rounded-full font-fredoka font-bold uppercase text-sm tracking-wider shadow-lg cursor-pointer">
                  Descargar Gratis
                </button>
              </div>

              <div className="text-center">
                <button 
                  onClick={() => {
                    setShowAd(false);
                    setShowPaywall(true);
                  }}
                  className="text-xs text-white/70 hover:text-white underline font-body cursor-pointer"
                >
                  Eliminar Anuncios con Premium ⭐
                </button>
              </div>
            </motion.div>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* SCREEN: ONLINE LOBBY REGISTRATION                        */}
          {/* ──────────────────────────────────────────────────────── */}
          {gameMode === 'online' && !hasJoinedOnline && (
            <motion.div
              key="onlineRegistration"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <span className="bg-red-50 text-[#d95a82] border border-red-200 px-4 py-1 rounded-full text-xs font-fredoka font-bold uppercase tracking-wider">
                  Modo Online 🌐
                </span>
                <h2 className="text-3xl font-fredoka font-extrabold text-[#431c5d] uppercase">Únete a la Sala</h2>
                <p className="text-slate-500 text-sm font-body">
                  {isHost ? "Ingresa tu nombre para crear la sala de juego." : "Ingresa tu nombre para unirte al juego de tu amigo."}
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-fredoka font-bold uppercase text-slate-400">Tu Apodo / Nombre</label>
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="Ej. Tomas"
                    value={onlinePlayerName}
                    onChange={(e) => setOnlinePlayerName(e.target.value)}
                    className="w-full bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3 text-lg font-bold outline-none focus:border-[#006a61] text-[#2B2D42]"
                  />
                </div>

                <button
                  onClick={isHost ? handleCreateOnlineLobby : handleJoinOnlineLobby}
                  disabled={!onlinePlayerName.trim()}
                  className="tactile-button-teal w-full py-4 bg-[#006a61] disabled:opacity-50 text-white font-fredoka font-bold rounded-full uppercase tracking-wider text-base shadow-md cursor-pointer transition-all"
                >
                  {isHost ? "Crear Sala de Juego" : "Entrar a la Partida"}
                </button>

                <button 
                  onClick={() => {
                    setGameMode('local');
                    setLobbyId(null);
                  }}
                  className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 underline font-body cursor-pointer"
                >
                  Volver al Modo Local
                </button>
              </div>
            </motion.div>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* SCREEN: LOBBY SETUP PHASE (Main Dashboard)               */}
          {/* ──────────────────────────────────────────────────────── */}
          {gamePhase === 'lobby' && (gameMode === 'local' || (gameMode === 'online' && hasJoinedOnline)) && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-5 flex flex-col h-full justify-between"
            >
              
              {/* Stacked Config Cards */}
              <div className="space-y-4 flex-1">
                
                {/* Mode Selector pills */}
                {gameMode === 'local' && (
                  <div className="bg-slate-200/70 p-1.5 rounded-full border border-slate-200 flex shadow-inner">
                    <button
                      onClick={() => setGameMode('local')}
                      className="flex-1 py-2.5 text-center rounded-full font-fredoka text-xs font-bold uppercase bg-[#006a61] text-white shadow-md transition-all cursor-pointer"
                    >
                      📱 Pasa y Juega (Local)
                    </button>
                    <button
                      onClick={() => {
                        setGameMode('online');
                        setIsHost(true);
                        setHasJoinedOnline(false);
                      }}
                      className="flex-1 py-2.5 text-center rounded-full font-fredoka text-xs font-bold uppercase text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                    >
                      🌐 Multijugador Online
                    </button>
                  </div>
                )}

                {/* Online Lobby Status Details */}
                {gameMode === 'online' && (
                  <div className="bg-[#431c5d] text-white p-5 rounded-3xl space-y-3 shadow-md border-b-4 border-[#2c0247]">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-fredoka font-bold uppercase text-[#34c2b2] tracking-widest">Sala Online Activa</span>
                      <button 
                        onClick={handleShareSession}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="text-xl font-fredoka font-bold tracking-wider">CÓDIGO: {lobbyId}</h3>
                    <p className="text-xs text-white/80 font-body">
                      Comparte el enlace de abajo con tus amigos para que se unan desde sus celulares.
                    </p>
                    <button 
                      onClick={handleShareSession}
                      className="w-full py-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-fredoka font-bold uppercase flex items-center justify-center gap-1.5 border border-white/20 cursor-pointer transition-colors"
                    >
                      Copiar Enlace de Invitación
                    </button>
                  </div>
                )}

                {/* CARD 1: PLAYERS */}
                <div 
                  onClick={() => {
                    if (gameMode === 'local' || isHost) {
                      setActiveModal('players');
                    } else {
                      alert("Solo el Anfitrión puede editar jugadores.");
                    }
                  }}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:border-[#006a61]/30 cursor-pointer transition-all flex justify-between items-center card-shadow"
                >
                  <div className="space-y-2 flex-1">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-fredoka font-bold">1. Jugadores ({players.length})</span>
                    <div className="flex flex-wrap gap-1.5 max-h-16 overflow-hidden">
                      {players.map((p, i) => (
                        <span key={i} className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full font-body">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  {(gameMode === 'local' || isHost) && (
                    <Edit2 className="w-5 h-5 text-slate-300 ml-2" />
                  )}
                </div>

                {/* CARD 2: CATEGORY SELECTOR */}
                <div 
                  onClick={() => {
                    if (gameMode === 'local' || isHost) {
                      setActiveModal('categories');
                    } else {
                      alert("Solo el Anfitrión puede cambiar de categoría.");
                    }
                  }}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:border-[#006a61]/30 cursor-pointer transition-all flex justify-between items-center card-shadow"
                >
                  <div className="space-y-1 flex-grow">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-fredoka font-bold">2. Temas Seleccionados</span>
                    <h3 className="text-lg font-fredoka font-bold uppercase flex flex-wrap gap-1.5 pt-1">
                      {categories.map((cat) => (
                        <span key={cat} className="flex items-center gap-1 bg-teal-50 text-[#006a61] border border-teal-200 text-[11px] px-3 py-1 rounded-full font-bold">
                          {cat}
                          {!CATEGORIES_DB[cat]?.free && <Lock className="w-3 h-3 text-[#d95a82] inline ml-0.5" />}
                        </span>
                      ))}
                    </h3>
                  </div>
                  {(gameMode === 'local' || isHost) && (
                    <Edit2 className="w-5 h-5 text-slate-300 ml-2" />
                  )}
                </div>

                {/* CARD 3: IMPOSTORS COUNT */}
                <div 
                  onClick={() => {
                    if (gameMode === 'local' || isHost) {
                      setActiveModal('impostors');
                    } else {
                      alert("Solo el Anfitrión puede cambiar el número de impostores.");
                    }
                  }}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:border-[#006a61]/30 cursor-pointer transition-all flex justify-between items-center card-shadow"
                >
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-fredoka font-bold">3. Número de Impostores</span>
                    <h3 className="text-lg font-fredoka font-bold uppercase text-[#431c5d]">{imposterCount} {imposterCount === 1 ? 'Impostor' : 'Impostores'}</h3>
                  </div>
                  {(gameMode === 'local' || isHost) && (
                    <Edit2 className="w-5 h-5 text-slate-300" />
                  )}
                </div>

                {/* CARD 4: HINT OPTION */}
                <div 
                  onClick={() => {
                    if (gameMode === 'local' || isHost) {
                      const nextHint = !showHint;
                      setShowHint(nextHint);
                      if (gameMode === 'online' && lobbyId && isHost) {
                        const docRef = doc(db, 'imposter_lobbies', lobbyId);
                        updateDoc(docRef, { showHint: nextHint }).catch(console.error);
                      }
                    } else {
                      alert("Solo el Anfitrión puede cambiar la opción de pistas.");
                    }
                  }}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:border-[#006a61]/30 cursor-pointer transition-all flex justify-between items-center card-shadow"
                >
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-fredoka font-bold">4. Pista para el Impostor</span>
                    <h3 className="text-sm font-fredoka font-bold uppercase flex items-center gap-2 pt-0.5">
                      {showHint ? (
                        <span className="text-emerald-600 flex items-center gap-1 font-bold">💡 Activada <span className="text-[11px] text-slate-400 font-normal font-body lowercase">(ve una pista)</span></span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1 font-bold">🚫 Desactivada <span className="text-[11px] text-slate-400 font-normal font-body lowercase">(sin pistas)</span></span>
                      )}
                    </h3>
                  </div>
                  {(gameMode === 'local' || isHost) && (
                    <div className={`w-12 h-7 rounded-full p-1 transition-colors ${showHint ? 'bg-[#006a61]' : 'bg-slate-200'}`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${showHint ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Sticky Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-slate-200 z-10 shrink-0">
                <div className="flex gap-3">
                  <button 
                    onClick={handleShareSession}
                    className="flex-1 py-3 bg-white border border-slate-200 font-fredoka font-bold text-slate-700 rounded-2xl uppercase text-xs tracking-wider shadow-sm flex items-center justify-center gap-1.5 hover:bg-slate-50 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#006a61]" /> Compartir
                  </button>
                  <button 
                    onClick={() => alert("¡Gracias por calificar RondaPlay!")}
                    className="flex-1 py-3 bg-white border border-slate-200 font-fredoka font-bold text-slate-700 rounded-2xl uppercase text-xs tracking-wider shadow-sm flex items-center justify-center gap-1.5 hover:bg-slate-50 cursor-pointer"
                  >
                    ⭐ Reseñar
                  </button>
                </div>

                {gameMode === 'online' && !isHost ? (
                  <div className="p-4 bg-white rounded-2xl text-center text-xs font-bold text-slate-400 border border-slate-200 font-body">
                    Esperando a que el Anfitrión comience la partida...
                  </div>
                ) : (
                  <button
                    onClick={gameMode === 'online' ? handleStartOnlineGame : startGame}
                    disabled={players.length < 3}
                    className="tactile-button-teal w-full py-4 bg-[#006a61] disabled:opacity-50 text-white font-fredoka font-bold rounded-full uppercase tracking-wider text-base shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Play className="w-5 h-5 fill-current" /> Comenzar Juego
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* SCREEN: REVEAL PHASE (Local or Online Roles setup)       */}
          {/* ──────────────────────────────────────────────────────── */}
          {gamePhase === 'assign' && (
            <motion.div
              key="assign"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6 text-center"
            >
              <div className="flex flex-col items-center gap-3 mb-2">
                <span className="bg-red-50 text-[#d95a82] border border-red-200 px-4 py-1.5 rounded-full text-xs font-fredoka font-bold uppercase tracking-wider inline-block shadow-xs">
                  Fase de Revelación 🕵️‍♂️
                </span>
                <h2 className="text-3xl font-fredoka font-extrabold text-[#431c5d] uppercase tracking-tight mt-1">¿Quién eres?</h2>
                <p className="text-slate-500 text-sm font-body max-w-xs leading-relaxed">
                  {gameMode === 'online' && players[currentPlayerIndex] !== onlinePlayerName
                    ? `Esperando que ${players[currentPlayerIndex]} vea su carta...`
                    : "Pasa el dispositivo y mantén presionado para revelar tu palabra secreta."}
                </p>
              </div>

              {(gameMode === 'local' || players[currentPlayerIndex] === onlinePlayerName) ? (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center space-y-6 card-shadow">
                  <div className="space-y-1">
                    <span className="text-xs font-fredoka font-bold uppercase text-slate-400">Turno de</span>
                    <h3 className="text-3xl font-fredoka font-extrabold text-[#431c5d] tracking-tight">{players[currentPlayerIndex]}</h3>
                  </div>

                  {/* Press and Hold Reveal Box */}
                  <div 
                    onMouseDown={() => setIsHolding(true)}
                    onMouseUp={() => {
                      setIsHolding(false);
                      setRevealDone(true);
                    }}
                    onMouseLeave={() => setIsHolding(false)}
                    onTouchStart={() => setIsHolding(true)}
                    onTouchEnd={() => {
                      setIsHolding(false);
                      setRevealDone(true);
                    }}
                    className={`w-full min-h-[190px] rounded-3xl border-4 border-dashed flex flex-col items-center justify-center cursor-pointer select-none transition-all p-4 ${
                      isHolding 
                        ? 'bg-[#431c5d] border-transparent text-white shadow-xl scale-[1.02]' 
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                    }`}
                  >
                    {isHolding ? (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="space-y-3"
                      >
                        <span className="text-5xl block">
                          {imposters.includes(players[currentPlayerIndex]) ? '🕵️‍♂️' : '📦'}
                        </span>
                        <h4 className="text-2xl font-fredoka font-extrabold uppercase tracking-wide">
                          {imposters.includes(players[currentPlayerIndex]) ? "Eres el Impostor" : wordPair?.innocent}
                        </h4>
                        {!imposters.includes(players[currentPlayerIndex]) && (
                          <span className="text-xs text-white/80 font-body block">Eres un Ciudadano</span>
                        )}
                        {imposters.includes(players[currentPlayerIndex]) && (
                          <div className="space-y-1">
                            {showHint && wordPair?.hint && (
                              <div className="mt-2 py-1.5 px-4 bg-white/15 rounded-2xl border border-white/20">
                                <span className="text-[10px] text-[#34c2b2] font-fredoka font-bold uppercase tracking-wider block">💡 Tu Pista</span>
                                <span className="text-base font-fredoka font-bold text-white capitalize">{wordPair.hint}</span>
                              </div>
                            )}
                            <span className="text-xs text-[#ff75a0] block font-fredoka font-bold pt-1">Pasa desapercibido</span>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <div className="space-y-3 p-4">
                        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto animate-pulse" />
                        <p className="text-xs font-fredoka font-bold uppercase tracking-wider text-slate-400">
                          Presiona y Mantén pulsado para revelar
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="w-full">
                    {revealDone && !isHolding ? (
                      <button
                        onClick={handleRevealNext}
                        className="tactile-button-teal w-full py-4 bg-[#006a61] text-white font-fredoka font-bold rounded-full uppercase tracking-wider text-sm shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        Siguiente Jugador <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="py-3 text-center text-xs text-slate-400 font-bold font-body">
                        Debes ver tu palabra antes de continuar.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-6 card-shadow">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-ronda-teal border-t-transparent"></div>
                  <h3 className="text-lg font-fredoka font-bold uppercase tracking-wide text-slate-400">
                    Revelación en Curso
                  </h3>
                  <p className="text-sm text-slate-500 font-body">
                    {players[currentPlayerIndex]} está viendo su palabra secreta en su celular.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* SCREEN: DISCUSSION PHASE WITH COUNTDOWN TIMER            */}
          {/* ──────────────────────────────────────────────────────── */}
          {gamePhase === 'play' && (
            <motion.div
              key="play"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6 text-center"
            >
              <div className="flex flex-col items-center gap-3 mb-2">
                <span className="bg-teal-50 text-[#006a61] border border-teal-200 px-4 py-1.5 rounded-full text-xs font-fredoka font-bold uppercase tracking-wider inline-block shadow-xs">
                  Fase de Debate 🗣️
                </span>
                <h2 className="text-3xl font-fredoka font-extrabold text-[#431c5d] uppercase tracking-tight mt-1">¡Debatan!</h2>
                <p className="text-slate-500 text-sm font-body max-w-xs leading-relaxed">
                  Hagan preguntas cortas para descubrir al impostor sin revelar su palabra secreta.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center space-y-6 card-shadow">
                
                {/* Circular Countdown Timer */}
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle
                      cx="88"
                      cy="88"
                      r="76"
                      stroke="#F1F5F9"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="88"
                      cy="88"
                      r="76"
                      stroke={timeLeft <= 10 ? '#d95a82' : '#006a61'}
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 76}
                      strokeDashoffset={2 * Math.PI * 76 * (1 - timeLeft / timerMax)}
                      className="transition-all duration-1000 stroke-round"
                    />
                  </svg>
                  
                  <div className="text-center space-y-1">
                    <span className="text-4xl font-fredoka font-extrabold tracking-tight block text-[#431c5d]">
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-fredoka font-bold uppercase tracking-wider">Segundos</span>
                  </div>
                </div>

                {/* Moderator controls (Only for Host or Local mode) */}
                {(gameMode === 'local' || isHost) && (
                  <div className="flex gap-3 justify-center w-full">
                    {isTimerRunning ? (
                      <button
                        onClick={handlePauseTimer}
                        className="py-3 px-6 bg-[#431c5d] hover:bg-[#341549] text-white font-fredoka font-bold rounded-full uppercase text-xs tracking-wider shadow cursor-pointer transition-all"
                      >
                        Pausar
                      </button>
                    ) : (
                      <button
                        onClick={handleStartTimer}
                        className="py-3 px-6 bg-[#006a61] hover:bg-[#00524b] text-white font-fredoka font-bold rounded-full uppercase text-xs tracking-wider shadow cursor-pointer transition-all"
                      >
                        Iniciar
                      </button>
                    )}
                    <button
                      onClick={handleResetTimer}
                      className="py-3 px-6 bg-white border border-slate-200 font-fredoka font-bold text-slate-700 hover:bg-slate-50 rounded-full uppercase text-xs tracking-wider shadow-sm cursor-pointer transition-all"
                    >
                      Reiniciar
                    </button>
                  </div>
                )}

                <div className="w-full pt-4 border-t border-slate-100">
                  {gameMode === 'online' && !isHost ? (
                    <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs font-bold text-slate-400 font-body">
                      Esperando que el Anfitrión inicie la votación...
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setVoteIndex(0);
                        if (gameMode === 'online') {
                          syncPhaseToFirestore('vote', { selectedVotes: {} });
                        } else {
                          useGameStore.setState({ gamePhase: 'vote', selectedVotes: {} });
                        }
                      }}
                      className="tactile-button-pink w-full py-4 bg-[#d95a82] text-white font-fredoka font-bold rounded-full uppercase tracking-wider text-sm shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Vote className="w-4 h-4" /> Iniciar Votación
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* SCREEN: VOTING PHASE                                     */}
          {/* ──────────────────────────────────────────────────────── */}
          {gamePhase === 'vote' && (
            <motion.div
              key="vote"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="flex flex-col items-center gap-3 mb-2">
                <span className="bg-red-50 text-[#d95a82] border border-red-200 px-4 py-1.5 rounded-full text-xs font-fredoka font-bold uppercase tracking-wider inline-block shadow-xs">
                  Fase de Votación 🗳️
                </span>
                <h2 className="text-3xl font-fredoka font-extrabold text-[#431c5d] uppercase tracking-tight mt-1">¿Quién es sospechoso?</h2>
                <p className="text-slate-500 text-sm font-body max-w-xs leading-relaxed">
                  {gameMode === 'online' && players[voteIndex] !== onlinePlayerName
                    ? `Esperando que ${players[voteIndex]} elija su sospechoso...`
                    : "Cada jugador debe votar en secreto por quien cree que es el Impostor."}
                </p>
              </div>

              {(gameMode === 'local' || players[voteIndex] === onlinePlayerName) ? (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6 card-shadow">
                  <div className="text-center space-y-1">
                    <span className="text-xs font-fredoka font-bold uppercase text-slate-400">Vota ahora</span>
                    <h3 className="text-3xl font-fredoka font-extrabold text-[#431c5d] tracking-tight">{players[voteIndex]}</h3>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-fredoka font-bold uppercase text-slate-400 mb-2">Selecciona a un jugador:</p>
                    <div className="grid grid-cols-2 gap-3">
                      {players.map((suspect, idx) => {
                        if (suspect === players[voteIndex]) return null;
                        const isSelected = selectedVotes[players[voteIndex]] === suspect;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleVoteSubmit(players[voteIndex], suspect)}
                            className={`py-4 px-4 rounded-2xl font-fredoka font-bold text-sm transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#d95a82] border-transparent text-white scale-105 shadow-md'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-[#2B2D42]'
                            }`}
                          >
                            {suspect}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 font-body">
                      Voto {voteIndex + 1} de {players.length}
                    </span>
                    
                    {selectedVotes[players[voteIndex]] ? (
                      voteIndex + 1 < players.length ? (
                        <button
                          onClick={() => setVoteIndex(voteIndex + 1)}
                          className="py-2.5 px-5 bg-[#006a61] hover:bg-[#00524b] text-white rounded-full text-xs font-fredoka font-bold uppercase flex items-center gap-1.5 shadow cursor-pointer transition-all"
                        >
                          Siguiente Voto <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={gameMode === 'online' ? handleTallyVotesOnline : tallyVotes}
                          className="py-2.5 px-5 bg-[#d95a82] hover:bg-[#c4496f] text-white rounded-full text-xs font-fredoka font-bold uppercase flex items-center gap-1.5 shadow cursor-pointer transition-all"
                        >
                          Mostrar Resultados <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )
                    ) : (
                      <span className="text-xs text-[#d95a82] font-fredoka font-bold">Selecciona sospechoso</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-6 card-shadow">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#d95a82] border-t-transparent"></div>
                  <h3 className="text-lg font-fredoka font-bold uppercase tracking-wide text-slate-400">
                    Votando
                  </h3>
                  <p className="text-sm text-slate-500 text-center font-body">
                    {players[voteIndex]} está votando en su propio teléfono. ¡Espera un momento!
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* SCREEN: GAME RESULTS & SCOREBOARD                        */}
          {/* ──────────────────────────────────────────────────────── */}
          {gamePhase === 'results' && !showAd && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="flex flex-col items-center gap-3 mb-2">
                <span className="bg-teal-50 text-[#006a61] border border-teal-200 px-4 py-1.5 rounded-full text-xs font-fredoka font-bold uppercase tracking-wider inline-block shadow-xs">
                  Resultados de Ronda 🏆
                </span>
                <h2 className="text-3xl font-fredoka font-extrabold uppercase text-[#431c5d] tracking-tight mt-1">Fin de la Partida</h2>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center space-y-6 card-shadow">
                <div className="text-center space-y-3">
                  <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-5xl animate-bounce">
                    🏆
                  </div>
                  <h3 className="text-3xl font-fredoka font-extrabold uppercase tracking-tight text-[#431c5d]">
                    {winner === 'innocents' ? "Ganaron los Ciudadanos" : "Ganó el Impostor"}
                  </h3>
                </div>

                <div className="w-full space-y-3 text-sm border-t border-b border-slate-100 py-4 font-bold font-body">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 uppercase text-xs">Palabra Ciudadanos:</span>
                    <span className="text-[#2B2D42] font-fredoka text-base">{wordPair?.innocent}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 uppercase text-xs">
                      {wordPair?.hint ? "Pista del Impostor:" : "Palabra Impostor:"}
                    </span>
                    <span className="text-[#d95a82] font-fredoka text-base">{wordPair?.hint || wordPair?.imposter || "Ninguna"}</span>
                  </div>
                  <div className="flex justify-between items-start pt-1">
                    <span className="text-slate-400 uppercase text-xs">Impostores:</span>
                    <div className="flex flex-wrap gap-1.5 justify-end max-w-xs">
                      {imposters.map((imp, idx) => (
                        <span key={idx} className="bg-red-50 text-[#d95a82] border border-red-200 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase">
                          {imp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scoreboard History */}
                <div className="w-full space-y-3">
                  <h4 className="text-xs font-fredoka font-bold uppercase tracking-wider text-slate-400">Tabla de Puntuaciones Acumuladas</h4>
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100">
                    {players.map((player, idx) => {
                      const scoreVal = scoreboard[player] || 0;
                      const isImp = imposters.includes(player);
                      return (
                        <div key={idx} className="flex justify-between items-center text-sm font-body">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#2B2D42]">{player}</span>
                            {isImp && <span className="text-slate-400 text-[10px] uppercase font-bold">(Impostor)</span>}
                          </div>
                          <span className="font-fredoka font-bold text-[#006a61] bg-white px-3 py-1 rounded-full text-xs border border-slate-200 shadow-sm">
                            {scoreVal} Pts
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="w-full flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (gameMode === 'online') {
                        if (isHost) {
                          handleResetOnline();
                        } else {
                          alert("Esperando a que el Anfitrión inicie la siguiente ronda...");
                        }
                      } else {
                        resetGame();
                      }
                    }}
                    className="tactile-button-teal flex-1 py-4 bg-[#006a61] text-white font-fredoka font-bold rounded-full uppercase tracking-wider text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <RotateCcw className="w-4 h-4" /> Siguiente Ronda
                  </button>

                  <button
                    onClick={() => {
                      resetGame();
                      resetScoreboard();
                    }}
                    className="py-4 px-5 bg-white border border-slate-200 text-slate-500 font-fredoka font-bold rounded-full uppercase text-xs tracking-wider shadow-sm hover:bg-slate-50 cursor-pointer transition-all"
                  >
                    Menú Principal
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ──────────────────────────────────────────────────────── */}
      {/* BOTTOM SHEET DRAWER MODAL CONTAINER                      */}
      {/* ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 bg-black/60 z-40 flex items-end justify-center select-none backdrop-blur-xs">
            <div className="fixed inset-0" onClick={() => setActiveModal(null)} />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-white w-full max-w-md rounded-t-[2.5rem] p-6 space-y-6 z-50 border-t border-slate-200 shadow-2xl relative"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-2" />

              {/* Modal header */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-fredoka font-bold uppercase tracking-tight text-[#431c5d]">
                  {activeModal === 'players' && "Administrar Jugadores"}
                  {activeModal === 'categories' && "Seleccionar Temas"}
                  {activeModal === 'impostors' && "Número de Impostores"}
                </h3>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body: PLAYERS LIST */}
              {activeModal === 'players' && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  <form onSubmit={handleAddPlayer} className="flex gap-2">
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="Nombre del jugador"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      className="flex-grow bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3 font-bold text-sm outline-none focus:border-[#006a61] font-body"
                    />
                    <button 
                      type="submit" 
                      className="p-4 bg-[#006a61] text-white shadow rounded-2xl hover:bg-[#00524b] cursor-pointer transition-all"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                  </form>

                  <div className="space-y-2">
                    {players.map((player, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 rounded-2xl px-4 py-3.5 border border-slate-100 font-body">
                        {editingIndex === idx ? (
                          <input
                            type="text"
                            maxLength={12}
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={() => {
                              renamePlayer(idx, editingName);
                              setEditingIndex(null);
                            }}
                            className="bg-white px-2 py-0.5 rounded font-bold outline-none border border-slate-300"
                            autoFocus
                          />
                        ) : (
                          <span 
                            className="font-bold text-sm cursor-pointer text-[#2B2D42]"
                            onClick={() => {
                              setEditingIndex(idx);
                              setEditingName(player);
                            }}
                          >
                            {player}
                          </span>
                        )}
                        
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => {
                              setEditingIndex(idx);
                              setEditingName(player);
                            }}
                            className="text-slate-300 hover:text-slate-700 cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {players.length > 3 && (
                            <button 
                              onClick={() => removePlayer(idx)}
                              className="text-slate-300 hover:text-[#d95a82] cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Body: CATEGORIES CHECKLIST */}
              {activeModal === 'categories' && (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {Object.entries(CATEGORIES_DB).map(([catKey, catVal]) => {
                    const isSelected = categories.includes(catKey);
                    return (
                      <div
                        key={catKey}
                        onClick={async () => {
                          if (catVal.free || isPremium) {
                            // Toggle category locally
                            toggleCategory(catKey);
                            
                            // Calculate next selection array immediately to sync to Firestore if host
                            let nextCats = [...categories];
                            if (nextCats.includes(catKey)) {
                              if (nextCats.length > 1) {
                                nextCats = nextCats.filter(c => c !== catKey);
                              }
                            } else {
                              nextCats.push(catKey);
                            }

                            if (gameMode === 'online' && lobbyId && isHost) {
                              const docRef = doc(db, 'imposter_lobbies', lobbyId);
                              try {
                                await updateDoc(docRef, { categories: nextCats });
                              } catch (e) {
                                console.error("Firestore sync error:", e);
                              }
                            }
                          } else {
                            // Locked category triggers paywall screen
                            setActiveModal(null);
                            setShowPaywall(true);
                          }
                        }}
                        className={`p-4 rounded-2xl border flex justify-between items-center cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-teal-50/70 border-[#006a61] text-[#006a61]'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-[#2B2D42]'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-fredoka font-bold text-sm uppercase">{catKey}</span>
                          <p className="text-[10px] text-slate-500 font-body">
                            {catVal.pairs.length} pares de palabras disponibles
                          </p>
                        </div>

                        {catVal.free || isPremium ? (
                          isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Lock className="w-4 h-4 text-[#d95a82]" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Modal Body: IMPOSTORS COUNT */}
              {activeModal === 'impostors' && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase font-fredoka">
                    Selecciona cuántos impostores se asignarán (límite basado en la cantidad de jugadores).
                  </p>

                  <div className="flex gap-3 justify-center">
                    {[1, 2, 3].map((num) => {
                      const isDisabled = players.length < 5 && num > 1;
                      const isSelected = imposterCount === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            setImposterCount(num);
                            setActiveModal(null);
                          }}
                          className={`w-16 h-16 rounded-full font-fredoka font-extrabold text-xl transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-[#006a61] border-transparent text-white scale-110 shadow-lg'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-[#2B2D42] disabled:opacity-30 disabled:pointer-events-none'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
