'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DifficultyTier } from '@/lib/game/scoring';
import type { PublicSessionState } from '@/lib/game/types';
import { TierSelector } from '@/components/game/TierSelector';
import { OpportunityBar } from '@/components/game/OpportunityBar';
import { AudioWavePlayer } from '@/components/audio/AudioWavePlayer';
import { AnswerSearchBox } from '@/components/game/AnswerSearchBox';
import { RoundResultBanner } from '@/components/game/RoundResultBanner';
import { ShareModal } from '@/components/modals/ShareModal';
import { Loader2, ArrowLeft, Play, RotateCcw } from 'lucide-react';

const CATEGORIES = ['All', 'Electronic', 'Pop', 'Rock', 'Soundtrack', 'Hip-Hop', 'Acoustic'];

function BangerGameContent() {
  const searchParams = useSearchParams();
  const urlMode = searchParams.get('mode');
  const [overrideMode, setOverrideMode] = useState<'daily' | 'unlimited' | null>(null);
  const mode = overrideMode ?? (urlMode === 'unlimited' ? 'unlimited' : 'daily');
  const setMode = (m: 'daily' | 'unlimited') => setOverrideMode(m);

  // Daily mode state
  const [dailyLoading, setDailyLoading] = useState(true);
  const [dailySession, setDailySession] = useState<PublicSessionState | null>(null);
  const [selectedDailyTier, setSelectedDailyTier] = useState<DifficultyTier>('Medium');
  const [hasCompletedToday, setHasCompletedToday] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);

  // Unlimited mode state
  const [unlimitedLoading, setUnlimitedLoading] = useState(false);
  const [unlimitedSession, setUnlimitedSession] = useState<PublicSessionState | null>(null);
  const [selectedUnlimitedTier, setSelectedUnlimitedTier] = useState<DifficultyTier>('Easy');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [practiceStats, setPracticeStats] = useState({
    roundsPlayed: 0,
    correctCount: 0,
    totalScore: 0,
    revealsSum: 0,
    streak: 0,
  });

  // Shared gameplay state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [streakPopping, setStreakPopping] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(false);

  // Fetch Daily Status on mount
  useEffect(() => {
    fetch('/api/v1/daily/status')
      .then((res) => res.json())
      .then((json) => {
        if (json?.success) {
          setCurrentStreak(json.data.currentStreak || 0);
          if (json.data.hasStarted && json.data.sessionId) {
            return fetch(`/api/v1/sessions/${json.data.sessionId}`)
              .then((r) => r.json())
              .then((sessJson) => {
                if (sessJson?.success) {
                  setDailySession(sessJson.data);
                  if (sessJson.data.status === 'completed') {
                    setHasCompletedToday(true);
                  }
                }
              });
          }
        }
      })
      .catch(() => { })
      .finally(() => setDailyLoading(false));
  }, []);

  // Start Daily Session
  const handleStartDaily = async () => {
    setDailyLoading(true);
    try {
      const res = await fetch('/api/v1/daily/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedDailyTier }),
      });
      const json = await res.json();
      if (json?.success) {
        setDailySession(json.data);
        setAutoPlayNext(true);
        if (json.data.status === 'completed') {
          setHasCompletedToday(true);
        }
      }
    } catch {
      // Error
    } finally {
      setDailyLoading(false);
    }
  };

  // Start Unlimited Session
  const handleStartUnlimited = async () => {
    setUnlimitedLoading(true);
    try {
      const res = await fetch('/api/v1/unlimited/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedUnlimitedTier, category: selectedCategory }),
      });
      const json = await res.json();
      if (json?.success) {
        setUnlimitedSession(json.data);
        setAutoPlayNext(true);
      }
    } catch {
      // Error
    } finally {
      setUnlimitedLoading(false);
    }
  };

  // Handle Next Song for Unlimited Mode
  const handleNextUnlimitedSong = async () => {
    if (!unlimitedSession) return;
    setUnlimitedLoading(true);
    try {
      const res = await fetch(`/api/v1/unlimited/sessions/${unlimitedSession.id}/next`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json?.success) {
        setUnlimitedSession(json.data);
        setAutoPlayNext(true);
      }
    } catch {
      // Error
    } finally {
      setUnlimitedLoading(false);
    }
  };

  const activeSession = mode === 'daily' ? dailySession : unlimitedSession;
  const currentRound = activeSession ? activeSession.rounds[activeSession.activeRoundIndex] : null;

  // Submit Guess or Skip
  const handleSubmitGuess = async (songId: string | null, isSkip = false) => {
    if (!activeSession || !currentRound || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/v1/rounds/${currentRound.id}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submittedSongId: isSkip ? null : songId, isSkip }),
      });
      const json = await res.json();
      if (json?.success) {
        const isCorrect = json.data.round?.state === 'correct';
        if (isCorrect) {
          setStreakPopping(true);
          setTimeout(() => setStreakPopping(false), 600);
        }

        if (mode === 'daily') {
          setDailySession(json.data.session);
          if (json.data.session.status === 'completed') {
            setHasCompletedToday(true);
            if (isCorrect) {
              setCurrentStreak((prev) => prev + 1);
            }
          } else if (json.data.round?.state === 'unresolved') {
            setAutoPlayNext(true);
          }
        } else {
          setUnlimitedSession(json.data.session);
          const updatedRound = json.data.round;
          if (updatedRound.state !== 'unresolved') {
            setPracticeStats((prev) => ({
              roundsPlayed: prev.roundsPlayed + 1,
              correctCount: prev.correctCount + (isCorrect ? 1 : 0),
              totalScore: prev.totalScore + updatedRound.score,
              revealsSum: prev.revealsSum + updatedRound.attemptCount,
              streak: isCorrect ? prev.streak + 1 : 0,
            }));
          } else {
            setAutoPlayNext(true);
          }
        }
      }
    } catch {
      // Error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextRound = () => {
    if (mode === 'daily') {
      if (!dailySession) return;
      const nextIdx = dailySession.activeRoundIndex + 1;
      if (nextIdx < dailySession.rounds.length) {
        setDailySession({
          ...dailySession,
          activeRoundIndex: nextIdx,
        });
        setAutoPlayNext(true);
      }
    } else {
      handleNextUnlimitedSong();
    }
  };

  // Loading state for initial Daily fetch
  if (dailyLoading && mode === 'daily' && !dailySession) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  // Round resolution state
  const isRoundResolved = currentRound ? currentRound.state !== 'unresolved' : false;
  const isLastRound =
    mode === 'daily' && activeSession
      ? activeSession.activeRoundIndex === activeSession.rounds.length - 1
      : false;

  return (
    <div className="relative flex-1 flex flex-col items-center px-4 py-6 sm:py-8 max-w-xl mx-auto w-full space-y-6">
      {/* Floating yellow background doodles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <span className="absolute top-20 left-[10%] text-3xl text-amber-300/80 select-none animate-float-slow">🎵</span>
        <span className="absolute top-36 right-[12%] text-3xl text-yellow-400/90 select-none animate-float-delayed">⭐</span>
        <span className="absolute bottom-40 left-[8%] text-3xl text-amber-400/80 select-none animate-float-delayed">🎶</span>
        <span className="absolute bottom-28 right-[10%] text-3xl text-yellow-500/80 select-none animate-float-slow">❓</span>
        <span className="absolute top-1/2 left-[5%] text-2xl text-amber-300/70 select-none animate-float-slow">•</span>
        <span className="absolute top-1/3 right-[6%] text-xl text-yellow-400/80 select-none animate-float-delayed">✨</span>
      </div>

      {/* Navigation & Mode Switcher Bar */}
      <div className="w-full flex items-center justify-between z-10">
        <Link
          href="/music"
          className="inline-flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-amber-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Music Games</span>
        </Link>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 p-1 bg-amber-100/90 rounded-2xl border-2 border-amber-300 shadow-2xs">
          <button
            onClick={() => setMode('daily')}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${mode === 'daily'
                ? 'bg-amber-400 text-slate-950 border border-amber-500 shadow-xs'
                : 'text-amber-900 hover:text-slate-950'
              }`}
          >
            ⚡ Daily
          </button>
          <button
            onClick={() => setMode('unlimited')}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${mode === 'unlimited'
                ? 'bg-amber-400 text-slate-950 border border-amber-500 shadow-xs'
                : 'text-amber-900 hover:text-slate-950'
              }`}
          >
            🎵 Practice
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODE 1: DAILY SPRINT                                         */}
      {/* ============================================================ */}
      {mode === 'daily' && (
        <>
          {/* Daily Pre-Game: Tier Selection */}
          {!dailySession && (
            <div className="relative z-10 w-full flex justify-center pt-4">
              <TierSelector
                selectedTier={selectedDailyTier}
                onSelectTier={setSelectedDailyTier}
                onConfirm={handleStartDaily}
                isLoading={dailyLoading}
                modeLabel="Guess the Banger ⚡"
              />
            </div>
          )}

          {/* Daily Completed Screen: Share Modal */}
          {dailySession && (dailySession.status === 'completed' || hasCompletedToday) && (
            <div className="relative z-10 w-full flex flex-col items-center justify-center space-y-4 pt-4">
              <ShareModal session={dailySession} currentStreak={currentStreak} />
              <button
                onClick={() => setMode('unlimited')}
                className="inline-flex items-center gap-2 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 px-4 py-2 rounded-2xl transition-all shadow-xs"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Keep Playing with Practice Mode</span>
              </button>
            </div>
          )}

          {/* Daily Active Gameplay */}
          {dailySession && dailySession.status !== 'completed' && !hasCompletedToday && (
            <div className="w-full space-y-5 z-10">
              {/* Header Bar */}
              <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-950 font-black shadow-2xs">
                    Song {dailySession.activeRoundIndex + 1} of {dailySession.rounds.length}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white text-amber-900 border-2 border-amber-200 font-black">
                    {dailySession.difficultyTier}
                  </span>
                </div>

                {/* Progress Dots */}
                <div className="flex items-center gap-1.5 py-1">
                  {dailySession.rounds.map((r, idx) => {
                    const isCurrent = idx === dailySession.activeRoundIndex;
                    let dotStyle = 'bg-amber-100 border-amber-200';
                    if (r.state === 'correct') {
                      dotStyle = 'bg-emerald-500 border-emerald-600 shadow-sm';
                    } else if (r.state === 'skipped' || r.state === 'exhausted') {
                      dotStyle = 'bg-rose-400 border-rose-500';
                    } else if (isCurrent) {
                      dotStyle = 'bg-amber-500 border-amber-600 ring-4 ring-amber-200 animate-pulse';
                    }

                    return (
                      <div
                        key={r.id}
                        className={`w-3.5 h-3.5 rounded-full border transition-all ${dotStyle}`}
                        title={`Song ${idx + 1}: ${r.state}`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full">
                <div
                  className={`p-3 sm:p-4 rounded-3xl bg-amber-100/90 border-2 border-amber-300 shadow-[0_4px_16px_rgba(245,158,11,0.12)] flex flex-col items-center justify-center text-center transition-all ${streakPopping ? 'animate-streak-pop ring-4 ring-amber-400 scale-105' : ''
                    }`}
                >
                  <span className="text-[11px] sm:text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1">
                    <span>🔥</span> Streak
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-950 mt-0.5">
                    {currentStreak}
                  </span>
                </div>

                <div className="p-3 sm:p-4 rounded-3xl bg-yellow-100/90 border-2 border-yellow-300 shadow-[0_4px_16px_rgba(234,179,8,0.12)] flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] sm:text-xs font-black text-yellow-950 uppercase tracking-wider flex items-center gap-1">
                    <span>⭐</span> Score
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-950 mt-0.5">
                    {dailySession.score}
                  </span>
                </div>

                <div className="p-3 sm:p-4 rounded-3xl bg-amber-50 border-2 border-amber-200 shadow-[0_4px_16px_rgba(245,158,11,0.08)] flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] sm:text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1">
                    <span>🎯</span> Mode
                  </span>
                  <span className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                    Daily ⚡
                  </span>
                </div>
              </div>

              {/* Opportunity Bar */}
              {currentRound && (
                <OpportunityBar
                  currentOpportunity={currentRound.currentOpportunity}
                  attemptCount={currentRound.attemptCount}
                  isResolved={isRoundResolved}
                  solvedAtAttempt={currentRound.solvedAtAttempt}
                  state={currentRound.state}
                />
              )}

              {/* Audio Wave Player */}
              {currentRound && (
                <AudioWavePlayer
                  key={`daily-audio-${currentRound.id}-${currentRound.currentOpportunity}`}
                  audioUrl={currentRound.audioUrl}
                  startMs={currentRound.startMs}
                  durationMs={isRoundResolved ? 5000 : currentRound.currentDurationMs}
                  autoPlay={autoPlayNext}
                />
              )}

              {/* Controls */}
              {currentRound && (
                <div>
                  {isRoundResolved ? (
                    <RoundResultBanner
                      state={currentRound.state as 'correct' | 'skipped' | 'exhausted'}
                      score={currentRound.score}
                      solvedAtAttempt={currentRound.solvedAtAttempt}
                      correctAnswer={currentRound.correctAnswer}
                      isLastRound={isLastRound}
                      onNext={handleNextRound}
                    />
                  ) : (
                    <AnswerSearchBox
                      sessionId={dailySession.id}
                      onSelectAnswer={(id) => handleSubmitGuess(id, false)}
                      onSkip={() => handleSubmitGuess(null, true)}
                      isSubmitting={isSubmitting}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ============================================================ */}
      {/* MODE 2: UNLIMITED PRACTICE                                   */}
      {/* ============================================================ */}
      {mode === 'unlimited' && (
        <div className="w-full space-y-5 z-10">
          {/* Practice setup if unstarted */}
          {!unlimitedSession ? (
            <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-[0_10px_35px_rgba(245,158,11,0.12)] space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-slate-900">Unlimited Practice</h2>
                <p className="text-xs sm:text-sm text-slate-600 font-bold">
                  Train your musical reflexes with endless audio clips
                </p>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-black text-amber-950 uppercase tracking-wider block">
                  Genre / Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all btn-tactile ${selectedCategory === cat
                          ? 'bg-amber-400 text-slate-950 border-2 border-amber-500 shadow-xs scale-105'
                          : 'bg-amber-50/70 text-amber-950 hover:bg-amber-100 border-2 border-amber-200'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tier Selection */}
              <div className="space-y-2">
                <label className="text-xs font-black text-amber-950 uppercase tracking-wider block">
                  Difficulty Tier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Easy', 'Medium', 'Hard'] as DifficultyTier[]).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setSelectedUnlimitedTier(tier)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all btn-tactile ${selectedUnlimitedTier === tier
                          ? 'bg-amber-400 text-slate-950 border-2 border-amber-500 shadow-xs scale-105'
                          : 'bg-amber-50/70 text-amber-950 hover:bg-amber-100 border-2 border-amber-200'
                        }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* Launch Practice */}
              <button
                onClick={handleStartUnlimited}
                disabled={unlimitedLoading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:opacity-95 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-400/30 border-2 border-amber-500/50 btn-tactile"
              >
                {unlimitedLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-slate-950" />
                    <span>Start Practice Round</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Active Unlimited Gameplay */
            <div className="w-full space-y-5">
              {/* Top Bar with Reset button */}
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-950 font-black">
                    Round {practiceStats.roundsPlayed + 1}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white text-amber-900 border-2 border-amber-200 font-black">
                    {unlimitedSession.difficultyTier} &bull; {selectedCategory}
                  </span>
                </div>
                <button
                  onClick={() => setUnlimitedSession(null)}
                  className="inline-flex items-center gap-1 text-xs font-black text-amber-950 px-3 py-1 rounded-xl border border-amber-300 bg-white hover:bg-amber-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>New Setup</span>
                </button>
              </div>

              {/* Practice Stats */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full">
                <div className="p-3 sm:p-4 rounded-3xl bg-amber-100/90 border-2 border-amber-300 shadow-xs flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] sm:text-xs font-black text-amber-950 uppercase tracking-wider">
                    🔥 Streak
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-950 mt-0.5">
                    {practiceStats.streak}
                  </span>
                </div>
                <div className="p-3 sm:p-4 rounded-3xl bg-yellow-100/90 border-2 border-yellow-300 shadow-xs flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] sm:text-xs font-black text-yellow-950 uppercase tracking-wider">
                    ⭐ Score
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-950 mt-0.5">
                    {practiceStats.totalScore}
                  </span>
                </div>
                <div className="p-3 sm:p-4 rounded-3xl bg-amber-50 border-2 border-amber-200 shadow-xs flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] sm:text-xs font-black text-amber-900 uppercase tracking-wider">
                    🎯 Accuracy
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                    {practiceStats.roundsPlayed > 0
                      ? Math.round((practiceStats.correctCount / practiceStats.roundsPlayed) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>

              {/* Opportunity Bar */}
              {currentRound && (
                <OpportunityBar
                  currentOpportunity={currentRound.currentOpportunity}
                  attemptCount={currentRound.attemptCount}
                  isResolved={isRoundResolved}
                  solvedAtAttempt={currentRound.solvedAtAttempt}
                  state={currentRound.state}
                />
              )}

              {/* Audio Wave Player */}
              {currentRound && (
                <AudioWavePlayer
                  key={`unlimited-audio-${currentRound.id}-${currentRound.currentOpportunity}`}
                  audioUrl={currentRound.audioUrl}
                  startMs={currentRound.startMs}
                  durationMs={isRoundResolved ? 5000 : currentRound.currentDurationMs}
                  autoPlay={autoPlayNext}
                />
              )}

              {/* Controls */}
              {currentRound && (
                <div>
                  {isRoundResolved ? (
                    <RoundResultBanner
                      state={currentRound.state as 'correct' | 'skipped' | 'exhausted'}
                      score={currentRound.score}
                      solvedAtAttempt={currentRound.solvedAtAttempt}
                      correctAnswer={currentRound.correctAnswer}
                      isLastRound={false}
                      onNext={handleNextRound}
                    />
                  ) : (
                    <AnswerSearchBox
                      sessionId={unlimitedSession.id}
                      onSelectAnswer={(id) => handleSubmitGuess(id, false)}
                      onSkip={() => handleSubmitGuess(null, true)}
                      isSubmitting={isSubmitting}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GuessTheBangerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        </div>
      }
    >
      <BangerGameContent />
    </Suspense>
  );
}
