"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import type { Html5Qrcode } from "html5-qrcode";
import { 
  Settings, 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Users, 
  Play, 
  Sparkles, 
  Pause, 
  Trophy, 
  Copy, 
  Plus, 
  RotateCcw,
  Smile,
  Shield,
  HelpCircle,
  Video,
  X,
  ChevronRight,
  Star
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { recordGameVictory } from "@/lib/userProfile";
import { useRouter } from "next/navigation";

// Character images representing symbols for Al Toque game
const symbolsAssets = [
  "/images/speed-match/characters/Abeja.png",
  "/images/speed-match/characters/Apple.png",
  "/images/speed-match/characters/Asparagus.png",
  "/images/speed-match/characters/Avellanas.png",
  "/images/speed-match/characters/Ballena.png",
  "/images/speed-match/characters/Barolome.png",
  "/images/speed-match/characters/Brocolli.png",
  "/images/speed-match/characters/Bunny.png",
  "/images/speed-match/characters/Caballo.png",
  "/images/speed-match/characters/Cafe.png",
  "/images/speed-match/characters/Cake.png",
  "/images/speed-match/characters/Cangrejo.png",
  "/images/speed-match/characters/Cappuchino.png",
  "/images/speed-match/characters/Castle.png",
  "/images/speed-match/characters/Cherry.png",
  "/images/speed-match/characters/Cinnamon.png",
  "/images/speed-match/characters/Cocodrile.png",
  "/images/speed-match/characters/Coral.png",
  "/images/speed-match/characters/Corn.png",
  "/images/speed-match/characters/Croissant.png",
  "/images/speed-match/characters/Dog.png",
  "/images/speed-match/characters/Dorit.png",
  "/images/speed-match/characters/Dragon.png",
  "/images/speed-match/characters/Duck.png",
  "/images/speed-match/characters/Edam.png",
  "/images/speed-match/characters/Esponja.png",
  "/images/speed-match/characters/Fish.png",
  "/images/speed-match/characters/GingerbreadMan.png",
  "/images/speed-match/characters/GymStar.png",
  "/images/speed-match/characters/Jirafa.png",
  "/images/speed-match/characters/Lion.png",
  "/images/speed-match/characters/Macaron.png",
  "/images/speed-match/characters/Mapache.png",
  "/images/speed-match/characters/Marshmallows.png",
  "/images/speed-match/characters/Milka.png",
  "/images/speed-match/characters/Octopus.png",
  "/images/speed-match/characters/Oniguiri.png",
  "/images/speed-match/characters/Peanut.png",
  "/images/speed-match/characters/Pelota.png",
  "/images/speed-match/characters/Piggy.png",
  "/images/speed-match/characters/Plant.png",
  "/images/speed-match/characters/Preetzel.png",
  "/images/speed-match/characters/Puppy.png",
  "/images/speed-match/characters/Rainbow.png",
  "/images/speed-match/characters/Raton.png",
  "/images/speed-match/characters/Regadera.png",
  "/images/speed-match/characters/Roll.png",
  "/images/speed-match/characters/Rollie.png",
  "/images/speed-match/characters/Salchicha.png",
  "/images/speed-match/characters/Sandwich.png",
  "/images/speed-match/characters/Smores.png",
  "/images/speed-match/characters/Star.png",
  "/images/speed-match/characters/Syrup.png",
  "/images/speed-match/characters/Tennis.png",
  "/images/speed-match/characters/Tiger.png",
  "/images/speed-match/characters/Tortuga.png",
  "/images/speed-match/characters/Unicorn.png",
  "/images/speed-match/characters/Vase.png",
  "/images/speed-match/characters/Woods.png"
];

// Available custom avatars for Player 2 and user selection
const avatarOptions = [
  { id: "shark", src: "/images/speed-match/characters/Fish.png", name: "Tiburón" },
  { id: "lion", src: "/images/speed-match/characters/Lion.png", name: "León" },
  { id: "unicorn", src: "/images/speed-match/characters/Unicorn.png", name: "Unicornio" },
  { id: "octopus", src: "/images/speed-match/characters/Octopus.png", name: "Pulpo" },
  { id: "giraffe", src: "/images/speed-match/characters/Jirafa.png", name: "Jirafa" }
];

type LayoutSlot = { x: number; y: number; scale: number; rot: number };

// Generates beautifully scattered coordinates inside the card octagon
function generateCardSlots(numSymbols = 8): LayoutSlot[] {
  const slots: LayoutSlot[] = [];
  
  // Center slot with small random offset
  slots.push({
    x: 50 + (Math.random() * 6 - 3),
    y: 50 + (Math.random() * 6 - 3),
    scale: 0.8 + Math.random() * 0.2, // 80% to 100%
    rot: Math.random() * 90 - 45      // -45 to +45 deg
  });

  // Outer ring slots (distributed radially)
  const numOuter = numSymbols - 1;
  const startAngle = Math.random() * Math.PI * 2;
  for (let i = 0; i < numOuter; i++) {
    const angle = startAngle + (i * Math.PI * 2) / numOuter + (Math.random() * 0.3 - 0.15);
    const radius = 31 + (Math.random() * 4 - 2); // Pushed outward to prevent overlaps
    slots.push({
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle),
      scale: 0.7 + Math.random() * 0.3, // 70% to 100% (bigger symbols)
      rot: Math.random() * 90 - 45      // -45 to +45 deg
    });
  }
  return slots;
}

// Finite projective plane deck generator
// Generates n^2 + n + 1 cards sharing exactly 1 symbol with any other card
function generateDobbleDeck(n = 7): number[][] {
  const deck: number[][] = [];
  
  // Card 1
  const firstCard: number[] = [];
  for (let i = 0; i <= n; i++) {
    firstCard.push(i);
  }
  deck.push(firstCard);

  // Next n cards
  for (let j = 0; j < n; j++) {
    const card = [0];
    for (let k = 0; k < n; k++) {
      card.push((n + 1) + n * j + k);
    }
    deck.push(card);
  }

  // Remaining n*n cards
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const card = [i + 1];
      for (let k = 0; k < n; k++) {
        const val = (n + 1) + n * k + (i * k + j) % n;
        card.push(val);
      }
      deck.push(card);
    }
  }
  return deck;
}

// Simple Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// WebRTC SDP Compression Helpers (Vanilla ICE)
function packSDP(sdp: string): string {
  const lines = sdp.split('\r\n');
  let ufrag = '';
  let pwd = '';
  let fingerprint = '';
  const candidates: [string, string, string][] = [];
  
  lines.forEach(line => {
    if (line.startsWith('a=ice-ufrag:')) ufrag = line.split(':')[1];
    else if (line.startsWith('a=ice-pwd:')) pwd = line.split(':')[1];
    else if (line.startsWith('a=fingerprint:')) fingerprint = line.split('fingerprint:')[1];
    else if (line.startsWith('a=candidate:')) {
      const parts = line.split(' ');
      candidates.push([parts[7], parts[4], parts[5]]);
    }
  });

  return JSON.stringify({ u: ufrag, p: pwd, f: fingerprint, c: candidates });
}

function unpackSDP(packedStr: string, type: 'offer' | 'answer'): string {
  const { u, p, f, c } = JSON.parse(packedStr);
  
  let sdp = [
    'v=0',
    'o=- 1234567890123456789 2 IN IP4 127.0.0.1',
    's=-',
    't=0 0',
    'a=msid-semantic: WMS',
    'm=application 9 UDP/DTLS/SCTP webrtc-datachannel',
    'c=IN IP4 0.0.0.0',
    `a=ice-ufrag:${u}`,
    `a=ice-pwd:${p}`,
    `a=fingerprint:${f}`,
    type === 'offer' ? 'a=setup:actpass' : 'a=setup:active',
    'a=mid:0',
    'a=sctp-port:5000',
    'a=max-message-size:262144'
  ].join('\r\n') + '\r\n';

  c.forEach((cand: [string, string, string]) => {
    sdp += `a=candidate:1 1 UDP 2122260991 ${cand[1]} ${cand[2]} typ ${cand[0]}\r\n`;
  });

  return sdp;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
  color: string;
  type: 'star' | 'cross';
}

function generateParticles(x: number, y: number, type: 'star' | 'cross'): Particle[] {
  const numParticles = type === 'star' ? 12 : 6;
  const newParticles: Particle[] = [];
  const colors = type === 'star'
    ? ["#FF75A0", "#34C2B2", "#FFC800", "#8A2BE2", "#FF7A00"]
    : ["#FF4C4C"];
    
  const timestamp = Date.now();
  for (let i = 0; i < numParticles; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = type === 'star'
      ? 30 + Math.random() * 50
      : 15 + Math.random() * 20;
    newParticles.push({
      id: `${timestamp}-${i}-${Math.random()}`,
      x,
      y,
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance,
      color: colors[Math.floor(Math.random() * colors.length)],
      type
    });
  }
  return newParticles;
}

