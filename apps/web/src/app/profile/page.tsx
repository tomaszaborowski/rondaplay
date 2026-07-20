"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RONDA_CHARACTERS } from '@/lib/avatars';
import { updateUserProfile } from '@/lib/userProfile';
import { AvatarSelector } from '@/components/AvatarSelector';
import { Trophy, Shield, Sparkles, LogOut, Edit3, Gamepad2, Award } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, userProfile, signOutUser, refreshProfile, loading } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [selectedAvatarId, setSelectedAvatarId] = useState(userProfile?.avatarCharacterId || RONDA_CHARACTERS[0].id);
  const [customAvatarUrl, setCustomAvatarUrl] = useState(userProfile?.avatarUrl || '');
  const [saving, setSaving] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex justify-center items-center">
        <div className="text-center font-bold text-[#431c5d]">Cargando tu perfil...</div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-6 flex flex-col justify-center items-center text-center">
        <h1 className="font-h1 text-3xl text-[#431c5d] mb-4 font-bold">No estás registrado</h1>
        <p className="font-body text-slate-600 mb-8 max-w-sm">
          Inicia sesión o regístrate para llevar tu historial de victorias y aparecer en la Tabla de Clasificación de RondaPlay.
        </p>
        <Link href="/login">
          <button className="tactile-button-teal bg-[#006a61] text-white px-8 py-3.5 rounded-full font-bold uppercase tracking-wider text-sm cursor-pointer">
            Iniciar Sesión / Registrarse
          </button>
        </Link>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setSaving(true);
    let avatarUrl = customAvatarUrl;
    if (!avatarUrl) {
      const selectedChar = RONDA_CHARACTERS.find((c) => c.id === selectedAvatarId);
      avatarUrl = selectedChar ? selectedChar.avatarUrl : userProfile.avatarUrl;
    }

    await updateUserProfile(userProfile.uid, {
      displayName: displayName.trim() || userProfile.displayName,
      avatarCharacterId: selectedAvatarId,
      avatarUrl,
    });
    await refreshProfile();
    setSaving(false);
    setIsEditing(false);
  };

  const stats = userProfile.stats || {
    totalWins: 0,
    totalGamesPlayed: 0,
    winRate: 0,
    totalPoints: 0,
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F9FAFB]">
      {/* Top Banner Hero */}
      <div className="hero-gradient pt-36 md:pt-40 pb-16 px-6 text-white relative">

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#34c2b2] shrink-0 card-shadow bg-white/20">
              <img src={userProfile.avatarUrl} alt={userProfile.displayName} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="font-fredoka text-3xl md:text-4xl font-extrabold">{userProfile.displayName}</h1>
                <span className="bg-white/20 backdrop-blur-md text-teal-200 font-bold px-3.5 py-1 rounded-full text-sm border border-white/30">
                  @{userProfile.username}
                </span>
              </div>
              <p className="text-xs text-white/80 font-body mt-1.5">
                Jugador Oficial de RondaPlay • Miembro desde {new Date(userProfile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md border border-white/30 transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              {isEditing ? 'Cancelar' : 'Editar Perfil'}
            </button>
            <button
              onClick={signOutUser}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/30 hover:bg-red-500/50 text-white font-bold text-xs backdrop-blur-md border border-red-300/40 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid Container */}
      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Edit Form & Profile Info */}
        <div className="lg:col-span-5 space-y-6">
          {isEditing && (
            <div className="bg-white rounded-3xl p-6 card-shadow border border-teal-200 animate-fade-in">
              <h2 className="font-h2 text-xl text-[#431c5d] font-bold mb-4">Editar Datos de Perfil</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nombre Visible</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#34c2b2] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Avatar de Jugador</label>
                  <AvatarSelector
                    selectedAvatarId={selectedAvatarId}
                    customAvatarUrl={customAvatarUrl}
                    accountPhotoUrl={user?.photoURL}
                    onSelectCharacter={(id, url) => {
                      setSelectedAvatarId(id);
                      setCustomAvatarUrl('');
                    }}
                    onSelectCustomUrl={(url) => {
                      setCustomAvatarUrl(url);
                    }}
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="tactile-button-teal bg-[#006a61] text-white w-full py-3.5 rounded-full font-bold uppercase tracking-wider text-xs cursor-pointer"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          )}

          {/* Account Overview Box */}
          <div className="bg-white rounded-3xl p-6 card-shadow border border-slate-100 space-y-4">
            <h3 className="font-fredoka text-lg text-[#2b2d42] font-bold">Detalles de la Cuenta</h3>
            <div className="space-y-3 text-xs font-body">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-semibold">Correo Electrónico</span>
                <span className="font-bold text-slate-700">{userProfile.email || 'No vinculado'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-semibold">Identificador de Usuario</span>
                <span className="font-bold text-[#34c2b2]">@{userProfile.username}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400 font-semibold">Estado de Cuenta</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Activo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Wide Bento Grid & Game Shortcuts */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="font-fredoka text-2xl text-[#431c5d] font-extrabold">Tus Estadísticas de RondaPlay</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#fff1f9] p-5 rounded-3xl card-shadow border border-pink-100 flex flex-col items-center justify-center text-center">
              <span className="font-caption text-[11px] text-[#d95a82] uppercase tracking-widest mb-1">Puntos</span>
              <span className="font-fredoka text-3xl text-[#d95a82] font-extrabold">{stats.totalPoints || 0}</span>
            </div>

            <div className="bg-[#e0f7f4] p-5 rounded-3xl card-shadow border border-teal-100 flex flex-col items-center justify-center text-center">
              <span className="font-caption text-[11px] text-[#006a61] uppercase tracking-widest mb-1">Victorias</span>
              <span className="font-fredoka text-3xl text-[#006a61] font-extrabold">{stats.totalWins || 0}</span>
            </div>

            <div className="bg-[#f3e8ff] p-5 rounded-3xl card-shadow border border-purple-100 flex flex-col items-center justify-center text-center">
              <span className="font-caption text-[11px] text-[#431c5d] uppercase tracking-widest mb-1">Partidas</span>
              <span className="font-fredoka text-3xl text-[#431c5d] font-extrabold">{stats.totalGamesPlayed || 0}</span>
            </div>

            <div className="bg-[#fff7ed] p-5 rounded-3xl card-shadow border border-amber-100 flex flex-col items-center justify-center text-center">
              <span className="font-caption text-[11px] text-amber-700 uppercase tracking-widest mb-1">% Eficiencia</span>
              <span className="font-fredoka text-3xl text-amber-700 font-extrabold">{stats.winRate || 0}%</span>
            </div>
          </div>

          {/* Action Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Link href="/leaderboard" className="block group">
              <div className="bg-white p-6 rounded-3xl card-shadow border border-slate-100 group-hover:border-[#006a61] transition-all flex items-center gap-4">
                <div className="p-3 bg-[#e0f7f4] text-[#006a61] rounded-2xl group-hover:scale-110 transition-transform">
                  <Trophy className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-fredoka text-lg font-bold text-[#2b2d42]">Ver Clasificación</h3>
                  <p className="text-xs text-slate-500">Comprueba tu posición en la tabla global de RondaPlay.</p>
                </div>
              </div>
            </Link>

            <Link href="/library" className="block group">
              <div className="bg-white p-6 rounded-3xl card-shadow border border-slate-100 group-hover:border-[#d95a82] transition-all flex items-center gap-4">
                <div className="p-3 bg-[#fff1f9] text-[#d95a82] rounded-2xl group-hover:scale-110 transition-transform">
                  <Gamepad2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-fredoka text-lg font-bold text-[#2b2d42]">Galería de Juegos</h3>
                  <p className="text-xs text-slate-500">Juega a El Impostor o Speed Match y acumula victorias.</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Website Footer */}
      <footer className="bg-ronda-slate text-white/60 py-12 border-t-8 border-ronda-teal mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <Link className="flex items-center gap-3" href="/">
            <Image src="/logo.png" alt="Ronda Play Logo" width={120} height={40} className="h-8 md:h-10 w-auto opacity-90 hover:opacity-100 transition-opacity" />
          </Link>
          <div className="text-sm font-body">© 2026 Ronda Play. Redefiniendo el tiempo muerto.</div>
          <div className="flex gap-6 text-sm font-body font-semibold">
            <Link className="hover:text-white transition-colors" href="/pages/politica-de-privacidad">Privacidad</Link>
            <Link className="hover:text-white transition-colors" href="/pages/terminos-y-condiciones">Términos</Link>
            <Link className="hover:text-white transition-colors" href="/contact">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
