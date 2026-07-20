"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-ronda-slate text-white/60 py-12 border-t-8 border-ronda-teal">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Ronda Play Logo"
            width={120}
            height={40}
            className="h-8 md:h-10 w-auto opacity-90 hover:opacity-100 transition-opacity"
          />
        </Link>
        <div className="text-sm font-body">{t('footer.copy')}</div>
        <div className="flex gap-6 text-sm font-body font-semibold">
          <Link
            href="/pages/politica-de-privacidad"
            className="hover:text-white transition-colors"
          >
            {t('footer.privacy')}
          </Link>
          <Link
            href="/pages/terminos-y-condiciones"
            className="hover:text-white transition-colors"
          >
            {t('footer.terms')}
          </Link>
          <Link href="/contact" className="hover:text-white transition-colors">
            {t('footer.contact')}
          </Link>
        </div>
      </div>
    </footer>
  );
};
