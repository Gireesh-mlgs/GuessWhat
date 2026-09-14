'use client';

import React, { useState } from 'react';
import { DifficultyTier, DIFFICULTY_MULTIPLIERS } from '@/lib/game/scoring';
import { Users, Copy, Check, ArrowRight, ShieldCheck, Share2, Loader2 } from 'lucide-react';

const CATEGORIES = ['All', 'Electronic', 'Pop', 'Rock', 'Soundtrack', 'Hip-Hop', 'Acoustic'];

export default function NewChallengePage() {
  const [songCount, setSongCount] = useState<number>(5);
  const [difficultyTier, setDifficultyTier] = useState<DifficultyTier>('Medium');
  const [category, setCategory] = useState<string>('All');
  const [creatorName, setCreatorName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [challengeResult, setChallengeResult] = useState<{ code: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/v1/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songCount,
          tier: difficultyTier,
          category,
          creatorName: creatorName.trim() || 'Challenger',
        }),
      });

      const json = await res.json();
      if (json?.success && json?.data?.code) {
        setChallengeResult(json.data);
      }
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  };

  const getChallengeUrl = () => {
    if (typeof window !== 'undefined' && challengeResult) {
      return `${window.location.origin}/challenge/${challengeResult.code}`;
    }
    return '';
  };

  const handleCopy = () => {
    const url = getChallengeUrl();
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-xl mx-auto w-full">
      {!challengeResult ? (
        <form
          onSubmit={handleCreate}
          className="w-full glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 p-0.5 shadow-lg shadow-purple-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Create a Friend Challenge
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Configure a private duel. Everyone gets the exact same ordered songs, clips, and reveal schedule.
            </p>
          </div>

          {/* Creator Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Your Name
            </label>
            <input
              type="text"
              required
              maxLength={24}
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="Enter your challenger name..."
              className="w-full px-4 py-3 bg-slate-900/90 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm font-medium"
            />
          </div>

          {/* Song Count: 5, 10, 20 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Song Count
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 20].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setSongCount(count)}
                  className={`py-2.5 rounded-xl font-bold text-sm border transition-all ${
                    songCount === count
                      ? 'bg-purple-500/20 border-purple-400 text-purple-200 ring-2 ring-purple-500/30'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  {count} Songs
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Tier */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Difficulty Tier
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {(['Easy', 'Medium', 'Hard', 'Expert', 'Impossible'] as DifficultyTier[]).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setDifficultyTier(tier)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold text-center border transition-all ${
                    difficultyTier === tier
                      ? 'bg-pink-500/20 border-pink-400 text-pink-200 ring-2 ring-pink-500/30'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Genre / Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    category === cat
                      ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-95 text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-purple-500/25 transition-all transform active:scale-95"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
            <span>Freeze Songs & Generate Link</span>
          </button>
        </form>
      ) : (
        /* Success Screen with Shareable Link */
        <div className="w-full glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-400 to-cyan-500 p-0.5 shadow-xl shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white">Challenge Ready!</h2>
            <p className="text-xs text-slate-400">
              Songs are frozen. Send this private link to anyone you want to challenge.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between gap-3">
            <span className="font-mono text-sm text-cyan-300 font-bold truncate">
              {getChallengeUrl()}
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 text-xs font-bold flex items-center gap-1.5 flex-shrink-0 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <a
              href={`/challenge/${challengeResult.code}`}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
            >
              <span>Play Challenge Now</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
