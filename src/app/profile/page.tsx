'use client';

import React, { useState, useEffect } from 'react';
import { User, Flame, Trophy, History, Settings, Check, Loader2 } from 'lucide-react';

interface SessionHistoryItem {
  id: string;
  mode: string;
  difficultyTier: string;
  status: string;
  score: number;
  skipsCount: number;
  startedAt: number;
  completedAt?: number;
}

interface ProfileData {
  playerId: string;
  kind: 'anonymous' | 'account';
  displayName: string;
  leaderboardOptIn: boolean;
  streak: {
    current: number;
    longest: number;
    lastCompletedDate?: string | null;
  };
  recentSessions: SessionHistoryItem[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/v1/auth/session')
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && json?.data) {
          setProfile(json.data);
          setDisplayName(json.data.displayName || '');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/v1/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });
      const json = await res.json();
      if (json?.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch {
      // Error
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-8 max-w-2xl mx-auto w-full space-y-6">
      {/* Header Profile Card */}
      <div className="w-full glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-xl shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <User className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {profile?.displayName || 'Anonymous Sprinter'}
            </h1>
            <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-white/5">
                {profile?.kind === 'account' ? 'Registered Account' : 'Anonymous Device Identity'}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  profile?.leaderboardOptIn
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {profile?.leaderboardOptIn ? 'Leaderboard Visible' : 'Leaderboard Hidden'}
              </span>
            </div>
          </div>
        </div>

        {/* Streaks & Stats Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 text-center">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1 flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5" /> Current Streak
            </span>
            <span className="font-mono font-black text-2xl text-white">
              {profile?.streak.current || 0}
              <span className="text-xs text-amber-400 font-bold ml-1">days</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 text-center">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1 flex items-center justify-center gap-1">
              <Trophy className="w-3.5 h-3.5" /> Best Streak
            </span>
            <span className="font-mono font-black text-2xl text-white">
              {profile?.streak.longest || 0}
              <span className="text-xs text-cyan-400 font-bold ml-1">days</span>
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-slate-900/80 border border-white/5 text-center">
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
              Games Logged
            </span>
            <span className="font-mono font-black text-2xl text-white">
              {profile?.recentSessions.length || 0}
            </span>
          </div>
        </div>

        {/* Edit Display Name */}
        <form onSubmit={handleUpdateName} className="space-y-3 pt-2 border-t border-white/10">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Update Display Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              maxLength={24}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-sm flex items-center gap-1.5 transition-colors"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : null}
              <span>{savedSuccess ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* History */}
      <div className="w-full glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center gap-2 font-black text-lg text-white">
          <History className="w-5 h-5 text-cyan-400" />
          <span>Recent Sessions</span>
        </div>

        {!profile?.recentSessions || profile.recentSessions.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No games played yet. Play a round to start!</p>
        ) : (
          <div className="divide-y divide-white/5">
            {profile.recentSessions.map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white uppercase text-xs tracking-wider">
                      {s.mode}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold">
                      {s.difficultyTier}
                    </span>
                  </div>
                  <span className="text-slate-500 text-[11px]">
                    {new Date(s.startedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-mono font-extrabold text-white text-sm">
                    {s.score} pts
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {s.skipsCount} skips
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
