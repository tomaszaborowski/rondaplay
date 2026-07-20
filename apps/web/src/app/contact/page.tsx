"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/Button';
import { useLanguage } from '@/context/LanguageContext';
import { Footer } from '@/components/Footer';

export default function ContactPage() {
  const { t } = useLanguage();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd POST to an API here
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <header className="hero-gradient pt-36 pb-24 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-ronda-teal rounded-full mix-blend-screen filter blur-2xl opacity-50 animate-float" />
        <div
          className="absolute bottom-10 right-10 w-48 h-48 bg-ronda-pink rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-float"
          style={{ animationDelay: '2s' }}
        />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 text-sm font-bold tracking-wide uppercase text-white mb-6 select-none">
            ¡Hablemos! · Let&apos;s Talk
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg mb-6">
            Contacta con{' '}
            <span className="text-ronda-teal">Ronda Play</span>
          </h1>
          <p className="text-lg md:text-xl font-body text-white/90 max-w-2xl mx-auto leading-relaxed">
            ¿Tienes preguntas, sugerencias o simplemente quieres saludar? Estamos aquí para escucharte.
          </p>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 w-full leading-none z-20">
          <svg className="block w-full h-16 md:h-24" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path
              d="M0,64L80,74.7C160,85,320,107,480,101.3C640,96,800,64,960,48C1120,32,1280,32,1360,32L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
              fill="#F9FAFB"
            />
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* LEFT — Info Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-ronda-purple text-3xl font-bold mb-2">¿En qué podemos ayudarte?</h2>
              <p className="text-ronda-slate/70 font-body text-sm leading-relaxed">
                Nuestro equipo responde habitualmente en menos de 48 horas en días laborables.
              </p>
            </div>

            {/* Info Card: Email */}
            <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 bg-ronda-purple/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">✉️</span>
              </div>
              <h3 className="text-ronda-purple font-bold text-lg mb-1">Email</h3>
              <a
                href="mailto:support@rondaplay.com"
                className="text-ronda-teal font-semibold font-body text-sm hover:underline"
              >
                support@rondaplay.com
              </a>
            </div>

            {/* Info Card: Instagram */}
            <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 bg-ronda-pink/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📸</span>
              </div>
              <h3 className="text-ronda-purple font-bold text-lg mb-1">Instagram</h3>
              <a
                href="https://instagram.com/rondaplay"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ronda-teal font-semibold font-body text-sm hover:underline"
              >
                @rondaplay
              </a>
            </div>

            {/* Info Card: Response Time */}
            <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 bg-ronda-teal/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">⏱️</span>
              </div>
              <h3 className="text-ronda-purple font-bold text-lg mb-1">Tiempo de respuesta</h3>
              <p className="text-ronda-slate/70 font-body text-sm">
                Respondemos en <strong className="text-ronda-purple">menos de 48h</strong> (días laborables). ¡Somos rápidos!
              </p>
            </div>

            {/* Logo */}
            <div className="hidden lg:flex justify-center pt-4">
              <Image
                src="/logo.png"
                alt="Ronda Play Logo"
                width={160}
                height={60}
                className="opacity-60 hover:opacity-100 transition-opacity w-auto h-12"
              />
            </div>
          </div>

          {/* RIGHT — Contact Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="bg-white rounded-3xl border border-purple-100 shadow-lg p-12 flex flex-col items-center justify-center text-center min-h-[500px]">
                <span className="text-6xl mb-6 animate-bounce">🎉</span>
                <h3 className="text-3xl font-bold text-ronda-purple mb-4">¡Mensaje enviado!</h3>
                <p className="text-ronda-slate/70 font-body text-lg mb-8 max-w-md leading-relaxed">
                  Gracias por escribirnos. Nos pondremos en contacto contigo en menos de 48 horas.
                </p>
                <Button variant="primary" className="px-8 py-3" onClick={() => setSubmitted(false)}>
                  Enviar otro mensaje
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-purple-100 shadow-lg p-8 md:p-12">
                <h3 className="text-2xl font-bold text-ronda-purple mb-8">Escríbenos</h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-ronda-slate mb-2" htmlFor="contact-name">
                        Nombre <span className="text-ronda-pink">*</span>
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        value={formState.name}
                        onChange={handleChange}
                        placeholder="Tu nombre"
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-ronda-slate font-body text-sm focus:outline-none focus:border-ronda-teal transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-ronda-slate mb-2" htmlFor="contact-email">
                        Email <span className="text-ronda-pink">*</span>
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        value={formState.email}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-ronda-slate font-body text-sm focus:outline-none focus:border-ronda-teal transition-colors"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-bold text-ronda-slate mb-2" htmlFor="contact-subject">
                      Asunto <span className="text-ronda-pink">*</span>
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      required
                      value={formState.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-ronda-slate font-body text-sm focus:outline-none focus:border-ronda-teal transition-colors appearance-none"
                    >
                      <option value="" disabled>Selecciona un asunto…</option>
                      <option value="general">Pregunta general</option>
                      <option value="support">Soporte técnico</option>
                      <option value="premium">Suscripción Premium</option>
                      <option value="partnership">Colaboración / Partnership</option>
                      <option value="press">Prensa / Media</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-bold text-ronda-slate mb-2" htmlFor="contact-message">
                      Mensaje <span className="text-ronda-pink">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={6}
                      value={formState.message}
                      onChange={handleChange}
                      placeholder="Cuéntanos en qué podemos ayudarte…"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-ronda-slate font-body text-sm focus:outline-none focus:border-ronda-teal transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  {/* Privacy notice */}
                  <p className="text-xs text-slate-400 font-body leading-relaxed">
                    Al enviar este formulario aceptas nuestra{' '}
                    <Link href="/pages/politica-de-privacidad" className="text-ronda-teal hover:underline font-semibold">
                      Política de Privacidad
                    </Link>
                    .
                  </p>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-4 text-base font-bold"
                  >
                    Enviar mensaje 🚀
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
