'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  // On the main landing page, the design has a dedicated minimal tagline and no bottom footer block
  if (pathname === '/') {
    return null;
  }

  return (
    <footer className="border-t border-white/[0.08] bg-[#06080d]/90 text-slate-400 py-10 px-4 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
        {/* Brand statement */}
        <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
          <div className="flex items-center gap-2 font-black text-white text-base">
            <span>
              Guess<span className="xbox-glass-navbar">What</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm">
            How well do you know the world? Guess songs, movies, places and more in one unified platform.
          </p>
        </div>

        {/* Legal & Compliance statement */}
        <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10 font-medium">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span>Fair Scoring &bull; High-Fidelity Previews</span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-semibold text-slate-300">
          <Link href="/music" className="hover:text-white transition-colors">
            Music
          </Link>
          <Link href="/movies" className="hover:text-white transition-colors">
            Movies
          </Link>
          <Link href="/maps" className="hover:text-white transition-colors">
            Maps
          </Link>
          <Link href="/leaderboard" className="hover:text-white transition-colors">
            Leaderboard
          </Link>
          <Link href="/how-it-works" className="hover:text-white transition-colors">
            Rules
          </Link>
          <Link href="/settings" className="hover:text-white transition-colors">
            Settings
          </Link>
        </div>
      </div>
      <div className="max-w-5xl mx-auto mt-6 pt-6 border-t border-white/[0.06] text-center text-xs text-slate-500 font-medium">
        GuessWhat &copy; {new Date().getFullYear()} &bull; How well do you know the world?
      </div>
    </footer>
  );
}
