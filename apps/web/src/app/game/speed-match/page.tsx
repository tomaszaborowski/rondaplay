"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

// 13 distinct emojis representing symbols for n=3 Dobble algorithm
const symbolsAssets = [
  "🦖", "🦊", "🐼", "👻", "🤖", "🦄", "👽", "🦁", "🐸", "🐷", "⭐", "🚀", "🍎"
];

// Pre-defined relative layout slots for 4 symbols per card (percentage left, top, scale, rotation)
const layoutSlots = [
  { x: 22, y: 22, scale: 1.1, rot: -15 }, // Top Left
  { x: 62, y: 26, scale: 0.9, rot: 20 },  // Top Right
  { x: 27, y: 64, scale: 1.0, rot: 10 },  // Bottom Left
  { x: 58, y: 58, scale: 1.25, rot: -25 }  // Bottom Right
];

// Finite projective plane deck generator (n=3)
// Generates 13 cards, each with exactly 4 symbols, sharing exactly 1 symbol with any other card
function generateDobbleDeck(n = 3): number[][] {
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
  const candidates: any[] = [];
  
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

  c.forEach((cand: any) => {
    sdp += `a=candidate:1 1 UDP 2122260991 ${cand[1]} ${cand[2]} typ ${cand[0]}\r\n`;
  });

  return sdp;
}

