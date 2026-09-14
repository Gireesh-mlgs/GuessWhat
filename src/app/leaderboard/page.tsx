'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Calendar, ShieldCheck, Medal, Loader2 } from 'lucide-react';

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
    <div className="flex-1 flex flex-col items-center px-4 py-8 max-w-3xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-lg shadow-amber-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Daily Leaderboard</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Server-verified Daily Sprint scores for opted-in players. Scores are sorted by total score, then fewer skips, then completion speed.
        </p>
      </div>

      {/* Filter bar: Date Picker */}
      <div className="w-full glass-panel rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-bold">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>UTC Challenge Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setLoading(true);
              setSelectedDate(e.target.value);
            }}
            className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>{totalCompleted} players completed</span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <Link href="/settings" className="text-cyan-400 hover:underline">
            Opt-in settings &rarr;
          </Link>
        </div>
      </div>

      {/* Rankings List */}
      <div className="w-full glass-panel rounded-3xl border border-white/10 divide-y divide-white/5 overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          </div>
        ) : entries.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Medal className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-400">No opted-in entries for this date.</p>
            <p className="text-xs text-slate-500">
              Only players who enable public leaderboard in Settings appear here.
            </p>
            <Link href="/daily" className="inline-flex pt-2 text-xs font-bold text-cyan-400 hover:text-cyan-300">
              Be the first to play today&apos;s Sprint &rarr;
            </Link>
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.rank}
              className="px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-4">
                <span
                  className={`w-7 text-center font-black text-base ${
                    entry.rank === 1
                      ? 'text-amber-400'
                      : entry.rank === 2
                      ? 'text-slate-300'
                      : entry.rank === 3
                      ? 'text-amber-600'
                      : 'text-slate-500'
                  }`}
                >
                  #{entry.rank}
                </span>
                <div>
                  <span className="font-extrabold text-sm text-white block">
                    {entry.displayName}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-bold">
                      {entry.difficultyTier}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {entry.skipsCount === 0 ? 'Flawless (0 skips)' : `${entry.skipsCount} skips`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-black text-cyan-400 text-lg sm:text-xl">
                  {entry.score}
                </span>
                <span className="text-xs text-slate-500 font-medium ml-1">pts</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rules Notice */}
      <div className="w-full p-4 rounded-2xl bg-slate-900/50 border border-white/5 flex items-start gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-300">Fair-Play Guarantee:</strong> All submissions are verified on the server in real-time. Direct score manipulation or client overrides are cryptographically rejected.
        </p>
      </div>
    </div>
  );
}
