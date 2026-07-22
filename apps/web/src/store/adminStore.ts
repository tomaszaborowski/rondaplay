import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations as defaultTranslations } from '@/translations';

// ─── Content Page (CMS) ───────────────────────────────────────────────────────
export type BlockType = 'heading' | 'subheading' | 'paragraph' | 'divider' | 'callout' | 'list';

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;   // For heading/paragraph/callout: text. For list: JSON array string.
}

export interface ContentPage {
  id: string;
  title: string;
  slug: string;               // URL-friendly identifier, e.g. "terms-and-conditions"
  status: 'draft' | 'published';
  blocks: ContentBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  titleEn?: string;
  descriptionEn?: string;
  category: 'logic' | 'memory' | 'speed';
  minPlayers: number;
  maxPlayers: number;
  isPremium: boolean;
  status: 'active' | 'draft';
  emoji: string;
  coverImage?: string;
  logoUrl?: string;
  variables?: string; // JSON string for game settings
}
export interface AdminUser {
  id: string;
  email: string;
  password?: string;
  role: 'superadmin' | 'moderator' | 'admin';
  createdAt: string;
}

export interface AvatarImage {
  id: string;
  url: string;
  characterName: string;
}

export interface User {
  id: string;
  email: string;
  joinDate: string;
  isPremium: boolean;
  premiumSource: 'web' | 'app' | null;
  totalSessions: number;
  status: 'active' | 'banned';
}

export interface Transaction {
  id: string;
  userId: string;
  email: string;
  amount: number;
  platform: 'Stripe' | 'Apple';
  status: 'completed' | 'failed';
  timestamp: string;
}

export interface AdminSettings {
  appName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  googleAnalyticsId: string;
  instagramUrl: string;
}

// Live site copy — editable from the Admin Translations page
export type SiteTranslations = {
  es: Record<string, string>;
  en: Record<string, string>;
};

interface AdminState {
  // Auth
  isLoggedIn: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;

  // Admin User management
  adminUsers: AdminUser[];
  addAdminUser: (email: string, password: string, role: AdminUser['role']) => void;
  deleteAdminUser: (id: string) => void;

  // Avatars management
  avatars: AvatarImage[];
  addAvatar: (url: string, characterName: string) => void;
  deleteAvatar: (id: string) => void;
  updateAvatarName: (id: string, name: string) => void;

  // Games
  games: Game[];
  addGame: (game: Omit<Game, 'id'>) => void;
  updateGame: (id: string, updated: Partial<Game>) => void;
  togglePremiumGame: (id: string) => void;
  deleteGame: (id: string) => void;
  resetGamesToDefaults: () => void;

  // Users
  users: User[];
  togglePremiumUser: (id: string) => void;
  toggleBanUser: (id: string) => void;

  // Transactions
  transactions: Transaction[];

  // Blocklist
  blockedTerms: string[];
  addBlockedTerm: (term: string) => void;
  removeBlockedTerm: (term: string) => void;

  // Settings
  settings: AdminSettings;
  updateSettings: (updated: Partial<AdminSettings>) => void;

  // Site Translations (editable from admin)
  siteTranslations: SiteTranslations;
  updateTranslation: (lang: 'es' | 'en', key: string, value: string) => void;
  resetTranslations: () => void;

