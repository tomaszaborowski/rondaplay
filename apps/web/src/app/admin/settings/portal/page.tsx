"use client";

import React, { useState } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { Button } from '@/components/Button';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Image as ImageIcon, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  Shield,
  Smile,
  Edit2
} from 'lucide-react';

const preUploadedAssets = [
  { name: 'El Impostor (Detective)', url: '/avatars/avatar-detective.png' },
  { name: 'Alex Vortex (Purple)', url: '/avatars/avatar-purple.png' },
  { name: 'Drift King (Blue Suit)', url: '/avatars/avatar-blue-suit.png' },
  { name: 'Pixel Queen (Granny)', url: '/avatars/avatar-pink-granny.png' },
  { name: 'Speed Star (Girl)', url: '/avatars/avatar-girl.png' }
];

export default function PortalSettings() {
  const adminUsers = useAdminStore((state) => state.adminUsers) || [];
  const addAdminUser = useAdminStore((state) => state.addAdminUser);
  const deleteAdminUser = useAdminStore((state) => state.deleteAdminUser);

  const avatars = useAdminStore((state) => state.avatars) || [];
  const addAvatar = useAdminStore((state) => state.addAvatar);
  const deleteAvatar = useAdminStore((state) => state.deleteAvatar);
  const updateAvatarName = useAdminStore((state) => state.updateAvatarName);

  // Active Tab state
  const [activeTab, setActiveTab] = useState<'admins' | 'avatars'>('admins');

  // Form states - Admins
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminRole, setAdminRole] = useState<'admin' | 'moderator' | 'superadmin'>('admin');

  // Form states - Avatars
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarName, setAvatarName] = useState('');
  const [selectedPreuploaded, setSelectedPreuploaded] = useState('');

  // UI Toast states
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Add Administrator handler
  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword.trim()) {
      showToast('Please fill out all fields.', 'error');
      return;
    }

    // Check duplicate
    const exists = adminUsers.some(
      (u) => u.email.toLowerCase() === adminEmail.trim().toLowerCase()
    );
    if (exists) {
      showToast('Administrator email is already registered!', 'error');
      return;
    }

    addAdminUser(adminEmail.trim(), adminPassword.trim(), adminRole);
    setAdminEmail('');
    setAdminPassword('');
    showToast('Administrator registered successfully!');
  };

  // Delete Administrator handler
  const handleDeleteAdmin = (id: string, email: string) => {
    if (email === 'admin@rondaplay.com') {
      showToast('Cannot delete the root superadministrator account!', 'error');
      return;
    }
    if (confirm(`Are you sure you want to remove ${email} from the administrator registry?`)) {
      deleteAdminUser(id);
      showToast('Administrator removed successfully.');
    }
  };

  // Select Pre-uploaded avatar handler
  const handlePreuploadedSelect = (val: string) => {
    setSelectedPreuploaded(val);
    if (val) {
      const found = preUploadedAssets.find((a) => a.url === val);
      if (found) {
        setAvatarUrl(found.url);
        setAvatarName(found.name);
      }
    } else {
      setAvatarUrl('');
      setAvatarName('');
    }
  };

  // Add Avatar handler
  const handleAddAvatar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarUrl.trim() || !avatarName.trim()) {
      showToast('Please specify both the avatar URL and character name.', 'error');
      return;
    }

    // Check duplicate URL
    const exists = avatars.some(
      (av) => av.url.toLowerCase() === avatarUrl.trim().toLowerCase()
    );
    if (exists) {
      showToast('This avatar image URL is already in the pool!', 'error');
      return;
    }

    addAvatar(avatarUrl.trim(), avatarName.trim());
    setAvatarUrl('');
    setAvatarName('');
    setSelectedPreuploaded('');
    showToast('Avatar image added to user pool successfully!');
  };

  // Delete Avatar handler
  const handleDeleteAvatar = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name} from the avatar selection pool?`)) {
      deleteAvatar(id);
      showToast('Avatar removed successfully.');
    }
  };

  return (
    <div className="space-y-8 font-body">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 text-white animate-fade-in ${
          toastType === 'success' ? 'bg-ronda-teal' : 'bg-red-500'
        }`}>
          {toastType === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Tabs Menu Header */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex items-center justify-between flex-wrap gap-4 select-none">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'admins'
                ? 'bg-ronda-teal text-white shadow-md shadow-ronda-teal/20'
                : 'text-ronda-slate hover:bg-slate-50'
            }`}
          >
            <Users className="w-4.5 h-4.5" /> Portal Administrators
          </button>
          <button
            onClick={() => setActiveTab('avatars')}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'avatars'
                ? 'bg-ronda-teal text-white shadow-md shadow-ronda-teal/20'
                : 'text-ronda-slate hover:bg-slate-50'
            }`}
          >
            <Smile className="w-4.5 h-4.5" /> Registration Avatars
          </button>
        </div>
      </div>

      {/* TAB CONTENT: ADMIN USERS */}
      {activeTab === 'admins' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* List Section */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
            <h3 className="text-lg font-bold text-ronda-purple font-brand border-b border-slate-50 pb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-ronda-teal" /> Administrator Directory
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="py-4">Email Address</th>
                    <th className="py-4">Role</th>
                    <th className="py-4">Created At</th>
                    <th className="py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm font-semibold text-ronda-slate">
                  {adminUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 font-bold">{user.email}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          user.role === 'superadmin' 
                            ? 'bg-purple-100 text-purple-700' 
                            : user.role === 'moderator' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-teal-100 text-teal-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-slate-400 font-bold">{user.createdAt}</td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleDeleteAdmin(user.id, user.email)}
                          disabled={user.email === 'admin@rondaplay.com'}
                          className={`p-2 rounded-xl border border-slate-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all ${
                            user.email === 'admin@rondaplay.com' ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                          title="Remove Administrator"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
            <h3 className="text-lg font-bold text-ronda-purple font-brand border-b border-slate-50 pb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-ronda-teal" /> Register Admin
            </h3>

            <form onSubmit={handleAddAdmin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="admin-user@example.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-ronda-teal transition-all text-sm font-semibold text-ronda-slate"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Access Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-ronda-teal transition-all text-sm font-semibold text-ronda-slate"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Access Role
                </label>
                <select
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value as any)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-ronda-teal transition-all text-sm font-semibold text-ronda-slate cursor-pointer"
                >
                  <option value="admin">Admin (Standard Access)</option>
                  <option value="moderator">Moderator (Content Only)</option>
                  <option value="superadmin">Super Admin (Full Access)</option>
                </select>
              </div>

              <Button type="submit" variant="primary" className="w-full py-3.5 rounded-2xl text-xs font-bold">
                <Plus className="w-4 h-4 mr-2" /> Add Administrator
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AVATARS */}
      {activeTab === 'avatars' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Avatar Cards Grid */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
            <h3 className="text-lg font-bold text-ronda-purple font-brand border-b border-slate-50 pb-4 flex items-center gap-2">
              <Smile className="w-5 h-5 text-ronda-teal" /> Active Avatar Assets Pool ({avatars.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {avatars.map((av) => (
                <div 
                  key={av.id} 
                  className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-ronda-teal/20 hover:shadow-md transition-all group"
                >
                  {/* Avatar Circular Preview */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 flex items-center justify-center p-1">
                    <img src={av.url} alt={av.characterName} className="w-full h-full object-contain" />
                  </div>

                  {/* Character Name Live Input Edit */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Character Name</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={av.characterName}
                        onChange={(e) => updateAvatarName(av.id, e.target.value)}
                        className="w-full border-b border-transparent hover:border-slate-200 focus:border-ronda-teal outline-none py-0.5 text-sm font-bold text-ronda-slate transition-colors"
                      />
                      <Edit2 className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteAvatar(av.id, av.characterName)}
                    className="p-2.5 rounded-xl border border-slate-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all cursor-pointer flex-shrink-0"
                    title="Delete Avatar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Avatar Form */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
            <h3 className="text-lg font-bold text-ronda-purple font-brand border-b border-slate-50 pb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-ronda-teal" /> Register Avatar Asset
            </h3>

            <form onSubmit={handleAddAvatar} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Pre-uploaded Game Assets
                </label>
                <select
                  value={selectedPreuploaded}
                  onChange={(e) => handlePreuploadedSelect(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-ronda-teal transition-all text-sm font-semibold text-ronda-slate cursor-pointer"
                >
                  <option value="">-- Choose pre-uploaded image --</option>
                  {preUploadedAssets.map((asset) => (
                    <option key={asset.url} value={asset.url}>
                      {asset.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Image Path / Web URL
                </label>
                <input
                  type="text"
                  placeholder="/images/speed-match/characters/Abeja.png"
                  value={avatarUrl}
                  onChange={(e) => {
                    setAvatarUrl(e.target.value);
                    setSelectedPreuploaded('');
                  }}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-ronda-teal transition-all text-sm font-semibold text-ronda-slate"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Character Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Abeja"
                  value={avatarName}
                  onChange={(e) => setAvatarName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-ronda-teal transition-all text-sm font-semibold text-ronda-slate"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full py-3.5 rounded-2xl text-xs font-bold">
                <Plus className="w-4 h-4 mr-2" /> Add to Avatar Pool
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
