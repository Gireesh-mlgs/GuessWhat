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
    <div className="flex-1 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-14 max-w-6xl mx-auto w-full space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl">
        {/* UTC live badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Daily Sprint Active &bull; Resets 00:00 UTC</span>
          <span className="text-slate-500">({countdownStr})</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-none">
          How Fast Can You <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 text-glow-cyan">
            Recognize The Beat?
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
          Listen to sub-second audio snippets, guess the song in as few reveals as possible, and compete daily with friends. No sign-up required to start playing.
        </p>

        {/* Quick Launch Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/daily"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 hover:opacity-95 text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-all transform hover:scale-105 active:scale-95"
          >
            <Flame className="w-5 h-5 text-amber-300 fill-amber-300" />
            <span>Play Today&apos;s Daily</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <Link
            href="/unlimited"
            className="w-full sm:w-auto px-7 py-4 rounded-2xl glass-panel hover:bg-slate-800/80 text-slate-200 hover:text-white font-bold text-base flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-4 h-4 text-cyan-400" />
            <span>Unlimited Practice</span>
          </Link>
        </div>
      </section>

      {/* 3 Core Game Modes Grid */}
      <section className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Game Modes</h2>
            <p className="text-xs sm:text-sm text-slate-400">Play whenever you want, compete whenever you want</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span>Server-Authoritative</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Daily */}
          <Link
            href="/daily"
            className="glass-panel glass-panel-hover rounded-3xl p-6 sm:p-7 border border-white/10 flex flex-col justify-between relative group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-lg shadow-amber-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Flame className="w-6 h-6 text-amber-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-white">Daily Sprint</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    Shared Ritual
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  5 curated songs published at 00:00 UTC. One scored attempt per day to build your streak and climb the global leaderboard.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
              <span>{dailyStatus?.isCompleted ? `Completed (${dailyStatus.completedScore} pts)` : 'Start Daily Run'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Unlimited */}
          <Link
            href="/unlimited"
            className="glass-panel glass-panel-hover rounded-3xl p-6 sm:p-7 border border-white/10 flex flex-col justify-between relative group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 p-0.5 shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Play className="w-6 h-6 text-cyan-400 fill-cyan-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-white">Unlimited Practice</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                    Endless
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Train your musical reflexes with endless instant rounds. Filter by genre, adjust difficulty, and track personal accuracy.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
              <span>Quick Play Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Challenge */}
          <Link
            href="/challenge/new"
            className="glass-panel glass-panel-hover rounded-3xl p-6 sm:p-7 border border-white/10 flex flex-col justify-between relative group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 p-0.5 shadow-lg shadow-purple-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-white">Challenge a Friend</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                    Custom Duel
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Pick 5, 10, or 20 songs, choose a tier, and send a private link. Compete on identical frozen song clips with a shared scoreboard.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs font-bold text-purple-400 group-hover:text-purple-300">
              <span>Create Challenge Link</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* How It Works Explainer */}
      <section className="w-full glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Rules & Mechanics
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            5 Opportunities. Split-Second Precision.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Each song reveals progressively longer audio clues. Guess faster for higher points!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
            <div className="text-2xl font-black text-cyan-400">0.1s &rarr; 5.0s</div>
            <h4 className="font-bold text-white text-base">Progressive Audio</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Start with a 0.1s micro-teaser (5 pts). Wrong guesses unlock 0.5s, 1.0s, 2.0s, and 5.0s clips.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
            <div className="text-2xl font-black text-purple-400">1× &rarr; 5×</div>
            <h4 className="font-bold text-white text-base">Difficulty Multipliers</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Lock in Easy (1×), Medium (2×), Hard (3×), Expert (4×), or Impossible (5×) for high-stakes scoring up to 125 pts.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
            <div className="text-2xl font-black text-pink-400">🟩 🟨 ⬛</div>
            <h4 className="font-bold text-white text-base">Spoiler-Safe Sharing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Share your score and emoji grid to group chats without leaking song titles, artists, or audio links.
            </p>
          </div>
        </div>
      </section>

      {/* Leaderboard Teaser */}
      {leaderboard.length > 0 && (
        <section className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="text-xl font-black text-white">Daily Top Sprinters</h3>
            </div>
            <Link href="/leaderboard" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              View Full Leaderboard &rarr;
            </Link>
          </div>

          <div className="glass-panel rounded-2xl border border-white/10 divide-y divide-white/5 overflow-hidden">
            {leaderboard.map((entry) => (
              <div key={entry.rank} className="px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 text-center font-black text-sm ${
                      entry.rank === 1
                        ? 'text-amber-400'
                        : entry.rank === 2
                        ? 'text-slate-300'
                        : 'text-amber-600'
                    }`}
                  >
                    #{entry.rank}
                  </span>
                  <span className="font-bold text-sm text-slate-200">{entry.displayName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                    {entry.difficultyTier}
                  </span>
                </div>
                <div className="font-mono font-black text-cyan-400 text-sm">{entry.score} pts</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
