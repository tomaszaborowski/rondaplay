"use client";

import React, { useState } from 'react';
import { GameCard } from '@/components/GameCard';
import { Button } from '@/components/Button';
import { Search, Gamepad2, Brain, Zap, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface GameData {
  titleKey: string;
  descKey: string;
  playersKey: string;
  type: 'logic' | 'memory' | 'speed';
  emoji: string;
  slug: string;
  isPremium: boolean;
}

const GAMES: GameData[] = [
  {
    titleKey: "game.imposter.title",
    descKey: "game.imposter.desc",
    playersKey: "game.imposter.players",
    type: "logic",
    emoji: "🕵️‍♀️",
    slug: "imposter",
    isPremium: false,
  },
  {
    titleKey: "game.pattern.title",
    descKey: "game.pattern.desc",
    playersKey: "game.pattern.players",
    type: "memory",
    emoji: "🧠",
    slug: "pattern-path",
    isPremium: true,
  },
  {
    titleKey: "game.speed-match.title",
    descKey: "game.speed-match.desc",
    playersKey: "game.speed-match.players",
    type: "speed",
    emoji: "⚡",
    slug: "speed-match",
    isPremium: false,
  },
  {
    titleKey: "game.wordWheel.title",
    descKey: "game.wordWheel.desc",
    playersKey: "game.wordWheel.players",
    type: "logic",
    emoji: "🎡",
    slug: "word-wheel",
    isPremium: true,
  },
  {
    titleKey: "game.colorBlind.title",
    descKey: "game.colorBlind.desc",
    playersKey: "game.colorBlind.players",
    type: "memory",
    emoji: "🎨",
    slug: "color-blind",
    isPremium: true,
  },
  {
    titleKey: "game.reaction.title",
    descKey: "game.reaction.desc",
    playersKey: "game.reaction.players",
    type: "speed",
    emoji: "💥",
    slug: "tap-attack",
    isPremium: false,
  },
];

export default function Library() {
  const { t } = useLanguage();
  const [selectedType, setSelectedType] = useState<'all' | 'logic' | 'memory' | 'speed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGames = GAMES.filter((game) => {
    const matchesType = selectedType === 'all' || game.type === selectedType;
    // Search against translated title/desc
    const titleStr = t(game.titleKey).toLowerCase();
    const descStr  = t(game.descKey).toLowerCase();
    const matchesSearch = titleStr.includes(searchQuery.toLowerCase()) ||
                          descStr.includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-36 pb-24 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-24 right-[-10%] w-96 h-96 bg-ronda-teal/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-10 left-[-10%] w-96 h-96 bg-ronda-pink/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-ronda-purple/10 px-4 py-1.5 rounded-full border border-ronda-purple/20 text-ronda-purple font-bold text-sm uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-ronda-pink animate-spin-slow" /> Ronda Play
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-ronda-purple">
            {t('lib.h1')}
          </h1>
          <p className="text-ronda-slate max-w-2xl mx-auto font-body text-lg">
            {t('lib.desc')}
          </p>
        </div>

        {/* Filter controls */}
        <div className="glass-card mb-12 p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Search bar */}
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ronda-slate/40 w-5 h-5" />
            <input
              type="text"
              placeholder={t('lib.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-full border-2 border-ronda-light focus:border-ronda-teal outline-none transition-colors font-body text-ronda-slate"
            />
          </div>

          {/* Type filters */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedType === 'all' ? 'primary' : 'outline'}
              onClick={() => setSelectedType('all')}
              className={`px-5 py-2.5 rounded-full text-xs flex items-center gap-2 ${
                selectedType !== 'all' ? 'border-2 border-ronda-purple/20 text-ronda-purple hover:bg-ronda-purple/5' : ''
              }`}
            >
              <Gamepad2 className="w-4 h-4" /> {t('lib.filter.all')}
            </Button>
            <Button
              variant={selectedType === 'logic' ? 'primary' : 'outline'}
              onClick={() => setSelectedType('logic')}
              className={`px-5 py-2.5 rounded-full text-xs flex items-center gap-2 ${
                selectedType !== 'logic' ? 'border-2 border-ronda-purple/20 text-ronda-purple hover:bg-ronda-purple/5' : ''
              }`}
            >
              <Sparkles className="w-4 h-4" /> {t('lib.filter.logic')}
            </Button>
            <Button
              variant={selectedType === 'memory' ? 'primary' : 'outline'}
              onClick={() => setSelectedType('memory')}
              className={`px-5 py-2.5 rounded-full text-xs flex items-center gap-2 ${
                selectedType !== 'memory' ? 'border-2 border-ronda-purple/20 text-ronda-purple hover:bg-ronda-purple/5' : ''
              }`}
            >
              <Brain className="w-4 h-4" /> {t('lib.filter.mem')}
            </Button>
            <Button
              variant={selectedType === 'speed' ? 'primary' : 'outline'}
              onClick={() => setSelectedType('speed')}
              className={`px-5 py-2.5 rounded-full text-xs flex items-center gap-2 ${
                selectedType !== 'speed' ? 'border-2 border-ronda-purple/20 text-ronda-purple hover:bg-ronda-purple/5' : ''
              }`}
            >
              <Zap className="w-4 h-4" /> {t('lib.filter.speed')}
            </Button>
          </div>
        </div>

        {/* Games Grid */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGames.map((game, idx) => (
              <GameCard
                key={idx}
                titleKey={game.titleKey}
                descKey={game.descKey}
                playersKey={game.playersKey}
                type={game.type}
                emoji={game.emoji}
                slug={game.slug}
                isPremium={game.isPremium}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-ronda-purple/10">
            <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-ronda-slate/30" />
            <h3 className="text-2xl font-bold text-ronda-purple mb-2">{t('lib.empty')}</h3>
            <p className="text-ronda-slate/70 font-body">{t('lib.desc')}</p>
          </div>
        )}

        {/* Premium CTA */}
        <div className="mt-20 text-center bg-gradient-to-r from-ronda-purple to-ronda-pink rounded-[2rem] p-10 text-white">
          <h2 className="text-3xl font-bold mb-4">✨ {t('lib.cta.btn')}</h2>
          <p className="text-white/80 font-body mb-8 max-w-xl mx-auto">{t('lib.cta.desc')}</p>
          <Button variant="primary" className="px-10 py-4 text-base bg-white text-ronda-purple hover:bg-white/90 border-0">
            {t('lib.cta.btn')}
          </Button>
        </div>
      </div>
    </div>
  );
}
