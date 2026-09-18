'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Menu, X, Search } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Music', href: '/music' },
    { label: 'Movies', href: '/movies' },
    { label: 'Maps', href: '/maps' },
    { label: 'Leaderboard', href: '/leaderboard' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#06080d]/80 backdrop-blur-md md:bg-transparent md:backdrop-blur-none border-b border-white/[0.04] md:border-none transition-colors">
      <div className="w-full px-6 sm:px-12 lg:px-[70px] h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-1 group">
          <span className="pixel-navbar-brand font-bold text-2xl sm:text-[26px] tracking-tight text-white select-none">
            GUESS<span className="pixel-navbar-what ml-1">WHAT</span>
          </span>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-12 xl:gap-16">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative py-1 text-sm tracking-wide transition-all ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-slate-300/80 hover:text-white font-medium'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action: Search & User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/music"
            aria-label="Search games"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
            title="Search"
          >
            <Search className="w-4 h-4 stroke-[2]" />
          </Link>

          <Link
            href="/profile"
            title="Profile"
            aria-label="Profile"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/20 hover:border-white/50 flex items-center justify-center text-white/90 hover:text-white bg-white/[0.05] hover:bg-white/[0.12] transition-all shadow-sm"
          >
            <User className="w-4 h-4" />
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 px-5 pt-3 pb-5 space-y-1 bg-[#06080d]/95 backdrop-blur-xl shadow-2xl">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white font-bold'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
