import React from 'react';
import Link from 'next/link';
import { Music, ArrowRight } from 'lucide-react';

export function MusicCategoryCard() {
  return (
    <Link
      href="/music"
      className="ios-glass-card group cursor-pointer select-none"
    >
      {/* Rainbow Hovering Glow & Border */}
      <div className="rainbow-glow" />
      <div className="rainbow-border" />

      {/* iOS Glass Inner Surface */}
      <div className="glass-inner">
        <div className="flex flex-col items-center w-full mt-2">
          {/* Music Icon Pod */}
          <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl flex items-center justify-center mb-3 bg-white/[0.08] border border-white/25 shadow-sm text-white/90 group-hover:border-white/40 group-hover:bg-white/[0.14] transition-all duration-300">
            <Music className="w-8 h-8 stroke-[1.75]" />
          </div>

          {/* Category Title */}
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider mb-2">
            MUSIC
          </h2>

          {/* Description */}
          <p className="text-slate-200/80 text-xs sm:text-sm leading-relaxed max-w-[190px]">
            Guess songs and bangers.
          </p>
        </div>

        {/* Simple iOS Glass Button */}
        <div className="glass-btn px-5 py-2.5 rounded-full font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 text-white mb-2">
          <span>PLAY MUSIC</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
