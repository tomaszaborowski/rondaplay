"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAdminStore } from '@/store/adminStore';
import type { ContentBlock } from '@/store/adminStore';
import { useLanguage } from '@/context/LanguageContext';
import { useParams } from 'next/navigation';

function BlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'heading':
      return (
        <h2 className="text-3xl md:text-4xl font-bold text-ronda-purple font-brand mt-10 mb-4 leading-tight">
          {block.content}
        </h2>
      );
    case 'subheading':
      return (
        <h3 className="text-xl md:text-2xl font-bold text-ronda-slate mt-8 mb-3 leading-snug">
          {block.content}
        </h3>
      );
    case 'paragraph':
      return (
        <p className="text-ronda-slate/80 font-body text-base leading-relaxed mb-4">
          {block.content}
        </p>
      );
    case 'callout':
      return (
        <div className="bg-ronda-teal/10 border-l-4 border-ronda-teal rounded-r-2xl px-6 py-4 my-6">
          <p className="text-ronda-teal font-semibold text-base leading-relaxed">
            💡 {block.content}
          </p>
        </div>
      );
    case 'divider':
      return <hr className="my-10 border-slate-200" />;
    case 'list': {
      let items: string[] = [];
      try { items = JSON.parse(block.content); } catch { items = []; }
      return (
        <ul className="list-none space-y-3 mb-6 pl-0">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-ronda-slate/80 font-body text-base">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-ronda-teal flex items-center justify-center mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
      );
    }
    default:
      return null;
  }
}

export default function PublicPageRenderer() {
  const params = useParams();
  const slug = params.slug as string;
  const pages = useAdminStore((s) => s.pages);
  const { t } = useLanguage();

  const page = pages.find((p) => p.slug === slug && p.status === 'published');

  if (!page) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* 404 Hero */}
        <div className="hero-gradient flex-1 flex flex-col items-center justify-center text-white text-center px-6 pt-36 pb-24 min-h-[60vh]">
          <span className="text-8xl mb-8">🔍</span>
          <h1 className="text-4xl md:text-5xl font-bold font-brand mb-4">Página no encontrada</h1>
          <p className="text-lg text-white/80 font-body mb-8 max-w-md">
            Esta página no existe o no está publicada todavía.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-ronda-teal hover:bg-ronda-tealDark text-white font-bold px-8 py-4 rounded-full transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
        <footer className="bg-ronda-slate text-white/60 py-10 border-t-8 border-ronda-teal">
          <div className="max-w-7xl mx-auto px-6 text-center text-sm font-body">
            {t('footer.copy')}
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Hero */}
      <header className="hero-gradient pt-36 pb-20 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-ronda-teal rounded-full mix-blend-screen filter blur-2xl opacity-40 animate-float" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-ronda-pink rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }} />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg font-brand">
            {page.title}
          </h1>
          <p className="text-white/60 font-body text-sm mt-4">
            Última actualización: {page.updatedAt}
          </p>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 w-full leading-none z-20">
          <svg className="block w-full h-16 md:h-20" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,64L80,74.7C160,85,320,107,480,101.3C640,96,800,64,960,48C1120,32,1280,32,1360,32L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="#F9FAFB" />
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 py-16">
        <div className="max-w-3xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-400 font-semibold mb-10 font-body">
            <Link href="/" className="hover:text-ronda-teal transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-ronda-slate">{page.title}</span>
          </nav>

          {/* Content Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">
            {page.blocks.map((block) => (
              <BlockRenderer key={block.id} block={block} />
            ))}

            {page.blocks.length === 0 && (
              <p className="text-slate-400 italic text-center py-12">
                Este documento está siendo preparado. ¡Vuelve pronto!
              </p>
            )}
          </div>

          {/* Back link */}
          <div className="mt-10 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-ronda-teal hover:text-ronda-tealDark font-bold transition-colors font-body"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
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
            <Link href="/pages/politica-de-privacidad" className="hover:text-white transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link href="/pages/terminos-y-condiciones" className="hover:text-white transition-colors">
              {t('footer.terms')}
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">{t('footer.contact')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
