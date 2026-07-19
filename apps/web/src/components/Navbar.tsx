"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from './Button';
import { useLanguage } from '@/context/LanguageContext';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const { t } = useLanguage();


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const getLinkHref = (hash: string) => {
    return isHome ? hash : `/${hash}`;
  };

  // On non-home pages (white bg from the start) always use dark text.
  // On home page: transparent hero → white text; scrolled → dark text.
  const useDarkText = isScrolled || isOpen || !isHome;

  // Hide landing page Navbar completely on admin dashboard routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled || isOpen
            ? 'bg-white/60 backdrop-blur-md shadow-md py-2 border-b border-white/20'
            : isHome
            ? 'py-4 bg-transparent'
            : 'py-4 bg-white/60 backdrop-blur-md shadow-sm border-b border-slate-100'
        }`}
        style={{ top: '36px' }} /* offset below TopBanner */
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo with 20px padding */}
          <Link href="/" className="flex items-center gap-2 p-[20px]" onClick={() => setIsOpen(false)}>
            <Image
              src="/logo.png"
              alt="Ronda Play Logo"
              width={150}
              height={50}
              priority
              className="h-10 md:h-12 w-auto drop-shadow-md transition-transform hover:scale-105"
            />
          </Link>
          
          <div
            className={`hidden md:flex space-x-8 items-center font-semibold ${
              useDarkText ? 'text-ronda-slate' : 'text-white'
            }`}
          >
            {isHome ? (
              <>
                <a href="#about" className="hover:text-ronda-pink transition-colors">{t('nav.mission')}</a>
                <a href="#games" className="hover:text-ronda-pink transition-colors">{t('nav.games')}</a>
                <a href="#audience" className="hover:text-ronda-pink transition-colors">{t('nav.audience')}</a>
              </>
            ) : (
              <>
                <Link href="/#about" className="hover:text-ronda-pink transition-colors">{t('nav.mission')}</Link>
                <Link href="/#games" className="hover:text-ronda-pink transition-colors">{t('nav.games')}</Link>
                <Link href="/#audience" className="hover:text-ronda-pink transition-colors">{t('nav.audience')}</Link>
              </>
            )}
            <Link
              href="/library"
              className={`hover:text-ronda-pink transition-colors ${
                pathname === '/library' ? 'text-ronda-teal' : ''
              }`}
            >
              {t('nav.library')}
            </Link>
            <Link
              href="/contact"
              className={`hover:text-ronda-pink transition-colors ${
                pathname === '/contact' ? 'text-ronda-teal' : ''
              }`}
            >
              {t('nav.contact') || 'Contact'}
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/library" className="hidden sm:inline-block">
              <Button variant="secondary" className="px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider">
                {t('nav.playNow')}
              </Button>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 focus:outline-none z-50 relative"
              aria-label="Toggle Menu"
            >
              <span
                className={`block w-6 h-0.5 rounded-full transition-transform duration-300 ${
                  useDarkText ? 'bg-ronda-slate' : 'bg-white'
                } ${isOpen ? 'rotate-45 translate-y-2' : ''}`}
              ></span>
              <span
                className={`block w-6 h-0.5 rounded-full transition-opacity duration-300 ${
                  useDarkText ? 'bg-ronda-slate' : 'bg-white'
                } ${isOpen ? 'opacity-0' : ''}`}
              ></span>
              <span
                className={`block w-6 h-0.5 rounded-full transition-transform duration-300 ${
                  useDarkText ? 'bg-ronda-slate' : 'bg-white'
                } ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}
              ></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-white/98 backdrop-blur-xl z-40 flex flex-col items-center justify-center space-y-8 text-2xl font-bold text-ronda-slate md:hidden animate-fade-in">
          <Link href={getLinkHref('#about')} onClick={() => setIsOpen(false)} className="hover:text-ronda-pink transition-colors">{t('nav.mission')}</Link>
          <Link href={getLinkHref('#games')} onClick={() => setIsOpen(false)} className="hover:text-ronda-pink transition-colors">{t('nav.games')}</Link>
          <Link href={getLinkHref('#audience')} onClick={() => setIsOpen(false)} className="hover:text-ronda-pink transition-colors">{t('nav.audience')}</Link>
          <Link href="/library" onClick={() => setIsOpen(false)} className="hover:text-ronda-pink transition-colors">{t('nav.library')}</Link>
          <Link href="/contact" onClick={() => setIsOpen(false)} className="hover:text-ronda-pink transition-colors">{t('nav.contact') || 'Contact'}</Link>
          <Link href="/library" onClick={() => setIsOpen(false)}>
            <Button variant="primary" className="px-8 py-3.5 text-base">
              {t('nav.playNow')}
            </Button>
          </Link>
        </div>
      )}
    </>
  );
};
