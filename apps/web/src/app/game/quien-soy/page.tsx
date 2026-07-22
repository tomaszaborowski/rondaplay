"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/Button';
import { RotateCcw, Volume2, VolumeX, Smartphone, CheckCircle, XCircle } from 'lucide-react';

interface TargetWord {
  id: string;
  es: string;
  en: string;
}

interface Deck {
  id: string;
  titleEs: string;
  titleEn: string;
  category: string;
  words: TargetWord[];
}

const defaultDecks: Deck[] = [
  {
    id: "deck-animals",
    titleEs: "Animales Salvajes",
    titleEn: "Wild Animals",
    category: "animals",
    words: [
      { id: "w1", es: "León", en: "Lion" },
      { id: "w2", es: "Elefante", en: "Elephant" },
      { id: "w3", es: "Delfín", en: "Dolphin" },
      { id: "w4", es: "Canguro", en: "Kangaroo" },
      { id: "w5", es: "Pingüino", en: "Penguin" },
      { id: "w6", es: "Jirafa", en: "Giraffe" },
      { id: "w7", es: "Tigre", en: "Tiger" },
      { id: "w8", es: "Oso Panda", en: "Panda Bear" }
    ]
  },
  {
    id: "deck-movies",
    titleEs: "Películas Famosas",
    titleEn: "Blockbuster Movies",
    category: "movies",
    words: [
      { id: "m1", es: "Titanic", en: "Titanic" },
      { id: "m2", es: "Avatar", en: "Avatar" },
      { id: "m3", es: "El Rey León", en: "The Lion King" },
      { id: "m4", es: "Matrix", en: "The Matrix" },
      { id: "m5", es: "Jurassic Park", en: "Jurassic Park" },
      { id: "m6", es: "Harry Potter", en: "Harry Potter" },
      { id: "m7", es: "Star Wars", en: "Star Wars" }
    ]
  },
  {
    id: "deck-celebrities",
    titleEs: "Famosos & Estrellas",
    titleEn: "Celebrities & Superstars",
    category: "celebrities",
    words: [
      { id: "c1", es: "Lionel Messi", en: "Lionel Messi" },
      { id: "c2", es: "Taylor Swift", en: "Taylor Swift" },
      { id: "c3", es: "Cristiano Ronaldo", en: "Cristiano Ronaldo" },
      { id: "c4", es: "Shakira", en: "Shakira" },
      { id: "c5", es: "Will Smith", en: "Will Smith" }
    ]
  }
];

export default function QuienSoyWebGame() {
  const { lang } = useLanguage();

  const [decks] = useState<Deck[]>(defaultDecks as Deck[]);
  const [selectedDeck, setSelectedDeck] = useState<Deck>(defaultDecks[0] as Deck);
  
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAME_OVER'>('IDLE');
  const [wordsList, setWordsList] = useState<TargetWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [correctCount, setCorrectCount] = useState(0);
  const [passCount, setPassCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Fisher-Yates Shuffle
  const shuffleWords = (arr: TargetWord[]) => {
    const list = [...arr];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };

  const handleStartGame = () => {
    const shuffled = shuffleWords(selectedDeck.words);
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
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-brand pt-24">
      {/* HEADER BAR */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-8">
        <div>
          <span className="text-ronda-teal font-semibold text-xs uppercase tracking-widest block">
            RondaPlay Web Preview
          </span>
          <h1 className="text-3xl font-extrabold text-white">¿Quién Soy?</h1>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-slate-300"
          title="Toggle Sound"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5 text-ronda-teal" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
        </button>
      </div>

      {/* IDLE SCREEN: DECK SELECTION */}
      {gameState === 'IDLE' && (
        <div className="w-full max-w-xl bg-slate-800/80 border border-slate-700/80 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 bg-ronda-teal/20 text-ronda-teal rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Smartphone className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold">Selecciona tu Mazo de Cartas</h2>
          <p className="text-slate-400 text-sm">
            Coloca el teléfono en tu frente. Inclina hacia abajo para Correcto o hacia arriba para Pasar.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 text-left">
            {decks.map((d) => {
              const isSelected = selectedDeck.id === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDeck(d)}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-ronda-pink bg-ronda-pink/10 shadow-lg shadow-ronda-pink/20'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {d.category}
                  </span>
                  <span className="text-lg font-bold text-white">{lang === 'en' ? d.titleEn : d.titleEs}</span>
                  <span className="text-xs text-slate-400 mt-2">{d.words.length} Palabras</span>
                </button>
              );
            })}
          </div>

          <Button onClick={handleStartGame} variant="primary" className="w-full py-4 text-lg">
            ¡Empieza a Jugar!
          </Button>
        </div>
      )}

      {/* PLAYING SCREEN */}
      {gameState === 'PLAYING' && (
        <div className="w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-8 min-h-[380px] justify-between">
          <div className="w-full flex justify-between items-center text-sm font-bold text-slate-400 border-b border-slate-700/60 pb-4">
            <span>Mazo: {lang === 'en' ? selectedDeck.titleEn : selectedDeck.titleEs}</span>
            <span className="text-2xl font-black text-ronda-pink">{timerSeconds}s</span>
          </div>

          {/* CARD DISPLAY */}
          <div className="w-full bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-ronda-teal rounded-2xl py-16 px-6 text-center shadow-2xl my-4">
            <span className="text-4xl sm:text-6xl font-black text-white tracking-wide uppercase">
              {activeText}
            </span>
          </div>

          {/* SIMULATED TILT BUTTONS FOR WEB PREVIEW */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <button
              onClick={() => handleWordAction('pass')}
              className="py-4 bg-red-600/90 hover:bg-red-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 text-lg shadow-lg shadow-red-600/20 active:scale-95 transition-transform"
            >
              <XCircle className="w-6 h-6" /> PASAR (Tilt Up)
            </button>
            <button
              onClick={() => handleWordAction('correct')}
              className="py-4 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 text-lg shadow-lg shadow-emerald-600/20 active:scale-95 transition-transform"
            >
              <CheckCircle className="w-6 h-6" /> CORRECTO (Tilt Down)
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER SUMMARY SCREEN */}
      {gameState === 'GAME_OVER' && (
        <div className="w-full max-w-xl bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-ronda-pink">¡Tiempo Agotado!</h2>

          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700">
              <span className="text-xs font-bold text-slate-400 block mb-1">CORRECTAS</span>
              <span className="text-4xl font-black text-emerald-400">{correctCount}</span>
            </div>
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700">
              <span className="text-xs font-bold text-slate-400 block mb-1">PASADAS</span>
              <span className="text-4xl font-black text-red-400">{passCount}</span>
            </div>
          </div>

          <Button onClick={() => setGameState('IDLE')} variant="primary" className="w-full py-4 flex items-center justify-center gap-2 text-lg">
            <RotateCcw className="w-5 h-5" /> Jugar de Nuevo
          </Button>
        </div>
      )}
    </div>
  );
}