  // Content Pages (CMS)
  pages: ContentPage[];
  addPage: (page: Omit<ContentPage, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePage: (id: string, updated: Partial<Omit<ContentPage, 'id' | 'createdAt'>>) => void;
  deletePage: (id: string) => void;
  togglePageStatus: (id: string) => void;
  addBlock: (pageId: string, block: Omit<ContentBlock, 'id'>) => void;
  updateBlock: (pageId: string, blockId: string, updated: Partial<Omit<ContentBlock, 'id'>>) => void;
  removeBlock: (pageId: string, blockId: string) => void;
  moveBlock: (pageId: string, blockId: string, direction: 'up' | 'down') => void;
  resetPagesToDefaults: () => void;
}

// Initial Default Games
const initialGames: Game[] = [
  {
    id: 'imposter',
    title: '¿Quién es el Impostor?',
    titleEn: 'Who is the Imposter?',
    description: 'Nuestro juego insignia de deducción social. Un jugador recibe una identidad secreta mientras los demás intentan descubrirlo mediante preguntas sutiles. Alta interacción cara a cara.',
    descriptionEn: 'Our flagship social deduction game. One player receives a secret identity while the rest try to identify them through subtle questioning. High interaction, zero screen staring.',
    category: 'logic',
    minPlayers: 3,
    maxPlayers: 8,
    isPremium: false,
    status: 'active',
    emoji: '🕵️‍♀️',
    coverImage: '/images/imposter-logo.png',
    logoUrl: '/images/imposter-logo.png',
    variables: JSON.stringify({
      topics: ['Animales Salvajes', 'Gastronomía', 'Ciudades del Mundo', 'Deportes'],
      timeLimit: 120,
      imposterCount: 1
    }, null, 2)
  },
  {
    id: 'pattern-path',
    title: 'Camino de Patrones',
    titleEn: 'Pattern Path',
    description: 'Un juego cooperativo de memoria visual. El dispositivo muestra una secuencia de colores y sonidos. Pasa el teléfono y recreen el patrón juntos.',
    descriptionEn: 'A cooperative memory game. The device shows a path of colors and sounds. Pass the phone and recreate the sequence together. Great for cognitive bonding.',
    category: 'memory',
    minPlayers: 2,
    maxPlayers: 4,
    isPremium: true,
    status: 'active',
    emoji: '🧠',
    variables: JSON.stringify({
      startingLength: 3,
      speedIncrease: 0.1,
      lives: 3
    }, null, 2)
  },
  {
    id: 'reaction-rush',
    title: 'Reacción Veloz',
    titleEn: 'Reaction Rush',
    description: 'Pon el teléfono plano sobre la mesa. Cuando tu color parpadee, sé el primero en tocar tu esquina de la pantalla. Rápido, caótico y divertido.',
    descriptionEn: 'Put the phone flat on the table. When your color flashes, be the first to tap your corner of the screen. Fast, chaotic, and incredibly fun for kids.',
    category: 'speed',
    minPlayers: 2,
    maxPlayers: 6,
    isPremium: false,
    status: 'active',
    emoji: '⚡',
    variables: JSON.stringify({
      rounds: 5,
      randomDelayMax: 4000,
      penaltyForFalseStart: true
    }, null, 2)
  },
  {
    id: 'speed-match',
    title: 'Encuentro Veloz (Dobble P2P)',
    titleEn: 'Speed Match (Dobble P2P)',
    description: 'El clásico juego de emparejar. ¡Conéctate por WebRTC y sé el primero en encontrar el símbolo coincidente entre tu carta y la del centro!',
    descriptionEn: 'The classic matching game. Connect via serverless WebRTC and be the first to find the matching symbol between your card and the center card!',
    category: 'speed',
    minPlayers: 1,
    maxPlayers: 2,
    isPremium: false,
    status: 'active',
    emoji: '🃏',
    variables: JSON.stringify({
      cardsPerDeck: 31,
      symbolsPerCard: 6
    }, null, 2)
  }
];

// Initial Mock Users
const initialUsers: User[] = [
  { id: 'usr-1', email: 'papa.jones@gmail.com', joinDate: '2026-06-12', isPremium: true, premiumSource: 'web', totalSessions: 42, status: 'active' },
  { id: 'usr-2', email: 'mama.clara@outlook.com', joinDate: '2026-06-15', isPremium: true, premiumSource: 'app', totalSessions: 38, status: 'active' },
  { id: 'usr-3', email: 'alex.smith@yahoo.com', joinDate: '2026-06-18', isPremium: false, premiumSource: null, totalSessions: 5, status: 'active' },
  { id: 'usr-4', email: 'granny.marian@gmail.com', joinDate: '2026-06-20', isPremium: true, premiumSource: 'web', totalSessions: 61, status: 'active' },
  { id: 'usr-5', email: 'coolkid99@gmail.com', joinDate: '2026-06-22', isPremium: false, premiumSource: null, totalSessions: 12, status: 'active' },
  { id: 'usr-6', email: 'trollface@tempmail.com', joinDate: '2026-06-25', isPremium: false, premiumSource: null, totalSessions: 2, status: 'banned' },
  { id: 'usr-7', email: 'diego.marquez@gmail.com', joinDate: '2026-06-28', isPremium: true, premiumSource: 'web', totalSessions: 22, status: 'active' },
  { id: 'usr-8', email: 'lucia.santos@gmail.com', joinDate: '2026-07-01', isPremium: true, premiumSource: 'app', totalSessions: 19, status: 'active' },
  { id: 'usr-9', email: 'sarah.connor@gmail.com', joinDate: '2026-07-03', isPremium: false, premiumSource: null, totalSessions: 8, status: 'active' },
  { id: 'usr-10', email: 'peter.parker@outlook.com', joinDate: '2026-07-05', isPremium: true, premiumSource: 'web', totalSessions: 27, status: 'active' },
  { id: 'usr-11', email: 'bruce.wayne@waynecorp.com', joinDate: '2026-07-06', isPremium: true, premiumSource: 'web', totalSessions: 105, status: 'active' },
  { id: 'usr-12', email: 'clark.kent@dailyplanet.com', joinDate: '2026-07-07', isPremium: false, premiumSource: null, totalSessions: 14, status: 'active' },
  { id: 'usr-13', email: 'tony.stark@starkindustries.com', joinDate: '2026-07-08', isPremium: true, premiumSource: 'app', totalSessions: 94, status: 'active' },
  { id: 'usr-14', email: 'wade.wilson@deadpool.com', joinDate: '2026-07-09', isPremium: false, premiumSource: null, totalSessions: 1, status: 'active' },
  { id: 'usr-15', email: 'steve.rogers@shield.gov', joinDate: '2026-07-10', isPremium: true, premiumSource: 'web', totalSessions: 55, status: 'active' }
];

// Initial Mock Transactions
const initialTransactions: Transaction[] = [
  { id: 'tx-1', userId: 'usr-1', email: 'papa.jones@gmail.com', amount: 14.99, platform: 'Stripe', status: 'completed', timestamp: '2026-06-12 14:32' },
  { id: 'tx-2', userId: 'usr-2', email: 'mama.clara@outlook.com', amount: 14.99, platform: 'Apple', status: 'completed', timestamp: '2026-06-15 09:12' },
  { id: 'tx-3', userId: 'usr-4', email: 'granny.marian@gmail.com', amount: 14.99, platform: 'Stripe', status: 'completed', timestamp: '2026-06-20 18:45' },
  { id: 'tx-4', userId: 'usr-7', email: 'diego.marquez@gmail.com', amount: 14.99, platform: 'Stripe', status: 'completed', timestamp: '2026-06-28 21:05' },
  { id: 'tx-5', userId: 'usr-8', email: 'lucia.santos@gmail.com', amount: 14.99, platform: 'Apple', status: 'completed', timestamp: '2026-07-01 11:22' },
  { id: 'tx-6', userId: 'usr-6', email: 'trollface@tempmail.com', amount: 14.99, platform: 'Stripe', status: 'failed', timestamp: '2026-06-25 15:40' },
  { id: 'tx-7', userId: 'usr-10', email: 'peter.parker@outlook.com', amount: 14.99, platform: 'Stripe', status: 'completed', timestamp: '2026-07-05 13:10' },
  { id: 'tx-8', userId: 'usr-11', email: 'bruce.wayne@waynecorp.com', amount: 14.99, platform: 'Stripe', status: 'completed', timestamp: '2026-07-06 00:05' },
  { id: 'tx-9', userId: 'usr-13', email: 'tony.stark@starkindustries.com', amount: 14.99, platform: 'Apple', status: 'completed', timestamp: '2026-07-08 17:50' },
  { id: 'tx-10', userId: 'usr-15', email: 'steve.rogers@shield.gov', amount: 14.99, platform: 'Stripe', status: 'completed', timestamp: '2026-07-10 10:15' }
];

// Initial Blocked Terms
const initialBlockedTerms: string[] = [
  'offensive', 'spam', 'nasty', 'scam', 'abuse', 'cheat', 'idiot', 'jerk'
];

// Initial Content Pages
const initialPages: ContentPage[] = [
  {
    id: 'page-terms',
    title: 'Términos y Condiciones',
    slug: 'terminos-y-condiciones',
    status: 'published',
    createdAt: '2026-07-11',
    updatedAt: '2026-07-11',
    blocks: [
      { id: 'b1', type: 'heading', content: 'Términos y Condiciones de Ronda Play' },
      { id: 'b2', type: 'paragraph', content: 'Última actualización: 11 de julio de 2026.' },
      { id: 'b3', type: 'paragraph', content: 'Al acceder y utilizar Ronda Play, aceptas estar sujeto a estos Términos y Condiciones. Por favor, léelos detenidamente antes de usar nuestra plataforma.' },
      { id: 'b4', type: 'subheading', content: '1. Uso del Servicio' },
      { id: 'b5', type: 'paragraph', content: 'Ronda Play es una plataforma de juegos familiares diseñada para ser utilizada en entornos seguros. Te comprometes a no utilizar el servicio para fines ilegales o no autorizados.' },
      { id: 'b6', type: 'subheading', content: '2. Cuentas de Usuario' },
      { id: 'b7', type: 'paragraph', content: 'Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Notifícanos inmediatamente si sospechas de cualquier uso no autorizado.' },
      { id: 'b8', type: 'divider', content: '' },
      { id: 'b9', type: 'callout', content: '¿Tienes preguntas sobre estos términos? Contáctanos en support@rondaplay.com' },
    ]
  },
  {
    id: 'page-privacy',
    title: 'Política de Privacidad',
    slug: 'politica-de-privacidad',
    status: 'published',
    createdAt: '2026-07-11',
    updatedAt: '2026-07-11',
    blocks: [
      { id: 'p1', type: 'heading', content: 'Política de Privacidad' },
      { id: 'p2', type: 'paragraph', content: 'En Ronda Play, nos tomamos tu privacidad muy en serio. Esta política describe cómo recopilamos, usamos y protegemos tu información personal.' },
      { id: 'p3', type: 'subheading', content: 'Datos que recopilamos' },
      { id: 'p4', type: 'list', content: JSON.stringify(['Dirección de correo electrónico', 'Información de pago (gestionada por Stripe)', 'Estadísticas de uso y sesión']) },
      { id: 'p5', type: 'callout', content: 'Nunca vendemos tus datos a terceros.' },
    ]
  }
];

const initialAdminUsers: AdminUser[] = [
  { id: 'adm-1', email: 'admin@rondaplay.com', password: 'To61845910*', role: 'superadmin', createdAt: '2026-07-20' },
  { id: 'adm-2', email: 'moderator@rondaplay.com', password: 'admin', role: 'moderator', createdAt: '2026-07-21' }
];

const initialAvatars: AvatarImage[] = [
  { id: 'av-1', url: '/avatars/avatar-detective.png', characterName: 'El Impostor' },
  { id: 'av-2', url: '/avatars/avatar-purple.png', characterName: 'Alex Vortex' },
  { id: 'av-3', url: '/avatars/avatar-blue-suit.png', characterName: 'Drift King' },
  { id: 'av-4', url: '/avatars/avatar-pink-granny.png', characterName: 'Pixel Queen' },
  { id: 'av-5', url: '/avatars/avatar-girl.png', characterName: 'Speed Star' }
];

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      // Auth
      isLoggedIn: false,
      login: (email, password) => {
        let success = false;
        set((state) => {
          const found = state.adminUsers?.find(
            (adm) => adm.email.toLowerCase() === email.trim().toLowerCase()
          );
          if (found && found.password === password) {
            success = true;
            return { isLoggedIn: true };
          }
          return {};
        });
        return success;
      },
      logout: () => set({ isLoggedIn: false }),

