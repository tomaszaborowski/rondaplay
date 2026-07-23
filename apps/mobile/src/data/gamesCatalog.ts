export interface MobileGame {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  category: 'logic' | 'memory' | 'speed' | 'party';
  minPlayers: number;
  maxPlayers: number;
  emoji: string;
  color: string;
  isPremium: boolean;
}

export const GAMES_CATALOG: MobileGame[] = [
  {
    id: 'quien-soy',
    title: '¿Quién Soy? (Charadas)',
    titleEn: 'Who Am I? (Charades)',
    description: '¡El clásico juego de adivinanzas bilingüe para toda la familia! Ponte el teléfono en la frente e inclina para acertar o pasar.',
    descriptionEn: 'The classic bilingual guessing charades game! Place phone on your forehead and tilt to guess or pass.',
    category: 'party',
    minPlayers: 2,
    maxPlayers: 8,
    emoji: '🎭',
    color: '#006a61',
    isPremium: false,
  },
  {
    id: 'imposter',
    title: '¿Quién es el Impostor?',
    titleEn: 'Who is the Imposter?',
    description: 'Juego de deducción social cara a cara. Un jugador recibe una identidad secreta de impostor mientras los demás descubren la verdad.',
    descriptionEn: 'Face-to-face social deduction game. One player receives a secret imposter role while others discover the truth.',
    category: 'logic',
    minPlayers: 3,
    maxPlayers: 8,
    emoji: '🕵️‍♂️',
    color: '#2c0247',
    isPremium: false,
  },
  {
    id: 'speed-match',
    title: 'Encuentro Veloz (Dobble)',
    titleEn: 'Speed Match (Dobble)',
    description: 'Juego de reacción rápida y agilidad visual. Encuentra el símbolo coincidente entre tu carta y el centro antes que tus rivales.',
    descriptionEn: 'Fast visual reaction game. Find the matching symbol between your card and the center card first.',
    category: 'speed',
    minPlayers: 1,
    maxPlayers: 4,
    emoji: '🃏',
    color: '#d95a82',
    isPremium: false,
  },
  {
    id: 'pattern-path',
    title: 'Camino de Patrones',
    titleEn: 'Pattern Path',
    description: 'Juego cooperativo de memoria auditiva y visual. Recreen juntos la secuencia de colores y sonidos pasando el teléfono.',
    descriptionEn: 'Cooperative memory game. Recreate the path of colors and sounds together by passing the phone.',
    category: 'memory',
    minPlayers: 2,
    maxPlayers: 4,
    emoji: '🧠',
    color: '#764d91',
    isPremium: true,
  },
];