export default function SpeedMatchGame() {
  const router = useRouter();
  // Global View Navigation State
  const [gameState, setGameState] = useState<
    "menu" | "setup-local" | "playing-classic" | "playing-samescreen" | "gameover-classic" | "gameover-samescreen" | "lobby-friends" | "playing-friends" | "gameover-friends"
  >("menu");
  
  // Game mode context
  const [gameMode, setGameMode] = useState<"single" | "host" | "client">("single");
  
  // Game setup configurations
  const [symbolsPerCard, setSymbolsPerCard] = useState<6 | 8>(8);
  const [matchesToWin, setMatchesToWin] = useState<3 | 6 | 10>(10);
  
  // User profiles & stats from RondaPlay context
  const { userProfile } = useAuth();
  const [totalPoints, setTotalPoints] = useState(11500); // 11500 default points = 65% to Legend
  const [winStreak, setWinStreak] = useState(3);
  const [username, setUsername] = useState("lali_martinez");
  const [player2Name, setPlayer2Name] = useState("Player 2");
  const [player2Avatar, setPlayer2Avatar] = useState(avatarOptions[0]);
  const [player1Avatar, setPlayer1Avatar] = useState(avatarOptions[2]); // Moon default

  // Synchronize stats with RondaPlay profile context
  useEffect(() => {
    if (userProfile) {
      if (userProfile.username) {
        setUsername(userProfile.username);
      }
      if (userProfile.stats && typeof userProfile.stats.totalPoints === "number") {
        setTotalPoints(userProfile.stats.totalPoints);
      }
    }
  }, [userProfile]);

  // Synchronize game outcome with RondaPlay Firestore database
  useEffect(() => {
    if (gameState === "gameover-classic") {
      if (userProfile?.username) {
        recordGameVictory(userProfile.username, 'speed-match', score * 10).catch(console.error);
      }
    } else if (gameState === "gameover-samescreen") {
      // Local Versus mode: Player 1 (us) score is state `score`
      if (score >= matchesToWin && userProfile?.username) {
        recordGameVictory(userProfile.username, 'speed-match', 150).catch(console.error);
      }
    } else if (gameState === "gameover-friends") {
      // Online match mode: Player 1 (us) score is state `score`
      if (score >= matchesToWin && userProfile?.username) {
        recordGameVictory(userProfile.username, 'speed-match', 250).catch(console.error);
      }
    }
  }, [gameState]);
  
  // Game scores
  const [score, setScore] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  
  // Classic mode time & progress
  const [classicTimeLeft, setClassicTimeLeft] = useState(60);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cards state
  const [commonCard, setCommonCard] = useState<number[]>([]);
  const [playerCard, setPlayerCard] = useState<number[]>([]);
  const [player2Card, setPlayer2Card] = useState<number[]>([]);
  
  // Layout slots configurations
  const [commonCardSlots, setCommonCardSlots] = useState<LayoutSlot[]>([]);
  const [playerCardSlots, setPlayerCardSlots] = useState<LayoutSlot[]>([]);
  const [player2CardSlots, setPlayer2CardSlots] = useState<LayoutSlot[]>([]);
  
  // Juice animations states
  const [correctMatchSymbolId, setCorrectMatchSymbolId] = useState<number | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isShakingP2, setIsShakingP2] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Modals overlays
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdsOpen, setIsAdsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [vibeEnabled, setVibeEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  // WebRTC & connection states
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "generating" | "scanning" | "connecting" | "connected">("disconnected");
  const [sdpToken, setSdpToken] = useState("");
  const [inputSdpToken, setInputSdpToken] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [errorText, setErrorText] = useState("");
  
  // Game logic deck references
  const deckRef = useRef<number[][]>([]);
  const availableCardsRef = useRef<number[][]>([]);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);

  // Audio Context sound synthesizer
  const playSound = (type: "correct" | "error" | "win") => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (type === "correct") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === "error") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.setValueAtTime(100, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === "win") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.warn("Audio autoplay blocked by browser policy");
    }
  };

  // Particles generator trigger
  const createParticles = (x: number, y: number, type: 'star' | 'cross') => {
    const newParticles = generateParticles(x, y, type);
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.slice(newParticles.length));
    }, 600);
  };

  // Shaking animations triggers
  const triggerShake = (player: 1 | 2 = 1, clientX?: number, clientY?: number) => {
    if (vibeEnabled && navigator.vibrate) navigator.vibrate(80);
    playSound("error");
    if (clientX !== undefined && clientY !== undefined) {
      createParticles(clientX, clientY, 'cross');
    }
    
    if (player === 1) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
    } else {
      setIsShakingP2(true);
      setTimeout(() => setIsShakingP2(false), 400);
    }
  };

  // 1. Classic mode Timer loop
  useEffect(() => {
    if (gameState === "playing-classic" && !isPaused) {
      timerRef.current = setInterval(() => {
        setClassicTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setGameState("gameover-classic");
            playSound("win");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, isPaused]);

  // 2. Play Actions triggers
  const startSinglePlayer = () => {
    const n = symbolsPerCard === 6 ? 5 : 7;
    deckRef.current = generateDobbleDeck(n);
    availableCardsRef.current = shuffle([...deckRef.current]);

    const firstCommon = availableCardsRef.current.pop()!;
    const firstPlayer = availableCardsRef.current.pop()!;
    
    setCommonCard(firstCommon);
    setPlayerCard(firstPlayer);
    setCommonCardSlots(generateCardSlots(symbolsPerCard));
    setPlayerCardSlots(generateCardSlots(symbolsPerCard));
    
    setScore(0);
    setClassicTimeLeft(60);
    setIsPaused(false);
    setGameState("playing-classic");
  };

  const startSameScreenGame = () => {
    const n = symbolsPerCard === 6 ? 5 : 7;
    deckRef.current = generateDobbleDeck(n);
    
    // Draw two initial cards that share exactly one symbol
    drawNextSameScreenRound(true);
    
    setScore(0);
    setPlayer2Score(0);
    setGameState("playing-samescreen");
  };

  const drawNextSameScreenRound = (isInitial = false) => {
    if (isInitial || availableCardsRef.current.length < 2) {
      const n = symbolsPerCard === 6 ? 5 : 7;
      availableCardsRef.current = shuffle(generateDobbleDeck(n));
    }
    const card1 = availableCardsRef.current.pop()!;
    const card2 = availableCardsRef.current.pop()!;
    
    setPlayerCard(card1);
    setPlayer2Card(card2);
    setPlayerCardSlots(generateCardSlots(symbolsPerCard));
    setPlayer2CardSlots(generateCardSlots(symbolsPerCard));
  };

  // Same Screen tap event validator
  const handleLocalSameScreenTap = (
    event: React.MouseEvent | React.TouchEvent, 
    symbolId: number, 
    playerNum: 1 | 2
  ) => {
    event.preventDefault();
    if (correctMatchSymbolId !== null) return; // Prevent double taps during animations

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const opposingCard = playerNum === 1 ? player2Card : playerCard;

    if (opposingCard.includes(symbolId)) {
      setCorrectMatchSymbolId(symbolId);
      createParticles(clientX, clientY, 'star');
      playSound("correct");

      const nextP1 = playerNum === 1 ? score + 1 : score;
      const nextP2 = playerNum === 2 ? player2Score + 1 : player2Score;

      setScore(nextP1);
      setPlayer2Score(nextP2);

      setTimeout(() => {
        setCorrectMatchSymbolId(null);
        
        // Check victory thresholds
        if (nextP1 >= matchesToWin || nextP2 >= matchesToWin) {
          // Increase streak if Player 1 won
          if (nextP1 >= matchesToWin) {
            setWinStreak(prev => Math.min(5, prev + 1));
            setTotalPoints(prev => prev + 150);
          } else {
            setWinStreak(0);
          }
          setGameState("gameover-samescreen");
          playSound("win");
          return;
        }

        // Draw next pair
        drawNextSameScreenRound();
      }, 500);
    } else {
      triggerShake(playerNum, clientX, clientY);
    }
  };

  // Classic mode tap event validator
  const handleClassicTap = (event: React.MouseEvent | React.TouchEvent, symbolId: number) => {
    event.preventDefault();
    if (correctMatchSymbolId !== null || isPaused) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    if (commonCard.includes(symbolId)) {
      setCorrectMatchSymbolId(symbolId);
      createParticles(clientX, clientY, 'star');
      playSound("correct");
      
      const nextScore = score + 1;
      setScore(nextScore);

      setTimeout(() => {
        setCorrectMatchSymbolId(null);
        
        // Add round score bonus
        setTotalPoints(prev => prev + 10);
        
        const nextCommon = [...playerCard];
        const n = symbolsPerCard === 6 ? 5 : 7;
        
        if (availableCardsRef.current.length === 0) {
          availableCardsRef.current = shuffle(generateDobbleDeck(n)).filter(
            card => JSON.stringify(card) !== JSON.stringify(nextCommon)
          );
        }
        
        const nextPlayer = availableCardsRef.current.pop()!;
        
        setCommonCard(nextCommon);
        setPlayerCard(nextPlayer);
        setCommonCardSlots(generateCardSlots(symbolsPerCard));
        setPlayerCardSlots(generateCardSlots(symbolsPerCard));
      }, 500);
    } else {
      triggerShake(1, clientX, clientY);
    }
  };

  // 3. Online Multiplayer Setup (Friends Mode WebRTC)
  const initializeWebRTC = async (mode: "host" | "client") => {
    setConnectionStatus("generating");
    setErrorText("");
    
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    peerConnectionRef.current = pc;

    if (mode === "host") {
      const channel = pc.createDataChannel("game-channel");
      setupDataChannel(channel);
      
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
    }

    pc.onicegatheringstatechange = async () => {
      if (pc.iceGatheringState === "complete" && pc.localDescription) {
        const packed = packSDP(pc.localDescription.sdp);
        const encoded = btoa(JSON.stringify({ type: pc.localDescription.type, sdp: packed }));
        setSdpToken(encoded);
        
        try {
          const qrUrl = await QRCode.toDataURL(encoded, { width: 300, margin: 2 });
          setQrCodeUrl(qrUrl);
          setConnectionStatus(mode === "host" ? "scanning" : "generating");
        } catch (err) {
          console.error("QR Code generation error:", err);
          setErrorText("Failed to generate QR Code. Use token fallback.");
        }
      }
    };

    if (mode === "client") {
      pc.ondatachannel = (e) => {
        setupDataChannel(e.channel);
      };
    }
  };

  const handleRemoteSDP = async (encodedToken: string) => {
    setErrorText("");
    if (!encodedToken || typeof encodedToken !== "string") {
      setErrorText("Por favor, introduce un token de conexión válido.");
      return;
    }

    const trimmed = encodedToken.trim();
    if (!trimmed) {
      setErrorText("El token no puede estar vacío.");
      return;
    }

    // Base64 pattern validation
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!base64Regex.test(trimmed)) {
      setErrorText("El formato del token no es válido.");
      return;
    }

    try {
      const pc = peerConnectionRef.current;
      if (!pc) {
        setErrorText("Conexión no inicializada.");
        return;
      }

      const decodedStr = atob(trimmed);
      if (!decodedStr || !decodedStr.trim().startsWith("{")) {
        setErrorText("El token no contiene un formato de datos válido.");
        return;
      }

      const decoded = JSON.parse(decodedStr);
      if (!decoded.sdp || !decoded.type) {
        setErrorText("El token no contiene la configuración de red requerida.");
        return;
      }

      const unpackedSdp = unpackSDP(decoded.sdp, decoded.type);
      
      await pc.setRemoteDescription(new RTCSessionDescription({
        type: decoded.type,
        sdp: unpackedSdp
      }));

      if (decoded.type === "offer" && gameMode === "client") {
        setConnectionStatus("generating");
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
      } else if (decoded.type === "answer" && gameMode === "host") {
        setConnectionStatus("connecting");
      }
    } catch (err) {
      console.error("SDP Token parsing error:", err);
      setErrorText("No se pudo descodificar el token de conexión.");
    }
  };

  const setupDataChannel = (channel: RTCDataChannel) => {
    dataChannelRef.current = channel;
    
    channel.onopen = () => {
      setConnectionStatus("connected");
      setGameState("playing-friends");
      playSound("win");
      if (gameMode === "host") {
        startMultiplayerGame();
      }
    };

    channel.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "STATE_UPDATE") {
        setCommonCard(msg.commonCard);
        setCommonCardSlots(msg.commonCardSlots);
        
        const myCard = gameMode === "host" ? msg.hostCard : msg.clientCard;
        const mySlots = gameMode === "host" ? msg.hostCardSlots : msg.clientCardSlots;
        setPlayerCard(myCard);
        setPlayerCardSlots(mySlots);
        
        setScore(msg.scores[gameMode]);
        setOpponentScore(msg.scores[gameMode === "host" ? "client" : "host"]);
        
        setGameState("playing-friends");
      } else if (msg.type === "OPPONENT_FEEDBACK") {
        if (msg.result === "correct") {
          setCorrectMatchSymbolId(msg.symbolId);
          playSound("correct");
          setTimeout(() => setCorrectMatchSymbolId(null), 500);
        } else {
          triggerShake(1);
        }
      } else if (msg.type === "TAP" && gameMode === "host") {
        validateMultiplayerTap(msg.symbolId, "client");
      } else if (msg.type === "GAME_OVER") {
        const myScore = gameMode === "host" ? msg.scores.host : msg.scores.client;
        const oppScore = gameMode === "host" ? msg.scores.client : msg.scores.host;
        setScore(myScore);
        setOpponentScore(oppScore);
        setGameState("gameover-friends");
        playSound("win");
      } else if (msg.type === "RESTART_REQUEST" && gameMode === "host") {
        startMultiplayerGame();
      }
    };

    channel.onclose = () => {
      setConnectionStatus("disconnected");
      setGameState("menu");
    };
  };

  const startCameraScanner = async () => {
    setShowCamera(true);
    setErrorText("");
    
    const { Html5Qrcode } = await import("html5-qrcode");
    
    setTimeout(() => {
      const scanner = new Html5Qrcode("reader");
      qrScannerRef.current = scanner;
      
      scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          handleRemoteSDP(decodedText);
          stopCameraScanner();
        },
        (errorMessage) => {
          // Keep scanning silently
        }
      ).catch(err => {
        console.error("Camera access error:", err);
        setErrorText("Camera not accessible. Copy-paste tokens below.");
        setShowCamera(false);
      });
    }, 100);
  };

  const stopCameraScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop().then(() => {
        qrScannerRef.current = null;
        setShowCamera(false);
      }).catch(console.error);
    }
  };

  const startMultiplayerGame = () => {
    const n = symbolsPerCard === 6 ? 5 : 7;
    deckRef.current = generateDobbleDeck(n);
    availableCardsRef.current = shuffle([...deckRef.current]);

    const firstCommon = availableCardsRef.current.pop()!;
    const hostCard = availableCardsRef.current.pop()!;
    const clientCard = availableCardsRef.current.pop()!;

    setScore(0);
    setOpponentScore(0);
    
    broadcastMultiplayerState(firstCommon, hostCard, clientCard, { host: 0, client: 0 });
  };

  const broadcastMultiplayerState = (common: number[], host: number[], client: number[], scores: { host: number; client: number }) => {
    const commonSlots = generateCardSlots(symbolsPerCard);
    const hostSlots = generateCardSlots(symbolsPerCard);
    const clientSlots = generateCardSlots(symbolsPerCard);

    setCommonCard(common);
    setCommonCardSlots(commonSlots);
    
    const myCard = gameMode === "host" ? host : client;
    const mySlots = gameMode === "host" ? hostSlots : clientSlots;
    setPlayerCard(myCard);
    setPlayerCardSlots(mySlots);

    if (dataChannelRef.current?.readyState === "open") {
      dataChannelRef.current.send(JSON.stringify({
        type: "STATE_UPDATE",
        commonCard: common,
        commonCardSlots: commonSlots,
        hostCard: host,
        hostCardSlots: hostSlots,
        clientCard: client,
        clientCardSlots: clientSlots,
        scores
      }));
    }
  };

  const validateMultiplayerTap = (symbolId: number, player: "host" | "client") => {
    if (correctMatchSymbolId !== null) return;

    if (commonCard.includes(symbolId)) {
      setCorrectMatchSymbolId(symbolId);
      playSound("correct");

      const hostScore = player === "host" ? score + 1 : score;
      const clientScore = player === "client" ? opponentScore + 1 : opponentScore;
      setScore(hostScore);
      setOpponentScore(clientScore);

      dataChannelRef.current?.send(JSON.stringify({
        type: "OPPONENT_FEEDBACK",
        result: "correct",
        symbolId
      }));

      setTimeout(() => {
        setCorrectMatchSymbolId(null);

        if (hostScore >= matchesToWin || clientScore >= matchesToWin) {
          if (dataChannelRef.current?.readyState === "open") {
            dataChannelRef.current.send(JSON.stringify({
              type: "GAME_OVER",
              scores: { host: hostScore, client: clientScore }
            }));
          }
          setGameState("gameover-friends");
          playSound("win");
          return;
        }

        const winningCard = player === "host" ? playerCard : (playerCard === commonCard ? commonCard : playerCard);
        const nextCommon = [...winningCard];

        if (availableCardsRef.current.length < 2) {
          const n = symbolsPerCard === 6 ? 5 : 7;
          availableCardsRef.current = shuffle(generateDobbleDeck(n)).filter(
            card => JSON.stringify(card) !== JSON.stringify(nextCommon)
          );
        }

        const nextHostCard = player === "host" ? availableCardsRef.current.pop()! : playerCard;
        const nextClientCard = player === "client" ? availableCardsRef.current.pop()! : playerCard;

        broadcastMultiplayerState(nextCommon, nextHostCard, nextClientCard, { host: hostScore, client: clientScore });
      }, 500);
    } else {
      triggerShake(1);
      dataChannelRef.current?.send(JSON.stringify({
        type: "OPPONENT_FEEDBACK",
        result: "incorrect"
      }));
    }
  };

  const handleFriendsTap = (event: React.MouseEvent | React.TouchEvent, symbolId: number) => {
    event.preventDefault();
    if (correctMatchSymbolId !== null) return;
    
    if (gameMode === "client") {
      if (dataChannelRef.current?.readyState === "open") {
        dataChannelRef.current.send(JSON.stringify({
          type: "TAP",
          symbolId
        }));
      }
    } else if (gameMode === "host") {
      validateMultiplayerTap(symbolId, "host");
    }
  };

  // Clean WebRTC connections
  useEffect(() => {
    return () => {
      stopCameraScanner();
      peerConnectionRef.current?.close();
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col items-center justify-between select-none touch-none text-slate-800 font-sans overflow-hidden relative">
      
      {/* Dynamic particles renderer */}
      {particles.map(p => (
        <span
          key={p.id}
          className="absolute text-3xl font-bold pointer-events-none z-50 animate-explode"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            color: p.color,
            "--tx": `${p.tx}px`,
            "--ty": `${p.ty}px`
          } as React.CSSProperties}
        >
          {p.type === 'star' ? '★' : '✖'}
        </span>
      ))}

      {/* Embedded keyframes */}
      <style>{`
        @keyframes scalePulse {
          0% { transform: scale(1); }
          30% { transform: scale(0.85); }
          75% { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
        .animate-scale-pulse {
          animation: scalePulse 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important;
          z-index: 10;
        }
        @keyframes cardShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-10px); }
          40%, 80% { transform: translateX(10px); }
        }
        .animate-card-shake {
          animation: cardShake 0.35s ease-in-out !important;
        }
        @keyframes customExplode {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0.3); opacity: 0; }
        }
        .animate-explode {
          animation: customExplode 0.6s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
        .clip-octagon {
          clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
        }
      `}</style>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 1. VIEW RENDERERS */}
      {/* ───────────────────────────────────────────────────────────────── */}

      {/* MAIN MENU */}
      {gameState === "menu" && (() => {
        const getExpertiseLevel = (points: number) => {
          if (points < 1000) {
            return {
              levelName: "Rookie",
              nextLevelName: "Pro",
              progress: Math.floor((points / 1000) * 100),
              activeLevels: ["Rookie"]
            };
          } else if (points < 5000) {
            return {
              levelName: "Pro",
              nextLevelName: "Expert",
              progress: Math.floor(((points - 1000) / 4000) * 100),
              activeLevels: ["Rookie", "Pro"]
            };
          } else if (points < 15000) {
            return {
              levelName: "Expert",
              nextLevelName: "Legend",
              progress: Math.floor(((points - 5000) / 10000) * 100),
              activeLevels: ["Rookie", "Pro", "Expert"]
            };
          } else {
            return {
              levelName: "Legend",
              nextLevelName: "Legend",
              progress: 100,
              activeLevels: ["Rookie", "Pro", "Expert", "Legend"]
            };
          }
        };
        const levelInfo = getExpertiseLevel(totalPoints);

        return (
          <div 
            className="w-full flex-1 flex flex-col bg-cover bg-center max-w-md shadow-2xl relative overflow-y-auto overflow-x-hidden text-white"
            style={{ 
              backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDyXMHPIeHS1eKVAEadbKhiIq9ZF7m0MEP-t-3Phy4Cu9Fl9CUroG2aDYmISC_p6vVeYK6bJZemdV3lcwGWWIfLmSO_aAvpyGLH-20Od5TtxWLj07CU5O8mN-MhTT4ssPw866df31Ogi81HRH9T8pZt2Ble4N0EZ-0eqEYSmZL6srLzlZzPHAbk_afazDudaQu7GKcKPDMZ6JKqp0ZIzFyzHH8C0T32koQYsvmh3F6R8AdED5ByZ1rf-f3MRTyBxi_0JbIagcdDbUEDlw")`,
              minHeight: "100%"
            }}
          >
            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-64 h-64 rounded-full bg-[#59decd]/20 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[-10%] w-72 h-72 rounded-full bg-[#d95a82]/20 blur-[100px] pointer-events-none" />

            {/* Header Content */}
            <header className="flex flex-col px-6 pt-8 pb-4 z-10 w-full gap-5 shrink-0">
              <div className="flex justify-center mb-2">
                <img 
                  alt="Al Toque!" 
                  className="h-20 w-auto object-contain drop-shadow-md" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmcurKePAVb5wZogHI0PL9iPn7qn8fK3CKFMOCVn8XIoT8erCs2LLc1DYO60w9VFZFiIQICPQAEsN4djhP0Djn4vIjNQNIwZ0tfAU0rfUD-8cgKZANCQ0b0-1PemtYdv07VLWsffqgJvGfvIv9dpgeLkYqMFYtRYaSdfHQoQzEv5jhhMkP3_lfcfy9RUCMzPiBhKXr6TU9nylICf7rtstFd7MbFb8f7R_3zAUh2cSp-GPjVTSDrDg4dR7MgT1ebU0vvA" 
                />
              </div>

              <div className="flex justify-between items-center w-full">
                {/* Avatar & Username */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="relative group active:scale-95 transition-transform"
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#59decd] shadow-[0_0_15px_rgba(89,222,205,0.3)] bg-[#1c1e32]">
                      <img 
                        className="w-full h-full object-cover" 
                        src={userProfile?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAFOrhF_BtswQsx_T0I6eSf_QlIElYvIPYBM4fWuUFOhYq8uorPMdUzOiU7YifMVoIevcABMJqqvul9KTNpmybSJGSoYh8yE662NcVafXo5k8DtrF5TMSYA2dCDMpOUMjL-ZU2r_BMpzQeTkcDC50F1K24WGCxUeXEyJahP0rnKjGUBFPsOJ6V1qODVS0rR1p-rKpPp6jUKl43xPPgDAZj6f-81QmkyPtV7QrnrMS1iAoOgG_i0npu4u48VtyFfYWdydg"} 
                        alt="avatar" 
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-[#ffb1c4] text-[#65002e] w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] border-2 border-[#101225] shadow">
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                  </button>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-[10px] font-bold text-[#75f7e6] uppercase tracking-widest mb-0.5 font-Poppins">My Profile</span>
                    <span className="text-md font-bold text-white drop-shadow-md font-Fredoka">@{username}</span>
                  </div>
                </div>

                {/* Points count (Glassmorphic Pill) */}
                <div className="flex items-center gap-2 bg-[#313349]/60 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 shadow-sm">
                  <Star className="w-5 h-5 text-[#75f7e6] fill-current" />
                  <span className="font-bold text-sm text-[#75f7e6] tracking-wide font-Poppins">
                    {totalPoints.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Scoring Timeline Progress bar */}
              <div className="w-full bg-[#1c1e32]/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-sm text-left">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-xs text-white uppercase tracking-wider font-Fredoka">
                    {levelInfo.levelName} Level
                  </span>
                  <span className="text-xs font-bold text-[#75f7e6] font-Poppins">
                    {levelInfo.progress}% to {levelInfo.nextLevelName}
                  </span>
                </div>
                <div className="relative w-full h-3 bg-[#313349] rounded-full overflow-hidden mb-2 shadow-inner">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#59decd] to-[#75f7e6] rounded-full transition-all duration-500" 
                    style={{ width: `${levelInfo.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest mt-1.5 font-Poppins">
                  <span className={levelInfo.activeLevels.includes("Rookie") ? "text-[#75f7e6] drop-shadow-sm" : "text-[#bbcac6] opacity-50"}>Rookie</span>
                  <span className={levelInfo.activeLevels.includes("Pro") ? "text-[#75f7e6] drop-shadow-sm" : "text-[#bbcac6] opacity-50"}>Pro</span>
                  <span className={levelInfo.activeLevels.includes("Expert") ? "text-[#75f7e6] drop-shadow-sm" : "text-[#bbcac6] opacity-50"}>Expert</span>
                  <span className={levelInfo.activeLevels.includes("Legend") ? "text-[#75f7e6] drop-shadow-sm" : "text-[#bbcac6] opacity-50"}>Legend</span>
                </div>
              </div>
            </header>

            {/* Menu Buttons Stack */}
            <main className="flex-1 flex flex-col justify-end px-6 pb-[100px] w-full gap-5 z-10">
              {/* Classic Mode (Primary Teal) */}
              <button 
                onClick={() => {
                  setSymbolsPerCard(8);
                  setGameState("playing-classic");
                  startSinglePlayer();
                }}
                className="btn-tactile group relative w-full bg-[#59decd] text-[#003732] border-b-[6px] border-[#006a61] rounded-2xl p-5 flex items-center justify-between shadow-[0_15px_35px_rgba(0,0,0,0.2)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-[#003732]/10 flex items-center justify-center backdrop-blur-sm">
                    <Play className="w-6 h-6 text-[#003732] fill-current" />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="font-bold text-lg uppercase tracking-tight font-Fredoka">Classic</span>
                    <span className="text-[10px] font-bold opacity-85 uppercase tracking-widest mt-0.5 font-Poppins">Play Solo</span>
                  </div>
                </div>
                <ChevronRight className="w-8 h-8 text-[#003732]/50 group-hover:translate-x-1 transition-transform relative z-10" />
              </button>

              {/* Same Screen Mode (Secondary Pink) */}
              <button 
                onClick={() => setGameState("setup-local")}
                className="btn-tactile group relative w-full bg-[#d95a82] text-white border-b-[6px] border-[#881644] rounded-2xl p-5 flex items-center justify-between shadow-[0_15px_35px_rgba(0,0,0,0.2)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="font-bold text-lg uppercase tracking-tight font-Fredoka">Versus</span>
                    <span className="text-[10px] font-bold opacity-85 uppercase tracking-widest mt-0.5 font-Poppins">Same Screen</span>
                  </div>
                </div>
                <ChevronRight className="w-8 h-8 text-white/50 group-hover:translate-x-1 transition-transform relative z-10" />
              </button>

              {/* Friends Mode (Glassmorphic) */}
              <button 
                onClick={() => {
                  setGameMode("host");
                  setGameState("lobby-friends");
                  initializeWebRTC("host");
                }}
                className="btn-tactile group relative w-full bg-[#1c1e32]/50 backdrop-blur-xl text-white border border-white/10 border-b-[6px] border-b-[#313349] rounded-2xl p-5 flex items-center justify-between shadow-[0_15px_35px_rgba(0,0,0,0.3)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-[#313349]/50 flex items-center justify-center border border-white/5">
                    <Users className="w-6 h-6 text-[#e3b5ff]" />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="font-bold text-lg uppercase tracking-tight text-[#e3b5ff] font-Fredoka">Friends</span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5 font-Poppins">Online Match</span>
                  </div>
                </div>
                <ChevronRight className="w-8 h-8 text-slate-400 group-hover:translate-x-1 transition-transform relative z-10" />
              </button>
            </main>

            {/* Bottom Tabs Nav Bar */}
            <div className="fixed bottom-0 w-full z-50 rounded-t-xl bg-[#313349] shadow-[0_-4px_10px_rgba(0,0,0,0.1)] flex justify-around items-center px-4 py-3 pb-safe max-w-md mx-auto">
              {/* Home */}
              <button 
                onClick={() => router.push("/")}
                className="flex flex-col items-center justify-center bg-[#34c2b2] text-[#004b43] rounded-xl px-5 py-2 active:scale-95 transition-all duration-150 ease-out min-w-[64px]"
              >
                <span className="text-xl">🏠</span>
                <span className="text-[10px] uppercase font-bold mt-1 font-Poppins">Home</span>
              </button>
              {/* Arena / Versus */}
              <button 
                onClick={() => {
                  setGameMode("client");
                  setGameState("lobby-friends");
                  initializeWebRTC("client");
                }}
                className="flex flex-col items-center justify-center text-[#bbcac6] hover:text-white rounded-xl px-5 py-2 active:scale-95 transition-all duration-150 ease-out min-w-[64px]"
              >
                <span className="text-xl">🌐</span>
                <span className="text-[10px] uppercase font-bold mt-1 font-Poppins">Arena</span>
              </button>
              {/* Collections */}
              <button className="flex flex-col items-center justify-center text-[#bbcac6] hover:text-white rounded-xl px-5 py-2 active:scale-95 transition-all duration-150 ease-out min-w-[64px]">
                <span className="text-xl">📚</span>
                <span className="text-[10px] uppercase font-bold mt-1 font-Poppins">Vault</span>
              </button>
              {/* Shop */}
              <button 
                onClick={() => setIsAdsOpen(true)}
                className="flex flex-col items-center justify-center text-[#bbcac6] hover:text-white rounded-xl px-5 py-2 active:scale-95 transition-all duration-150 ease-out min-w-[64px] relative"
              >
                <span className="text-xl">🛍️</span>
                <span className="text-[10px] uppercase font-bold mt-1 font-Poppins">Shop</span>
                <span className="absolute top-2 right-4 w-2 h-2 bg-[#ffb4ab] rounded-full border-2 border-[#313349]" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* LOCAL SHOWDOWN SETUP */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {gameState === "setup-local" && (
        <div className="w-full flex-1 flex flex-col bg-[#F9F7F3] max-w-md shadow-2xl overflow-y-auto">
          
          {/* Header */}
          <div className="bg-[#431C5D] text-white px-4 py-4 flex justify-between items-center rounded-b-[2rem] shadow-lg shrink-0">
            <button 
              onClick={() => setGameState("menu")}
              className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center active:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-lg font-Fredoka font-extrabold tracking-wider uppercase text-teal-300">
              Configuración de Duelo
            </h1>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Card 1: Game Mode */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-400 font-Poppins uppercase tracking-wider">Modo de Juego</span>
                <div className="flex items-center gap-6">
                  <span className="text-2xl font-Fredoka font-extrabold text-purple-900 uppercase">Clásico</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 text-center font-Nunito">
                  ¡SÉ EL PRIMERO EN ENCONTRAR LA PAREJA!
                </span>
              </div>

              {/* Card 2: Deck Options */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col items-center gap-3">
                <span className="text-xs font-bold text-slate-400 font-Poppins uppercase tracking-wider">Opciones de Mazo</span>
                <div className="flex items-center gap-8">
                  <button 
                    onClick={() => setSymbolsPerCard(6)}
                    className={`w-9 h-9 rounded-full font-bold flex items-center justify-center border-2 transition-all ${
                      symbolsPerCard === 6 ? 'bg-teal-400 text-white border-white scale-110 shadow-md' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    6
                  </button>
                  <span className="text-sm font-bold font-Fredoka text-purple-900">Símbolos x Carta</span>
                  <button 
                    onClick={() => setSymbolsPerCard(8)}
                    className={`w-9 h-9 rounded-full font-bold flex items-center justify-center border-2 transition-all ${
                      symbolsPerCard === 8 ? 'bg-teal-400 text-white border-white scale-110 shadow-md' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    8
                  </button>
                </div>
              </div>

              {/* Card 3: General settings */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 font-Poppins uppercase tracking-wider">Puntos para Ganar</span>
                  <div className="flex items-center gap-4">
                    {[3, 6, 10].map(pt => (
                      <button
                        key={pt}
                        onClick={() => setMatchesToWin(pt as 3|6|10)}
                        className={`px-4 py-2 rounded-xl font-bold font-Fredoka text-xs border-2 transition-all ${
                          matchesToWin === pt 
                            ? 'bg-teal-400 text-white border-white scale-105 shadow-md' 
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        {pt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 font-Poppins uppercase tracking-wider">Avatar Jugador 2</span>
                  <div className="flex justify-center items-center gap-3">
                    {avatarOptions.map(av => (
                      <button
                        key={av.id}
                        onClick={() => setPlayer2Avatar(av)}
                        className={`w-12 h-12 rounded-xl bg-slate-50 border-2 p-1.5 transition-all flex items-center justify-center ${
                          player2Avatar.id === av.id 
                            ? 'border-teal-400 scale-110 shadow-md bg-teal-50' 
                            : 'border-slate-200'
                        }`}
                      >
                        <img src={av.src} alt={av.name} className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={player2Name}
                    onChange={(e) => setPlayer2Name(e.target.value)}
                    className="w-full mt-2 py-2 px-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs font-bold text-purple-900 focus:outline-none focus:border-teal-400"
                    placeholder="Apodo Jugador 2"
                  />
                </div>
              </div>
            </div>

            {/* CTA action button */}
            <button
              onClick={startSameScreenGame}
              className="w-full py-4 bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 text-white font-Fredoka font-extrabold rounded-full text-lg tracking-wide shadow-xl border-b-4 border-emerald-600 active:translate-y-1 transition-all flex items-center justify-center shrink-0 mt-4"
            >
              <span>INICIAR DUELO</span>
            </button>

          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* CLASSIC GAMEPLAY */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {gameState === "playing-classic" && (
        <div className="w-full flex-1 flex flex-col bg-gradient-to-br from-[#1E112A] via-[#431C5D] to-[#209C95] max-w-md shadow-2xl py-6 px-4">
          
          {/* Top progress & pause bar */}
          <div className="w-full flex justify-between items-center gap-3 mb-6">
            <button 
              onClick={() => {
                setIsPaused(true);
              }}
              className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all text-white"
            >
              <Pause className="w-5 h-5" />
            </button>

            {/* Time progress bar */}
            <div className="flex-1 bg-black/30 rounded-full h-4 p-0.5 border border-white/10 overflow-hidden relative">
              <div 
                className="bg-gradient-to-r from-teal-400 to-[#FF75A0] h-full rounded-full transition-all duration-300"
                style={{ width: `${(classicTimeLeft / 60) * 100}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold uppercase text-white tracking-widest drop-shadow-md">
                Tiempo: {classicTimeLeft}s
              </span>
            </div>

            <div className="bg-white/10 px-4 py-2 rounded-xl text-teal-300 font-Fredoka font-bold text-sm shadow">
              Parejas: {score}
            </div>
          </div>

          <main className="flex-1 flex flex-col justify-center gap-8 items-center">
            {/* Common Card Center */}
            <div className="flex flex-col items-center w-full">
              <div className="text-[10px] text-teal-300 font-Fredoka font-bold uppercase tracking-widest mb-1.5">Carta del Centro</div>
              
              <div 
                className="w-72 h-72 sm:w-84 sm:h-84 bg-[#FF75A0] p-[3.5px] relative shadow-2xl flex items-center justify-center animate-pop"
                style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}
              >
                <div 
                  className="w-full h-full bg-white relative flex items-center justify-center"
                  style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}
                >
                  <div className="absolute inset-[3%] w-[94%] h-[94%]">
                    {commonCard.map((symbolId, index) => {
                      const slot = commonCardSlots[index];
                      if (!slot) return null;
                      
                      const isMatchingCorrect = correctMatchSymbolId === symbolId;

                      return (
                        <div
                          key={`common-${symbolId}`}
                          className={`absolute flex items-center justify-center transition-all ${
                            isMatchingCorrect ? "animate-scale-pulse" : ""
                          }`}
                           style={{
                            left: `${slot.x}%`,
                            top: `${slot.y}%`,
                            width: "27%",
                            height: "27%",
                            marginLeft: "-13.5%",
                            marginTop: "-13.5%",
                            transform: `scale(${slot.scale}) rotate(${slot.rot}deg)`,
                            transformOrigin: "center center",
                            filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.15))"
                          }}
                        >
                          <img 
                            src={symbolsAssets[symbolId]} 
                            alt="symbol" 
                            className="w-full h-full object-contain pointer-events-none" 
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Bounce arrow */}
            <div className="h-4 text-white/30 shrink-0">
              <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 13l-7 7-7-7m7 7V3"></path>
              </svg>
            </div>

            {/* Player Card */}
            <div className="flex flex-col items-center w-full">
              <div
                id="playerCardContainer"
                className={`w-76 h-76 sm:w-90 sm:h-90 bg-[#FF75A0] p-[3.5px] relative shadow-2xl flex items-center justify-center animate-pop ${
                  isShaking ? "animate-card-shake" : ""
                }`}
                style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}
              >
                <div 
                  className="w-full h-full bg-white relative flex items-center justify-center"
                  style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}
                >
                  <div className="absolute inset-[3%] w-[94%] h-[94%]">
                    {playerCard.map((symbolId, index) => {
                      const slot = playerCardSlots[index];
                      if (!slot) return null;
                      
                      const isMatchingCorrect = correctMatchSymbolId === symbolId;

                      return (
                        <button
                          key={`player-${symbolId}`}
                          onClick={(e) => handleClassicTap(e, symbolId)}
                          onTouchStart={(e) => handleClassicTap(e, symbolId)}
                          className={`absolute flex items-center justify-center active:scale-95 transition-all outline-none cursor-pointer ${
                            isMatchingCorrect ? "animate-scale-pulse" : ""
                          }`}
                           style={{
                            left: `${slot.x}%`,
                            top: `${slot.y}%`,
                            width: "27%",
                            height: "27%",
                            marginLeft: "-13.5%",
                            marginTop: "-13.5%",
                            transform: `scale(${slot.scale}) rotate(${slot.rot}deg)`,
                            transformOrigin: "center center",
                            filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.15))"
                          }}
                        >
                          <img 
                            src={symbolsAssets[symbolId]} 
                            alt="symbol" 
                            className="w-full h-full object-contain pointer-events-none" 
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-pink-200 font-Fredoka font-bold uppercase tracking-widest mt-2">Tu Carta (Toca la Pareja con el Centro)</div>
            </div>
          </main>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* SAME SCREEN LOCAL GAMEPLAY */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {gameState === "playing-samescreen" && (
        <div className="w-full flex-1 flex flex-col bg-[#1E112A] max-w-md shadow-2xl overflow-hidden relative">
          
          {/* Horizontal Split Line */}
          <div className="absolute left-0 right-0 h-1 bg-[#FF75A0]/50 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold cursor-pointer active:scale-90" onClick={() => setGameState("menu")}>
              ✖
            </div>
          </div>

          {/* PLAYER 2 SIDE (TOP, ROTATED 180 DEG) */}
          <div className="flex-1 flex flex-col justify-center items-center p-4 relative rotate-180 bg-[#2b104c]/40">
            {/* Score & Avatar info */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-400 rounded-lg p-1">
                  <img src={player2Avatar.src} alt="p2" className="w-full h-full object-contain" />
                </div>
                <span className="text-white text-xs font-bold font-Fredoka">{player2Name}</span>
              </div>
              <div className="bg-teal-400 px-4 py-1.5 rounded-full text-white text-xs font-Fredoka font-bold">
                Puntos: {player2Score} / {matchesToWin}
              </div>
            </div>

            {/* Player 2 Card */}
            <div
              id="player2CardContainer"
              className={`w-64 h-64 sm:w-76 sm:h-76 bg-[#FF75A0] p-[3px] relative shadow-2xl flex items-center justify-center animate-pop ${
                isShakingP2 ? "animate-card-shake" : ""
              }`}
              style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}
            >
              <div 
                className="w-full h-full bg-white relative flex items-center justify-center"
                style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}
              >
                <div className="absolute inset-[3%] w-[94%] h-[94%]">
                  {player2Card.map((symbolId, index) => {
                    const slot = player2CardSlots[index];
                    if (!slot) return null;
                    
                    const isMatchingCorrect = correctMatchSymbolId === symbolId;

                    return (
                      <button
                        key={`player2-${symbolId}`}
                        onClick={(e) => handleLocalSameScreenTap(e, symbolId, 2)}
                        onTouchStart={(e) => handleLocalSameScreenTap(e, symbolId, 2)}
                        className={`absolute flex items-center justify-center active:scale-95 transition-all outline-none cursor-pointer ${
                          isMatchingCorrect ? "animate-scale-pulse" : ""
                        }`}
                        style={{
                          left: `${slot.x}%`,
                          top: `${slot.y}%`,
                          width: "27%",
                          height: "27%",
                          marginLeft: "-13.5%",
                          marginTop: "-13.5%",
                          transform: `scale(${slot.scale}) rotate(${slot.rot}deg)`,
                          transformOrigin: "center center",
                          filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.15))"
                        }}
                      >
                        <img 
                          src={symbolsAssets[symbolId]} 
                          alt="symbol" 
                          className="w-full h-full object-contain pointer-events-none" 
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* PLAYER 1 SIDE (BOTTOM) */}
          <div className="flex-1 flex flex-col justify-center items-center p-4 relative bg-[#1e0a35]/60">
            {/* Score & Avatar info */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500 rounded-lg p-1">
                  <img src={player1Avatar.src} alt="p1" className="w-full h-full object-contain" />
                </div>
                <span className="text-white text-xs font-bold font-Fredoka">{username}</span>
              </div>
              <div className="bg-purple-500 px-4 py-1.5 rounded-full text-white text-xs font-Fredoka font-bold">
                Puntos: {score} / {matchesToWin}
              </div>
            </div>

            {/* Player 1 Card */}
            <div
              id="player1CardContainer"
              className={`w-64 h-64 sm:w-76 sm:h-76 bg-[#FF75A0] p-[3px] relative shadow-2xl flex items-center justify-center animate-pop ${
                isShaking ? "animate-card-shake" : ""
              }`}
              style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}
            >
              <div 
                className="w-full h-full bg-white relative flex items-center justify-center"
                style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}
              >
                <div className="absolute inset-[3%] w-[94%] h-[94%]">
                  {playerCard.map((symbolId, index) => {
                    const slot = playerCardSlots[index];
                    if (!slot) return null;
                    
                    const isMatchingCorrect = correctMatchSymbolId === symbolId;

                    return (
                      <button
                        key={`player1-${symbolId}`}
                        onClick={(e) => handleLocalSameScreenTap(e, symbolId, 1)}
                        onTouchStart={(e) => handleLocalSameScreenTap(e, symbolId, 1)}
                        className={`absolute flex items-center justify-center active:scale-95 transition-all outline-none cursor-pointer ${
                          isMatchingCorrect ? "animate-scale-pulse" : ""
                        }`}
                        style={{
                          left: `${slot.x}%`,
                          top: `${slot.y}%`,
                          width: "27%",
                          height: "27%",
                          marginLeft: "-13.5%",
                          marginTop: "-13.5%",
                          transform: `scale(${slot.scale}) rotate(${slot.rot}deg)`,
                          transformOrigin: "center center",
                          filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.15))"
                        }}
                      >
                        <img 
                          src={symbolsAssets[symbolId]} 
                          alt="symbol" 
                          className="w-full h-full object-contain pointer-events-none" 
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* SAME SCREEN LOCAL VICTORY */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {gameState === "gameover-samescreen" && (
        <div className="w-full flex-1 flex flex-col bg-[#1E112A] max-w-md shadow-2xl overflow-hidden relative">
          
          <div className="absolute left-0 right-0 h-1 bg-[#FF75A0]/50 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold cursor-pointer active:scale-90" onClick={() => setGameState("menu")}>
              ✖
            </div>
          </div>

          {/* PLAYER 2 VICTORY (TOP, FLIPPED) */}
          <div className="flex-1 flex flex-col justify-center items-center p-6 rotate-180 bg-[#2b104c]/40 text-white space-y-4">
            <h2 className="text-3xl font-Fredoka font-black tracking-wide text-teal-300 uppercase animate-bounce">
              {player2Score >= matchesToWin ? "GANADOR!" : "SEGUNDO!"}
            </h2>
            <div className="w-24 h-24 bg-white/10 rounded-3xl border-4 border-teal-300 p-3 shadow-2xl relative flex items-center justify-center">
              <img src={player2Avatar.src} alt="p2 avatar" className="w-full h-full object-contain" />
              {player2Score >= matchesToWin && (
                <span className="absolute -top-6 text-3xl">👑</span>
              )}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-teal-200 font-bold uppercase tracking-widest font-Poppins">Ronda Play</span>
              <span className="text-xl font-bold font-Fredoka">{player2Name}</span>
              <span className="text-xs text-white/60 font-semibold font-Nunito mt-1">Total Victorias: {player2Score >= matchesToWin ? 1 : 0}</span>
            </div>
            <button
              onClick={startSameScreenGame}
              className="py-3 px-8 bg-gradient-to-r from-teal-400 to-emerald-500 text-white font-Fredoka font-extrabold text-sm rounded-full shadow-lg border-b-4 border-emerald-600 active:translate-y-1 transition-all"
            >
              JUGAR OTRA VEZ
            </button>
          </div>

          {/* PLAYER 1 VICTORY (BOTTOM) */}
          <div className="flex-1 flex flex-col justify-center items-center p-6 bg-[#1e0a35]/60 text-white space-y-4">
            <h2 className="text-3xl font-Fredoka font-black tracking-wide text-[#FF75A0] uppercase animate-bounce">
              {score >= matchesToWin ? "GANADOR!" : "SEGUNDO!"}
            </h2>
            <div className="w-24 h-24 bg-white/10 rounded-3xl border-4 border-[#FF75A0] p-3 shadow-2xl relative flex items-center justify-center">
              <img src={player1Avatar.src} alt="p1 avatar" className="w-full h-full object-contain" />
              {score >= matchesToWin && (
                <span className="absolute -top-6 text-3xl">👑</span>
              )}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-pink-300 font-bold uppercase tracking-widest font-Poppins">Ronda Play</span>
              <span className="text-xl font-bold font-Fredoka">{username}</span>
              <span className="text-xs text-white/60 font-semibold font-Nunito mt-1">Total Victorias: {score >= matchesToWin ? 1 : 0}</span>
            </div>
            <button
              onClick={startSameScreenGame}
              className="py-3 px-8 bg-gradient-to-r from-teal-400 to-emerald-500 text-white font-Fredoka font-extrabold text-sm rounded-full shadow-lg border-b-4 border-emerald-600 active:translate-y-1 transition-all"
            >
              JUGAR OTRA VEZ
            </button>
          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* ONLINE FRIENDS LOBBY */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {gameState === "lobby-friends" && (
        <div className="w-full flex-1 flex flex-col bg-[#F9F7F3] max-w-md shadow-2xl overflow-y-auto">
          
          {/* Header */}
          <div className="bg-[#431C5D] text-white px-4 py-4 flex justify-between items-center rounded-b-[2rem] shadow-lg shrink-0">
            <button 
              onClick={() => setGameState("menu")}
              className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-lg font-Fredoka font-extrabold tracking-wider uppercase text-teal-300">
              {gameMode === "host" ? "Crear Arena" : "Unirse a Arena"}
            </h1>
            <div className="w-10 h-10" />
          </div>

          <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-6">
              
              {connectionStatus === "generating" && (
                <div className="flex flex-col items-center space-y-3 py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
                  <span className="text-sm font-semibold text-slate-400">Estableciendo canal WebRTC...</span>
                </div>
              )}

              {gameMode === "host" && connectionStatus === "scanning" && qrCodeUrl && (
                <div className="w-full flex flex-col items-center text-center space-y-4">
                  <span className="text-sm font-bold text-purple-900 leading-relaxed font-Fredoka">
                    Paso 1: Pide a tu amigo que escanee este código QR:
                  </span>
                  <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100">
                    <img src={qrCodeUrl} alt="Host Connection QR" className="w-52 h-52 object-contain" />
                  </div>
                  <button
                    onClick={startCameraScanner}
                    className="w-full py-3.5 bg-teal-400 hover:bg-teal-500 text-white font-Fredoka font-extrabold rounded-full shadow-lg border-b-4 border-teal-600 active:translate-y-1 transition-all"
                  >
                    Paso 2: Escanear Código QR de Invitado
                  </button>
                </div>
              )}

              {gameMode === "client" && connectionStatus === "generating" && (
                <div className="w-full flex flex-col items-center text-center space-y-4">
                  <button
                    onClick={startCameraScanner}
                    className="w-full py-4 bg-gradient-to-r from-teal-400 to-emerald-500 text-white font-Fredoka font-extrabold rounded-full shadow-xl border-b-4 border-emerald-600 active:translate-y-1 transition-all text-lg"
                  >
                    📸 Escanear QR del Host
                  </button>
                </div>
              )}

              {gameMode === "client" && connectionStatus === "generating" && sdpToken && (
                <div className="w-full flex flex-col items-center text-center space-y-4">
                  <span className="text-sm font-bold text-purple-900 font-Fredoka">
                    Paso 2: Muestra este código QR al Host:
                  </span>
                  {qrCodeUrl ? (
                    <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100">
                      <img src={qrCodeUrl} alt="Client Connection QR" className="w-52 h-52 object-contain" />
                    </div>
                  ) : (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
                  )}
                </div>
              )}

              {showCamera && (
                <div className="w-full flex flex-col items-center space-y-3">
                  <div id="reader" className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner"></div>
                  <button
                    onClick={stopCameraScanner}
                    className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs font-Fredoka font-bold uppercase tracking-wider"
                  >
                    Cancelar Escaneo
                  </button>
                </div>
              )}

              {errorText && (
                <div className="w-full p-3 bg-red-100 border border-red-200 rounded-xl text-xs text-red-700 text-center font-semibold">
                  {errorText}
                </div>
              )}

              {/* Text links backup */}
              <div className="border-t border-slate-200 pt-5 space-y-3 flex flex-col items-center">
                <span className="text-xs text-slate-400 font-bold font-Poppins uppercase">¿Problemas con la cámara?</span>
                <input
                  type="text"
                  placeholder="Pega el token de tu oponente aquí"
                  value={inputSdpToken}
                  onChange={(e) => setInputSdpToken(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 font-bold focus:outline-none focus:border-teal-400 text-center"
                />
                <button
                  onClick={() => handleRemoteSDP(inputSdpToken)}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-Fredoka font-bold uppercase tracking-wider shadow"
                >
                  Conectar Manualmente
                </button>
                
                {sdpToken && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(sdpToken);
                      alert("¡Tu token se copió al portapapeles!");
                    }}
                    className="text-xs text-teal-600 hover:text-teal-700 underline font-bold"
                  >
                    Copiar Mi Token
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                stopCameraScanner();
                peerConnectionRef.current?.close();
                setGameState("menu");
              }}
              className="px-6 py-2.5 text-slate-400 hover:text-slate-600 text-sm font-semibold"
            >
              Volver al Menú
            </button>
          </div>
        </div>
      )}

      {/* ONLINE FRIENDS GAMEPLAY */}
      {gameState === "playing-friends" && (
        <div className="w-full flex-1 flex flex-col bg-gradient-to-br from-[#1E112A] via-[#431C5D] to-[#209C95] max-w-md shadow-2xl py-6 px-4">
          
          <div className="w-full flex justify-between items-center gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg p-1 border-2 border-white shadow">
                <img src={player1Avatar.src} alt="me" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-teal-300 font-bold uppercase">Tú</span>
                <span className="text-sm font-bold text-white font-Fredoka">{score} Puntos</span>
              </div>
            </div>

            <div className="text-white/40 font-Fredoka font-extrabold text-lg">VS</div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-pink-300 font-bold uppercase">Rival</span>
                <span className="text-sm font-bold text-white font-Fredoka">{opponentScore} Puntos</span>
              </div>
              <div className="w-10 h-10 bg-teal-400 rounded-lg p-1 border-2 border-white shadow">
                <img src={player2Avatar.src} alt="opponent" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          <main className="flex-1 flex flex-col justify-center gap-6 items-center">
            {/* Common Card Center */}
            <div className="flex flex-col items-center w-full">
              <div className="text-[10px] text-teal-300 font-Fredoka font-bold uppercase tracking-widest mb-1">Carta Central</div>
              
              <div 
                className="w-64 h-64 sm:w-76 sm:h-76 bg-[#FF75A0] p-[3px] relative shadow-2xl flex items-center justify-center animate-pop"
                style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}
              >
                <div 
                  className="w-full h-full bg-white relative flex items-center justify-center"
                  style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}
                >
                  <div className="absolute inset-[3%] w-[94%] h-[94%]">
                    {commonCard.map((symbolId, index) => {
                      const slot = commonCardSlots[index];
                      if (!slot) return null;
                      
                      const isMatchingCorrect = correctMatchSymbolId === symbolId;

                      return (
                        <div
                          key={`common-${symbolId}`}
                          className={`absolute flex items-center justify-center transition-all ${
                            isMatchingCorrect ? "animate-scale-pulse" : ""
                          }`}
                          style={{
                            left: `${slot.x}%`,
                            top: `${slot.y}%`,
                            width: "27%",
                            height: "27%",
                            marginLeft: "-13.5%",
                            marginTop: "-13.5%",
                            transform: `scale(${slot.scale}) rotate(${slot.rot}deg)`,
                            transformOrigin: "center center",
                            filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.15))"
                          }}
                        >
                          <img 
                            src={symbolsAssets[symbolId]} 
                            alt="symbol" 
                            className="w-full h-full object-contain pointer-events-none" 
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="h-4 text-white/30 shrink-0">
              <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 13l-7 7-7-7m7 7V3"></path>
              </svg>
            </div>

            {/* Local Player Card */}
            <div className="flex flex-col items-center w-full">
              <div
                id="playerCardContainer"
                className={`w-72 h-72 sm:w-84 sm:h-84 bg-[#FF75A0] p-[3px] relative shadow-2xl flex items-center justify-center animate-pop ${
                  isShaking ? "animate-card-shake" : ""
                }`}
                style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}
              >
                <div 
                  className="w-full h-full bg-white relative flex items-center justify-center"
                  style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}
                >
                  <div className="absolute inset-[3%] w-[94%] h-[94%]">
                    {playerCard.map((symbolId, index) => {
                      const slot = playerCardSlots[index];
                      if (!slot) return null;
                      
                      const isMatchingCorrect = correctMatchSymbolId === symbolId;

                      return (
                        <button
                          key={`player-${symbolId}`}
                          onClick={(e) => handleFriendsTap(e, symbolId)}
                          onTouchStart={(e) => handleFriendsTap(e, symbolId)}
                          className={`absolute flex items-center justify-center active:scale-95 transition-all outline-none cursor-pointer ${
                            isMatchingCorrect ? "animate-scale-pulse" : ""
                          }`}
                          style={{
                            left: `${slot.x}%`,
                            top: `${slot.y}%`,
                            width: "27%",
                            height: "27%",
                            marginLeft: "-13.5%",
                            marginTop: "-13.5%",
                            transform: `scale(${slot.scale}) rotate(${slot.rot}deg)`,
                            transformOrigin: "center center",
                            filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.15))"
                          }}
                        >
                          <img 
                            src={symbolsAssets[symbolId]} 
                            alt="symbol" 
                            className="w-full h-full object-contain pointer-events-none" 
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </main>
          
          <button 
            onClick={() => {
              peerConnectionRef.current?.close();
              setGameState("menu");
            }}
            className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 text-xs font-bold uppercase tracking-wider transition-all"
          >
            Salir de la Arena
          </button>
        </div>
      )}

      {/* ONLINE FRIENDS GAMEOVER */}
      {gameState === "gameover-friends" && (
        <div className="w-full flex-1 flex flex-col bg-[#F9F7F3] max-w-md shadow-2xl justify-center items-center p-6 space-y-6">
          <div className="text-6xl animate-bounce">
            {score > opponentScore ? "🏆" : score < opponentScore ? "🥈" : "🤝"}
          </div>
          
          <h2 className="text-3xl font-Fredoka font-black text-purple-900 uppercase">
            {score > opponentScore ? "¡VICTORIA!" : score < opponentScore ? "¡BUEN JUEGO!" : "¡EMPATE!"}
          </h2>

          <div className="w-full bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
            <span className="text-xs font-bold text-slate-400 font-Poppins uppercase tracking-wider">Marcador Final</span>
            
            <div className="flex justify-around items-center w-full">
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase text-teal-600 font-bold font-Poppins">Tú</span>
                <span className="text-4xl font-extrabold text-[#34C2B2] font-Fredoka">{score}</span>
              </div>
              
              <div className="text-slate-300 text-xl font-bold">VS</div>
              
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase text-pink-500 font-bold font-Poppins">Rival</span>
                <span className="text-4xl font-extrabold text-[#FF75A0] font-Fredoka">{opponentScore}</span>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col space-y-3">
            <button
              onClick={() => {
                if (gameMode === "host") {
                  startMultiplayerGame();
                } else {
                  dataChannelRef.current?.send(JSON.stringify({ type: "RESTART_REQUEST" }));
                }
              }}
              className="w-full py-4 bg-[#34C2B2] text-white font-Fredoka font-extrabold rounded-full text-lg tracking-wide shadow-xl border-b-4 border-teal-700 active:translate-y-1 transition-all"
            >
              🔄 JUGAR OTRA VEZ
            </button>

            <button
              onClick={() => {
                peerConnectionRef.current?.close();
                setGameState("menu");
              }}
              className="w-full py-4 bg-white border border-slate-200 text-slate-500 font-Fredoka font-extrabold rounded-full text-lg tracking-wide shadow-sm"
            >
              🏠 VOLVER AL MENÚ
            </button>
          </div>
        </div>
      )}

      {/* CLASSIC GAMEOVER */}
      {gameState === "gameover-classic" && (
        <div className="w-full flex-1 flex flex-col bg-[#F9F7F3] max-w-md shadow-2xl justify-center items-center p-6 space-y-6">
          <div className="text-6xl animate-bounce">⭐</div>
          
          <h2 className="text-3xl font-Fredoka font-black text-purple-900 uppercase">
            ¡Práctica Completada!
          </h2>

          <div className="w-full bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col items-center gap-3">
            <span className="text-xs font-bold text-slate-400 font-Poppins uppercase tracking-wider">Tu Puntuación</span>
            <span className="text-5xl font-extrabold text-teal-500 font-Fredoka">{score}</span>
            <span className="text-xs text-slate-400 font-bold uppercase">Parejas Encontradas</span>
            
            <div className="flex gap-2 items-center text-xs font-bold text-yellow-600 bg-yellow-50 px-4 py-1.5 rounded-full border border-yellow-100">
              <span>⭐ Recompensa: +{score * 10} Puntos</span>
            </div>
          </div>

          <div className="w-full flex flex-col space-y-3">
            <button
              onClick={startSinglePlayer}
              className="w-full py-4 bg-[#34C2B2] text-white font-Fredoka font-extrabold rounded-full text-lg tracking-wide shadow-xl border-b-4 border-teal-700 active:translate-y-1 transition-all flex flex-col items-center justify-center"
            >
              <span>🔄 REPETIR PRÁCTICA</span>
            </button>

            <button
              onClick={() => setGameState("menu")}
              className="w-full py-4 bg-white border border-slate-200 text-slate-500 font-Fredoka font-extrabold rounded-full text-lg tracking-wide shadow-sm"
            >
              🏠 VOLVER AL MENÚ
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 2. OVERLAYS & MODALS */}
      {/* ───────────────────────────────────────────────────────────────── */}

      {/* SETTINGS OVERLAY */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-6 space-y-6 shadow-2xl relative animate-pop text-left">
            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"
            >
              ✖
            </button>

            <h3 className="text-xl font-Fredoka font-extrabold text-purple-900 uppercase">
              Ajustes RondaPlay
            </h3>

            {/* Sounds buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`py-3 rounded-2xl flex flex-col items-center gap-1.5 border-2 transition-all font-bold text-xs ${
                  soundEnabled ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-400'
                }`}
              >
                <span>🔊</span>
                <span>Efectos</span>
              </button>

              <button
                onClick={() => setMusicEnabled(!musicEnabled)}
                className={`py-3 rounded-2xl flex flex-col items-center gap-1.5 border-2 transition-all font-bold text-xs ${
                  musicEnabled ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-400'
                }`}
              >
                <span>🎵</span>
                <span>Música</span>
              </button>

              <button
                onClick={() => setVibeEnabled(!vibeEnabled)}
                className={`py-3 rounded-2xl flex flex-col items-center gap-1.5 border-2 transition-all font-bold text-xs ${
                  vibeEnabled ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-400'
                }`}
              >
                <span>📳</span>
                <span>Vibración</span>
              </button>
            </div>

            {/* Notifications switch */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs font-bold text-slate-600 font-Poppins uppercase">Notificaciones Push</span>
              <button
                onClick={() => setPushNotifications(!pushNotifications)}
                className={`w-12 h-6 rounded-full p-0.5 transition-all ${
                  pushNotifications ? 'bg-teal-400' : 'bg-slate-200'
                }`}
              >
                <div 
                  className={`w-5 h-5 rounded-full bg-white transition-all transform ${
                    pushNotifications ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Edit username */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-Poppins">Mi Apodo</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-purple-900 focus:outline-none focus:border-teal-400"
              />
            </div>

            {/* Account Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button 
                onClick={() => alert("Tu posición actual en RondaPlay es #14. ¡Sigue ganando puntos!")}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold font-Poppins uppercase transition-colors"
              >
                Ver Clasificación
              </button>
              <button 
                onClick={() => alert("Reglas: Encuentra el símbolo coincidente entre tu carta y la del centro (o la de tu oponente) lo más rápido que puedas.")}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold font-Poppins uppercase transition-colors"
              >
                Ayuda & Reglas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADS & MONETIZATION OVERLAY */}
      {isAdsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-5 shadow-2xl relative text-center text-slate-800">
            <button 
              onClick={() => setIsAdsOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"
            >
              ✖
            </button>

            <div className="text-5xl">🛍️</div>
            
            <h3 className="text-xl font-Fredoka font-extrabold text-purple-900 uppercase">
              ¡Quitar Anuncios!
            </h3>
            
            <p className="text-xs text-slate-500 leading-relaxed font-Nunito px-2">
              Disfruta de partidas ilimitadas sin interrupciones. Los anuncios de recompensas seguirán disponibles para bonificaciones opcionales.
            </p>

            <button
              onClick={() => {
                alert("¡Gracias por comprar la versión sin anuncios!");
                setIsAdsOpen(false);
              }}
              className="w-full py-3.5 bg-[#FF75A0] hover:bg-[#D95A82] text-white font-Fredoka font-extrabold rounded-full text-sm shadow-lg tracking-wide transition-all"
            >
              ADQUIRIR POR $1.99
            </button>

            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              Compra de pago único
            </span>
          </div>
        </div>
      )}

      {/* CLASSIC PAUSE MODAL */}
      {isPaused && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xs p-6 space-y-4 shadow-2xl text-center">
            <h3 className="text-xl font-Fredoka font-extrabold text-purple-900 uppercase">
              Juego Pausado
            </h3>
            <button
              onClick={() => setIsPaused(false)}
              className="w-full py-3 bg-[#34C2B2] text-white font-Fredoka font-extrabold rounded-full text-sm shadow-md"
            >
              CONTINUAR
            </button>
            <button
              onClick={() => {
                setIsPaused(false);
                setGameState("menu");
              }}
              className="w-full py-3 bg-white border border-slate-200 text-slate-500 font-Fredoka font-extrabold rounded-full text-sm"
            >
              SALIR AL MENÚ
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
