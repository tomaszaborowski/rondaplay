import { create } from 'zustand';

export type GamePhase = 'lobby' | 'assign' | 'play' | 'vote' | 'results';

export interface WordPair {
  innocent: string;
  imposter?: string;
  hint?: string;
}

export const CATEGORIES_DB: Record<string, { free: boolean; pairs: WordPair[] }> = {
  'Animales Salvajes': {
    free: true,
    pairs: [
      { innocent: 'León', hint: 'Melena' },
      { innocent: 'Tigre', hint: 'Naranja' },
      { innocent: 'Elefante', hint: 'Pesado' },
      { innocent: 'Jirafa', hint: 'Alta' },
      { innocent: 'Mono', hint: 'Banana' },
      { innocent: 'Oso', hint: 'Cueva' },
      { innocent: 'Cocodrilo', hint: 'Pantano' },
      { innocent: 'Serpiente', hint: 'Veneno' },
      { innocent: 'Hipopótamo', hint: 'Agua' },
      { innocent: 'Rinoceronte', hint: 'Gris' },
      { innocent: 'Cebra', hint: 'África' },
      { innocent: 'Lobo', hint: 'Luna' },
      { innocent: 'Zorro', hint: 'Bosque' },
      { innocent: 'Pingüino', hint: 'Polo' },
      { innocent: 'Delfín', hint: 'Saltos' },
      { innocent: 'Ballena', hint: 'Océano' },
      { innocent: 'Tiburón', hint: 'Peligro' },
      { innocent: 'Canguro', hint: 'Saltarín' },
      { innocent: 'Águila', hint: 'Vista' },
      { innocent: 'Murciélago', hint: 'Noche' }
    ]
  },
  'Animales Domésticos y Granja': {
    free: true,
    pairs: [
      { innocent: 'Perro', hint: 'Collar' },
      { innocent: 'Gato', hint: 'Bigotes' },
      { innocent: 'Pez', hint: 'Burbujas' },
      { innocent: 'Pájaro', hint: 'Nido' },
      { innocent: 'Hámster', hint: 'Semillas' },
      { innocent: 'Tortuga', hint: 'Caparazón' },
      { innocent: 'Conejo', hint: 'Orejas' },
      { innocent: 'Caballo', hint: 'Montar' },
      { innocent: 'Vaca', hint: 'Manchas' },
      { innocent: 'Cerdo', hint: 'Barro' },
      { innocent: 'Oveja', hint: 'Nube' },
      { innocent: 'Gallina', hint: 'Granja' },
      { innocent: 'Pato', hint: 'Laguna' },
      { innocent: 'Cabra', hint: 'Montaña' },
      { innocent: 'Pavo', hint: 'Navidad' },
      { innocent: 'Burro', hint: 'Carga' },
      { innocent: 'Ratón', hint: 'Trampa' },
      { innocent: 'Loro', hint: 'Pirata' },
      { innocent: 'Rana', hint: 'Mosca' },
      { innocent: 'Araña', hint: 'Patas' }
    ]
  },
  'Frutas y Verduras': {
    free: true,
    pairs: [
      { innocent: 'Manzana', hint: 'Tarta' },
      { innocent: 'Banana', hint: 'Mono' },
      { innocent: 'Naranja', hint: 'Desayuno' },
      { innocent: 'Uva', hint: 'Morada' },
      { innocent: 'Frutilla', hint: 'Postre' },
      { innocent: 'Sandía', hint: 'Semillas' },
      { innocent: 'Melón', hint: 'Verano' },
      { innocent: 'Pera', hint: 'Campana' },
      { innocent: 'Limón', hint: 'Exprimir' },
      { innocent: 'Cereza', hint: 'Gemelas' },
      { innocent: 'Tomate', hint: 'Salsa' },
      { innocent: 'Zanahoria', hint: 'Conejo' },
      { innocent: 'Papa', hint: 'Frita' },
      { innocent: 'Cebolla', hint: 'Capas' },
      { innocent: 'Lechuga', hint: 'Verde' },
      { innocent: 'Choclo', hint: 'Amarillo' },
      { innocent: 'Brócoli', hint: 'Árbol' },
      { innocent: 'Zapallo', hint: 'Halloween' },
      { innocent: 'Ajo', hint: 'Vampiro' },
      { innocent: 'Pepino', hint: 'Rodajas' }
    ]
  },
  'Comidas y Bebidas': {
    free: true,
    pairs: [
      { innocent: 'Pizza', hint: 'Caja' },
      { innocent: 'Hamburguesa', hint: 'Medallón' },
      { innocent: 'Pancho', hint: 'Mostaza' },
      { innocent: 'Fideos', hint: 'Salsa' },
      { innocent: 'Arroz', hint: 'Sushi' },
      { innocent: 'Huevo', hint: 'Yema' },
      { innocent: 'Queso', hint: 'Ratón' },
      { innocent: 'Pan', hint: 'Tostada' },
      { innocent: 'Galletita', hint: 'Paquete' },
      { innocent: 'Torta', hint: 'Cumpleaños' },
      { innocent: 'Helado', hint: 'Cucurucho' },
      { innocent: 'Chocolate', hint: 'Tableta' },
      { innocent: 'Caramelo', hint: 'Papelito' },
      { innocent: 'Leche', hint: 'Vaca' },
      { innocent: 'Agua', hint: 'Canilla' },
      { innocent: 'Jugo', hint: 'Fruta' },
      { innocent: 'Sopa', hint: 'Caldo' },
      { innocent: 'Mermelada', hint: 'Frasco' },
      { innocent: 'Empanada', hint: 'Relleno' },
      { innocent: 'Alfajor', hint: 'Kiosco' }
    ]
  },
  'Cosas de la Escuela': {
    free: false,
    pairs: [
      { innocent: 'Lápiz', hint: 'Punta' },
      { innocent: 'Goma', hint: 'Error' },
      { innocent: 'Cuaderno', hint: 'Rayas' },
      { innocent: 'Libro', hint: 'Páginas' },
      { innocent: 'Mochila', hint: 'Cierre' },
      { innocent: 'Tijera', hint: 'Filo' },
      { innocent: 'Regla', hint: 'Línea' },
      { innocent: 'Voligoma', hint: 'Pegajoso' },
      { innocent: 'Marcador', hint: 'Tapa' },
      { innocent: 'Sacapuntas', hint: 'Viruta' },
      { innocent: 'Pizarrón', hint: 'Borrador' },
      { innocent: 'Tiza', hint: 'Blanca' },
      { innocent: 'Escritorio', hint: 'Estudiar' },
      { innocent: 'Silla', hint: 'Respaldo' },
      { innocent: 'Computadora', hint: 'Mouse' },
      { innocent: 'Pintura', hint: 'Arte' },
      { innocent: 'Pincel', hint: 'Pelo' },
      { innocent: 'Carpeta', hint: 'Anillos' },
      { innocent: 'Cartuchera', hint: 'Útiles' },
      { innocent: 'Patio', hint: 'Correr' }
    ]
  },
  'Muebles y Cocina': {
    free: false,
    pairs: [
      { innocent: 'Cama', hint: 'Colchón' },
      { innocent: 'Sofá', hint: 'Almohadones' },
      { innocent: 'Mesa', hint: 'Apoyar' },
      { innocent: 'Televisión', hint: 'Control' },
      { innocent: 'Heladera', hint: 'Puerta' },
      { innocent: 'Horno', hint: 'Fuego' },
      { innocent: 'Microondas', hint: 'Botones' },
      { innocent: 'Plato', hint: 'Redondo' },
      { innocent: 'Vaso', hint: 'Vidrio' },
      { innocent: 'Tenedor', hint: 'Dientes' },
      { innocent: 'Cuchara', hint: 'Postre' },
      { innocent: 'Cuchillo', hint: 'Serrucho' },
      { innocent: 'Olla', hint: 'Tapa' },
      { innocent: 'Sartén', hint: 'Mango' },
      { innocent: 'Almohada', hint: 'Plumas' },
      { innocent: 'Sábana', hint: 'Fantasma' },
      { innocent: 'Toalla', hint: 'Baño' },
      { innocent: 'Espejo', hint: 'Cara' },
      { innocent: 'Puerta', hint: 'Picaporte' },
      { innocent: 'Llave', hint: 'Metal' }
    ]
  },
  'Baño y Limpieza': {
    free: false,
    pairs: [
      { innocent: 'Inodoro', hint: 'Botón' },
      { innocent: 'Ducha', hint: 'Agua' },
      { innocent: 'Jabón', hint: 'Barra' },
      { innocent: 'Cepillo de dientes', hint: 'Cerdas' },
      { innocent: 'Pasta dental', hint: 'Tubo' },
      { innocent: 'Peine', hint: 'Nudos' },
      { innocent: 'Papel higiénico', hint: 'Cartón' },
      { innocent: 'Escoba', hint: 'Palo' },
      { innocent: 'Basura', hint: 'Bolsa' },
      { innocent: 'Reloj', hint: 'Agujas' },
      { innocent: 'Lámpara', hint: 'Enchufe' },
      { innocent: 'Ventana', hint: 'Mirar' },
      { innocent: 'Cortina', hint: 'Tapar' },
      { innocent: 'Alfombra', hint: 'Peluda' },
      { innocent: 'Teléfono', hint: 'Número' },
      { innocent: 'Lavarropas', hint: 'Gira' },
      { innocent: 'Secador de pelo', hint: 'Calor' },
      { innocent: 'Plancha', hint: 'Arrugas' },
      { innocent: 'Canilla', hint: 'Gota' },
      { innocent: 'Caja', hint: 'Mudanza' }
    ]
  },
  'Ropa y Accesorios': {
    free: false,
    pairs: [
      { innocent: 'Remera', hint: 'Estampado' },
      { innocent: 'Pantalón', hint: 'Bolsillos' },
      { innocent: 'Short', hint: 'Verano' },
      { innocent: 'Vestido', hint: 'Fiesta' },
      { innocent: 'Pollera', hint: 'Girar' },
      { innocent: 'Zapatillas', hint: 'Cordones' },
      { innocent: 'Zapatos', hint: 'Taco' },
      { innocent: 'Medias', hint: 'Par' },
      { innocent: 'Campera', hint: 'Capucha' },
      { innocent: 'Gorro', hint: 'Lana' },
      { innocent: 'Bufanda', hint: 'Tejido' },
      { innocent: 'Guantes', hint: 'Dedos' },
      { innocent: 'Malla', hint: 'Arena' },
      { innocent: 'Pijama', hint: 'Cama' },
      { innocent: 'Cinturón', hint: 'Hebilla' },
      { innocent: 'Lentes', hint: 'Sol' },
      { innocent: 'Collar', hint: 'Perlas' },
      { innocent: 'Anillo', hint: 'Oro' },
      { innocent: 'Sombrero', hint: 'Mago' },
      { innocent: 'Paraguas', hint: 'Abierto' }
    ]
  },
  'Naturaleza y Clima': {
    free: false,
    pairs: [
      { innocent: 'Sol', hint: 'Amarillo' },
      { innocent: 'Luna', hint: 'Cráteres' },
      { innocent: 'Estrella', hint: 'Puntas' },
      { innocent: 'Nube', hint: 'Algodón' },
      { innocent: 'Lluvia', hint: 'Charcos' },
      { innocent: 'Nieve', hint: 'Copo' },
      { innocent: 'Viento', hint: 'Fuerte' },
      { innocent: 'Rayo', hint: 'Trueno' },
      { innocent: 'Árbol', hint: 'Raíz' },
      { innocent: 'Flor', hint: 'Pétalo' },
      { innocent: 'Pasto', hint: 'Cortar' },
      { innocent: 'Hoja', hint: 'Seca' },
      { innocent: 'Montaña', hint: 'Pico' },
      { innocent: 'Río', hint: 'Piedras' },
      { innocent: 'Mar', hint: 'Sal' },
      { innocent: 'Arena', hint: 'Castillo' },
      { innocent: 'Piedra', hint: 'Gris' },
      { innocent: 'Tierra', hint: 'Maceta' },
      { innocent: 'Fuego', hint: 'Rojo' },
      { innocent: 'Hielo', hint: 'Cubito' }
    ]
  },
  'Transporte y Vehículos': {
    free: false,
    pairs: [
      { innocent: 'Auto', hint: 'Baúl' },
      { innocent: 'Colectivo', hint: 'Parada' },
      { innocent: 'Tren', hint: 'Estación' },
      { innocent: 'Subte', hint: 'Escaleras' },
      { innocent: 'Avión', hint: 'Pasaporte' },
      { innocent: 'Helicóptero', hint: 'Rescate' },
      { innocent: 'Barco', hint: 'Puerto' },
      { innocent: 'Submarino', hint: 'Periscopio' },
      { innocent: 'Moto', hint: 'Casco' },
      { innocent: 'Bicicleta', hint: 'Cadena' },
      { innocent: 'Triciclo', hint: 'Nene' },
      { innocent: 'Patineta', hint: 'Trucos' },
      { innocent: 'Patines', hint: 'Frenar' },
      { innocent: 'Tractor', hint: 'Granja' },
      { innocent: 'Camión', hint: 'Ruta' },
      { innocent: 'Ambulancia', hint: 'Blanca' },
      { innocent: 'Patrulla', hint: 'Luces' },
      { innocent: 'Bomberos', hint: 'Manguera' },
      { innocent: 'Cohete', hint: 'Fuego' },
      { innocent: 'Bote', hint: 'Chaleco' }
    ]
  },
  'Objetos': {
    free: true,
    pairs: [
      { innocent: 'Manzana', imposter: 'Pera', hint: 'Fruta' },
      { innocent: 'Computadora', imposter: 'Tablet', hint: 'Pantalla' },
      { innocent: 'Pizza', imposter: 'Hamburguesa', hint: 'Comida' },
      { innocent: 'Bicicleta', imposter: 'Motocicleta', hint: 'Ruedas' },
      { innocent: 'Avión', imposter: 'Helicóptero', hint: 'Volar' },
      { innocent: 'Guitarra', imposter: 'Violín', hint: 'Cuerdas' },
      { innocent: 'Café', imposter: 'Té', hint: 'Bebida' }
    ]
  },
  'Películas': {
    free: false,
    pairs: [
      { innocent: 'Star Wars', imposter: 'Star Trek', hint: 'Espacio' },
      { innocent: 'Harry Potter', imposter: 'El Señor de los Anillos', hint: 'Magia' },
      { innocent: 'Batman', imposter: 'Spiderman', hint: 'Héroe' },
      { innocent: 'Titanic', imposter: 'Avatar', hint: 'Cine' },
      { innocent: 'Toy Story', imposter: 'Shrek', hint: 'Animación' }
    ]
  }
};

