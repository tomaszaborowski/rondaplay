// ============================================================
//  Ronda Play — Bilingual translations (ES default / EN)
// ============================================================

export type Lang = 'es' | 'en';

type Translations = Record<string, { es: string; en: string }>;

export const translations: Translations = {
  // ── Top Banner ───────────────────────────────────────────
  'banner.instagram': { es: 'Síguenos', en: 'Follow us' },

  // ── Navbar ───────────────────────────────────────────────
  'nav.mission':   { es: 'Nuestra Misión',    en: 'Our Mission'   },
  'nav.games':     { es: 'Los Juegos',         en: 'The Games'     },
  'nav.audience':  { es: '¿Quién Juega?',      en: 'Who Plays?'    },
  'nav.library':   { es: 'Biblioteca',         en: 'Game Library'  },
  'nav.playNow':   { es: 'Jugar Ahora',        en: 'Play Now'      },

  // ── Hero ─────────────────────────────────────────────────
  'hero.badge':     { es: '📱 La Mesa Digital',              en: '📱 The Digital Tabletop'        },
  'hero.h1a':       { es: 'Redefiniendo el',                 en: 'Redefining'                     },
  'hero.h1b':       { es: '"Tiempo Muerto"',                 en: '"Dead Time"'                    },
  'hero.h1c':       { es: 'en Juego Compartido.',            en: 'as Shared Play.'                },
  'hero.desc':      {
    es: 'Transforma el tiempo de pantalla aislado en conexión familiar. Pon el móvil en el centro de la mesa y únete a todos, desde los 6 hasta los 99 años.',
    en: 'Transform isolating screen time into interactive family bonding. Put the phone in the center of the table and bring everyone together, from ages 6 to 99.'
  },
  'hero.cta.play':  { es: 'Jugar Gratis',        en: 'Start Playing Free'  },
  'hero.cta.how':   { es: 'Cómo Funciona',       en: 'See How it Works'    },

  // ── About / Dead Time ────────────────────────────────────
  'about.h2':  { es: 'Elimina el "Tiempo Muerto"', en: 'Kill the "Dead Time"' },
  'about.desc': {
    es: 'Todos vivimos esos huecos de 15 minutos en los que todos sacan su propio móvil. Ronda Play está diseñado específicamente para esos momentos, convirtiendo la espera en conexión.',
    en: 'We all experience those 15-minute gaps where everyone pulls out their own screen. Ronda Play is designed specifically for these moments, turning waiting into bonding.'
  },
  'about.card1.title': { es: 'En Restaurantes',   en: 'At Restaurants'   },
  'about.card1.desc':  {
    es: '¿Esperando la comida? Pon un móvil en el centro de la mesa y empieza una partida rápida de lógica y risas.',
    en: 'Waiting for food? Place one phone in the middle of the table and start a quick game of logic and laughs.'
  },
  'about.card2.title': { es: 'En Salas de Espera', en: 'In Waiting Rooms' },
  'about.card2.desc':  {
    es: 'Mantén a los niños entretenidos y tranquilos sin aislarlos en un vídeo. Juega en silencio con mecánicas de pasa-y-toca.',
    en: 'Keep the kids engaged and quiet without isolating them in a video. Play silently with tap-and-pass mechanics.'
  },
  'about.card3.title': { es: 'De Vacaciones',  en: 'On Holidays'  },
  'about.card3.desc':  {
    es: 'Los largos viajes en coche o las esperas en el aeropuerto se convierten en lo mejor del viaje con juegos cooperativos de memoria y velocidad.',
    en: 'Long car rides or airport layovers become the highlight of the trip with collaborative memory and speed games.'
  },

  // ── Games Section ────────────────────────────────────────
  'games.eyebrow': { es: 'Nuestro Ecosistema',           en: 'Our Ecosystem'        },
  'games.h2':      { es: 'Juegos para Cada Mente',       en: 'Games for Every Brain' },
  'games.viewAll': { es: 'Ver Biblioteca Completa',      en: 'View Full Library'    },

  // Game titles & descriptions
  'game.imposter.title': { es: '¿Quién es el Impostor?', en: 'Who is the Imposter?' },
  'game.imposter.desc':  {
    es: 'Nuestro juego de deducción social estrella. Un jugador recibe una identidad secreta mientras el resto intenta identificarlo mediante preguntas sutiles. Alta interacción, cero mirar la pantalla.',
    en: 'Our flagship social deduction game. One player receives a secret identity while the rest try to identify them through subtle questioning. High interaction, zero screen staring.'
  },
  'game.imposter.players': { es: '3-8 JUGADORES', en: '3-8 PLAYERS' },

  'game.pattern.title': { es: 'Camino de Patrones', en: 'Pattern Path' },
  'game.pattern.desc':  {
    es: 'Un juego cooperativo de memoria. El dispositivo muestra un camino de colores y sonidos. Pasa el móvil y recrea la secuencia juntos. Genial para el vínculo cognitivo.',
    en: 'A cooperative memory game. The device shows a path of colors and sounds. Pass the phone and recreate the sequence together. Great for cognitive bonding.'
  },
  'game.pattern.players': { es: '2-4 JUGADORES', en: '2-4 PLAYERS' },

  'game.reaction.title': { es: 'Reacción Veloz',   en: 'Reaction Rush' },
  'game.reaction.desc':  {
    es: 'Pon el móvil boca abajo sobre la mesa. Cuando aparezca tu color, sé el primero en tocar tu esquina de la pantalla. Rápido, caótico e increíblemente divertido para niños.',
    en: 'Put the phone flat on the table. When your color flashes, be the first to tap your corner of the screen. Fast, chaotic, and incredibly fun for kids.'
  },
  'game.reaction.players': { es: '2-6 JUGADORES', en: '2-6 PLAYERS' },

  // ── Generational Section ─────────────────────────────────
  'gen.h2':   { es: 'Uniendo la Brecha Generacional', en: 'Bridging the Generational Gap' },
  'gen.desc': {
    es: 'La mayoría de los juegos móviles aíslan al jugador. La mayoría de los juegos de mesa son para adultos o tienen reglas complejas. Ronda Play es la <strong>única plataforma</strong> diseñada para ser intuitiva para un niño de 6 años y apasionante para un adulto de 99.',
    en: 'Most mobile games isolate the player. Most party games are for adults or involve complex rules. Ronda Play is the <strong>only platform</strong> designed specifically to be intuitive enough for a 6-year-old and engaging enough for a 99-year-old.'
  },
  'gen.li1.title': { es: 'Sin Curva de Aprendizaje', en: 'Zero Learning Curve'  },
  'gen.li1.desc':  {
    es: 'Reglas visuales, objetivos táctiles grandes y mecánicas universalmente comprensibles.',
    en: 'Visual rules, large touch targets, and universally understood mechanics.'
  },
  'gen.li2.title': { es: '100% Seguro para Familias', en: '100% Family Safe'   },
  'gen.li2.desc':  {
    es: 'Sin internet necesario durante el juego, sin contenido inapropiado, sin trampas de micropagos.',
    en: 'No internet required during play, no inappropriate dares, no micro-transaction traps.'
  },
  'gen.li3.title': { es: 'Aprobado por Padres',       en: 'Parent Approved'     },
  'gen.li3.desc':  {
    es: 'Por fin, tiempo de pantalla en el que los padres quieren participar.',
    en: 'Finally, screen time that parents actually want to participate in.'
  },
  'gen.ages':    { es: 'De 6 a 99 años',          en: 'Ages 6 to 99'           },
  'gen.tagline': { es: 'Un dispositivo. Conexión infinita.', en: 'One device. Endless connection.' },
  'gen.cta':     { es: 'Reúne a la Familia',       en: 'Gather the Family'      },

  // ── CTA Section ──────────────────────────────────────────
  'cta.h2':      { es: '¿Listo para jugar?',   en: 'Ready to play?' },
  'cta.desc':    {
    es: 'No necesitas descargar nada para empezar. Juega directamente en tu navegador o desbloquea la biblioteca completa en nuestra App iOS.',
    en: 'No app store download required to start. Play directly in your browser or unlock the full library in our iOS App.'
  },
  'cta.web':     { es: '🌐 Jugar en Web',      en: '🌐 Play on Web'  },
  'cta.ios':     { es: '🍎 App para iOS',      en: '🍎 Get iOS App'  },

  // ── Footer ───────────────────────────────────────────────
  'footer.copy':    { es: '© 2026 Ronda Play. Redefiniendo el tiempo muerto.', en: '© 2026 Ronda Play. Redefining dead time.' },
  'footer.privacy': { es: 'Privacidad', en: 'Privacy' },
  'footer.terms':   { es: 'Términos',   en: 'Terms'   },
  'footer.contact': { es: 'Contacto',   en: 'Contact' },

  // ── Library Page ─────────────────────────────────────────
  'lib.h1':          { es: 'Biblioteca de Juegos',       en: 'Game Library'          },
  'lib.desc':        {
    es: 'Juegos para cada momento familiar. Filtra por tipo y comienza a jugar.',
    en: 'Games for every family moment. Filter by type and start playing.'
  },
  'lib.search':      { es: 'Buscar juegos...',            en: 'Search games...'       },
  'lib.filter.all':  { es: 'Todos',                       en: 'All'                   },
  'lib.filter.logic':{ es: 'Lógica',                      en: 'Logic'                 },
  'lib.filter.mem':  { es: 'Memoria',                     en: 'Memory'                },
  'lib.filter.speed':{ es: 'Velocidad',                   en: 'Speed'                 },
  'lib.empty':       { es: 'No se encontraron juegos.',   en: 'No games found.'       },
  'lib.cta.desc':    {
    es: '¿Quieres acceder a todos los juegos Premium? Desbloquea la experiencia completa.',
    en: 'Want access to all Premium games? Unlock the full experience.'
  },
  'lib.cta.btn':     { es: 'Obtener Acceso Premium',      en: 'Get Premium Access'    },

  // Game card badges
  'badge.free':    { es: 'Gratis',   en: 'Free'    },
  'badge.premium': { es: 'Premium',  en: 'Premium' },
  'badge.logic':   { es: 'Lógica',   en: 'Logic'   },
  'badge.memory':  { es: 'Memoria',  en: 'Memory'  },
  'badge.speed':   { es: 'Velocidad',en: 'Speed'   },
  'badge.play':    { es: 'Jugar',    en: 'Play'    },
  'badge.locked':  { es: 'Bloqueado',en: 'Locked'  },

  // Extra library games
  'game.wordWheel.title': { es: 'Rueda de Palabras', en: 'Word Wheel' },
  'game.wordWheel.desc':  {
    es: 'Gira la rueda y nombra elementos que coincidan con la categoría y la letra inicial. ¡Un juego de vocabulario en el que los abuelos son los mejores!',
    en: 'Spin the wheel and name items matching the category and starting letter. Fast-paced vocabulary game that grandparents excel at!'
  },
  'game.wordWheel.players': { es: '2-8 JUGADORES', en: '2-8 PLAYERS' },

  'game.colorBlind.title': { es: 'Loco por los Colores', en: 'Color Blind' },
  'game.colorBlind.desc':  {
    es: 'La palabra dice ROJO pero el texto está en AZUL... ¿Puedes decir el color sin leer la palabra? Retorcido, adictivo e hilarious.',
    en: "The word says RED but the text is in BLUE... Can you say the color without reading the word? Twisted, addictive and hilarious."
  },
  'game.colorBlind.players': { es: '2-6 JUGADORES', en: '2-6 PLAYERS' },

  'game.truthDare.title': { es: 'Ronda de Verdades', en: 'Truth Ronda' },
  'game.truthDare.desc':  {
    es: 'Preguntas entretenidas y revelaciones personales que vinculan a toda la familia. Sin retos inapropiados, 100% familiar.',
    en: 'Fun questions and personal revelations that bond the whole family. No inappropriate dares, 100% family-friendly.'
  },
  'game.truthDare.players': { es: '3-10 JUGADORES', en: '3-10 PLAYERS' },

  'game.shadowPuppet.title': { es: 'Show de Sombras', en: 'Shadow Puppet Show' },
  'game.shadowPuppet.desc':  {
    es: 'La pantalla muestra una silueta, ¡adivina qué es y actúala! Un juego de pantomima que hace reír a todos.',
    en: 'The screen shows a silhouette, guess what it is and act it out! A charades game that gets everyone laughing.'
  },
  'game.shadowPuppet.players': { es: '2-8 JUGADORES', en: '2-8 PLAYERS' },

  // ── Imposter In-Game UI ───────────────────────────────────
  'imposter.setup.title':      { es: '¿Quién es el Impostor?',             en: 'Who is the Imposter?'                  },
  'imposter.setup.subtitle':   { es: 'Configura la partida local. Pon el dispositivo en el centro de la mesa.', en: 'Configure your local lobby. Place the device in the middle of the table.' },
  'imposter.setup.badge':      { es: '🕵️‍♀️ Deducción Social',              en: '🕵️‍♀️ Social Deduction'                  },
  'imposter.setup.players':    { es: 'Jugadores',                           en: 'Players'                               },
  'imposter.setup.add':        { es: 'Añadir jugador',                     en: 'Add player'                            },
  'imposter.setup.placeholder':{ es: 'Nombre del jugador...',               en: 'Enter player name...'                  },
  'imposter.setup.imposters':  { es: 'Impostores:',                        en: 'Imposters:'                            },
  'imposter.setup.startBtn':   { es: 'Empezar Partida',                    en: 'Start Game'                            },
  'imposter.setup.minPlayers': { es: 'Necesitas al menos 3 jugadores',     en: 'You need at least 3 players'           },

  'imposter.reveal.badge':     { es: '🤝 Pasa y Juega',                    en: '🤝 Pass & Play'                        },
  'imposter.reveal.title':     { es: 'Revelación de Carta Secreta',        en: 'Secret Card Reveal'                    },
  'imposter.reveal.subtitle':  { es: 'Pasa el dispositivo al jugador de abajo. ¡Mantén tu pantalla en secreto!', en: 'Pass the device to the player below. Keep your screen secret!' },
  'imposter.reveal.youAre':    { es: 'Jugador Actual',                     en: 'Current Player'                        },
  'imposter.reveal.imposter':  { es: 'ERES EL IMPOSTOR',                   en: 'YOU ARE THE IMPOSTER'                  },
  'imposter.reveal.blendIn':   { es: '¡Pasa desapercibido! Intenta adivinar la palabra inocente y finge que la conoces.', en: 'Blend in! Try to figure out the innocent word and pretend you know it.' },
  'imposter.reveal.citizen':   { es: '¡Describe esta palabra sin revelarla! El Impostor tiene una palabra similar o señuelo.', en: 'Describe this word without giving it away! The Imposter has a similar or decoy word.' },
  'imposter.reveal.tapReveal': { es: 'Toca revelar cuando tengas el dispositivo solo.',  en: 'Tap reveal when you are holding the device alone.' },
  'imposter.reveal.secretWord':{ es: 'Revelar Secreto',                    en: 'Reveal Secret'                         },
  'imposter.reveal.next':      { es: 'Ocultar y Pasar',                    en: 'Hide & Pass'                           },

  'imposter.discuss.badge':    { es: '💬 Discusión en Grupo',              en: '💬 Group Discussion'                   },
  'imposter.discuss.title':    { es: '¡Encuentra al Impostor!',            en: 'Find the Imposter!'                    },
  'imposter.discuss.subtitle': { es: '¡Haceos preguntas mutuamente. El Impostor intenta pasar desapercibido!', en: 'Ask each other questions. The Imposter is trying to blend in!' },
  'imposter.discuss.rules':    { es: 'Reglas del Debate',                  en: 'Rules of Discussion'                   },
  'imposter.discuss.rule1':    { es: 'Por turnos, describe tu palabra secreta.',   en: 'Take turns describing your secret word.'            },
  'imposter.discuss.rule2':    { es: 'No digas la palabra directamente.',          en: 'Do not say the word itself.'                        },
  'imposter.discuss.rule3':    { es: 'Haz preguntas a los jugadores sospechosos.', en: 'Ask suspicious players questions about their descriptions.' },
  'imposter.discuss.rule4':    { es: 'Cuando el grupo esté listo, comenzad la votación.', en: 'When the group is ready, start the vote to identify the imposter.' },
  'imposter.discuss.startVote':{ es: 'Iniciar Votación',                   en: 'Start Voting'                          },

  'imposter.vote.badge':       { es: '🗳️ Emitid Vuestros Votos',          en: '🗳️ Cast Your Votes'                    },
  'imposter.vote.title':       { es: '¿Quién es el Sospechoso?',           en: 'Who is Suspect?'                       },
  'imposter.vote.subtitle':    { es: 'Pasad el móvil para que cada jugador elija su sospechoso.', en: 'Pass the phone around so each player can select their suspect.' },
  'imposter.vote.casting':     { es: 'Jugador que vota',                   en: 'Voting Player'                         },
  'imposter.vote.prompt':      { es: 'Selecciona quién crees que es el impostor:', en: 'Select who you think is the imposter:' },
  'imposter.vote.counter':     { es: 'Voto',                               en: 'Vote'                                  },
  'imposter.vote.of':          { es: 'de',                                 en: 'of'                                    },
  'imposter.vote.nextVoter':   { es: 'Siguiente Votante',                  en: 'Next Voter'                            },
  'imposter.vote.tally':       { es: 'Calcular Resultados',                en: 'Calculate Results'                     },
  'imposter.vote.selectFirst': { es: 'Selecciona un voto para continuar',  en: 'Select a vote to continue'             },

  'imposter.result.badge':     { es: '🏆 Fin de Partida',                  en: '🏆 Game Over'                          },
  'imposter.result.title':     { es: 'Resultados de la Ronda',             en: 'Round Results'                         },
  'imposter.result.impostersWin': { es: '¡Los Impostores Ganan!',          en: 'Imposters Win!'                        },
  'imposter.result.citizensWin':  { es: '¡Los Inocentes Ganan!',           en: 'Innocents Win!'                        },
  'imposter.result.theWord':   { es: 'La Palabra:',                        en: 'The Word:'                             },
  'imposter.result.decoyWord': { es: 'La Palabra Señuelo:',                en: 'The Decoy Word:'                       },
  'imposter.result.wereImposters':{ es: 'Los Impostores:',                 en: 'The Imposters:'                        },
  'imposter.result.innocents': { es: 'Ciudadanos Inocentes:',              en: 'Innocent Citizens:'                    },
  'imposter.result.playAgain': { es: 'Jugar de Nuevo',                     en: 'Play Again'                            },
};


/** Returns the translated string for the given key and locale */
export function t(key: string, lang: Lang): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] ?? entry['en'] ?? key;
}
