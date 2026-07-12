"use client";

import React, { useMemo } from 'react';
import { useAdminStore } from '@/store/adminStore';
import Link from 'next/link';
import { 
  Users as UsersIcon, 
  Tv, 
  Smartphone, 
  DollarSign, 
  PlayCircle,
  TrendingUp,
  ArrowRight,
  TrendingDown
} from 'lucide-react';

export default function ExecutiveDashboard() {
  const users = useAdminStore((state) => state.users);
  const transactions = useAdminStore((state) => state.transactions);

  // Calculations
  const totalUsers = users.length;
  const premiumUsers = users.filter((u) => u.isPremium);
  
  const webSubs = premiumUsers.filter((u) => u.premiumSource === 'web').length;
  const appSubs = premiumUsers.filter((u) => u.premiumSource === 'app').length;
  
  const mrr = premiumUsers.length * 14.99;
  const totalSessions = users.reduce((sum, u) => sum + u.totalSessions, 0);

  // DAU Mock Data for last 30 days
  const dauData = useMemo(() => {
    return [
      120, 135, 142, 130, 150, 165, 172, 160, 185, 198,
      210, 195, 220, 245, 230, 260, 285, 272, 310, 325,
      340, 315, 335, 360, 385, 372, 410, 435, 422, 450
    ];
  }, []);

  const maxDau = Math.max(...dauData);

  // SVG Line Chart coordinates helper
  const linePath = useMemo(() => {
    const width = 500;
    const height = 150;
    const padding = 20;
    const points = dauData.map((val, idx) => {
      const x = padding + (idx / (dauData.length - 1)) * (width - padding * 2);
      const y = height - padding - (val / maxDau) * (height - padding * 2);
      return `${x},${y}`;
    });
    return points.join(' ');
  }, [dauData, maxDau]);

  // SVG Area Chart coordinates helper
  const areaPath = useMemo(() => {
    const width = 500;
    const height = 150;
    const padding = 20;
    const points = dauData.map((val, idx) => {
      const x = padding + (idx / (dauData.length - 1)) * (width - padding * 2);
      const y = height - padding - (val / maxDau) * (height - padding * 2);
      return `${x},${y}`;
    });
    const startX = padding;
    const endX = padding + (dauData.length - 1) * ((width - padding * 2) / (dauData.length - 1));
    const baseY = height - padding;
    return `${startX},${baseY} ${points.join(' ')} ${endX},${baseY}`;
  }, [dauData, maxDau]);

  // Conversion Funnel Data
  // Landing Page -> Web Signups -> Premium Buy -> App Login
  const funnelSteps = [
    { name: 'Landing Visitors', value: 1250, percent: 100, color: 'bg-ronda-purple' },
    { name: 'Web Signups', value: 680, percent: 54, color: 'bg-ronda-teal' },
    { name: 'Premium Purchases', value: 180, percent: 14, color: 'bg-ronda-pink' },
    { name: 'App Logins', value: 145, percent: 11, color: 'bg-indigo-600' }
  ];

  return (
    <div className="space-y-8">
      {/* TOP ROW KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Total Registered Users */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">Total Users</span>
            <span className="text-3xl font-extrabold text-ronda-purple font-brand block">{totalUsers}</span>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +15% this week
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-ronda-purple/10 flex items-center justify-center text-ronda-purple">
            <UsersIcon className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Web vs App Premium */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">Subscribers</span>
            <span className="text-3xl font-extrabold text-ronda-purple font-brand block">{premiumUsers.length}</span>
            <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-3">
              <span className="flex items-center gap-1 text-ronda-teal"><Tv className="w-3 h-3" /> {webSubs} Web</span>
              <span className="flex items-center gap-1 text-ronda-pink"><Smartphone className="w-3 h-3" /> {appSubs} App</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-ronda-teal/10 flex items-center justify-center text-ronda-teal">
            <Tv className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: MRR */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">Est. MRR</span>
            <span className="text-3xl font-extrabold text-ronda-purple font-brand block">${mrr.toFixed(2)}</span>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +$120.00 today
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-ronda-pink/10 flex items-center justify-center text-ronda-pink">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Total Sessions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">Total Sessions</span>
            <span className="text-3xl font-extrabold text-ronda-purple font-brand block">{totalSessions}</span>
            <span className="text-[10px] text-indigo-500 font-bold flex items-center gap-1">
              <PlayCircle className="w-3.5 h-3.5" /> 4.2 sessions/user avg
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <PlayCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* CHARTS CONTAINER SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CHART 1: Daily Active Users (DAU) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[320px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-ronda-purple font-brand">Daily Active Users</h3>
              <p className="text-xs text-slate-400 font-semibold">Active player logs (last 30 days)</p>
            </div>
            <div className="bg-emerald-50 text-emerald-700 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +25% Month-over-Month
            </div>
          </div>
          {/* Custom SVG Line Chart */}
          <div className="flex-1 w-full min-h-[160px] relative">
            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="dauAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34c2b2" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#34c2b2" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="20" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="20" y1="65" x2="480" y2="65" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="20" y1="110" x2="480" y2="110" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="20" y1="130" x2="480" y2="130" stroke="#e2e8f0" strokeWidth="1.5" />
              
              {/* Shaded Area under path */}
              <polygon points={areaPath} fill="url(#dauAreaGradient)" />
              {/* Line path */}
              <polyline points={linePath} fill="none" stroke="#34c2b2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Interactive Endpoint Circle */}
              <circle cx="480" cy={130 - (dauData[29] / maxDau) * 110} r="5" fill="#34c2b2" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold pt-4">
            <span>30 Days Ago</span>
            <span>15 Days Ago</span>
            <span>Today ({dauData[29]} DAU)</span>
          </div>
        </div>

        {/* CHART 2: Web2App Conversion Funnel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[320px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-ronda-purple font-brand">Web2App Conversion</h3>
              <p className="text-xs text-slate-400 font-semibold">User progression funnel stages</p>
            </div>
            <div className="bg-indigo-50 text-indigo-700 font-bold text-xs px-2.5 py-1 rounded-full">
              Overall CR: 11.6%
            </div>
          </div>

          {/* Vertical Funnel visualizer */}
          <div className="flex-1 flex flex-col justify-center space-y-4">
            {funnelSteps.map((step) => (
              <div key={step.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-ronda-slate">
                  <span>{step.name}</span>
                  <span className="text-slate-400 font-bold">{step.value} <span className="text-ronda-purple">({step.percent}%)</span></span>
                </div>
                <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden">
                  <div 
                    className={`${step.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${step.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-slate-400 font-semibold text-center pt-4">
            Funnel tracking based on unique cookies matching Stripe transaction tags.
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-ronda-purple font-brand">Recent Transactions</h3>
            <p className="text-xs text-slate-400 font-semibold">Stripe and App Store payment sync</p>
          </div>
          <Link href="/admin/monetization" className="text-ronda-teal hover:text-ronda-tealDark font-bold text-xs flex items-center gap-1.5 transition-colors">
            See All Sales <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-semibold text-ronda-slate border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-4">Transaction ID</th>
                <th className="py-4">Email</th>
                <th className="py-4">Amount</th>
                <th className="py-4">Platform</th>
                <th className="py-4">Timestamp</th>
                <th className="py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 font-mono text-xs">{tx.id}</td>
                  <td className="py-4">{tx.email}</td>
                  <td className="py-4 text-ronda-purple">${tx.amount.toFixed(2)}</td>
                  <td className="py-4 flex items-center gap-1.5">
                    {tx.platform === 'Stripe' ? (
                      <span className="px-2.5 py-1 bg-ronda-teal/10 text-ronda-teal rounded-md text-[10px] font-bold">Stripe</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-ronda-pink/10 text-ronda-pink rounded-md text-[10px] font-bold">Apple</span>
                    )}
                  </td>
                  <td className="py-4 text-xs text-slate-400">{tx.timestamp}</td>
                  <td className="py-4">
                    {tx.status === 'completed' ? (
                      <span className="text-emerald-600 bg-emerald-50 text-[10px] font-bold px-2 py-1 rounded-full">Success</span>
                    ) : (
                      <span className="text-red-600 bg-red-50 text-[10px] font-bold px-2 py-1 rounded-full">Failed</span>
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