interface GameState {
  players: string[];
  imposters: string[];
  imposterCount: number;
  showHint: boolean;
  gamePhase: GamePhase;
  wordPair: WordPair | null;
  currentPlayerIndex: number;
  revealedCount: number;
  selectedVotes: Record<string, string>; // voter -> votedFor
  winner: 'innocents' | 'imposters' | null;
  
  // New requirements
  categories: string[];
  gameMode: 'local' | 'online';
  lobbyId: string | null;
  isHost: boolean;
  scoreboard: Record<string, number>;
  isPremium: boolean;
  
  // Actions
  initializePlayers: () => void;
  addPlayer: (name: string) => void;
  removePlayer: (index: number) => void;
  renamePlayer: (index: number, newName: string) => void;
  setImposterCount: (count: number) => void;
  setShowHint: (show: boolean) => void;
  toggleCategory: (cat: string) => void;
  setGameMode: (mode: 'local' | 'online') => void;
  setLobbyId: (id: string | null) => void;
  setIsHost: (isHost: boolean) => void;
  setPremium: (premium: boolean) => void;
  startGame: () => void;
  nextPlayerReveal: () => void;
  submitVote: (voter: string, votedFor: string) => void;
  tallyVotes: () => void;
  resetGame: () => void;
  updateScoreboard: (winner: 'innocents' | 'imposters') => void;
  resetScoreboard: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  players: ['Alex', 'Emma', 'Lucas', 'Sofia'], // Default starting players
  imposters: [],
  imposterCount: 1,
  showHint: true,
  gamePhase: 'lobby',
  wordPair: null,
  currentPlayerIndex: 0,
  revealedCount: 0,
  selectedVotes: {},
  winner: null,
  
