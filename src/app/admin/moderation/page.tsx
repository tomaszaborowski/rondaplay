"use client";

import React, { useState } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { Button } from '@/components/Button';
import { 
  Plus, 
  Trash2, 
  Search, 
  CheckCircle, 
  ShieldAlert, 
  Info,
  BadgeAlert
} from 'lucide-react';

export default function ContentModeration() {
  const blockedTerms = useAdminStore((state) => state.blockedTerms);
  const addBlockedTerm = useAdminStore((state) => state.addBlockedTerm);
  const removeBlockedTerm = useAdminStore((state) => state.removeBlockedTerm);

  const [newTerm, setNewTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    const term = newTerm.trim().toLowerCase();
    
    if (!term) return;

    if (blockedTerms.includes(term)) {
      showToast('Term already exists in the blocklist!');
      return;
    }

    addBlockedTerm(term);
    setNewTerm('');
    showToast(`Added "${term}" to the blocklist!`);
  };

  const handleRemoveTerm = (term: string) => {
    removeBlockedTerm(term);
    showToast(`Removed "${term}" from the blocklist!`);
  };

  // Filter Blocked Terms
  const filteredTerms = blockedTerms.filter((term) =>
    term.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 font-body">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl bg-ronda-teal flex items-center gap-3 z-50 text-white animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Intro Warning Information Block */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-2xl flex gap-4 select-none">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 flex-shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-amber-800">Family Safety Mode Active</h4>
          <p className="text-xs text-amber-700/80 leading-relaxed font-semibold">
            Ronda Play is used by children and families (ages 6 to 99). Words entered in this blocklist will automatically censor user-generated content, lobby titles, player names, and custom question prompt submissions within the game logic.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ADD TERM FORM PANEL */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-ronda-purple font-brand mb-6 flex items-center gap-2">
            <BadgeAlert className="w-5 h-5 text-ronda-pink" /> Block a Term
          </h3>

          <form onSubmit={handleAddTerm} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Blocked Word / Phrase
              </label>
              <input
                type="text"
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                required
                placeholder="e.g. badword"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-ronda-pink outline-none transition-colors text-sm font-semibold"
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="w-full py-4 text-center flex items-center justify-center gap-2 text-xs shadow-md"
            >
              <Plus className="w-4.5 h-4.5" /> Add to Blocklist
            </Button>
          </form>
        </div>

        {/* BLOCKED TERMS LIST DIRECTORY */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-ronda-purple font-brand">Active Blocklist</h3>
              <p className="text-xs text-slate-400 font-semibold">Currently filtering {blockedTerms.length} terms</p>
            </div>

            {/* Search */}
            <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs w-full sm:w-60 focus-within:border-ronda-teal transition-colors">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search blocked terms..."
                className="bg-transparent border-none outline-none text-xs w-full text-ronda-slate font-semibold"
              />
            </div>
          </div>

          {/* Tag Grid display */}
          {filteredTerms.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {filteredTerms.map((term) => (
                <div 
                  key={term} 
                  className="bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-xl flex items-center gap-2 group hover:border-red-200 transition-colors"
                >
                  <span className="text-xs font-bold text-ronda-slate font-mono">{term}</span>
                  <button
                    onClick={() => handleRemoveTerm(term)}
                    className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                    title="Remove from Blocklist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 font-semibold text-xs space-y-2">
              <ShieldAlert className="w-8 h-8 mx-auto text-slate-300" />
              <p>No blocked terms found matching your query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
