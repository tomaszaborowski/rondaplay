"use client";

import React, { useState, useMemo } from 'react';
import { useAdminStore } from '@/store/adminStore';
import {
  Languages, RotateCcw, CheckCircle, Search, ChevronDown, ChevronUp
} from 'lucide-react';

// ── Section groupings for the editor ──────────────────────────────────────
const SECTIONS: { label: string; keys: string[] }[] = [
  {
    label: '🔝 Top Banner',
    keys: ['banner.instagram'],
  },
  {
    label: '🧭 Navbar',
    keys: ['nav.mission', 'nav.games', 'nav.audience', 'nav.library', 'nav.playNow'],
  },
  {
    label: '🦸 Hero Section',
    keys: ['hero.badge', 'hero.h1a', 'hero.h1b', 'hero.h1c', 'hero.desc', 'hero.cta.play', 'hero.cta.how'],
  },
  {
    label: '⏱️ About / Dead Time',
    keys: [
      'about.h2', 'about.desc',
      'about.card1.title', 'about.card1.desc',
      'about.card2.title', 'about.card2.desc',
      'about.card3.title', 'about.card3.desc',
    ],
  },
  {
    label: '🎮 Games Section',
    keys: ['games.eyebrow', 'games.h2', 'games.viewAll'],
  },
  {
    label: '🕵️ Game: ¿Quién es el Impostor?',
    keys: ['game.imposter.title', 'game.imposter.desc', 'game.imposter.players'],
  },
  {
    label: '🧠 Game: Camino de Patrones',
    keys: ['game.pattern.title', 'game.pattern.desc', 'game.pattern.players'],
  },
  {
    label: '⚡ Game: Reacción Veloz',
    keys: ['game.reaction.title', 'game.reaction.desc', 'game.reaction.players'],
  },
  {
    label: '🎡 Game: Rueda de Palabras',
    keys: ['game.wordWheel.title', 'game.wordWheel.desc', 'game.wordWheel.players'],
  },
  {
    label: '🎨 Game: Loco por los Colores',
    keys: ['game.colorBlind.title', 'game.colorBlind.desc', 'game.colorBlind.players'],
  },
  {
    label: '👥 Generational Section',
    keys: [
      'gen.h2', 'gen.desc',
      'gen.li1.title', 'gen.li1.desc',
      'gen.li2.title', 'gen.li2.desc',
      'gen.li3.title', 'gen.li3.desc',
      'gen.ages', 'gen.tagline', 'gen.cta',
    ],
  },
  {
    label: '📣 Call to Action',
    keys: ['cta.h2', 'cta.desc', 'cta.web', 'cta.ios'],
  },
  {
    label: '🦶 Footer',
    keys: ['footer.copy', 'footer.privacy', 'footer.terms', 'footer.contact'],
  },
  {
    label: '📚 Library Page',
    keys: ['lib.h1', 'lib.desc', 'lib.search', 'lib.filter.all', 'lib.filter.logic', 'lib.filter.mem', 'lib.filter.speed', 'lib.empty', 'lib.cta.desc', 'lib.cta.btn'],
  },
  {
    label: '🏷️ Badges & Buttons',
    keys: ['badge.free', 'badge.premium', 'badge.logic', 'badge.memory', 'badge.speed', 'badge.play', 'badge.locked'],
  },
  {
    label: '🎲 Game: ¿Quién es el Impostor? (In-Game UI)',
    keys: [
      'imposter.setup.title', 'imposter.setup.add', 'imposter.setup.placeholder',
      'imposter.setup.imposters', 'imposter.setup.startBtn', 'imposter.setup.minPlayers',
      'imposter.reveal.title', 'imposter.reveal.youAre', 'imposter.reveal.imposter',
      'imposter.reveal.citizen', 'imposter.reveal.yourWord', 'imposter.reveal.secretWord',
      'imposter.reveal.tapReveal', 'imposter.reveal.next',
      'imposter.vote.title', 'imposter.vote.casting', 'imposter.vote.submitVote', 'imposter.vote.tally',
      'imposter.result.impostersWin', 'imposter.result.citizensWin', 'imposter.result.wereImposters',
      'imposter.result.playAgain',
    ],
  },
];

