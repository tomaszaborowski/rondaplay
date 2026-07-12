"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useAdminStore } from '@/store/adminStore';

// Inline Instagram SVG — lucide-react this version doesn't export Instagram
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function TopBanner() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const instagramUrl = useAdminStore((s) => s.settings.instagramUrl);

  // Don't render on admin routes
  if (pathname?.startsWith('/admin')) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-9 bg-ronda-purple/85 backdrop-blur-md border-b border-white/10 flex items-center px-4 md:px-8">
      {/* Left: Instagram link */}
      <a
        href={instagramUrl || 'https://instagram.com/rondaplay'}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs font-semibold text-white hover:text-ronda-pink transition-colors"
      >
        <InstagramIcon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t('banner.instagram')}</span>
      </a>

      {/* Center spacer */}
      <div className="flex-1" />

      {/* Right: Language toggle */}
      <div className="flex items-center gap-0.5 bg-white/15 rounded-full p-0.5 border border-white/20">
        <button
          onClick={() => setLang('es')}
          className={`px-3 py-0.5 rounded-full text-xs font-bold transition-all ${
            lang === 'es'
              ? 'bg-ronda-teal text-white shadow'
              : 'text-white hover:text-white hover:bg-white/10'
          }`}
        >
          🇪🇸 ES
        </button>
        <button
          onClick={() => setLang('en')}
          className={`px-3 py-0.5 rounded-full text-xs font-bold transition-all ${
            lang === 'en'
              ? 'bg-ronda-teal text-white shadow'
              : 'text-white hover:text-white hover:bg-white/10'
          }`}
        >
          🇬🇧 EN
        </button>
      </div>
    </div>
  );
}
