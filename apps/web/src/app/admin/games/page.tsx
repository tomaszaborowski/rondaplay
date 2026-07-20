"use client";

import React, { useState } from 'react';
import { useAdminStore, Game } from '@/store/adminStore';
import { Button } from '@/components/Button';
import { GameCard } from '@/components/GameCard';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  CheckCircle,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Upload,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';

export default function GameCMSManager() {
  const games = useAdminStore((state) => state.games);
  const addGame = useAdminStore((state) => state.addGame);
  const updateGame = useAdminStore((state) => state.updateGame);
  const deleteGame = useAdminStore((state) => state.deleteGame);
  const togglePremiumGame = useAdminStore((state) => state.togglePremiumGame);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  
  // Toast notifications
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Form Fields
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [category, setCategory] = useState<'logic' | 'memory' | 'speed'>('logic');
  const [minPlayers, setMinPlayers] = useState(2);
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [isPremium, setIsPremium] = useState(false);
  const [status, setStatus] = useState<'active' | 'draft'>('active');
  const [description, setDescription] = useState('');
  const [variables, setVariables] = useState('{}');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingGame(null);
    setTitle('');
    setEmoji('🎮');
    setCoverImage('');
    setLogoUrl('');
    setCategory('logic');
    setMinPlayers(2);
    setMaxPlayers(8);
    setIsPremium(false);
    setStatus('active');
    setDescription('');
    setVariables('{\n  "timeLimit": 60\n}');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (game: Game) => {
    setEditingGame(game);
    setTitle(game.title);
    setEmoji(game.emoji);
    setCoverImage(game.coverImage || '');
    setLogoUrl(game.logoUrl || '');
    setCategory(game.category);
    setMinPlayers(game.minPlayers);
    setMaxPlayers(game.maxPlayers);
    setIsPremium(game.isPremium);
    setStatus(game.status);
    setDescription(game.description);
    setVariables(game.variables || '{}');
    setIsModalOpen(true);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showToast('La imagen no debe superar los 3 MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) setter(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      JSON.parse(variables);
    } catch (err) {
      showToast('¡Configuración JSON de variables no válida!', 'error');
      return;
    }

    const payload = {
      title,
      emoji,
      coverImage,
      logoUrl,
      category,
      minPlayers,
      maxPlayers,
      isPremium,
      status,
      description,
      variables
    };

    if (editingGame) {
      updateGame(editingGame.id, payload);
      showToast('¡Juego actualizado con éxito!');
    } else {
      addGame(payload);
      showToast('¡Nuevo juego añadido con éxito!');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este juego?')) {
      deleteGame(id);
      showToast('¡Juego eliminado con éxito!');
    }
  };

  const filteredGames = games.filter(
    (g) => g.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 font-body">
      {/* Toast Notice */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 text-white animate-fade-in ${
          toastType === 'success' ? 'bg-ronda-teal' : 'bg-ronda-pink'
        }`}>
          {toastType === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 w-full sm:w-80 focus-within:border-ronda-teal transition-colors">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar juegos..."
            className="bg-transparent border-none outline-none text-xs w-full text-ronda-slate font-semibold"
          />
        </div>

        <Button
          onClick={handleOpenAddModal}
          variant="primary"
          className="flex items-center gap-2 text-xs py-3 w-full sm:w-auto shadow-md"
        >
          <Plus className="w-4 h-4" /> Añadir Nuevo Juego
        </Button>
      </div>

      {/* GAMES CMS DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-semibold text-ronda-slate border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-4 px-2">Preview / Logo</th>
                <th className="py-4">Title & Description</th>
                <th className="py-4">Category</th>
                <th className="py-4">Players</th>
                <th className="py-4">Type</th>
                <th className="py-4">Status</th>
                <th className="py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGames.map((game) => (
                <tr key={game.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center relative shrink-0">
                        {game.coverImage ? (
                          <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl select-none">{game.emoji}</span>
                        )}
                        {game.logoUrl && (
                          <img src={game.logoUrl} alt="Logo" className="absolute h-6 w-auto object-contain drop-shadow" />
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-4">
                    <div className="font-bold text-ronda-purple">{game.title}</div>
                    <div className="text-xs text-slate-400 font-normal max-w-xs truncate">{game.description}</div>
                  </td>

                  <td className="py-4 uppercase text-xs">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      game.category === 'logic' ? 'bg-purple-50 text-ronda-purple' :
                      game.category === 'memory' ? 'bg-teal-50 text-ronda-teal' : 'bg-rose-50 text-ronda-pink'
                    }`}>
                      {game.category}
                    </span>
                  </td>

                  <td className="py-4 text-xs text-slate-400">{game.minPlayers}-{game.maxPlayers} Jugadores</td>

                  <td className="py-4">
                    <button
                      onClick={() => {
                        togglePremiumGame(game.id);
                        showToast(`Set ${game.title} to ${!game.isPremium ? 'Premium' : 'Free'}`);
                      }}
                      className="cursor-pointer focus:outline-none"
                    >
                      {game.isPremium ? (
                        <span className="flex items-center gap-1 text-ronda-pink">
                          <ToggleRight className="w-8 h-8" />
                          <span className="text-[10px] font-bold uppercase">Premium</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-300">
                          <ToggleLeft className="w-8 h-8" />
                          <span className="text-[10px] font-bold uppercase text-slate-400">Gratis</span>
                        </span>
                      )}
                    </button>
                  </td>

                  <td className="py-4">
                    <span className={`text-[10px] font-bold uppercase ${
                      game.status === 'active' ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                      ● {game.status}
                    </span>
                  </td>

                  <td className="py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleOpenEditModal(game)}
                        className="p-2 text-slate-400 hover:text-ronda-teal transition-colors cursor-pointer"
                        title="Editar Juego"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(game.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Eliminar Juego"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto border border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Side: Form Inputs */}
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-xl font-bold text-ronda-purple font-brand">
                {editingGame ? `Editar Juego: ${editingGame.title}` : 'Añadir Nuevo Juego'}
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Título</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="Ej. El Impostor"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-ronda-teal outline-none text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Emoji</label>
                    <input
                      type="text"
                      value={emoji}
                      onChange={(e) => setEmoji(e.target.value)}
                      placeholder="🕵️‍♀️"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-ronda-teal outline-none text-sm font-semibold text-center"
                    />
                  </div>
                </div>

                {/* Cover Image Upload & URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Imagen del Post / Carátula (Cover Image)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="https://... / URL o sube archivo"
                      className="flex-grow px-3.5 py-2 rounded-xl border border-slate-200 focus:border-ronda-teal outline-none text-xs"
                    />
                    <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" /> Subir
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setCoverImage)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Game Logo Overlay Upload & URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Logo del Juego (Encabezado del Post / Overlay)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://... / Logo transparente"
                      className="flex-grow px-3.5 py-2 rounded-xl border border-slate-200 focus:border-ronda-teal outline-none text-xs"
                    />
                    <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" /> Subir
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setLogoUrl)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Descripción Corta</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={2}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-ronda-teal outline-none text-xs font-semibold resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Categoría</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as 'logic' | 'memory' | 'speed')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-ronda-teal outline-none text-xs font-semibold"
                    >
                      <option value="logic">Lógica</option>
                      <option value="memory">Memoria</option>
                      <option value="speed">Velocidad</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Estado</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'active' | 'draft')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-ronda-teal outline-none text-xs font-semibold"
                    >
                      <option value="active">Activo</option>
                      <option value="draft">Borrador</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mín. Jugadores</label>
                    <input
                      type="number"
                      value={minPlayers}
                      onChange={(e) => setMinPlayers(parseInt(e.target.value) || 2)}
                      required
                      min={1}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-ronda-teal outline-none text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Máx. Jugadores</label>
                    <input
                      type="number"
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 8)}
                      required
                      min={1}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-ronda-teal outline-none text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Variables JSON Config</label>
                  <textarea
                    value={variables}
                    onChange={(e) => setVariables(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-ronda-teal outline-none text-xs font-mono"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    variant="outline"
                    className="flex-1 py-2.5 text-center text-xs border border-slate-200"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 py-2.5 text-center text-xs"
                  >
                    Guardar Juego
                  </Button>
                </div>
              </form>
            </div>

            {/* Right Side: Live Card Preview */}
            <div className="lg:col-span-5 flex flex-col justify-start bg-slate-50 p-6 rounded-3xl border border-slate-200">
              <div className="flex items-center gap-2 mb-4 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-ronda-pink" />
                Vista Previa del Post / Tarjeta
              </div>

              <div className="pointer-events-none">
                <GameCard
                  title={title || 'Título del Juego'}
                  description={description || 'Descripción breve del juego para la galería...'}
                  players={`${minPlayers}-${maxPlayers} Jugadores`}
                  type={category}
                  emoji={emoji || '🎮'}
                  slug="preview"
                  coverImage={coverImage}
                  logoUrl={logoUrl}
                  isPremium={isPremium}
                />
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
