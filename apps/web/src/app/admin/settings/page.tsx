"use client";

import React, { useState } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { Button } from '@/components/Button';
import { 
  Settings as SettingsIcon,
  CheckCircle, 
  Tv, 
  Mail, 
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck
} from 'lucide-react';

export default function AdminSettingsView() {
  const settings = useAdminStore((state) => state.settings);
  const updateSettings = useAdminStore((state) => state.updateSettings);

  const [appName, setAppName] = useState(settings.appName);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode);
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(settings.googleAnalyticsId);
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic GA validation
    if (googleAnalyticsId.trim() && !/^G-[A-Z0-9]+$/i.test(googleAnalyticsId.trim())) {
      showToast('Google Analytics Tag format is invalid! Must match G-XXXXXXXXXX');
      return;
    }

    updateSettings({
      appName,
      supportEmail,
      maintenanceMode,
      googleAnalyticsId: googleAnalyticsId.trim(),
      instagramUrl: instagramUrl.trim()
    });

    showToast('Settings saved successfully!');
  };

  return (
    <div className="space-y-8 font-body">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl bg-ronda-teal flex items-center gap-3 z-50 text-white animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: GENERAL SETTINGS */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-ronda-purple font-brand border-b border-slate-50 pb-4 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-ronda-teal" /> General Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Application Name
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 focus-within:border-ronda-teal transition-colors">
                  <span className="text-slate-400 mr-2">🎮</span>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    required
                    className="bg-transparent border-none outline-none text-sm font-semibold w-full text-ronda-slate"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Support Email
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 focus-within:border-ronda-teal transition-colors">
                  <Mail className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    required
                    className="bg-transparent border-none outline-none text-sm font-semibold w-full text-ronda-slate"
                  />
                </div>
              </div>
            </div>

            {/* Instagram Settings Row */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Instagram Profile Link
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 focus-within:border-ronda-teal transition-colors">
                {/* Instagram SVG icon — lucide-react this version lacks Instagram export */}
                <svg className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                </svg>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/rondaplay"
                  className="bg-transparent border-none outline-none text-sm font-semibold w-full text-ronda-slate"
                />
              </div>
            </div>

            {/* Maintenance Mode */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="space-y-1">
                <span className="text-sm font-bold text-ronda-purple block">Maintenance Mode</span>
                <span className="text-xs text-slate-400 font-semibold block">
                  Temporarily disable game lobbying actions for regular server maintenance
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className="cursor-pointer focus:outline-none"
              >
                {maintenanceMode ? (
                  <span className="flex items-center gap-1.5 text-ronda-pink">
                    <ToggleRight className="w-10 h-10" />
                    <span className="text-[10px] font-extrabold uppercase">ON</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <ToggleLeft className="w-10 h-10" />
                    <span className="text-[10px] font-bold uppercase text-slate-400">OFF</span>
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* INTEGRATIONS: GOOGLE ANALYTICS */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-ronda-purple font-brand border-b border-slate-50 pb-4 flex items-center gap-2">
              <Tv className="w-5 h-5 text-ronda-pink" /> Analytics & Integrations
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  Google Analytics Tag (Measurement ID) <span title="e.g., G-74X9VPE89B"><HelpCircle className="w-3.5 h-3.5 text-slate-300" /></span>
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-3 focus-within:border-ronda-teal transition-colors">
                  <span className="text-slate-400 font-bold text-xs mr-3 select-none uppercase">ID</span>
                  <input
                    type="text"
                    value={googleAnalyticsId}
                    onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="bg-transparent border-none outline-none text-sm font-mono font-semibold w-full text-ronda-slate"
                  />
                </div>
              </div>

              <div className="text-xs text-slate-400 font-semibold leading-relaxed">
                Adding your Google Analytics ID (Google Tag) will automatically inject the required global tracking script into all page layouts, reporting page views, session counts, and subscription transaction conversion funnels.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION & INFO PANEL */}
        <div className="space-y-6">
          <div className="bg-ronda-purpleDark text-white p-8 rounded-3xl border border-purple-950 shadow-lg space-y-6 relative overflow-hidden">
            {/* Playful background graphic */}
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 translate-y-12 blur-md"></div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-ronda-teal">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-brand">Publish Changes</h3>
            </div>

            <p className="text-xs text-purple-100/70 leading-relaxed font-semibold">
              Saving updates will commit settings variables to the local state engine, immediately modifying app behaviors and updating active scripts across both web catalogs and in-app views.
            </p>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-4 text-center text-xs font-bold shadow-md shadow-ronda-teal/20"
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
