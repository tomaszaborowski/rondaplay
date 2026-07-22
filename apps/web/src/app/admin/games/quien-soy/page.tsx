"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminStore, QuienSoyDeck } from '@/store/adminStore';
import { Button } from '@/components/Button';
import { 
  ArrowLeft, Plus, Trash2, Edit2, CheckCircle, AlertCircle, 
  Layers, Lock, Unlock, Upload, Sparkles 
} from 'lucide-react';

export default function AdminQuienSoyManager() {
  const decks = useAdminStore((state) => state.quienSoyDecks);
  const addDeck = useAdminStore((state) => state.addQuienSoyDeck);
  const updateDeck = useAdminStore((state) => state.updateQuienSoyDeck);
  const deleteDeck = useAdminStore((state) => state.deleteQuienSoyDeck);
  const addWord = useAdminStore((state) => state.addQuienSoyWord);
  const deleteWord = useAdminStore((state) => state.deleteQuienSoyWord);

  const [selectedDeckId, setSelectedDeckId] = useState<string>(decks[0]?.id || '');
  const selectedDeck = decks.find((d) => d.id === selectedDeckId) || decks[0];

  // Modal State for New/Edit Category Deck
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<QuienSoyDeck | null>(null);

  const [deckTitleEs, setDeckTitleEs] = useState('');
  const [deckTitleEn, setDeckTitleEn] = useState('');
  const [categoryType, setCategoryType] = useState('free');
  const [imageUrl, setImageUrl] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  // New Word Input Fields
  const [wordEs, setWordEs] = useState('');
  const [wordEn, setWordEn] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleOpenDeckModal = (deckToEdit?: QuienSoyDeck) => {
    if (deckToEdit) {
      setEditingDeck(deckToEdit);
      setDeckTitleEs(deckToEdit.titleEs);
      setDeckTitleEn(deckToEdit.titleEn);
      setCategoryType(deckToEdit.categoryType);
      setImageUrl(deckToEdit.imageUrl);
      setIsPremium(deckToEdit.isPremium);
    } else {
      setEditingDeck(null);
      setDeckTitleEs('');
      setDeckTitleEn('');
      setCategoryType('free');
      setImageUrl('/games/quien-soy/professions.png');
      setIsPremium(false);
    }
    setIsDeckModalOpen(true);
  };

  const handleSaveDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckTitleEs.trim()) return;

    if (editingDeck) {
      updateDeck(editingDeck.id, {
        titleEs: deckTitleEs,
        titleEn: deckTitleEn || deckTitleEs,
        categoryType,
        imageUrl,
        isPremium,
      });
      showToast('¡Categoría actualizada con éxito!');
    } else {
      addDeck({
        titleEs: deckTitleEs,
        titleEn: deckTitleEn || deckTitleEs,
        categoryType,
        imageUrl: imageUrl || '/games/quien-soy/professions.png',
        isPremium,
        words: [],
      });
      showToast('¡Nueva categoría añadida!');
    }
    setIsDeckModalOpen(false);
  };

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordEs.trim() || !selectedDeck) return;

    addWord(selectedDeck.id, {
      es: wordEs.trim(),
      en: wordEn.trim() || wordEs.trim(),
    });
    setWordEs('');
    setWordEn('');
    showToast('¡Palabra añadida!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const res = evt.target?.result as string;
      if (res) setter(res);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 font-body p-6">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 px-6 py-4 rounded-xl bg-[#006a61] text-white shadow-2xl flex items-center gap-3 z-50 animate-fade-in font-bold text-sm">
          <CheckCircle className="w-5 h-5 text-[#72f5e3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER & BACK BUTTON */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/games">
              <button className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>
            <span className="text-xs font-bold text-ronda-pink uppercase tracking-widest">
              Administración de Juegos
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#2c0247] flex items-center gap-2">
            <Layers className="w-8 h-8 text-ronda-teal" />
            Gestor de Categorías y Palabras: ¿Quién Soy?
          </h1>
        </div>

        <Button onClick={() => handleOpenDeckModal()} variant="primary" className="flex items-center gap-2 text-xs py-3">
          <Plus className="w-4 h-4" /> Añadir Nueva Categoría
        </Button>
      </div>

      {/* CATEGORY & WORDS MANAGER SPLIT VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CATEGORIES LIST */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#2c0247] border-b border-slate-100 pb-3 flex justify-between items-center">
            <span>Categorías ({decks.length})</span>
          </h2>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {decks.map((deck) => {
              const isSelected = selectedDeck?.id === deck.id;
              return (
                <div
                  key={deck.id}
                  onClick={() => setSelectedDeckId(deck.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-ronda-teal bg-ronda-teal/10 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 relative shrink-0">
                      <img src={deck.imageUrl} alt={deck.titleEs} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#2c0247]">{deck.titleEs}</h3>
                      <p className="text-xs text-slate-400 font-semibold">{deck.words.length} palabras • {deck.categoryType}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDeckModal(deck);
                      }}
                      className="p-1.5 text-slate-400 hover:text-ronda-purple rounded-lg hover:bg-slate-100"
                      title="Editar Categoría"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {decks.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('¿Eliminar esta categoría?')) {
                            deleteDeck(deck.id);
                            showToast('Categoría eliminada');
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100"
                        title="Eliminar Categoría"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: WORDS IN SELECTED CATEGORY */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          {selectedDeck ? (
            <>
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-[#2c0247] flex items-center gap-2">
                    {selectedDeck.titleEs} ({selectedDeck.titleEn})
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold">
                    Categoría: <span className="uppercase text-ronda-teal font-extrabold">{selectedDeck.categoryType}</span> | {selectedDeck.words.length} Palabras registradas
                  </p>
                </div>
                <Button onClick={() => handleOpenDeckModal(selectedDeck)} variant="outline" className="text-xs py-2">
                  Editar Categoría
                </Button>
              </div>

              {/* FORM TO ADD NEW WORD */}
              <form onSubmit={handleAddWord} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-extrabold text-[#2c0247] uppercase tracking-wider">Añadir Nueva Palabra / Personaje</h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={wordEs}
                      onChange={(e) => setWordEs(e.target.value)}
                      placeholder="Español (ej. Médico)"
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none text-xs font-semibold focus:border-ronda-pink"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={wordEn}
                      onChange={(e) => setWordEn(e.target.value)}
                      placeholder="English (e.g. Doctor)"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none text-xs font-semibold focus:border-ronda-teal"
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#006a61] hover:bg-[#289689] text-white font-extrabold rounded-xl text-xs transition-colors"
                    >
                      + Añadir
                    </button>
                  </div>
                </div>
              </form>

              {/* WORDS TABLE */}
              <div className="overflow-hidden border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Palabra (Español)</th>
                      <th className="p-3.5">Word (English)</th>
                      <th className="p-3.5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedDeck.words.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50/80">
                        <td className="p-3.5 font-bold text-[#2c0247]">{w.es}</td>
                        <td className="p-3.5 text-slate-600 font-semibold">{w.en}</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              deleteWord(selectedDeck.id, w.id);
                              showToast('Palabra eliminada');
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100"
                            title="Eliminar palabra"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {selectedDeck.words.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-slate-400 font-semibold">
                          No hay palabras en esta categoría. ¡Añade la primera arriba!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">Selecciona una categoría a la izquierda</div>
          )}
        </div>
      </div>

      {/* EDIT/ADD DECK MODAL */}
      {isDeckModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h2 className="text-xl font-extrabold text-[#2c0247]">
              {editingDeck ? `Editar Categoría: ${editingDeck.titleEs}` : 'Crear Nueva Categoría'}
            </h2>

            <form onSubmit={handleSaveDeck} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-600 mb-1 font-bold">Título (Español)</label>
                <input
                  type="text"
                  value={deckTitleEs}
                  onChange={(e) => setDeckTitleEs(e.target.value)}
                  placeholder="ej. Profesiones"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-bold focus:border-ronda-pink"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">Title (English)</label>
                <input
                  type="text"
                  value={deckTitleEn}
                  onChange={(e) => setDeckTitleEn(e.target.value)}
                  placeholder="e.g. Professions"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-bold focus:border-ronda-teal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Filtro de Categoría</label>
                  <select
                    value={categoryType}
                    onChange={(e) => setCategoryType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none font-bold text-xs"
                  >
                    <option value="free">Gratis (Free)</option>
                    <option value="general">General</option>
                    <option value="movies">Cine & Series (Movies)</option>
                    <option value="characters">Personajes (Characters)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Acceso Premium</label>
                  <button
                    type="button"
                    onClick={() => setIsPremium(!isPremium)}
                    className={`w-full py-2.5 rounded-xl font-extrabold flex items-center justify-center gap-2 border ${
                      isPremium ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {isPremium ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    {isPremium ? 'Bloqueado (Premium)' : 'Gratuito'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">Imagen de la Categoría (Cover Image)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="/games/quien-soy/professions.png"
                    className="flex-grow px-3.5 py-2 rounded-xl border border-slate-200 outline-none text-xs"
                  />
                  <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" /> Subir
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setImageUrl)} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button type="button" onClick={() => setIsDeckModalOpen(false)} variant="outline">
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Guardar Categoría
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
