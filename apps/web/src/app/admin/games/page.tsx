"use client";

import React, { useState } from 'react';
import { useAdminStore, Game } from '@/store/adminStore';
import { Button } from '@/components/Button';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Gamepad2, 
  Search,
  CheckCircle,
  AlertCircle,
  ToggleLeft,
  ToggleRight
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
    setCategory(game.category);
    setMinPlayers(game.minPlayers);
    setMaxPlayers(game.maxPlayers);
    setIsPremium(game.isPremium);
    setStatus(game.status);
    setDescription(game.description);
    setVariables(game.variables || '{}');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // JSON Validation
    try {
      JSON.parse(variables);
    } catch (err) {
      showToast('Invalid game variables JSON configuration!', 'error');
      return;
    }

    const payload = {
      title,
      emoji,
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
      showToast('Game updated successfully!');
    } else {
      addGame(payload);
      showToast('New game added successfully!');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this game?')) {
      deleteGame(id);
      showToast('Game deleted successfully!');
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
            placeholder="Search games..."
            className="bg-transparent border-none outline-none text-xs w-full text-ronda-slate font-semibold"
          />
        </div>

        <Button
          onClick={handleOpenAddModal}
          variant="primary"
          className="flex items-center gap-2 text-xs py-3 w-full sm:w-auto shadow-md"
        >
          <Plus className="w-4 h-4" /> Add New Game
        </Button>
      </div>

      {/* GAMES CMS DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-semibold text-ronda-slate border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-4 px-2">Icon</th>
                <th className="py-4">Title</th>
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
                  <td className="py-4 px-2 text-3xl select-none">{game.emoji}</td>
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
                  <td className="py-4 text-xs text-slate-400">{game.minPlayers}-{game.maxPlayers} Players</td>
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
                          <span className="text-[10px] font-bold uppercase text-slate-400">Free</span>
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
                        title="Edit Game"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(game.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Delete Game"
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

      {/* FORM DRAWER/MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col">
            <h2 className="text-xl font-bold text-ronda-purple mb-6 font-brand">
              {editingGame ? `Edit Game: ${editingGame.title}` : 'Add New Tabletop Game'}
            </h2>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-ronda-teal outline-none transition-colors text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Emoji</label>
                  <input
                    type="text"
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    required
                    placeholder="🕵️‍♀️"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-ronda-teal outline-none transition-colors text-sm font-semibold text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Short Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-ronda-teal outline-none transition-colors text-sm font-semibold resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as 'logic' | 'memory' | 'speed')}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-ronda-teal outline-none transition-colors text-sm font-semibold"
                  >
                    <option value="logic">Logic</option>
                    <option value="memory">Memory</option>
                    <option value="speed">Speed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'draft')}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-ronda-teal outline-none transition-colors text-sm font-semibold"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Min Players</label>
                  <input
                    type="number"
                    value={minPlayers}
                    onChange={(e) => setMinPlayers(parseInt(e.target.value) || 2)}
                    required
                    min={1}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-ronda-teal outline-none transition-colors text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Max Players</label>
                  <input
                    type="number"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 8)}
                    required
                    min={1}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-ronda-teal outline-none transition-colors text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  JSON Variables Config
                </label>
                <textarea
                  value={variables}
                  onChange={(e) => setVariables(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-ronda-teal outline-none transition-colors text-xs font-mono"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                  className="flex-1 py-3 text-center border border-slate-200 text-ronda-slate"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 py-3 text-center"
                >
                  Save Game
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
