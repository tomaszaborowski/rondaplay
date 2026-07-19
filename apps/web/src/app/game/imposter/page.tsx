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
          categories: data.categories || ['Objetos'],
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
      categories: ['Objetos'],
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

    // Update scoreboard
    const nextScoreboard = { ...scoreboard };
    players.forEach((p) => {
      if (nextScoreboard[p] === undefined) nextScoreboard[p] = 0;
      const isImposter = imposters.includes(p);
      if (roundWinner === 'innocents' && !isImposter) nextScoreboard[p] += 1;
      else if (roundWinner === 'imposters' && isImposter) nextScoreboard[p] += 2;
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
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-montserrat pt-8 pb-12 px-4 relative overflow-hidden flex flex-col items-center select-none">
      
      {/* ── HEADER NAVIGATION ── */}
      <header className="w-full max-w-md px-2 flex justify-between items-center mb-6 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.location.href = '/'}
            className="p-2 bg-white/80 hover:bg-white border border-black/10 rounded-full shadow-sm active:scale-95 transition-all cursor-pointer"
            title="Volver al Inicio"
          >
            <ArrowRight className="w-4 h-4 text-black rotate-180" />
          </button>
          <h1 className="text-lg font-black tracking-tighter uppercase text-[#1A1A1A]">
            ¿Quién es el Impostor?
          </h1>
        </div>
        {isPremium && (
          <span className="bg-[#D4FF33] text-[#1A1A1A] text-[10px] font-black px-2.5 py-1 rounded-full uppercase shadow-sm">
            Premium ⭐
          </span>
        )}
      </header>

      {/* ── MAIN CONTENT LAYOUT ── */}
      <main className="flex-1 w-full max-w-md px-6 flex flex-col justify-center relative z-0">
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
              className="absolute inset-0 bg-[#F5F5F5] z-50 p-6 flex flex-col justify-between"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold uppercase tracking-widest text-[#FF4C4C]">RondaPlay Pro</span>
                <button onClick={() => setShowPaywall(false)} className="p-2 hover:bg-black/5 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {purchaseSuccess ? (
                <div className="flex-grow flex flex-col items-center justify-center space-y-4">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 text-4xl animate-bounce">
                    ✓
                  </div>
                  <h2 className="text-2xl font-black text-center">¡Compra Completada!</h2>
                  <p className="text-sm text-gray-500">Ya eres miembro Premium de RondaPlay.</p>
                </div>
              ) : (
                <div className="flex-grow flex flex-col justify-center space-y-8 my-6">
                  <div className="text-center space-y-3">
                    <div className="w-20 h-20 bg-[#D4FF33] rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-md rotate-3">
                      ⭐
                    </div>
                    <h2 className="text-3xl font-black tracking-tight">Desbloquea RondaPlay Premium</h2>
                    <p className="text-sm text-gray-600 max-w-xs mx-auto">
                      Accede a todas las categorías exclusivas, elimina todos los anuncios y juega partidas online ilimitadas con amigos.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white rounded-3xl p-5 border-2 border-[#1A1A1A] shadow-md flex justify-between items-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-[#D4FF33] text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl border-l border-b border-[#1A1A1A]">
                        3 Días Gratis
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm font-black uppercase">Plan Anual</span>
                        <p className="text-xs text-gray-500">Paga una vez al año. Cancela cuando quieras.</p>
                      </div>
                      <button 
                        onClick={() => handleSimulatePurchase('annual')}
                        className="py-2.5 px-4 bg-[#D4FF33] hover:bg-[#bce62b] border border-[#1A1A1A] rounded-full font-black text-xs shadow"
                      >
                        $9.99 / año
                      </button>
                    </div>

                    <div className="bg-white rounded-3xl p-5 border border-black/10 shadow flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="text-sm font-black uppercase">Plan Semanal</span>
                        <p className="text-xs text-gray-500">Suscripción recurrente semanal.</p>
                      </div>
                      <button 
                        onClick={() => handleSimulatePurchase('weekly')}
                        className="py-2.5 px-4 bg-[#1A1A1A] hover:bg-[#2d2d2d] text-white rounded-full font-black text-xs shadow"
                      >
                        $1.99 / sem
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center space-y-4">
                <span className="text-[10px] text-gray-400 block max-w-xs mx-auto">
                  La facturación se realiza a través de su cuenta de Apple App Store o Google Play Store. Puede cancelar en cualquier momento en los ajustes de su cuenta.
                </span>
                <button 
                  onClick={() => handleSimulatePurchase('annual')}
                  className="text-xs font-black underline tracking-wide block mx-auto"
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
              className="absolute inset-0 bg-black/90 z-50 p-6 flex flex-col justify-between text-white"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 tracking-wider">ANUNCIO SPONSOR</span>
                {adCountdown === 0 ? (
                  <button 
                    onClick={() => setShowAd(false)}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center font-bold"
                  >
                    <X className="w-5 h-5" />
                  </button>
                ) : (
                  <span className="text-xs bg-white/10 px-3 py-1.5 rounded-full font-bold">
                    Cerrar en {adCountdown}s
                  </span>
                )}
              </div>

              <div className="flex-grow flex flex-col items-center justify-center space-y-4">
                <div className="text-7xl">🎮</div>
                <h3 className="text-2xl font-black text-center uppercase tracking-tighter text-[#D4FF33]">Al Toque Games</h3>
                <p className="text-sm text-gray-300 text-center max-w-xs">
                  Prueba nuestros otros juegos de cartas y mesa en la app de RondaPlay. ¡Diversión garantizada!
                </p>
                <button className="py-3 px-6 bg-[#D4FF33] text-black font-black rounded-full uppercase text-xs tracking-wider border-b-4 border-[#A3CC00]">
                  Descargar Gratis
                </button>
              </div>

              <div className="text-center">
                <button 
                  onClick={() => {
                    setShowAd(false);
                    setShowPaywall(true);
                  }}
                  className="text-xs text-gray-400 underline"
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
                <span className="bg-red-100 text-red-500 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Modo Online
                </span>
                <h2 className="text-3xl font-black uppercase">Únete a la Sala</h2>
                <p className="text-gray-500 text-sm">
                  {isHost ? "Ingresa tu nombre para crear la sala de juego." : "Ingresa tu nombre para unirte al juego de tu amigo."}
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400">Tu Apodo / Nombre</label>
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="Ej. Tomas"
                    value={onlinePlayerName}
                    onChange={(e) => setOnlinePlayerName(e.target.value)}
                    className="w-full bg-[#F5F5F5] rounded-2xl border border-black/10 px-4 py-3 text-lg font-bold outline-none focus:border-[#D4FF33]"
                  />
                </div>

                <button
                  onClick={isHost ? handleCreateOnlineLobby : handleJoinOnlineLobby}
                  disabled={!onlinePlayerName.trim()}
                  className="w-full py-4 bg-[#D4FF33] disabled:opacity-50 text-[#1A1A1A] font-black rounded-2xl uppercase tracking-wider text-base shadow border-b-4 border-[#A3CC00] active:translate-y-1 active:border-b-0 transition-all"
                >
                  {isHost ? "Crear Sala de Juego" : "Entrar a la Partida"}
                </button>

                <button 
                  onClick={() => {
                    setGameMode('local');
                    setLobbyId(null);
                  }}
                  className="w-full text-center text-xs font-bold text-gray-400 underline"
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
              className="space-y-6 flex flex-col h-full justify-between"
            >
              
              {/* Stacked Config Cards */}
              <div className="space-y-4 flex-1">
                
                {/* Mode Selector pills */}
                {gameMode === 'local' && (
                  <div className="bg-white p-1 rounded-full border border-black/10 flex shadow-sm">
                    <button
                      onClick={() => setGameMode('local')}
                      className="flex-1 py-2 text-center rounded-full font-black text-xs uppercase bg-[#1A1A1A] text-white shadow-sm"
                    >
                      Pasa y Juega (Local)
                    </button>
                    <button
                      onClick={() => {
                        setGameMode('online');
                        setIsHost(true);
                        setHasJoinedOnline(false);
                      }}
                      className="flex-1 py-2 text-center rounded-full font-black text-xs uppercase text-gray-400 hover:text-black"
                    >
                      Multijugador Online
                    </button>
                  </div>
                )}

                {/* Online Lobby Status Details */}
                {gameMode === 'online' && (
                  <div className="bg-[#1A1A1A] text-white p-5 rounded-3xl space-y-3 shadow-md border-b-4 border-black">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-[#D4FF33] tracking-widest">Sala Online Activa</span>
                      <button 
                        onClick={handleShareSession}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="text-xl font-black">CÓDIGO: {lobbyId}</h3>
                    <p className="text-xs text-white/60">
                      Comparte el enlace de abajo con tus amigos para que se unan desde sus celulares.
                    </p>
                    <button 
                      onClick={handleShareSession}
                      className="w-full py-2.5 bg-white/10 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1 border border-white/20"
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
                  className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:border-black/10 cursor-pointer transition-all flex justify-between items-center"
                >
                  <div className="space-y-2 flex-1">
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-black">1. Jugadores ({players.length})</span>
                    <div className="flex flex-wrap gap-1.5 max-h-16 overflow-hidden">
                      {players.map((p, i) => (
                        <span key={i} className="bg-[#F5F5F5] text-xs font-bold px-2.5 py-1 rounded-full">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  {(gameMode === 'local' || isHost) && (
                    <Edit2 className="w-5 h-5 text-gray-300" />
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
                  className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:border-black/10 cursor-pointer transition-all flex justify-between items-center"
                >
                  <div className="space-y-1 flex-grow">
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-black">2. Temas Seleccionados</span>
                    <h3 className="text-lg font-black uppercase flex flex-wrap gap-1.5 pt-1">
                      {categories.map((cat) => (
                        <span key={cat} className="flex items-center gap-1 bg-black/5 text-[#1A1A1A] text-[10px] px-2.5 py-1 rounded-full font-bold">
                          {cat}
                          {!CATEGORIES_DB[cat]?.free && <Lock className="w-3 h-3 text-[#FF4C4C] inline ml-0.5" />}
                        </span>
                      ))}
                    </h3>
                  </div>
                  {(gameMode === 'local' || isHost) && (
                    <Edit2 className="w-5 h-5 text-gray-300 ml-2" />
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
                  className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:border-black/10 cursor-pointer transition-all flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-black">3. Número de Impostores</span>
                    <h3 className="text-lg font-black uppercase">{imposterCount} {imposterCount === 1 ? 'Impostor' : 'Impostores'}</h3>
                  </div>
                  {(gameMode === 'local' || isHost) && (
                    <Edit2 className="w-5 h-5 text-gray-300" />
                  )}
                </div>
              </div>

              {/* Bottom Sticky Action Buttons */}
              <div className="space-y-3 pt-6 border-t border-black/5 z-10 bg-[#F5F5F5] shrink-0">
                <div className="flex gap-3">
                  <button 
                    onClick={handleShareSession}
                    className="flex-1 py-3 bg-white border border-black/10 font-black rounded-2xl uppercase text-xs tracking-wider shadow-sm flex items-center justify-center gap-1"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Compartir
                  </button>
                  <button 
                    onClick={() => alert("¡Gracias por calificar RondaPlay!")}
                    className="flex-1 py-3 bg-white border border-black/10 font-black rounded-2xl uppercase text-xs tracking-wider shadow-sm flex items-center justify-center gap-1"
                  >
                    ⭐ Reseñar
                  </button>
                </div>

                {gameMode === 'online' && !isHost ? (
                  <div className="p-4 bg-white rounded-2xl text-center text-xs font-bold text-gray-400 border border-gray-200">
                    Esperando a que el Anfitrión comience la partida...
                  </div>
                ) : (
                  <button
                    onClick={gameMode === 'online' ? handleStartOnlineGame : startGame}
                    disabled={players.length < 3}
                    className="w-full py-5 bg-[#D4FF33] disabled:opacity-50 text-[#1A1A1A] font-black rounded-2xl uppercase tracking-wider text-lg shadow border-b-4 border-[#A3CC00] active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2"
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
              <div className="space-y-2">
                <span className="bg-[#FF4C4C]/10 text-[#FF4C4C] px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  Fase de Revelación
                </span>
                <h2 className="text-3xl font-black uppercase">¿Quién eres?</h2>
                <p className="text-gray-500 text-sm">
                  {gameMode === 'online' && players[currentPlayerIndex] !== onlinePlayerName
                    ? `Esperando que ${players[currentPlayerIndex]} vea su carta...`
                    : "Pasa el dispositivo y mantén presionado para revelar tu palabra secreta."}
                </p>
              </div>

              {(gameMode === 'local' || players[currentPlayerIndex] === onlinePlayerName) ? (
                <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex flex-col items-center space-y-6">
                  <div className="space-y-1">
                    <span className="text-xs font-black uppercase text-gray-400">Turno de</span>
                    <h3 className="text-3xl font-black tracking-tight">{players[currentPlayerIndex]}</h3>
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
                    className={`w-full min-h-[180px] rounded-2xl border-4 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer select-none transition-all ${
                      isHolding 
                        ? 'bg-[#1A1A1A] border-transparent text-[#D4FF33]' 
                        : 'bg-[#F5F5F5] hover:bg-black/5'
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
                        <h4 className="text-2xl font-black uppercase tracking-wide">
                          {imposters.includes(players[currentPlayerIndex]) ? "Eres el Impostor" : wordPair?.innocent}
                        </h4>
                        {!imposters.includes(players[currentPlayerIndex]) && (
                          <span className="text-xs text-white/50 block">Eres un Ciudadano</span>
                        )}
                        {imposters.includes(players[currentPlayerIndex]) && (
                          <span className="text-xs text-[#FF4C4C] block font-black">Pasa desapercibido</span>
                        )}
                      </motion.div>
                    ) : (
                      <div className="space-y-3 p-4">
                        <HelpCircle className="w-12 h-12 text-gray-300 mx-auto animate-pulse" />
                        <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                          Presiona y Mantén pulsado para revelar
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="w-full">
                    {revealDone && !isHolding ? (
                      <button
                        onClick={handleRevealNext}
                        className="w-full py-4 bg-[#D4FF33] text-black font-black rounded-2xl uppercase tracking-wider text-sm shadow border-b-4 border-[#A3CC00] active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-1"
                      >
                        Siguiente Jugador <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="py-4 text-center text-xs text-gray-400 font-bold">
                        Debes ver tu palabra antes de continuar.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-10 shadow-md border border-gray-100 flex flex-col items-center justify-center space-y-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ronda-teal"></div>
                  <h3 className="text-lg font-black uppercase tracking-wide text-gray-400">
                    Revelación en Curso
                  </h3>
                  <p className="text-sm text-gray-500">
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
              <div className="space-y-2">
                <span className="bg-[#D4FF33]/20 text-gray-700 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  Fase de Debate
                </span>
                <h2 className="text-3xl font-black uppercase">¡Debatan!</h2>
                <p className="text-gray-500 text-sm">
                  Hagan preguntas cortas para descubrir al impostor sin revelar su palabra secreta.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex flex-col items-center space-y-8">
                
                {/* Circular Countdown Timer */}
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle
                      cx="88"
                      cy="88"
                      r="76"
                      stroke="#E5E5E5"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="88"
                      cy="88"
                      r="76"
                      stroke={timeLeft <= 10 ? '#FF4C4C' : '#D4FF33'}
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 76}
                      strokeDashoffset={2 * Math.PI * 76 * (1 - timeLeft / timerMax)}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  
                  <div className="text-center space-y-1">
                    <span className="text-4xl font-black tracking-tight block">
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Segundos</span>
                  </div>
                </div>

                {/* Moderator controls (Only for Host or Local mode) */}
                {(gameMode === 'local' || isHost) && (
                  <div className="flex gap-3 justify-center w-full">
                    {isTimerRunning ? (
                      <button
                        onClick={handlePauseTimer}
                        className="py-3 px-6 bg-[#1A1A1A] hover:bg-[#2d2d2d] text-white font-black rounded-xl uppercase text-xs tracking-wider shadow"
                      >
                        Pausar
                      </button>
                    ) : (
                      <button
                        onClick={handleStartTimer}
                        className="py-3 px-6 bg-[#D4FF33] hover:bg-[#bce62b] text-black font-black rounded-xl uppercase text-xs tracking-wider shadow"
                      >
                        Iniciar
                      </button>
                    )}
                    <button
                      onClick={handleResetTimer}
                      className="py-3 px-6 bg-white border border-black/10 font-black rounded-xl uppercase text-xs tracking-wider shadow-sm"
                    >
                      Reiniciar
                    </button>
                  </div>
                )}

                <div className="w-full pt-4 border-t border-gray-100">
                  {gameMode === 'online' && !isHost ? (
                    <div className="p-4 bg-gray-50 rounded-2xl text-center text-xs font-bold text-gray-400">
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
                      className="w-full py-4 bg-[#D4FF33] text-black font-black rounded-2xl uppercase tracking-wider text-sm shadow border-b-4 border-[#A3CC00] active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-1.5"
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
              <div className="text-center space-y-2">
                <span className="bg-[#FF4C4C]/10 text-[#FF4C4C] px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  Fase de Votación
                </span>
                <h2 className="text-3xl font-black uppercase">¿Quién es sospechoso?</h2>
                <p className="text-gray-500 text-sm">
                  {gameMode === 'online' && players[voteIndex] !== onlinePlayerName
                    ? `Esperando que ${players[voteIndex]} elija su sospechoso...`
                    : "Cada jugador debe votar en secreto por quien cree que es el Impostor."}
                </p>
              </div>

              {(gameMode === 'local' || players[voteIndex] === onlinePlayerName) ? (
                <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 space-y-6">
                  <div className="text-center space-y-1">
                    <span className="text-xs font-black uppercase text-gray-400">Vota ahora</span>
                    <h3 className="text-3xl font-black tracking-tight">{players[voteIndex]}</h3>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-black uppercase text-gray-400 mb-2">Selecciona a un jugador:</p>
                    <div className="grid grid-cols-2 gap-3">
                      {players.map((suspect, idx) => {
                        if (suspect === players[voteIndex]) return null;
                        const isSelected = selectedVotes[players[voteIndex]] === suspect;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleVoteSubmit(players[voteIndex], suspect)}
                            className={`py-4 px-4 rounded-2xl font-black text-sm transition-all border ${
                              isSelected
                                ? 'bg-[#D4FF33] border-transparent text-[#1A1A1A] scale-105 shadow-md'
                                : 'bg-[#F5F5F5] border-black/5 hover:bg-black/5 text-[#1A1A1A]'
                            }`}
                          >
                            {suspect}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400">
                      Voto {voteIndex + 1} de {players.length}
                    </span>
                    
                    {selectedVotes[players[voteIndex]] ? (
                      voteIndex + 1 < players.length ? (
                        <button
                          onClick={() => setVoteIndex(voteIndex + 1)}
                          className="py-2.5 px-5 bg-[#1A1A1A] hover:bg-[#2d2d2d] text-white rounded-xl text-xs font-black uppercase flex items-center gap-1 shadow"
                        >
                          Siguiente Voto <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={gameMode === 'online' ? handleTallyVotesOnline : tallyVotes}
                          className="py-2.5 px-5 bg-[#FF4C4C] hover:bg-[#d43f3f] text-white rounded-xl text-xs font-black uppercase flex items-center gap-1 shadow"
                        >
                          Mostrar Resultados <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )
                    ) : (
                      <span className="text-xs text-[#FF4C4C] font-black">Selecciona sospechoso</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-10 shadow-md border border-gray-100 flex flex-col items-center justify-center space-y-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4C4C]"></div>
                  <h3 className="text-lg font-black uppercase tracking-wide text-gray-400">
                    Votando
                  </h3>
                  <p className="text-sm text-gray-500 text-center">
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
              <div className="text-center space-y-2">
                <span className="bg-[#D4FF33]/20 text-gray-700 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  Resultados de Ronda
                </span>
                <h2 className="text-3xl font-black uppercase text-[#1A1A1A]">Fin de la Partida</h2>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex flex-col items-center space-y-6">
                <div className="text-center space-y-3">
                  <div className="w-20 h-20 bg-[#D4FF33] rounded-full flex items-center justify-center mx-auto text-5xl animate-bounce">
                    🏆
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tight">
                    {winner === 'innocents' ? "Ganaron los Ciudadanos" : "Ganó el Impostor"}
                  </h3>
                </div>

                <div className="w-full space-y-3 text-sm border-t border-b border-gray-100 py-4 font-bold">
                  <div className="flex justify-between">
                    <span className="text-gray-400 uppercase text-xs">Palabra Ciudadanos:</span>
                    <span className="text-[#1A1A1A]">{wordPair?.innocent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 uppercase text-xs">Palabra Impostor:</span>
                    <span className="text-[#FF4C4C]">{wordPair?.imposter}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-400 uppercase text-xs">Impostores:</span>
                    <div className="flex flex-wrap gap-1.5 justify-end max-w-xs">
                      {imposters.map((imp, idx) => (
                        <span key={idx} className="bg-red-50 text-[#FF4C4C] text-[10px] px-2 py-0.5 rounded-full uppercase">
                          {imp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scoreboard History */}
                <div className="w-full space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Tabla de Puntuaciones Acumuladas</h4>
                  <div className="bg-[#F5F5F5] rounded-2xl p-4 space-y-2 border border-black/5">
                    {players.map((player, idx) => {
                      const scoreVal = scoreboard[player] || 0;
                      const isImp = imposters.includes(player);
                      return (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold">{player}</span>
                            {isImp && <span className="text-gray-400 text-[10px] uppercase font-bold">(Impostor)</span>}
                          </div>
                          <span className="font-black text-[#1A1A1A] bg-white px-3 py-1 rounded-full text-xs border border-black/5 shadow-sm">
                            {scoreVal} Pts
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="w-full flex gap-3 pt-4 border-t border-gray-100">
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
                    className="flex-1 py-4 bg-[#D4FF33] text-black font-black rounded-2xl uppercase tracking-wider text-xs shadow border-b-4 border-[#A3CC00] active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-4 h-4" /> Siguiente Ronda
                  </button>

                  <button
                    onClick={() => {
                      resetGame();
                      resetScoreboard();
                    }}
                    className="py-4 px-6 bg-white border border-black/10 text-gray-400 font-black rounded-2xl uppercase text-xs tracking-wider shadow-sm"
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
          <div className="fixed inset-0 bg-black/60 z-40 flex items-end justify-center select-none">
            <div className="fixed inset-0" onClick={() => setActiveModal(null)} />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-white w-full max-w-md rounded-t-[2.5rem] p-6 space-y-6 z-50 border-t border-black/10 shadow-2xl relative"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-2" />

              {/* Modal header */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black uppercase tracking-tight">
                  {activeModal === 'players' && "Administrar Jugadores"}
                  {activeModal === 'categories' && "Seleccionar Temas"}
                  {activeModal === 'impostors' && "Número de Impostores"}
                </h3>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-500" />
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
                      className="flex-grow bg-[#F5F5F5] rounded-2xl border border-black/10 px-4 py-3 font-bold text-sm outline-none focus:border-[#D4FF33]"
                    />
                    <button 
                      type="submit" 
                      className="p-4 bg-[#D4FF33] border border-black/15 shadow rounded-2xl active:translate-y-1"
                    >
                      <UserPlus className="w-5 h-5 text-black" />
                    </button>
                  </form>

                  <div className="space-y-2">
                    {players.map((player, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-[#F5F5F5] rounded-2xl px-4 py-3.5 border border-black/5">
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
                            className="bg-white px-2 py-0.5 rounded font-bold outline-none"
                            autoFocus
                          />
                        ) : (
                          <span 
                            className="font-bold text-sm cursor-pointer"
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
                            className="text-gray-300 hover:text-black"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {players.length > 3 && (
                            <button 
                              onClick={() => removePlayer(idx)}
                              className="text-gray-300 hover:text-[#FF4C4C]"
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
                            ? 'bg-[#D4FF33]/15 border-[#D4FF33] text-[#1A1A1A]'
                            : 'bg-[#F5F5F5] border-black/5 hover:bg-black/5 text-[#1A1A1A]'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-black text-sm uppercase">{catKey}</span>
                          <p className="text-[10px] text-gray-500">
                            {catVal.pairs.length} pares de palabras disponibles
                          </p>
                        </div>

                        {catVal.free || isPremium ? (
                          isSelected && <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Lock className="w-4 h-4 text-[#FF4C4C]" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Modal Body: IMPOSTORS COUNT */}
              {activeModal === 'impostors' && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-gray-400 uppercase">
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
                          className={`w-16 h-16 rounded-full font-black text-lg transition-all border ${
                            isSelected
                              ? 'bg-[#D4FF33] border-transparent text-[#1A1A1A] scale-110 shadow-lg'
                              : 'bg-[#F5F5F5] border-black/5 hover:bg-black/5 text-[#1A1A1A] disabled:opacity-30 disabled:pointer-events-none'
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
