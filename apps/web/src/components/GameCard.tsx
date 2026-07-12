"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from './Button';
import { useLanguage } from '@/context/LanguageContext';

interface GameCardProps {
  // Translation-key based (preferred for home/library pages)
  titleKey?: string;
  descKey?: string;
  playersKey?: string;
  // Fallback direct strings (for pages that don't use translation keys)
  title?: string;
  description?: string;
  players?: string;

  type: 'logic' | 'memory' | 'speed';
  emoji: string;
  slug: string;
  isPremium?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({
  titleKey,
  descKey,
  playersKey,
  title: titleProp,
  description: descProp,
  players: playersProp,
  type,
  emoji,
  slug,
  isPremium = false,
}) => {
  const { t } = useLanguage();

  const title       = titleKey   ? t(titleKey)   : (titleProp   ?? '');
  const description = descKey    ? t(descKey)    : (descProp    ?? '');
  const players     = playersKey ? t(playersKey) : (playersProp ?? '');

  let headerBg = 'bg-ronda-purple';
  let tagBg = 'text-ronda-purple';
  let btnVariant: 'primary' | 'secondary' = 'primary';

  if (type === 'memory') {
    headerBg = 'bg-ronda-teal';
    tagBg = 'text-ronda-teal';
    btnVariant = 'primary';
  } else if (type === 'speed') {
    headerBg = 'bg-ronda-pink';
    tagBg = 'text-ronda-pink';
    btnVariant = 'secondary';
  }

  const typeBadge = t(`badge.${type}`);
  const btnText   = isPremium ? t('badge.locked') : t('badge.play');

  // If the game is "imposter" or "speed-match", it links to their routes, otherwise dummy link.
  const gameLink = (slug === 'imposter' || slug === 'speed-match') ? `/game/${slug}` : '#';

  return (
    <div className="bg-ronda-light border border-purple-100 rounded-[2rem] overflow-hidden shadow-lg group cursor-pointer flex flex-col h-full hover:-translate-y-2 transition-transform duration-300">
      <div className={`${headerBg} h-48 flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <span className="text-6xl z-10 transform group-hover:scale-110 transition-transform duration-300 select-none">
          {emoji}
        </span>
      </div>
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex gap-2 mb-4">
          <span className={`px-3 py-1 bg-white rounded-full text-xs font-bold shadow-sm uppercase ${tagBg}`}>
            {typeBadge}
          </span>
          <span className="px-3 py-1 bg-white rounded-full text-xs font-bold shadow-sm">
            {players}
          </span>
          {isPremium && (
            <span className="px-3 py-1 bg-ronda-pink/10 rounded-full text-xs font-bold shadow-sm text-ronda-pink uppercase">
              {t('badge.premium')}
            </span>
          )}
        </div>
        <h3 className="text-2xl font-bold text-ronda-slate mb-3 font-brand">
          {title}
        </h3>
        <p className="text-ronda-slate/70 font-body mb-6 flex-grow text-sm leading-relaxed">
          {description}
        </p>
        <Link href={gameLink} className="w-full mt-auto block">
          <Button
            variant={btnVariant}
            className="w-full py-3 text-center"
          >
            {btnText}
          </Button>
        </Link>
      </div>
    </div>
  );
};
