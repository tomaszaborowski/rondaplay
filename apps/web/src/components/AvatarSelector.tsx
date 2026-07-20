"use client";

import React, { useState } from 'react';
import { RONDA_CHARACTERS, CharacterAvatar } from '@/lib/avatars';
import { Camera, Upload, Check, Link as LinkIcon, UserCheck } from 'lucide-react';

interface AvatarSelectorProps {
  selectedAvatarId: string;
  customAvatarUrl: string;
  accountPhotoUrl?: string | null;
  onSelectCharacter: (id: string, url: string) => void;
  onSelectCustomUrl: (url: string) => void;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatarId,
  customAvatarUrl,
  accountPhotoUrl,
  onSelectCharacter,
  onSelectCustomUrl,
}) => {
  const [activeMode, setActiveMode] = useState<'preset' | 'account' | 'upload' | 'url'>(
    customAvatarUrl ? 'upload' : 'preset'
  );
  const [urlInput, setUrlInput] = useState(customAvatarUrl || '');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no debe superar los 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onSelectCustomUrl(result);
        setActiveMode('upload');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onSelectCustomUrl(urlInput.trim());
      setActiveMode('url');
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Mode Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600 gap-1">
        <button
          type="button"
          onClick={() => setActiveMode('preset')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeMode === 'preset' ? 'bg-white text-[#006a61] shadow-sm font-extrabold' : 'hover:text-slate-900'
          }`}
        >
          Personajes
        </button>

        {accountPhotoUrl && (
          <button
            type="button"
            onClick={() => {
              setActiveMode('account');
              onSelectCustomUrl(accountPhotoUrl);
            }}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeMode === 'account' ? 'bg-white text-[#006a61] shadow-sm font-extrabold' : 'hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Google/Apple
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveMode('upload')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeMode === 'upload' ? 'bg-white text-[#006a61] shadow-sm font-extrabold' : 'hover:text-slate-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Subir Foto
        </button>
      </div>

      {/* Preset Characters Grid */}
      {activeMode === 'preset' && (
        <div className="grid grid-cols-5 gap-2 pt-1">
          {RONDA_CHARACTERS.map((char) => {
            const isSelected = selectedAvatarId === char.id && !customAvatarUrl;
            return (
              <button
                key={char.id}
                type="button"
                onClick={() => onSelectCharacter(char.id, char.avatarUrl)}
                className={`group flex flex-col items-center p-1.5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-[#34c2b2] bg-teal-50 shadow-md scale-105'
                    : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200">
                  <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] font-bold text-slate-600 mt-1 truncate w-full text-center">
                  {char.name}
                </span>
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-[#34c2b2] text-white rounded-full p-0.5 shadow">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Account Photo Option */}
      {activeMode === 'account' && accountPhotoUrl && (
        <div className="flex items-center gap-4 bg-teal-50 p-4 rounded-2xl border border-teal-200">
          <img src={accountPhotoUrl} alt="Cuenta Google/Apple" className="w-14 h-14 rounded-full object-cover border-2 border-[#34c2b2]" />
          <div>
            <div className="text-xs font-bold text-[#006a61]">Usando Foto de Cuenta Google / Apple</div>
            <div className="text-[11px] text-slate-500">Se usará tu imagen oficial vinculada a tu cuenta de acceso.</div>
          </div>
        </div>
      )}

      {/* Upload Custom Image */}
      {activeMode === 'upload' && (
        <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center flex flex-col items-center gap-2">
          {customAvatarUrl ? (
            <div className="flex items-center gap-4">
              <img src={customAvatarUrl} alt="Vista previa" className="w-14 h-14 rounded-full object-cover border-2 border-[#34c2b2]" />
              <div className="text-left">
                <span className="text-xs font-bold text-[#006a61] block">¡Imagen personalizada cargada!</span>
                <label className="text-[11px] font-bold text-[#d95a82] hover:underline cursor-pointer">
                  Cambiar archivo
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
          ) : (
            <label className="w-full py-4 flex flex-col items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-teal-100 text-[#006a61] flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700">Haz clic para elegir una imagen de tu dispositivo</span>
              <span className="text-[10px] text-slate-400">Formatos JPG, PNG, WEBP (máx. 2MB)</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          )}
        </div>
      )}
    </div>
  );
};
