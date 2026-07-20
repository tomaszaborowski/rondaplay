"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RONDA_CHARACTERS } from '@/lib/avatars';
import { AvatarSelector } from '@/components/AvatarSelector';
import { Trophy, Shield, Sparkles, Users } from 'lucide-react';
import { Footer } from '@/components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const { userProfile, signInWithGoogle, signInWithApple, signInWithEmail, signUpWithEmail } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState(RONDA_CHARACTERS[0].id);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      router.push('/profile');
    }
  }, [userProfile, router]);

  const formatAuthError = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Este correo electrónico ya está registrado. Por favor, inicia sesión.';
      case 'auth/invalid-email':
        return 'El correo electrónico introducido no es válido.';
      case 'auth/weak-password':
        return 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Correo electrónico o contraseña incorrectos.';
      case 'auth/operation-not-allowed':
        return '⚠️ El método de autenticación no está activado. Debes activarlo en Firebase Console -> Authentication -> Sign-in method.';
      case 'auth/unauthorized-domain':
        return '⚠️ Dominio no autorizado. Añade "localhost" en Firebase Console -> Authentication -> Settings -> Authorized domains.';
      case 'auth/popup-closed-by-user':
        return 'Se cerró la ventana emergente antes de completar el inicio de sesión.';
      default:
        return err?.message ? `Error Firebase (${code || 'desconocido'}): ${err.message}` : 'Ocurrió un error al procesar tu solicitud.';
    }
  };

  if (userProfile) {
    return null;
  }

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push('/profile');
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithApple();
      router.push('/profile');
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Por favor completa el correo electrónico y la contraseña.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const cleanUsername = username.trim().replace(/^@+/, '');
        if (!cleanUsername || cleanUsername.length < 3) {
          throw new Error('El nombre de usuario debe tener al menos 3 caracteres.');
        }
        await signUpWithEmail(
          email,
          password,
          displayName || cleanUsername,
          cleanUsername,
          selectedAvatarId,
          customAvatarUrl
        );
      } else {
        await signInWithEmail(email, password);
      }
      router.push('/profile');
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F9FAFB]">
      {/* Main Hero Wrapper */}
      <div className="hero-gradient min-h-[90vh] relative pt-36 md:pt-40 pb-20 px-6 flex items-center">

        {/* Ambient Glow Bubbles */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-[#34c2b2] rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-float pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-[#ff75a0] rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-float pointer-events-none"></div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column: Web Showcase (Desktop Only / Wide screens) */}
          <div className="lg:col-span-6 text-white space-y-6 hidden lg:block">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-4 h-4 text-teal-300" />
              Cuenta Oficial RondaPlay
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight font-fredoka drop-shadow-md">
              Únete a la Comunidad y <span className="text-[#34c2b2]">Compite con tu @username</span>
            </h1>

            <p className="text-base text-white/90 leading-relaxed font-body max-w-xl">
              Crea tu perfil con personajes 3D de RondaPlay, guarda tus victorias en juegos como <em>El Impostor</em> y aparece en la Tabla de Clasificación Global.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-start gap-3">
                <div className="p-2 bg-teal-500/30 rounded-xl text-teal-200 shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-fredoka">Clasificación Global</h3>
                  <p className="text-xs text-white/70">Compara tu % de victorias y puntos con jugadores de todo el mundo.</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-start gap-3">
                <div className="p-2 bg-pink-500/30 rounded-xl text-pink-200 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-fredoka">Etiqueta @username</h3>
                  <p className="text-xs text-white/70">Añade a tus amigos a las partidas locales para atribuir victorias.</p>
                </div>
              </div>
            </div>

            {/* Character Showcase Row */}
            <div className="pt-4 flex items-center gap-3">
              <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Avatares Oficiales:</span>
              <div className="flex -space-x-3 overflow-hidden p-1">
                {RONDA_CHARACTERS.map((char) => (
                  <img
                    key={char.id}
                    src={char.avatarUrl}
                    alt={char.name}
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white/50 object-cover hover:scale-110 transition-transform"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login/Registration Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 card-shadow border border-slate-100 flex flex-col items-center">
              
              <Link href="/" className="mb-4">
                <Image
                  src="/logo.png"
                  alt="Ronda Play Logo"
                  width={150}
                  height={45}
                  className="h-10 w-auto object-contain hover:scale-105 transition-transform"
                />
              </Link>

              <h2 className="font-h1 text-2xl text-[#431c5d] text-center mb-1 font-bold">
                {isSignUp ? 'Crear Cuenta en RondaPlay' : 'Iniciar Sesión'}
              </h2>
              <p className="font-body text-xs text-slate-500 text-center mb-6">
                Unifica tus estadísticas de juego y compite con tu <span className="font-bold text-[#34c2b2]">@username</span>
              </p>

              {error && (
                <div className="w-full bg-red-50 text-red-600 text-xs font-bold p-3 rounded-2xl mb-4 border border-red-200 text-center">
                  {error}
                </div>
              )}

              {/* Primary OAuth Providers: Google & Apple */}
              <div className="w-full space-y-3 mb-5">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-4 rounded-full border border-slate-300 card-shadow transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Continuar con Google
                </button>

                <button
                  onClick={handleAppleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-black hover:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-full card-shadow transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-sm"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.13-1.9-14.35-6.1-3.69-3.05-7.77-7.92-12.23-14.6-6.19-9.37-11.08-19.8-14.67-31.28-3.59-11.49-5.39-22.38-5.39-32.68 0-14.05 3.5-25.75 10.5-35.1 7-9.35 15.82-14.1 26.47-14.25 4.89 0 10.14 1.25 15.75 3.75 5.61 2.5 9.5 3.75 11.67 3.75 1.95 0 5.91-1.3 11.87-3.9 5.96-2.6 11.08-3.83 15.37-3.68 11.77.74 21.05 5.09 27.84 13.04-10.42 6.31-15.54 15.07-15.37 26.28.18 8.84 3.48 16.29 9.9 22.35 6.42 6.06 14.15 9.48 23.19 10.26-2.14 6.53-4.99 13.05-8.55 19.56zM119.22 31.07c0-6.95 2.5-13.48 7.5-19.59 5-6.11 11.38-9.84 19.14-11.19.23 1.05.35 2.05.35 3 0 7.07-2.61 13.78-7.83 20.13-5.22 6.35-11.69 10.13-19.41 11.34-.12-.87-.18-1.77-.18-2.69z" />
                  </svg>
                  Continuar con Apple
                </button>
              </div>

              <div className="w-full flex items-center gap-3 my-2">
                <div className="flex-grow h-px bg-slate-200"></div>
                <span className="text-[11px] uppercase font-bold text-slate-400">o con correo</span>
                <div className="flex-grow h-px bg-slate-200"></div>
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleSubmit} className="w-full space-y-3.5 mt-1">
                {isSignUp && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Tu Nombre Completo / Apodo</label>
                      <input
                        type="text"
                        placeholder="Ej. Alex Vortex"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#34c2b2] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Nombre de Usuario <span className="text-[#34c2b2]">(@username único)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-2.5 text-slate-400 font-bold text-sm">@</span>
                        <input
                          type="text"
                          required
                          placeholder="user_name"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full pl-8 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#34c2b2] text-sm font-semibold"
                        />
                      </div>
                    </div>

                    {/* Character Avatar Picker */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Selecciona tu Avatar de Jugador</label>
                      <AvatarSelector
                        selectedAvatarId={selectedAvatarId}
                        customAvatarUrl={customAvatarUrl}
                        onSelectCharacter={(id, url) => {
                          setSelectedAvatarId(id);
                          setCustomAvatarUrl('');
                        }}
                        onSelectCustomUrl={(url) => {
                          setCustomAvatarUrl(url);
                        }}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#34c2b2] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Contraseña</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#34c2b2] text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="tactile-button-teal bg-[#006a61] text-white w-full py-3.5 rounded-full font-bold uppercase tracking-wider text-sm mt-2 active:translate-y-1 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Procesando...' : isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
                </button>
              </form>

              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="mt-5 text-xs font-bold text-[#d95a82] hover:underline cursor-pointer"
              >
                {isSignUp ? '¿Ya tienes una cuenta? Inicia sesión aquí' : '¿No tienes cuenta? Regístrate con email'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Website Footer */}
      <Footer />
    </div>
  );
}
