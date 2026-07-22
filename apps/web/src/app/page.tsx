"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { GameCard } from '@/components/GameCard';
import { useLanguage } from '@/context/LanguageContext';
import { useAdminStore } from '@/store/adminStore';
import { Footer } from '@/components/Footer';

export default function Home() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cmsGames = useAdminStore((state) => state.games);
  const featuredGames = mounted ? cmsGames.filter((g) => g.status === 'active').slice(0, 3) : [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section — push below TopBanner (36px) + Navbar (~64px) */}
      <header className="hero-gradient min-h-screen flex items-center relative overflow-hidden pt-28">
        {/* Decorative background elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-ronda-teal rounded-full mix-blend-screen filter blur-2xl opacity-50 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-ronda-pink rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 py-12 md:py-24">
          <div className="text-left text-white space-y-8">
            <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 text-sm font-bold tracking-wide uppercase select-none">
              {t('hero.badge')}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] drop-shadow-lg text-balance">
              {t('hero.h1a')} <span className="text-ronda-teal drop-shadow-none">{t('hero.h1b')}</span><br />
              {t('hero.h1c')}
            </h1>
            <p className="text-lg md:text-xl font-body text-white/90 max-w-lg leading-relaxed">
              {t('hero.desc')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/library">
                <Button variant="primary" className="px-8 py-4 text-lg w-full sm:w-auto">
                  {t('hero.cta.play')}
                </Button>
              </Link>
              <a href="#about">
                <Button variant="outline" className="px-8 py-4 text-lg w-full sm:w-auto border-2 border-white/50 text-white">
                  {t('hero.cta.how')}
                </Button>
              </a>
            </div>
          </div>

          {/* Logo Display Area */}
          <div className="flex justify-center lg:justify-end relative">
            <div className="absolute inset-0 bg-white/10 blob-shape filter blur-xl animate-float"></div>
            <Image
              src="/logo.png"
              alt="Ronda Play Logo"
              width={500}
              height={300}
              priority
              className="w-full max-w-md lg:max-w-lg relative z-10 animate-float drop-shadow-2xl"
              style={{ animationDuration: '6s' }}
            />
          </div>
        </div>

        {/* Custom SVG Wave for smooth transition */}
        <div className="absolute bottom-0 w-full leading-none z-20">
          <svg className="block w-full h-16 md:h-24" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,64L80,74.7C160,85,320,107,480,101.3C640,96,800,64,960,48C1120,32,1280,32,1360,32L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="#F9FAFB"></path>
          </svg>
        </div>
      </header>

      {/* About Section */}
      <section id="about" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-ronda-purple text-4xl md:text-5xl font-bold mb-6">{t('about.h2')}</h2>
            <p className="text-ronda-slate font-body text-lg">{t('about.desc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GlassCard className="text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 mx-auto bg-ronda-pink/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-4xl">🍽️</span>
              </div>
              <h3 className="text-2xl font-bold text-ronda-purple mb-3">{t('about.card1.title')}</h3>
              <p className="font-body text-ronda-slate/80">{t('about.card1.desc')}</p>
            </GlassCard>

            <GlassCard className="text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 mx-auto bg-ronda-teal/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-4xl">🏥</span>
              </div>
              <h3 className="text-2xl font-bold text-ronda-purple mb-3">{t('about.card2.title')}</h3>
              <p className="font-body text-ronda-slate/80">{t('about.card2.desc')}</p>
            </GlassCard>

            <GlassCard className="text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-4xl">✈️</span>
              </div>
              <h3 className="text-2xl font-bold text-ronda-purple mb-3">{t('about.card3.title')}</h3>
              <p className="font-body text-ronda-slate/80">{t('about.card3.desc')}</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section id="games" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute -right-20 top-20 w-64 h-64 border-[10px] border-ronda-teal/20 rounded-full"></div>
        <div className="absolute -left-20 bottom-20 w-48 h-48 bg-ronda-pink/10 blob-shape"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="text-ronda-teal font-semibold text-sm mb-2 block">{t('games.eyebrow')}</span>
              <h2 className="text-ronda-purple text-4xl md:text-5xl font-bold text-balance">{t('games.h2')}</h2>
            </div>
            <Link href="/library">
              <Button variant="primary">{t('games.viewAll')}</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredGames.map((game) => (
              <GameCard
                key={game.id}
                title={game.title}
                titleEn={game.titleEn}
                description={game.description}
                descriptionEn={game.descriptionEn}
                players={`${game.minPlayers}-${game.maxPlayers} Jugadores`}
                type={game.category}
                emoji={game.emoji}
                slug={game.id}
                coverImage={game.coverImage}
                logoUrl={game.logoUrl}
                isPremium={game.isPremium}
                url={game.url}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Generational Section */}
      <section id="audience" className="py-24 bg-ronda-purple text-white relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-ronda-pink">{t('gen.h2')}</h2>
            <p
              className="text-lg font-body text-white/90 mb-8 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: t('gen.desc') }}
            />
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-ronda-teal flex items-center justify-center font-bold text-white mt-1">✓</div>
                <div>
                  <h4 className="text-xl font-bold mb-1">{t('gen.li1.title')}</h4>
                  <p className="text-white/70 font-body text-sm">{t('gen.li1.desc')}</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-ronda-teal flex items-center justify-center font-bold text-white mt-1">✓</div>
                <div>
                  <h4 className="text-xl font-bold mb-1">{t('gen.li2.title')}</h4>
                  <p className="text-white/70 font-body text-sm">{t('gen.li2.desc')}</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-ronda-teal flex items-center justify-center font-bold text-white mt-1">✓</div>
                <div>
                  <h4 className="text-xl font-bold mb-1">{t('gen.li3.title')}</h4>
                  <p className="text-white/70 font-body text-sm">{t('gen.li3.desc')}</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="relative flex justify-center">
            <div className="w-full max-w-md aspect-square bg-gradient-to-tr from-ronda-pink to-ronda-teal rounded-full flex items-center justify-center p-8 shadow-2xl relative">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full"></div>
              <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm relative z-10 transform rotate-3">
                <div className="text-center">
                  <span className="text-5xl block mb-4">👴 👩 👧 👦</span>
                  <h3 className="text-2xl font-bold text-ronda-purple mb-2">{t('gen.ages')}</h3>
                  <p className="text-ronda-slate font-body text-sm">{t('gen.tagline')}</p>
                  <Link href="/library">
                    <Button variant="primary" className="w-full py-4 mt-6 text-lg">
                      {t('gen.cta')}
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-xl animate-pulse">⭐</div>
              <div className="absolute -bottom-6 left-10 w-16 h-16 bg-ronda-teal rounded-xl border-4 border-white shadow-lg flex items-center justify-center text-2xl transform rotate-12 animate-float">🎲</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to play CTA */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-bold text-ronda-purple mb-6">{t('cta.h2')}</h2>
          <p className="text-xl text-ronda-slate font-body mb-10">{t('cta.desc')}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/library" className="w-full sm:w-auto">
              <Button variant="primary" className="px-10 py-5 text-xl flex items-center justify-center gap-3 w-full">
                {t('cta.web')}
              </Button>
            </Link>
            <a href="#" className="w-full sm:w-auto">
              <Button variant="secondary" className="px-10 py-5 text-xl flex items-center justify-center gap-3 w-full">
                {t('cta.ios')}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
