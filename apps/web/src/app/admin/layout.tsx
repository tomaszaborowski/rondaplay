"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/adminStore';
import { 
  LayoutDashboard, 
  Gamepad2, 
  Users, 
  CircleDollarSign, 
  ShieldAlert, 
  Menu, 
  ChevronLeft, 
  LogOut,
  User,
  Search,
  Bell,
  Settings,
  Languages,
  FileText
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoggedIn = useAdminStore((state) => state.isLoggedIn);
  const logout = useAdminStore((state) => state.logout);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsMounted(true);
    }, 0);
  }, []);

  // Redirect to login if not authenticated (skip for login page itself)
  useEffect(() => {
    if (isMounted && !isLoggedIn && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isMounted, isLoggedIn, pathname, router]);

  // If loading client state, show simple spinner
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-ronda-slate flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-ronda-teal"></div>
      </div>
    );
  }

  // If rendering the login screen, bypass Layout structures
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // If not logged in and not at login page, show temporary guard
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-ronda-slate flex items-center justify-center">
        <div className="text-white text-lg font-bold">Redirecting to login...</div>
      </div>
    );
  }

  const navItems = [
    { name: 'Executive Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Game CMS Manager', path: '/admin/games', icon: Gamepad2 },
    { name: 'User Directory', path: '/admin/users', icon: Users },
    { name: 'Web2App Analytics', path: '/admin/monetization', icon: CircleDollarSign },
    { name: 'Content Moderation', path: '/admin/moderation', icon: ShieldAlert },
    { name: 'Translations', path: '/admin/translations', icon: Languages },
    { name: 'Page Manager', path: '/admin/pages', icon: FileText },
    { name: 'Admins & Avatars', path: '/admin/settings/portal', icon: User },
    { name: 'General Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const getPageTitle = () => {
    const activeItem = navItems.find(item => item.path === pathname);
    return activeItem ? activeItem.name : 'Admin Portal';
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex font-body select-none">
      {/* LEFT SIDEBAR - Deep Purple Background */}
      <aside 
        className={`bg-ronda-purpleDark text-white flex flex-col justify-between transition-all duration-300 relative border-r border-purple-900/30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-ronda-teal hover:bg-ronda-tealDark text-white w-6 h-6 rounded-full flex items-center justify-center border border-white cursor-pointer z-50 transition-colors shadow-md"
        >
          {isCollapsed ? <Menu className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-purple-900/30 flex items-center justify-center">
            {isCollapsed ? (
              <span className="text-xl font-bold font-brand text-ronda-teal animate-pulse">RP</span>
            ) : (
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="Ronda Play Logo"
                  width={130}
                  height={40}
                  priority
                  className="h-8 w-auto brightness-200"
                />
              </Link>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all relative group cursor-pointer ${
                    isActive 
                      ? 'bg-ronda-teal text-white shadow-md shadow-ronda-teal/20' 
                      : 'text-purple-100/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-ronda-pink group-hover:scale-110 transition-transform'}`} />
                  
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                  
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 bg-ronda-slate text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg border border-slate-700">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar / Logout */}
        <div className="p-4 border-t border-purple-900/30">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* RIGHT CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER TOP BAR */}
        <header className="bg-white border-b border-slate-100 h-20 px-8 flex justify-between items-center z-10 shadow-sm">
          {/* Page Title */}
          <div className="flex items-center gap-4">
            <h1 className="text-xl md:text-2xl font-bold text-ronda-purple font-brand select-none">
              {getPageTitle()}
            </h1>
          </div>

          {/* Search, Notifications & Profile */}
          <div className="flex items-center gap-6">
            {/* Global Search Bar */}
            <div className="hidden sm:flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 w-64 focus-within:border-ronda-teal transition-colors">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Global search..."
                className="bg-transparent border-none outline-none text-xs w-full text-ronda-slate font-semibold"
                disabled
              />
            </div>

            {/* Notification Badge */}
            <button className="relative p-2 text-slate-400 hover:text-ronda-purple transition-colors cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-ronda-pink rounded-full border border-white"></span>
            </button>

            {/* Admin Profile Details */}
            <div className="flex items-center gap-3 border-l border-slate-100 pl-6 select-none">
              <div className="w-9 h-9 rounded-full bg-ronda-teal/10 flex items-center justify-center text-ronda-teal font-bold text-sm">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-ronda-slate">Admin Manager</div>
                <div className="text-[10px] font-semibold text-slate-400">admin@rondaplay.com</div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY SCROLL VIEW */}
        <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
