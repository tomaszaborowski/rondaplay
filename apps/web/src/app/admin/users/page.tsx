"use client";

import React, { useState } from 'react';
import { useAdminStore, User } from '@/store/adminStore';
import { Button } from '@/components/Button';
import { 
  Search, 
  UserCheck, 
  UserX, 
  CreditCard, 
  ShieldAlert, 
  Gamepad, 
  CheckCircle,
  Eye
} from 'lucide-react';

export default function UserDirectory() {
  const users = useAdminStore((state) => state.users);
  const togglePremiumUser = useAdminStore((state) => state.togglePremiumUser);
  const toggleBanUser = useAdminStore((state) => state.toggleBanUser);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPremium, setFilterPremium] = useState<'all' | 'premium' | 'free'>('all');
  const [filterOrigin, setFilterOrigin] = useState<'all' | 'web' | 'app'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'banned'>('all');
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Handlers
  const handleTogglePremium = (userId: string) => {
    togglePremiumUser(userId);
    const updated = useAdminStore.getState().users.find(u => u.id === userId);
    if (updated) {
      showToast(`Premium status ${updated.isPremium ? 'granted to' : 'revoked from'} ${updated.email}`);
      if (selectedUser?.id === userId) {
        setSelectedUser(updated);
      }
    }
  };

  const handleToggleBan = (userId: string) => {
    toggleBanUser(userId);
    const updated = useAdminStore.getState().users.find(u => u.id === userId);
    if (updated) {
      showToast(`User account status updated to ${updated.status.toUpperCase()} for ${updated.email}`);
      if (selectedUser?.id === userId) {
        setSelectedUser(updated);
      }
    }
  };

  // Filter Logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPremium = 
      filterPremium === 'all' ? true :
      filterPremium === 'premium' ? u.isPremium : !u.isPremium;

    const matchesOrigin =
      filterOrigin === 'all' ? true : u.premiumSource === filterOrigin;

    const matchesStatus =
      filterStatus === 'all' ? true : u.status === filterStatus;

    return matchesSearch && matchesPremium && matchesOrigin && matchesStatus;
  });

  return (
    <div className="space-y-8 font-body">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl bg-ronda-teal flex items-center gap-3 z-50 text-white animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* FILTER CONTROL BAR */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4 justify-between">
        {/* Search */}
        <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 w-full md:w-72 focus-within:border-ronda-teal transition-colors">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search email..."
            className="bg-transparent border-none outline-none text-xs w-full text-ronda-slate font-semibold"
          />
        </div>

        {/* Dropdowns Group */}
        <div className="grid grid-cols-3 gap-3 flex-1 max-w-xl">
          {/* Subscription */}
          <select
            value={filterPremium}
            onChange={(e) => setFilterPremium(e.target.value as 'all' | 'premium' | 'free')}
            className="px-3 py-2 rounded-xl border border-slate-200 focus:border-ronda-teal outline-none text-xs font-bold text-slate-500 bg-white"
          >
            <option value="all">All Plans</option>
            <option value="premium">Premium Only</option>
            <option value="free">Free Users</option>
          </select>

          {/* Platform */}
          <select
            value={filterOrigin}
            onChange={(e) => setFilterOrigin(e.target.value as 'all' | 'web' | 'app')}
            className="px-3 py-2 rounded-xl border border-slate-200 focus:border-ronda-teal outline-none text-xs font-bold text-slate-500 bg-white"
          >
            <option value="all">All Sources</option>
            <option value="web">Web Subs</option>
            <option value="app">App Store Subs</option>
          </select>

          {/* Account status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'banned')}
            className="px-3 py-2 rounded-xl border border-slate-200 focus:border-ronda-teal outline-none text-xs font-bold text-slate-500 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="banned">Suspended</option>
          </select>
        </div>
      </div>

      {/* USER LIST DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-semibold text-ronda-slate border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-4 px-2">ID</th>
                <th className="py-4">Email</th>
                <th className="py-4">Subscription</th>
                <th className="py-4">Joined</th>
                <th className="py-4">Sessions</th>
                <th className="py-4">Status</th>
                <th className="py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-2 font-mono text-xs text-slate-400">{user.id}</td>
                  <td className="py-4 text-ronda-purple font-bold">{user.email}</td>
                  <td className="py-4">
                    {user.isPremium ? (
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase ${
                        user.premiumSource === 'web' 
                          ? 'bg-ronda-teal/10 text-ronda-teal' 
                          : 'bg-ronda-pink/10 text-ronda-pink'
                      }`}>
                        ★ Premium ({user.premiumSource})
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-400 rounded-full text-[9px] font-bold uppercase">Free</span>
                    )}
                  </td>
                  <td className="py-4 text-xs text-slate-400 font-normal">{user.joinDate}</td>
                  <td className="py-4 text-xs">{user.totalSessions} sessions</td>
                  <td className="py-4">
                    {user.status === 'active' ? (
                      <span className="text-emerald-600 bg-emerald-50 text-[10px] font-bold px-2.5 py-1 rounded-full">Active</span>
                    ) : (
                      <span className="text-rose-600 bg-rose-50 text-[10px] font-bold px-2.5 py-1 rounded-full">Suspended</span>
                    )}
                  </td>
                  <td className="py-4 text-center">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="p-2 text-slate-400 hover:text-ronda-teal transition-colors cursor-pointer flex items-center justify-center mx-auto"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER DETAIL MODAL DIALOG */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative border border-slate-100">
            <h2 className="text-xl font-bold text-ronda-purple mb-6 font-brand">User Details</h2>

            {/* Profile Block */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                  selectedUser.status === 'banned' ? 'bg-red-50 text-red-500' : 'bg-ronda-teal/10 text-ronda-teal'
                }`}>
                  {selectedUser.email[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-ronda-purple text-base">{selectedUser.email}</h4>
                  <p className="text-slate-400 font-mono text-[10px]">{selectedUser.id}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Join Date</span>
                  <span className="text-xs font-bold text-ronda-slate">{selectedUser.joinDate}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Playtime</span>
                  <span className="text-xs font-bold text-ronda-slate">{selectedUser.totalSessions} sessions</span>
                </div>
              </div>

              {/* Subscription info */}
              <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center">
                <div className="flex items-center gap-2 text-ronda-purple">
                  <CreditCard className="w-4 h-4 text-ronda-teal" />
                  <span className="text-xs font-bold">Premium Subscription</span>
                </div>
                <span className="text-xs">
                  {selectedUser.isPremium ? (
                    <span className="text-ronda-teal font-extrabold uppercase">Active ({selectedUser.premiumSource})</span>
                  ) : (
                    <span className="text-slate-400 font-bold uppercase">Inactive</span>
                  )}
                </span>
              </div>

              {/* Security info */}
              <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center">
                <div className="flex items-center gap-2 text-ronda-purple">
                  <ShieldAlert className="w-4 h-4 text-ronda-pink" />
                  <span className="text-xs font-bold">Safety Status</span>
                </div>
                <span className="text-xs">
                  {selectedUser.status === 'banned' ? (
                    <span className="text-red-600 font-extrabold uppercase">Suspended (Violations)</span>
                  ) : (
                    <span className="text-emerald-600 font-bold uppercase">Family Safe</span>
                  )}
                </span>
              </div>

              {/* Most played games */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Gamepad className="w-4 h-4" /> Most Played Games
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-purple-50 text-[10px] font-bold text-ronda-purple rounded-md">🕵️‍♀️ Who is the Imposter?</span>
                  {selectedUser.totalSessions > 20 && (
                    <span className="px-2.5 py-1 bg-rose-50 text-[10px] font-bold text-ronda-pink rounded-md">⚡ Reaction Rush</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex gap-3">
                <Button
                  onClick={() => handleTogglePremium(selectedUser.id)}
                  variant={selectedUser.isPremium ? 'outline' : 'primary'}
                  className="flex-1 py-3 text-center text-xs"
                >
                  {selectedUser.isPremium ? 'Revoke Premium' : 'Grant Premium'}
                </Button>
                <Button
                  onClick={() => handleToggleBan(selectedUser.id)}
                  variant={selectedUser.status === 'banned' ? 'primary' : 'secondary'}
                  className={`flex-1 py-3 text-center text-xs ${
                    selectedUser.status === 'banned' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {selectedUser.status === 'banned' ? 'Restore User' : 'Suspend User'}
                </Button>
              </div>

              <Button
                onClick={() => setSelectedUser(null)}
                variant="outline"
                className="w-full py-3 text-center text-xs border border-slate-200 text-ronda-slate"
              >
                Close Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
