'use client';

import React, { useState, useEffect } from 'react';
import { DifficultyTier } from '@/lib/game/scoring';
import type { PublicSessionState } from '@/lib/game/types';
import { OpportunityBar } from '@/components/game/OpportunityBar';
import { AudioWavePlayer } from '@/components/audio/AudioWavePlayer';
import { AnswerSearchBox } from '@/components/game/AnswerSearchBox';
import { RoundResultBanner } from '@/components/game/RoundResultBanner';
import { Play, RotateCcw, BarChart2, CheckCircle2, Award, Zap, Loader2 } from 'lucide-react';

const CATEGORIES = ['All', 'Electronic', 'Pop', 'Rock', 'Soundtrack', 'Hip-Hop', 'Acoustic'];

export default function UnlimitedPage() {
  const [selectedTier, setSelectedTier] = useState<DifficultyTier>('Easy');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [session, setSession] = useState<PublicSessionState | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local Practice Stats
  const [stats, setStats] = useState({
    roundsPlayed: 0,
    correctCount: 0,
    totalScore: 0,
    revealsSum: 0,
  });

  // Start new practice session
  const startPractice = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/unlimited/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedTier, category: selectedCategory }),
      });
      const json = await res.json();
      if (json?.success) {
        setSession(json.data);
      }
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  };

  const currentRound = session ? session.rounds[session.activeRoundIndex] : null;

  const handleSubmitGuess = async (songId: string | null, isSkip = false) => {
    if (!currentRound || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/v1/rounds/${currentRound.id}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submittedSongId: songId, isSkip }),
      });
      const json = await res.json();
      if (json?.success) {
        setSession(json.data.session);

        // If round resolved, update lifetime session stats
        const updatedRound = json.data.round;
        if (updatedRound.state !== 'unresolved') {
          setStats((prev) => ({
            roundsPlayed: prev.roundsPlayed + 1,
            correctCount: prev.correctCount + (updatedRound.state === 'correct' ? 1 : 0),
            totalScore: prev.totalScore + updatedRound.score,
            revealsSum: prev.revealsSum + updatedRound.attemptCount,
          }));
        }
      }
    } catch {
      // Error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextSong = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/unlimited/sessions/${session.id}/next`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json?.success) {
        setSession(json.data);
      }
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  };

  const accuracy = stats.roundsPlayed > 0 ? Math.round((stats.correctCount / stats.roundsPlayed) * 100) : 0;
  const avgReveals = stats.roundsPlayed > 0 ? (stats.revealsSum / stats.roundsPlayed).toFixed(1) : '0.0';

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-6 max-w-xl mx-auto w-full space-y-6">
      {/* Mode Header */}
      <div className="w-full flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">Unlimited Practice</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
              Endless
            </span>
          </div>
          <p className="text-xs text-slate-400">Non-leaderboard practice mode. Tune your ear anytime.</p>
        </div>

        {session && (
          <button
            onClick={() => setSession(null)}
            className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/5"
          >
            Change Mode
          </button>
        )}
      </div>

      {/* Setup screen if unstarted */}
      {!session ? (
        <div className="w-full glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Music Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Tier */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Difficulty Tier
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(['Easy', 'Medium', 'Hard', 'Expert', 'Impossible'] as DifficultyTier[]).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold text-center border transition-all ${
                    selectedTier === tier
                      ? 'bg-purple-500/20 border-purple-400 text-purple-200 ring-2 ring-purple-500/30'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startPractice}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-95 text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-all transform active:scale-95"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-white" />}
            <span>Start Practice Sprint</span>
          </button>
        </div>
      ) : (
        /* Active Practice Round */
        <div className="w-full space-y-5">
          {/* Quick Stats Banner */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Rounds</span>
              <span className="font-extrabold text-white text-sm">{stats.roundsPlayed}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Accuracy</span>
              <span className="font-extrabold text-emerald-400 text-sm">{accuracy}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Avg Clues</span>
              <span className="font-extrabold text-cyan-400 text-sm">{avgReveals}</span>
            </div>
          </div>

          {currentRound && (
            <>
              {/* Opportunity Bar */}
              <OpportunityBar
                currentOpportunity={currentRound.currentOpportunity}
                attemptCount={currentRound.attemptCount}
                isResolved={currentRound.state !== 'unresolved'}
                solvedAtAttempt={currentRound.solvedAtAttempt}
                state={currentRound.state}
              />

              {/* Audio Player */}
              <AudioWavePlayer
                audioUrl={currentRound.audioUrl}
                startMs={currentRound.startMs}
                durationMs={currentRound.state !== 'unresolved' ? 5000 : currentRound.currentDurationMs}
              />

              {/* Interaction: Search or Round Result */}
              {currentRound.state !== 'unresolved' ? (
                <RoundResultBanner
                  state={currentRound.state as 'correct' | 'skipped' | 'exhausted'}
                  score={currentRound.score}
                  solvedAtAttempt={currentRound.solvedAtAttempt}
                  correctAnswer={currentRound.correctAnswer}
                  isLastRound={false}
                  onNext={handleNextSong}
                />
              ) : (
                <AnswerSearchBox
                  sessionId={session.id}
                  onSelectAnswer={(id) => handleSubmitGuess(id, false)}
                  onSkip={() => handleSubmitGuess(null, true)}
                  isSubmitting={isSubmitting}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