function TranslationRow({
  tKey,
  es,
  en,
  onChangeEs,
  onChangeEn,
}: {
  tKey: string;
  es: string;
  en: string;
  onChangeEs: (v: string) => void;
  onChangeEn: (v: string) => void;
}) {
  const isLong = es.length > 80 || en.length > 80;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_1fr] gap-2 items-start py-3 border-b border-slate-50 last:border-0">
      {/* Key label */}
      <div className="flex items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide break-all font-mono bg-slate-50 px-2 py-1 rounded-lg">
          {tKey}
        </span>
      </div>

      {/* ES input */}
      <div className="relative">
        <span className="absolute left-2 top-1.5 text-[9px] font-extrabold text-ronda-pink uppercase">ES</span>
        {isLong ? (
          <textarea
            value={es}
            onChange={(e) => onChangeEs(e.target.value)}
            rows={3}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-100 rounded-xl text-xs text-ronda-slate focus:border-ronda-pink outline-none transition-colors resize-y font-body leading-relaxed"
          />
        ) : (
          <input
            type="text"
            value={es}
            onChange={(e) => onChangeEs(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white border border-slate-100 rounded-xl text-xs text-ronda-slate focus:border-ronda-pink outline-none transition-colors font-body"
          />
        )}
      </div>

      {/* EN input */}
      <div className="relative">
        <span className="absolute left-2 top-1.5 text-[9px] font-extrabold text-ronda-teal uppercase">EN</span>
        {isLong ? (
          <textarea
            value={en}
            onChange={(e) => onChangeEn(e.target.value)}
            rows={3}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-100 rounded-xl text-xs text-ronda-slate focus:border-ronda-teal outline-none transition-colors resize-y font-body leading-relaxed"
          />
        ) : (
          <input
            type="text"
            value={en}
            onChange={(e) => onChangeEn(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white border border-slate-100 rounded-xl text-xs text-ronda-slate focus:border-ronda-teal outline-none transition-colors font-body"
          />
        )}
      </div>
    </div>
  );
}

export default function AdminTranslationsPage() {
  const siteTranslations = useAdminStore((s) => s.siteTranslations);
  const updateTranslation = useAdminStore((s) => s.updateTranslation);
  const resetTranslations = useAdminStore((s) => s.resetTranslations);

  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const toggleSection = (label: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const handleReset = () => {
    if (confirm('Reset ALL translations to factory defaults? This cannot be undone.')) {
      resetTranslations();
      showToast('Translations reset to defaults.');
    }
  };

  const filteredSections = useMemo(() => {
    if (!search.trim()) return SECTIONS;
    const q = search.toLowerCase();
    return SECTIONS.map((section) => ({
      ...section,
      keys: section.keys.filter(
        (k) =>
          k.toLowerCase().includes(q) ||
          (siteTranslations.es[k] ?? '').toLowerCase().includes(q) ||
          (siteTranslations.en[k] ?? '').toLowerCase().includes(q)
      ),
    })).filter((s) => s.keys.length > 0);
  }, [search, siteTranslations]);

  const totalKeys = SECTIONS.reduce((acc, s) => acc + s.keys.length, 0);

  return (
    <div className="space-y-6 font-body">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl bg-ronda-teal flex items-center gap-3 z-50 text-white">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ronda-purple font-brand flex items-center gap-2">
            <Languages className="w-6 h-6 text-ronda-teal" /> Site Translations
          </h2>
          <p className="text-sm text-slate-400 mt-1 font-semibold">
            {totalKeys} strings across {SECTIONS.length} sections — changes apply instantly to the live site
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 border border-slate-200 hover:border-ronda-pink hover:text-ronda-pink transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>
      </div>

      {/* Language legend */}
      <div className="flex gap-4 text-xs font-bold">
        <span className="flex items-center gap-1.5 text-ronda-pink">
          <span className="w-3 h-3 rounded-full bg-ronda-pink inline-block" /> 🇪🇸 Spanish (ES) — Default language
        </span>
        <span className="flex items-center gap-1.5 text-ronda-teal">
          <span className="w-3 h-3 rounded-full bg-ronda-teal inline-block" /> 🇬🇧 English (EN)
        </span>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by key or text content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm text-ronda-slate outline-none focus:border-ronda-teal transition-colors shadow-sm"
        />
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {filteredSections.map((section) => {
          const isCollapsed = collapsedSections.has(section.label);
          return (
            <div key={section.label} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.label)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="font-bold text-ronda-purple text-sm">{section.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">{section.keys.length} strings</span>
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Rows */}
              {!isCollapsed && (
                <div className="px-6 pb-4">
                  {/* Column headers */}
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_1fr] gap-2 pb-2 mb-2 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Key</span>
                    <span className="text-[10px] font-bold text-ronda-pink uppercase tracking-widest hidden md:block">🇪🇸 Español</span>
                    <span className="text-[10px] font-bold text-ronda-teal uppercase tracking-widest hidden md:block">🇬🇧 English</span>
                  </div>
                  {section.keys.map((key) => (
                    <TranslationRow
                      key={key}
                      tKey={key}
                      es={siteTranslations.es[key] ?? ''}
                      en={siteTranslations.en[key] ?? ''}
                      onChangeEs={(v) => {
                        updateTranslation('es', key, v);
                        showToast(`Saved: ${key} [ES]`);
                      }}
                      onChangeEn={(v) => {
                        updateTranslation('en', key, v);
                        showToast(`Saved: ${key} [EN]`);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
