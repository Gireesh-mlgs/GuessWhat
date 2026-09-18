import React from 'react';
import { AnimatedAlbumBackground } from '@/components/home/AnimatedAlbumBackground';
import { EditorialPanels } from '@/components/home/EditorialPanels';
import Link from 'next/link';
import { ArrowRight, Globe, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative flex-1 flex flex-col justify-center w-full lg:-mt-20 lg:h-screen min-h-[calc(100vh-5rem)] overflow-hidden">
      {/* LAYER 1: Existing dynamic changing cover-art background - 100% UNTOUCHED */}
      <AnimatedAlbumBackground />

      {/* LAYER 2: Very subtle readability gradient on the left */}
      <div
        className="absolute inset-0 pointer-events-none z-[2] bg-gradient-to-r from-[#06080d]/90 via-[#06080d]/60 to-transparent w-full lg:w-[50%]"
        aria-hidden="true"
      />

      {/* LAYER 4: Hero + Three Cinematic Panels */}
      <div className="relative z-[4] w-full h-full min-h-screen flex flex-col lg:flex-row items-stretch justify-between overflow-hidden">
        {/* LEFT HERO: Left ~40% of viewport with ~70px left margin */}
        <div className="w-full lg:w-[40%] xl:w-[38%] max-w-[560px] h-full min-h-screen flex flex-col justify-between pt-6 pb-6 lg:pt-28 lg:pb-10 px-6 sm:px-12 lg:pl-[70px] lg:pr-4 select-none">
          {/* Top Block: Eyebrow + Title + Subtitle + Buttons */}
          <div className="space-y-4 xl:space-y-5">
            {/* Eyebrow */}
            <div className="text-[11px] font-bold tracking-[0.28em] text-[#D7FF75]/90 uppercase">
              EXPLORE • GUESS • LEARN • REPEAT
            </div>

            {/* Giant Pixel Arcade Title */}
            <div className="relative inline-block select-none">
              {/* Decorative Pixel Particles */}
              <div
                className="absolute -top-3 -left-3 w-2 h-2 bg-[#D7FF75] animate-pixel-1 pointer-events-none rounded-[1px] shadow-[0_0_8px_#D7FF75]"
                aria-hidden="true"
              />
              <div
                className="absolute top-1/2 -right-4 sm:-right-6 w-2.5 h-2.5 bg-[#A8FF3E] animate-pixel-2 pointer-events-none rounded-[1px] shadow-[0_0_10px_#A8FF3E]"
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-2 right-16 w-1.5 h-1.5 bg-[#D7FF75] animate-pixel-twinkle pointer-events-none rounded-[1px]"
                aria-hidden="true"
              />

              <h1 className="font-pixel font-bold uppercase tracking-tight leading-[0.84]">
                <span className="block text-6xl sm:text-7xl lg:text-[84px] xl:text-[96px] 2xl:text-[108px] pixel-title-guess">
                  GUESS
                </span>
                <span className="relative inline-flex items-center text-6xl sm:text-7xl lg:text-[84px] xl:text-[96px] 2xl:text-[108px] pixel-title-what">
                  WHAT
                  {/* Subtle 8-Bit Pixel Question Mark Accent */}
                  <span
                    className="ml-2 sm:ml-3 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-[#D7FF75] inline-block align-top -translate-y-1 sm:-translate-y-2 animate-pixel-twinkle"
                    style={{
                      textShadow: '0 0 12px rgba(215, 255, 117, 0.6), 2px 2px 0px rgba(0,0,0,0.95)',
                    }}
                    aria-hidden="true"
                  >
                    ?
                  </span>
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-lg xl:text-2xl text-[#D8D8D8] font-light tracking-tight">
              How well do you know the world?
            </p>

            {/* Clean Minimal Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/music"
                className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-white hover:bg-[#D7FF75] text-slate-950 font-bold text-sm shadow-[0_4px_24px_rgba(255,255,255,0.22)] hover:translate-x-0.5 active:scale-[0.98] transition-all duration-200 group"
              >
                <span>Start Playing</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] text-slate-950 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/leaderboard"
                className="inline-flex items-center justify-center px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[#D8D8D8] hover:text-white font-semibold text-sm border border-white/20 hover:border-[#A8FF3E]/40 active:scale-[0.98] transition-all duration-200"
              >
                <span>View Leaderboard</span>
              </Link>
            </div>
          </div>

          {/* Lower Block: Stats Row + Editorial Script + Quote */}
          <div className="space-y-4 xl:space-y-5 pt-6 mt-auto">
            {/* Information Stats Row */}
            <div className="flex items-start gap-8 sm:gap-11 border-t border-white/[0.08] pt-4 select-none">
              {/* Stat 1: 3 Game Modes */}
              <div className="space-y-1">
                <div className="text-[#A8FF3E]/80 text-sm font-light">∞</div>
                <div className="text-xl xl:text-2xl font-black text-white leading-none">3</div>
                <div className="text-[11px] text-[#D8D8D8] font-medium whitespace-nowrap">Game Modes</div>
              </div>

              {/* Stat 2: New Discoveries */}
              <div className="space-y-1">
                <Globe className="w-4 h-4 text-[#A8FF3E]/80 stroke-[1.75]" />
                <div className="text-xl xl:text-2xl font-black text-white leading-none">∞</div>
                <div className="text-[11px] text-[#D8D8D8] font-medium whitespace-nowrap">New Discoveries</div>
              </div>

              {/* Stat 3: A Bigger You */}
              <div className="space-y-1">
                <Users className="w-4 h-4 text-[#A8FF3E]/80 stroke-[1.75]" />
                <div className="text-xl xl:text-2xl font-black text-white leading-none">◎</div>
                <div className="text-[11px] text-[#D8D8D8] font-medium whitespace-nowrap">A Bigger You</div>
              </div>
            </div>

            {/* Editorial Script Statement */}
            <div className="select-none">
              <p className="font-script text-3xl sm:text-4xl text-[#D8D8D8]/90 leading-tight tracking-wide -rotate-1">
                Play the world<br />
                <span className="text-white">Differently.</span>
              </p>
            </div>

            {/* Bottom Quote */}
            <p className="text-xs text-[#D8D8D8]/70 italic font-light select-none">
              &ldquo;Curiosity is a different kind of intelligence.&rdquo;
            </p>
          </div>
        </div>

        {/* RIGHT GAME PANELS: Right ~55-60% of viewport with ~40-55px right margin */}
        <div className="w-full lg:w-[58%] xl:w-[60%] h-full min-h-screen flex items-stretch justify-end pr-0 lg:pr-[40px] xl:pr-[55px]">
          <EditorialPanels />
        </div>
      </div>
    </div>
  );
}
