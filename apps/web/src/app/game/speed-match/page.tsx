"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import type { Html5Qrcode } from "html5-qrcode";

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
    const radius = 26 + (Math.random() * 6 - 3); // 23% to 32% to remain safe inside borders
    slots.push({
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle),
      scale: 0.5 + Math.random() * 0.4, // 50% to 90%
      rot: Math.random() * 90 - 45      // -45 to +45 deg
    });
  }
  return slots;
}

// Finite projective plane deck generator (n=7 produces 8 symbols per card)
// Generates 57 cards sharing exactly 1 symbol with any other card
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
  id: number;
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
    
  for (let i = 0; i < numParticles; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = type === 'star'
      ? 30 + Math.random() * 50
      : 15 + Math.random() * 20;
    newParticles.push({
      id: Date.now() + Math.random(),
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
  const [gameState, setGameState] = useState<"menu" | "lobby" | "playing" | "gameover">("menu");
  const [gameMode, setGameMode] = useState<"single" | "host" | "client">("single");
  const [score, setScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  
  // Cards state
  const [commonCard, setCommonCard] = useState<number[]>([]);
  const [playerCard, setPlayerCard] = useState<number[]>([]);
  const [commonCardSlots, setCommonCardSlots] = useState<LayoutSlot[]>([]);
  const [playerCardSlots, setPlayerCardSlots] = useState<LayoutSlot[]>([]);
  
  // Track symbol ID currently being pulsed on correct match
  const [correctMatchSymbolId, setCorrectMatchSymbolId] = useState<number | null>(null);

  // WebRTC & connection states
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "generating" | "scanning" | "connecting" | "connected">("disconnected");
  const [sdpToken, setSdpToken] = useState("");
  const [inputSdpToken, setInputSdpToken] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [errorText, setErrorText] = useState("");
  
  // Game ref states
  const deckRef = useRef<number[][]>([]);
  const availableCardsRef = useRef<number[][]>([]);
  
  // WebRTC refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);

  // Audio Context for sound synthesis (no asset files required)
  const playSound = (type: "correct" | "error" | "win") => {
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
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.warn("Audio Context not allowed by browser autoplay policy");
    }
  };

  // Particles generator
  const [particles, setParticles] = useState<Particle[]>([]);
  const createParticles = (x: number, y: number, type: 'star' | 'cross') => {
    const newParticles = generateParticles(x, y, type);
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.slice(newParticles.length));
    }, 600);
  };

  // Shake state
  const [isShaking, setIsShaking] = useState(false);
  const triggerShake = (clientX?: number, clientY?: number) => {
    setIsShaking(true);
    playSound("error");
    if (clientX !== undefined && clientY !== undefined) {
      createParticles(clientX, clientY, 'cross');
    }
    if (navigator.vibrate) navigator.vibrate(80);
    setTimeout(() => setIsShaking(false), 400);
  };

  // 1. Initial WebRTC Connection Setup (Signaling via QR Codes)
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

    // Wait for ICE Gathering to complete (Vanilla ICE) before exporting the SDP
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

    // Client Answer flow
    if (mode === "client") {
      pc.ondatachannel = (e) => {
        setupDataChannel(e.channel);
      };
    }
  };

  // Process the scanned Remote SDP
  const handleRemoteSDP = async (encodedToken: string) => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) return;

      const decoded = JSON.parse(atob(encodedToken));
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
      setErrorText("Invalid connection token or QR code.");
    }
  };

  // Setup the RTCDataChannel listeners
  const setupDataChannel = (channel: RTCDataChannel) => {
    dataChannelRef.current = channel;
    
    channel.onopen = () => {
      setConnectionStatus("connected");
      setGameState("playing");
      playSound("win");
      if (gameMode === "host") {
        startMultiplayerGame();
      }
    };

    channel.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "STATE_UPDATE") {
        // Synchronized cards & slots from Host
        setCommonCard(msg.commonCard);
        setCommonCardSlots(msg.commonCardSlots);
        
        // Client receives cards mapped specifically for them
        const myCard = gameMode === "host" ? msg.hostCard : msg.clientCard;
        const mySlots = gameMode === "host" ? msg.hostCardSlots : msg.clientCardSlots;
        setPlayerCard(myCard);
        setPlayerCardSlots(mySlots);
        
        setScore(msg.scores[gameMode]);
        setOpponentScore(msg.scores[gameMode === "host" ? "client" : "host"]);
        
        // Ensure state is updated to playing (e.g. on game restart)
        setGameState("playing");
      } else if (msg.type === "OPPONENT_FEEDBACK") {
        if (msg.result === "correct") {
          setCorrectMatchSymbolId(msg.symbolId);
          playSound("correct");
          setTimeout(() => setCorrectMatchSymbolId(null), 500);
        } else {
          // Wrong selection by opponent (or local guest tap)
          triggerShake();
        }
      } else if (msg.type === "TAP" && gameMode === "host") {
        // Host validates client tap request
        validateMultiplayerTap(msg.symbolId, "client");
      } else if (msg.type === "GAME_OVER") {
        const myScore = gameMode === "host" ? msg.scores.host : msg.scores.client;
        const oppScore = gameMode === "host" ? msg.scores.client : msg.scores.host;
        setScore(myScore);
        setOpponentScore(oppScore);
        setGameState("gameover");
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

  // Dynamic Camera Scanner initialization (uses html5-qrcode)
  const startCameraScanner = async () => {
    setShowCamera(true);
    setErrorText("");
    
    // Dynamically load scanner to prevent SSR compile errors
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

  // 2. Gameplay Loop Handlers
  const startSinglePlayer = () => {
    setGameMode("single");
    deckRef.current = generateDobbleDeck(7);
    availableCardsRef.current = shuffle([...deckRef.current]);

    const firstCommon = availableCardsRef.current.pop()!;
    const firstPlayer = availableCardsRef.current.pop()!;
    
    setCommonCard(firstCommon);
    setPlayerCard(firstPlayer);
    setCommonCardSlots(generateCardSlots(8));
    setPlayerCardSlots(generateCardSlots(8));
    
    setScore(0);
    setGameState("playing");
  };

  const startMultiplayerGame = () => {
    deckRef.current = generateDobbleDeck(7);
    availableCardsRef.current = shuffle([...deckRef.current]);

    const firstCommon = availableCardsRef.current.pop()!;
    const hostCard = availableCardsRef.current.pop()!;
    const clientCard = availableCardsRef.current.pop()!;

    setScore(0);
    setOpponentScore(0);
    
    broadcastMultiplayerState(firstCommon, hostCard, clientCard, { host: 0, client: 0 });
  };

  const broadcastMultiplayerState = (common: number[], host: number[], client: number[], scores: { host: number; client: number }) => {
    const commonSlots = generateCardSlots(8);
    const hostSlots = generateCardSlots(8);
    const clientSlots = generateCardSlots(8);

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

  // Validate Tap interaction
  const handleSymbolTap = (event: React.MouseEvent | React.TouchEvent, symbolId: number) => {
    event.preventDefault();
    if (correctMatchSymbolId !== null) return; // Prevent double taps during animations
    
    // Fetch screen tap coordinates for particles
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    if (gameMode === "single") {
      if (commonCard.includes(symbolId)) {
        setCorrectMatchSymbolId(symbolId);
        createParticles(clientX, clientY, 'star');
        playSound("correct");
        
        const nextScore = score + 1;
        setScore(nextScore);

        setTimeout(() => {
          setCorrectMatchSymbolId(null);
          
          if (nextScore >= 10) {
            setGameState("gameover");
            playSound("win");
            return;
          }

          // Next round: player card becomes the new common card
          const nextCommon = [...playerCard];
          
          // Draw new player card
          if (availableCardsRef.current.length === 0) {
            availableCardsRef.current = shuffle([...deckRef.current]).filter(
              card => JSON.stringify(card) !== JSON.stringify(nextCommon)
            );
          }
          
          const nextPlayer = availableCardsRef.current.pop()!;
          
          setCommonCard(nextCommon);
          setPlayerCard(nextPlayer);
          setCommonCardSlots(generateCardSlots(8));
          setPlayerCardSlots(generateCardSlots(8));
        }, 500);
      } else {
        triggerShake(clientX, clientY);
      }
    } else if (gameMode === "client") {
      // Client sends tap request to Host
      if (dataChannelRef.current?.readyState === "open") {
        dataChannelRef.current.send(JSON.stringify({
          type: "TAP",
          symbolId
        }));
      }
    } else if (gameMode === "host") {
      // Host validates local tap
      validateMultiplayerTap(symbolId, "host");
    }
  };

  // Host validation for multiplayer rounds
  const validateMultiplayerTap = (symbolId: number, player: "host" | "client") => {
    if (correctMatchSymbolId !== null) return; // Prevent double validation during transitions

    if (commonCard.includes(symbolId)) {
      setCorrectMatchSymbolId(symbolId);
      playSound("correct");

      // Calculate scores
      const hostScore = player === "host" ? score + 1 : score;
      const clientScore = player === "client" ? opponentScore + 1 : opponentScore;
      setScore(hostScore);
      setOpponentScore(clientScore);

      // Notify clients of the correct tap
      dataChannelRef.current?.send(JSON.stringify({
        type: "OPPONENT_FEEDBACK",
        result: "correct",
        symbolId
      }));

      setTimeout(() => {
        setCorrectMatchSymbolId(null);

        // Check if game is complete (first to 10 points wins)
        if (hostScore >= 10 || clientScore >= 10) {
          if (dataChannelRef.current?.readyState === "open") {
            dataChannelRef.current.send(JSON.stringify({
              type: "GAME_OVER",
              scores: { host: hostScore, client: clientScore }
            }));
          }
          setGameState("gameover");
          playSound("win");
          return;
        }

        // Winning card becomes the new common card
        const winningCard = player === "host" ? playerCard : (playerCard === commonCard ? commonCard : playerCard); // Fallback reference
        const nextCommon = [...winningCard];

        // Draw replacement cards
        if (availableCardsRef.current.length < 2) {
          availableCardsRef.current = shuffle([...deckRef.current]).filter(
            card => JSON.stringify(card) !== JSON.stringify(nextCommon)
          );
        }

        const nextHostCard = player === "host" ? availableCardsRef.current.pop()! : playerCard;
        const nextClientCard = player === "client" ? availableCardsRef.current.pop()! : (player === "host" ? playerCard : playerCard); // Sync client

        broadcastMultiplayerState(nextCommon, nextHostCard, nextClientCard, { host: hostScore, client: clientScore });
      }, 500);
    } else {
      // Incorrect match shake feedback
      triggerShake();
      dataChannelRef.current?.send(JSON.stringify({
        type: "OPPONENT_FEEDBACK",
        result: "incorrect"
      }));
    }
  };

  // Clean scanners on unmount
  useEffect(() => {
    return () => {
      stopCameraScanner();
      peerConnectionRef.current?.close();
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#1E112A] via-[#431C5D] to-[#209C95] flex flex-col items-center justify-between py-6 px-4 select-none touch-none text-white font-sans overflow-hidden">
      
      {/* Custom Styles for animations */}
      <style>{`
        @keyframes scalePulse {
          0% { transform: scale(1); }
          30% { transform: scale(0.8); }
          70% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .animate-scale-pulse {
          animation: scalePulse 0.45s ease-out forwards !important;
          z-index: 10;
        }
        
        @keyframes cardShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-card-shake {
          animation: cardShake 0.35s ease-in-out !important;
        }
      `}</style>

      {/* Dynamic particles renderer */}
      {particles.map(p => (
        <span
          key={p.id}
          className="absolute text-2xl font-bold pointer-events-none z-50 animate-explode"
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

      {/* ── HEADER ── */}
      <header className="w-full max-w-md flex flex-col items-center z-10 shrink-0">
        <h1 className="text-3xl font-extrabold tracking-wider font-Fredoka text-transparent bg-clip-text bg-gradient-to-r from-white via-[#34C2B2] to-[#FF75A0] mb-2 drop-shadow-lg">
          RONDA PLAY
        </h1>
        
        {gameState === "playing" && (
          <div className="flex items-center space-x-6 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 shadow-xl">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase text-teal-300 font-bold">You</span>
              <span className="text-3xl font-bold font-Fredoka text-[#34C2B2]">{score}</span>
            </div>
            {gameMode !== "single" && (
              <>
                <div className="text-white/40 text-xl font-bold">VS</div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase text-pink-300 font-bold">Opponent</span>
                  <span className="text-3xl font-bold font-Fredoka text-[#FF75A0]">{opponentScore}</span>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      {/* ── ARENA AREA ── */}
      <main className="flex-1 w-full max-w-md flex flex-col justify-center items-center gap-6 relative z-0">
        
        {gameState === "menu" && (
          <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl flex flex-col items-center text-center space-y-6">
            <h2 className="text-2xl font-bold font-Fredoka text-white">Speed Match Arena</h2>
            <p className="text-sm text-white/80 leading-relaxed font-Nunito">
              The classic local matching game. Be the first to tap the matching symbol between your card and the common card in the middle!
            </p>
            
            <div className="w-full flex flex-col space-y-3">
              <button
                onClick={startSinglePlayer}
                className="w-full py-4 bg-gradient-to-r from-[#34C2B2] to-[#289689] font-bold rounded-full shadow-lg border-b-4 border-[#208378] active:translate-y-1 active:border-b-0 transition-all font-Poppins text-lg"
              >
                🎮 Single Player Practice
              </button>

              <button
                onClick={() => {
                  setGameMode("host");
                  setGameState("lobby");
                  initializeWebRTC("host");
                }}
                className="w-full py-4 bg-gradient-to-r from-[#FF75A0] to-[#D95A82] font-bold rounded-full shadow-lg border-b-4 border-[#BF4E72] active:translate-y-1 active:border-b-0 transition-all font-Poppins text-lg"
              >
                📡 Host Multiplayer Game
              </button>

              <button
                onClick={() => {
                  setGameMode("client");
                  setGameState("lobby");
                  initializeWebRTC("client");
                }}
                className="w-full py-4 bg-white/10 border border-white/30 font-bold rounded-full shadow-lg active:translate-y-1 transition-all font-Poppins text-lg text-white"
              >
                📲 Join Game Session
              </button>
            </div>
          </div>
        )}

        {gameState === "lobby" && (
          <div className="w-full bg-white/15 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl flex flex-col items-center space-y-6 overflow-y-auto max-h-[80vh]">
            <h2 className="text-xl font-bold font-Fredoka text-white uppercase tracking-wider">
              {gameMode === "host" ? "Hosting Multiplayer" : "Joining Multiplayer"}
            </h2>
            
            {connectionStatus === "generating" && (
              <div className="flex flex-col items-center space-y-3 py-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
                <span className="text-sm text-teal-200">Generating WebRTC session...</span>
              </div>
            )}

            {gameMode === "host" && connectionStatus === "scanning" && qrCodeUrl && (
              <div className="w-full flex flex-col items-center text-center space-y-4">
                <span className="text-sm font-semibold text-white/80 leading-relaxed font-Poppins">
                  Step 1: Have the Guest scan this QR code with their camera:
                </span>
                <div className="bg-white p-3 rounded-2xl shadow-2xl">
                  <img src={qrCodeUrl} alt="Host Connection QR" className="w-56 h-56" />
                </div>
                <button
                  onClick={startCameraScanner}
                  className="w-full py-3 bg-[#FF75A0] hover:bg-[#D95A82] text-white font-bold rounded-full shadow-md text-sm transition-all"
                >
                  Step 2: Scan Guest&apos;s QR Answer Code
                </button>
              </div>
            )}

            {gameMode === "client" && connectionStatus === "generating" && (
              <div className="w-full flex flex-col items-center text-center space-y-4">
                <button
                  onClick={startCameraScanner}
                  className="w-full py-4 bg-gradient-to-r from-teal-400 to-emerald-500 text-white font-bold rounded-full shadow-lg border-b-4 border-emerald-600 active:translate-y-1 transition-all text-lg"
                >
                  📸 Scan Host QR Code
                </button>
              </div>
            )}

            {gameMode === "client" && connectionStatus === "generating" && sdpToken && (
              <div className="w-full flex flex-col items-center text-center space-y-4">
                <span className="text-sm font-semibold text-teal-200 font-Poppins">
                  Step 2: Show this QR code to the Host:
                </span>
                {qrCodeUrl ? (
                  <div className="bg-white p-3 rounded-2xl shadow-2xl">
                    <img src={qrCodeUrl} alt="Client Connection QR" className="w-56 h-56" />
                  </div>
                ) : (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                )}
              </div>
            )}

            {showCamera && (
              <div className="w-full flex flex-col items-center space-y-3">
                <div id="reader" className="w-full rounded-2xl overflow-hidden border border-white/20 shadow-inner"></div>
                <button
                  onClick={stopCameraScanner}
                  className="px-6 py-2 bg-red-500 rounded-full text-xs font-bold uppercase tracking-wider"
                >
                  Cancel Scan
                </button>
              </div>
            )}

            {/* Error notifications */}
            {errorText && (
              <div className="w-full p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-200 text-center">
                {errorText}
              </div>
            )}

            {/* Manual connection token copy-paste backup */}
            <div className="w-full border-t border-white/10 pt-4 flex flex-col items-center space-y-3">
              <span className="text-xs text-white/50">Trouble with cameras? Use text link instead:</span>
              <input
                type="text"
                placeholder="Paste opponent's token here"
                value={inputSdpToken}
                onChange={(e) => setInputSdpToken(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-teal-400"
              />
              <button
                onClick={() => handleRemoteSDP(inputSdpToken)}
                className="px-6 py-2 bg-teal-500 text-white rounded-full text-xs font-bold uppercase tracking-wide shadow"
              >
                Submit Token
              </button>
              {sdpToken && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sdpToken);
                    alert("Your token copied to clipboard!");
                  }}
                  className="text-xs text-teal-300 underline"
                >
                  Copy My Token
                </button>
              )}
            </div>

            <button
              onClick={() => {
                stopCameraScanner();
                peerConnectionRef.current?.close();
                setGameState("menu");
              }}
              className="px-6 py-2 text-white/60 hover:text-white text-sm"
            >
              Back to Menu
            </button>
          </div>
        )}

        {gameState === "playing" && (
          <div className="w-full flex flex-col justify-center items-center gap-6">
            {/* Common Card Container */}
            <div className="flex flex-col items-center w-full">
              <div className="text-center mb-1 text-teal-200 font-Fredoka font-bold tracking-wider text-xs uppercase">Carta del Centro</div>
              
              <div 
                className="w-48 h-48 sm:w-56 sm:h-56 bg-[#FF75A0] p-[2px] relative shadow-2xl flex items-center justify-center animate-pop"
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
                            width: "25%",
                            height: "25%",
                            marginLeft: "-12.5%",
                            marginTop: "-12.5%",
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

            {/* Tap direction indicator */}
            <div className="flex justify-center items-center h-4 shrink-0 text-white/40">
              <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 13l-7 7-7-7m7 7V3"></path>
              </svg>
            </div>

            {/* Player Card Container */}
            <div className="flex flex-col items-center w-full">
              <div
                id="playerCardContainer"
                className={`w-52 h-52 sm:w-60 sm:h-60 bg-[#FF75A0] p-[2px] relative shadow-2xl flex items-center justify-center animate-pop ${
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
                          onClick={(e) => handleSymbolTap(e, symbolId)}
                          onTouchStart={(e) => handleSymbolTap(e, symbolId)}
                          className={`absolute flex items-center justify-center active:scale-95 transition-all outline-none cursor-pointer ${
                            isMatchingCorrect ? "animate-scale-pulse" : ""
                          }`}
                          style={{
                            left: `${slot.x}%`,
                            top: `${slot.y}%`,
                            width: "25%",
                            height: "25%",
                            marginLeft: "-12.5%",
                            marginTop: "-12.5%",
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
              <div className="text-center mt-2 text-pink-200 font-bold tracking-wider text-xs uppercase">Tu Carta (Encuentra y Toca la Pareja)</div>
            </div>
          </div>
        )}

        {gameState === "gameover" && (
          <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl flex flex-col items-center text-center space-y-6 animate-pop">
            <div className="text-6xl animate-bounce">
              {gameMode === "single" ? "⭐" : score > opponentScore ? "🏆" : score < opponentScore ? "🥈" : "🤝"}
            </div>
            
            <h2 className="text-2xl font-bold font-Fredoka text-white">
              {gameMode === "single"
                ? "Practice Complete!"
                : score > opponentScore
                ? "Victory!"
                : score < opponentScore
                ? "Good Game!"
                : "It's a Tie!"}
            </h2>

            <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col items-center space-y-3">
              <span className="text-xs uppercase tracking-wider text-white/50 font-Poppins">Final Scores</span>
              
              <div className="flex justify-around items-center w-full">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase text-teal-300 font-bold font-Poppins">You</span>
                  <span className="text-4xl font-extrabold text-[#34C2B2] font-Fredoka">{score}</span>
                </div>
                
                {gameMode !== "single" && (
                  <>
                    <div className="text-white/20 text-xl font-bold font-Poppins">VS</div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase text-pink-300 font-bold font-Poppins">Opponent</span>
                      <span className="text-4xl font-extrabold text-[#FF75A0] font-Fredoka">{opponentScore}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="w-full flex flex-col space-y-3">
              <button
                onClick={() => {
                  if (gameMode === "single") {
                    startSinglePlayer();
                  } else if (gameMode === "host") {
                    startMultiplayerGame();
                  } else if (gameMode === "client") {
                    if (dataChannelRef.current?.readyState === "open") {
                      dataChannelRef.current.send(JSON.stringify({ type: "RESTART_REQUEST" }));
                    }
                  }
                }}
                className="w-full py-4 bg-gradient-to-r from-[#34C2B2] to-[#289689] font-bold rounded-full shadow-lg border-b-4 border-[#208378] active:translate-y-1 active:border-b-0 transition-all font-Poppins text-lg"
              >
                🔄 Play Again
              </button>

              <button
                onClick={() => {
                  peerConnectionRef.current?.close();
                  setGameState("menu");
                }}
                className="w-full py-4 bg-white/10 border border-white/30 font-bold rounded-full shadow-lg active:translate-y-1 transition-all font-Poppins text-lg text-white"
              >
                🏠 Return to Main Menu
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ── FOOTER / CONTROL ── */}
      <footer className="w-full max-w-md flex justify-center py-2 shrink-0 z-10">
        {gameState === "playing" && (
          <button
            onClick={() => {
              peerConnectionRef.current?.close();
              setGameState("menu");
            }}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 text-xs font-bold uppercase tracking-wider transition-all"
          >
            Leave Arena
          </button>
        )}
      </footer>
    </div>
  );
}
