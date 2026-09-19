import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Play, ArrowRight, Lock, Sparkles, Music2, Disc, Mic2, FileText } from 'lucide-react';

export const metadata = {
  title: 'Music Games — GuessWhat',
  description: 'Test your musical ear. Play Guess the Song and guess songs from short audio clips.',
};

export default function MusicCategoryPage() {
  return (
    <div className="relative flex-1 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12 max-w-4xl mx-auto w-full space-y-10 z-10">
      {/* Floating green pixel background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <span className="absolute top-24 left-[8%] text-2xl text-[#A8FF3E]/30 select-none animate-float-slow font-pixel">🎵</span>
        <span className="absolute top-44 right-[10%] text-2xl text-[#d7ff75]/30 select-none animate-float-delayed font-pixel">★</span>
        <span className="absolute bottom-36 left-[12%] text-2xl text-[#22c55e]/30 select-none animate-float-delayed font-pixel">🎶</span>
        <span className="absolute bottom-20 right-[15%] text-2xl text-[#A8FF3E]/30 select-none animate-float-slow font-pixel">🕹️</span>
        <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 bg-[#A8FF3E] animate-pixel-1 pointer-events-none rounded-xs shadow-[0_0_8px_#A8FF3E]" />
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-[#d7ff75] animate-pixel-2 pointer-events-none rounded-xs shadow-[0_0_10px_#d7ff75]" />
      </div>

      {/* Top Navigation & Leaderboard Bar */}
      <div className="w-full flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-pixel text-xs text-slate-400 hover:text-[#A8FF3E] transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>&lt; ALL CATEGORIES</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 font-pixel text-xs text-[#A8FF3E] bg-[#0c1811] hover:bg-[#12281a] border border-[#22c55e]/60 px-3.5 py-1.5 rounded-lg transition-all shadow-[0_0_10px_rgba(34,197,94,0.2)] uppercase"
          >
            <Trophy className="w-3.5 h-3.5 text-[#A8FF3E]" />
            <span>LEADERBOARD</span>
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto z-10 select-none">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md arcade-badge text-xs font-bold">
          <Disc className="w-3.5 h-3.5 text-[#A8FF3E] animate-spin" style={{ animationDuration: '6s' }} />
          <span>CATEGORY 01 • AUDIO ARCADE</span>
        </div>
        
        <h1 className="font-pixel text-4xl sm:text-6xl uppercase tracking-tight leading-tight">
          <span className="pixel-title-guess">MUSIC </span>
          <span className="pixel-title-what">GAMES</span>
        </h1>
        
        <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
          Test your musical ear. Listen to sub-second audio snippets, identify chart-topping tracks, and climb the leaderboards.
        </p>
      </div>

      {/* Primary Active Game: Guess the Song */}
      <div className="w-full max-w-2xl mx-auto space-y-3 z-10">
        <div className="font-pixel text-xs uppercase tracking-wider text-[#A8FF3E] px-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-xs bg-[#A8FF3E] animate-pulse" />
          <span>&gt; ACTIVE ARCADE GAME</span>
        </div>
        
        <div className="pixel-arcade-card p-6 sm:p-8 flex flex-col justify-between relative group transition-all duration-200 hover:-translate-y-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#102417] border-2 border-[#22c55e] flex items-center justify-center text-2xl shadow-[0_0_14px_rgba(168,255,62,0.4)]">
                  <Music2 className="w-6 h-6 text-[#A8FF3E] stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="font-pixel text-2xl sm:text-3xl text-white tracking-tight uppercase pixel-text-white">
                    GUESS THE SONG
                  </h2>
                  <span className="font-pixel text-[11px] text-[#A8FF3E] uppercase tracking-wider">
                    STAGE 01 &bull; AUDIO SPRINT
                  </span>
                </div>
              </div>
              <span className="font-pixel text-[11px] px-3 py-1 rounded-md uppercase tracking-wider bg-[#A8FF3E] text-[#06080d] font-bold shadow-[0_0_10px_#A8FF3E]">
                ACTIVE NOW
              </span>
            </div>

            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Identify songs from short audio snippets. Pick your difficulty tier, train your reflexes, and build an unbeatable daily streak.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-[#1d3d28]">
            <Link
              href="/music/banger"
              className="w-full py-4 px-6 arcade-btn-green font-bold text-sm flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-[#06080d] ml-0.5" />
              <span>PLAY GUESS THE SONG</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[2.8]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Upcoming Games Grid */}
      <div className="w-full max-w-2xl mx-auto space-y-3 z-10">
        <div className="font-pixel text-xs uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
          <span>&gt; MORE MUSIC STAGES (IN DEVELOPMENT)</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Guess the Artist */}
          <div className="bg-[#09110d]/90 rounded-2xl p-5 sm:p-6 border-2 border-dashed border-[#1d3d28] shadow-sm flex flex-col justify-between relative select-none">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0e1c14] border border-[#22c55e]/40 flex items-center justify-center text-[#A8FF3E]">
                    <Mic2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-pixel text-lg text-white uppercase">GUESS THE ARTIST</h3>
                </div>
                <span className="inline-flex items-center gap-1 font-pixel text-[10px] px-2 py-0.5 rounded bg-[#131f18] text-slate-400 border border-[#1d3d28] uppercase">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>LOCKED</span>
                </span>
              </div>

              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Identify legendary artists and bands from album art hints, genre tags, and discography clues.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-[#162a1e] flex items-center justify-between text-xs text-slate-500 font-pixel uppercase">
              <span>MUSIC &bull; IN DEV</span>
              <Sparkles className="w-3.5 h-3.5 text-[#A8FF3E]/50" />
            </div>
          </div>

          {/* Guess the Lyrics */}
          <div className="bg-[#09110d]/90 rounded-2xl p-5 sm:p-6 border-2 border-dashed border-[#1d3d28] shadow-sm flex flex-col justify-between relative select-none">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0e1c14] border border-[#22c55e]/40 flex items-center justify-center text-[#A8FF3E]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="font-pixel text-lg text-white uppercase">GUESS THE LYRICS</h3>
                </div>
                <span className="inline-flex items-center gap-1 font-pixel text-[10px] px-2 py-0.5 rounded bg-[#131f18] text-slate-400 border border-[#1d3d28] uppercase">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>LOCKED</span>
                </span>
              </div>

              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Fill in the blanks of iconic choruses and unforgettable verses against the clock.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-[#162a1e] flex items-center justify-between text-xs text-slate-500 font-pixel uppercase">
              <span>MUSIC &bull; IN DEV</span>
              <Sparkles className="w-3.5 h-3.5 text-[#A8FF3E]/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
