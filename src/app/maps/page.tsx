import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Compass, Globe2, Flag, Lock, Sparkles, Palmtree, Waves } from 'lucide-react';

export const metadata = {
  title: 'Map Games — GuessWhat',
  description: 'How well do you know the world? Test your geography trivia with retro arcade games on GuessWhat.',
};

export default function MapsCategoryPage() {
  return (
    <div className="relative flex-1 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12 max-w-4xl mx-auto w-full space-y-10 z-10 min-h-screen">
      {/* Animated Pixel-Art Tropical Beach Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none" aria-hidden="true">
        {/* Pixel Beach Artwork */}
        <img
          src="/images/animated-beach-bg.jpg"
          alt="Animated Pixel Beach Background"
          className="absolute inset-0 w-full h-full object-cover object-bottom sm:object-center filter brightness-[0.92] contrast-[1.05] saturate-[1.15]"
        />

        {/* Ambient Gradient Overlay for Contrast & Readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(4, 14, 24, 0.72) 0%, rgba(6, 18, 30, 0.40) 35%, rgba(10, 24, 38, 0.48) 65%, rgba(22, 16, 8, 0.75) 100%)',
          }}
        />

        {/* Sky Sun Rays & Atmospheric Sheen */}
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#38bdf8]/20 via-transparent to-transparent pointer-events-none" />

        {/* Sparkling Water Animation Points in the Bay */}
        <div className="absolute top-[42%] left-[45%] w-2 h-2 bg-white rounded-full animate-ping opacity-75" />
        <div className="absolute top-[46%] left-[38%] w-1.5 h-1.5 bg-[#e0f2fe] rounded-full animate-pulse opacity-90 shadow-[0_0_8px_#fff]" />
        <div className="absolute top-[44%] left-[55%] w-2 h-2 bg-[#bae6fd] rounded-full animate-pixel-twinkle opacity-80" />
        <div className="absolute top-[48%] left-[50%] w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-60" style={{ animationDuration: '2.5s' }} />
        
        {/* Warm Golden Sand Shoreline Glow */}
        <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-[#f59e0b]/25 via-[#d97706]/10 to-transparent pointer-events-none" />

        {/* Floating Beach Pixel Sprites */}
        <span className="absolute top-24 left-[8%] text-2xl text-[#38BDF8] select-none animate-float-slow font-pixel drop-shadow-[0_0_10px_rgba(56,189,248,0.7)]">🧭</span>
        <span className="absolute top-44 right-[10%] text-2xl text-[#7DD3FC] select-none animate-float-delayed font-pixel drop-shadow-[0_0_10px_rgba(125,211,252,0.7)]">★</span>
        <span className="absolute bottom-40 left-[12%] text-2xl text-[#FDE047] select-none animate-float-delayed font-pixel drop-shadow-[0_0_12px_rgba(253,224,71,0.8)]">🏝️</span>
        <span className="absolute bottom-20 right-[15%] text-2xl text-[#38BDF8] select-none animate-float-slow font-pixel drop-shadow-[0_0_10px_rgba(56,189,248,0.7)]">🌊</span>
        <span className="absolute top-1/2 right-[6%] text-xl text-[#FDE047] select-none animate-float-slow drop-shadow-[0_0_10px_rgba(253,224,71,0.7)]">⛵</span>
        <span className="absolute bottom-28 left-[6%] text-xl text-[#fb923c] select-none animate-float-delayed drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]">🦀</span>
        
        <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-[#38BDF8] animate-pixel-1 pointer-events-none rounded-xs shadow-[0_0_10px_#38BDF8]" />
        <div className="absolute bottom-1/3 right-1/3 w-2.5 h-2.5 bg-[#FDE047] animate-pixel-2 pointer-events-none rounded-xs shadow-[0_0_12px_#FDE047]" />
        <div className="absolute top-1/2 left-1/5 w-1.5 h-1.5 bg-[#7DD3FC] animate-pixel-twinkle pointer-events-none rounded-xs" />
      </div>

      {/* Top Navigation & Leaderboard Bar */}
      <div className="w-full flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-pixel text-xs text-slate-400 hover:text-[#38BDF8] transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>&lt; ALL CATEGORIES</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 font-pixel text-xs text-[#38BDF8] bg-[#081826] hover:bg-[#0c2438] border border-[#38bdf8]/60 px-3.5 py-1.5 rounded-lg transition-all shadow-[0_0_10px_rgba(56,189,248,0.25)] uppercase"
          >
            <Trophy className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>LEADERBOARD</span>
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto z-10 select-none">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md arcade-badge-beach text-xs font-bold">
          <Compass className="w-3.5 h-3.5 text-[#38BDF8] animate-spin" style={{ animationDuration: '10s' }} />
          <span>CATEGORY 03 • EXPEDITION &amp; GLOBE</span>
        </div>
        
        <h1 className="font-pixel text-4xl sm:text-6xl uppercase tracking-tight leading-tight">
          <span className="pixel-title-guess">MAP </span>
          <span className="pixel-title-skyblue">GAMES</span>
        </h1>
        
        <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
          From sun-drenched coastlines to hidden world capitals. Test your geographical instincts and identify places from satellite and street views.
        </p>
      </div>

      {/* Featured Game in Development */}
      <div className="w-full max-w-2xl mx-auto space-y-3 z-10">
        <div className="font-pixel text-xs uppercase tracking-wider text-[#38BDF8] px-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-xs bg-[#38BDF8] animate-pulse" />
          <span>&gt; FEATURED GEOGRAPHY GAME</span>
        </div>
        
        <div className="pixel-arcade-card-beach p-6 sm:p-8 flex flex-col justify-between relative group transition-all duration-200 hover:-translate-y-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#0c2236] border-2 border-[#38bdf8] flex items-center justify-center text-2xl shadow-[0_0_14px_rgba(56,189,248,0.4)]">
                  <Globe2 className="w-6 h-6 text-[#38BDF8] stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="font-pixel text-2xl sm:text-3xl text-white tracking-tight uppercase pixel-text-white">
                    GUESS THE PLACE
                  </h2>
                  <span className="font-pixel text-[11px] text-[#38BDF8] uppercase tracking-wider">
                    STAGE 03 &bull; SATELLITE &amp; LANDMARKS
                  </span>
                </div>
              </div>
              <span className="font-pixel text-[11px] px-3 py-1 rounded-md uppercase tracking-wider bg-[#38BDF8] text-[#06080d] font-bold shadow-[0_0_10px_#38BDF8]">
                COMING SOON
              </span>
            </div>

            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Can you pinpoint famous landmarks, natural wonders, and world capitals from high-res satellite views and street panoramas? World-scale geography challenges are coming to GuessWhat.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-[#133954] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400 font-pixel flex items-center gap-1.5 uppercase">
              <Sparkles className="w-4 h-4 text-[#38BDF8]" />
              <span>IN ACTIVE DEVELOPMENT FOR UPCOMING RELEASE</span>
            </div>
            <button
              disabled
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#091b2b] border-2 border-[#133954] text-slate-500 font-pixel font-bold text-xs cursor-not-allowed uppercase tracking-wider"
            >
              PLAY MAPS (COMING SOON)
            </button>
          </div>
        </div>
      </div>

      {/* Planned Map Sub-modes */}
      <div className="w-full max-w-2xl mx-auto space-y-3 z-10">
        <div className="font-pixel text-xs uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
          <span>&gt; PLANNED EXPEDITION STAGES</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* World Capitals */}
          <div className="bg-[#081826]/90 rounded-2xl p-5 sm:p-6 border-2 border-dashed border-[#133954] shadow-sm flex flex-col justify-between relative select-none">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0e273d] border border-[#38bdf8]/40 flex items-center justify-center text-[#38BDF8]">
                    <Palmtree className="w-4 h-4" />
                  </div>
                  <h3 className="font-pixel text-lg text-white uppercase">WORLD CAPITALS</h3>
                </div>
                <span className="inline-flex items-center gap-1 font-pixel text-[10px] px-2 py-0.5 rounded bg-[#0b2133] text-slate-400 border border-[#133954] uppercase">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>LOCKED</span>
                </span>
              </div>

              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Test your mental atlas by naming national capitals from skyline outlines, coastal harbors, and aerial clues.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-[#102d44] flex items-center justify-between text-xs text-slate-500 font-pixel uppercase">
              <span>MAPS &bull; IN DEV</span>
              <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]/50" />
            </div>
          </div>

          {/* Flag Frenzy */}
          <div className="bg-[#081826]/90 rounded-2xl p-5 sm:p-6 border-2 border-dashed border-[#133954] shadow-sm flex flex-col justify-between relative select-none">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0e273d] border border-[#38bdf8]/40 flex items-center justify-center text-[#38BDF8]">
                    <Flag className="w-4 h-4" />
                  </div>
                  <h3 className="font-pixel text-lg text-white uppercase">FLAG FRENZY</h3>
                </div>
                <span className="inline-flex items-center gap-1 font-pixel text-[10px] px-2 py-0.5 rounded bg-[#0b2133] text-slate-400 border border-[#133954] uppercase">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>LOCKED</span>
                </span>
              </div>

              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Rapid-fire identification of country and territory flags across all 7 continents against the timer.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-[#102d44] flex items-center justify-between text-xs text-slate-500 font-pixel uppercase">
              <span>MAPS &bull; IN DEV</span>
              <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
