import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Clapperboard, Film, MessageSquareQuote, Lock, Sparkles, Popcorn } from 'lucide-react';

export const metadata = {
  title: 'Movie Games — GuessWhat',
  description: 'Think you know your movies? Test your cinema trivia with retro arcade games on GuessWhat.',
};

export default function MoviesCategoryPage() {
  return (
    <div className="relative flex-1 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12 max-w-4xl mx-auto w-full space-y-10 z-10">
      {/* Floating warm orange pixel background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <span className="absolute top-24 left-[8%] text-2xl text-[#FB923C]/30 select-none animate-float-slow font-pixel">🎬</span>
        <span className="absolute top-44 right-[10%] text-2xl text-[#FDBA74]/30 select-none animate-float-delayed font-pixel">★</span>
        <span className="absolute bottom-36 left-[12%] text-2xl text-[#EA580C]/30 select-none animate-float-delayed font-pixel">🍿</span>
        <span className="absolute bottom-20 right-[15%] text-2xl text-[#FB923C]/30 select-none animate-float-slow font-pixel">🎞️</span>
        <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 bg-[#FB923C] animate-pixel-1 pointer-events-none rounded-xs shadow-[0_0_8px_#FB923C]" />
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-[#FDBA74] animate-pixel-2 pointer-events-none rounded-xs shadow-[0_0_10px_#FDBA74]" />
      </div>

      {/* Top Navigation & Leaderboard Bar */}
      <div className="w-full flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-pixel text-xs text-slate-400 hover:text-[#FB923C] transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>&lt; ALL CATEGORIES</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 font-pixel text-xs text-[#FB923C] bg-[#1a100c] hover:bg-[#261610] border border-[#f97316]/60 px-3.5 py-1.5 rounded-lg transition-all shadow-[0_0_10px_rgba(249,115,22,0.2)] uppercase"
          >
            <Trophy className="w-3.5 h-3.5 text-[#FB923C]" />
            <span>LEADERBOARD</span>
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto z-10 select-none">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md arcade-badge-orange text-xs font-bold">
          <Clapperboard className="w-3.5 h-3.5 text-[#FB923C]" />
          <span>CATEGORY 02 • CINEMA ARCADE</span>
        </div>
        
        <h1 className="font-pixel text-4xl sm:text-6xl uppercase tracking-tight leading-tight">
          <span className="pixel-title-guess">MOVIE </span>
          <span className="pixel-title-orange">GAMES</span>
        </h1>
        
        <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
          Think you know your cinema? Test your movie knowledge from iconic film themes and quotes to zoomed-in scene reveals.
        </p>
      </div>

      {/* Featured Game in Development */}
      <div className="w-full max-w-2xl mx-auto space-y-3 z-10">
        <div className="font-pixel text-xs uppercase tracking-wider text-[#FB923C] px-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-xs bg-[#FB923C] animate-pulse" />
          <span>&gt; FEATURED CINEMA GAME</span>
        </div>
        
        <div className="pixel-arcade-card-orange p-6 sm:p-8 flex flex-col justify-between relative group transition-all duration-200 hover:-translate-y-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#26140e] border-2 border-[#f97316] flex items-center justify-center text-2xl shadow-[0_0_14px_rgba(249,115,22,0.4)]">
                  <Film className="w-6 h-6 text-[#FB923C] stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="font-pixel text-2xl sm:text-3xl text-white tracking-tight uppercase pixel-text-white">
                    GUESS THE MOVIE
                  </h2>
                  <span className="font-pixel text-[11px] text-[#FB923C] uppercase tracking-wider">
                    STAGE 02 &bull; SCENES &amp; SOUNDTRACKS
                  </span>
                </div>
              </div>
              <span className="font-pixel text-[11px] px-3 py-1 rounded-md uppercase tracking-wider bg-[#FB923C] text-[#06080d] font-bold shadow-[0_0_10px_#FB923C]">
                COMING SOON
              </span>
            </div>

            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Can you recognize unforgettable movies from orchestral themes, teaser dialogue, and subtle scene clues? We are building an extensive library of legendary film moments.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-[#3b1c14] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400 font-pixel flex items-center gap-1.5 uppercase">
              <Sparkles className="w-4 h-4 text-[#FB923C]" />
              <span>IN ACTIVE DEVELOPMENT FOR UPCOMING RELEASE</span>
            </div>
            <button
              disabled
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#1d110d] border-2 border-[#3b1c14] text-slate-500 font-pixel font-bold text-xs cursor-not-allowed uppercase tracking-wider"
            >
              PLAY MOVIES (COMING SOON)
            </button>
          </div>
        </div>
      </div>

      {/* Planned Movie Sub-modes */}
      <div className="w-full max-w-2xl mx-auto space-y-3 z-10">
        <div className="font-pixel text-xs uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
          <span>&gt; PLANNED CINEMA STAGES</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Guess the Scene */}
          <div className="bg-[#120b08]/90 rounded-2xl p-5 sm:p-6 border-2 border-dashed border-[#3b1c14] shadow-sm flex flex-col justify-between relative select-none">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#20110c] border border-[#f97316]/40 flex items-center justify-center text-[#FB923C]">
                    <Popcorn className="w-4 h-4" />
                  </div>
                  <h3 className="font-pixel text-lg text-white uppercase">GUESS THE SCENE</h3>
                </div>
                <span className="inline-flex items-center gap-1 font-pixel text-[10px] px-2 py-0.5 rounded bg-[#1f100b] text-slate-400 border border-[#3b1c14] uppercase">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>LOCKED</span>
                </span>
              </div>

              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Identify landmark films from zoomed-in frame teasers and progressive visual reveals.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-[#26130d] flex items-center justify-between text-xs text-slate-500 font-pixel uppercase">
              <span>MOVIES &bull; IN DEV</span>
              <Sparkles className="w-3.5 h-3.5 text-[#FB923C]/50" />
            </div>
          </div>

          {/* Quote Master */}
          <div className="bg-[#120b08]/90 rounded-2xl p-5 sm:p-6 border-2 border-dashed border-[#3b1c14] shadow-sm flex flex-col justify-between relative select-none">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#20110c] border border-[#f97316]/40 flex items-center justify-center text-[#FB923C]">
                    <MessageSquareQuote className="w-4 h-4" />
                  </div>
                  <h3 className="font-pixel text-lg text-white uppercase">QUOTE MASTER</h3>
                </div>
                <span className="inline-flex items-center gap-1 font-pixel text-[10px] px-2 py-0.5 rounded bg-[#1f100b] text-slate-400 border border-[#3b1c14] uppercase">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>LOCKED</span>
                </span>
              </div>

              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Match legendary lines and one-liners to the correct iconic movies and characters.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-[#26130d] flex items-center justify-between text-xs text-slate-500 font-pixel uppercase">
              <span>MOVIES &bull; IN DEV</span>
              <Sparkles className="w-3.5 h-3.5 text-[#FB923C]/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
