'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Play, Users, Trophy, Sparkles, ArrowRight, ShieldCheck, Clock, Music } from 'lucide-react';
import { getMillisecondsUntilNextUtcMidnight } from '@/lib/game/timing';

interface DailyStatusData {
  todayUtc: string;
  hasStarted: boolean;
  isCompleted: boolean;
  completedScore?: number | null;
  currentStreak: number;
}

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  score: number;
  difficultyTier: string;
}

export default function HomePage() {
  const [dailyStatus, setDailyStatus] = useState<DailyStatusData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [msLeft, setMsLeft] = useState<number>(getMillisecondsUntilNextUtcMidnight());

  useEffect(() => {
    // Fetch daily status
    fetch('/api/v1/daily/status')
      .then((res) => res.json())
      .then((json) => {
        if (json?.success) {
          setDailyStatus(json.data);
        }
      })
      .catch(() => {});

    // Fetch daily leaderboard preview
    fetch('/api/v1/leaderboards/daily')
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && json?.data?.entries) {
          setLeaderboard(json.data.entries.slice(0, 3));
        }
      })
      .catch(() => {});

    const timer = setInterval(() => {
      setMsLeft(getMillisecondsUntilNextUtcMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalSec = Math.max(0, Math.floor(msLeft / 1000));
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  const countdownStr = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;

  return (
    <div className="relative flex-1 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-14 max-w-5xl mx-auto w-full space-y-16">
      {/* Floating playful background elements in sunny yellow/amber palette */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <span className="absolute top-28 left-[8%] text-3xl text-amber-300/80 select-none animate-float-slow">🎵</span>
        <span className="absolute top-36 right-[10%] text-3xl text-yellow-400/90 select-none animate-float-delayed">⭐</span>
        <span className="absolute bottom-40 left-[10%] text-4xl text-amber-400/70 select-none animate-float-delayed">🎶</span>
        <span className="absolute bottom-28 right-[8%] text-4xl text-yellow-500/80 select-none animate-float-slow">❓</span>
        <span className="absolute top-1/2 left-[4%] text-2xl text-amber-300/70 select-none animate-float-slow">⚡</span>
        <span className="absolute top-1/3 right-[5%] text-3xl text-yellow-300/80 select-none animate-float-delayed">✨</span>
      </div>

      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-2xl mx-auto z-10">
        {/* UTC live badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-950 text-xs font-black tracking-wide shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          <span>Daily Sprint Active &bull; Resets in</span>
          <span className="font-mono text-amber-950 font-black">{countdownStr}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight">
          How Fast Can You <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500">
            Recognize The Beat?
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 font-bold max-w-xl mx-auto leading-relaxed">
          Listen to sub-second audio snippets, guess the song in as few reveals as possible, and challenge your musical ear. Instant play with zero sign-up!
        </p>

        {/* Quick Launch Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link
            href="/daily"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:opacity-95 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-400/30 border-2 border-amber-500/50 btn-tactile hover:scale-[1.02]"
          >
            <Flame className="w-5 h-5 text-amber-900 fill-amber-700" />
            <span>Play Today&apos;s Daily ⚡</span>
            <ArrowRight className="w-4 h-4 ml-1 stroke-[3]" />
          </Link>

          <Link
            href="/unlimited"
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-amber-50 text-amber-950 font-black text-base flex items-center justify-center gap-2 border-2 border-amber-300 shadow-xs btn-tactile hover:border-amber-400"
          >
            <Play className="w-4 h-4 text-amber-800 fill-amber-700 ml-0.5" />
            <span>Unlimited Practice</span>
          </Link>
        </div>
      </section>

      {/* 3 Core Game Modes Grid */}
      <section className="w-full space-y-6 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Game Modes</h2>
            <p className="text-xs sm:text-sm text-slate-600 font-bold">Pick your challenge and start guessing</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-950 font-black bg-amber-100 px-3.5 py-1 rounded-full border-2 border-amber-300">
            <ShieldCheck className="w-4 h-4 text-amber-700 stroke-[2.5]" />
            <span>Fair Scoring</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Daily */}
          <Link
            href="/daily"
            className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-300 shadow-[0_8px_30px_rgba(245,158,11,0.08)] flex flex-col justify-between relative group hover:border-amber-400 hover:shadow-md transition-all btn-tactile"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center shadow-xs">
                <Flame className="w-6 h-6 text-amber-600 fill-amber-500" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900">Daily Sprint</h3>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 font-black border border-amber-300">
                    Daily Ritual ⚡
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-semibold mt-1 leading-relaxed">
                  5 curated songs published at 00:00 UTC. One scored attempt per day to build your streak and climb the global leaderboard.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-amber-100 flex items-center justify-between text-xs font-black text-amber-800 group-hover:text-amber-950">
              <span>{dailyStatus?.isCompleted ? `Completed (${dailyStatus.completedScore} pts)` : 'Start Daily Run'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[3]" />
            </div>
          </Link>

          {/* Card 2: Unlimited */}
          <Link
            href="/unlimited"
            className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-yellow-300 shadow-[0_8px_30px_rgba(234,179,8,0.08)] flex flex-col justify-between relative group hover:border-yellow-400 hover:shadow-md transition-all btn-tactile"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-100 border-2 border-yellow-300 flex items-center justify-center shadow-xs">
                <Play className="w-6 h-6 text-amber-800 fill-amber-700 ml-0.5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900">Unlimited Practice</h3>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-950 font-black border border-yellow-300">
                    Endless 🎵
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-semibold mt-1 leading-relaxed">
                  Train your musical reflexes with endless instant rounds. Filter by genre, adjust difficulty, and track personal accuracy.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-yellow-100 flex items-center justify-between text-xs font-black text-amber-800 group-hover:text-amber-950">
              <span>Quick Play Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[3]" />
            </div>
          </Link>

          {/* Card 3: Challenge */}
          <Link
            href="/challenge/new"
            className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-orange-300 shadow-[0_8px_30px_rgba(249,115,22,0.08)] flex flex-col justify-between relative group hover:border-orange-400 hover:shadow-md transition-all btn-tactile"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 border-2 border-orange-300 flex items-center justify-center shadow-xs">
                <Users className="w-6 h-6 text-orange-600 stroke-[2.5]" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900">Challenge a Friend</h3>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-950 font-black border border-orange-300">
                    Custom Duel 🏆
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-semibold mt-1 leading-relaxed">
                  Pick 5, 10, or 20 songs, choose a tier, and send a private link. Compete on identical frozen song clips with a shared scoreboard.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-orange-100 flex items-center justify-between text-xs font-black text-orange-800 group-hover:text-orange-950">
              <span>Create Challenge Link</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[3]" />
            </div>
          </Link>
        </div>
      </section>

      {/* How It Works Explainer */}
      <section className="w-full bg-white rounded-3xl p-6 sm:p-10 border-2 border-amber-300 shadow-[0_10px_35px_rgba(245,158,11,0.08)] space-y-8 z-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-black text-amber-800 uppercase tracking-widest">
            Rules & Mechanics
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            5 Opportunities. Split-Second Precision.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-bold">
            Each song reveals progressively longer audio clues. Guess faster for higher points!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-200 space-y-2">
            <div className="text-2xl font-black text-amber-700">0.5s &rarr; 5.0s</div>
            <h4 className="font-black text-slate-900 text-base">Progressive Audio</h4>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Start with a 0.5s teaser (5 pts). Wrong guesses unlock 1.0s, 2.0s, 3.0s, and 5.0s clips.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-yellow-50/90 border-2 border-yellow-200 space-y-2">
            <div className="text-2xl font-black text-yellow-700">1× &rarr; 5×</div>
            <h4 className="font-black text-slate-900 text-base">Difficulty Multipliers</h4>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Lock in Easy (1×), Medium (2×), Hard (3×), Expert (4×), or Impossible (5×) for high-stakes scoring up to 125 pts.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-100/50 border-2 border-amber-300/80 space-y-2">
            <div className="text-2xl font-black text-amber-800">🟩 🟨 ⬛</div>
            <h4 className="font-black text-slate-900 text-base">Spoiler-Safe Sharing</h4>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Share your score and emoji grid to group chats without leaking song titles, artists, or audio links.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
