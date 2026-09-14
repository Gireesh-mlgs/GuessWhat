'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, Trophy, Play, Music, Users, HelpCircle, Settings, Menu, X, User } from 'lucide-react';

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
    { label: 'Daily', href: '/daily', icon: Flame },
    { label: 'Unlimited', href: '/unlimited', icon: Play },
    { label: 'Challenge', href: '/challenge/new', icon: Users },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { label: 'How It Works', href: '/how-it-works', icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Music className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-300">
            Song<span className="text-cyan-400">Sprint</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Streak & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak pill */}
          <Link
            href="/profile"
            title="Daily Streak"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition-all"
          >
            <Flame className="w-4 h-4 text-amber-400 animate-pulse fill-amber-400/30" />
            <span>{streak}</span>
          </Link>

          {/* Settings / Profile link */}
          <Link
            href="/settings"
            title="Settings & Privacy"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 px-4 pt-2 pb-4 space-y-1 bg-slate-950/95 backdrop-blur-xl animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5 text-cyan-400" />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-white/10 flex justify-around">
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white py-1.5"
            >
              <User className="w-4 h-4" /> Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white py-1.5"
            >
              <Settings className="w-4 h-4" /> Settings
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