  categories: ['Animales Salvajes'],
  gameMode: 'local',
  lobbyId: null,
  isHost: true,
  scoreboard: {},
  isPremium: false,

  initializePlayers: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('rondaplay_imposter_players');
      const premium = localStorage.getItem('rondaplay_premium') === 'true';
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length >= 3) {
            set({ players: parsed, isPremium: premium });
            return;
          }
        } catch (_) {}
      }
      set({ isPremium: premium });
    }
  },

  addPlayer: (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    set((state) => {
      if (state.players.includes(trimmed)) return {};
      const nextPlayers = [...state.players, trimmed];
      if (typeof window !== 'undefined') {
        localStorage.setItem('rondaplay_imposter_players', JSON.stringify(nextPlayers));
      }
      return { players: nextPlayers };
    });
  },

  removePlayer: (index: number) => {
    set((state) => {
      const players = [...state.players];
      players.splice(index, 1);
      if (typeof window !== 'undefined') {
        localStorage.setItem('rondaplay_imposter_players', JSON.stringify(players));
      }
      return { players };
    });
  },

  renamePlayer: (index: number, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    set((state) => {
      const players = [...state.players];
      players[index] = trimmed;
      if (typeof window !== 'undefined') {
        localStorage.setItem('rondaplay_imposter_players', JSON.stringify(players));
      }
      return { players };
    });
  },

  setImposterCount: (count: number) => {
    set({ imposterCount: count });
  },

  setShowHint: (show: boolean) => {
    set({ showHint: show });
  },

  toggleCategory: (cat: string) => {
    set((state) => {
      const exists = state.categories.includes(cat);
      let nextCats = [...state.categories];
      if (exists) {
        if (nextCats.length > 1) {
          nextCats = nextCats.filter(c => c !== cat);
        }
      } else {
        nextCats.push(cat);
      }
      return { categories: nextCats };
    });
  },

  setGameMode: (mode: 'local' | 'online') => {
    set({ gameMode: mode });
  },

  setLobbyId: (id: string | null) => {
    set({ lobbyId: id });
  },

  setIsHost: (isHost: boolean) => {
    set({ isHost });
  },

  setPremium: (premium: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rondaplay_premium', premium ? 'true' : 'false');
    }
    set({ isPremium: premium });
  },

  startGame: () => {
    const { players, imposterCount, categories } = get();
    if (players.length < 3) return; // Need at least 3 players
    
    // Choose random word pair from database
    const activeCats = categories.length > 0 ? categories : ['Objetos'];
    const randomCatKey = activeCats[Math.floor(Math.random() * activeCats.length)];
    const catData = CATEGORIES_DB[randomCatKey] || CATEGORIES_DB['Objetos'];
    const wordPair = catData.pairs[Math.floor(Math.random() * catData.pairs.length)];
    
    // Choose random imposters
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const chosenImposters = shuffled.slice(0, Math.min(imposterCount, players.length - 2));

    set({
      imposters: chosenImposters,
      wordPair,
      gamePhase: 'assign',
      currentPlayerIndex: 0,
      revealedCount: 0,
      selectedVotes: {},
      winner: null,
    });
  },

  nextPlayerReveal: () => {
    const { currentPlayerIndex, players } = get();
    if (currentPlayerIndex + 1 < players.length) {
      set({
        currentPlayerIndex: currentPlayerIndex + 1,
        gamePhase: 'assign',
      });
    } else {
      set({
        gamePhase: 'play',
      });
    }
  },

  submitVote: (voter: string, votedFor: string) => {
    set((state) => ({
      selectedVotes: { ...state.selectedVotes, [voter]: votedFor },
    }));
  },

  tallyVotes: () => {
    const { selectedVotes, imposters, players } = get();
    
    // Count votes
    const voteCounts: Record<string, number> = {};
    players.forEach(p => { voteCounts[p] = 0; });
    
    Object.values(selectedVotes).forEach((votedFor) => {
      voteCounts[votedFor] = (voteCounts[votedFor] || 0) + 1;
    });

    // Find the player with maximum votes
    let maxVotes = -1;
    let votedOutPlayer: string | null = null;
    let tie = false;

    Object.entries(voteCounts).forEach(([player, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        votedOutPlayer = player;
        tie = false;
      } else if (count === maxVotes) {
        tie = true;
      }
    });

    let roundWinner: 'innocents' | 'imposters';

    if (tie || !votedOutPlayer) {
      // Tie results in imposter win
      roundWinner = 'imposters';
    } else {
      // Check if voted out player is an imposter
      const isImposter = imposters.includes(votedOutPlayer);
      roundWinner = isImposter ? 'innocents' : 'imposters';
    }

    set({
      gamePhase: 'results',
      winner: roundWinner,
    });

    get().updateScoreboard(roundWinner);
  },

  updateScoreboard: (roundWinner: 'innocents' | 'imposters') => {
    const { players, imposters, scoreboard } = get();
    const nextScoreboard = { ...scoreboard };
    
    players.forEach((p) => {
      if (nextScoreboard[p] === undefined) {
        nextScoreboard[p] = 0;
      }
      
      const isImposter = imposters.includes(p);
      if (roundWinner === 'innocents' && !isImposter) {
        nextScoreboard[p] += 1; // Citizen points
      } else if (roundWinner === 'imposters' && isImposter) {
        nextScoreboard[p] += 2; // Imposter points (harder role)
      }
    });

    set({ scoreboard: nextScoreboard });
  },

  resetScoreboard: () => {
    set({ scoreboard: {} });
  },

  resetGame: () => {
    set({
      gamePhase: 'lobby',
      imposters: [],
      wordPair: null,
      currentPlayerIndex: 0,
      revealedCount: 0,
      selectedVotes: {},
      winner: null,
    });
  },
}));
