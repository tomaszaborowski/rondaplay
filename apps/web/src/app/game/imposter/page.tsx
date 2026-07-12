"use client";

import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { 
  Users, UserPlus, Trash2, ShieldAlert,
  HelpCircle, Eye, EyeOff, CheckCircle2, Play, 
  RotateCcw, Vote, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

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
    addPlayer,
    removePlayer,
    setImposterCount,
    startGame,
    nextPlayerReveal,
    submitVote,
    tallyVotes,
    resetGame,
  } = useGameStore();

  const { t } = useLanguage();

  const [newPlayerName, setNewPlayerName] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [voteIndex, setVoteIndex] = useState(0);

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      addPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };

  const currentPlayer = players[currentPlayerIndex];
  const isCurrentImposter = imposters.includes(currentPlayer);

  const slideVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-ronda-purpleDark text-white pt-32 pb-24 relative overflow-hidden flex items-center justify-center">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-48 h-48 bg-ronda-teal rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-ronda-pink rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-xl w-full px-6 z-10">
        <AnimatePresence mode="wait">

          {/* ── LOBBY PHASE ─────────────────────────────────── */}
          {gamePhase === 'lobby' && (
            <motion.div
              key="lobby"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <span className="inline-block bg-ronda-teal/20 text-ronda-teal px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  {t('imposter.setup.badge')}
                </span>
                <h1 className="text-4xl font-bold font-brand text-ronda-teal">{t('imposter.setup.title')}</h1>
                <p className="text-white/70 font-body text-sm">{t('imposter.setup.subtitle')}</p>
              </div>

              <GlassCard className="bg-white/10 border-white/20 text-white space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-ronda-teal" /> {t('imposter.setup.players')} ({players.length})
                </h2>

                <form onSubmit={handleAddPlayer} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('imposter.setup.placeholder')}
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="flex-grow bg-white/10 rounded-full border border-white/20 px-4 py-2 text-white outline-none focus:border-ronda-teal font-body"
                  />
                  <Button type="submit" variant="primary" className="p-3 rounded-full active:translate-y-[4px]">
                    <UserPlus className="w-5 h-5" />
                  </Button>
                </form>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {players.map((player, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 hover:bg-white/10 transition-colors">
                      <span className="font-semibold text-sm">{player}</span>
                      {players.length > 3 && (
                        <button
                          type="button"
                          onClick={() => removePlayer(idx)}
                          className="text-white/40 hover:text-ronda-pink transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-ronda-pink" /> {t('imposter.setup.imposters')}
                  </span>
                  <div className="flex gap-2">
                    {[1, 2].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setImposterCount(num)}
                        disabled={players.length < 5 && num > 1}
                        className={`w-10 h-10 rounded-full font-bold transition-all ${
                          imposterCount === num
                            ? 'bg-ronda-pink text-white shadow-lg scale-110'
                            : 'bg-white/10 text-white/60 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={startGame}
                  disabled={players.length < 3}
                  variant="primary"
                  className="w-full py-4 text-center flex items-center justify-center gap-2 text-base font-bold disabled:opacity-50"
                >
                  <Play className="w-5 h-5 fill-white" /> {t('imposter.setup.startBtn')}
                </Button>
              </GlassCard>
            </motion.div>
          )}

          {/* ── ASSIGN / REVEAL PHASE ───────────────────────── */}
          {gamePhase === 'assign' && (
            <motion.div
              key="assign"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6 text-center"
            >
              <div className="space-y-2">
                <span className="inline-block bg-ronda-pink/20 text-ronda-pink px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  {t('imposter.reveal.badge')}
                </span>
                <h1 className="text-3xl font-bold font-brand">{t('imposter.reveal.title')}</h1>
                <p className="text-white/70 font-body text-sm">{t('imposter.reveal.subtitle')}</p>
              </div>

              <GlassCard className="bg-white/10 border-white/20 text-white p-8 space-y-8 flex flex-col items-center">
                <div className="space-y-2">
                  <p className="text-white/60 text-sm font-semibold uppercase">{t('imposter.reveal.youAre')}</p>
                  <h2 className="text-4xl font-extrabold text-ronda-teal font-brand">{currentPlayer}</h2>
                </div>

                <div className="w-full min-h-[160px] flex items-center justify-center border-2 border-dashed border-white/20 rounded-3xl p-6 relative overflow-hidden bg-white/5">
                  {showSecret ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-4 text-center"
                    >
                      <span className="text-5xl block">
                        {isCurrentImposter ? '🕵️‍♀️' : '📦'}
                      </span>
                      <h3 className="text-3xl font-bold tracking-wide">
                        {isCurrentImposter ? t('imposter.reveal.imposter') : wordPair?.innocent}
                      </h3>
                      {!isCurrentImposter && (
                        <p className="text-white/60 font-body text-xs">{t('imposter.reveal.citizen')}</p>
                      )}
                      {isCurrentImposter && (
                        <p className="text-ronda-pink font-semibold font-body text-xs">{t('imposter.reveal.blendIn')}</p>
                      )}
                    </motion.div>
                  ) : (
                    <div className="text-center space-y-4">
                      <HelpCircle className="w-16 h-16 mx-auto text-white/30 animate-pulse" />
                      <p className="text-sm font-body text-white/60">{t('imposter.reveal.tapReveal')}</p>
                    </div>
                  )}
                </div>

                <div className="w-full space-y-3">
                  {!showSecret ? (
                    <Button
                      onClick={() => setShowSecret(true)}
                      variant="primary"
                      className="w-full py-4 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-5 h-5" /> {t('imposter.reveal.secretWord')}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setShowSecret(false);
                        nextPlayerReveal();
                      }}
                      variant="secondary"
                      className="w-full py-4 flex items-center justify-center gap-2"
                    >
                      <EyeOff className="w-5 h-5" /> {t('imposter.reveal.next')} <ArrowRight className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* ── PLAY / DISCUSSION PHASE ─────────────────────── */}
          {gamePhase === 'play' && (
            <motion.div
              key="play"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6 text-center"
            >
              <div className="space-y-2">
                <span className="inline-block bg-yellow-400/20 text-yellow-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  {t('imposter.discuss.badge')}
                </span>
                <h1 className="text-3xl font-bold font-brand text-ronda-pink">{t('imposter.discuss.title')}</h1>
                <p className="text-white/70 font-body text-sm">{t('imposter.discuss.subtitle')}</p>
              </div>

              <GlassCard className="bg-white/10 border-white/20 text-white p-8 space-y-6">
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-ronda-pink/20 rounded-full flex items-center justify-center mx-auto text-4xl border-2 border-ronda-pink shadow-lg">
                    🕵️‍♂️
                  </div>
                  <h3 className="text-xl font-bold">{t('imposter.discuss.rules')}</h3>
                  <ul className="text-left space-y-3 font-body text-sm text-white/80 max-w-sm mx-auto list-disc list-inside">
                    <li>{t('imposter.discuss.rule1')}</li>
                    <li>{t('imposter.discuss.rule2')}</li>
                    <li>{t('imposter.discuss.rule3')}</li>
                    <li>{t('imposter.discuss.rule4')}</li>
                  </ul>
                </div>

                <Button
                  onClick={() => {
                    setVoteIndex(0);
                    useGameStore.setState({ gamePhase: 'vote', selectedVotes: {} });
                  }}
                  variant="primary"
                  className="w-full py-4 flex items-center justify-center gap-2"
                >
                  <Vote className="w-5 h-5" /> {t('imposter.discuss.startVote')}
                </Button>
              </GlassCard>
            </motion.div>
          )}

          {/* ── VOTE PHASE ──────────────────────────────────── */}
          {gamePhase === 'vote' && (
            <motion.div
              key="vote"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <span className="inline-block bg-ronda-teal/20 text-ronda-teal px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  {t('imposter.vote.badge')}
                </span>
                <h1 className="text-3xl font-bold font-brand">{t('imposter.vote.title')}</h1>
                <p className="text-white/70 font-body text-sm">{t('imposter.vote.subtitle')}</p>
              </div>

              <GlassCard className="bg-white/10 border-white/20 text-white p-8 space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-xs text-white/60 font-semibold uppercase">{t('imposter.vote.casting')}</p>
                  <h3 className="text-3xl font-bold text-ronda-teal font-brand">{players[voteIndex]}</h3>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-white/80 mb-2">{t('imposter.vote.prompt')}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {players.map((suspect, idx) => {
                      if (suspect === players[voteIndex]) return null;
                      const isSelected = selectedVotes[players[voteIndex]] === suspect;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => submitVote(players[voteIndex], suspect)}
                          className={`py-3 px-4 rounded-2xl border text-sm font-bold transition-all ${
                            isSelected
                              ? 'bg-ronda-pink border-ronda-pink text-white shadow-md scale-105'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                          }`}
                        >
                          {suspect}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-xs text-white/50 font-body">
                    {t('imposter.vote.counter')} {voteIndex + 1} {t('imposter.vote.of')} {players.length}
                  </span>
                  
                  {selectedVotes[players[voteIndex]] ? (
                    voteIndex + 1 < players.length ? (
                      <Button
                        onClick={() => setVoteIndex(voteIndex + 1)}
                        variant="secondary"
                        className="py-2.5 px-5 text-xs flex items-center gap-1"
                      >
                        {t('imposter.vote.nextVoter')} <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={tallyVotes}
                        variant="primary"
                        className="py-2.5 px-5 text-xs flex items-center gap-1"
                      >
                        {t('imposter.vote.tally')} <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    )
                  ) : (
                    <span className="text-xs text-ronda-pink font-semibold">{t('imposter.vote.selectFirst')}</span>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* ── RESULTS PHASE ───────────────────────────────── */}
          {gamePhase === 'results' && (
            <motion.div
              key="results"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6 text-center"
            >
              <div className="space-y-2">
                <span className="inline-block bg-ronda-pink/20 text-ronda-pink px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  {t('imposter.result.badge')}
                </span>
                <h1 className="text-4xl font-bold font-brand text-ronda-teal">{t('imposter.result.title')}</h1>
              </div>

              <GlassCard className="bg-white/10 border-white/20 text-white p-8 space-y-8 flex flex-col items-center">
                <div className="space-y-4">
                  <div className="w-24 h-24 bg-yellow-400/20 border-4 border-yellow-400 rounded-full flex items-center justify-center mx-auto text-5xl animate-bounce-slow">
                    🏆
                  </div>
                  <h2 className="text-4xl font-black font-brand uppercase tracking-wide">
                    {winner === 'innocents' ? t('imposter.result.citizensWin') : t('imposter.result.impostersWin')}
                  </h2>
                </div>

                <div className="w-full space-y-4 text-left font-body text-sm border-y border-white/10 py-6">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 font-semibold">{t('imposter.result.theWord')}</span>
                    <span className="font-bold text-ronda-teal text-base">{wordPair?.innocent}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 font-semibold">{t('imposter.result.decoyWord')}</span>
                    <span className="font-bold text-ronda-pink text-base">{wordPair?.imposter}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-white/60 font-semibold">{t('imposter.result.wereImposters')}</span>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {imposters.map((imp, idx) => (
                        <span key={idx} className="bg-ronda-pink/20 text-ronda-pink font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-ronda-pink/30">
                          <ShieldAlert className="w-3.5 h-3.5" /> {imp}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-white/60 font-semibold">{t('imposter.result.innocents')}</span>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {players.filter(p => !imposters.includes(p)).map((cit, idx) => (
                        <span key={idx} className="bg-ronda-teal/20 text-ronda-teal font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-ronda-teal/30">
                          <ShieldCheck className="w-3.5 h-3.5" /> {cit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={resetGame}
                  variant="primary"
                  className="w-full py-4 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" /> {t('imposter.result.playAgain')}
                </Button>
              </GlassCard>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
