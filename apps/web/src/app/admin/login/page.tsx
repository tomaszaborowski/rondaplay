"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/adminStore';
import { Button } from '@/components/Button';
import Image from 'next/image';

export default function AdminLogin() {
  const router = useRouter();
  const login = useAdminStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = login(email, password);
    if (success) {
      router.push('/admin');
    } else {
      setError('Invalid credentials!');
    }
  };

  return (
    <div className="min-h-screen bg-ronda-slate flex items-center justify-center p-6 font-body">
      <div className="w-full max-w-md bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl border border-purple-100 flex flex-col relative overflow-hidden">
        {/* Background blobs for playful branding style */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-ronda-pink/10 rounded-full translate-x-8 -translate-y-8 blur-lg"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-ronda-teal/10 rounded-full -translate-x-12 translate-y-12 blur-xl"></div>

        <div className="text-center mb-8 relative z-10 flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Ronda Play Logo"
            width={160}
            height={50}
            priority
            className="h-10 w-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-ronda-purple font-brand">Admin Portal</h1>
          <p className="text-ronda-slate/60 text-sm mt-1">Sign in to manage your tabletop ecosystem</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg text-sm mb-6 animate-pulse select-none">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-ronda-slate font-bold text-xs uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@rondaplay.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-ronda-teal outline-none transition-colors text-sm font-semibold"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-ronda-slate font-bold text-xs uppercase tracking-wider">
                Password
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-ronda-teal outline-none transition-colors text-sm font-semibold"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-4 text-center mt-2 shadow-lg"
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
