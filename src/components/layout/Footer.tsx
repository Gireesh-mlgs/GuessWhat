import React from 'react';
import { Music, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t-2 border-amber-200/70 bg-white/80 text-slate-600 py-10 px-4 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
        {/* Brand statement */}
        <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
          <div className="flex items-center gap-2 font-black text-slate-900 text-base">
            <div className="w-7 h-7 rounded-xl bg-amber-300 border border-amber-400 flex items-center justify-center shadow-2xs">
              <Music className="w-4 h-4 text-amber-950 stroke-[2.5]" />
            </div>
            SongSprint
          </div>
          <p className="text-xs text-slate-600 max-w-sm font-semibold">
            Fast-paced musical guessing game. Listen, guess, and test your beat recognition reflexes!
          </p>
        </div>

        {/* Legal & Compliance statement */}
        <div className="flex items-center gap-1.5 text-xs text-amber-950 bg-amber-100/90 px-3.5 py-1.5 rounded-full border-2 border-amber-300 font-bold">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Audited CC-BY 4.0 & Royalty-Free Audio Previews</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-5 text-xs font-black text-slate-700">
          <a href="/how-it-works" className="hover:text-amber-600 transition-colors">
            Rules & FAQ
          </a>
          <a href="/settings" className="hover:text-amber-600 transition-colors">
            Privacy
          </a>
          <a href="/leaderboard" className="hover:text-amber-600 transition-colors">
            Leaderboard
          </a>
        </div>
      </div>
      <div className="max-w-5xl mx-auto mt-6 pt-6 border-t border-amber-100 text-center text-xs text-slate-500 font-semibold">
        SongSprint &copy; {new Date().getFullYear()} &bull; Guess the beat, master the rhythm! ⚡
      </div>
    </footer>
  );
}