export default function SpeedMatchGame() {
  const [gameState, setGameState] = useState<"menu" | "lobby" | "playing" | "gameover">("menu");
  const [gameMode, setGameMode] = useState<"single" | "host" | "client">("single");
  const [score, setScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  
  // Cards state
  const [commonCard, setCommonCard] = useState<number[]>([]);
  const [playerCard, setPlayerCard] = useState<number[]>([]);
  const [commonCardSlots, setCommonCardSlots] = useState<any[]>([]);
  const [playerCardSlots, setPlayerCardSlots] = useState<any[]>([]);
  
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
  const qrScannerRef = useRef<any>(null);

  // Audio Context for sound synthesis (no asset files required)
  const playSound = (type: "correct" | "error" | "win") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
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
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; tx: number; ty: number }[]>([]);
  const createParticles = (x: number, y: number) => {
    const numParticles = 8;
    const newParticles: typeof particles = [];
    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * 60;
      newParticles.push({
        id: Date.now() + Math.random(),
        x,
        y,
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.slice(numParticles));
    }, 600);
  };

  // Shake state
  const [isShaking, setIsShaking] = useState(false);
  const triggerShake = () => {
    setIsShaking(true);
    playSound("error");
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
        // Synchronized cards from Host
        setCommonCard(msg.commonCard);
        setCommonCardSlots(shuffle([...layoutSlots]));
        
        // Client receives cards mapped specifically for them
        const myCard = gameMode === "host" ? msg.hostCard : msg.clientCard;
        setPlayerCard(myCard);
        setPlayerCardSlots(shuffle([...layoutSlots]));
        
        setScore(msg.scores[gameMode]);
        setOpponentScore(msg.scores[gameMode === "host" ? "client" : "host"]);
      } else if (msg.type === "OPPONENT_FEEDBACK") {
        if (msg.result === "correct") {
          playSound("correct");
        } else {
          triggerShake();
        }
      } else if (msg.type === "TAP" && gameMode === "host") {
        // Host validates client tap request
        validateMultiplayerTap(msg.symbolId, "client");
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
    deckRef.current = generateDobbleDeck(3);
    availableCardsRef.current = shuffle([...deckRef.current]);

    const firstCommon = availableCardsRef.current.pop()!;
    const firstPlayer = availableCardsRef.current.pop()!;
    
    setCommonCard(firstCommon);
    setPlayerCard(firstPlayer);
    setCommonCardSlots(shuffle([...layoutSlots]));
    setPlayerCardSlots(shuffle([...layoutSlots]));
    
    setScore(0);
    setGameState("playing");
  };

  const startMultiplayerGame = () => {
    deckRef.current = generateDobbleDeck(3);
    availableCardsRef.current = shuffle([...deckRef.current]);

    const firstCommon = availableCardsRef.current.pop()!;
    const hostCard = availableCardsRef.current.pop()!;
    const clientCard = availableCardsRef.current.pop()!;

    setScore(0);
    setOpponentScore(0);
    
    broadcastMultiplayerState(firstCommon, hostCard, clientCard, { host: 0, client: 0 });
  };

  const broadcastMultiplayerState = (common: number[], host: number[], client: number[], scores: { host: number; client: number }) => {
    setCommonCard(common);
    setCommonCardSlots(shuffle([...layoutSlots]));
    
    const myCard = gameMode === "host" ? host : client;
    setPlayerCard(myCard);
    setPlayerCardSlots(shuffle([...layoutSlots]));

    if (dataChannelRef.current?.readyState === "open") {
      dataChannelRef.current.send(JSON.stringify({
        type: "STATE_UPDATE",
        commonCard: common,
        hostCard: host,
        clientCard: client,
        scores
      }));
    }
  };

  // Validate Tap interaction
  const handleSymbolTap = (event: React.MouseEvent | React.TouchEvent, symbolId: number) => {
    event.preventDefault();
    
    // Fetch screen tap coordinates for particles
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    if (gameMode === "single") {
      if (commonCard.includes(symbolId)) {
        createParticles(clientX, clientY);
        playSound("correct");
        
        const nextScore = score + 1;
        setScore(nextScore);

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
        setCommonCardSlots(shuffle([...layoutSlots]));
        setPlayerCardSlots(shuffle([...layoutSlots]));
      } else {
        triggerShake();
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
    if (commonCard.includes(symbolId)) {
      // Sound feedback for correct match
      playSound("correct");
      dataChannelRef.current?.send(JSON.stringify({
        type: "OPPONENT_FEEDBACK",
        result: "correct"
      }));

      // Calculate scores
      const hostScore = player === "host" ? score + 1 : score;
      const clientScore = player === "client" ? opponentScore + 1 : opponentScore;
      setScore(hostScore);
      setOpponentScore(clientScore);

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
      
      {/* Dynamic particles renderer */}
      {particles.map(p => (
        <span
          key={p.id}
          className="absolute w-4 h-4 bg-[#FF75A0] rounded-full pointer-events-none z-50 animate-explode"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            // @ts-ignore
            "--tx": `${p.tx}px`,
            "--ty": `${p.ty}px`
          }}
        />
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
                  Step 2: Scan Guest's QR Answer Code
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
              <div className="text-center mb-1 text-teal-200 font-bold tracking-wider text-xs uppercase">Common Card</div>
              <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white rounded-full relative shadow-2xl border-[6px] border-[#34C2B2] overflow-hidden flex items-center justify-center animate-pop">
                <div className="absolute inset-[5%] rounded-full">
                  {commonCard.map((symbolId, index) => {
                    const slot = commonCardSlots[index] || layoutSlots[index];
                    return (
                      <div
                        key={`common-${symbolId}`}
                        className="absolute text-5xl flex items-center justify-center"
                        style={{
                          left: `${slot.x}%`,
                          top: `${slot.y}%`,
                          width: "35%",
                          height: "35%",
                          marginLeft: "-17.5%",
                          marginTop: "-17.5%",
                          transform: `scale(${slot.scale}) rotate(${slot.rot}deg)`,
                          transformOrigin: "center center",
                          filter: "drop-shadow(0px 3px 2px rgba(0,0,0,0.15))"
                        }}
                      >
                        {symbolsAssets[symbolId]}
                      </div>
                    );
                  })}
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
                className={`w-52 h-52 sm:w-60 sm:h-60 bg-white rounded-full relative shadow-2xl border-[6px] border-[#FF75A0] overflow-hidden flex items-center justify-center animate-pop ${
                  isShaking ? "animate-shake border-red-500" : ""
                }`}
              >
                <div className="absolute inset-[5%] rounded-full">
                  {playerCard.map((symbolId, index) => {
                    const slot = playerCardSlots[index] || layoutSlots[index];
                    return (
                      <button
                        key={`player-${symbolId}`}
                        onClick={(e) => handleSymbolTap(e, symbolId)}
                        onTouchStart={(e) => handleSymbolTap(e, symbolId)}
                        className="absolute text-5xl flex items-center justify-center active:scale-95 transition-all outline-none cursor-pointer"
                        style={{
                          left: `${slot.x}%`,
                          top: `${slot.y}%`,
                          width: "35%",
                          height: "35%",
                          marginLeft: "-17.5%",
                          marginTop: "-17.5%",
                          transform: `scale(${slot.scale}) rotate(${slot.rot}deg)`,
                          transformOrigin: "center center",
                          filter: "drop-shadow(0px 3px 2px rgba(0,0,0,0.15))"
                        }}
                      >
                        {symbolsAssets[symbolId]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="text-center mt-2 text-pink-200 font-bold tracking-wider text-xs uppercase">Your Card (Find & Tap Match)</div>
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