      // Admin User management
      adminUsers: initialAdminUsers,
      addAdminUser: (email, password, role) => set((state) => ({
        adminUsers: [
          ...state.adminUsers,
          {
            id: `adm-${Date.now()}`,
            email: email.trim().toLowerCase(),
            password,
            role,
            createdAt: new Date().toISOString().split('T')[0]
          }
        ]
      })),
      deleteAdminUser: (id) => set((state) => ({
        adminUsers: state.adminUsers.filter((adm) => adm.id !== id)
      })),

      // Avatars management
      avatars: initialAvatars,
      addAvatar: (url, characterName) => set((state) => ({
        avatars: [
          ...state.avatars,
          {
            id: `av-${Date.now()}`,
            url,
            characterName
          }
        ]
      })),
      deleteAvatar: (id) => set((state) => ({
        avatars: state.avatars.filter((av) => av.id !== id)
      })),
      updateAvatarName: (id, name) => set((state) => ({
        avatars: state.avatars.map((av) => av.id === id ? { ...av, characterName: name } : av)
      })),

      // Games CRUD
      games: initialGames,
      addGame: (newGame) => set((state) => {
        const id = `game-${Date.now()}`;
        const slug = id;
        const nextSiteTranslations = {
          es: { ...state.siteTranslations.es },
          en: { ...state.siteTranslations.en },
        };
        if (newGame.title) {
          nextSiteTranslations.es[`game.${slug}.title`] = newGame.title;
          nextSiteTranslations.en[`game.${slug}.title`] = newGame.titleEn || newGame.title;
        }
        if (newGame.description) {
          nextSiteTranslations.es[`game.${slug}.desc`] = newGame.description;
          nextSiteTranslations.en[`game.${slug}.desc`] = newGame.descriptionEn || newGame.description;
        }
        return {
          games: [...state.games, { ...newGame, id: slug }],
          siteTranslations: nextSiteTranslations,
        };
      }),
      updateGame: (id, updated) => set((state) => {
        const nextSiteTranslations = {
          es: { ...state.siteTranslations.es },
          en: { ...state.siteTranslations.en },
        };
        if (updated.title) {
          nextSiteTranslations.es[`game.${id}.title`] = updated.title;
          if (updated.titleEn) {
            nextSiteTranslations.en[`game.${id}.title`] = updated.titleEn;
          }
        }
        if (updated.description) {
          nextSiteTranslations.es[`game.${id}.desc`] = updated.description;
          if (updated.descriptionEn) {
            nextSiteTranslations.en[`game.${id}.desc`] = updated.descriptionEn;
          }
        }
        return {
          games: state.games.map((g) => g.id === id ? { ...g, ...updated } : g),
          siteTranslations: nextSiteTranslations,
        };
      }),
      togglePremiumGame: (id) => set((state) => ({
        games: state.games.map((g) => g.id === id ? { ...g, isPremium: !g.isPremium } : g)
      })),
      deleteGame: (id) => set((state) => ({
        games: state.games.filter((g) => g.id !== id)
      })),
      resetGamesToDefaults: () => set((state) => {
        const nextSiteTranslations = {
          es: { ...state.siteTranslations.es },
          en: { ...state.siteTranslations.en },
        };
        initialGames.forEach((g) => {
          nextSiteTranslations.es[`game.${g.id}.title`] = g.title;
          nextSiteTranslations.es[`game.${g.id}.desc`] = g.description;
          if (g.titleEn) nextSiteTranslations.en[`game.${g.id}.title`] = g.titleEn;
          if (g.descriptionEn) nextSiteTranslations.en[`game.${g.id}.desc`] = g.descriptionEn;
        });
        return {
          games: initialGames,
          siteTranslations: nextSiteTranslations
        };
      }),

