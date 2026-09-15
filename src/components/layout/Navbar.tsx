'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, Trophy, Play, Music, Users, HelpCircle, Settings, Menu, X, User, Sparkles } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    fetch('/api/v1/auth/session')
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && json?.data?.streak) {
          setStreak(json.data.streak.current || 0);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const navItems = [
    { label: 'Daily', href: '/daily', icon: Flame, color: 'text-amber-600' },
    { label: 'Unlimited', href: '/unlimited', icon: Play, color: 'text-amber-700' },
    { label: 'Challenge', href: '/challenge/new', icon: Users, color: 'text-orange-600' },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy, color: 'text-yellow-700' },
    { label: 'How It Works', href: '/how-it-works', icon: HelpCircle, color: 'text-amber-600' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-amber-200/80 shadow-[0_2px_12px_rgba(234,179,8,0.06)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-0.5 shadow-md shadow-amber-400/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Music className="w-5 h-5 text-amber-600 stroke-[2.5] group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <span className="font-black text-xl tracking-tight text-slate-900">
            Song<span className="text-amber-500">Sprint</span>
            <span className="inline-block ml-1 text-sm font-black text-amber-500 animate-bounce">⚡</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  isActive
                    ? 'bg-amber-100 text-amber-950 border-2 border-amber-300 shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-amber-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? item.color : 'text-amber-500'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Streak & Settings */}
        <div className="flex items-center gap-2.5">
          {/* Streak pill */}
          <Link
            href="/profile"
            title="Daily Streak"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-950 text-xs font-black hover:bg-amber-200/80 transition-all shadow-xs active:scale-95"
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>{streak} Streak</span>
          </Link>

          {/* Settings */}
          <Link
            href="/settings"
            title="Settings"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-amber-50 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t-2 border-amber-200 px-4 pt-3 pb-5 space-y-1 bg-white shadow-xl animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-black transition-all ${
                  isActive
                    ? 'bg-amber-100 text-amber-950 border-2 border-amber-300'
                    : 'text-slate-700 hover:bg-amber-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.color}`} />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-3 mt-2 border-t border-amber-100 flex justify-around">
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-xs font-black text-slate-700 hover:text-amber-600 py-1"
            >
              <User className="w-4 h-4" /> Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-xs font-black text-slate-700 hover:text-amber-600 py-1"
            >
              <Settings className="w-4 h-4" /> Settings
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
