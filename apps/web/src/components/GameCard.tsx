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
  // Fallback direct strings
  title?: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  players?: string;

  type: 'logic' | 'memory' | 'speed';
  emoji: string;
  slug: string;
  coverImage?: string;
  logoUrl?: string;
  isPremium?: boolean;
  url?: string;
}

export const GameCard: React.FC<GameCardProps> = ({
  titleKey,
  descKey,
  playersKey,
  title: titleProp,
  titleEn: titleEnProp,
  description: descProp,
  descriptionEn: descEnProp,
  players: playersProp,
  type,
  emoji,
  slug,
  coverImage,
  logoUrl,
  isPremium = false,
  url,
}) => {
  const { t, lang } = useLanguage();

  // Resolve Title
  let title = '';
  if (lang === 'en') {
    title = titleEnProp || titleProp || '';
  } else {
    title = titleProp || '';
  }
  if (!title && titleKey) {
    title = t(titleKey);
  }

  // Resolve Description
  let description = '';
  if (lang === 'en') {
    description = descEnProp || descProp || '';
  } else {
    description = descProp || '';
  }
  if (!description && descKey) {
    description = t(descKey);
  }

  // Resolve Players
  let players = playersProp || '';
  if (!players && playersKey) {
    players = t(playersKey);
  }

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
  const gameLink  = url || ((slug === 'imposter' || slug === 'speed-match') ? `/game/${slug}` : '#');

  return (
    <div className="bg-ronda-light border border-purple-100 rounded-[2rem] overflow-hidden shadow-lg group cursor-pointer flex flex-col h-full hover:-translate-y-2 transition-transform duration-300 relative">
      
      {/* Post Cover Header */}
      <div className={`${headerBg} h-52 flex flex-col items-center justify-center relative overflow-hidden p-4`}>
        {/* Cover Image Background */}
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        )}

        {/* Overlay Dark Gradient Tint if Cover Image is present */}
        {coverImage && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20"></div>
        )}

        {/* Game Logo starting in header / top of post */}
        {logoUrl ? (
          <div className="relative z-10 flex items-center justify-center h-full w-full">
            <img
              src={logoUrl}
              alt={`${title} Logo`}
              className="max-h-24 max-w-[85%] object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        ) : (
          <span className="text-6xl z-10 transform group-hover:scale-110 transition-transform duration-300 select-none drop-shadow-md">
            {emoji}
          </span>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 bg-white rounded-full text-xs font-bold shadow-sm uppercase ${tagBg}`}>
            {typeBadge}
          </span>
          <span className="px-3 py-1 bg-white rounded-full text-xs font-bold shadow-sm text-slate-600">
            {players}
          </span>
          {isPremium && (
            <span className="px-3 py-1 bg-ronda-pink/10 rounded-full text-xs font-bold shadow-sm text-ronda-pink uppercase">
              {t('badge.premium')}
            </span>
          )}
        </div>

        <h3 className="text-2xl font-bold text-ronda-slate mb-2 font-brand">
          {title}
        </h3>

        <p className="text-ronda-slate/70 font-body mb-6 flex-grow text-sm leading-relaxed">
          {description}
        </p>

        <Link href={gameLink} className="w-full mt-auto block">
          <Button variant={btnVariant} className="w-full py-3 text-center">
            {btnText}
          </Button>
        </Link>
      </div>
    </div>
  );
};
