'use client';

import React, { useState } from 'react';
import { DifficultyTier } from '@/lib/game/scoring';
import type { PublicSessionState } from '@/lib/game/types';
import { OpportunityBar } from '@/components/game/OpportunityBar';
import { AudioWavePlayer } from '@/components/audio/AudioWavePlayer';
import { AnswerSearchBox } from '@/components/game/AnswerSearchBox';
import { RoundResultBanner } from '@/components/game/RoundResultBanner';
import { Play, RotateCcw, Zap, Loader2, Music, Sparkles } from 'lucide-react';

const CATEGORIES = ['All', 'Electronic', 'Pop', 'Rock', 'Soundtrack', 'Hip-Hop', 'Acoustic'];

export default function UnlimitedPage() {
  const [selectedTier, setSelectedTier] = useState<DifficultyTier>('Easy');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [session, setSession] = useState<PublicSessionState | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [streakPopping, setStreakPopping] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(false);

  // Local Practice Stats
  const [stats, setStats] = useState({
    roundsPlayed: 0,
    correctCount: 0,
    totalScore: 0,
    revealsSum: 0,
    streak: 0,
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
        setAutoPlayNext(true);
      }
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  };

  const currentRound = session ? session.rounds[session.activeRoundIndex] : null;

  const handleSubmitGuess = async (songId: string | null, isSkip = false) => {
    if (!session || !currentRound || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/v1/rounds/${currentRound.id}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submittedSongId: isSkip ? null : songId, isSkip }),
      });
      const json = await res.json();
      if (json?.success) {
        setSession(json.data.session);

        // If round resolved, update stats & streak
        const updatedRound = json.data.round;
        if (updatedRound.state !== 'unresolved') {
          const isCorrect = updatedRound.state === 'correct';

          if (isCorrect) {
            setStreakPopping(true);
            setTimeout(() => setStreakPopping(false), 600);
          }

          setStats((prev) => ({
            roundsPlayed: prev.roundsPlayed + 1,
            correctCount: prev.correctCount + (isCorrect ? 1 : 0),
            totalScore: prev.totalScore + updatedRound.score,
            revealsSum: prev.revealsSum + updatedRound.attemptCount,
            streak: isCorrect ? prev.streak + 1 : 0,
          }));
        } else {
          // Next clue unlocked on skip or incorrect guess:
          // auto-play the new snippet length from the beginning!
          setAutoPlayNext(true);
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
        setAutoPlayNext(true);
      }
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  };

  const accuracy = stats.roundsPlayed > 0 ? Math.round((stats.correctCount / stats.roundsPlayed) * 100) : 0;

  return (
    <div className="relative flex-1 flex flex-col items-center px-4 py-8 max-w-xl mx-auto w-full space-y-6">
      {/* Playful yellow background floating decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <span className="absolute top-20 left-[10%] text-3xl text-amber-300/80 select-none animate-float-slow">⭐</span>
        <span className="absolute top-36 right-[12%] text-3xl text-yellow-400/90 select-none animate-float-delayed">⚡</span>
        <span className="absolute bottom-40 left-[8%] text-3xl text-amber-400/80 select-none animate-float-delayed">🎵</span>
        <span className="absolute bottom-28 right-[10%] text-3xl text-yellow-500/80 select-none animate-float-slow">❓</span>
        <span className="absolute top-1/2 left-[5%] text-2xl text-amber-300/70 select-none animate-float-slow">✨</span>
        <span className="absolute top-1/3 right-[6%] text-xl text-yellow-400/80 select-none animate-float-delayed">🎶</span>
      </div>

      {/* Mode Header */}
      <div className="w-full flex items-center justify-between z-10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Guess The Song
            </h1>
            <span className="text-[11px] px-3 py-0.5 rounded-full bg-amber-200 text-amber-950 font-black border border-amber-300 shadow-2xs">
              Practice ⚡
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-bold">Listen to the clip and guess the right track!</p>
        </div>

        {session && (
          <button
            onClick={() => setSession(null)}
            className="text-xs font-black text-amber-950 hover:text-black px-3.5 py-1.5 rounded-xl border-2 border-amber-300 bg-white hover:bg-amber-100 transition-all btn-tactile shadow-2xs"
          >
            Change Mode
          </button>
        )}
      </div>

      {/* Setup screen if unstarted */}
      {!session ? (
        <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-[0_10px_35px_rgba(245,158,11,0.12)] space-y-6 z-10">
          {/* Category Filter */}
          <div className="space-y-2.5">
            <label className="text-xs font-black text-amber-950 uppercase tracking-wider block">
              Music Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all btn-tactile ${
                    selectedCategory === cat
                      ? 'bg-amber-400 text-slate-950 border-2 border-amber-500 shadow-sm shadow-amber-400/40 scale-105'
                      : 'bg-amber-50/70 text-amber-950 hover:bg-amber-100 border-2 border-amber-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Tier */}
          <div className="space-y-2.5">
            <label className="text-xs font-black text-amber-950 uppercase tracking-wider block">
              Difficulty Tier
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(['Easy', 'Medium', 'Hard', 'Expert', 'Impossible'] as DifficultyTier[]).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`py-2.5 px-1 rounded-2xl text-xs font-black text-center border-2 transition-all btn-tactile ${
                    selectedTier === tier
                      ? 'bg-amber-200 border-amber-500 text-amber-950 ring-4 ring-amber-300/80 shadow-xs'
                      : 'bg-white border-amber-200 text-slate-700 hover:bg-amber-50/60'
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
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:opacity-95 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-md shadow-amber-400/40 border-2 border-amber-500/40 btn-tactile"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
            <span>Start Practice Game ⚡</span>
          </button>
        </div>
      ) : (
        /* Active Practice Round */
        <div className="w-full space-y-5 z-10">
          {/* Prominent Gameplay Stats: 🔥 Streak, ⭐ Score, 🎯 Accuracy in Yellow Fun Theme */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full">
            {/* Streak Card */}
            <div
              className={`p-3 sm:p-4 rounded-3xl bg-amber-100/90 border-2 border-amber-300 shadow-[0_4px_16px_rgba(245,158,11,0.12)] flex flex-col items-center justify-center text-center transition-all ${
                streakPopping ? 'animate-streak-pop ring-4 ring-amber-400 scale-105' : ''
              }`}
            >
              <span className="text-[11px] sm:text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1">
                <span>🔥</span> Streak
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-950 mt-0.5">
                {stats.streak}
              </span>
            </div>

            {/* Score Card */}
            <div className="p-3 sm:p-4 rounded-3xl bg-yellow-100/90 border-2 border-yellow-300 shadow-[0_4px_16px_rgba(234,179,8,0.12)] flex flex-col items-center justify-center text-center">
              <span className="text-[11px] sm:text-xs font-black text-yellow-950 uppercase tracking-wider flex items-center gap-1">
                <span>⭐</span> Score
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-950 mt-0.5">
                {stats.totalScore}
              </span>
            </div>

            {/* Accuracy Card */}
            <div className="p-3 sm:p-4 rounded-3xl bg-amber-50 border-2 border-amber-200 shadow-[0_4px_16px_rgba(245,158,11,0.08)] flex flex-col items-center justify-center text-center">
              <span className="text-[11px] sm:text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1">
                <span>🎯</span> Accuracy
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                {accuracy}%
              </span>
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

              {/* 🎵 Song / Audio area */}
              <AudioWavePlayer
                key={`audio-${currentRound.id}-${currentRound.currentOpportunity}`}
                audioUrl={currentRound.audioUrl}
                startMs={currentRound.startMs}
                durationMs={currentRound.state !== 'unresolved' ? 5000 : currentRound.currentDurationMs}
                autoPlay={autoPlayNext}
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
