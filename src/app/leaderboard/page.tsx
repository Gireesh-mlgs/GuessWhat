'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Calendar, ShieldCheck, Medal, Loader2, ArrowLeft } from 'lucide-react';

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
      {/* Back button */}
      <div className="w-full flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-amber-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <Link
          href="/music/banger"
          className="inline-flex items-center gap-1.5 text-xs font-black text-amber-950 bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 px-3.5 py-1 rounded-full transition-all"
        >
          <span>Play Banger &rarr;</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-0.5 shadow-md shadow-amber-400/25">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
            <Trophy className="w-7 h-7 text-amber-600" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Global Leaderboard</h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto font-medium">
          Server-verified Daily Sprint scores for opted-in players. Ranked by total score, fewer skips, and fastest solve speed.
        </p>
      </div>

      {/* Filter bar: Date Picker */}
      <div className="w-full bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
          <Calendar className="w-4 h-4 text-amber-600" />
          <span>UTC Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setLoading(true);
              setSelectedDate(e.target.value);
            }}
            className="bg-amber-50/80 border border-amber-300 rounded-lg px-2.5 py-1 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 font-bold">
          <span>{totalCompleted} players completed</span>
          <span className="w-1 h-1 rounded-full bg-slate-400" />
          <Link href="/settings" className="text-amber-700 hover:text-amber-900 underline">
            Opt-in settings &rarr;
          </Link>
        </div>
      </div>

      {/* Rankings List */}
      <div className="w-full bg-white rounded-3xl border-2 border-amber-200 shadow-sm divide-y divide-amber-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : entries.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Medal className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="text-sm font-black text-slate-800">No opted-in entries for this date.</p>
            <p className="text-xs text-slate-500">
              Only players who enable public leaderboard in Settings appear here.
            </p>
            <Link href="/music/banger" className="inline-flex pt-2 text-xs font-black text-amber-600 hover:text-amber-700">
              Be the first to play today&apos;s Banger &rarr;
            </Link>
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.rank}
              className="px-5 py-4 flex items-center justify-between hover:bg-amber-50/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span
                  className={`w-8 text-center font-black text-base ${
                    entry.rank === 1
                      ? 'text-amber-500 text-lg'
                      : entry.rank === 2
                      ? 'text-slate-500 text-base'
                      : entry.rank === 3
                      ? 'text-amber-700 text-base'
                      : 'text-slate-400 text-sm'
                  }`}
                >
                  #{entry.rank}
                </span>
                <div>
                  <span className="font-extrabold text-sm text-slate-900 block">
                    {entry.displayName}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 font-bold border border-amber-300">
                      {entry.difficultyTier}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {entry.skipsCount === 0 ? 'Flawless (0 skips)' : `${entry.skipsCount} skips`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-black text-amber-600 text-lg sm:text-xl">
                  {entry.score}
                </span>
                <span className="text-xs text-slate-500 font-medium ml-1">pts</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rules Notice */}
      <div className="w-full p-4 rounded-2xl bg-white border-2 border-amber-200 shadow-2xs flex items-start gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-900">Fair-Play Guarantee:</strong> All submissions are verified on the server in real-time. Direct score manipulation or client overrides are rejected.
        </p>
      </div>
    </div>
  );
}
