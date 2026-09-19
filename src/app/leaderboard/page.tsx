'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Calendar, ShieldCheck, Medal, Loader2, ArrowLeft, Crown, Sparkles, Flame, UserCheck } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  score: number;
  skipsCount: number;
  difficultyTier: string;
  completedAt: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [totalCompleted, setTotalCompleted] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    let active = true;
    const loadLeaderboard = async () => {
      try {
        const response = await fetch(`/api/v1/leaderboards/daily?date=${selectedDate}`);
        const json = await response.json();
        if (active && json?.success) {
          setEntries(json.data.entries || []);
          setTotalCompleted(json.data.totalCompleted || 0);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadLeaderboard();
    return () => { active = false; };
  }, [selectedDate]);

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Top Navigation Bar */}
      <div className="w-full flex items-center justify-between">
        <Link
          href="/"
          className="arcade-btn-dark-gold inline-flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-yellow-400" />
          <span>&lt; HOME</span>
        </Link>
        <Link
          href="/music/banger"
          className="arcade-btn-gold inline-flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-xl font-bold transition-all"
        >
          <span>PLAY BANGER</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg arcade-badge-gold text-[11px] font-bold">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>★ ARCADE HIGH SCORES ★</span>
        </div>

        <div className="relative inline-block">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-300 p-0.5 shadow-lg shadow-yellow-500/30">
            <div className="w-full h-full bg-[#120f06] rounded-[14px] flex items-center justify-center border border-yellow-500/40">
              <Trophy className="w-8 h-8 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <Crown className="w-5 h-5 text-yellow-300 absolute -top-2.5 -right-1 rotate-12 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-pixel pixel-title-gold tracking-wider uppercase">
          GLOBAL LEADERBOARD
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-medium">
          Server-verified Daily Sprint scores for opted-in players. Ranked by total score, fewer skips, and fastest solve speed.
        </p>
      </div>

      {/* Filter Bar: Date Picker & Player Count */}
      <div className="w-full pixel-arcade-card-gold p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs text-yellow-200 font-pixel font-bold">
          <Calendar className="w-4 h-4 text-yellow-400" />
          <span className="tracking-wide">UTC DATE:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setLoading(true);
              setSelectedDate(e.target.value);
            }}
            className="bg-[#0b0904] border-2 border-yellow-500/50 rounded-lg px-2.5 py-1 text-yellow-300 text-xs font-mono font-bold focus:outline-none focus:border-yellow-400 shadow-inner"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-300 font-pixel">
          <div className="flex items-center gap-1.5 text-yellow-300 font-bold">
            <UserCheck className="w-3.5 h-3.5 text-yellow-400" />
            <span>{totalCompleted} PLAYERS COMPLETED</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
          <Link
            href="/settings"
            className="text-yellow-400 hover:text-yellow-200 underline font-bold transition-colors"
          >
            OPT-IN SETTINGS &rarr;
          </Link>
        </div>
      </div>

      {/* Rankings Board */}
      <div className="w-full pixel-arcade-card-gold p-2 sm:p-4 overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
            <span className="font-pixel text-xs text-yellow-300 tracking-wider">
              FETCHING ARCADE SCORES...
            </span>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Medal className="w-10 h-10 text-yellow-500/60 mx-auto" />
            <p className="text-base font-pixel text-yellow-300 font-bold tracking-wide">
              NO OPTED-IN ENTRIES FOR THIS DATE
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Only players who enable public leaderboard in Settings appear here.
            </p>
            <div className="pt-2">
              <Link
                href="/music/banger"
                className="arcade-btn-gold inline-flex items-center gap-2 px-5 py-2 text-xs font-bold"
              >
                <Flame className="w-4 h-4 text-yellow-900" />
                <span>BE THE FIRST TO PLAY TODAY&apos;S BANGER</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => {
              const isFirst = entry.rank === 1;
              const isSecond = entry.rank === 2;
              const isThird = entry.rank === 3;

              return (
                <div
                  key={entry.rank}
                  className={`px-4 py-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    isFirst
                      ? 'bg-gradient-to-r from-yellow-950/40 via-[#1e1706] to-yellow-950/40 border-yellow-500/80 shadow-[0_0_15px_rgba(250,204,21,0.15)]'
                      : isSecond
                      ? 'bg-[#12161c]/80 border-slate-400/50'
                      : isThird
                      ? 'bg-[#181109]/80 border-amber-600/50'
                      : 'bg-[#0b0905]/70 border-yellow-500/20 hover:border-yellow-500/40'
                  }`}
                >
                  {/* Left: Rank & User Info */}
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-pixel font-bold ${
                        isFirst
                          ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-black text-lg shadow-[0_0_10px_rgba(250,204,21,0.6)]'
                          : isSecond
                          ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-black text-base'
                          : isThird
                          ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-black text-base'
                          : 'bg-[#181409] text-yellow-400/80 border border-yellow-500/30 text-sm'
                      }`}
                    >
                      {isFirst ? (
                        <Crown className="w-5 h-5 text-black drop-shadow" />
                      ) : (
                        `#${entry.rank}`
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-pixel font-bold text-sm sm:text-base tracking-wide ${
                          isFirst ? 'text-yellow-300' : isSecond ? 'text-slate-200' : isThird ? 'text-amber-300' : 'text-slate-100'
                        }`}>
                          {entry.displayName}
                        </span>
                        {isFirst && (
                          <span className="arcade-badge-gold text-[9px] px-1.5 py-0.2 rounded font-bold">
                            CHAMPION
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded arcade-badge text-green-400 font-pixel font-bold">
                          {entry.difficultyTier.toUpperCase()}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {entry.skipsCount === 0 ? (
                            <span className="text-emerald-400 font-bold font-pixel">FLAWLESS (0 SKIPS)</span>
                          ) : (
                            `${entry.skipsCount} SKIPS`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Score Display */}
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className={`font-pixel font-bold text-xl sm:text-2xl ${
                        isFirst ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-yellow-300'
                      }`}>
                        {entry.score}
                      </span>
                      <span className="text-[10px] font-pixel text-yellow-500/80 tracking-wider">
                        PTS
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rules & Fair-Play Guarantee */}
      <div className="w-full p-4 rounded-2xl pixel-arcade-inner flex items-start gap-3 text-xs text-slate-300 border border-emerald-500/30">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-emerald-300 font-pixel tracking-wide block mb-0.5">
            ★ FAIR-PLAY GUARANTEE ★
          </strong>
          <p className="text-slate-400 leading-relaxed">
            All submissions are verified on the server in real-time. Direct score manipulation or client overrides are rejected automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

