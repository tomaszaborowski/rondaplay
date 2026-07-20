"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getLeaderboardUsers } from '@/lib/userProfile';
import { UserProfile } from '@/types/user';
import { Trophy, Star, Award, Share2, Play, Home, Gamepad2, User } from 'lucide-react';
import { Footer } from '@/components/Footer';

export default function LeaderboardPage() {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'impostor' | 'speed-match'>('all');

  useEffect(() => {
    async function loadData() {
      const data = await getLeaderboardUsers(20);
      setUsers(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const userRankIndex = users.findIndex((u) => u.uid === userProfile?.uid);
  const userRank = userRankIndex !== -1 ? `#${userRankIndex + 1}` : '#124';
  const userWinRate = userProfile?.stats?.winRate !== undefined ? `${userProfile.stats.winRate}%` : '68%';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tabla de Clasificación de RondaPlay',
          text: '¡Mira la Tabla de Clasificación de RondaPlay y compite con tu @username!',
          url: window.location.href,
        });
      } catch (e) {
        // Ignored
      }
    } else {
      alert('¡Enlace copiado al portapapeles!');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="bg-[#fff7fc] font-body text-[#1e1a1f] min-h-screen flex flex-col justify-between">
      {/* Top Banner Hero Header */}
      <div className="hero-gradient pt-36 md:pt-40 pb-14 px-6 text-white relative">

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-white/30">
              <Trophy className="w-4 h-4 text-yellow-300" />
              RondaPlay Ranking
            </div>
            <h1 className="font-fredoka text-4xl md:text-5xl font-extrabold drop-shadow-md">
              Global Leaderboard
            </h1>
            <p className="font-body text-sm text-white/90 max-w-xl mt-2">
              Consulta a los mejores jugadores de la semana. ¿Estás en el Top 10? Compite con tu <span className="text-[#34c2b2] font-bold">@username</span>.
            </p>
          </div>

          {/* Game Filter Pills */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-full border border-white/20 text-xs font-bold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-5 py-2 rounded-full transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-[#34c2b2] text-white shadow font-extrabold' : 'text-white/80 hover:text-white'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('impostor')}
              className={`px-5 py-2 rounded-full transition-all cursor-pointer ${
                activeTab === 'impostor' ? 'bg-[#006a61] text-white shadow font-extrabold' : 'text-white/80 hover:text-white'
              }`}
            >
              El Impostor
            </button>
            <button
              onClick={() => setActiveTab('speed-match')}
              className={`px-5 py-2 rounded-full transition-all cursor-pointer ${
                activeTab === 'speed-match' ? 'bg-[#ff75a0] text-white shadow font-extrabold' : 'text-white/80 hover:text-white'
              }`}
            >
              Speed Match
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-grow">
        
        {/* Bento Stats Overview Header */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-[#fff1f9] p-6 rounded-3xl card-shadow border border-[#431c5d]/5 flex flex-col items-center justify-center text-center">
            <span className="font-caption text-xs text-[#f06994] uppercase tracking-widest mb-1 font-bold">Tu Rango</span>
            <span className="font-fredoka text-3xl text-[#f06994] font-extrabold">{userRank}</span>
          </div>

          <div className="bg-[#e0f7f4] p-6 rounded-3xl card-shadow border border-[#006a61]/5 flex flex-col items-center justify-center text-center">
            <span className="font-caption text-xs text-[#006f65] uppercase tracking-widest mb-1 font-bold">Victoria %</span>
            <span className="font-fredoka text-3xl text-[#006f65] font-extrabold">{userWinRate}</span>
          </div>

          <div className="bg-[#f3e8ff] p-6 rounded-3xl card-shadow border border-purple-100 flex flex-col items-center justify-center text-center">
            <span className="font-caption text-xs text-[#431c5d] uppercase tracking-widest mb-1 font-bold">Total Jugadores</span>
            <span className="font-fredoka text-3xl text-[#431c5d] font-extrabold">1,420+</span>
          </div>

          <div className="bg-[#fff7ed] p-6 rounded-3xl card-shadow border border-amber-100 flex flex-col items-center justify-center text-center">
            <span className="font-caption text-xs text-amber-700 uppercase tracking-widest mb-1 font-bold">Premio Semanal</span>
            <span className="font-fredoka text-3xl text-amber-700 font-extrabold">Ronda Star</span>
          </div>
        </div>

        {/* Leaderboard Cards Grid / List */}
        {loading ? (
          <div className="text-center py-16 font-bold text-[#431c5d]">Cargando clasificación...</div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {users.map((player, index) => {
              const rankNum = index + 1;
              const isEven = index % 2 === 0;
              const accentBg = isEven ? 'bg-[#006a61]' : 'bg-[#d95a82]';
              const textAccent = isEven ? 'text-[#006a61]' : 'text-[#d95a82]';
              const borderAccent = isEven ? 'border-[#006a61]/20' : 'border-[#d95a82]/20';

              const points = player.stats?.totalPoints || (13000 - index * 600);
              const wins = player.stats?.totalWins || (45 - index * 3);

              return (
                <div
                  key={player.uid || index}
                  className="flex items-center gap-4 bg-white p-4 sm:p-5 rounded-3xl card-shadow relative group hover:translate-x-1 transition-transform duration-200 overflow-hidden border border-slate-100"
                >
                  {/* Left Curved Accent Border Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-4 ${accentBg} curved-border-left`}></div>

                  {/* Avatar */}
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0 bg-slate-100 ml-2 border-2 ${borderAccent} shadow-sm`}>
                    <img
                      src={player.avatarUrl}
                      alt={player.displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Player Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-fredoka text-lg sm:text-xl text-[#2b2d42] font-bold truncate">
                        {player.displayName}
                      </h3>
                      <span className="text-xs font-bold text-[#431c5d] bg-purple-50 px-2.5 py-0.5 rounded-full shrink-0 border border-purple-100">
                        @{player.username}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-1.5 text-xs">
                      <div className={`flex items-center gap-1 font-fredoka text-sm ${textAccent} font-bold`}>
                        <Star className="w-4 h-4 fill-current" />
                        <span>{points.toLocaleString()} pts</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 font-semibold">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>{wins} victorias</span>
                      </div>
                    </div>
                  </div>

                  {/* Rank Number */}
                  <div className="text-right pr-2 shrink-0">
                    <span className={`font-fredoka text-2xl sm:text-3xl font-extrabold ${textAccent}`}>
                      #{rankNum}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons Section */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          <Link href="/library" className="flex-1">
            <button className="tactile-button-teal bg-[#006a61] text-white h-[56px] w-full rounded-full font-h3 flex items-center justify-center gap-2 text-base cursor-pointer">
              <Play className="w-5 h-5 fill-current" />
              Play Again
            </button>
          </Link>

          <button
            onClick={handleShare}
            className="tactile-button-pink bg-[#d95a82] text-white h-[56px] w-full rounded-full font-h3 flex items-center justify-center gap-2 text-base cursor-pointer flex-1"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>
      </main>

      {/* Floating Bottom Navigation Bar (Mobile / Phone App format) */}
      <nav className="fixed bottom-0 left-0 w-full glass-nav flex justify-around items-center px-4 h-[80px] border-t border-white/10 z-50 md:hidden">
        <Link className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-colors p-2" href="/">
          <Home className="w-5 h-5" />
          <span className="font-caption text-xs mt-0.5">Home</span>
        </Link>

        <Link className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-colors p-2" href="/library">
          <Gamepad2 className="w-5 h-5" />
          <span className="font-caption text-xs mt-0.5">Games</span>
        </Link>

        <Link className="flex flex-col items-center justify-center bg-[#006a61] text-white rounded-full w-16 h-16 translate-y-[-20px] shadow-xl border-4 border-[#2c0247] hover:scale-105 transition-transform" href="/leaderboard">
          <Trophy className="w-6 h-6 fill-current" />
          <span className="font-caption text-[10px] mt-0.5">Stats</span>
        </Link>

        <Link className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-colors p-2" href="/profile">
          <User className="w-5 h-5" />
          <span className="font-caption text-xs mt-0.5">Perfil</span>
        </Link>
      </nav>

      {/* Website Footer (Desktop & standard web view) */}
      <Footer />
    </div>
  );
}
