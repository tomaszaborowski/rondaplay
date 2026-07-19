"use client";

import React, { useState } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { 
  DollarSign, 
  CircleDollarSign, 
  Tv, 
  Smartphone, 
  Search, 
  TrendingUp, 
  CreditCard,
  Percent
} from 'lucide-react';

export default function MonetizationAnalytics() {
  const transactions = useAdminStore((state) => state.transactions);

  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'Stripe' | 'Apple'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'failed'>('all');

  // Stats Calculations
  const completedTx = transactions.filter(t => t.status === 'completed');
  const totalRevenue = completedTx.reduce((sum, t) => sum + t.amount, 0);
  
  const stripeRevenue = completedTx.filter(t => t.platform === 'Stripe').reduce((sum, t) => sum + t.amount, 0);
  const appleRevenue = completedTx.filter(t => t.platform === 'Apple').reduce((sum, t) => sum + t.amount, 0);

  const stripePercent = totalRevenue > 0 ? (stripeRevenue / totalRevenue) * 100 : 0;
  const applePercent = totalRevenue > 0 ? (appleRevenue / totalRevenue) * 100 : 0;

  // Funnel Data
  const funnelSteps = [
    { stage: '1. Landing Page Visitors', value: 1250, conversion: '100%', sub: 'Global Web Traffic' },
    { stage: '2. Web Account Signups', value: 680, conversion: '54.4%', sub: '54.4% of traffic' },
    { stage: '3. Premium Purchases (Web)', value: 180, conversion: '14.4%', sub: '26.4% of signups' },
    { stage: '4. Mobile App Logins', value: 145, conversion: '11.6%', sub: '80.5% of buyers deep-linked' }
  ];

  // Filters
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.email.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === 'all' ? true : t.platform === platformFilter;
    const matchesStatus = statusFilter === 'all' ? true : t.status === statusFilter;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  return (
    <div className="space-y-8 font-body">
      {/* HIGHLIGHT METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">Total Sales Revenue</span>
            <span className="text-3xl font-extrabold text-ronda-purple font-brand block">${totalRevenue.toFixed(2)}</span>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Gross payment logs
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-ronda-teal/10 flex items-center justify-center text-ronda-teal">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Stripe Share (Web Purchases) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">Web Revenue (Stripe)</span>
            <span className="text-3xl font-extrabold text-ronda-teal font-brand block">${stripeRevenue.toFixed(2)}</span>
            <span className="text-[10px] text-ronda-teal font-bold block">
              {stripePercent.toFixed(1)}% share (0% App Store fees)
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-ronda-teal/10 flex items-center justify-center text-ronda-teal">
            <Tv className="w-6 h-6" />
          </div>
        </div>

        {/* Apple Share (In-App Purchases) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">App Revenue (Apple)</span>
            <span className="text-3xl font-extrabold text-ronda-pink font-brand block">${appleRevenue.toFixed(2)}</span>
            <span className="text-[10px] text-ronda-pink font-bold block">
              {applePercent.toFixed(1)}% share (30% fee applied)
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-ronda-pink/10 flex items-center justify-center text-ronda-pink">
            <Smartphone className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* WEB2APP FUNNEL CHART & METRICS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-ronda-purple font-brand mb-6">Web2App Conversion Funnel</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
          {funnelSteps.map((step, idx) => (
            <div key={step.stage} className="bg-slate-50 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden border border-slate-100">
              {/* Step indicator arrow */}
              {idx < 3 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 bg-slate-200 w-6 h-6 rounded-full flex items-center justify-center border border-white z-10 text-[10px] font-bold text-slate-500">
                  →
                </div>
              )}

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{step.stage}</span>
                <span className="text-2xl font-extrabold text-ronda-purple font-brand block">{step.value}</span>
                <p className="text-xs text-slate-500 font-semibold">{step.sub}</p>
              </div>

              <div className="mt-6 flex items-center gap-1 text-xs font-extrabold text-ronda-teal">
                <Percent className="w-4 h-4" /> {step.conversion} conversion
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TRANSACTION DATABASE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-ronda-purple font-brand">Payment Transaction Log</h3>
            <p className="text-xs text-slate-400 font-semibold">Search and filter real-time Stripe/Apple logs</p>
          </div>

          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs w-full sm:w-60 focus-within:border-ronda-teal transition-colors">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search email/tx ID..."
                className="bg-transparent border-none outline-none text-xs w-full text-ronda-slate font-semibold"
              />
            </div>

            {/* Platform filter */}
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value as 'all' | 'Stripe' | 'Apple')}
              className="px-3 py-2 rounded-xl border border-slate-200 focus:border-ronda-teal outline-none text-xs font-bold text-slate-500 bg-white"
            >
              <option value="all">All Channels</option>
              <option value="Stripe">Stripe (Web)</option>
              <option value="Apple">Apple (App)</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'completed' | 'failed')}
              className="px-3 py-2 rounded-xl border border-slate-200 focus:border-ronda-teal outline-none text-xs font-bold text-slate-500 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Success Only</option>
              <option value="failed">Failed Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-semibold text-ronda-slate border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-4 px-2">TX ID</th>
                <th className="py-4">Email Address</th>
                <th className="py-4">Amount</th>
                <th className="py-4">Channel</th>
                <th className="py-4">Timestamp</th>
                <th className="py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-2 font-mono text-xs text-slate-400">{tx.id}</td>
                  <td className="py-4 text-ronda-purple font-bold">{tx.email}</td>
                  <td className="py-4 font-extrabold text-slate-700">${tx.amount.toFixed(2)}</td>
                  <td className="py-4">
                    {tx.platform === 'Stripe' ? (
                      <span className="px-2.5 py-1 bg-ronda-teal/10 text-ronda-teal rounded-md text-[9px] font-extrabold uppercase">Stripe (Web)</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-ronda-pink/10 text-ronda-pink rounded-md text-[9px] font-extrabold uppercase">Apple Pay (App)</span>
                    )}
                  </td>
                  <td className="py-4 text-xs text-slate-400 font-normal">{tx.timestamp}</td>
                  <td className="py-4">
                    {tx.status === 'completed' ? (
                      <span className="text-emerald-600 bg-emerald-50 text-[10px] font-bold px-2.5 py-1 rounded-full">Success</span>
                    ) : (
                      <span className="text-red-600 bg-red-50 text-[10px] font-bold px-2.5 py-1 rounded-full font-mono">Declined</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