      // Users Management
      users: initialUsers,
      togglePremiumUser: (id) => set((state) => {
        const updatedUsers: User[] = state.users.map((u) => {
          if (u.id === id) {
            const isPremium = !u.isPremium;
            return {
              ...u,
              isPremium,
              premiumSource: isPremium ? ('web' as const) : null
            };
          }
          return u;
        });

        // Also insert a mock transaction if premium is granted
        const targetUser = state.users.find((u) => u.id === id);
        let updatedTransactions = state.transactions;
        if (targetUser && !targetUser.isPremium) {
          const newTx: Transaction = {
            id: `tx-${Date.now()}`,
            userId: id,
            email: targetUser.email,
            amount: 14.99,
            platform: 'Stripe',
            status: 'completed',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
          updatedTransactions = [newTx, ...state.transactions];
        }

        return {
          users: updatedUsers,
          transactions: updatedTransactions
        };
      }),
      toggleBanUser: (id) => set((state) => ({
        users: state.users.map((u) => u.id === id ? { ...u, status: u.status === 'active' ? 'banned' : 'active' } : u)
      })),

      // Transactions
      transactions: initialTransactions,

      // Content Moderation
      blockedTerms: initialBlockedTerms,
      addBlockedTerm: (term) => set((state) => {
        const normalized = term.trim().toLowerCase();
        if (normalized && !state.blockedTerms.includes(normalized)) {
          return { blockedTerms: [...state.blockedTerms, normalized] };
        }
        return {};
      }),
      removeBlockedTerm: (term) => set((state) => ({
        blockedTerms: state.blockedTerms.filter((t) => t !== term.toLowerCase())
      })),

      // Settings
      settings: {
        appName: 'Ronda Play',
        supportEmail: 'support@rondaplay.com',
        maintenanceMode: false,
        googleAnalyticsId: 'G-74X9VPE89B',
        instagramUrl: 'https://instagram.com/rondaplay'
      },
      updateSettings: (updated) => set((state) => ({
        settings: { ...state.settings, ...updated }
      })),

      // Site Translations — seeded from static defaults, editable from Admin
      siteTranslations: (() => {
        const es: Record<string, string> = {};
        const en: Record<string, string> = {};
        for (const [key, val] of Object.entries(defaultTranslations)) {
          es[key] = val.es;
          en[key] = val.en;
        }
        return { es, en };
      })(),
      updateTranslation: (lang, key, value) => set((state) => ({
        siteTranslations: {
          ...state.siteTranslations,
          [lang]: { ...state.siteTranslations[lang], [key]: value }
        }
      })),
      resetTranslations: () => set(() => {
        const es: Record<string, string> = {};
        const en: Record<string, string> = {};
        for (const [key, val] of Object.entries(defaultTranslations)) {
          es[key] = val.es;
          en[key] = val.en;
        }
        return { siteTranslations: { es, en } };
      }),

      // Content Pages CRUD
      pages: initialPages,
      resetPagesToDefaults: () => set({ pages: initialPages }),

      addPage: (page) => set((state) => ({
        pages: [
          ...state.pages,
          {
            ...page,
            id: `page-${Date.now()}`,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
          }
        ]
      })),

      updatePage: (id, updated) => set((state) => ({
        pages: state.pages.map((p) =>
          p.id === id
            ? { ...p, ...updated, updatedAt: new Date().toISOString().split('T')[0] }
            : p
        )
      })),

      deletePage: (id) => set((state) => ({
        pages: state.pages.filter((p) => p.id !== id)
      })),

      togglePageStatus: (id) => set((state) => ({
        pages: state.pages.map((p) =>
          p.id === id
            ? { ...p, status: p.status === 'published' ? 'draft' : 'published', updatedAt: new Date().toISOString().split('T')[0] }
            : p
        )
      })),

      addBlock: (pageId, block) => set((state) => ({
        pages: state.pages.map((p) =>
          p.id === pageId
            ? {
                ...p,
                blocks: [...p.blocks, { ...block, id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }],
                updatedAt: new Date().toISOString().split('T')[0],
              }
            : p
        )
      })),

      updateBlock: (pageId, blockId, updated) => set((state) => ({
        pages: state.pages.map((p) =>
          p.id === pageId
            ? {
                ...p,
                blocks: p.blocks.map((b) => b.id === blockId ? { ...b, ...updated } : b),
                updatedAt: new Date().toISOString().split('T')[0],
              }
            : p
        )
      })),

      removeBlock: (pageId, blockId) => set((state) => ({
        pages: state.pages.map((p) =>
          p.id === pageId
            ? {
                ...p,
                blocks: p.blocks.filter((b) => b.id !== blockId),
                updatedAt: new Date().toISOString().split('T')[0],
              }
            : p
        )
      })),

      moveBlock: (pageId, blockId, direction) => set((state) => ({
        pages: state.pages.map((p) => {
          if (p.id !== pageId) return p;
          const idx = p.blocks.findIndex((b) => b.id === blockId);
          if (idx === -1) return p;
          const newBlocks = [...p.blocks];
          const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
          if (targetIdx < 0 || targetIdx >= newBlocks.length) return p;
          [newBlocks[idx], newBlocks[targetIdx]] = [newBlocks[targetIdx], newBlocks[idx]];
          return { ...p, blocks: newBlocks, updatedAt: new Date().toISOString().split('T')[0] };
        })
      })),
    }),
    {
      name: 'rondaplay_admin_store',
    }
  )
);


