import React from 'react';
import { Music, ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/90 text-slate-400 py-10 px-4 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
        {/* Brand statement */}
        <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
          <div className="flex items-center gap-2 font-bold text-white">
            <Music className="w-4 h-4 text-cyan-400" />
            SongSprint
          </div>
          <p className="text-xs text-slate-500 max-w-sm">
            Browser-first music recognition game. Server-authoritative, privacy-first, and strictly lawful audio previews.
          </p>
        </div>

        {/* Legal & Compliance statement */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-full border border-white/5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Audited CC-BY 4.0 & Royalty-Free Audio Previews</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-5 text-xs">
          <a href="/how-it-works" className="hover:text-cyan-400 transition-colors">
            Game Rules & FAQ
          </a>
          <a href="/settings" className="hover:text-cyan-400 transition-colors">
            Privacy Controls
          </a>
          <a href="/leaderboard" className="hover:text-cyan-400 transition-colors">
            Leaderboard Policy
          </a>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-white/5 text-center text-xs text-slate-600">
        SongSprint &copy; {new Date().getFullYear()} &bull; Original product and interaction design.
      </div>
    </footer>
  );
}
